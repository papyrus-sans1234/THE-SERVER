
import { state } from './gameState.js';

export function showDialogue(speaker, lines, onComplete) {
  if (state.dialogue) return;

  state.dialogue = {
    speaker,
    lines: Array.isArray(lines) ? lines : [lines],
    index: 0,
    onComplete
  };

  renderDialogue();
}

function renderDialogue() {
  const dialogue = state.dialogue;

  if (!dialogue) return;

  document.getElementById('dialogue-overlay')
    .classList.remove('hidden');

  document.getElementById('dialogue-speaker')
    .textContent = dialogue.speaker;

  document.getElementById('dialogue-line')
    .textContent = dialogue.lines[dialogue.index];
}

export function advanceDialogue() {
  const dialogue = state.dialogue;

  if (!dialogue) return;

  dialogue.index++;

  if (dialogue.index >= dialogue.lines.length) {
    const callback = dialogue.onComplete;

    state.dialogue = null;

    document.getElementById('dialogue-overlay')
      .classList.add('hidden');

    if (callback) callback();

    return;
  }

  renderDialogue();
}

export function closeDialogue() {
  if (!state.dialogue) return;

  state.dialogue = null;

  document.getElementById('dialogue-overlay')
    .classList.add('hidden');
}
