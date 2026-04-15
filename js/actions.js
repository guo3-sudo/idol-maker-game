// js/actions.js
// 每个行程字段说明：
//   category: 'train' | 'perform' | 'activity' | 'rest'
//   icon: 卡片显示的 emoji
//   effectSummary: 卡片上显示的效果简介
//   cooldown: 使用后的冷却周数（0=无冷却）
//   maxUses: 全局最多使用次数（Infinity=不限）
//   triggerType: null | 'stress' | 'budget' | 'bond'（触发型行程标识）
//   unlock(state): 返回 true 表示可用
//   unlockHint: 锁定时显示的提示文字
//   apply(state): 执行效果（不包含冷却/计数，由 engine 处理）

export const ACTIONS = {

    // ── 训练类 ─────────────────────────────────────────
    train_vocal: {
        name: '声乐训练', category: 'train', icon: '🎤',
        effectSummary: '唱功 +4，体力 -15，压力 +3',
        cooldown: 0, maxUses: Infinity, triggerType: null,
        unlock: () => true, unlockHint: '',
        apply(state) {
            state.modifyResource('money', -50000);
            state.modifyResource('stamina', -15);
            state.modifyResource('stress', 3);
            state.modifyResource('vocal', 4);
        }
    },

    train_dance: {
        name: '舞蹈训练', category: 'train', icon: '💃',
        effectSummary: '舞蹈 +4，体力 -15，压力 +3',
        cooldown: 0, maxUses: Infinity, triggerType: null,
        unlock: () => true, unlockHint: '',
        apply(state) {
            state.modifyResource('money', -50000);
            state.modifyResource('stamina', -15);
            state.modifyResource('stress', 3);
            state.modifyResource('dance', 4);
        }
    },

    train_charm: {
        name: '形象管理', category: 'train', icon: '✨',
        effectSummary: '魅力 +4，体力 -12，压力 +4',
        cooldown: 0, maxUses: Infinity, triggerType: null,
        unlock: () => true, unlockHint: '',
        apply(state) {
            state.modifyResource('money', -50000);
            state.modifyResource('stamina', -12);
            state.modifyResource('stress', 4);
            state.modifyResource('charm', 4);
        }
    },

    // ── 休息类 ─────────────────────────────────────────
    rest: {
        name: '宿舍休整', category: 'rest', icon: '🛋️',
        effectSummary: '体力 +30，压力 -20，默契 +2',
        cooldown: 0, maxUses: Infinity, triggerType: null,
        unlock: () => true, unlockHint: '',
        apply(state) {
            state.modifyResource('stamina', 30);
            state.modifyResource('stress', -20);
            state.modifyResource('bond', 2);
        }
    },

    team_vacation: {
        name: '团队疗养', category: 'rest', icon: '🏖️',
        effectSummary: '压力 -40，体力 +30，默契 +5',
        cooldown: 0, maxUses: Infinity, triggerType: 'stress',
        unlock: (state) => state.stress >= 70,
        unlockHint: '团队压力达到 70 时出现',
        apply(state) {
            state.modifyResource('money', -100000);
            state.modifyResource('stress', -40);
            state.modifyResource('stamina', 30);
            state.modifyResource('bond', 5);
        }
    },

    // ── 演出类 ─────────────────────────────────────────
    gig_small: {
        name: '小型商演', category: 'perform', icon: '🎪',
        effectSummary: '收入 ~8万，粉丝 +500，体力 -20',
        cooldown: 0, maxUses: Infinity, triggerType: null,
        unlock: () => true, unlockHint: '',
        apply(state) {
            state.modifyResource('money', -20000);
            state.modifyResource('stamina', -20);
            state.modifyResource('stress', 15);
            const sr = Math.min(1.0, (state.vocal + state.dance + state.charm) / 300);
            state.modifyResource('money', Math.round(80000 + state.fans * 0.05 * sr));
            state.modifyResource('fans', Math.round(500 * sr));
        }
    },

    gig_medium: {
        name: '中型演唱会', category: 'perform', icon: '🏟️',
        effectSummary: '收入 ~40万，粉丝 +8,000，体力 -30',
        cooldown: 8, maxUses: Infinity, triggerType: null,
        unlock: (state) => state.fans >= 150000,
        unlockHint: '需要粉丝 ≥ 150,000',
        apply(state) {
            state.modifyResource('money', -150000);
            state.modifyResource('stamina', -30);
            state.modifyResource('stress', 20);
            const sr = Math.min(1.0, (state.vocal + state.dance + state.charm) / 300);
            state.modifyResource('money', Math.round(400000 + state.fans * 0.1 * sr));
            state.modifyResource('fans', Math.round(8000 * sr));
        }
    },

    gig_large: {
        name: '大型演唱会', category: 'perform', icon: '🌟',
        effectSummary: '收入 ~150万，粉丝 +30,000，体力 -40',
        cooldown: 12, maxUses: Infinity, triggerType: null,
        unlock: (state) => state.fans >= 500000,
        unlockHint: '需要粉丝 ≥ 500,000',
        apply(state) {
            state.modifyResource('money', -600000);
            state.modifyResource('stamina', -40);
            state.modifyResource('stress', 30);
            const sr = Math.min(1.0, (state.vocal + state.dance + state.charm) / 300);
            state.modifyResource('money', Math.round(1500000 + state.fans * 0.15 * sr));
            state.modifyResource('fans', Math.round(30000 * sr));
        }
    },

    world_tour: {
        name: '世界巡演', category: 'perform', icon: '🌍',
        effectSummary: '粉丝 +20万，收入 +300万，压力 +40（一次性）',
        cooldown: 0, maxUses: 1, triggerType: null,
        unlock: (state) => state.fans >= 800000,
        unlockHint: '需要粉丝 ≥ 800,000',
        apply(state) {
            state.modifyResource('money', -2000000);
            state.modifyResource('stamina', -50);
            state.modifyResource('stress', 40);
            const sr = Math.min(1.0, (state.vocal + state.dance + state.charm) / 300);
            state.modifyResource('fans', Math.round(200000 * sr));
            state.modifyResource('money', Math.round(3000000 * sr));
        }
    },

    emergency_gig: {
        name: '紧急接单', category: 'perform', icon: '⚡',
        effectSummary: '收入 +6万，压力 +15，默契 -5',
        cooldown: 0, maxUses: Infinity, triggerType: 'budget',
        unlock: (state) => state.money < 50000,
        unlockHint: '资金低于 5万时出现',
        apply(state) {
            state.modifyResource('stamina', -25);
            state.modifyResource('stress', 15);
            state.modifyResource('bond', -5);
            state.modifyResource('money', 60000);
            state.modifyResource('fans', 200);
        }
    },

    // ── 活动类 ─────────────────────────────────────────
    fan_meeting: {
        name: '粉丝见面会', category: 'activity', icon: '🤝',
        effectSummary: '粉丝 +15,000，默契 +8，体力 -15',
        cooldown: 4, maxUses: Infinity, triggerType: null,
        unlock: (state) => state.fans >= 50000,
        unlockHint: '需要粉丝 ≥ 50,000',
        apply(state) {
            state.modifyResource('money', -30000);
            state.modifyResource('stamina', -15);
            state.modifyResource('stress', 5);
            state.modifyResource('fans', 15000);
            state.modifyResource('bond', 8);
        }
    },

    variety_show: {
        name: '综艺录制', category: 'activity', icon: '📺',
        effectSummary: '粉丝 +25,000，魅力 +3，体力 -20',
        cooldown: 6, maxUses: Infinity, triggerType: null,
        unlock: (state) => state.charm >= 25,
        unlockHint: '需要魅力 ≥ 25',
        apply(state) {
            state.modifyResource('money', -50000);
            state.modifyResource('stamina', -20);
            state.modifyResource('stress', 10);
            state.modifyResource('fans', 25000);
            state.modifyResource('charm', 3);
        }
    },

    mv_shoot: {
        name: 'MV拍摄', category: 'activity', icon: '🎬',
        effectSummary: '粉丝 +20,000，舞蹈 +5，体力 -25',
        cooldown: 6, maxUses: Infinity, triggerType: null,
        unlock: (state) => state.dance >= 25 && (state.actionUseCounts['record_single'] || 0) > 0,
        unlockHint: '需要舞蹈 ≥ 25 且已发布过单曲',
        apply(state) {
            state.modifyResource('money', -80000);
            state.modifyResource('stamina', -25);
            state.modifyResource('stress', 15);
            state.modifyResource('fans', 20000);
            state.modifyResource('dance', 5);
        }
    },

    record_single: {
        name: '发布单曲', category: 'activity', icon: '🎵',
        effectSummary: '粉丝 +40,000，唱功 +3，收入 +10万',
        cooldown: 8, maxUses: 3, triggerType: null,
        unlock: (state) => state.vocal >= 20,
        unlockHint: '需要唱功 ≥ 20',
        apply(state) {
            state.modifyResource('money', -100000);
            state.modifyResource('stamina', -20);
            state.modifyResource('stress', 20);
            state.modifyResource('fans', 40000);
            state.modifyResource('vocal', 3);
            state.modifyResource('money', 100000);
        }
    },

    album_release: {
        name: '发行专辑', category: 'activity', icon: '💿',
        effectSummary: '粉丝 +12万，全属性 +5，收入 +50万',
        cooldown: 16, maxUses: 2, triggerType: null,
        unlock: (state) => (state.vocal + state.dance + state.charm) >= 75,
        unlockHint: '需要唱功+舞蹈+魅力合计 ≥ 75',
        apply(state) {
            state.modifyResource('money', -500000);
            state.modifyResource('stamina', -30);
            state.modifyResource('stress', 25);
            state.modifyResource('fans', 120000);
            state.modifyResource('vocal', 5);
            state.modifyResource('dance', 5);
            state.modifyResource('charm', 5);
            state.modifyResource('money', 500000);
        }
    },

    brand_collab: {
        name: '小型品牌合作', category: 'activity', icon: '🎀',
        effectSummary: '收入 +30万，魅力 +5，压力 +10',
        cooldown: 8, maxUses: Infinity, triggerType: null,
        unlock: (state) => state.charm >= 35 && state.fans >= 100000,
        unlockHint: '需要魅力 ≥ 35 且粉丝 ≥ 100,000',
        apply(state) {
            state.modifyResource('money', -50000);
            state.modifyResource('stamina', -15);
            state.modifyResource('stress', 10);
            state.modifyResource('charm', 5);
            state.modifyResource('money', 300000);
        }
    },

    award_ceremony: {
        name: '颁奖典礼', category: 'activity', icon: '🏆',
        effectSummary: '粉丝 +8万，全属性 +8，默契 +10',
        cooldown: 12, maxUses: Infinity, triggerType: null,
        unlock: (state) => state.fans >= 300000 && state.vocal >= 30 && state.dance >= 30 && state.charm >= 30,
        unlockHint: '需要粉丝 ≥ 300,000 且唱功/舞蹈/魅力均 ≥ 30',
        apply(state) {
            state.modifyResource('money', -100000);
            state.modifyResource('stamina', -20);
            state.modifyResource('fans', 80000);
            state.modifyResource('vocal', 8);
            state.modifyResource('dance', 8);
            state.modifyResource('charm', 8);
            state.modifyResource('bond', 10);
        }
    },

    disbandment_crisis: {
        name: '解散危机应对', category: 'rest', icon: '🆘',
        effectSummary: '默契 +30，压力 -10，资金 -20万',
        cooldown: 0, maxUses: Infinity, triggerType: 'bond',
        unlock: (state) => state.bond <= 10,
        unlockHint: '团队默契极低时出现',
        apply(state) {
            state.modifyResource('money', -200000);
            state.modifyResource('bond', 30);
            state.modifyResource('stress', -10);
        }
    },

    team_bonding: {
        name: '团建活动', category: 'rest', icon: '🎭',
        effectSummary: '默契 +15，压力 -10，体力 +5',
        cooldown: 3, maxUses: Infinity, triggerType: null,
        unlock: () => true, unlockHint: '',
        apply(state) {
            state.modifyResource('money', -50000);
            state.modifyResource('bond', 15);
            state.modifyResource('stress', -10);
            state.modifyResource('stamina', 5);
        }
    },

    meditation: {
        name: '冥想减压', category: 'rest', icon: '🧘',
        effectSummary: '压力 -25，体力 +20（压力 ≥40 解锁）',
        cooldown: 2, maxUses: Infinity, triggerType: null,
        unlock: (state) => state.stress >= 40,
        unlockHint: '团队压力达到 40 时解锁',
        apply(state) {
            state.modifyResource('money', -30000);
            state.modifyResource('stress', -25);
            state.modifyResource('stamina', 20);
        }
    }
};
