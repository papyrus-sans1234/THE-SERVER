
import { state, log } from './gameState.js';

import { getEnemy } from './enemies.js';

import {
  damagePlayer
} from './player.js';

import {
  getInventory,
  useItem
} from './inventory.js';

import {
  renderWorld,
  updateHUD
} from './world.js';

// ========================================
// COMBAT CONFIGURATION
// ========================================

const CONFIG = {
  timingSpeed: 0.85,
  perfectAccuracy: 7,
  dodgeDuration: 4500,
  dodgeSpeed: 230,
  fleeChance: 0.65
};

const canvas = document.getElementById('dodge-canvas');
const ctx = canvas.getContext('2d');

let timingFrame = null;
let dodgeFrame = null;
let timingPosition = 0;
let timingDirection = 1;
let dodgeLastTime = 0;

// ========================================
// COMBAT INITIALIZATION
// ========================================

export function startCombat(enemyId) {
  if (state.inCombat) return;

  const enemyData = getEnemy(enemyId);

  if (!enemyData) return;

  state.enemy = {
    ...enemyData,
    hp: enemyData.maxHp,
    actScore: 0
  };

  state.battle = {
    enemyId,
    turn: 1,
    phase: 'menu',
    menuIndex: 0,
    submenu: null,
    message: `${enemyData.name} appeared!`,
    bullets: [],
    heart: {
      x: canvas.width / 2,
      y: canvas.height - 45,
      size: 7
    },
    elapsed: 0,
    spawnTimer: 0,
    dodgeDamage: 0,
    dodgeInvulnerable: 0
  };

  state.inCombat = true;

  document.getElementById('world-view')
    .classList.add('hidden');

  document.getElementById('combat-view')
    .classList.remove('hidden');

  setMessage(`${enemyData.name} appeared!`);

  renderCombat();

  log(`Battle started: ${enemyData.name}.`);
  updateHUD();
}

// ========================================
// COMBAT UI
// ========================================

function setMessage(message) {
  state.battle.message = message;

  document.getElementById('battle-message')
    .textContent = message;
}

function renderCombat() {
  if (!state.inCombat || !state.battle) return;

  const enemy = state.enemy;
  const player = state.player;
  const battle = state.battle;

  document.getElementById('combat-turn')
    .textContent =
      `TURN ${String(battle.turn).padStart(2, '0')}`;

  document.getElementById('enemy-name')
    .textContent = enemy.name;

  document.getElementById('enemy-type')
    .textContent = enemy.type;

  document.getElementById('enemy-hp-label')
    .textContent = `${enemy.hp} / ${enemy.maxHp} HP`;

  document.getElementById('enemy-hp-fill')
    .style.width =
      `${Math.max(0, enemy.hp / enemy.maxHp * 100)}%`;

  document.getElementById('player-hp-label')
    .textContent =
      `${player.hp} / ${player.maxHp} HP`;

  document.getElementById('player-hp-fill')
    .style.width =
      `${Math.max(0, player.hp / player.maxHp * 100)}%`;

  document.getElementById('battle-message')
    .textContent = battle.message;

  updateHUD();

  renderBattleMenu();
}

function renderBattleMenu() {
  const menu = document.getElementById('battle-menu');
  const submenu = document.getElementById('battle-submenu');

  menu.innerHTML = '';
  submenu.innerHTML = '';

  const battle = state.battle;

  if (!battle) return;

  if (battle.phase === 'gameover') {
    createButton(menu, 'RETRY', 'RETRY');
    return;
  }

  if (battle.phase !== 'menu') return;

  if (battle.submenu === 'act') {
    [
      ['CHECK', 'CHECK'],
      ['TALK', 'TALK'],
      ['JOKE', 'JOKE'],
      ['BACK', 'BACK']
    ].forEach(([label, action], index) => {
      createButton(
        submenu,
        label,
        'ACT_OPTION',
        index
      );
    });

    return;
  }

  if (battle.submenu === 'item') {
    const items = getInventory();

    if (items.length === 0) {
      createButton(submenu, 'NO ITEMS', 'BACK');
    }

    items.forEach((item, index) => {
      createButton(
        submenu,
        `${item.name} x${item.count}`,
        'USE_ITEM',
        index
      );
    });

    createButton(submenu, 'BACK', 'BACK');
    return;
  }

  if (battle.submenu === 'mercy') {
    createButton(submenu, 'SPARE', 'SPARE');
    createButton(submenu, 'FLEE', 'FLEE');
    createButton(submenu, 'BACK', 'BACK');
    return;
  }

  [
    ['FIGHT', 'FIGHT'],
    ['ACT', 'ACT'],
    ['ITEM', 'ITEM'],
    ['MERCY', 'MERCY']
  ].forEach(([label, action], index) => {
    createButton(menu, label, action, index);
  });

  const buttons = menu.querySelectorAll('button');

  buttons.forEach((button, index) => {
    button.classList.toggle(
      'selected',
      index === battle.menuIndex
    );
  });
}

