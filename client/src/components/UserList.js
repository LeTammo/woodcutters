import React from 'react';

function UserList({ users, orderStatus }) {
    return (
        <div>
            <h2>Spieler:</h2>
            <ul className="list-group">
                {users.map((user, index) => (
                    <li key={index} className="list-group-item">
                        {user.username} {orderStatus[user.username] ? '- Hat bestellt' : ''} ({user.role === 'player' ? 'Spieler' : 'Zuschauer'})
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserList;