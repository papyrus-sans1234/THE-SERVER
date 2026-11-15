
import { state } from './gameState.js';
import { currentRoom } from './rooms.js';

export function renderWorld() {
  const room = currentRoom();
  const grid = document.getElementById('world-grid');

  grid.innerHTML = '';

  room.map.forEach((row, y) => {
    [...row].forEach((tile, x) => {
      const cell = document.createElement('div');
      cell.className = 'tile';

      if (tile === '#') {
        cell.classList.add('wall');
      }

      if (tile === 'D') {
        cell.classList.add('door');
        cell.innerHTML = '<span>⇧</span>';
      }

      if (
        room.dummy &&
        room.dummy.x === x &&
        room.dummy.y === y &&
        !state.flags.dummyDefeated
      ) {
        cell.classList.add('dummy');
        cell.innerHTML = '<span>◈</span>';
      }

      if (
        state.player.x === x &&
        state.player.y === y
      ) {
        cell.classList.add('player');
        cell.innerHTML = '<span>♥</span>';
      }

      grid.appendChild(cell);
    });
  });

  document.getElementById('region-name').textContent =
    state.region;

  document.getElementById('room-name').textContent =
    state.room;
}

export function updateHUD() {
  const p = state.player;
  const percentage = (p.hp / p.maxHp) * 100;

  document.getElementById('player-name').textContent =
    p.name;

  document.getElementById('player-level').textContent =
    String(p.level).padStart(2, '0');

  document.getElementById('sidebar-hp').textContent =
    `${p.hp} / ${p.maxHp}`;

  document.getElementById('player-hp-label').textContent =
    `${p.hp} / ${p.maxHp} HP`;

  document.getElementById('sidebar-hp-fill').style.width =
    `${percentage}%`;

  document.getElementById('player-hp-fill').style.width =
    `${percentage}%`;

  document.getElementById('weapon-name').textContent =
    p.weapon;

  document.getElementById('world-log').innerHTML =
    state.log.map(message => {
      const line = document.createElement('div');
      line.textContent = message;
      return line.outerHTML;
    }).join('');
}