function createButton(container, label, action, index = 0) {
  const button = document.createElement('button');

  button.textContent = label;
  button.dataset.action = action;
  button.dataset.index = index;

  container.appendChild(button);
}

// ========================================
// MAIN COMBAT ACTIONS
// ========================================

export function handleCombatAction(action, index = 0) {
  if (!state.inCombat || !state.battle) return;

  const battle = state.battle;

  if (battle.phase === 'gameover') {
    if (action === 'RETRY') {
      state.player.hp = state.player.maxHp;

      const enemyId = battle.enemyId;

      stopAnimations();

      state.inCombat = false;
      state.battle = null;
      state.enemy = null;

      startCombat(enemyId);
    }

    return;
  }

  if (battle.phase !== 'menu') return;

  switch (action) {
    case 'FIGHT':
      beginFight();
      break;

    case 'ACT':
      battle.submenu = 'act';
      battle.menuIndex = 0;
      renderBattleMenu();
      break;

    case 'ITEM':
      battle.submenu = 'item';
      battle.menuIndex = 0;
      renderBattleMenu();
      break;

    case 'MERCY':
      battle.submenu = 'mercy';
      battle.menuIndex = 0;
      renderBattleMenu();
      break;

    case 'BACK':
      battle.submenu = null;
      battle.menuIndex = 0;
      renderBattleMenu();
      break;

    case 'ACT_OPTION':
      performAct(index);
      break;

    case 'USE_ITEM':
      performItem(index);
      break;

    case 'SPARE':
      spareEnemy();
      break;

    case 'FLEE':
      attemptFlee();
      break;
  }
}

// ========================================
// KEYBOARD CONTROLS
// ========================================

export function handleCombatKey(event) {
  if (!state.inCombat || !state.battle) return;

  const battle = state.battle;
  const key = event.key;

  if (battle.phase === 'dodge') {
    moveHeartWithKeyboard(key);
    return;
  }

  if (battle.phase === 'timing') {
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      resolveFight();
    }

    return;
  }

  if (battle.phase === 'gameover') {
    if (key === 'Enter') {
      handleCombatAction('RETRY');
    }

    return;
  }

  if (battle.phase !== 'menu') return;

  if (key === 'Escape') {
    if (battle.submenu) {
      battle.submenu = null;
      battle.menuIndex = 0;
      renderBattleMenu();
    }

    return;
  }

  const isMainMenu = !battle.submenu;

  const count = isMainMenu ? 4 :
    battle.submenu === 'act' ? 4 :
    battle.submenu === 'mercy' ? 3 :
    getInventory().length + 1;

  if (
    key === 'ArrowRight' ||
    key === 'ArrowDown' ||
    key.toLowerCase() === 's' ||
    key.toLowerCase() === 'd'
  ) {
    battle.menuIndex = (battle.menuIndex + 1) % count;
    renderBattleMenu();
    return;
  }

  if (
    key === 'ArrowLeft' ||
    key === 'ArrowUp' ||
    key.toLowerCase() === 'w' ||
    key.toLowerCase() === 'a'
  ) {
    battle.menuIndex =
      (battle.menuIndex - 1 + count) % count;

    renderBattleMenu();
    return;
  }

  if (key === 'Enter') {
    if (!battle.submenu) {
      const actions = [
        'FIGHT',
        'ACT',
        'ITEM',
        'MERCY'
      ];

      handleCombatAction(actions[battle.menuIndex]);
      return;
    }

    if (battle.submenu === 'act') {
      handleCombatAction('ACT_OPTION', battle.menuIndex);
      return;
    }

    if (battle.submenu === 'mercy') {
      const actions = ['SPARE', 'FLEE', 'BACK'];

      handleCombatAction(actions[battle.menuIndex]);
      return;
    }

    if (battle.submenu === 'item') {
      if (battle.menuIndex >= getInventory().length) {
        handleCombatAction('BACK');
      } else {
        handleCombatAction('USE_ITEM', battle.menuIndex);
      }
    }
  }
}

// ========================================
// FIGHT — TIMING SYSTEM
// ========================================

