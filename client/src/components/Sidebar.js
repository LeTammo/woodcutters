import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';
import roundHistory from "./RoundHistory";

function Sidebar({ users, playerId, roundHistory }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        const handleReceiveMessage = ({ username, message, isSystem, color }) => {
            setMessages(prevMessages => [...prevMessages, { username, message, isSystem, color }]);
        };

        socket.on('receiveMessage', handleReceiveMessage);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
        };
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
    };

    const handleSendMessage = () => {
        if (message.trim() !== '') {
            socket.emit('sendMessage', { playerId, message });
            setMessage('');
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="shadow-lg rounded border border-1 border-dark d-flex flex-column text-start">
            {users
                .sort((a, b) => {
                    const aIsPlayer = a.role === 'player';
                    const bIsPlayer = b.role === 'player';

                    if (aIsPlayer && bIsPlayer) {
                        const aPoints = roundHistory[roundHistory.length - 1]?.points.find(p => p.playerId === a.playerId)?.points || 0;
                        const bPoints = roundHistory[roundHistory.length - 1]?.points.find(p => p.playerId === b.playerId)?.points || 0;
                        return bPoints - aPoints;
                    }

                    if (aIsPlayer && !bIsPlayer) return -1;
                    if (!aIsPlayer && bIsPlayer) return 1;

                    return 0;
                })
                .map((user, index) => (
                    <div key={index} className="shadow px-3 mt-2 rounded">
                        <div className="d-flex justify-content-between">
                            <div>
                                <span className={user.online ? 'text-success-emphasis' : 'text-danger-emphasis'}>⦿</span>
                                &nbsp;{user.username} {user.role === 'spectator' && '(👀)'}
                            </div>
                            <div>
                                {user.role === 'player' && roundHistory[roundHistory.length - 1] &&
                                    roundHistory[roundHistory.length - 1].points
                                        .find(p => p.playerId === user.playerId)?.points
                                    + " Punkte"
                                }
                            </div>
                        </div>
                    </div>
                ))}
            <div ref={chatContainerRef} className="flex-grow-1 overflow-auto p-3 pb-1 hide-scrollbar"
                 style={{height: '400px'}}>
                {messages.map((msg, index) => (
                    <div key={index}>
                        {msg.isSystem
                            ? <span className={`fst-italic text-${msg.color}`}>{msg.message}</span>
                            : <span><strong className="text-primary-emphasis">{msg.username}:</strong> {msg.message}</span>
                        }
                    </div>
                ))}
                <div />
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

export default Sidebar;