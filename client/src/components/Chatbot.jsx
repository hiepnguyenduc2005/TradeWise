import React, { useState, useEffect, useRef } from 'react';
import '../css/Chatbot.css';
import ChatbotAPI from '../services/ChatbotAPI';

export default function Chatbot({ tempTransactions, cash }) {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const userData = { transactions: tempTransactions, cash };
    const messagesEndRef = useRef(null);

    const fetchInitialState = () => {
        ChatbotAPI.getChatHistory()
            .then(data => {
                setMessages(data.chat_history || []); 
            })
            .catch(() => {
                setMessages([
                    { role: 'assistant', content: 'Welcome to TradeWise! How can I assist you today?' }
                ]);
            });
    };

    useEffect(() => {
        fetchInitialState();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const sendMessage = () => {
        if (!message.trim() || isLoading) return;

        setIsLoading(true);
        const userMessage = [{ role: 'user', content: message }];

        setMessages(prev => [...prev, ...userMessage]);
        setMessage('');

        ChatbotAPI.chatbot(userMessage, userData)
            .then(data => {
                if (data.reply) {
                    setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
                }
            })
            .catch(() => {
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: 'Oops! Something went wrong. Please try again.' }
                ]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const resetChat = () => {
        const userConfirmed = window.confirm("Are you sure you want to reset the chatbot? This will erase the current conversation.");
    
        if (userConfirmed) {
            ChatbotAPI.reset()
                .then(() => {
                    fetchInitialState(); 
                })
                .catch(() => {
                    setMessages(prev => [
                        ...prev,
                        { role: 'assistant', content: 'Failed to reset chatbot. Please try again.' }
                    ]);
                });
        }
    };
    

    const formatData = (rawData) => {
        return rawData
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
          .replace(/\n/g, '<br />'); 
      };

    return (
        <div className="chatbot-container">
            <h2 className="chatbot-header">How can we help?</h2>
            <div className="chatbot-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`chatbot-message ${msg.role}`}>
                        <p
                            dangerouslySetInnerHTML={{
                            __html: formatData(msg.content),
                            }}
                        />
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="chatbot-send">
            <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Message TradeWise..."
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                className="chatbot-input"
            />
            <button onClick={sendMessage} disabled={isLoading} className="chatbot-button chatbot-sendbutton" type="submit">
                Send
            </button>
            </div>
            <button onClick={resetChat} className="chatbot-button" type="submit">
                Reset
            </button>
        </div>
    );
}
