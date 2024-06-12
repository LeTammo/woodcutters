import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

function Chat({ username }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const handleReceiveMessage = ({ username, message }) => {
            setMessages([...messages, { username, message }]);
        };

        socket.on('receiveMessage', handleReceiveMessage);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
        };
    }, [messages]);

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
    };

    const handleSendMessage = () => {
        if (message.trim() !== '') {
            socket.emit('sendMessage', { username, message });
            setMessage('');
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div>
            <div className="input-group mb-3">
                <input
                    type="text"
                    value={message}
                    onChange={handleMessageChange}
                    onKeyUp={handleKeyPress}
                    placeholder="Type your message..."
                    className="form-control border-dark"
                />
                <button onClick={handleSendMessage} className="btn btn-dark">Send</button>
            </div>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.username}:</strong> {msg.message}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Chat;
