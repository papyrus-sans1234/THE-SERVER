
import { state, log } from './gameState.js';

import { movePlayer } from './player.js';

import {
  rooms,
  currentRoom,
  checkDoor
} from './rooms.js';

import {
  renderWorld,
  updateHUD
} from './world.js';

import {
  startCombat,
  handleCombatKey,
  handleCombatAction
} from './combat.js';

import {
  advanceDialogue,
  showDialogue
} from './dialogue.js';

import {
  saveGame,
  loadGame
} from './saveSystem.js';

import { showStartScreen } from './startScreen.js';

// MOVEMENT SETTINGS

let heldDirection = null;
let heldKey = null;
let movementFrame = null;
let lastMoveTime = 0;

const MOVE_INTERVAL = 135;

// RENDERING

function renderGame() {
  if (!state.inCombat) {
    renderWorld();
  }

  updateHUD();
}

// STOP MOVEMENT

function stopAllMovement() {
  heldDirection = null;
  heldKey = null;

  if (movementFrame !== null) {
    cancelAnimationFrame(movementFrame);
    movementFrame = null;
  }
}

// NEW GAME

function startNewGame(createdAvatar) {
  stopAllMovement();

  // Apply the created character.
  state.player.name = createdAvatar.name;
  state.avatar = createdAvatar;

  // Reset starting position and stats.
  state.player.hp = 30;
  state.player.x = 7;
  state.player.y = 7;

  state.region = 'THE ARRIVAL ZONE';
  state.room = 'INITIAL CHAMBER';
  state.roomId = 'start';

  state.inCombat = false;
  state.dialogue = null;

  state.flags.dummyDefeated = false;

  log('New connection detected.');
  log('Entering THE SERVER...');

  renderGame();

  showDialogue(
    'SYSTEM',
    [
      'Connection established.',
      `Welcome, ${createdAvatar.name}.`,
      'Your journey begins here.'
    ]
  );

  console.log('New game started.');
}

// CONTINUE

function continueGame() {
  stopAllMovement();

  const loaded = loadGame();

  if (!loaded) {
    alert('No saved game could be loaded.');
    showStartScreen();
    return;
  }

  renderGame();

  console.log('Saved game loaded.');
}

// START SCREEN EVENTS

window.addEventListener('server:new-game', event => {
  startNewGame(event.detail);
});

window.addEventListener('server:continue-game', () => {
  continueGame();
});

// MOVEMENT DIRECTIONS

const directions = {
  w: [0, -1],
  ArrowUp: [0, -1],

  s: [0, 1],
  ArrowDown: [0, 1],

  a: [-1, 0],
  ArrowLeft: [-1, 0],

  d: [1, 0],
  ArrowRight: [1, 0]
};

// MOVEMENT LOOP

function movementLoop(timestamp) {
  if (!heldDirection) {
    movementFrame = null;
    return;
  }

  // Prevent movement during menus, dialogue or combat.
  if (
    state.inCombat ||
    state.dialogue ||
    document.getElementById('server-start') ||
    document.getElementById('avatar-creator')
  ) {
    stopAllMovement();
    return;
  }

  if (timestamp - lastMoveTime >= MOVE_INTERVAL) {
    lastMoveTime = timestamp;

    const moved = movePlayer(
      heldDirection[0],
      heldDirection[1]
    );

    if (moved) {
      checkDoor();
      renderGame();
    }
  }

  movementFrame = requestAnimationFrame(movementLoop);
}

// START HOLDING A MOVEMENT KEY

function startMovement(key) {
  const direction = directions[key];

  if (!direction) return;

  // Ignore repeated keydown events for the same held key.
  if (heldKey === key) return;

  heldKey = key;
  heldDirection = direction;

  if (movementFrame === null) {
    lastMoveTime = 0;
    movementFrame = requestAnimationFrame(movementLoop);
  }
}

// STOP HOLDING A MOVEMENT KEY

function stopMovement(key) {
  if (heldKey !== key) return;

  stopAllMovement();
}

// INTERACTION

function interact() {
  const room = currentRoom();
  const dummy = room.dummy;

  if (
    dummy &&
    !state.flags.dummyDefeated
  ) {
    const distance =
      Math.abs(state.player.x - dummy.x) +
      Math.abs(state.player.y - dummy.y);

    if (distance <= 1) {
      stopAllMovement();
      startCombat('combatDummy');
      return;
    }
  }

  const door = room.doors.find(d => {
    const distance =
      Math.abs(state.player.x - d.x) +
      Math.abs(state.player.y - d.y);

    return distance <= 1;
  });

  if (door) {
    log('Door detected.');
    renderGame();
    return;
  }

  log('Nothing to interact with.');
  renderGame();
}

// KEYBOARD INPUT

document.addEventListener('keydown', event => {
  const key = event.key;

  if (
    [
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      ' '
    ].includes(key)
  ) {
    event.preventDefault();
  }

  // Don't control the game behind the start screen.
  if (document.getElementById('server-start')) {
    return;
  }

  // Don't control the game behind the avatar creator.
  if (document.getElementById('avatar-creator')) {
    return;
  }

  // Dialogue controls.
  if (state.dialogue) {
    stopAllMovement();

    if (
      key === 'Enter' ||
      key.toLowerCase() === 'e'
    ) {
      advanceDialogue();
    }

    return;
  }

  // Combat controls.
  if (state.inCombat) {
    stopAllMovement();
    handleCombatKey(event);
    return;
  }

  // Interaction.
  if (key.toLowerCase() === 'e') {
    stopAllMovement();
    interact();
    return;
  }

  // Continuous movement.
  startMovement(key);
});

// KEY RELEASE

document.addEventListener('keyup', event => {
  stopMovement(event.key);
});

// STOP MOVEMENT WHEN WINDOW LOSES FOCUS

window.addEventListener('blur', () => {
  stopAllMovement();
});

// COMBAT MENU BUTTONS

document.getElementById('battle-menu')
  .addEventListener('click', event => {
    const button = event.target.closest('[data-action]');

    if (!button) return;

    handleCombatAction(
      button.dataset.action,
      Number(button.dataset.index || 0)
    );
  });

// COMBAT SUBMENU BUTTONS

document.getElementById('battle-submenu')
  .addEventListener('click', event => {
    const button = event.target.closest('[data-action]');

    if (!button) return;

    handleCombatAction(
      button.dataset.action,
      Number(button.dataset.index || 0)
    );
  });

// DIALOGUE BUTTON

document.getElementById('dialogue-next')
  .addEventListener('click', () => {
    stopAllMovement();
    advanceDialogue();
  });

// SAVE BUTTON

document.getElementById('save-button')
  .addEventListener('click', () => {
    if (state.inCombat) {
      log('Cannot save during combat.');
      updateHUD();
      return;
    }

    const success = saveGame();

    if (success) {
      alert('GAME SAVED.');
    } else {
      alert('SAVE FAILED.');
    }

    updateHUD();
  });

// INITIAL STARTUP

showStartScreen();

console.log('THE SERVER title screen loaded.');
