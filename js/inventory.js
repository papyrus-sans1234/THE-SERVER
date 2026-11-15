
import { state, log } from './gameState.js';
import { healPlayer } from './player.js';

export function getInventory() {
  return state.inventory;
}

export function addItem(item) {
  const existing = state.inventory.find(
    entry => entry.id === item.id
  );

  if (existing) {
    existing.count += item.count || 1;
  } else {
    state.inventory.push({
      ...item,
      count: item.count || 1
    });
  }

  log(`Obtained ${item.name}.`);
}

export function useItem(index) {
  const item = state.inventory[index];

  if (!item || item.count <= 0) {
    return false;
  }

  if (item.type === 'healing') {
    if (state.player.hp >= state.player.maxHp) {
      log('HP is already full.');
      return false;
    }

    const healed = healPlayer(item.heal);

    item.count--;

    log(`${item.name}: recovered ${healed} HP.`);
  } else {
    return false;
  }

  if (item.count <= 0) {
    state.inventory.splice(index, 1);
  }

  return true;
}
