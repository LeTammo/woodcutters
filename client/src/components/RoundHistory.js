import React from 'react';

function RoundHistory({ roundHistory, connectedUsers }) {
    const playerUsers = connectedUsers.filter(user => user.role === 'player');

    return (
        <div className="mt-4">
            <h2>Rundenhistorie:</h2>
            <table className="table">
                <thead>
                <tr>
                    <th>Runde</th>
                    {playerUsers.map((user, index) => (
                        <th key={index}>{user.username}</th>
                    ))}
                    <th>Summe bestellt</th>
                    <th>Summe gerodet</th>
                    <th>Übrige Bäume</th>
                    <th>Neue Bäume</th>
                    <th>Bäume im Wald</th>
                    <th>Reihenfolge</th>
                </tr>
                </thead>
                <tbody>
                {roundHistory.map((round, index) => (
                    <tr key={index}>
                        <td>{round.round}</td>
                        {playerUsers.map((user, userIndex) => {
                            const order = round.orders.find(o => o.username === user.username);
                            return (
                                <td key={userIndex}>
                                    {order ? `${order.ordered} (${order.received})` : '-'}
                                </td>
                            );
                        })}
                        <td>{round.totalOrdered}</td>
                        <td>{round.totalFelled}</td>
                        <td>{round.remainingTrees}</td>
                        <td>{round.newGrowth}</td>
                        <td>{round.remainingTrees + round.newGrowth}</td>
                        <td>{round.orderSequence.join(', ')}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default RoundHistory;