
import { gameState } from "../gameState.js";
import { enemies } from "./enemies.js";
import { renderCombat } from "./combatUI.js";

export function startCombat(enemyId) {
    const enemy = enemies[enemyId];

    if (!enemy || gameState.inCombat) return;

    gameState.currentEnemy = {
        ...enemy
    };

    gameState.inCombat = true;

    renderCombat();
}
