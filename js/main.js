// js/main.js
import { GameState } from './state.js';
import { UI } from './ui.js';

const state = new GameState();
const ui = new UI();

function startGame(name, scale) {
    state.initGame(name, scale);
    ui.showScreen('game');
    ui.renderState(state);
    ui.resetScheduleUI();
}

ui.bindStartButton(startGame);
ui.initScheduleUI((index, actionKey) => {
    state.schedule[index] = actionKey;
});
