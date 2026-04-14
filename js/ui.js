// js/ui.js
import { ACTIONS } from './actions.js';
import { SCHEDULE_SLOTS } from './config.js';

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

    // 初始化公司规模卡片点击逻辑
    initScaleCards() {
        const cards = document.querySelectorAll('.scale-card');
        const select = document.getElementById('company-scale-select');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                cards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                if (select) select.value = card.dataset.scale;
            });
        });
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

    }

    initScheduleUI(onSlotChange) {
        const container = document.getElementById('schedule-slots');
        if (!container) return;
        container.innerHTML = '';

        // Build options HTML once
        let optionsHtml = '<option value="">-- 选择安排 --</option>';
        for (const [key, action] of Object.entries(ACTIONS)) {
            optionsHtml += `<option value="${key}">${action.name}</option>`;
        }

        // Generate 5 slots
        for (let i = 0; i < SCHEDULE_SLOTS; i++) {
            const div = document.createElement('div');
            div.className = 'slot-item';
            div.innerHTML = `
                <label for="slot-select-${i}">第${i + 1}天：</label>
                <select id="slot-select-${i}" class="slot-select" data-index="${i}">
                    ${optionsHtml}
                </select>
            `;
            container.appendChild(div);
        }

        // Bind change events
        container.querySelectorAll('.slot-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index, 10);
                const actionKey = e.target.value;
                onSlotChange(index, actionKey === '' ? null : actionKey);
            });
        });
    }

    resetScheduleUI() {
        const selects = document.querySelectorAll('#schedule-slots .slot-select');
        selects.forEach(s => { s.value = ''; });
    }

    showEventModal(eventObj, onOptionSelect) {
        const overlay = document.getElementById('modal-overlay');
        const titleEl = document.getElementById('modal-title');
        const descEl = document.getElementById('modal-desc');
        const optionsEl = document.getElementById('modal-options');

        if (!overlay || !titleEl || !descEl || !optionsEl) return;

        titleEl.textContent = eventObj.title;
        descEl.textContent = eventObj.desc;
        optionsEl.innerHTML = '';

        eventObj.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'modal-btn';
            btn.textContent = opt.text;
            btn.addEventListener('click', () => {
                    btn.disabled = true;
                    this.hideEventModal();
                    onOptionSelect(opt);
                });
            optionsEl.appendChild(btn);
        });

        overlay.style.display = 'flex';
    }

    hideEventModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    showEasterEggNotice() {
        // Show a temporary banner at the top of the game screen
        const banner = document.createElement('div');
        banner.className = 'easter-egg-banner';
        banner.textContent = '✨ 好名字！系统感应到强大的星势，初始粉丝 +20万，魅力 +5！';
        document.getElementById('game-screen').prepend(banner);
        setTimeout(() => banner.remove(), 4000);
    }
}
