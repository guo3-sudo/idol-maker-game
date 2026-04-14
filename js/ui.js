// js/ui.js
export class UI {
    constructor() {
        this.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen')
        };
    }

    showScreen(screenName) {
        if (!this.screens[screenName]) {
            console.warn(`showScreen: unknown screen "${screenName}"`);
            return;
        }
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
        this.screens[screenName].classList.add('active');
    }

    // 绑定开始按钮事件
    bindStartButton(onStartCallback) {
        document.getElementById('start-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('group-name-input').value.trim() || '无名之团';
            const scale = document.getElementById('company-scale-select').value;
            onStartCallback(name, scale);
        });
    }
}
