// js/engine.js
import { ACTIONS } from './actions.js';
import { MAX_TURN } from './config.js';
import { EVENT_POOL } from './events.js';

const TRIGGER_KEYS = new Set(['team_vacation', 'emergency_gig', 'disbandment_crisis']);
const SLOT_UNLOCK_FANS = 50000;

export class GameEngine {
    constructor(state, ui) {
        this.state = state;
        this.ui = ui;
        // Snapshot taken at the START of each 4-week month cycle
        this._monthStartSnapshot = null;
        // Recent event IDs — last 3 triggered events are excluded from selection
        this._recentEventIds = [];
    }

    /**
     * Build the 6-card pool for the current turn.
     * Returns array of { key, status: 'available'|'locked'|'cooldown'|'maxed', hintText }
     */
    buildSchedulePool(state) {
        const MAX_CARDS = 6;
        const MAX_PREVIEW = 2;

        const available = [];  // selectable cards
        const preview = [];    // locked / cooldown / maxed (grey preview)

        for (const [key, action] of Object.entries(ACTIONS)) {
            const isUnlocked = action.unlock(state);
            const cooldownLeft = state.actionCooldowns[key] || 0;
            const useCount = state.actionUseCounts[key] || 0;
            const atMaxUses = useCount >= action.maxUses;

            // Trigger-type actions: show only when condition is met, never as locked preview
            if (action.triggerType !== null) {
                if (isUnlocked) {
                    available.push({ key, status: 'available', hintText: '' });
                }
                // else: invisible when inactive
                continue;
            }

            if (isUnlocked && cooldownLeft === 0 && !atMaxUses) {
                available.push({ key, status: 'available', hintText: '' });
            } else if (!isUnlocked) {
                preview.push({ key, status: 'locked', hintText: action.unlockHint });
            } else if (atMaxUses) {
                preview.push({ key, status: 'maxed', hintText: '已达使用上限' });
            } else {
                preview.push({ key, status: 'cooldown', hintText: `${cooldownLeft} 周后可用` });
            }
        }

        const shuffle = (arr) => {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        };

        const pool = [];
        const triggerItems = available.filter(c => TRIGGER_KEYS.has(c.key));
        const nonTriggerAvailable = shuffle(available.filter(c => !TRIGGER_KEYS.has(c.key)));

        // 1. Add active trigger items first
        for (const item of triggerItems) {
            if (pool.length < MAX_CARDS) pool.push(item);
        }

        // 2. Guarantee one card per category from available non-trigger
        const CATEGORIES = ['train', 'perform', 'activity', 'rest'];
        for (const cat of CATEGORIES) {
            if (pool.length >= MAX_CARDS) break;
            const hascat = pool.some(c => ACTIONS[c.key].category === cat);
            if (!hascat) {
                const idx = nonTriggerAvailable.findIndex(c => ACTIONS[c.key].category === cat);
                if (idx !== -1) {
                    pool.push(nonTriggerAvailable.splice(idx, 1)[0]);
                }
            }
        }

        // 3. Fill to MAX_CARDS with remaining available
        while (pool.length < MAX_CARDS && nonTriggerAvailable.length > 0) {
            pool.push(nonTriggerAvailable.shift());
        }

        // 4. Fill remaining slots with preview items (max MAX_PREVIEW)
        const previewShuffled = shuffle(preview.slice());
        let previewAdded = 0;
        while (pool.length < MAX_CARDS && previewAdded < MAX_PREVIEW && previewShuffled.length > 0) {
            pool.push(previewShuffled.shift());
            previewAdded++;
        }

        return pool;
    }

