// js/events.js
export const EVENT_POOL = [
    {
        id: 'e_romance',
        title: '📸 恋情疑云',
        desc: '人气成员被狗仔拍到深夜与异性出行，照片模糊但已在网络上发酵，评论区已经开始撕裂。',
        options: [
            {
                text: '💰 花钱买热搜压下去（¥50万）',
                cost: 500000,
                effect(state) {
                    state.modifyResource('stress', 10);
                    return { msg: '破财消灾，事态平息。压力略有上升。', fans: 0, money: 0 };
                }
            },
            {
                text: '📢 发声明坚称普通朋友',
                cost: 0,
                effect(state) {
                    if (Math.random() > 0.5) {
                        state.modifyResource('fans', -50000);
                        return { msg: '声明未能服众，部分粉丝脱粉。', fans: -50000, money: 0 };
                    }
                    state.modifyResource('fans', 10000);
                    return { msg: '粉丝选择相信，甚至觉得成员很真性情，微微涨粉！', fans: 10000, money: 0 };
                }
            },
            {
                text: '🙈 冷处理，静观其变',
                cost: 0,
                effect(state) {
                    state.modifyResource('fans', -100000);
                    state.modifyResource('bond', -5);
                    return { msg: '谣言持续发酵，粉丝大量脱粉，团内气氛也变差了。', fans: -100000, money: 0 };
                }
            }
        ]
    },
    {
        id: 'e_rumor',
        title: '🗡️ 恶意造谣',
        desc: '某匿名账号发帖声称掌握成员"黑料"，帖子迅速扩散，粉丝军团已组织反击，但事态仍不明朗。',
        options: [
            {
                text: '⚖️ 委托律师发律师函（¥20万）',
                cost: 200000,
                effect(state) {
                    state.modifyResource('fans', 30000);
                    return { msg: '律师函震慑了造谣者，帖子删除，粉丝为偶像的硬气疯狂打call！', fans: 30000, money: 0 };
                }
            },
            {
                text: '🎤 成员亲自发视频澄清',
                cost: 0,
                effect(state) {
                    if (Math.random() > 0.4) {
                        state.modifyResource('fans', 50000);
                        state.modifyResource('bond', 5);
                        return { msg: '真情流露的视频感动了粉丝，热度暴涨，团员感情更深了！', fans: 50000, money: 0 };
                    }
                    state.modifyResource('fans', -30000);
                    return { msg: '视频被挖出更多细节，舆情反转，粉丝大量流失。', fans: -30000, money: 0 };
                }
            },
            {
                text: '🤐 完全沉默',
                cost: 0,
                effect(state) {
                    state.modifyResource('fans', -80000);
                    return { msg: '沉默被解读为默认，粉丝心寒，大量脱粉。', fans: -80000, money: 0 };
                }
            }
        ]
    },
    {
        id: 'e_same_stage',
        title: '⚔️ 同行举报',
        desc: '竞争对手向平台举报你们的新歌涉嫌抄袭，歌曲已被临时下架，下周的综艺录制通告也面临取消风险。',
        options: [
            {
                text: '📄 提交原创证明材料（¥10万公关费）',
                cost: 100000,
                effect(state) {
                    state.modifyResource('fans', 20000);
                    state.modifyResource('stress', 15);
                    return { msg: '举报被平台驳回，反而引发同情流量，粉丝暴增！但应对过程压力很大。', fans: 20000, money: 0 };
                }
            },
            {
                text: '✏️ 主动修改并重新发布',
                cost: 0,
                effect(state) {
                    state.modifyResource('fans', -20000);
                    state.modifyResource('stress', 10);
                    return { msg: '虽然保住了通告，但被迫改歌被视为心虚，粉丝有些失望。', fans: -20000, money: 0 };
                }
            }
        ]
    },
    {
        id: 'e_internal_conflict',
        title: '💥 团内风波',
        desc: '有粉丝爆出团内某成员的私信，内容显示成员之间存在严重分歧，"解散危机"话题已冲上热搜。',
        options: [
            {
                text: '🤝 组织团建并全员联合辟谣（¥5万）',
                cost: 50000,
                effect(state) {
                    state.modifyResource('bond', 15);
                    state.modifyResource('fans', 10000);
                    return { msg: '全员联合辟谣成功，CP感拉满，粉丝安心了，团员关系也更好了！', fans: 10000, money: 0 };
                }
            },
            {
                text: '🙈 各自在社交平台假装没事',
                cost: 0,
                effect(state) {
                    state.modifyResource('bond', -20);
                    state.modifyResource('fans', -50000);
                    return { msg: '粉丝看出来了，团内气氛更加恶化，大量脱粉。', fans: -50000, money: 0 };
                }
            }
        ]
    },
    {
        id: 'e_viral_video',
        title: '🚀 意外爆款',
        desc: '成员某条随手拍的幕后视频意外在平台爆火，相关话题已有2000万播放，大量路人粉涌入。',
        options: [
            {
                text: '📱 趁热打铁追加内容（¥5万制作费）',
                cost: 50000,
                effect(state) {
                    state.modifyResource('fans', 200000);
                    return { msg: '乘胜追击效果拔群！粉丝数暴增，新专辑预售已跻身榜单前三！', fans: 200000, money: 0 };
                }
            },
            {
                text: '😊 顺其自然，不特别运营',
                cost: 0,
                effect(state) {
                    state.modifyResource('fans', 80000);
                    return { msg: '自然涨粉，热度维持了几天后逐渐平息。', fans: 80000, money: 0 };
                }
            }
        ]
    },
    {
        id: 'e_brand_offer',
        title: '💼 品牌代言邀约',
        desc: '一个知名品牌主动联系，希望签下团体作为年度代言人，合同期一年，报价丰厚但要求颇多。',
        options: [
            {
                // cost:0 here because income flows through effect() → modifyResource, not the cost deduction path
                text: '✅ 接受代言（签约 ¥+300万，但增加压力）',
                cost: 0,
                effect(state) {
                    state.modifyResource('money', 3000000);
                    state.modifyResource('stress', 20);
                    state.modifyResource('fans', 50000);
                    return { msg: '代言签约成功！品牌曝光大幅提升知名度，但行程更满了。', fans: 50000, money: 3000000 };
                }
            },
            {
                text: '❌ 婉拒，专注音乐',
                cost: 0,
                effect(state) {
                    state.modifyResource('bond', 5);
                    return { msg: '成员们对你的决定表示理解，团队凝聚力微微提升。', fans: 0, money: 0 };
                }
            }
        ]
    },
    {
        id: 'e_sasaeng',
        title: '😱 私生饭事件',
        desc: '多名私生饭在成员宿舍楼下长期蹲守，已影响到成员正常休息。相关视频流出，引发公众关注。',
        options: [
            {
                text: '🚔 报警处理并发声明（¥5万）',
                cost: 50000,
                effect(state) {
                    state.modifyResource('fans', 30000);
                    state.modifyResource('stress', -10);
                    return { msg: '警方介入，理性粉丝纷纷为偶像撑腰，健康粉丝环境获得大量好评。', fans: 30000, money: 0 };
                }
            },
            {
                text: '🤫 私下处理，不声张',
                cost: 0,
                effect(state) {
                    state.modifyResource('stress', 15);
                    return { msg: '私下解决了眼前问题，但成员压力未得到释放。', fans: 0, money: 0 };
                }
            }
        ]
    },
    {
        id: 'e_senior_collab',
        title: '🌟 前辈点赞',
        desc: '一位德高望重的业内前辈在直播中公开称赞你们的最新舞台表现，并表示希望有机会合作。',
        options: [
            {
                text: '🙏 公开回应并感谢（免费）',
                cost: 0,
                effect(state) {
                    state.modifyResource('fans', 100000);
                    state.modifyResource('charm', 2);
                    return { msg: '得体的回应让你们收获大量路人好感，知名度大幅提升！', fans: 100000, money: 0 };
                }
            },
            {
                text: '💬 私下联系，确认合作意向（¥10万）',
                cost: 100000,
                effect(state) {
                    state.modifyResource('fans', 150000);
                    state.modifyResource('vocal', 3);
                    return { msg: '合作谈判顺利！联名单曲已提上日程，属性和人气双提升！', fans: 150000, money: 0 };
                }
            }
        ]
    }
];
