// js/actions.js
export const ACTIONS = {
    train_vocal: { name: '声乐课', type: 'training', cost: 50000, stam: -10, stress: +5, vocal: +3 },
    train_dance: { name: '舞蹈课', type: 'training', cost: 50000, stam: -10, stress: +5, dance: +3 },
    gig_small:   { name: '接小商演', type: 'gig', cost: 0, stam: -20, stress: +15, incomeBase: 100000, fansBase: 500 },
    rest:        { name: '宿舍休息', type: 'rest', cost: 0, stam: +30, stress: -20, bond: +2 }
};
