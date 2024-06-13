import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';

function Chat({ username, users }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const handleReceiveMessage = ({ username, message }) => {
            setMessages([...messages, { username, message }]);
        };

        socket.on('receiveMessage', handleReceiveMessage);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
        };
    }, [messages]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
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
        <div className="shadow-lg rounded border border-1 border-dark d-flex flex-column" style={{height: '500px'}}>
            <div className="fw-bold p-3 border-bottom border-1 shadow border-dark">Chat</div>
            <div className="d-flex flex-wrap p-2">
                {users.map((user, index) => (
                    <div key={index} className="shadow px-2 py-1 m-2 border border-dark border-2 rounded">
                        {user.username} {user.role !== 'player' && '(👀)'}
                    </div>
                ))}
            </div>
            <div className="flex-grow-1 overflow-auto p-3 pb-1 hide-scrollbar" style={{ minHeight: '0px' }}>
                {messages.map((msg, index) => (
                    <div className="text-start" key={index}>
                        <strong className="text-primary-emphasis">{msg.username}:</strong> {msg.message}
                    </div>
                ))}
                <div ref={messagesEndRef}/>
            </div>
            <div className="input-group p-3 pt-1">
                <input
                    type="text"
                    value={message}
                    onChange={handleMessageChange}
                    onKeyUp={handleKeyPress}
                    placeholder="Type your message..."
                    className="form-control bg-dark border-dark shadow-none"
                />
                <button onClick={handleSendMessage} className="btn btn-dark border-dark">Send</button>
            </div>
        </div>
    );
}

export default Chat;
