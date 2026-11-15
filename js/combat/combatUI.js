
import { gameState } from "../gameState.js";

export function renderCombat() {
    document.getElementById("world")
        .classList.add("hidden");

    document.getElementById("combat-screen")
        .classList.remove("hidden");

    const player = gameState.player;
    const enemy = gameState.currentEnemy;

    document.getElementById("combat-info").innerHTML = `
        <h2>${enemy.name}</h2>
        <p>ENEMY HP: ${enemy.hp}/${enemy.maxHp}</p>
        <hr>
        <h3>${player.name}</h3>
        <p>PLAYER HP: ${player.hp}/${player.maxHp}</p>
    `;

    document.getElementById("combat-actions").innerHTML = `
        <button>ATTACK</button>
        <button>DEFEND</button>
        <button>ACT</button>
        <button>ITEM</button>
    `;
}
