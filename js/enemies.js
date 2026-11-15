
export const enemies = {
  combatDummy: {
    id: 'combatDummy',
    name: 'COMBAT DUMMY',
    type: 'TRAINING ENTITY',

    maxHp: 40,
    hp: 40,

    attack: 3,
    defense: 0,

    actScore: 0,
    spareable: false,

    dialogue: [
      'The dummy stands completely still.',
      'A faint mechanical hum comes from inside it.',
      'It appears to be waiting for your next move.'
    ],

    patterns: ['basic']
  }
};

export function getEnemy(id) {
  return enemies[id] || null;
}
