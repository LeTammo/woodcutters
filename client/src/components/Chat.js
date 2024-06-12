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
        <div className="bg-dark rounded d-flex flex-column" style={{height: '500px'}}>
            <div className="fw-bold p-2">Chat</div>
            <div className="d-flex flex-wrap p-2">
                {users.map((user, index) => (
                    <div key={index} className="border border-primary-subtle rounded m-1 px-1">
                        {user.username} {user.role !== 'player' && '(👀)'}
                    </div>
                ))}
            </div>
            <div className="flex-grow-1 overflow-auto p-2 hide-scrollbar d-flex flex-column justify-content-end" style={{minHeight: '0px'}}>
                {messages.map((msg, index) => (
                    <div className="text-start" key={index}>
                        <strong className="text-primary-emphasis">{msg.username}:</strong> {msg.message}
                    </div>
                ))}
                <div ref={messagesEndRef}/>
            </div>
            <div className="input-group p-2">
                <input
                    type="text"
                    value={message}
                    onChange={handleMessageChange}
                    onKeyUp={handleKeyPress}
                    placeholder="Type your message..."
                    className="form-control border-primary-subtle"
                />
                <button onClick={handleSendMessage} className="btn btn-dark border-primary-subtle">Send</button>
            </div>
        </div>
    );
}

export default Chat;
