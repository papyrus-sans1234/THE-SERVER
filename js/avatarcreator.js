
/* ==========================================
   THE SERVER — AVATAR CREATOR
   Single-file human pixel-art character creator
========================================== */

let avatar = {
    name: "PLAYER",
    gender: "Not specified",
    skin: "#c98d68",
    hair: "#29202b",
    hairstyle: "spiky",
    height: "medium",
    clothes: "#354f83",
    outfit: "jacket"
};

const hairstyles = ["short", "spiky", "long", "curly", "ponytail"];
const skinTones = [
    "#f5d0b0",
    "#e8b28c",
    "#c98d68",
    "#a96d4e",
    "#70452f",
    "#44291f"
];

const hairColors = [
    "#211b20",
    "#51301f",
    "#a66b32",
    "#d5b65e",
    "#a83d3d",
    "#526eb5",
    "#eeeeee"
];

const clothesColors = [
    "#354f83",
    "#292929",
    "#8e3545",
    "#397b68",
    "#704c9c",
    "#c28a35",
    "#eeeeee"
];

let creatorRoot;
let previewCanvas;
let previewCtx;

function injectAvatarStyles() {
    if (document.getElementById("server-avatar-styles")) return;

    const style = document.createElement("style");
    style.id = "server-avatar-styles";

    style.textContent = `
    #avatar-creator {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: #050911;
        color: #d9f3ff;
        font-family: Arial, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow-y: auto;
        padding: 18px;
        box-sizing: border-box;
    }

    #avatar-creator * {
        box-sizing: border-box;
    }

    .avatar-panel {
        width: min(950px, 100%);
        background: #0b1422;
        border: 1px solid #26799b;
        box-shadow: 0 0 35px #087ca533;
        padding: 22px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 22px;
    }

    .avatar-heading {
        grid-column: 1 / -1;
        border-bottom: 1px solid #24516c;
        padding-bottom: 12px;
    }

    .avatar-heading h1 {
        margin: 0;
        color: #7ee4ff;
        letter-spacing: 4px;
        font-size: 25px;
    }

    .avatar-heading p {
        color: #829eb3;
        font-size: 12px;
        letter-spacing: 2px;
    }

    .avatar-preview {
        background:
            linear-gradient(#101f31 1px, transparent 1px),
            linear-gradient(90deg, #101f31 1px, transparent 1px),
            #07101c;
        background-size: 20px 20px;
        border: 1px solid #285a78;
        min-height: 330px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .avatar-preview canvas {
        width: 192px;
        height: 256px;
        image-rendering: pixelated;
    }

    .avatar-preview p {
        color: #7ee4ff;
        font-size: 12px;
        letter-spacing: 3px;
    }

    .avatar-options {
        display: flex;
        flex-direction: column;
        gap: 13px;
    }

    .avatar-field label {
        display: block;
        color: #7ee4ff;
        font-size: 11px;
        letter-spacing: 2px;
        margin-bottom: 6px;
    }

    .avatar-field select,
    .avatar-field input {
        width: 100%;
        padding: 10px;
        background: #101f31;
        color: white;
        border: 1px solid #28617d;
        border-radius: 3px;
        font-size: 14px;
    }

    .avatar-colors {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .avatar-color {
        width: 29px;
        height: 29px;
        border: 2px solid #516579;
        cursor: pointer;
        border-radius: 4px;
    }

    .avatar-color.selected {
        outline: 2px solid #7ee4ff;
        outline-offset: 2px;
    }

    .avatar-actions {
        grid-column: 1 / -1;
        display: flex;
        gap: 12px;
    }

    .avatar-actions button {
        flex: 1;
        padding: 14px;
        border: 1px solid #55c9ed;
        background: #102b40;
        color: #8eeaff;
        cursor: pointer;
        font-weight: bold;
        letter-spacing: 2px;
    }

    .avatar-actions button:hover {
        background: #1b506e;
    }

    .avatar-actions .confirm {
        background: #17617a;
        color: white;
    }

    @media(max-width: 650px) {
        .avatar-panel {
            grid-template-columns: 1fr;
        }

        .avatar-heading,
        .avatar-actions {
            grid-column: 1;
        }

        .avatar-preview {
            min-height: 270px;
        }
    }
    `;

    document.head.appendChild(style);
}

