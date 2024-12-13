import { request } from '../utilities/APICall';

const buy = (symbol, shares) => {
    return request('POST', '/api/buy', { 'symbol': symbol, 'quantity': shares });
}

const sell = (symbol, shares) => {
    return request('POST', '/api/sell', { 'symbol': symbol, 'quantity': shares });
}

export default {
    buy,
    sell
}