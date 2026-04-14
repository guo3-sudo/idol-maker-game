# 动态行程系统设计文档

**日期：** 2026-04-14  
**项目：** 燃烧吧！制作人（idol-maker-game）

---

## 背景与目标

现有行程系统仅有5个固定行程，每周通过下拉框选择3个，缺乏变化和成长感。本次改造目标：

1. 将行程扩展为18个，按解锁条件分级
2. UI 从下拉框改为平铺卡片，每周展示6张，玩家多选
3. 引入频控机制（冷却/限次/一次性/触发型）
4. 初期2个选择槽，粉丝达5万后解锁第3槽

---

## 行程库（18个）

### 类别与频控说明

| 类别 | key | 名称 | 解锁条件 | 频控 |
|------|-----|------|----------|------|
| 训练 | `train_vocal` | 声乐训练 | 始终可用 | 无限 |
| 训练 | `train_dance` | 舞蹈训练 | 始终可用 | 无限 |
| 训练 | `train_charm` | 形象管理 | 始终可用 | 无限 |
| 休息 | `rest` | 宿舍休整 | 始终可用 | 无限 |
| 演出 | `gig_small` | 小型商演 | 始终可用 | 无限 |
| 活动 | `fan_meeting` | 粉丝见面会 | 粉丝 ≥ 50,000 | 4周冷却 |
| 活动 | `variety_show` | 综艺录制 | charm ≥ 25 | 6周冷却 |
| 活动 | `mv_shoot` | MV拍摄 | dance ≥ 25 且已发布过单曲 | 6周冷却 |
| 活动 | `record_single` | 发布单曲 | vocal ≥ 20 | 全局 ≤ 3次，间隔 ≥ 8周 |
| 活动 | `album_release` | 发行专辑 | vocal+dance+charm ≥ 75 | 全局 ≤ 2次，间隔 ≥ 16周 |
| 演出 | `gig_medium` | 中型演唱会 | 粉丝 ≥ 150,000 | 8周冷却 |
| 活动 | `brand_collab` | 小型品牌合作 | charm ≥ 35 且粉丝 ≥ 100,000 | 8周冷却 |
| 演出 | `gig_large` | 大型演唱会 | 粉丝 ≥ 500,000 | 12周冷却 |
| 活动 | `award_ceremony` | 颁奖典礼 | 粉丝 ≥ 300,000 且 vocal/dance/charm 均 ≥ 30 | 12周冷却 |
| 演出 | `world_tour` | 世界巡演 | 粉丝 ≥ 800,000 | 一次性（全局仅1次）|
| 休息 | `team_vacation` | 团队疗养 | stress ≥ 70 | 触发型 |
| 演出 | `emergency_gig` | 紧急接单 | 资金 < 50,000 | 触发型 |
| 活动 | `disbandment_crisis` | 解散危机应对 | bond ≤ 10 | 触发型 |

### 行程效果设计（关键数值）

**演出收入梯度：**
| 演出 | 收入（基准） | 粉丝增长 | 成本 |
|------|------------|---------|------|
| 小型商演 | 80,000 | +500 | 20,000 |
| 中型演唱会 | 400,000 | +8,000 | 150,000 |
| 大型演唱会 | 1,500,000 | +30,000 | 600,000 |
| 世界巡演 | 5,000,000 | +200,000 | 2,000,000 |

**活动效果（关键）：**
- `fan_meeting`：粉丝 +15,000（平铺），bond +8
- `variety_show`：粉丝 +25,000，charm +3
- `mv_shoot`：粉丝 +20,000，dance +5，需要已有 `record_single` 使用记录
- `record_single`：粉丝 +40,000，vocal +3，收入 +100,000
- `album_release`：粉丝 +120,000，全属性 +5，收入 +500,000
- `brand_collab`：收入 +300,000，charm +5（注意：区别于事件系统里的"品牌代言"大合同）
- `award_ceremony`：粉丝 +80,000，全属性 +8，bond +10
- `world_tour`：一次性巅峰事件，触发专属结局动画
- `team_vacation`：stress -40，stamina +30（危机专属恢复）
- `emergency_gig`：收入 +60,000，stress +15，bond -5（迫不得已的低质接单）
- `disbandment_crisis`：bond +30，成本 -200,000（花钱救队伍）

