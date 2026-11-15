
/* ==========================================
   THE SERVER — START SCREEN
========================================== */

import { showAvatarCreator } from "./avatarCreator.js";

let screen;

function addStyles() {
    if (document.getElementById("server-start-styles")) return;

    const style = document.createElement("style");
    style.id = "server-start-styles";

    style.textContent = `
        #server-start {
            position: fixed;
            inset: 0;
            z-index: 99990;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: auto;
            padding: 20px;
            background:
                radial-gradient(ellipse at center, #102d43 0%, #07101d 55%, #02050b 100%);
            color: #d9f5ff;
            font-family: Arial, sans-serif;
        }

        .start-panel {
            width: min(650px, 100%);
            text-align: center;
            padding: 40px 25px;
            border: 1px solid #26799b;
            background: #071321dd;
            box-shadow: 0 0 45px #087ca533;
        }

        .start-title {
            font-size: clamp(35px, 8vw, 65px);
            letter-spacing: 9px;
            color: #7ee4ff;
            text-shadow: 0 0 20px #168cbd;
            margin: 0;
        }

        .start-subtitle {
            color: #7899b1;
            letter-spacing: 4px;
            font-size: 11px;
            margin: 15px 0 35px;
        }

        .start-menu {
            display: flex;
            flex-direction: column;
            gap: 13px;
            max-width: 340px;
            margin: auto;
        }

        .start-button {
            padding: 16px;
            border: 1px solid #327da0;
            background: #10263a;
            color: #a7eaff;
            font-size: 14px;
            font-weight: bold;
            letter-spacing: 3px;
            cursor: pointer;
            transition: .15s;
        }

        .start-button:hover:not(:disabled) {
            background: #1c506c;
            border-color: #8ceaff;
            box-shadow: 0 0 15px #35bce855;
        }

        .start-button:disabled {
            opacity: .35;
            cursor: not-allowed;
        }

        .start-footer {
            color: #526b7d;
            font-size: 10px;
            letter-spacing: 2px;
            margin-top: 40px;
        }

        .settings-panel {
            display: none;
            margin: 20px auto 0;
            padding: 15px;
            max-width: 340px;
            border: 1px solid #28566e;
            background: #0b1b2a;
            text-align: left;
        }

        .settings-panel label {
            display: block;
            color: #8eeaff;
            margin: 12px 0;
            font-size: 13px;
        }

        .settings-panel select {
            width: 100%;
            padding: 9px;
            background: #10263a;
            color: white;
            border: 1px solid #327da0;
        }

        @media(max-width: 500px) {
            .start-panel {
                padding: 30px 15px;
            }
        }
    `;

    document.head.appendChild(style);
}

function hasSave() {
    return Boolean(localStorage.getItem("SERVER_SAVE"));
}

function beginNewGame() {
    screen.remove();
    screen = null;

    // Start avatar customization.
    showAvatarCreator((createdAvatar) => {
        window.dispatchEvent(
            new CustomEvent("server:new-game", {
                detail: createdAvatar
            })
        );
    });
}

function continueGame() {
    if (!hasSave()) return;

    screen.remove();
    screen = null;

    window.dispatchEvent(
        new CustomEvent("server:continue-game")
    );
}

function openSettings() {
    const panel = screen.querySelector(".settings-panel");

    panel.style.display =
        panel.style.display === "block" ? "none" : "block";
}

export function showStartScreen() {
    addStyles();

    if (screen) screen.remove();

    screen = document.createElement("div");
    screen.id = "server-start";

    const panel = document.createElement("div");
    panel.className = "start-panel";

    panel.innerHTML = `
        <h1 class="start-title">THE SERVER</h1>

        <p class="start-subtitle">
            A WORLD BEYOND THE SYSTEM
        </p>

        <div class="start-menu">
            <button class="start-button" id="new-game">
                NEW GAME
            </button>

            <button class="start-button" id="continue-game">
                CONTINUE
            </button>

            <button class="start-button" id="settings">
                SETTINGS
            </button>
        </div>

        <div class="settings-panel">
            <label>
                TEXT SPEED
                <select id="text-speed">
                    <option value="slow">SLOW</option>
                    <option value="normal" selected>NORMAL</option>
                    <option value="fast">FAST</option>
                </select>
            </label>

            <label>
                SCREEN EFFECTS
                <select id="screen-effects">
                    <option value="on">ON</option>
                    <option value="off">OFF</option>
                </select>
            </label>

            <button class="start-button" id="close-settings">
                BACK
            </button>
        </div>

        <p class="start-footer">
            SYSTEM ONLINE // VERSION 0.1
        </p>
    `;

    screen.appendChild(panel);
    document.body.appendChild(screen);

    const continueButton = panel.querySelector("#continue-game");

    continueButton.disabled = !hasSave();

    panel.querySelector("#new-game")
        .addEventListener("click", beginNewGame);

    continueButton.addEventListener("click", continueGame);

    panel.querySelector("#settings")
        .addEventListener("click", openSettings);

    panel.querySelector("#close-settings")
        .addEventListener("click", openSettings);

    panel.querySelector("#text-speed")
        .addEventListener("change", event => {
            localStorage.setItem(
                "SERVER_TEXT_SPEED",
                event.target.value
            );
        });

    panel.querySelector("#screen-effects")
        .addEventListener("change", event => {
            localStorage.setItem(
                "SERVER_SCREEN_EFFECTS",
                event.target.value
            );
        });

    return screen;
}
