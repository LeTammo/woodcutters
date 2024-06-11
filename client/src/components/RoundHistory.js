import React from 'react';
import UserList from "./UserList";

function RoundHistory({ roundHistory, users, orderStatus, gameRunning }) {
    return (
        <div>
            {roundHistory.map((round, roundIndex) => (
                <div key={roundIndex} className="mb-4">
                    <h4 className="fw-bold">Runde {round.round}</h4>
                    <div className="mt-2 fst-italic">Bestellungen:</div>
                    <div className="mb-2">
                        {round.orderSequence.map((username, orderIndex) => {
                            const order = round.orders.find(o => o.username === username);
                            return (
                                <div key={orderIndex}>
                                    <span className="text-primary-emphasis">{order.username}: {order.received}</span>
                                    <span className="text-secondary">&nbsp;({order.ordered} bestellt)</span>
                                </div>
                            );
                        })}
                    </div>
                    <div><span className="text-danger-emphasis">{round.totalFelled} Bäume</span> werden gerodet.</div>
                    <div>Es bleiben {round.remainingTrees} Bäume übrig und es wachsen {round.newGrowth} nach.</div>
                    <div>Der Wald hat nun <span className="text-success-emphasis">{round.remainingTrees + round.newGrowth} Bäume</span>.</div>
                </div>
            ))}
            {gameRunning && (
                users.filter(user => user.role === 'player').map((user, index) => (
                    <div key={index} className="list-group-item">
                        {user.username} {
                        orderStatus[user.username]
                            ? <span>hat bestellt!</span>
                            : <span className="text-secondary">denkt nach...</span>
                    }
                    </div>
                ))
            )}
        </div>
    );
}

export default RoundHistory;