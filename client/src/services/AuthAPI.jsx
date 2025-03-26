import { request } from '../utilities/APICall';

const authenticate = () => {
    return request('GET', '/api/session');
}

const loginUser = (username, password) => {
    return request('POST', '/api/login', { username, password });
}

const signupUser = (username, password, email, firstName, lastName, balance, isExpert) => {
    return request('POST', '/api/signup', { 
        'username': username, 
        'password': password, 
        'email': email, 
        'first_name': firstName, 
        'last_name': lastName, 
        'balance': balance,
        'is_expert': isExpert
    });
}

const logoutUser = () => { 
    return request('POST', '/api/logout');
}

const changePassword = (currentPassword, newPassword) => {
    return request('POST', '/api/changepw', { 'old_password': currentPassword, 'new_password': newPassword });
}

export default {
    authenticate,
    loginUser,
    signupUser,
    logoutUser,
    changePassword
}