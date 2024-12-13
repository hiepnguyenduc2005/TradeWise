class APIError extends Error {
    constructor(message, status = 500) {
      super(message);
      this.status = status;
    }
}
const headers = ({
    'Content-Type': 'application/json'
});

const request = async (method, url, body = null) => {
    const options = body ? { method, headers, body: JSON.stringify(body) } : { method, headers }
    let response;
    try {
        response = await fetch(url, options)
    }
    catch(e) {
        throw new APIError(`API cannot be reached, ${e.message}`)
    }
    const data = await response.json();
    if (data.error) {
        throw new APIError(data.error, data.status);
    }
    return data;
}

export {
    APIError,
    request
}