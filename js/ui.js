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
        const nameEl = document.getElementById('ui-group-name');
        if (nameEl) nameEl.textContent = state.groupName;
        const turnEl = document.getElementById('ui-turn');
        if (turnEl) turnEl.textContent = state.turn;
        const moneyEl = document.getElementById('ui-money');
        if (moneyEl) moneyEl.textContent = state.money.toLocaleString();
        const fansEl = document.getElementById('ui-fans');
        if (fansEl) fansEl.textContent = state.fans.toLocaleString();

        const updateBar = (id, val) => {
            const bar = document.getElementById(`bar-${id}`);
            const txt = document.getElementById(`text-${id}`);
            if (bar) bar.value = val;
            if (txt) txt.textContent = Math.round(val);
        };
        updateBar('stamina', state.stamina);
        updateBar('stress', state.stress);
        updateBar('bond', state.bond);

        const vocalEl = document.getElementById('text-vocal');
        if (vocalEl) vocalEl.textContent = Math.round(state.vocal);
        const danceEl = document.getElementById('text-dance');
        if (danceEl) danceEl.textContent = Math.round(state.dance);
        const charmEl = document.getElementById('text-charm');
        if (charmEl) charmEl.textContent = Math.round(state.charm);

        // TODO (Task 4): render schedule slots
    }
}
