import { request } from '../utilities/APICall';

const quote = async (symbol) => {
    return request('GET', `/api/quote?symbol=${symbol}`);
}

const profile = async (symbol, isPredict) => {
    return request('GET', `/api/profile?symbol=${symbol}&isPredict=${isPredict}`);
}

const graph = async (symbol, option, ipoDate) => {
    return request('GET', `/api/graph?symbol=${symbol}&option=${option}&ipoDate=${ipoDate}`);
}

const predict = async (symbol, predict_option, show_option) => {
    return request('POST', `/api/predict`, { symbol, predict_option, show_option });
}
    
export default {
    quote,
    profile,
    graph,
    predict
}