    executeTurn() {
        const state = this.state;

        // 1. Check slots are filled
        if (state.schedule.length < state.scheduleSlots) {
            this.ui.showToast(`请选择 ${state.scheduleSlots} 个行程！`);
            return false;
        }

        // 2. Save month-start snapshot at the beginning of each 4-week cycle
        if ((state.turn - 1) % 4 === 0) {
            this._monthStartSnapshot = {
                fans:   state.fans,
                money:  state.money,
                vocal:  state.vocal,
                dance:  state.dance,
                charm:  state.charm,
                bond:   state.bond,
                stress: state.stress,
            };
        }

        // 3. Execute each selected action
        for (const actionKey of state.schedule) {
            const action = ACTIONS[actionKey];
            if (!action) continue;
            action.apply(state);
        }

        // 4. Update cooldowns and use counts for used actions
        for (const actionKey of state.schedule) {
            const action = ACTIONS[actionKey];
            if (!action) continue;
            if (action.cooldown > 0) {
                state.actionCooldowns[actionKey] = action.cooldown;
            }
            state.actionUseCounts[actionKey] = (state.actionUseCounts[actionKey] || 0) + 1;
        }

        // 5. Decrement all active cooldowns by 1
        for (const key of Object.keys(state.actionCooldowns)) {
            state.actionCooldowns[key] = Math.max(0, state.actionCooldowns[key] - 1);
        }

        // 6. Apply passive stress from company scale
        const passiveStress = state.stress * (state.stressRate - 1) * 0.1;
        state.modifyResource('stress', passiveStress);

        // 7. Stress overflow penalty
        if (state.stress >= 100) {
            const penalty = Math.round(50000 + state.fans * 0.05);
            state.modifyResource('fans', -penalty);
            state.modifyResource('money', -200000);
            state.modifyResource('stress', 80 - state.stress);
            this.ui.showToast('⚠️ 团队压力爆表！成员集体罢工，损失惨重！');
        }

        // 8. Check 3rd slot unlock milestone
        if (!state.slotUnlockAnnounced && state.fans >= SLOT_UNLOCK_FANS) {
            state.scheduleSlots = 3;
            state.slotUnlockAnnounced = true;
            this.ui.showToast('🎉 粉丝突破 5 万！第 3 个行程槽位已解锁！');
        }

        // 9. Advance turn
        state.turn += 1;

        // 10. Check bankruptcy
        if (state.money < 0) {
            this._triggerGameOver('破产清算：公司资金耗尽，团体被迫解散。');
            return 'gameover';
        }

        // 11. Check fan collapse
        if (state.fans <= 0 && state.turn > 5) {
            this._triggerGameOver('全网封杀：粉丝归零，团体彻底凉凉。');
            return 'gameover';
        }

        // 12. Check end of game
        if (state.turn > MAX_TURN) {
            this._triggerFinalEnding();
            return 'ending';
        }

        // 13. Month end check
        const isMonthEnd = state.turn > 1 && (state.turn - 1) % 4 === 0;
        const monthNum   = Math.ceil((state.turn - 1) / 4);

        // 14. Trigger random event
        const bondFactor   = (100 - state.bond) / 100;
        const stressFactor = state.stress / 100;
        const eventChance  = Math.min(0.75, 0.35 + bondFactor * 0.20 + stressFactor * 0.20);

        // afterEvent: refresh state display, rebuild card pool, then optionally show monthly summary
        const afterEvent = () => {
            this.ui.renderState(state);
            const newPool = this.buildSchedulePool(state);
            this.ui.renderScheduleCards(newPool, state);
            if (isMonthEnd && this._monthStartSnapshot) {
                this.ui.showMonthSummary({
                    month:  monthNum,
                    fans:   { before: this._monthStartSnapshot.fans,   after: state.fans   },
                    money:  { before: this._monthStartSnapshot.money,  after: state.money  },
                    vocal:  { before: this._monthStartSnapshot.vocal,  after: state.vocal  },
                    dance:  { before: this._monthStartSnapshot.dance,  after: state.dance  },
                    charm:  { before: this._monthStartSnapshot.charm,  after: state.charm  },
                    bond:   { before: this._monthStartSnapshot.bond,   after: state.bond   },
                    stress: { before: this._monthStartSnapshot.stress, after: state.stress },
                });
            }
        };

        // 15. Reset schedule for next turn
        state.schedule = [];

        if (Math.random() < eventChance) {
            const COOLDOWN = 3;
            const freshPool = EVENT_POOL.filter(e => !this._recentEventIds.includes(e.id));
            const pool = freshPool.length > 0 ? freshPool : EVENT_POOL;
            const randomEvent = pool[Math.floor(Math.random() * pool.length)];

            this._recentEventIds.push(randomEvent.id);
            if (this._recentEventIds.length > COOLDOWN) this._recentEventIds.shift();

            this.ui.showEventModal(randomEvent, (selectedOption) => {
                if (state.money < selectedOption.cost) {
                    state.modifyResource('fans', -100000);
                    this.ui.showAlert(
                        '💸 资金不足',
                        '资金不足，无法选择该方案！系统已默认执行最差应对，损失10万粉丝。',
                        () => afterEvent()
                    );
                } else {
                    if (selectedOption.cost > 0) state.modifyResource('money', -selectedOption.cost);
                    const result = selectedOption.effect(state);
                    if (result && result.msg) {
                        this.ui.showAlert('📋 公关结果', result.msg, () => afterEvent());
                    } else {
                        afterEvent();
                    }
                }
            });
        } else {
            afterEvent();
        }

        return true;
    }

    _triggerGameOver(message) {
        this.ui.showEndOverlay(
            '💀',
            '游戏结束',
            message,
            [
                { label: '坚持了', value: `第 ${this.state.turn} 周` },
                { label: '最终粉丝', value: Math.round(this.state.fans).toLocaleString() },
                { label: '剩余资金', value: `¥${Math.round(this.state.money).toLocaleString()}` }
            ]
        );
    }

    _triggerFinalEnding() {
        const { fans, bond, turn } = this.state;
        let emoji, title, message;

        if (fans < 50000) {
            emoji   = '😔';
            title   = '【结局 D】无人问津的毕业';
            message = '一年期满未能续约，成员们黯然退圈，转型素人……下次一定能行的。';
        } else if (fans < 500000) {
            emoji   = '🌟';
            title   = '【结局 C】娱乐圈的生存之道';
            message = '成为娱乐圈的二线团体，靠接小商演和直播带货维持生计，也算一种成功。';
        } else if (fans < 2000000) {
            emoji   = '🔥';
            title   = '【结局 B】当红炸子鸡';
            message = '拿下年度最佳新人奖，举办全国巡演，成员们星途璀璨！';
        } else if (bond > 80) {
            emoji   = '👑';
            title   = '【结局 A · 真结局】国民天团（传奇）';
            message = '首年即火爆全国，举办大型演唱会，全员保持初心、关系融洽。你打造了一个娱乐圈永远无法复制的神话！';
        } else {
            emoji   = '💫';
            title   = '【结局 B+】当红炸子鸡（貌合神离）';
            message = '团体大红大紫，但背地里矛盾重重，团内关系已名存实亡……独缺那一份初心。';
        }

        this.ui.showEndOverlay(emoji, title, message, [
            { label: '最终粉丝', value: Math.round(fans).toLocaleString() },
            { label: '团员默契', value: `${Math.round(bond)} / 100` },
            { label: '历时', value: `${turn - 1} 周` }
        ]);
    }
}
