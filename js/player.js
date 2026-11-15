
import { state } from './gameState.js';

export function movePlayer(dx, dy) {
  if (state.inCombat || state.dialogue) return false;

  const room = window.SERVER_ROOMS[state.roomId];

  const nx = state.player.x + dx;
  const ny = state.player.y + dy;

  if (
    !room ||
    room.map[ny]?.[nx] === undefined ||
    room.map[ny][nx] === '#'
  ) {
    return false;
  }

  state.player.x = nx;
  state.player.y = ny;

  return true;
}

export function healPlayer(amount) {
  const before = state.player.hp;

  state.player.hp = Math.min(
    state.player.maxHp,
    before + amount
  );

  return state.player.hp - before;
}

export function damagePlayer(amount) {
  state.player.hp = Math.max(
    0,
    state.player.hp - Math.max(
      0,
      amount - state.player.defense
    )
  );

  return state.player.hp;
}