---

## UI 设计

### 卡片布局

- 每周展示 **6张行程卡片**，替换现有下拉框
- 卡片网格布局（2列×3行 或 3列×2行，根据屏幕自适应）
- 每张卡片显示：行程名、类别图标、关键效果预览（如"粉丝 +15,000"）

### 卡片状态

| 状态 | 视觉 | 可选 |
|------|------|------|
| 可选 | 正常显示，hover 高亮 | ✅ |
| 已选中 | 高亮边框 + 勾选标记 | 可取消 |
| 未解锁（locked） | 灰色 + 锁图标 + 解锁条件提示 | ❌ |
| 冷却中（cooldown） | 灰色 + "X周后可用" | ❌ |

**灰色卡片合并规则：** 未解锁和冷却中共享"最多2张"的限额，不区分显示。

### 卡片池构建规则（每回合）

1. 按类别保底：训练类1张 + 演出类1张 + 活动类1张 + 休息类1张（共4张可选项）
2. 补充随机2张可选行程（从剩余可选中随机）
3. 若可选行程不足6张，则从未解锁/冷却行程中补充，最多补2张灰色卡
4. 触发型行程（`team_vacation`、`emergency_gig`、`disbandment_crisis`）：条件满足时强制替换1张普通卡片出现

### 选择槽位

- 初始：每周可选 **2个行程**
- 粉丝首次达到 50,000 时：解锁第3槽，显示专属提示（仅提示一次，由 `slotUnlockAnnounced` 标记控制）
- 已选满时，继续点击其他卡片需先取消一个已选项

---

## 数据结构变更

### GameState 新增字段

```js
// actions.js 每个行程新增字段
{
  key: 'fan_meeting',
  name: '粉丝见面会',
  category: 'activity',           // 'train' | 'perform' | 'activity' | 'rest'
  cooldown: 4,                    // 冷却周数（0表示无冷却）
  maxUses: Infinity,              // 全局最多使用次数
  minInterval: 0,                 // 两次使用最短间隔（周）
  oneTime: false,                 // 是否一次性
  triggerType: null,              // null | 'stress' | 'budget' | 'bond'
  unlock(state) { ... },          // 解锁条件函数
  unlockHint: '需要粉丝 ≥ 50,000', // 解锁提示文字
  apply(state) { ... },           // 执行效果
}

// state.js 新增
actionCooldowns: {},      // { [actionKey]: weeksRemaining }
actionUseCounts: {},      // { [actionKey]: totalTimesUsed }
actionLastUsed: {},       // { [actionKey]: weekNumber }
scheduleSlots: 2,         // 当前可选槽位数（2 或 3）
slotUnlockAnnounced: false, // 第3槽解锁提示是否已显示
```

---

## 实现涉及文件

| 文件 | 改动内容 |
|------|---------|
| `js/actions.js` | 全部重写，扩展为18个行程，新增频控字段 |
| `js/state.js` | 新增 `actionCooldowns`、`actionUseCounts`、`actionLastUsed`、`scheduleSlots`、`slotUnlockAnnounced` |
| `js/engine.js` | 新增 `buildSchedulePool(state)` 方法，处理频控递减、触发型检测、执行后更新冷却/计数 |
| `js/ui.js` | 全部重写行程 UI：卡片渲染、多选逻辑、灰色状态、槽位提示 |
| `js/main.js` | 移除旧下拉框初始化，接入新卡片 UI |
| `css/style.css` | 新增行程卡片样式（grid、locked、cooldown、selected 状态） |
| `index.html` | 替换行程区域 HTML 结构 |
