
/* ==========================================
   THE SERVER — AVATAR CREATOR
   Full Human Pixel-Art Character Creator
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

const hairstyles = [
    "short",
    "spiky",
    "long",
    "curly",
    "ponytail"
];

const genders = [
    "not specified",
    "male",
    "female",
    "non-binary"
];

const heights = [
    "short",
    "medium",
    "tall"
];

const outfits = [
    "shirt",
    "jacket",
    "hoodie"
];

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

let creatorRoot = null;
let previewCanvas = null;
let previewCtx = null;


// ==========================================
// LOAD SAVED AVATAR
// ==========================================

export function getAvatar() {
    try {
        const saved = localStorage.getItem("SERVER_AVATAR");

        if (saved) {
            const parsed = JSON.parse(saved);

            avatar = {
                ...avatar,
                ...parsed
            };
        }
    } catch (error) {
        console.warn("Could not load avatar:", error);
    }

    return { ...avatar };
}


// ==========================================
// STYLES
// ==========================================

function injectAvatarStyles() {
    if (document.getElementById("server-avatar-styles")) {
        return;
    }

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


// ==========================================
// PIXEL ART DRAWING HELPERS
// ==========================================

function pixel(x, y, width, height, color) {
    previewCtx.fillStyle = color;

    previewCtx.fillRect(
        x,
        y,
        width,
        height
    );
}


// ==========================================
// DRAW CHARACTER
// ==========================================

function drawAvatar() {
    if (!previewCtx) return;

    const ctx = previewCtx;

    ctx.clearRect(0, 0, 96, 128);

    const skin = avatar.skin;
    const hair = avatar.hair;
    const clothes = avatar.clothes;

    const gender = avatar.gender.toLowerCase();

    // Height
    let scale = 0.92;
    let offsetY = 8;

    if (avatar.height === "short") {
        scale = 0.82;
        offsetY = 20;
    }

    if (avatar.height === "tall") {
        scale = 1;
        offsetY = 0;
    }

    ctx.save();

    ctx.translate(0, offsetY);
    ctx.scale(1, scale);

    // --------------------------------------
    // BODY SHAPE PRESETS
    // --------------------------------------

    let shoulderX = 29;
    let shoulderWidth = 38;
    let torsoX = 29;
    let torsoWidth = 38;
    let hipX = 30;
    let hipWidth = 36;

    if (gender === "male") {
        shoulderX = 26;
        shoulderWidth = 44;

        torsoX = 29;
        torsoWidth = 38;

        hipX = 32;
        hipWidth = 32;
    }

    if (gender === "female") {
        shoulderX = 31;
        shoulderWidth = 34;

        torsoX = 29;
        torsoWidth = 38;

        hipX = 27;
        hipWidth = 42;
    }

    if (
        gender === "non-binary" ||
        gender === "not specified"
    ) {
        shoulderX = 29;
        shoulderWidth = 38;

        torsoX = 29;
        torsoWidth = 38;

        hipX = 29;
        hipWidth = 38;
    }

    // --------------------------------------
    // LEGS
    // --------------------------------------

    const legWidth =
        gender === "female" ? 13 : 12;

    pixel(
        35,
        91,
        legWidth,
        24,
        "#252c3b"
    );

    pixel(
        51,
        91,
        legWidth,
        24,
        "#252c3b"
    );

    // Shoes
    pixel(30, 113, 17, 7, "#171b24");
    pixel(50, 113, 18, 7, "#171b24");

    // --------------------------------------
    // ARMS
    // --------------------------------------

    pixel(
        shoulderX - 5,
        59,
        7,
        28,
        skin
    );

    pixel(
        shoulderX + shoulderWidth - 2,
        59,
        7,
        28,
        skin
    );

    // Hands
    pixel(shoulderX - 5, 85, 7, 7, skin);

    pixel(
        shoulderX + shoulderWidth - 2,
        85,
        7,
        7,
        skin
    );

    // --------------------------------------
    // BODY
    // --------------------------------------

    pixel(
        shoulderX,
        55,
        shoulderWidth,
        12,
        clothes
    );

    pixel(
        torsoX,
        67,
        torsoWidth,
        17,
        clothes
    );

    pixel(
        hipX,
        84,
        hipWidth,
        10,
        clothes
    );

    // --------------------------------------
    // NECK
    // --------------------------------------

    pixel(42, 48, 13, 12, skin);

    // --------------------------------------
    // OUTFIT DETAILS
    // --------------------------------------

    if (avatar.outfit === "jacket") {
        pixel(45, 56, 4, 37, "#172536");

        pixel(
            shoulderX,
            57,
            4,
            34,
            "#172536"
        );

        pixel(43, 60, 2, 4, "#d8e6ef");
    }

    if (avatar.outfit === "hoodie") {
        pixel(34, 48, 28, 10, "#172536");

        pixel(34, 76, 28, 4, "#172536");

        pixel(39, 57, 3, 12, "#172536");

        pixel(56, 57, 3, 12, "#172536");
    }

    if (avatar.outfit === "shirt") {
        pixel(45, 57, 5, 13, "#dce9f0");
    }

    // --------------------------------------
    // HEAD SHAPE
    // --------------------------------------

    if (gender === "male") {
        // Broader jaw
        pixel(32, 20, 34, 27, skin);
        pixel(35, 47, 28, 5, skin);
    }

    else if (gender === "female") {
        // Softer, tapered jaw
        pixel(33, 20, 32, 25, skin);
        pixel(35, 45, 28, 4, skin);
        pixel(39, 49, 20, 3, skin);
    }

    else {
        // Balanced face
        pixel(32, 20, 34, 32, skin);
    }

    // Ears
    pixel(27, 31, 6, 10, skin);
    pixel(65, 31, 6, 10, skin);

    // --------------------------------------
    // HAIR
    // --------------------------------------

    if (avatar.hairstyle === "short") {
        pixel(31, 18, 36, 10, hair);
        pixel(31, 24, 5, 9, hair);
        pixel(62, 24, 5, 7, hair);
    }

    if (avatar.hairstyle === "spiky") {
        pixel(31, 21, 36, 8, hair);

        pixel(33, 13, 7, 12, hair);
        pixel(44, 9, 8, 16, hair);
        pixel(56, 14, 8, 11, hair);
    }

    if (avatar.hairstyle === "long") {
        pixel(29, 17, 40, 13, hair);

        pixel(29, 25, 7, 36, hair);
        pixel(63, 25, 7, 36, hair);
    }

    if (avatar.hairstyle === "curly") {
        pixel(31, 18, 36, 10, hair);

        pixel(27, 19, 10, 12, hair);
        pixel(37, 12, 10, 12, hair);
        pixel(49, 12, 10, 12, hair);
        pixel(60, 19, 10, 12, hair);
    }

    if (avatar.hairstyle === "ponytail") {
        pixel(31, 18, 36, 10, hair);

        pixel(31, 24, 6, 12, hair);

        pixel(64, 25, 7, 30, hair);
        pixel(67, 48, 7, 12, hair);
    }

    // --------------------------------------
    // FACE DETAILS
    // --------------------------------------

    // Eyebrows
    if (gender === "male") {
        pixel(39, 30, 7, 2, hair);
        pixel(54, 30, 7, 2, hair);
    }

    else if (gender === "female") {
        pixel(40, 30, 5, 1, hair);
        pixel(55, 30, 5, 1, hair);
    }

    else {
        pixel(40, 30, 5, 2, hair);
        pixel(55, 30, 5, 2, hair);
    }

    // Eyes
    pixel(40, 34, 4, 4, "#171717");
    pixel(55, 34, 4, 4, "#171717");

    // Nose
    pixel(47, 39, 3, 2, "#9d6551");

    // Mouth
    if (gender === "male") {
        pixel(46, 44, 8, 2, "#663b36");
    }

    else if (gender === "female") {
        pixel(47, 44, 6, 2, "#884d50");
    }

    else {
        pixel(46, 44, 7, 2, "#663b36");
    }

    ctx.restore();
}


// ==========================================
// SELECT FIELD
// ==========================================

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
            option.charAt(0).toUpperCase() +
            option.slice(1);

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


// ==========================================
// COLOR PICKER
// ==========================================

function createColorPicker(
    label,
    colors,
    selected,
    onChange
) {
    const wrapper = document.createElement("div");

    wrapper.className = "avatar-field";

    const heading = document.createElement("label");

    heading.textContent = label;

    const buttons = document.createElement("div");

    buttons.className = "avatar-colors";

    colors.forEach(color => {
        const button = document.createElement("button");

        button.type = "button";
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


// ==========================================
// AVATAR CREATOR
// ==========================================

export function showAvatarCreator(onComplete = () => {}) {
    injectAvatarStyles();

    if (creatorRoot) {
        creatorRoot.remove();
    }

    creatorRoot = document.createElement("div");

    creatorRoot.id = "avatar-creator";

    const panel = document.createElement("div");

    panel.className = "avatar-panel";

    // HEADER
    const heading = document.createElement("div");

    heading.className = "avatar-heading";

    heading.innerHTML = `
        <h1>THE SERVER</h1>
        <p>PERSONAL IDENTITY CONFIGURATION</p>
    `;

    // PREVIEW
    const preview = document.createElement("div");

    preview.className = "avatar-preview";

    previewCanvas = document.createElement("canvas");

    previewCanvas.width = 96;
    previewCanvas.height = 128;

    previewCtx = previewCanvas.getContext("2d");

    const previewLabel = document.createElement("p");

    previewLabel.textContent = "CHARACTER PREVIEW";

    preview.append(
        previewCanvas,
        previewLabel
    );

    // OPTIONS
    const options = document.createElement("div");

    options.className = "avatar-options";

    // NAME
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

    nameField.append(
        nameLabel,
        nameInput
    );

    // BUILD OPTIONS
    options.append(
        nameField,

        createField(
            "GENDER / APPEARANCE",
            genders,
            avatar.gender.toLowerCase(),
            value => {
                avatar.gender =
                    value === "not specified"
                        ? "Not specified"
                        : value;
            }
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
            heights,
            avatar.height,
            value => avatar.height = value
        ),

        createField(
            "CLOTHING STYLE",
            outfits,
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

    // ACTIONS
    const actions = document.createElement("div");

    actions.className = "avatar-actions";

    // RANDOMIZE
    const randomButton = document.createElement("button");

    randomButton.type = "button";
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
            heights[Math.floor(Math.random() * heights.length)];

        avatar.outfit =
            outfits[Math.floor(Math.random() * outfits.length)];

        avatar.gender =
            ["male", "female", "non-binary"][
                Math.floor(Math.random() * 3)
            ];

        // Rebuild controls to match randomized values.
        creatorRoot.remove();
        creatorRoot = null;

        showAvatarCreator(onComplete);
    });

    // CONFIRM
    const confirmButton = document.createElement("button");

    confirmButton.type = "button";
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

    actions.append(
        randomButton,
        confirmButton
    );

    // FINAL LAYOUT
    panel.append(
        heading,
        preview,
        options,
        actions
    );

    creatorRoot.appendChild(panel);

    document.body.appendChild(creatorRoot);

    drawAvatar();
}
