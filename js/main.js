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
    // Build initial card pool and render
    const pool = engine.buildSchedulePool(state);
    ui.renderScheduleCards(pool, state);
    if (state._easterEggTriggered) {
        ui.showEasterEggNotice();
    }
}

ui.initScaleCards();
ui.bindStartButton(startGame);

document.getElementById('execute-btn').addEventListener('click', () => {
    const result = engine.executeTurn();
    if (result === true) {
        // State display + card pool refresh handled inside engine.executeTurn -> afterEvent()
    } else if (result === 'gameover' || result === 'ending') {
        ui.renderState(state);
    }
    // result === false: validation failed, toast already shown
});
