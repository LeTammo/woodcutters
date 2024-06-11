import React from 'react';

function RoundHistory({ roundHistory, connectedUsers }) {
    const playerUsers = connectedUsers.filter(user => user.role === 'player');

    return (
        <div className="mt-4">
            <h2>Rundenhistorie:</h2>
            {playerUsers.map((user, index) => (
                <div key={index} className="mb-2">{user.username}</div>
            ))}
            {roundHistory.map((round, roundIndex) => (
                <div key={roundIndex} className="mb-4">
                    <div className="fw-bold">Runde {round.round} beginnt</div>
                    <div className="fst-italic">Ausgewürfelte Reihenfolge:</div>
                    <div>{round.orderSequence.join(', ')}</div>
                    <div className="mt-2 fst-italic">Bestellungen:</div>
                    <div className="mb-2">
                        {round.orders.map((order, orderIndex) => (
                            <div key={orderIndex}>
                                <span className="text-primary-emphasis">{order.username}: {order.received}</span>
                                <span className="text-secondary">&nbsp;({order.ordered} bestellt)</span>
                            </div>
                        ))}
                    </div>
                    <div><span className="text-danger-emphasis">{round.totalFelled} Bäume</span> werden gerodet.</div>
                    <div>Es bleiben {round.remainingTrees} Bäume übrig und es wachsen {round.newGrowth} nach.</div>
                    <div>Der Wald hat nun <span className="text-success-emphasis">{round.remainingTrees + round.newGrowth} Bäume</span>.</div>
                </div>
            ))}
        </div>
    );
}

export default RoundHistory;