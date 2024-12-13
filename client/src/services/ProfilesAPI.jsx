import { request } from '../utilities/APICall';

const quote = async (symbol) => {
    return request('GET', `/api/quote?symbol=${symbol}`);
}

const profile = async (symbol) => {
    return request('GET', `/api/profile?symbol=${symbol}`);
}

const graph = async (symbol, option, ipoDate) => {
    return request('GET', `/api/graph?symbol=${symbol}&option=${option}&ipoDate=${ipoDate}`);
}

export default {
    quote,
    profile,
    graph
}