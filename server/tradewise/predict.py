import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import torch
import torch.nn as nn
import datetime
from dateutil.relativedelta import relativedelta

def set_seed(seed=42):
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

set_seed(42)

def create_df(data):
    df = pd.DataFrame(data)
    df = df.astype({'close': 'float'})
    df.sort_values(by='datetime', inplace=True)
    df.set_index('datetime', inplace=True)
    df.index = pd.to_datetime(df.index)
    df.drop(['open', 'high', 'low', 'volume'], axis=1, inplace=True)
    return df

def prepare_data(df, look_back=100, future_days=1):
    data = df['close'].values
    price_diffs = np.diff(data)
    price_diffs = np.concatenate([np.array([0]), price_diffs])
    price_diffs = price_diffs.reshape(-1, 1)

    scaler = MinMaxScaler(feature_range=(-1, 1))
    scaled_diffs = scaler.fit_transform(price_diffs)

    X, y = [], []
    for i in range(look_back, len(scaled_diffs) - future_days):
        X.append(scaled_diffs[i-look_back:i, 0])
        y.append(scaled_diffs[i+future_days-1, 0])

    X = np.array(X)
    y = np.array(y)

    X = torch.FloatTensor(X).reshape(X.shape[0], X.shape[1], 1)
    y = torch.FloatTensor(y)

    train_size = int(len(X) * 0.8)
    X_train, X_test = X[0:train_size], X[train_size:]
    y_train, y_test = y[0:train_size], y[train_size:]
    return X_train, y_train, X_test, y_test, scaler, data

class LSTMModel(nn.Module):
    def __init__(self, input_size=1, hidden_size=100, num_layers=2):
        super(LSTMModel, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers

        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.dropout = nn.Dropout(0.1)
        self.fc1 = nn.Linear(hidden_size, 50)
        self.fc2 = nn.Linear(50, 1)

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)

        out, _ = self.lstm(x, (h0, c0))
        out = self.dropout(out[:, -1, :])
        out = torch.relu(self.fc1(out))
        out = self.fc2(out)
        return out

def train_model(model, X_train, y_train, X_test, y_test, epochs=100, batch_size=32):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)

    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

    train_dataset = torch.utils.data.TensorDataset(X_train, y_train)
    train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=batch_size, shuffle=False)

    for epoch in range(epochs):
        model.train()
        total_loss = 0
        for batch_X, batch_y in train_loader:
            batch_X, batch_y = batch_X.to(device), batch_y.to(device)

            optimizer.zero_grad()
            outputs = model(batch_X)
            loss = criterion(outputs.squeeze(), batch_y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        model.eval()
        with torch.no_grad():
            X_test = X_test.to(device)
            y_test = y_test.to(device)
            val_outputs = model(X_test)
            val_loss = criterion(val_outputs.squeeze(), y_test)

        if (epoch + 1) % 10 == 0:
            print(f'Epoch [{epoch+1}/{epochs}], Train Loss: {total_loss/len(train_loader):.4f}, Val Loss: {val_loss.item():.4f}')

    return model

def predict_future_price(df, days_to_predict, look_back=100):
    X_train, y_train, X_test, y_test, scaler, original_data = prepare_data(df, look_back)

    price_diffs = np.diff(original_data)
    volatility = np.std(price_diffs[-look_back:])
    max_daily_change = np.max(np.abs(price_diffs[-look_back:]))

    model = LSTMModel()
    model = train_model(model, X_train, y_train, X_test, y_test)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    last_diffs = np.diff(original_data[-look_back:])
    last_diffs = np.concatenate([np.array([0]), last_diffs])
    last_diffs_scaled = scaler.transform(last_diffs.reshape(-1, 1))
    current_sequence = torch.FloatTensor(last_diffs_scaled).reshape(1, look_back, 1).to(device)

    np.random.seed(42)  
    noise_sequence = np.random.normal(0, volatility * 0.05, size=days_to_predict)

    model.eval()
    future_diffs = []
    with torch.no_grad():
        current_input = current_sequence.clone()
        for i in range(days_to_predict):
            pred = model(current_input)
            noisy_pred = pred.item() + noise_sequence[i]  
            noisy_pred = np.clip(noisy_pred, -max_daily_change, max_daily_change)
            future_diffs.append(noisy_pred)
            current_input = torch.cat((current_input[:, 1:, :], torch.FloatTensor([[noisy_pred]]).reshape(1, 1, 1).to(device)), dim=1)

    future_diffs = np.array(future_diffs).reshape(-1, 1)
    future_diffs = scaler.inverse_transform(future_diffs)

    last_price = original_data[-1]
    future_prices = [last_price]
    price_bounds_factor = 1.2
    for i, diff in enumerate(future_diffs.flatten()):
        next_price = future_prices[-1] + diff
        max_price = last_price * (1 + price_bounds_factor * (i + 1) / days_to_predict)
        min_price = last_price * (1 - price_bounds_factor * (i + 1) / days_to_predict)
        next_price = np.clip(next_price, min_price, max_price)
        future_prices.append(next_price)

    future_prices = future_prices[1:]
    return future_prices

def predict_stock(data, option):
    options = {
        '5d': {'days': 7},
        '1m': {'months': 1},
        '6m': {'months': 6},
        '1y': {'months': 12},
    }

    start_date = datetime.date.today()
    user_option = options.get(option)
    months = user_option.get('months', 0)
    days = user_option.get('days', 0)
    end_data = start_date + relativedelta(months=months) + datetime.timedelta(days=days)
    num_days = (end_data - start_date).days
    num_weekdays = np.busday_count(start_date, end_data)
    days_to_predict = num_weekdays + 1
    
    df = create_df(data)
    predictions = predict_future_price(df, days_to_predict)
    future_dates = pd.date_range(start=start_date, periods= num_days + 1, freq='1D')
    future_weekdays = future_dates[future_dates.weekday < 5]

    future_weekdays = future_weekdays.strftime('%Y-%m-%d').tolist()
    predictions = [float(round(price, 5)) for price in predictions]

    return [{"datetime": date, "close": price} for date, price in zip(future_weekdays, predictions)]

# import json
# with open(f"./tmp/tmp.txt", 'r') as file:
#     data = json.load(file)
# result_df = predict_stock(data, '1y')
# print(result_df)