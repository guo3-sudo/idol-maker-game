// js/state.js
import { COMPANY_SCALES } from './config.js';

export class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.groupName = '';
        this.companyScale = null;
        this.turn = 1;
        
        // Resources
        this.money = 0;
        this.fans = 0;
        
        // Attributes (0-100)
        this.stamina = 100;
        this.stress = 0;
        this.bond = 50; // 团员关系
        
        this.vocal = 10;
        this.dance = 10;
        this.charm = 10;

        // Schedule (5 slots per turn)
        this.schedule = [null, null, null, null, null];
    }

    initGame(groupName, scaleKey) {
        this.reset();
        this.groupName = groupName;
        const scale = COMPANY_SCALES[scaleKey];
        this.companyScale = scaleKey;
        this.money = scale.money;
        this.fans = scale.fans;
        this.bond = scale.bond;
        // 彩蛋逻辑：如果团名包含特定关键词，给予加成。暂时省略，后续完善。
    }

    // 基础的数值修改方法，带有边界限制
    modifyResource(type, amount) {
        if (this[type] !== undefined) {
            this[type] += amount;
            if (['stamina', 'stress', 'bond', 'vocal', 'dance', 'charm'].includes(type)) {
                this[type] = Math.max(0, Math.min(100, this[type]));
            } else if (type === 'fans') {
                this[type] = Math.max(0, this[type]); // 粉丝不能为负
            }
            // 资金允许为负（破产判定在回合结算）
        }
    }
}
