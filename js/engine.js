// js/engine.js
import { ACTIONS } from './actions.js';
import { MAX_TURN } from './config.js';

export class GameEngine {
    constructor(state, ui) {
        this.state = state;
        this.ui = ui;
    }

    executeTurn() {
        const state = this.state;

        // 1. Check all slots are filled
        if (state.schedule.includes(null)) {
            alert('请为每天都安排行程！');
            return false;
        }

        // 2. Check stamina is sufficient
        if (state.stamina < 30) {
            alert('体力太低无法行动，请安排休息！');
            return false;
        }

        // 3. Execute each of the 5 actions
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
                const income = (action.incomeBase || 0) + state.fans * 0.1 * successRate;
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
            const penalty = 50000 + state.fans * 0.05;
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

        // 10. Reset schedule for next turn
        state.schedule = new Array(state.schedule.length).fill(null);

        return true; // turn executed successfully
    }

    _triggerGameOver(message) {
        alert(`游戏结束！\n${message}`);
        // TODO (Task 6): hook into event overlay if needed
    }

    _triggerFinalEnding() {
        const { fans, bond } = this.state;
        let ending;
        if (fans < 100000) {
            ending = '【结局 D】无人问津的毕业（糊咖）\n三年期满未能续约，成员们黯然退圈。';
        } else if (fans < 1000000) {
            ending = '【结局 C】娱乐圈的生存之道（二线团体）\n靠接小商演和直播带货维持生计。';
        } else if (fans < 5000000) {
            ending = '【结局 B】当红炸子鸡（顶流）\n拿下年度最佳组合奖，举办全国巡演！';
        } else {
            if (bond > 80) {
                ending = '【结局 A / 真结局】国民天团（传奇）\n火爆全球，全员保持初心，打造了娱乐圈神话！';
            } else {
                ending = '【结局 B+】当红炸子鸡（貌合神离）\n人气很火，但团内关系已名存实亡。';
            }
        }
        alert(`三年合约期满！\n\n最终粉丝数：${Math.round(fans).toLocaleString()}\n团员关系：${Math.round(bond)}/100\n\n${ending}`);
    }
}
