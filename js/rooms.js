
import { state, log } from './gameState.js';

export const rooms = {
  start: {
    name: 'INITIAL CHAMBER',
    region: 'THE ARRIVAL ZONE',

    map: [
      '###############',
      '#.............#',
      '#.............#',
      '#...#####.....#',
      '#...#...#.....#',
      '#...#...#.....#',
      '#...#...#.....#',
      '#.............#',
      '#.............#',
      '#.....D.......#'
    ],

    doors: [
      {
        x: 6,
        y: 9,
        target: 'training',
        spawn: { x: 7, y: 1 }
      }
    ],

    dummy: null
  },

  training: {
    name: 'TRAINING ROOM',
    region: 'THE ARRIVAL ZONE',

    map: [
      '###############',
      '#.............#',
      '#.............#',
      '#.............#',
      '#.............#',
      '#.............#',
      '#.............#',
      '#.............#',
      '#.............#',
      '###############'
    ],

    doors: [
      {
        x: 7,
        y: 1,
        target: 'start',
        spawn: { x: 6, y: 8 }
      }
    ],

    dummy: {
      x: 7,
      y: 4
    }
  }
};

window.SERVER_ROOMS = rooms;

export function currentRoom() {
  return rooms[state.roomId];
}

export function changeRoom(id, spawn) {
  if (!rooms[id]) return;

  state.roomId = id;
  state.room = rooms[id].name;
  state.region = rooms[id].region;

  state.player.x = spawn.x;
  state.player.y = spawn.y;

  log(`Entered ${state.room}.`);
}

export function checkDoor() {
  const door = currentRoom().doors.find(
    d =>
      d.x === state.player.x &&
      d.y === state.player.y
  );

  if (door) {
    changeRoom(door.target, door.spawn);
  }
}
