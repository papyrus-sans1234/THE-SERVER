
import { startCombat } from "./combat/combat.js";

document.getElementById("fight-button")
    .addEventListener("click", () => {
        startCombat("combatDummy");
    });

console.log("THE SERVER initialized.");
