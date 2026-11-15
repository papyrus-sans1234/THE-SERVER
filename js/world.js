
import { state } from './gameState.js';
import { currentRoom } from './rooms.js';

let renderedRoomId = null;

function getAvatar() {
    try {
        return {
            ...JSON.parse(
                localStorage.getItem('SERVER_AVATAR') || '{}'
            ),
            ...(state.avatar || {})
        };
    } catch {
        return state.avatar || {};
    }
}

// ==========================================
// DRAW PLAYER SPRITE
// ==========================================

function drawPlayerSprite(canvas) {
    const ctx = canvas.getContext('2d');

    const avatar = getAvatar();

    const skin = avatar.skin || '#c98d68';
    const hair = avatar.hair || '#29202b';
    const clothes = avatar.clothes || '#354f83';

    const gender = (avatar.gender || '').toLowerCase();
    const hairstyle = avatar.hairstyle || 'spiky';
    const outfit = avatar.outfit || 'jacket';

    canvas.width = 48;
    canvas.height = 64;

    ctx.clearRect(0, 0, 48, 64);

    function pixel(x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }

    // Height
    const scale =
        avatar.height === 'short' ? 0.85 :
        avatar.height === 'tall' ? 1 : 0.93;

    ctx.save();

    ctx.translate(0, (1 - scale) * 64);
    ctx.scale(1, scale);

    // Shoes
    pixel(13, 57, 9, 4, '#171b24');
    pixel(27, 57, 9, 4, '#171b24');

    // Legs
    pixel(15, 43, 7, 15, '#252c3b');
    pixel(27, 43, 7, 15, '#252c3b');

    // Body proportions
    let shoulderX = 11;
    let shoulderW = 26;
    let torsoX = 13;
    let torsoW = 22;

    if (gender === 'male') {
        shoulderX = 9;
        shoulderW = 30;
        torsoX = 12;
        torsoW = 24;
    }

    if (gender === 'female') {
        shoulderX = 12;
        shoulderW = 24;
        torsoX = 11;
        torsoW = 26;
    }

    // Arms
    pixel(shoulderX - 4, 32, 5, 16, skin);
    pixel(shoulderX + shoulderW - 1, 32, 5, 16, skin);

    // Shirt / torso
    pixel(shoulderX, 29, shoulderW, 12, clothes);
    pixel(torsoX, 41, torsoW, 8, clothes);

    // Outfit details
    if (outfit === 'jacket') {
        pixel(23, 30, 3, 19, '#172536');
        pixel(shoulderX, 30, 3, 17, '#172536');
    }

    if (outfit === 'hoodie') {
        pixel(16, 24, 16, 6, '#172536');
        pixel(19, 39, 10, 3, '#172536');
    }

    if (outfit === 'shirt') {
        pixel(23, 30, 3, 8, '#dce9f0');
    }

    // Neck
    pixel(20, 23, 9, 9, skin);

    // Face
    if (gender === 'male') {
        pixel(15, 8, 19, 17, skin);
        pixel(18, 24, 13, 3, skin);
    } else if (gender === 'female') {
        pixel(16, 8, 17, 16, skin);
        pixel(18, 23, 13, 3, skin);
    } else {
        pixel(15, 8, 19, 18, skin);
    }

    // Ears
    pixel(12, 15, 4, 6, skin);
    pixel(33, 15, 4, 6, skin);

    // Hair
    if (hairstyle === 'short') {
        pixel(14, 6, 21, 7, hair);
        pixel(14, 10, 3, 7, hair);
    }

    if (hairstyle === 'spiky') {
        pixel(14, 8, 21, 6, hair);
        pixel(15, 3, 5, 8, hair);
        pixel(22, 1, 6, 11, hair);
        pixel(29, 4, 5, 8, hair);
    }

    if (hairstyle === 'long') {
        pixel(13, 6, 23, 8, hair);
        pixel(13, 12, 4, 25, hair);
        pixel(32, 12, 4, 25, hair);
    }

    if (hairstyle === 'curly') {
        pixel(14, 7, 21, 7, hair);
        pixel(12, 5, 7, 8, hair);
        pixel(20, 2, 8, 9, hair);
        pixel(28, 5, 7, 8, hair);
    }

    if (hairstyle === 'ponytail') {
        pixel(14, 7, 21, 7, hair);
        pixel(13, 12, 4, 8, hair);
        pixel(32, 12, 5, 22, hair);
        pixel(34, 30, 4, 8, hair);
    }

    // Eyes
    pixel(19, 16, 3, 3, '#171717');
    pixel(28, 16, 3, 3, '#171717');

    // Eyebrows
    if (gender === 'male') {
        pixel(18, 13, 5, 1, hair);
        pixel(27, 13, 5, 1, hair);
    } else {
        pixel(19, 13, 3, 1, hair);
        pixel(28, 13, 3, 1, hair);
    }

    // Mouth
    pixel(22, 22, 5, 1, '#663b36');

    ctx.restore();
}

// ==========================================
// RENDER WORLD
// ==========================================

export function renderWorld() {
    const room = currentRoom();

    const grid = document.getElementById('world-grid');

    if (!room || !grid) return;

    const roomChanged = renderedRoomId !== state.roomId;

    if (roomChanged) {
        grid.innerHTML = '';

        renderedRoomId = state.roomId;

        grid.style.position = 'relative';

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

                grid.appendChild(cell);
            });
        });

        // Create a separate player overlay.
        const player = document.createElement('div');

        player.id = 'world-player';

        player.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            z-index: 20;
            width: calc(100% / ${room.map[0].length});
            height: calc(100% / ${room.map.length});
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            transition: transform 110ms linear;
        `;

        const canvas = document.createElement('canvas');

        canvas.style.cssText = `
            width: 100%;
            height: 100%;
            image-rendering: pixelated;
        `;

        player.appendChild(canvas);

        grid.appendChild(player);

        drawPlayerSprite(canvas);
    }

    // Move the existing sprite without rebuilding the room.
    const player = document.getElementById('world-player');

    if (player) {
        player.style.transform =
            `translate(${state.player.x * 100}%, ${state.player.y * 100}%)`;
    }

    document.getElementById('region-name').textContent =
        state.region;

    document.getElementById('room-name').textContent =
        state.room;
}

// ==========================================
// HUD
// ==========================================

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
