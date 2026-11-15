
export const state = {
  player: {
    name: "PLAYER",
    level: 1,
    hp: 30,
    maxHp: 30,
    attack: 5,
    defense: 0,
    x: 7,
    y: 7,
    weapon: "BASIC GLOVE"
  },

  region: "THE ARRIVAL ZONE",
  room: "INITIAL CHAMBER",
  roomId: "start",

  inCombat: false,
  enemy: null,
  battle: null,
  dialogue: null,

  inventory: [
    {
      id: "small_patch",
      name: "SMALL PATCH",
      type: "healing",
      heal: 10,
      count: 2
    }
  ],

  flags: {
    dummyDefeated: false
  },

  log: [
    "Connection established.",
    "Welcome to the Server."
  ]
};

export function log(message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 8);
}