function drawAvatar() {
    const ctx = previewCtx;
    ctx.clearRect(0, 0, 96, 128);

    const skin = avatar.skin;
    const hair = avatar.hair;
    const clothes = avatar.clothes;

    const tall = avatar.height === "tall";
    const short = avatar.height === "short";

    const scale = tall ? 1 : short ? 0.82 : 0.92;
    const offsetY = tall ? 0 : short ? 20 : 8;

    ctx.save();
    ctx.translate(0, offsetY);
    ctx.scale(1, scale);

    // Legs
    ctx.fillStyle = "#252c3b";
    ctx.fillRect(34, 91, 11, 24);
    ctx.fillRect(51, 91, 11, 24);

    // Shoes
    ctx.fillStyle = "#171b24";
    ctx.fillRect(30, 113, 16, 7);
    ctx.fillRect(50, 113, 17, 7);

    // Body
    ctx.fillStyle = clothes;
    ctx.fillRect(28, 55, 40, 39);

    // Outfit variations
    if (avatar.outfit === "hoodie") {
        ctx.fillStyle = "#172536";
        ctx.fillRect(34, 48, 28, 10);
        ctx.fillRect(34, 76, 28, 4);
    }

    if (avatar.outfit === "jacket") {
        ctx.fillStyle = "#172536";
        ctx.fillRect(46, 57, 4, 35);
        ctx.fillRect(27, 57, 5, 34);
    }

    if (avatar.outfit === "shirt") {
        ctx.fillStyle = "#dce9f0";
        ctx.fillRect(45, 57, 5, 13);
    }

    // Neck
    ctx.fillStyle = skin;
    ctx.fillRect(42, 48, 13, 12);

    // Head
    ctx.fillStyle = skin;
    ctx.fillRect(32, 20, 34, 32);

    // Ears
    ctx.fillRect(27, 31, 6, 10);
    ctx.fillRect(65, 31, 6, 10);

    // Hair
    ctx.fillStyle = hair;

    if (avatar.hairstyle === "short") {
        ctx.fillRect(31, 18, 36, 10);
        ctx.fillRect(31, 24, 5, 9);
    }

    if (avatar.hairstyle === "spiky") {
        ctx.fillRect(31, 21, 36, 8);
        ctx.fillRect(33, 13, 7, 12);
        ctx.fillRect(44, 9, 8, 16);
        ctx.fillRect(56, 14, 8, 11);
    }

    if (avatar.hairstyle === "long") {
        ctx.fillRect(29, 17, 40, 13);
        ctx.fillRect(29, 25, 7, 36);
        ctx.fillRect(63, 25, 7, 36);
    }

    if (avatar.hairstyle === "curly") {
        ctx.fillRect(31, 18, 36, 10);
        ctx.fillRect(27, 19, 10, 12);
        ctx.fillRect(37, 12, 10, 12);
        ctx.fillRect(49, 12, 10, 12);
        ctx.fillRect(60, 19, 10, 12);
    }

    if (avatar.hairstyle === "ponytail") {
        ctx.fillRect(31, 18, 36, 10);
        ctx.fillRect(31, 24, 6, 12);
        ctx.fillRect(64, 25, 7, 30);
        ctx.fillRect(67, 48, 7, 12);
    }

    // Eyes
    ctx.fillStyle = "#171717";
    ctx.fillRect(40, 34, 4, 4);
    ctx.fillRect(55, 34, 4, 4);

    // Mouth
    ctx.fillStyle = "#663b36";
    ctx.fillRect(46, 44, 7, 2);

    ctx.restore();
}

function createField(label, options, value, onChange) {
    const wrapper = document.createElement("div");
    wrapper.className = "avatar-field";

    const heading = document.createElement("label");
    heading.textContent = label;

    const select = document.createElement("select");

    options.forEach(option => {
        const item = document.createElement("option");
        item.value = option;
        item.textContent =
            option.charAt(0).toUpperCase() + option.slice(1);
        select.appendChild(item);
    });

    select.value = value;

    select.addEventListener("change", () => {
        onChange(select.value);
        drawAvatar();
    });

    wrapper.append(heading, select);
    return wrapper;
}

function createColorPicker(label, colors, selected, onChange) {
    const wrapper = document.createElement("div");
    wrapper.className = "avatar-field";

    const heading = document.createElement("label");
    heading.textContent = label;

    const buttons = document.createElement("div");
    buttons.className = "avatar-colors";

    colors.forEach(color => {
        const button = document.createElement("button");
        button.className = "avatar-color";
        button.style.background = color;
        button.title = color;

        if (color === selected) {
            button.classList.add("selected");
        }

        button.addEventListener("click", () => {
            onChange(color);

            buttons.querySelectorAll("button").forEach(btn => {
                btn.classList.remove("selected");
            });

            button.classList.add("selected");
            drawAvatar();
        });

        buttons.appendChild(button);
    });

    wrapper.append(heading, buttons);
    return wrapper;
}

