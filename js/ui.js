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

    renderState(state) {
        document.getElementById('ui-group-name').textContent = state.groupName;
        document.getElementById('ui-turn').textContent = state.turn;
        document.getElementById('ui-money').textContent = state.money.toLocaleString();
        document.getElementById('ui-fans').textContent = state.fans.toLocaleString();

        const updateBar = (id, val) => {
            document.getElementById(`bar-${id}`).value = val;
            document.getElementById(`text-${id}`).textContent = Math.round(val);
        };
        updateBar('stamina', state.stamina);
        updateBar('stress', state.stress);
        updateBar('bond', state.bond);

        document.getElementById('text-vocal').textContent = Math.round(state.vocal);
        document.getElementById('text-dance').textContent = Math.round(state.dance);
        document.getElementById('text-charm').textContent = Math.round(state.charm);
    }
}
