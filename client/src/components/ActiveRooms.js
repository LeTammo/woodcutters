import React from "react";
import { useNavigate } from "react-router-dom";

function ActiveRooms({ rooms }) {
    const navigate = useNavigate();

    return (
        <div className="mt-5">
            <h5>Aktive Räume</h5>
            {rooms.map(room => (
                <div key={room.roomId} className="row p-2 px-0 mb-1 text-start bg-dark border rounded">
                    <div className="col-4 m-auto text-start">
                        {!room.gameStarted ? 'Warten in Lobby' : room.gameEnded ? 'Spiel beendet' : `Runde ${room.round + 1}`}
                    </div>
                    <div className="col-4 m-auto">
                        {room.users.map((user) => (
                            <span className={`px-1 ${!user.online && 'text-secondary'}`} key={user.playerId}>
                            {user.username}
                        </span>
                        ))}
                    </div>
                    <div className="col-4 text-end">
                        <button className="btn btn-sm btn-primary"
                                onClick={() => navigate(`/${room.roomId}`)}>
                            Beitreten
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ActiveRooms;