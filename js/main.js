// js/main.js
import { GameState } from './state.js';
import { UI } from './ui.js';
import { GameEngine } from './engine.js';

const state = new GameState();
const ui = new UI();
const engine = new GameEngine(state, ui);

function startGame(name, scale) {
    state.initGame(name, scale);
    ui.showScreen('game');
    ui.renderState(state);
    ui.resetScheduleUI();
    if (state._easterEggTriggered) {
        ui.showEasterEggNotice();
    }
}

ui.initScaleCards();
ui.bindStartButton(startGame);

ui.initScheduleUI((index, actionKey) => {
    state.schedule[index] = actionKey;
});

document.getElementById('execute-btn').addEventListener('click', () => {
    const result = engine.executeTurn();
    if (result === true) {
        ui.renderState(state);
        ui.resetScheduleUI();
    } else if (result === 'gameover' || result === 'ending') {
        // Game is over — re-render final state then show start screen after a short delay
        ui.renderState(state);
        setTimeout(() => ui.showScreen('start'), 1500);
    }
    // result === false means validation failed, do nothing (alert was already shown)
});
