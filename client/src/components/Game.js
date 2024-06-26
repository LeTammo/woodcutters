import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import ShareRoom from './ShareRoom';
import PrepareGame from './PrepareGame';
import Sidebar from './Sidebar';
import Rules from './Rules';
import GameControls from './GameControls';
import RoundHistory from './RoundHistory';
import useGameSocket from "../hooks/useGameSocket";

function Game() {
    const { playerId } = useUser();
    const {
        roomExists,
        trees,
        order,
        message,
        connectedUsers,
        hasOrdered,
        orderStatus,
        roundHistory,
        gameEnded,
        isReady,
        gameStarted,
        role,
        placeOrder,
        setOrder,
        handleReady,
    } = useGameSocket();

    if (!roomExists) {
        return <Navigate to="/" />;
    }

    return (
        <div className="align-items-center g-lg-5 py-5">
            <div className="row p-4 p-md-5 border rounded-3 bg-body-tertiary bg-opacity-92">
                <div className="col-12 col-sm-6 col-md-8">
                    {!gameStarted ? (
                        <>
                            <ShareRoom />
                            <PrepareGame isReady={isReady} handleReady={handleReady} />
                            <Rules />
                        </>
                    ) : (
                        <>
                            <RoundHistory
                                roundHistory={roundHistory}
                                users={connectedUsers}
                                orderStatus={orderStatus}
                                gameRunning={gameStarted && !gameEnded}
                                gameEnded={gameEnded}
                                trees={trees}
                                order={order}
                                message={message}
                            />
                            <GameControls
                                gameStarted={gameStarted}
                                role={role}
                                isReady={isReady}
                                handleReady={handleReady}
                                hasOrdered={hasOrdered}
                                gameEnded={gameEnded}
                                trees={trees}
                                order={order}
                                setOrder={setOrder}
                                placeOrder={placeOrder}
                                message={message}
                            />
                        </>
                    )}
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                    <div className="mt-3">
                        <Sidebar users={connectedUsers} playerId={playerId} roundHistory={roundHistory} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Game;
