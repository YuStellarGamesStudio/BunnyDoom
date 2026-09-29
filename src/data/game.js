const text = (en, zh, ja) => ({ en, zh, ja });

export const CONFIG = Object.freeze({
  boardWidth: 960,
  boardHeight: 540,
  holes: Object.freeze(Array.from({ length: 9 }, (_, i) => Object.freeze({
    x: 300 + (i % 3) * 180, y: 170 + Math.floor(i / 3) * 135,
  }))),
  countdown: 3,
  rising: 0.25,
  falling: 0.2,
  hazardWarning: 0.3,
  hitRadius: 60,
  pickupRadius: 40,
  spawnInterval: 0.57,
  firstSpawn: 0.35,
  targetBase: 3000,
  targetGrowth: 1.08,
  normalEquipmentSlots: 2,
  extraEquipmentSlots: 1,
  goldGuarantee: Object.freeze([3, 11, 19, 27]),
  goldCharge: 25,
  specialCost: 100,
  specialCapacity: 100,
  bossHitSkillFactor: 1.25,
  silverSkillWeight: 1.15,
  comboStar: 30,
  missesStar: 2,
  specialDamage: 10,
  bossHitDamage: 1,
  specialScore: 300,
  baseScore: 100,
  rareScore: 300,
  comboStep: 0.04,
  comboLimit: 50,
  timeBonus: 50,
  silverTime: 3,
  hazardPenalty: 200,
  bombTime: 5,
  fakeShrinkDuration: 3,
  fakeShrinkFactor: 1.2,
  dropRate: 0.05,
  dropCap: 0.12,
  pickupLifetime: 4,
  pickupLimit: 2,
  buffDuration: 10,
  clockTime: 5,
  freezeStay: 1.5,
  slapRadius: 1.5,
  magnetSilver: 2,
  hitEquipmentRadius: 1.1,
  hitSkillRadius: 1.15,
  collarDrop: 1.15,
  skillDrop: 1.2,
  bootsStay: 0.15,
  skillStay: 0.2,
  normalSkillScore: 1.1,
  criticalChance: 0.12,
  criticalScore: 2,
  goldSkillCharge: 1.25,
  specialSkillDamage: 1.3,
  specialSkillFreeze: 2,
  specialSkillBoost: 5,
  specialSkillBoostFactor: 1.5,
  comboInsurance: 1,
  secondChanceTime: 10,
  bossSizes: Object.freeze([3, 4, 4, 5, 5, 5]),
  bossCycleEarly: 8,
  bossCycleLate: 5,
  bossRageTime: 180,
  bossRageCycle: 2,
  bossSpeedDuration: 5,
  bossSpeedFactor: 0.7,
  bossDecoyDuration: 3,
  bossObstacleWarning: 0.8,
  bossObstacleDuration: 2,
  bossRageStayFactor: 0.7,
  bossRespawn: 0.45,
});

export const WORLDS = Object.freeze([
  { id: 0, name: text('Tokyo Neon', '東京霓虹', 'ネオン東京'), bossName: text('Ramen King', '拉麵兔王', 'ラーメン王'), color: '#ef58bc', stay: 1.6, limit: 2, specialRate: 0.08, hazardRate: 0.05, factor: 1, duration: 60, hp: 100 },
  { id: 1, name: text('Paris Twilight', '巴黎黃昏', '夕暮れのパリ'), bossName: text('Croissant King', '可頌兔王', 'クロワッサン王'), color: '#efaa65', stay: 1.45, limit: 3, specialRate: 0.08, hazardRate: 0.08, factor: 1.4, duration: 60, hp: 140 },
  { id: 2, name: text('New York Daylight', '紐約白晝', '昼下がりのニューヨーク'), bossName: text('Liberty King', '自由兔王', '自由の王'), color: '#56b8dc', stay: 1.3, limit: 3, specialRate: 0.09, hazardRate: 0.1, factor: 1.9, duration: 75, hp: 180 },
  { id: 3, name: text('Cairo Sands', '開羅沙金', 'カイロの砂金'), bossName: text('Pharaoh King', '法老兔王', 'ファラオ王'), color: '#e6b954', stay: 1.15, limit: 4, specialRate: 0.09, hazardRate: 0.12, factor: 2.5, duration: 75, hp: 220 },
  { id: 4, name: text('Antarctic Ice', '南極冰原', '南極の氷原'), bossName: text('Penguin King', '企鵝兔王', 'ペンギン王'), color: '#86d9eb', stay: 1.05, limit: 4, specialRate: 0.1, hazardRate: 0.15, factor: 3.2, duration: 90, hp: 260 },
  { id: 5, name: text('Lunar Frontier', '月球邊疆', '月の辺境'), bossName: text('Moon King', '月球兔王', '月面王'), color: '#ab9aed', stay: 0.95, limit: 5, specialRate: 0.1, hazardRate: 0.18, factor: 4, duration: 90, hp: 320 },
]);

