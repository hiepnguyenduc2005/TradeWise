const WebSocketURL = 'ws://localhost:8000/ws';


const socket = (section, mutateData) => {
    const ws = new WebSocket(`${WebSocketURL}${section}`);

    ws.onopen = () => console.log("WebSocket connected");
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        mutateData(data);
    };
    ws.onerror = (e) => console.error("WebSocket error:", e);
    ws.onclose = () => console.warn("WebSocket closed");

    return ws;
};

export default socket;