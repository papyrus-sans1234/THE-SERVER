
import { gameState } from "./gameState.js";

export function getPlayer() {
    return gameState.player;
}

export function damagePlayer(amount) {
    gameState.player.hp = Math.max(
        0,
        gameState.player.hp - amount
    );
}
