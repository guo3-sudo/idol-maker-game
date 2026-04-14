// js/engine.js
import { ACTIONS } from './actions.js';
import { MAX_TURN } from './config.js';
import { EVENT_POOL } from './events.js';

export class GameEngine {
    constructor(state, ui) {
        this.state = state;
        this.ui = ui;
    }

    executeTurn() {
        const state = this.state;

        // 1. Check all slots are filled
        if (state.schedule.includes(null)) {
            alert('请为每个行程槽都安排行程！');
            return false;
        }

        // 2. Snapshot current values for monthly summary
        const snapshot = {
            fans:   state.fans,
            money:  state.money,
            vocal:  state.vocal,
            dance:  state.dance,
            charm:  state.charm,
            bond:   state.bond,
            stress: state.stress,
        };

        // 3. Execute each action
        for (const actionKey of state.schedule) {
            const action = ACTIONS[actionKey];
            if (!action) continue; // guard against invalid keys

            // Deduct cost
            state.modifyResource('money', -action.cost);
            // Apply stamina and stress deltas
            state.modifyResource('stamina', action.stamina);
            state.modifyResource('stress', action.stress);

            if (action.type === 'training') {
                // Apply attribute gains (vocal, dance, or charm — whichever is set)
                if (action.vocal)  state.modifyResource('vocal', action.vocal);
                if (action.dance)  state.modifyResource('dance', action.dance);
                if (action.charm)  state.modifyResource('charm', action.charm);
            }

            if (action.type === 'rest') {
                if (action.bond) state.modifyResource('bond', action.bond);
            }

            if (action.type === 'gig') {
                // Income formula: base + fans * 0.1 * successRate (capped at 1.0)
                const successRate = Math.min(1.0, (state.vocal + state.dance + state.charm) / 300);
                const income = Math.round((action.incomeBase || 0) + state.fans * 0.1 * successRate);
                const newFans = (action.fansBase || 0) * successRate;
                state.modifyResource('money', income);
                state.modifyResource('fans', Math.round(newFans));
            }
        }

        // 4. Apply stress rate multiplier from company scale
        // (stressRate is stored in state, applied as post-turn modifier)
        // We already applied raw stress increments; scale acts as a weekly passive multiplier
        // Apply: stress += (stress * (stressRate - 1)) to simulate company-scale pressure
        // passiveStress is negative for low-stressRate companies (e.g. indie: 0.8),
        // providing a gentle weekly stress relief — intentional design.
        const passiveStress = state.stress * (state.stressRate - 1) * 0.1;
        state.modifyResource('stress', passiveStress);

        // 5. Stress overflow: if stress >= 100, penalize
        if (state.stress >= 100) {
            const penalty = Math.round(50000 + state.fans * 0.05);
            state.modifyResource('fans', -penalty);
            state.modifyResource('money', -200000);
            state.modifyResource('stress', 80 - state.stress); // knock back down after crisis
            alert('⚠️ 团队压力爆表！成员集体罢工，损失惨重！');
        }

        // 6. Advance turn
        state.turn += 1;

        // 7. Check bankruptcy
        if (state.money < 0) {
            // Note: schedule not reset here; state.initGame().reset() handles this on restart
            this._triggerGameOver('破产清算：公司资金耗尽，团体被迫解散。');
            return 'gameover';
        }

        // 8. Check fan collapse (塌房)
        if (state.fans <= 0 && state.turn > 5) {
            // Note: schedule not reset here; state.initGame().reset() handles this on restart
            this._triggerGameOver('全网封杀：粉丝归零，团体彻底凉凉。');
            return 'gameover';
        }

        // 9. Check end of game (156 turns)
        if (state.turn > MAX_TURN) {
            this._triggerFinalEnding();
            return 'ending';
        }

        // 10. Determine if this turn ends a month (every 4 turns)
        const isMonthEnd = state.turn > 1 && (state.turn - 1) % 4 === 0;
        const monthNum   = Math.ceil((state.turn - 1) / 4);

        // 11. Trigger random event
        const bondFactor   = (100 - this.state.bond) / 100;
        const stressFactor = this.state.stress / 100;
        const eventChance  = Math.min(0.75, 0.35 + bondFactor * 0.20 + stressFactor * 0.20);

        // afterEvent: called after event (or directly if no event)
        const afterEvent = () => {
            this.ui.renderState(this.state);
            if (isMonthEnd) {
                this.ui.showMonthSummary({
                    month:  monthNum,
                    fans:   { before: snapshot.fans,   after: state.fans   },
                    money:  { before: snapshot.money,  after: state.money  },
                    vocal:  { before: snapshot.vocal,  after: state.vocal  },
                    dance:  { before: snapshot.dance,  after: state.dance  },
                    charm:  { before: snapshot.charm,  after: state.charm  },
                    bond:   { before: snapshot.bond,   after: state.bond   },
                    stress: { before: snapshot.stress, after: state.stress },
                });
            }
        };

        if (Math.random() < eventChance) {
            const randomEvent = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
            this.ui.showEventModal(randomEvent, (selectedOption) => {
                if (this.state.money < selectedOption.cost) {
                    alert('资金不足，无法选择该方案！系统默认执行最差应对...');
                    this.state.modifyResource('fans', -100000);
                } else {
                    if (selectedOption.cost > 0) {
                        this.state.modifyResource('money', -selectedOption.cost);
                    }
                    const result = selectedOption.effect(this.state);
                    if (result && result.msg) {
                        alert(`📋 公关结果：\n${result.msg}`);
                    }
                }
                afterEvent();
            });
        } else {
            afterEvent();
        }

        // 11. Reset schedule for next turn
        state.schedule = new Array(state.schedule.length).fill(null);

        return true; // turn executed successfully
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

        if (fans < 100000) {
            emoji   = '😔';
            title   = '【结局 D】无人问津的毕业';
            message = '三年期满未能续约，成员们黯然退圈，转型素人……下次一定能行的。';
        } else if (fans < 1000000) {
            emoji   = '🌟';
            title   = '【结局 C】娱乐圈的生存之道';
            message = '成为娱乐圈的二线团体，靠接小商演和直播带货维持生计，也算一种成功。';
        } else if (fans < 5000000) {
            emoji   = '🔥';
            title   = '【结局 B】当红炸子鸡';
            message = '拿下年度最佳组合奖，举办全国巡演，成员们星途璀璨！';
        } else if (bond > 80) {
            emoji   = '👑';
            title   = '【结局 A · 真结局】国民天团（传奇）';
            message = '火爆全球，举办世界巡演，全员保持初心、关系融洽。你打造了一个娱乐圈永远无法复制的神话！';
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
