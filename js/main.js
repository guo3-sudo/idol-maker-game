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
        // Render final state then show end overlay (handled inside engine)
        ui.renderState(state);
    }
    // result === false: validation failed, alert already shown
});