export const STORY = Object.freeze([
  {
    intro: [text('Tokyo fell before anyone could finish their noodles.', '東京在大家吃完拉麵前就淪陷了。', '東京はラーメンを食べ終える前に陥落した。'),
      text('The neon signs now read: HOP OR ELSE.', '霓虹招牌現在只寫著：不跳就完蛋。', 'ネオンには「跳べ、さもなくば」と光っている。')],
    bossBefore: text('Ramen King, put down that planet-sized noodle bowl!', '拉麵兔王，放下那碗行星大小的拉麵！', 'ラーメン王、惑星サイズのどんぶりを置け！'),
    bossAfter: text('Tokyo is free. The noodles are still warm.', '東京自由了，拉麵還是熱的。', '東京は自由だ。ラーメンはまだ温かい。'),
  },
  {
    intro: [text('Paris has surrendered its bakeries to fluffy invaders.', '巴黎的麵包店全被毛茸茸的入侵者占領了。', 'パリのパン屋はふわふわの侵略者に奪われた。'),
      text('The last dog in town refuses to share a croissant.', '全城最後一隻狗，絕不分出半塊可頌。', '街に残った最後の犬は、クロワッサンを譲らない。')],
    bossBefore: text('Croissant King! That pastry is not a crown.', '可頌兔王！可頌不是王冠啦。', 'クロワッサン王！ そのパンは王冠じゃない！'),
    bossAfter: text('The city of lights sparkles again. So do the crumbs.', '花都重拾光彩，麵包屑也一樣閃亮。', '光の都に輝きが戻った。パンくずにも。'),
  },
  {
    intro: [text('New York taxis now stop for crossing rabbits.', '紐約計程車現在都得讓兔子過馬路。', 'ニューヨークのタクシーはウサギの横断を待っている。'),
      text('Our hero orders a bark to go—extra loud.', '英雄點了一聲外帶汪汪，還要特大聲。', 'ヒーローは吠え声をテイクアウト。特大サイズだ。')],
    bossBefore: text('Liberty King, that torch is for everyone!', '自由兔王，那支火炬是大家的！', '自由の王、そのたいまつは皆のものだ！'),
    bossAfter: text('The city never sleeps, and neither do these paws.', '不夜城重獲自由，肉球也沒閒著。', '眠らない街に自由が戻った。肉球も休まない。'),
  },
  {
    intro: [text('Cairo hides an ancient secret beneath the sand.', '開羅的沙丘底下藏著古老的祕密。', 'カイロの砂の下には古代の秘密が眠る。'),
      text('It turns out the secret has very long ears.', '原來那個祕密長了兩隻超長耳朵。', '秘密の正体には、とても長い耳があった。')],
    bossBefore: text('Pharaoh King, history does not belong in a burrow!', '法老兔王，歷史不是給你挖洞用的！', 'ファラオ王、歴史に穴を掘るな！'),
    bossAfter: text('The pyramids stand tall. The rabbit throne does not.', '金字塔依舊屹立，兔王寶座可沒這麼幸運。', 'ピラミッドはそびえ立つ。ウサギの玉座は倒れた。'),
  },
  {
    intro: [text('Antarctica is cold. The rabbit army brought mittens.', '南極很冷，兔子軍團還帶了手套。', '南極は寒い。ウサギ軍は手袋を持参した。'),
      text('Our Pomeranian brought a warmer heart—and a faster paw.', '博美帶來更熱的心，還有更快的爪。', 'ポメラニアンは熱い心と、もっと速い前足を持ってきた。')],
    bossBefore: text('Penguin King, even your tuxedo cannot save you!', '企鵝兔王，燕尾服也救不了你！', 'ペンギン王、そのタキシードでも逃げられない！'),
    bossAfter: text('The ice is safe. Someone fetch a hot cocoa.', '冰原安全了，快端熱可可來！', '氷原は平和だ。ホットココアを頼む！'),
  },
  {
    intro: [text('The rabbits have reached the moon. So has one very determined dog.', '兔子登上了月球，一隻不肯認輸的狗也跟來了。', 'ウサギは月に到達した。負けず嫌いの犬もだ。'),
      text('One small step for a paw. One giant smack for dogkind.', '肉球的一小步，狗狗們揍兔的一大步。', '肉球の小さな一歩。犬類の大きな一撃。')],
    bossBefore: text('Moon King! Time to end this hare-raising invasion.', '月球兔王！這場驚兔之旅該結束了。', '月面王！ このウサギ騒動を終わらせよう。'),
    bossAfter: text('Earth is saved! The hero requests a nap and six treats.', '地球得救了！英雄想睡午覺，再來六份零食。', '地球は救われた！ 英雄は昼寝とおやつ六個を希望。'),
  },
]);

