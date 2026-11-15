
import { state, log } from './gameState.js';

const SAVE_KEY = 'THE_SERVER_SAVE_001';

export function saveGame() {
  const saveData = {
    player: state.player,
    region: state.region,
    room: state.room,
    roomId: state.roomId,
    inventory: state.inventory,
    flags: state.flags
  };

  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(saveData)
    );

    log('Game saved successfully.');

    return true;
  } catch (error) {
    console.error('Save failed:', error);
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);

    if (!raw) return false;

    const data = JSON.parse(raw);

    if (
      !data.player ||
      !data.roomId ||
      !data.flags ||
      !data.inventory
    ) {
      return false;
    }

    Object.assign(state.player, data.player);

    state.region = data.region;
    state.room = data.room;
    state.roomId = data.roomId;

    state.inventory = data.inventory;
    state.flags = data.flags;

    log('Save data loaded.');

    return true;
  } catch (error) {
    console.error('Load failed:', error);
    return false;
  }
}

export function hasSave() {
  return localStorage.getItem(SAVE_KEY) !== null;
}
