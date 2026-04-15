// js/config.js
export const COMPANY_SCALES = {
    indie:   { name: '独立厂牌', money: 1000000,  fans: 0,      bond: 80, stressRate: 0.8, weeklyStress: 1 },
    mid:     { name: '中型企划', money: 5000000,  fans: 50000,  bond: 50, stressRate: 1.0, weeklyStress: 2 },
    major:   { name: '娱乐巨头', money: 20000000, fans: 500000, bond: 20, stressRate: 1.5, weeklyStress: 5 },
    revival: { name: '过气重组', money: 500000,   fans: 100000, bond: 60, stressRate: 1.2, weeklyStress: 3 }
};

export const MAX_TURN = 52; // 1 year * 52 weeks

export const SCHEDULE_SLOTS = 3;
