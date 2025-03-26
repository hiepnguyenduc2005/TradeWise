import { request } from '../utilities/APICall';

const addCash = (amount) => {
    return request('POST', '/api/addcash', { amount });
}

const history = () => {
    return request('GET', '/api/history');
}

const profile = () => {
    return request('GET', '/api');
}

const temp = () => {
    return request('GET', '/api/temp');
}

const showCash = () => {
    return request('GET', '/api/showcash');
}

const upgradePremium = () => {
    return request('POST', '/api/upgrade');
}

export default {
    addCash,
    history,
    profile,
    temp,
    showCash,
    upgradePremium
}