function beginFight() {
  const battle = state.battle;

  battle.phase = 'timing';
  battle.submenu = null;

  timingPosition = 0;
  timingDirection = 1;

  document.getElementById('attack-stage')
    .classList.remove('hidden');

  document.getElementById('dodge-stage')
    .classList.add('hidden');

  renderBattleMenu();

  setMessage('Time your strike! Press ENTER near the centre.');

  const marker = document.getElementById('timing-marker');

  let lastTime = 0;

  function animateTiming(time) {
    if (
      !state.inCombat ||
      state.battle.phase !== 'timing'
    ) {
      return;
    }

    if (!lastTime) lastTime = time;

    const delta = Math.min((time - lastTime) / 16.67, 3);
    lastTime = time;

    timingPosition +=
      timingDirection * CONFIG.timingSpeed * delta;

    if (timingPosition >= 100) {
      timingPosition = 100;
      timingDirection = -1;
    }

    if (timingPosition <= 0) {
      timingPosition = 0;
      timingDirection = 1;
    }

    marker.style.left = `${timingPosition}%`;

    timingFrame = requestAnimationFrame(animateTiming);
  }

  timingFrame = requestAnimationFrame(animateTiming);
}

function resolveFight() {
  if (state.battle.phase !== 'timing') return;

  cancelAnimationFrame(timingFrame);

  const distance = Math.abs(timingPosition - 50);

  const accuracy = Math.max(0, 1 - distance / 50);

  let multiplier;

  if (distance <= CONFIG.perfectAccuracy) {
    multiplier = 2;
    setMessage('PERFECT HIT!');
  } else if (distance <= 22) {
    multiplier = 1.4;
    setMessage('NICE HIT!');
  } else if (distance <= 40) {
    multiplier = 1;
    setMessage('HIT!');
  } else {
    multiplier = 0.5;
    setMessage('WEAK HIT!');
  }

  const damage = Math.max(
    1,
    Math.round(state.player.attack * multiplier)
  );

  state.enemy.hp = Math.max(
    0,
    state.enemy.hp - damage
  );

  setMessage(
    `${state.enemy.name} took ${damage} damage! ${Math.round(accuracy * 100)}% accuracy.`
  );

  log(`Dealt ${damage} damage.`);

  document.getElementById('attack-stage')
    .classList.add('hidden');

  renderCombat();

  if (checkEnemyDefeated()) return;

  enemyTurn();
}

// ========================================
// ACT SYSTEM
// ========================================

function performAct(index) {
  const enemy = state.enemy;

  const actions = ['CHECK', 'TALK', 'JOKE'];
  const action = actions[index];

  if (!action) return;

  if (action === 'CHECK') {
    setMessage(
      `${enemy.name}: HP ${enemy.hp}/${enemy.maxHp}. ATK ${enemy.attack}. DEF ${enemy.defense}.`
    );

    log(`Checked ${enemy.name}.`);

    enemyTurn();
    return;
  }

  if (action === 'TALK') {
    enemy.actScore += 1;

    setMessage(
      'You attempted to communicate with the enemy. It seems slightly more responsive.'
    );

    log('You talked to the enemy.');
  }

  if (action === 'JOKE') {
    enemy.actScore += 1;

    setMessage(
      'You told the enemy a joke. Its reaction is difficult to interpret.'
    );

    log('You told a joke.');
  }

  enemyTurn();
}

// ========================================
// ITEM SYSTEM
// ========================================

function performItem(index) {
  const item = getInventory()[index];

  if (!item) return;

  const success = useItem(index);

  if (!success) {
    setMessage('You could not use that item.');
    renderCombat();
    return;
  }

  setMessage(`${item.name} was used.`);

  enemyTurn();
}

// ========================================
// MERCY SYSTEM
// ========================================

function spareEnemy() {
  const enemy = state.enemy;

  if (
    !enemy.spareable &&
    enemy.actScore < 2
  ) {
    setMessage(
      `${enemy.name} isn't ready to be spared. Try ACT first.`
    );

    renderBattleMenu();
    return;
  }

  setMessage(`${enemy.name} was spared!`);

  log(`${enemy.name} was spared.`);

  finishCombat(false);
}

function attemptFlee() {
  const success = Math.random() < CONFIG.fleeChance;

  if (success) {
    setMessage('You successfully escaped.');

    log('Escaped from battle.');

    finishCombat(false);
  } else {
    setMessage("You couldn't escape!");

    enemyTurn();
  }
}

// ========================================
// ENEMY TURN
// ========================================