export function showAvatarCreator(onComplete = () => {}) {
    injectAvatarStyles();

    if (creatorRoot) {
        creatorRoot.remove();
    }

    creatorRoot = document.createElement("div");
    creatorRoot.id = "avatar-creator";

    const panel = document.createElement("div");
    panel.className = "avatar-panel";

    const heading = document.createElement("div");
    heading.className = "avatar-heading";
    heading.innerHTML = `
        <h1>THE SERVER</h1>
        <p>PERSONAL IDENTITY CONFIGURATION</p>
    `;

    const preview = document.createElement("div");
    preview.className = "avatar-preview";

    previewCanvas = document.createElement("canvas");
    previewCanvas.width = 96;
    previewCanvas.height = 128;

    previewCtx = previewCanvas.getContext("2d");

    const previewLabel = document.createElement("p");
    previewLabel.textContent = "CHARACTER PREVIEW";

    preview.append(previewCanvas, previewLabel);

    const options = document.createElement("div");
    options.className = "avatar-options";

    // Name
    const nameField = document.createElement("div");
    nameField.className = "avatar-field";

    const nameLabel = document.createElement("label");
    nameLabel.textContent = "CHARACTER NAME";

    const nameInput = document.createElement("input");
    nameInput.maxLength = 16;
    nameInput.value = avatar.name;

    nameInput.addEventListener("input", () => {
        avatar.name = nameInput.value.toUpperCase();
    });

    nameField.append(nameLabel, nameInput);

    options.append(
        nameField,

        createField(
            "GENDER",
            ["not specified", "male", "female", "non-binary"],
            avatar.gender.toLowerCase(),
            value => avatar.gender =
                value === "not specified"
                    ? "Not specified"
                    : value
        ),

        createField(
            "HAIRSTYLE",
            hairstyles,
            avatar.hairstyle,
            value => avatar.hairstyle = value
        ),

        createColorPicker(
            "HAIR COLOR",
            hairColors,
            avatar.hair,
            value => avatar.hair = value
        ),

        createColorPicker(
            "SKIN TONE",
            skinTones,
            avatar.skin,
            value => avatar.skin = value
        ),

        createField(
            "HEIGHT",
            ["short", "medium", "tall"],
            avatar.height,
            value => avatar.height = value
        ),

        createField(
            "CLOTHING STYLE",
            ["shirt", "jacket", "hoodie"],
            avatar.outfit,
            value => avatar.outfit = value
        ),

        createColorPicker(
            "CLOTHING COLOR",
            clothesColors,
            avatar.clothes,
            value => avatar.clothes = value
        )
    );

    const actions = document.createElement("div");
    actions.className = "avatar-actions";

    const randomButton = document.createElement("button");
    randomButton.textContent = "RANDOMIZE";

    randomButton.addEventListener("click", () => {
        avatar.hairstyle =
            hairstyles[Math.floor(Math.random() * hairstyles.length)];

        avatar.skin =
            skinTones[Math.floor(Math.random() * skinTones.length)];

        avatar.hair =
            hairColors[Math.floor(Math.random() * hairColors.length)];

        avatar.clothes =
            clothesColors[Math.floor(Math.random() * clothesColors.length)];

        avatar.height =
            ["short", "medium", "tall"][Math.floor(Math.random() * 3)];

        avatar.outfit =
            ["shirt", "jacket", "hoodie"][Math.floor(Math.random() * 3)];

        creatorRoot.remove();
        creatorRoot = null;

        showAvatarCreator(onComplete);
    });

    const confirmButton = document.createElement("button");
    confirmButton.className = "confirm";
    confirmButton.textContent = "CONFIRM CHARACTER";

    confirmButton.addEventListener("click", () => {
        if (!avatar.name.trim()) {
            avatar.name = "PLAYER";
        }

        localStorage.setItem(
            "SERVER_AVATAR",
            JSON.stringify(avatar)
        );

        const finalAvatar = { ...avatar };

        creatorRoot.remove();
        creatorRoot = null;

        onComplete(finalAvatar);
    });

    actions.append(randomButton, confirmButton);

    panel.append(heading, preview, options, actions);
    creatorRoot.appendChild(panel);
    document.body.appendChild(creatorRoot);

    drawAvatar();
}

export function getAvatar() {
    try {
        const saved = localStorage.getItem("SERVER_AVATAR");

        if (saved) {
            avatar = { ...avatar, ...JSON.parse(saved) };
        }
    } catch (error) {
        console.warn("Could not load avatar:", error);
    }

    return { ...avatar };
}
