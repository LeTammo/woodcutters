import React from 'react';

function RoundHistory({ roundHistory, users, orderStatus, gameRunning, gameEnded, trees, order, message }) {
    return (
        <div className="row justify-content-center">
            {roundHistory.map((round, roundIndex) => (
                <div key={roundIndex} className="col-6 mb-4">
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
                    <div>Der Wald hat nun <span
                        className="text-success-emphasis">{round.remainingTrees + round.newGrowth} Bäume</span>.
                    </div>
                </div>
            ))}
            {gameRunning && (
                users.filter(user => user.role === 'player').map((user, index) => (
                    <div key={index} className="list-group-item">
                        {user.username} {
                        orderStatus[user.playerId]
                            ? <span>hat bestellt!</span>
                            : <span className="text-secondary">denkt nach...</span>
                    }
                    </div>
                ))
            )}
            {gameEnded && (
                <div className="col-6 my-auto">
                    <p className="mb-1 text-primary-emphasis">Keine Bestellungen mehr möglich.</p>
                    <p className="mb-1 text-success-emphasis">Bäume im Wald: {trees}</p>
                    {message && <p className="text-info-emphasis mt-3">{message}</p>}
                </div>
            )}
        </div>
    );
}

export default RoundHistory;