function enemyTurn() {
  if (!state.inCombat) return;

  if (checkPlayerDefeated()) return;

  const battle = state.battle;

  battle.phase = 'enemy';
  battle.submenu = null;

  renderBattleMenu();

  setMessage(`${state.enemy.name} is preparing an attack...`);

  document.getElementById('attack-stage')
    .classList.add('hidden');

  setTimeout(() => {
    if (!state.inCombat) return;

    if (state.player.hp <= 0) {
      showGameOver();
      return;
    }

    startDodgePhase();
  }, 600);
}

// ========================================
// DODGE ARENA
// ========================================

function startDodgePhase() {
  const battle = state.battle;

  battle.phase = 'dodge';
  battle.elapsed = 0;
  battle.spawnTimer = 0;
  battle.bullets = [];
  battle.dodgeDamage = 0;
  battle.dodgeInvulnerable = 0;

  battle.heart.x = canvas.width / 2;
  battle.heart.y = canvas.height - 35;

  document.getElementById('dodge-stage')
    .classList.remove('hidden');

  setMessage('DODGE THE PROJECTILES!');

  const pattern = state.enemy.patterns?.[0] || 'basic';

  let lastTime = 0;

  function animateDodge(time) {
    if (
      !state.inCombat ||
      battle.phase !== 'dodge'
    ) {
      return;
    }

    if (!lastTime) lastTime = time;

    const dt = Math.min((time - lastTime) / 1000, 0.04);
    lastTime = time;

    updateDodge(dt, pattern);
    drawDodge();

    if (battle.elapsed >= CONFIG.dodgeDuration) {
      endDodgePhase();
      return;
    }

    dodgeFrame = requestAnimationFrame(animateDodge);
  }

  dodgeFrame = requestAnimationFrame(animateDodge);
}

function updateDodge(dt, pattern) {
  const battle = state.battle;

  battle.elapsed += dt * 1000;
  battle.spawnTimer += dt;

  battle.dodgeInvulnerable = Math.max(
    0,
    battle.dodgeInvulnerable - dt
  );

  if (battle.spawnTimer >= 0.55) {
    battle.spawnTimer = 0;
    spawnProjectile(pattern);
  }

  for (const bullet of battle.bullets) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;

    const dx = bullet.x - battle.heart.x;
    const dy = bullet.y - battle.heart.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (
      distance < bullet.r + battle.heart.size &&
      !bullet.hit &&
      battle.dodgeInvulnerable <= 0
    ) {
      bullet.hit = true;

      const damage = state.enemy.attack;

      damagePlayer(damage);

      battle.dodgeDamage += damage;
      battle.dodgeInvulnerable = 0.55;

      setMessage(
        `You were hit! ${damage} HP lost.`
      );

      updateHUD();

      if (checkPlayerDefeated()) return;
    }
  }

  battle.bullets = battle.bullets.filter(
    bullet =>
      bullet.x > -30 &&
      bullet.x < canvas.width + 30 &&
      bullet.y > -30 &&
      bullet.y < canvas.height + 30
  );
}

function spawnProjectile(pattern) {
  const battle = state.battle;

  const heart = battle.heart;

  if (pattern === 'basic') {
    const startX = Math.random() * canvas.width;

    const dx = heart.x - startX;
    const dy = heart.y - 5;

    const length = Math.sqrt(dx * dx + dy * dy) || 1;

    const speed = 145;

    battle.bullets.push({
      x: startX,
      y: 5,
      vx: dx / length * speed,
      vy: dy / length * speed,
      r: 7,
      hit: false
    });

    return;
  }

  if (pattern === 'spread') {
    for (let i = 0; i < 5; i++) {
      battle.bullets.push({
        x: 40 + i * 110,
        y: 0,
        vx: 0,
        vy: 170,
        r: 6,
        hit: false
      });
    }

    return;
  }

  if (pattern === 'aimed') {
    const startX = Math.random() < 0.5 ? 0 : canvas.width;
    const startY = Math.random() * canvas.height / 2;

    const dx = heart.x - startX;
    const dy = heart.y - startY;

    const length = Math.sqrt(dx * dx + dy * dy) || 1;

    battle.bullets.push({
      x: startX,
      y: startY,
      vx: dx / length * 190,
      vy: dy / length * 190,
      r: 7,
      hit: false
    });
  }
}