export const SKILLS = Object.freeze([
  { id: 'A1', branch: 'A', cost: 1, name: text('Iron Jaw', '鋼鐵下巴', '鋼鉄のあご'), description: text('Hit radius +15%.', '判定範圍 +15%。', '命中範囲 +15%。') },
  { id: 'A2', branch: 'A', cost: 1, name: text('Expert Extraction', '專業拔牙', 'プロの抜歯'), description: text('Normal rabbit score +10%.', '普通兔得分 +10%。', '通常ウサギの得点 +10%。') },
  { id: 'A3', branch: 'A', cost: 2, name: text('Heavenly Bite', '一口上天堂', '天国へのひと噛み'), description: text('12% chance for double score on hits.', '命中有 12% 機率得分加倍。', '命中時12%の確率で得点2倍。') },
  { id: 'A4', branch: 'A', cost: 2, name: text('Rabbit Reflex Delay', '兔子的反射弧', 'ウサギの反射遅延'), description: text('Rabbits stay up 0.2 seconds longer.', '兔子停留延長 0.2 秒。', 'ウサギの出現時間 +0.2 秒。') },
  { id: 'A5', branch: 'A', cost: 3, name: text('Kings Beware', '兔王也會怕', '王様だって怖い'), description: text('Boss hit damage +25%.', '對兔王單次傷害 +25%。', 'ボスへの一撃のダメージ +25%。') },
  { id: 'B1', branch: 'B', cost: 1, name: text('Lung Training', '肺活量訓練', '肺活量トレーニング'), description: text('Gold rabbit charge gain ×1.25.', '金兔計量獲得量 ×1.25。', '金ウサギのチャージ獲得量 ×1.25。') },
  { id: 'B2', branch: 'B', cost: 1, name: text('Double Volume', '雙倍音量', '声量2倍'), description: text('Store up to two specials.', '必殺技可存兩格。', '必殺技を2回分まで蓄積。') },
  { id: 'B3', branch: 'B', cost: 2, name: text('Mega Marshmallow', '加大版棉花糖', '巨大マシュマロ'), description: text('Special score and boss damage +30%.', '必殺得分和兔王傷害 +30%。', '必殺技の得点・ボスダメージ +30%。') },
  { id: 'B4', branch: 'B', cost: 2, name: text('Time, Stop!', '時間停止！', '時よ止まれ！'), description: text('Specials stop time and enemies for 2 seconds; you can still hit.', '必殺後時間與敵人凍結 2 秒，可繼續打擊。', '必殺技後2秒間、時間と敵が停止。攻撃は可能。') },
  { id: 'B5', branch: 'B', cost: 3, name: text('Doomsday Bark', '末日咆哮', '終末の咆哮'), description: text('Score ×1.5 for 5 seconds after a special.', '必殺後 5 秒得分 ×1.5。', '必殺技後5秒間、得点 ×1.5。') },
  { id: 'C1', branch: 'C', cost: 1, name: text('Doggy Instinct', '汪的直覺', 'わんこの直感'), description: text('Once per run, a missed rabbit keeps your combo.', '每局一次漏兔保住連擊。', '各ステージ1回、見逃してもコンボを維持。') },
  { id: 'C2', branch: 'C', cost: 1, name: text('Treasure Sniffer', '撿到寶', 'お宝の鼻'), description: text('Pickup drop chance ×1.2.', '道具掉落率 ×1.2。', 'アイテム出現率 ×1.2。') },
  { id: 'C3', branch: 'C', cost: 2, name: text("Mom's Backpack", '媽媽的背包', 'ママのリュック'), description: text('Carry three pieces of equipment instead of two.', '出發可帶三件而非兩件裝備。', '装備枠が2個から3個に増加。') },
  { id: 'C4', branch: 'C', cost: 2, name: text('Silver Moonlight', '銀色月光', '銀の月光'), description: text('Relative silver rabbit spawn weight +15%.', '銀兔出現權重相對增加 15%。', '銀ウサギの出現比率 +15%。') },
  { id: 'C5', branch: 'C', cost: 3, name: text('Main Character Energy', '主角威能', '主人公補正'), description: text('Once per run, when time runs out, gain 10 seconds.', '每局一次，時間耗盡時回復 10 秒。', '各ステージ1回、時間切れで10秒回復。') },
]);

