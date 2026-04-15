// js/ui.js
import { ACTIONS as ACTIONS_MAP } from './actions.js';

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

    /**
     * Render the 6-card schedule grid.
     * pool: array of { key, status: 'available'|'locked'|'cooldown'|'maxed', hintText }
     * state: GameState
     */
    renderScheduleCards(pool, state) {
        const container = document.getElementById('schedule-slots');
        if (!container) return;
        container.innerHTML = '';

        pool.forEach(({ key, status, hintText }) => {
            const action = ACTIONS_MAP[key];
            if (!action) return;

            const isSelected = state.schedule.includes(key);
            const isAvailable = status === 'available';

            const card = document.createElement('div');
            card.className = 'action-card' +
                (isSelected  ? ' action-card--selected'  : '') +
                (status === 'locked'   ? ' action-card--locked'   : '') +
                (status === 'cooldown' ? ' action-card--cooldown' : '') +
                (status === 'maxed'    ? ' action-card--cooldown' : '');

            const categoryLabels = { train: '训练', perform: '演出', activity: '活动', rest: '休息' };
            const categoryColors = { train: 'cat-train', perform: 'cat-perform', activity: 'cat-activity', rest: 'cat-rest' };

            card.innerHTML = `
                <div class="card-top">
                    <span class="card-icon">${action.icon}</span>
                    <span class="card-category ${categoryColors[action.category]}">${categoryLabels[action.category]}</span>
                </div>
                <div class="card-name">${action.name}</div>
                <div class="card-effect">${isAvailable ? action.effectSummary : (hintText || action.unlockHint)}</div>
                ${isSelected ? '<div class="card-selected-badge">✓ 已选</div>' : ''}
            `;

            if (isAvailable && !isSelected) {
                card.addEventListener('click', () => {
                    if (state.schedule.length < state.scheduleSlots) {
                        state.schedule.push(key);
                        this.renderScheduleCards(pool, state);
                        this.refreshSlotCounter(state);
                    } else {
                        this.showToast(`最多选 ${state.scheduleSlots} 个行程！`);
                    }
                });
            } else if (isSelected) {
                card.addEventListener('click', () => {
                    state.schedule = state.schedule.filter(k => k !== key);
                    this.renderScheduleCards(pool, state);
                    this.refreshSlotCounter(state);
                });
            }

            container.appendChild(card);
        });

        this.refreshSlotCounter(state);
    }

    refreshSlotCounter(state) {
        const counter = document.getElementById('slot-counter');
        if (!counter) return;
        const selected = state.schedule.length;
        const total = state.scheduleSlots;
        counter.textContent = `已选 ${selected} / ${total} 个行程`;
        counter.className = 'slot-counter' + (selected === total ? ' slot-counter--full' : '');
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

            const textSpan = document.createElement('span');
            textSpan.className = 'modal-btn-text';
            textSpan.textContent = opt.text;
            btn.appendChild(textSpan);

            if (opt.actualCost > 0) {
                const costSpan = document.createElement('span');
                costSpan.className = 'modal-btn-cost';
                costSpan.textContent = `实际扣费 ¥${opt.actualCost.toLocaleString()}`;
                btn.appendChild(costSpan);
            }

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

    // Non-blocking banner — auto-dismisses after 3.5 s
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'game-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }

    // Blocking single-button alert — reuses modal overlay
    showAlert(title, body, onClose) {
        const overlay   = document.getElementById('modal-overlay');
        const titleEl   = document.getElementById('modal-title');
        const descEl    = document.getElementById('modal-desc');
        const optionsEl = document.getElementById('modal-options');
        if (!overlay || !titleEl || !descEl || !optionsEl) return;

        titleEl.textContent = title;
        descEl.textContent  = body;
        optionsEl.innerHTML = '';

        const btn = document.createElement('button');
        btn.className   = 'modal-btn modal-btn--continue';
        btn.textContent = '确认';
        btn.addEventListener('click', () => {
            this.hideEventModal();
            if (onClose) onClose();
        });
        optionsEl.appendChild(btn);
        overlay.style.display = 'flex';
    }

    showMonthSummary(data) {
        const overlay   = document.getElementById('modal-overlay');
        const titleEl   = document.getElementById('modal-title');
        const descEl    = document.getElementById('modal-desc');
        const optionsEl = document.getElementById('modal-options');
        if (!overlay || !titleEl || !descEl || !optionsEl) return;

        titleEl.textContent = `第 ${data.month} 月 · 月度小结`;

        const fmt = (n) => Math.round(n).toLocaleString();
        const delta = (before, after, inverse = false) => {
            const d = Math.round(after - before);
            if (d === 0) return `<span class="delta-zero">—</span>`;
            const isPos = d > 0;
            const isGood = inverse ? !isPos : isPos;
            const cls = isGood ? 'delta-pos' : 'delta-neg';
            const sign = isPos ? '+' : '';
            return `<span class="${cls}">${sign}${d.toLocaleString()}</span>`;
        };

        descEl.innerHTML = `
            <div class="summary-rows">
                <div class="summary-row">
                    <span>💰 资金</span>
                    <span class="summary-now">¥${fmt(data.money.after)}</span>
                    ${delta(data.money.before, data.money.after)}
                </div>
                <div class="summary-row">
                    <span>👥 粉丝</span>
                    <span class="summary-now">${fmt(data.fans.after)}</span>
                    ${delta(data.fans.before, data.fans.after)}
                </div>
                <div class="summary-row">
                    <span>🎤 唱功</span>
                    <span class="summary-now">${fmt(data.vocal.after)}</span>
                    ${delta(data.vocal.before, data.vocal.after)}
                </div>
                <div class="summary-row">
                    <span>💃 舞蹈</span>
                    <span class="summary-now">${fmt(data.dance.after)}</span>
                    ${delta(data.dance.before, data.dance.after)}
                </div>
                <div class="summary-row">
                    <span>✨ 魅力</span>
                    <span class="summary-now">${fmt(data.charm.after)}</span>
                    ${delta(data.charm.before, data.charm.after)}
                </div>
                <div class="summary-row">
                    <span>🤝 默契</span>
                    <span class="summary-now">${fmt(data.bond.after)}</span>
                    ${delta(data.bond.before, data.bond.after)}
                </div>
                <div class="summary-row">
                    <span>😰 压力</span>
                    <span class="summary-now">${fmt(data.stress.after)}</span>
                    ${delta(data.stress.before, data.stress.after, true)}
                </div>
            </div>
        `;

        optionsEl.innerHTML = '';
        const btn = document.createElement('button');
        btn.className = 'modal-btn modal-btn--continue';
        btn.textContent = '继续出发 →';
        btn.addEventListener('click', () => this.hideEventModal());
        optionsEl.appendChild(btn);

        overlay.style.display = 'flex';
    }

    showEndOverlay(emoji, title, message, stats, opts = {}) {
        const overlay = document.getElementById('end-overlay');
        if (!overlay) return;

        // Group name
        const groupNameEl = document.getElementById('end-group-name');
        if (groupNameEl) groupNameEl.textContent = opts.groupName || '';

        // Badge
        const badgeEl = document.getElementById('end-badge');
        if (badgeEl) {
            if (opts.badge) {
                badgeEl.textContent = opts.badge;
                badgeEl.style.display = '';
            } else {
                badgeEl.style.display = 'none';
            }
        }

        document.getElementById('end-emoji').textContent = emoji;
        document.getElementById('end-title').textContent = title;
        document.getElementById('end-message').textContent = message;

        // Render stat pills
        const statsEl = document.getElementById('end-stats');
        statsEl.innerHTML = stats.map(s =>
            `<div class="end-stat-item">
                <span class="end-stat-label">${s.label}</span>
                <span class="end-stat-value">${s.value}</span>
            </div>`
        ).join('');

        overlay.style.display = 'flex';

        document.getElementById('restart-btn').onclick = () => {
            location.reload();
        };
    }

    showEasterEggNotice() {
        this.showAlert('✨ 星势感应！', '系统感应到强大的星势，初始粉丝 +20万，魅力 +5！');
    }
}
