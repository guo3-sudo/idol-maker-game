// js/main.js
import { GameState } from './state.js';
import { UI } from './ui.js';

const state = new GameState();
const ui = new UI();

function startGame(name, scale) {
    state.initGame(name, scale);
    ui.showScreen('game');
    console.log("游戏开始，当前状态:", state); // TODO: remove before production
}

ui.bindStartButton(startGame);
