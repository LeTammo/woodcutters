import React from 'react';

const GameControls = (
    { gameStarted, role, isReady, handleReady, hasOrdered, gameEnded, trees, order, setOrder, placeOrder, message }
) => {
    return (
        <div className="game-controls">
            {gameStarted && <p>Bäume im Wald: {trees}</p>}
            {!gameStarted ? (
                role === 'player' &&
                <button className={`btn ${isReady ? 'btn-secondary' : 'btn-success'} mt-3`} onClick={handleReady} disabled={isReady}>
                    {isReady ? 'Bereit' : 'Bereit'}
                </button>
            ) : !hasOrdered && !gameEnded && role === 'player' ? (
                <div className="input-group mb-3">
                    <label htmlFor="treeOrder" className="form-label d-none">Anzahl der Bäume:</label>
                    <input
                        id="treeOrder"
                        type="number"
                        min={0}
                        max={trees}
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                        onKeyUp={(e) => e.key === 'Enter' && placeOrder()}
                        className="form-control border-dark"
                        placeholder="Anzahl der Bäume"
                    />
                    <button className="btn btn-dark" onClick={placeOrder}>Bestellen</button>
                </div>
            ) : gameEnded ? (
                <p>Keine Bestellungen mehr möglich.</p>
            ) : (
                <p>Du hast {order} Bäume bestellt</p>
            )}
            {message && <p className="text-info mt-3">{message}</p>}
        </div>
    );
};

export default GameControls;