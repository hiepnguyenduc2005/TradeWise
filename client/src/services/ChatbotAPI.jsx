import { request } from '../utilities/APICall';

const chatbot = (messages, data) => {
    return request('POST', '/api/chatbot', { messages, data });
}

const getChatHistory = () => {
    return request('GET', '/api/chathistory');
}

const reset = () => {
    return request('POST', '/api/reset');
}

export default { chatbot, reset, getChatHistory };