export const EQUIPMENT = Object.freeze([
  { id: 'gloves', name: text('Tactical Gloves', '戰術手套', 'タクティカル手袋'), description: text('Hit radius +10%.', '判定範圍 +10%。', '命中範囲 +10%。') },
  { id: 'collar', name: text('Lucky Collar', '幸運項圈', '幸運の首輪'), description: text('Pickup drop chance ×1.15.', '道具掉落率 ×1.15。', 'アイテム出現率 ×1.15。') },
  { id: 'boots', name: text('Swift Boots', '疾風靴', '疾風のブーツ'), description: text('Rabbits stay up 0.15 seconds longer.', '兔子停留延長 0.15 秒。', 'ウサギの出現時間 +0.15 秒。') },
  { id: 'battery', name: text('Charge Battery', '蓄能電池', 'チャージ電池'), description: text('Start with 25 special charge.', '開局必殺計量 +25。', '開始時の必殺チャージ +25。') },
]);

export const ITEMS = Object.freeze([
  { id: 'clock', weight: 30, name: text('Clock', '時鐘', '時計'), description: text('Gain 5 seconds.', '時間 +5 秒。', '時間 +5 秒。') },
  { id: 'freeze', weight: 20, name: text('Frost', '冰凍', '氷結'), description: text('Rabbits stay 1.5 seconds longer for 10 seconds.', '10 秒內兔子停留延長 1.5 秒。', '10秒間ウサギの出現時間 +1.5 秒。') },
  { id: 'bone', weight: 20, name: text('Bone', '骨頭', '骨'), description: text('Misses cannot break combo for 10 seconds.', '10 秒內漏兔不斷連。', '10秒間、見逃してもコンボを維持。') },
  { id: 'magnet', weight: 15, name: text('Magnet', '磁鐵', '磁石'), description: text('Silver rabbit weight doubles for 10 seconds.', '10 秒內銀兔權重加倍。', '10秒間、銀ウサギの出現比率2倍。') },
  { id: 'slap', weight: 15, name: text('Power Slap', '拍拍樂', 'パワービンタ'), description: text('Hit radius ×1.5 for 10 seconds.', '10 秒內判定範圍 ×1.5。', '10秒間、命中範囲 ×1.5。') },
]);

