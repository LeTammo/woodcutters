import React from "react";
import { useUser } from "../context/UserContext";

function RegisterUser() {
    const { setUsername } = useUser();

    const handleSetUsername = () => {
        const input = document.querySelector('input');
        const userName = input.value.trim();
        if (userName !== '') {
            setUsername(userName);
            localStorage.setItem('username', userName);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSetUsername();
        }
    };

    return (
        <div className="row align-items-center g-lg-5 py-5">
            <div className="mx-auto col-sm-12 col-md-10 col-lg-6">
                <div className="p-4 p-md-5 border rounded-3 bg-opacity-92">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control shadow-none"
                            placeholder="Wie möchtest du heißen?"
                            onKeyUp={handleKeyPress}
                        />
                        <button className="btn btn-success" onClick={handleSetUsername}>
                            Starten
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterUser;