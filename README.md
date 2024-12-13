# TradeWise

**Personalized Investment Portfolio Management Platform**

**TradeWise** is a personalized investment portfolio management platform built with **Python (Django)** and **JavaScript (React)**, offering real-time stock tracking, historical data visualization, news insights, and AI-powered financial consultation and trend forecasting through API integration, simplifying complex financial decisions for investors.

![](/static/main.png)
![](/static/quote.png)
[Click Here to Watch Video Demo](https://youtu.be/Gcb93llG8d0)


---
## Features

**TradeWise** is a comprehensive platform designed to help users manage their investments effectively with cutting-edge tools and insights. Explore the key features that make TradeWise your go-to investment management solution:

### Real-Time Stock Quotes
- Access instant stock prices from **Twelve Data API** to make informed decisions.
- Stay updated on market trends with real-time insights.

### Transaction Tracking and Cash Management
- Track your buying and selling transactions effortlessly.
- Manage your account balance and cash flow to stay on top of your finances.

### Historical Data Visualization
- Visualize stock trends with interactive charts, including:
  - **Candlestick**, **Heikin Ashi**, **Line**, and **Area** chart types.
- Simplify complex stock data into clear, actionable insights.

### Automated News Scraping
- Stay informed with the latest financial news and market updates.
- Powered by **NewsAPI**, get relevant information about companies and trends directly on the platform.

### Personalized Investment Consulting
- Consult our AI-powered chatbot for tailored investment advice.
- Get insights into your portfolio and strategies to enhance your market understanding.

### Deep Learning-Based Stock Predictions *(In Progress)*
- Predict future stock movements with advanced **LSTM models** (Long Short-Term Memory).
- Enhance your investment strategies with AI-driven forecasting tools.

---
## How to Run

### Installation and Environment Setup
1. **(Optional)** Install **Docker Desktop** on your system.
2. **Clone the repository:**
   ```bash
   git clone https://github.com/hiepnguyendudc2005/TradeWise.git
   cd TradeWise
    ```
3. **Configure environment variables:**
- Add the following variables to a .env file:
    - If using Docker Compose: place the .env file in the root directory.
    - Otherwise: place the .env file in the server folder.
    ```bash
    TWELVE_DATA_API_URL=https://api.twelvedata.com
    TWELVE_DATA_API_KEYS=key1,key2,key3

    FMP_API_URL=https://financialmodelingprep.com/api/v3/
    FMP_API_KEY=key1,key2,key3

    NEWS_API_URL=https://newsapi.org/v2/
    NEWS_API_KEY=key1,key2,key3

    LLAMA_API_URL=https://openrouter.ai/api/v1/
    LLAMA_API_KEY=key
    ```
- Obtain API keys from:
    - [Twelve Data API](https://twelvedata.com/)
    - [Financial Modeling Prep API](https://site.financialmodelingprep.com/)
    - [NewsAPI](https://newsapi.org/)
    - [OpenRouter API, Llama3](https://openrouter.ai/models/meta-llama/llama-3.1-8b-instruct:free/api)
- **Note**: Using multiple keys in the first three variables is required help avoid exceeding free usage limits.

### Running the Application
#### With Docker Compose
- **Start the application:**
    ```bash
    docker compose up
    ```
- **Rebuild and start with local changes:**
    - Modify docker-compose.yml as needed (e.g., uncomment context and comment out pre-built image lines).
    - Build and start:
        ```bash
        docker compose up --build
        ```
- **Stop the application:**
    - Press Ctrl + C to terminate, then run:
    ```bash
    docker compose down
    ```

#### Using Docker (Build Local Images and Containers)
1. **Build and run the server:**
    ```bash
    cd server
    docker build -t tradewise-server .
    docker run -p 8000:8000 --env-file .env --name test-server tradewise-server
    ```
2. **Build and run the client:**
    ```bash
    cd client
    docker build -t tradewise-client .
    docker run -p 80:80 -e SERVER_URL=http://host.docker.internal:8000/ --name test-client tradewise-client
    ```
The client will be available at http://localhost and the server API at http://localhost:8000.


### Development Mode (Without Docker)
1. **Set up a Python virtual environment:**
    ```bash
    python3 -m venv myenv
    source myenv/bin/activate  # On Linux/macOS
    myenv\Scripts\activate     # On Windows
    ```
2. **Install server dependencies:**
    ```bash
    cd server
    pip install -r requirements.txt
    python manage.py makemigrations
    python manage.py migrate
    ```
3. **Run the Django server:**
    ```bash
    python manage.py test
    python manage.py runserver
    ```
4. **Install client dependencies:**
    ```bash
    cd client
    npm install
    ```
5. **Start the React client:**
    ```bash
    npm run dev
    ```
The client will be available at http://localhost:5173 and the server API at http://localhost:8000.


---
## Technologies

**TradeWise** is built with a modern tech stack that ensures a responsive, scalable, and user-friendly experience. Here's an overview of the technologies powering the platform:

### Front-End
- **React.js**: Enables a dynamic and interactive user interface with seamless navigation.
- **ApexCharts**: Provides powerful and customizable data visualization for stock trends, including candlestick, Heikin Ashi, and area charts.
- **Bootstrap**: Ensures a responsive and mobile-friendly design for users across devices.

### Back-End
- **Django**: A robust and scalable web framework that handles business logic, user authentication, and database management.
- **MVC Model**: Facilitates API creation for communication between the client and server (Model - View - Controller)

### Database
- **SQLite**: A lightweight, embedded database for storing user data, transactions, and portfolio information.

### APIs
- **Twelve Data API**: Supplies real-time stock data and financial insights.
- **NewsAPI**: Automates the fetching of financial news and market trends.
- **Financial Modeling Prep API**: Provides company profiles and financial summaries.

### Artificial Intelligence
- **Llama3 API**: Powers the chatbot for personalized investment advice and user assistance.
- **LSTM Models** *(In Progress)*: Enhances stock prediction capabilities through machine learning.

### Deployment
- **Docker**: Containerization ensures consistency and easy deployment across environments.
- **Docker Compose**: Manages multi-container applications, combining the front-end and back-end seamlessly.

### Development Tools
- **Visual Studio Code**: For efficient development and debugging.
- **Postman**: Used to test and validate API integrations.

These technologies work together to deliver a high-performing, feature-rich platform tailored for modern investors.


---
## File Structures

```md
├── /client
│   ├── /public: Static assests like favicons
│   ├── /src: Source files for React application
│   │   ├── /components: Reusable UI components
│   │   │   ├── /Graphs: Components for rendering stock graphs for specific styles
│   │   │   │   ├── Area.jsx
│   │   │   │   ├── Candlestick.jsx
│   │   │   │   ├── HeinkinAshi.jsx
│   │   │   │   └── Line.jsx
│   │   │   ├── About.jsx: Component for Company profile
│   │   │   ├── AntiProtectedRoute.jsx: Component for routes inaccessible to authenticated users
│   │   │   ├── Chatbot.jsx: Chatbot interface
│   │   │   ├── Demo.jsx: Demo video interface
│   │   │   ├── Finance.jsx: Component for Company financial summary
│   │   │   ├── Navbar.jsx: Navigation bar
│   │   │   ├── NewsData.jsx: Component for feteched news articles
│   │   │   ├── ProtectedRoute.jsx: Component for routes accessible to authenticated users
│   │   │   └── StockGraph.jsx: Component to handle stock graph display
│   │   ├── /css: Stylesheets for components
│   │   │   ├── Chatbot.css
│   │   │   ├── main.css
│   │   │   ├── Navbar.css
│   │   │   ├── NewsData.css
│   │   │   └── Profile.css
│   │   ├── /pages: Pages corresponding to app routes
│   │   │   ├── AddCash.jsx
│   │   │   ├── Buy.jsx
│   │   │   ├── ChangePassword.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Index.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Quote.jsx
│   │   │   ├── Sell.jsx
│   │   │   └── Signup.jsx
│   │   ├── /services: API-related logic and service calls
│   │   │   ├── AuthAPI.jsx
│   │   │   ├── ChatbotAPI.jsx
│   │   │   ├── Profiles.jsx
│   │   │   ├── TransactionsAPI.jsx
│   │   │   └── UsersAPI.jsx
│   │   ├── /utilities: Helper functions for reusability across components
│   │   │   ├── APICall.jsx: Handles API calls and error handling
│   │   │   ├── CalculateClose.jsx: Calculates the closing price for stock data
│   │   │   ├── CalculateHeikinAshi.jsx: Implements the Heikin-Ashi algorithm for candlestick charts
│   │   │   ├── CalculateVolume.jsx: Processes and calculates stock trading volumes
│   │   │   ├── Formatter.jsx: Formats chart categories
│   │   │   └── NumberFormat.jsx: Provides number formatting utilities for UI consistency
│   │   ├── App.css: Body CSS styles
│   │   ├── App.jsx: Main application entry point
│   │   ├── index.css (default): Global CSS styles
│   │   └── main.jsx (default): App's root render logic
│   ├── .dockerignore: Lists files and folders to exclude from Docker builds
│   ├── .gitignore: Lists files and folders to exclude from version control
│   ├── Dockerfile: Instructions to containerize the client application
│   ├── eslint.config.js (default): Configuration for linting JavaScript/React code
│   ├── index.html: Entry point for the React app
│   ├── nginx.conf: Configuration file for serving the app using NGINX
│   ├── package-lock.json: Dependencies and scripts for the React application (details)
│   ├── package.json: Dependencies and scripts for the React application
│   └── vite.config.js: Configuration file for Vite build tool
├── /server
│   ├── /server: Django project directory
│   │   ├── __init__.py (default): Marks the folder as a Python package
│   │   ├── asgi.py (default): ASGI configuration for async support
│   │   ├── settings.py: Django settings, including installed apps and middleware
│   │   ├── urls.py: Main URL routing configuration
│   │   └── wsgi.py (default): WSGI configuration for production servers
│   ├── /tradewise: Django app directory
│   │   ├── __init__.py (default): Marks the folder as a Python package
│   │   ├── admin.py: Admin interface configurations
│   │   ├── apps.py (default): Configuration for the tradewise app
│   │   ├── helpers.py: Utility functions for the server
│   │   ├── models.py: Database models for the app (MODELS)
│   │   ├── prompt.py: Text Prompt to improve conversation with Chatbot
│   │   ├── signals.py: Signal handling (e.g., post-save actions for models) 
│   │   ├── templates.py: Template view for reusuable Json Response formats (VIEWS)
│   │   ├── tests.py: Unit tests for the server-side code
│   │   ├── urls.py: URL routing for the app
│   │   └── views.py: View functions handling HTTP requests (CONTROLLERS)
│   ├── .dockerignore: Exclude unnecessary files from Docker builds
│   ├── .gitignore: Exclude unnecessary files from version control
│   ├── Dockerfile: Instructions to containerize the server application
│   ├── manage.py: Command-line utility for managing the Django project
│   └── requirements.txt: Lists Python dependencies for the server
├── /static: Screenshots of the app and main feature
├── .gitignore: Global file exclusions for version control
├── docker-compose.yml: Defines multi-container setup for the client and server
└── README.md: Documentation for the project
```


---
## License
    Copyright [2024] [Hiep Nguyen]

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

---
## Contribution
Contributions are welcome! Please fork the repository and create a pull request with your changes.

---
## Contact
For any queries or suggestions, feel free to reach out via the project repository.
Let me know if you'd like further customization!