// Unlock gates are cumulative stars, completed worlds, and lifetime SP earned.
const cosmetic = (id, slot, name, type, value, color) => ({ id, slot, name, requirement: { type, value }, color });
export const COSMETICS = Object.freeze([
  cosmetic('star-cap', 'hat', text('Starlight Cap', '星光帽', '星明かりの帽子'), 'stars', 10, '#ffe093'),
  cosmetic('sailor-cap', 'hat', text('Sailor Cap', '水手帽', '水兵帽'), 'world', 1, '#80c8f3'),
  cosmetic('chef-hat', 'hat', text("Chef's Toque", '主廚帽', 'シェフ帽'), 'sp', 10, '#fff1de'),
  cosmetic('beret', 'hat', text('Twilight Beret', '暮光貝雷帽', '夕暮れのベレー帽'), 'stars', 40, '#c47bb8'),
  cosmetic('pharaoh-crown', 'hat', text('Desert Crown', '沙漠王冠', '砂漠の冠'), 'world', 4, '#f4ce59'),
  cosmetic('moon-helmet', 'hat', text('Moon Helmet', '月球頭盔', '月面ヘルメット'), 'sp', 50, '#d6ddf4'),
  cosmetic('hero-cape', 'outfit', text('Hero Cape', '英雄披風', 'ヒーローマント'), 'stars', 20, '#ee6480'),
  cosmetic('bistro-vest', 'outfit', text('Bistro Vest', '小酒館背心', 'ビストロのベスト'), 'world', 2, '#b6785b'),
  cosmetic('raincoat', 'outfit', text('Sunny Raincoat', '陽光雨衣', 'おひさまレインコート'), 'sp', 20, '#f8c454'),
  cosmetic('denim', 'outfit', text('City Denim', '城市丹寧', '都会のデニム'), 'stars', 50, '#7299d3'),
  cosmetic('parka', 'outfit', text('Polar Parka', '極地大衣', '極地のパーカ'), 'world', 5, '#9ed9e8'),
  cosmetic('spacesuit', 'outfit', text('Rocket Suit', '火箭太空衣', 'ロケットスーツ'), 'sp', 60, '#b6a3ee'),
  cosmetic('ribbon', 'collar', text('Rose Ribbon', '玫瑰緞帶', 'バラのリボン'), 'stars', 30, '#f589a2'),
  cosmetic('medal', 'collar', text('Victory Medal', '勝利勳章', '勝利のメダル'), 'world', 3, '#eaca64'),
  cosmetic('bell', 'collar', text('Golden Bell', '金色鈴鐺', '黄金の鈴'), 'sp', 30, '#f2d16e'),
  cosmetic('crystal', 'collar', text('Crystal Charm', '水晶墜飾', '水晶のお守り'), 'stars', 60, '#95d6eb'),
  cosmetic('star-necklace', 'collar', text('Cosmic Necklace', '宇宙項鍊', '宇宙の首飾り'), 'world', 6, '#d8b5fb'),
  cosmetic('royal', 'collar', text('Royal Collar', '王室項圈', '王家の首輪'), 'sp', 70, '#f4b4df'),
  cosmetic('sparkle', 'effect', text('Sparkling Paws', '閃亮肉球', 'きらめく肉球'), 'stars', 70, '#ffe69c'),
  cosmetic('neon', 'effect', text('Neon Trail', '霓虹殘影', 'ネオンの軌跡'), 'world', 1, '#ee75d4'),
  cosmetic('petals', 'effect', text('Petal Shower', '花瓣雨', '花びらの雨'), 'sp', 40, '#f8a9c5'),
  cosmetic('snow', 'effect', text('Snow Flurry', '飄雪', '粉雪'), 'stars', 80, '#bdeaf5'),
  cosmetic('comets', 'effect', text('Comet Tail', '彗星之尾', '彗星の尾'), 'world', 6, '#b3a7f4'),
  cosmetic('rainbow', 'effect', text('Rainbow Burst', '彩虹爆發', '虹色の閃光'), 'sp', 80, '#f6a9de'),
]);

export function getLevel(id) {
  if (!Number.isInteger(id) || id < 1 || id > 60) throw new RangeError('Level must be an integer from 1 to 60');
  const world = Math.floor((id - 1) / 10);
  const number = (id - 1) % 10 + 1;
  const data = WORLDS[world];
  return {
    id, world, number, boss: number === 10,
    target: Math.round(CONFIG.targetBase * data.factor * CONFIG.targetGrowth ** (number - 1) / 100) * 100,
    duration: data.duration,
  };
}