function drawDodge() {
  const battle = state.battle;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Arena border
  ctx.strokeStyle = '#315c78';
  ctx.lineWidth = 2;

  ctx.strokeRect(
    1,
    1,
    canvas.width - 2,
    canvas.height - 2
  );

  // Grid
  ctx.strokeStyle = '#13263a';
  ctx.lineWidth = 1;

  for (let x = 40; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 40; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Projectiles
  for (const bullet of battle.bullets) {
    if (bullet.hit) continue;

    ctx.beginPath();

    ctx.arc(
      bullet.x,
      bullet.y,
      bullet.r,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = '#e8c477';
    ctx.shadowColor = '#e8c477';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Player SOUL
  const heart = battle.heart;

  ctx.save();

  ctx.translate(heart.x, heart.y);

  if (battle.dodgeInvulnerable > 0) {
    ctx.globalAlpha = 0.4;
  }

  ctx.fillStyle = '#ff536f';
  ctx.shadowColor = '#ff536f';
  ctx.shadowBlur = 16;

  ctx.beginPath();

  ctx.moveTo(0, 9);
  ctx.bezierCurveTo(-22, -3, -11, -17, 0, -7);
  ctx.bezierCurveTo(11, -17, 22, -3, 0, 9);

  ctx.fill();

  ctx.restore();
}

function moveHeartWithKeyboard(key) {
  const heart = state.battle.heart;

  const speed = CONFIG.dodgeSpeed * 0.045;

  if (
    key === 'ArrowUp' ||
    key.toLowerCase() === 'w'
  ) {
    heart.y -= speed;
  }

  if (
    key === 'ArrowDown' ||
    key.toLowerCase() === 's'
  ) {
    heart.y += speed;
  }

  if (
    key === 'ArrowLeft' ||
    key.toLowerCase() === 'a'
  ) {
    heart.x -= speed;
  }

  if (
    key === 'ArrowRight' ||
    key.toLowerCase() === 'd'
  ) {
    heart.x += speed;
  }

  heart.x = Math.max(
    12,
    Math.min(canvas.width - 12, heart.x)
  );

  heart.y = Math.max(
    12,
    Math.min(canvas.height - 12, heart.y)
  );
}

// Touch / pointer movement support
canvas.addEventListener('pointermove', event => {
  if (
    !state.inCombat ||
    state.battle.phase !== 'dodge'
  ) {
    return;
  }

  const rect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  state.battle.heart.x =
    (event.clientX - rect.left) * scaleX;

  state.battle.heart.y =
    (event.clientY - rect.top) * scaleY;

  state.battle.heart.x = Math.max(
    12,
    Math.min(canvas.width - 12, state.battle.heart.x)
  );

  state.battle.heart.y = Math.max(
    12,
    Math.min(canvas.height - 12, state.battle.heart.y)
  );
});

// ========================================
// END OF DODGE PHASE
// ========================================

function endDodgePhase() {
  cancelAnimationFrame(dodgeFrame);

  document.getElementById('dodge-stage')
    .classList.add('hidden');

  const damage = state.battle.dodgeDamage;

  if (damage === 0) {
    setMessage('You dodged every projectile!');
  } else {
    setMessage(
      `Dodge phase complete. Total damage received: ${damage}.`
    );
  }

  if (checkPlayerDefeated()) return;

  state.battle.phase = 'menu';
  state.battle.turn++;
  state.battle.submenu = null;
  state.battle.menuIndex = 0;

  renderCombat();
}

// ========================================
// VICTORY / DEFEAT
// ========================================

function checkEnemyDefeated() {
  if (state.enemy.hp > 0) return false;

  setMessage(`${state.enemy.name} was defeated!`);

  log(`${state.enemy.name} defeated.`);

  if (state.battle.enemyId === 'combatDummy') {
    state.flags.dummyDefeated = true;
  }

  finishCombat(true);

  return true;
}

function checkPlayerDefeated() {
  if (state.player.hp > 0) return false;

  showGameOver();

  return true;
}

function showGameOver() {
  stopAnimations();

  state.battle.phase = 'gameover';

  setMessage('YOU HAVE BEEN DEFEATED.');

  document.getElementById('attack-stage')
    .classList.add('hidden');

  document.getElementById('dodge-stage')
    .classList.add('hidden');

  renderCombat();
}

function finishCombat(victory) {
  stopAnimations();

  if (victory) {
    setMessage('VICTORY!');

    log('Combat completed.');
  }

  state.inCombat = false;
  state.enemy = null;
  state.battle = null;

  document.getElementById('combat-view')
    .classList.add('hidden');

  document.getElementById('world-view')
    .classList.remove('hidden');

  document.getElementById('attack-stage')
    .classList.add('hidden');

  document.getElementById('dodge-stage')
    .classList.add('hidden');

  renderWorld();
  updateHUD();
}

function stopAnimations() {
  if (timingFrame !== null) {
    cancelAnimationFrame(timingFrame);
    timingFrame = null;
  }

  if (dodgeFrame !== null) {
    cancelAnimationFrame(dodgeFrame);
    dodgeFrame = null;
  }
}
