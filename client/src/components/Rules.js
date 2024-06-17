import React from "react";

function Rules() {
    return (
        <div className="text-start">
            <h4>Spielregeln</h4>
            <ul className="list-unstyled">
                <li className="pb-2">Der Wald hat maximal 100 Bäume.</li>
                <li className="pb-2">Du bist Holzfäller und bestellst jede Runde eine Anzahl an
                    Bäumen. Deine
                    Mitspieler auch.
                </li>
                <li className="pb-2">Die Försterei lost die Reihenfolge der Bestellungen aus und
                    arbeitet sie ab.
                </li>
                <li className="pb-2">Sind nicht mehr genug Bäume für deine Bestellung übrig,
                    gehst du leer aus.
                </li>
                <li className="pb-2">Nach jeder Runde wachsen Bäume nach:</li>
                <ul className="pb-2">
                    <li>Bei 50 oder mehr Bäumen: Der Wald erholt sich komplett auf 100 Bäume.
                    </li>
                    <li>Bei weniger als 50 Bäumen: Es wächst für jeden Baum ein neuer nach
                        (Verdoppelung).
                    </li>
                </ul>
                <li>Das Spiel endet nach 5 Runden.</li>
            </ul>
        </div>
    )
}

export default Rules;