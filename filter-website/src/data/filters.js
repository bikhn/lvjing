const categories = [
  { id: 'korean', name: '韩式', emoji: '🇰🇷' },
  { id: 'american', name: '美式', emoji: '🇺🇸' },
  { id: 'cute', name: '可爱', emoji: '🎀' },
  { id: 'japanese', name: '日系', emoji: '🇯🇵' },
  { id: 'film', name: '复古胶片', emoji: '📷' },
  { id: 'nature', name: '自然', emoji: '🌿' },
  { id: 'xiaohongshu', name: '小红书', emoji: '✨' },
  { id: 'trendy', name: '网红同款', emoji: '🔥' },
  { id: 'bnw', name: '黑白', emoji: '🖤' },
  { id: 'food', name: '美食', emoji: '🍜' },
  { id: 'street', name: '城市街拍', emoji: '🏙' },
]

function filterDef(name, tags, brightness, contrast, saturation, sepia, hueRotate, extra) {
  const css = { brightness, contrast, saturation, sepia, hueRotate, blur: 0 }
  return { name, tags, css, ...(extra || {}) }
}

const F = filterDef

function expandCategory(list, variants) {
  const result = []
  for (const item of list) {
    result.push(item)
    for (const v of variants) {
      const name = item.name + ' ' + v.suffix
      if (result.some(r => r.name === name)) continue
      const css = { ...item.css }
      if (v.b !== undefined) css.brightness = +Math.max(0.3, Math.min(3, css.brightness + v.b)).toFixed(2)
      if (v.c !== undefined) css.contrast = +Math.max(0.3, Math.min(3, css.contrast + v.c)).toFixed(2)
      if (v.s !== undefined) css.saturation = +Math.max(0, Math.min(3, css.saturation + v.s)).toFixed(2)
      if (v.sp !== undefined) css.sepia = +Math.min(1, Math.max(0, css.sepia + v.sp)).toFixed(2)
      if (v.h !== undefined) css.hueRotate = Math.round(css.hueRotate + v.h)
      result.push({ ...item, name, css })
    }
  }
  return result
}

function buildFilters(catId, list, prefix, targetCount) {
  let idx = 0
  const items = []
  for (const f of list) {
    items.push({
      id: `${prefix}-${String(++idx).padStart(3, '0')}`,
      name: f.name,
      category: catId,
      tags: f.tags || [],
      css: f.css,
      overlay: f.overlay || null,
      vignette: f.vignette || null,
      intensity: 1.0,
    })
  }
  while (items.length < targetCount) {
    const baseIdx = items.length % list.length
    const base = list[baseIdx]
    const tweakIdx = Math.floor(items.length / list.length) % 8
    const tweaks = [
      { b: 0.03, c: 0.02, s: 0.03, h: 2 },
      { b: -0.02, c: 0.04, s: -0.03, h: -3 },
      { b: 0.04, c: -0.01, s: 0.05, h: 1 },
      { b: -0.03, c: 0.03, s: -0.05, h: -2 },
      { b: 0.02, c: 0.05, s: 0.04, h: 3 },
      { b: 0.05, c: -0.02, s: -0.04, h: -1 },
      { b: -0.04, c: 0.04, s: 0.06, h: 4 },
      { b: 0.03, c: -0.03, s: 0.02, h: -2 },
    ]
    const tw = tweaks[tweakIdx]
    const suffixes = ['暖', '冷', 'Pro', 'Air', '+', 'Lite', 'Max', '']
    const name = base.name + ' ' + suffixes[tweakIdx]
    if (items.some(o => o.name === name)) continue

    const css = {
      brightness: +Math.max(0.3, Math.min(3, base.css.brightness + tw.b)).toFixed(2),
      contrast: +Math.max(0.3, Math.min(3, base.css.contrast + tw.c)).toFixed(2),
      saturation: +Math.max(0, Math.min(3, base.css.saturation + tw.s)).toFixed(2),
      sepia: +(Math.min(1, Math.max(0, base.css.sepia + (Math.random() - 0.5) * 0.04))).toFixed(2),
      hueRotate: Math.round(base.css.hueRotate + tw.h),
      blur: 0,
    }

    items.push({
      id: `${prefix}-${String(++idx).padStart(3, '0')}`,
      name,
      category: catId,
      tags: base.tags || [],
      css,
      overlay: base.overlay || null,
      vignette: base.vignette || null,
      intensity: 1.0,
    })
  }
  return items.slice(0, targetCount)
}

const variants = {
  standard: [
    { suffix: '+', c: 0.04, s: 0.04, h: 2 },
    { suffix: 'Pro', c: 0.06, s: -0.02, h: -2 },
    { suffix: 'Lite', b: 0.04, c: -0.03, s: -0.04 },
    { suffix: 'Warm', b: 0.03, sp: 0.04, h: 4 },
    { suffix: 'Cool', b: -0.02, c: 0.03, s: -0.04, h: -4 },
    { suffix: 'Soft', c: -0.05, s: -0.05 },
  ],
  extra: [
    { suffix: '+', c: 0.04, s: 0.04, h: 2 },
    { suffix: 'Pro', c: 0.06, s: -0.02 },
    { suffix: 'Lite', b: 0.04, c: -0.03 },
    { suffix: 'Warm', b: 0.03, sp: 0.04, h: 4 },
    { suffix: 'Cool', b: -0.02, c: 0.03, s: -0.04, h: -4 },
    { suffix: 'Vivid', b: 0.03, c: 0.03, s: 0.08 },
    { suffix: 'Film', c: 0.03, s: -0.03, sp: 0.04 },
    { suffix: 'Rich', c: 0.04, s: 0.06 },
  ],
  food: [
    { suffix: '+', c: 0.04, s: 0.06, h: 3 },
    { suffix: 'Warm', b: 0.03, sp: 0.04, h: 4 },
    { suffix: 'Fresh', b: 0.06, c: -0.02, h: -3 },
    { suffix: 'Rich', b: -0.02, c: 0.04, s: 0.08 },
    { suffix: 'Light', b: 0.05, c: -0.03, s: -0.03 },
  ],
  bnw: [
    { suffix: '+', c: 0.08 },
    { suffix: 'Light', b: 0.08, c: -0.05 },
    { suffix: 'Dark', b: -0.06, c: 0.06 },
    { suffix: 'Soft', b: 0.05, c: -0.06 },
  ],
}

const koreanBase = [
  F('首尔清晨', ['清新','高亮','日常'], 1.28, 1.06, 1.15, 0.06, 5),
  F('奶油拿铁', ['柔白','温暖','人像'], 1.35, 0.97, 0.85, 0.08, 10, { vignette: { intensity: 0.06, feather: 0.6 } }),
  F('韩剧女主', ['通透','柔光','人像'], 1.22, 0.94, 1.05, 0.05, 6, { vignette: { intensity: 0.10, feather: 0.6 } }),
  F('济州海风', ['清新','蓝调','风景'], 1.18, 1.10, 1.22, 0.01, -8),
  F('梨大校园', ['明亮','青春','日常'], 1.32, 1.03, 1.15, 0.03, 4),
  F('明洞街头', ['时尚','高亮','街拍'], 1.20, 1.10, 1.10, 0.05, 6),
  F('韩屋午后', ['温暖','复古','建筑'], 1.14, 1.06, 0.92, 0.12, 15, { overlay: { type: 'color', color: 'rgba(255,235,210,0.06)' } }),
  F('江陵咖啡', ['柔白','质感','美食'], 1.28, 0.92, 0.86, 0.07, 8),
  F('南怡岛晴', ['通透','自然','风景'], 1.18, 1.08, 1.22, 0.01, -3),
  F('狎鸥亭潮', ['时尚','高冷','街拍'], 1.10, 1.14, 0.82, 0.04, 3, { vignette: { intensity: 0.12, feather: 0.5 } }),
  F('弘大街头', ['活力','明亮','街拍'], 1.22, 1.08, 1.20, 0.02, 7),
  F('釜山海云台', ['清新','蓝调','海景'], 1.18, 1.08, 1.25, 0.01, -12),
  F('仁川机场', ['通透','干净','人像'], 1.25, 1.04, 1.06, 0.03, 4),
  F('春川荞麦', ['清新','自然','美食'], 1.15, 1.06, 1.12, 0.05, 8),
  F('光州花路', ['柔美','明亮','花卉'], 1.28, 0.98, 1.28, 0.03, 12),
]

const americanBase = [
  F('加州阳光', ['暖黄','高对比','户外'], 1.06, 1.22, 1.25, 0.15, 18),
  F('美式电影', ['电影感','暖调','叙事'], 0.98, 1.28, 1.15, 0.18, 22, { vignette: { intensity: 0.18, feather: 0.5 } }),
  F('纽约黄昏', ['都市','暖黄','风景'], 0.92, 1.22, 1.18, 0.22, 28),
  F('66号公路', ['复古','旅行','公路'], 0.98, 1.15, 0.92, 0.25, 20, { vignette: { intensity: 0.15, feather: 0.4 } }),
  F('好莱坞红', ['高饱和','戏剧','红调'], 1.04, 1.22, 1.32, 0.12, 14),
  F('旧金山雾', ['柔和','蓝灰','城市'], 0.98, 1.08, 0.78, 0.12, -6),
  F('德州牧场', ['暖黄','乡村','户外'], 1.05, 1.12, 1.10, 0.20, 25),
  F('芝加哥风', ['冷调','都市','高对比'], 0.94, 1.28, 0.78, 0.10, -4, { vignette: { intensity: 0.14, feather: 0.5 } }),
  F('迈阿密粉', ['活力','饱和','热带'], 1.10, 1.18, 1.40, 0.06, 12),
  F('西雅图雨', ['冷灰','忧郁','城市'], 0.88, 1.10, 0.60, 0.06, -6),
  F('纳什维尔调', ['复古','音乐','暖调'], 1.00, 1.12, 0.98, 0.22, 16, { overlay: { type: 'color', color: 'rgba(255,200,100,0.05)' } }),
  F('布鲁克林', ['文艺','街头','冷调'], 0.95, 1.18, 0.75, 0.08, -3, { vignette: { intensity: 0.10, feather: 0.5 } }),
  F('VOGUE大片', ['时尚','高对比','质感'], 0.98, 1.32, 0.85, 0.09, 6, { vignette: { intensity: 0.20, feather: 0.35 } }),
  F('棕榈泉度假', ['暖调','鲜艳','度假'], 1.10, 1.10, 1.32, 0.10, 18),
  F('西部牛仔', ['复古','硬朗','牛仔'], 0.92, 1.25, 0.72, 0.28, 22, { vignette: { intensity: 0.18, feather: 0.3 } }),
]

const cuteBase = [
  F('草莓奶油', ['粉嫩','甜美','人像'], 1.22, 0.92, 1.18, 0.02, 18, { overlay: { type: 'color', color: 'rgba(255,180,200,0.06)' } }),
  F('棉花糖梦', ['柔焦','梦幻','粉调'], 1.28, 0.88, 1.08, 0.02, 22),
  F('糖果乐园', ['高饱和','鲜艳','可爱'], 1.18, 1.05, 1.50, 0.01, 12),
  F('独角兽光', ['梦幻','粉紫','幻彩'], 1.22, 0.90, 1.25, 0.01, 28),
  F('樱花飘飘', ['粉白','柔美','春日'], 1.30, 0.85, 0.88, 0.03, 20, { overlay: { type: 'color', color: 'rgba(255,195,215,0.05)' } }),
  F('蜜桃气泡', ['蜜桃色','清新','可爱'], 1.22, 1.02, 1.15, 0.03, 14),
  F('魔法少女', ['粉嫩','梦幻','人像'], 1.18, 0.93, 1.20, 0.02, 25, { vignette: { intensity: 0.08, feather: 0.7 } }),
  F('可可芭蕾', ['棕色','甜美','日常'], 1.12, 1.08, 1.10, 0.06, 10),
  F('彩虹糖梦', ['鲜艳','活力','彩色'], 1.20, 1.08, 1.55, 0.01, 6),
  F('奶萌日记', ['柔软','温暖','日常'], 1.25, 0.93, 1.02, 0.04, 18),
  F('冰淇淋夏', ['清凉','粉蓝','夏日'], 1.20, 1.02, 1.18, 0.01, -6),
  F('泡泡糖', ['粉嫩','饱和','少女'], 1.18, 1.02, 1.40, 0.02, 20),
  F('蝴蝶结', ['甜美','精致','人像'], 1.15, 1.04, 1.12, 0.04, 12, { vignette: { intensity: 0.06, feather: 0.8 } }),
  F('珍珠奶盖', ['柔白','甜美','清新'], 1.32, 0.90, 0.98, 0.02, 10),
  F('花仙子', ['粉色','柔光','花卉'], 1.22, 0.88, 1.18, 0.02, 28, { overlay: { type: 'color', color: 'rgba(255,185,220,0.05)' } }),
]

const japaneseBase = [
  F('东京胶片', ['胶片感','蓝青调','街拍'], 1.02, 1.06, 0.65, 0.02, -12, { vignette: { intensity: 0.10, feather: 0.5 } }),
  F('京都寂色', ['安静','低饱','古都'], 0.95, 1.02, 0.45, 0.04, -6),
  F('森系小樽', ['清新','自然','绿调'], 1.12, 1.04, 0.72, 0.01, -10),
  F('日系清透', ['通透','日常','人像'], 1.15, 0.96, 0.78, 0.01, -14),
  F('镰仓海岸', ['蓝调','清新','海景'], 0.98, 1.10, 0.70, 0.02, -18),
  F('冲浪少年', ['青春','活力','运动'], 1.06, 1.14, 0.82, 0.02, -10),
  F('樱花季', ['粉白','春日','清新'], 1.18, 0.93, 0.65, 0.02, 6),
  F('居酒屋夜', ['暗调','温暖','夜间'], 0.85, 1.12, 0.82, 0.06, 6, { vignette: { intensity: 0.22, feather: 0.5 } }),
  F('昼颜花', ['柔美','低饱','花卉'], 1.10, 0.93, 0.52, 0.02, 0, { overlay: { type: 'color', color: 'rgba(200,225,200,0.06)' } }),
  F('北海之白', ['高亮','洁白','北海'], 1.22, 0.90, 0.60, 0.01, -12),
  F('奈良鹿鸣', ['暖调','自然','动物'], 1.06, 1.04, 0.78, 0.04, -4),
  F('禅意枯山', ['寂静','低饱','禅意'], 0.92, 1.08, 0.32, 0.05, -6, { vignette: { intensity: 0.12, feather: 0.6 } }),
  F('涉谷夜霓', ['暗调','霓虹','街拍'], 0.80, 1.25, 1.15, 0.01, -10),
  F('冲绳海蓝', ['蓝调','清新','海岛'], 1.10, 1.12, 0.92, 0.01, -22),
  F('书道墨韵', ['黑白','质感','人文'], 0.92, 1.18, 0.42, 0.06, -4, { vignette: { intensity: 0.14, feather: 0.4 } }),
]

const filmBase = [
  F('柯达金200', ['胶片','暖调','人像'], 1.02, 1.10, 1.08, 0.18, 18, { vignette: { intensity: 0.12, feather: 0.5 } }),
  F('富士Superia', ['胶片','绿调','日系'], 1.00, 1.14, 0.92, 0.06, -6),
  F('AgfaVista', ['暖红','鲜艳','风景'], 0.98, 1.12, 1.18, 0.12, 12),
  F('伊尔福PAN', ['黑白','颗粒','经典'], 0.96, 1.25, 0, 0, 0, { vignette: { intensity: 0.14, feather: 0.4 } }),
  F('过期相纸', ['褪色','偏蓝','复古'], 0.88, 0.85, 0.55, 0.05, -14),
  F('宝丽来', ['暖调','温柔','人像'], 1.10, 0.90, 0.84, 0.12, 14, { overlay: { type: 'color', color: 'rgba(255,220,195,0.06)' }, vignette: { intensity: 0.08, feather: 0.6 } }),
  F('徕卡暗部', ['暗调','质感','高对比'], 0.85, 1.30, 0.62, 0.06, -4, { vignette: { intensity: 0.25, feather: 0.3 } }),
  F('禄来柔焦', ['柔焦','梦幻','人像'], 1.12, 0.82, 0.75, 0.10, 12, { vignette: { intensity: 0.10, feather: 0.6 } }),
  F('LOMO漏光', ['漏光','鲜艳','个性'], 1.12, 1.18, 1.40, 0.06, 6, { vignette: { intensity: 0.30, feather: 0.15 } }),
  F('奥巴蓝', ['蓝调','清新','风景'], 0.98, 1.12, 0.88, 0.02, -18),
  F('康泰时G', ['锐利','低饱','人文'], 0.95, 1.22, 0.65, 0.05, -6, { vignette: { intensity: 0.10, feather: 0.5 } }),
  F('勃朗尼卡', ['暖黄','中等','66画幅'], 1.00, 1.06, 0.88, 0.14, 14, { vignette: { intensity: 0.12, feather: 0.5 } }),
  F('胶片负片', ['橙调','经典','负片'], 1.06, 1.08, 0.92, 0.10, 20),
  F('电影卷5207', ['电影','暖调','宽容'], 1.02, 1.08, 0.98, 0.14, 12, { vignette: { intensity: 0.08, feather: 0.6 } }),
  F('胶片5219', ['绿调','冷调','夜间'], 0.86, 1.18, 0.82, 0.04, -10, { vignette: { intensity: 0.18, feather: 0.4 } }),
]

const natureBase = [
  F('森林晨光', ['绿调','清新','自然'], 1.06, 1.06, 1.12, 0.01, -6),
  F('天空之镜', ['蓝调','通透','天空'], 1.12, 1.10, 1.10, 0, -12),
  F('秋日暖阳', ['暖调','金黄','秋季'], 1.06, 1.06, 1.12, 0.08, 12),
  F('雨林秘境', ['绿调','暗部','深邃'], 0.92, 1.14, 1.18, 0.02, -10, { vignette: { intensity: 0.12, feather: 0.5 } }),
  F('麦田守望', ['金黄','温暖','丰收'], 1.06, 1.06, 1.18, 0.12, 18),
  F('真实纪实', ['真实','还原','自然'], 1.02, 1.06, 1.06, 0, 0),
  F('雪原白', ['高亮','洁白','冬日'], 1.22, 1.02, 0.68, 0.01, -6),
  F('沙漠之光', ['暖调','质感','沙漠'], 1.02, 1.14, 1.08, 0.10, 22),
  F('湖水绿', ['绿青','通透','水面'], 1.10, 1.06, 1.15, 0, -10),
  F('花草集', ['鲜艳','自然','植物'], 1.12, 1.06, 1.28, 0.01, 4),
  F('薄雾清晨', ['柔美','朦胧','清晨'], 1.10, 0.88, 0.80, 0.03, 6),
  F('山间小径', ['绿调','暗部','山林'], 0.95, 1.12, 1.10, 0.04, -8, { vignette: { intensity: 0.10, feather: 0.5 } }),
  F('真实色彩', ['还原','通透','日常'], 1.00, 1.04, 1.08, 0, 0),
  F('晨曦微光', ['暖调','柔和','日出'], 1.15, 0.96, 1.06, 0.05, 14),
  F('自然风光', ['通透','鲜艳','风景'], 1.06, 1.10, 1.22, 0, -3),
]

const xhsBase = [
  F('日杂氛围', ['氛围感','暖调','人像'], 1.15, 0.98, 0.88, 0.05, 10),
  F('午后阳台', ['暖光','柔和','日常'], 1.22, 0.94, 0.90, 0.06, 12),
  F('复古庭院', ['暗调','复古','质感'], 0.88, 1.12, 0.78, 0.10, 6, { vignette: { intensity: 0.15, feather: 0.5 } }),
  F('相机自拍', ['柔光','人像','自拍'], 1.18, 0.96, 0.85, 0.04, 6),
  F('小资下午', ['明亮','质感','日常'], 1.12, 1.06, 0.92, 0.04, 6),
  F('书房淡彩', ['书卷','淡雅','静物'], 1.06, 1.00, 0.75, 0.06, 6),
  F('闺蜜茶歇', ['温暖','甜美','聚会'], 1.18, 0.96, 1.08, 0.04, 12),
  F('花店随拍', ['鲜艳','柔美','花卉'], 1.14, 1.04, 1.15, 0.02, 10, { vignette: { intensity: 0.06, feather: 0.6 } }),
  F('插画治愈', ['柔美','淡彩','疗愈'], 1.15, 0.90, 0.82, 0.03, 14),
  F('窗边光影', ['暖光','日常','居家'], 1.10, 1.03, 0.90, 0.06, 12),
  F('卧室留白', ['柔和','简洁','居家'], 1.22, 0.93, 0.82, 0.03, 6),
  F('日常碎片', ['通透','明亮','日常'], 1.15, 1.06, 1.00, 0.02, 4),
  F('一炉烟火', ['暖调','黄昏','人文'], 0.98, 1.12, 0.88, 0.12, 18, { vignette: { intensity: 0.10, feather: 0.5 } }),
  F('松弛假日', ['明亮','清新','假日'], 1.18, 1.03, 1.00, 0.02, 3),
  F('质感生活', ['质感','暗部','人文'], 0.94, 1.14, 0.72, 0.06, 4, { vignette: { intensity: 0.10, feather: 0.5 } }),
]

const trendyBase = [
  F('博主暗调', ['暗部','质感','博主'], 0.82, 1.22, 0.68, 0.04, -3, { vignette: { intensity: 0.14, feather: 0.5 } }),
  F('高级灰', ['灰色','低饱','高级'], 0.92, 1.08, 0.40, 0.04, 0),
  F('Vogue蓝', ['蓝调','冷调','时尚'], 0.88, 1.12, 0.65, 0.03, -15),
  F('赛博朋克', ['霓虹','紫调','科幻'], 0.78, 1.28, 1.35, 0, -25, { vignette: { intensity: 0.20, feather: 0.3 } }),
  F('低饱和度', ['低饱','冷淡','高级'], 0.95, 1.10, 0.35, 0.03, -4),
  F('暖调燕麦', ['暖调','柔和','博主'], 1.10, 0.98, 0.82, 0.08, 12),
  F('高冷月白', ['高冷','白调','冷淡'], 1.15, 1.04, 0.42, 0.01, -6),
  F('霓虹世界', ['霓虹','鲜艳','夜景'], 0.92, 1.22, 1.35, 0, -12, { vignette: { intensity: 0.18, feather: 0.3 } }),
  F('低对比', ['低对比','柔和','特别'], 1.08, 0.75, 0.88, 0.03, 6),
  F('博主暖调', ['暖调','质感','博主'], 1.06, 1.10, 0.88, 0.10, 14, { vignette: { intensity: 0.08, feather: 0.6 } }),
  F('低调人像', ['暗调','人像','质感'], 0.85, 1.18, 0.68, 0.05, -4, { vignette: { intensity: 0.15, feather: 0.5 } }),
  F('法式慵懒', ['法式','柔和','慵懒'], 1.10, 0.96, 0.78, 0.08, 10),
  F('夜阑时分', ['暗调','夜景','氛围'], 0.72, 1.25, 0.75, 0.03, -6, { vignette: { intensity: 0.25, feather: 0.3 } }),
  F('莫兰迪色', ['低饱','柔和','莫兰迪'], 1.02, 0.93, 0.40, 0.03, 3),
  F('潮流暗角', ['暗角','质感','街拍'], 0.90, 1.15, 0.78, 0.04, -3, { vignette: { intensity: 0.25, feather: 0.25 } }),
]

const bnwBase = [
  F('经典黑白', ['黑白','经典','任何'], 0.98, 1.15, 0, 0, 0),
  F('高对比黑白', ['高对比','戏剧','人文'], 0.92, 1.35, 0, 0, 0),
  F('柔和黑白', ['柔和','低调','人像'], 1.08, 0.92, 0, 0, 0),
  F('暖调黑白', ['暖调','复古','人像'], 0.98, 1.10, 0, 0.20, 12, { vignette: { intensity: 0.10, feather: 0.5 } }),
  F('冷调黑白', ['冷调','暗部','风景'], 0.92, 1.15, 0, 0.03, -6),
  F('暗部黑白', ['暗调','质感','艺术'], 0.80, 1.22, 0, 0, 0, { vignette: { intensity: 0.18, feather: 0.4 } }),
  F('亮部黑白', ['明亮','干净','时尚'], 1.18, 1.08, 0, 0, 0),
  F('纪实黑白', ['纪实','人文','感受'], 0.98, 1.20, 0, 0, 0, { vignette: { intensity: 0.08, feather: 0.5 } }),
  F('极简黑白', ['极简','干净','设计'], 1.02, 1.25, 0, 0, 0),
  F('老照片黑白', ['旧','褪色','怀旧'], 0.85, 0.88, 0, 0.15, 10, { vignette: { intensity: 0.18, feather: 0.35 } }),
  F('艺术黑白', ['高对比','极简','艺术'], 0.88, 1.40, 0, 0, 0, { vignette: { intensity: 0.10, feather: 0.5 } }),
  F('温和灰度', ['温暖','柔和','人像'], 1.10, 0.98, 0, 0.12, 6),
]

const foodBase = [
  F('深夜食堂', ['暖调','暗部','晚餐'], 0.92, 1.14, 1.28, 0.06, 12),
  F('面包房', ['暖黄','柔和','烘焙'], 1.15, 1.06, 1.20, 0.07, 18),
  F('寿司职人', ['干净','锐利','日料'], 1.06, 1.12, 1.15, 0.01, -4),
  F('烤肉派对', ['高饱','暖红','烤肉'], 1.02, 1.14, 1.40, 0.04, 14, { vignette: { intensity: 0.10, feather: 0.5 } }),
  F('甜品诱惑', ['高亮','鲜艳','甜品'], 1.22, 1.06, 1.38, 0.02, 10),
  F('麻辣诱惑', ['高饱','暖红','川菜'], 1.06, 1.12, 1.32, 0.03, 12),
  F('水果盛宴', ['鲜艳','明亮','水果'], 1.18, 1.10, 1.50, 0.01, 6),
  F('火锅盛宴', ['高饱','氛围','火锅'], 0.98, 1.12, 1.28, 0.04, 14, { vignette: { intensity: 0.12, feather: 0.5 } }),
  F('街头美食', ['温暖','日常','小吃'], 1.08, 1.10, 1.25, 0.06, 12),
  F('拉面上瘾', ['暖调','质感','面条'], 1.10, 1.10, 1.20, 0.05, 14),
  F('早餐时刻', ['明亮','温暖','早餐'], 1.22, 1.06, 1.22, 0.04, 14),
  F('西餐佳肴', ['质感','暗部','西餐'], 0.92, 1.18, 1.18, 0.04, 10, { vignette: { intensity: 0.10, feather: 0.5 } }),
  F('下午茶', ['明亮','甜美','茶点'], 1.22, 1.03, 1.22, 0.04, 12),
  F('居酒小屋', ['暖暗','氛围','日料'], 0.86, 1.15, 1.15, 0.05, 10, { vignette: { intensity: 0.18, feather: 0.4 } }),
  F('烘焙工坊', ['暖黄','柔和','烘焙'], 1.18, 1.03, 1.15, 0.08, 20),
]

const streetBase = [
  F('青橙调', ['TealOrange','电影','街拍'], 0.98, 1.18, 0.85, 0.02, -10),
  F('白石黑路', ['黑白','高对比','人文'], 0.88, 1.32, 0, 0, 0, { vignette: { intensity: 0.15, feather: 0.4 } }),
  F('INS沙漠', ['暖调','沙漠','建筑'], 1.03, 1.12, 1.08, 0.10, 18),
  F('暗蓝街头', ['暗调','蓝调','夜景'], 0.80, 1.18, 0.82, 0.01, -15, { vignette: { intensity: 0.18, feather: 0.4 } }),
  F('港味街头', ['港风','霓虹','晚间'], 0.85, 1.25, 1.15, 0.04, -6, { vignette: { intensity: 0.14, feather: 0.4 } }),
  F('日和街景', ['日味','清新','白天'], 1.10, 1.10, 0.82, 0.02, -10),
  F('欧洲小街', ['暖调','欧式','石板'], 1.06, 1.10, 0.93, 0.08, 14, { vignette: { intensity: 0.08, feather: 0.5 } }),
  F('夜间霓虹', ['霓虹','夜景','晚间'], 0.84, 1.28, 1.22, 0.01, -12, { vignette: { intensity: 0.15, feather: 0.4 } }),
  F('重庆森林', ['绿调','质感','迷离'], 0.86, 1.18, 0.88, 0.04, -6, { vignette: { intensity: 0.14, feather: 0.35 } }),
  F('冷灰街景', ['冷调','都市','灰色'], 0.92, 1.12, 0.45, 0.03, -4),
  F('午后小巷', ['暖调','日常','街景'], 1.10, 1.06, 1.08, 0.06, 12),
  F('光影街头', ['光影','高对比','故事'], 1.02, 1.22, 0.88, 0.05, 6, { vignette: { intensity: 0.10, feather: 0.5 } }),
  F('东京塔景', ['冷调','夜景','东京'], 0.84, 1.22, 0.92, 0.02, -12, { vignette: { intensity: 0.14, feather: 0.4 } }),
  F('巴塞罗那', ['暖调','阳光','城市'], 1.10, 1.12, 1.18, 0.06, 14),
  F('街头速写', ['对比','质感','黑白倾向'], 0.96, 1.22, 0.58, 0.04, 0, { vignette: { intensity: 0.10, feather: 0.5 } }),
]

const expandedKorean = expandCategory(koreanBase, variants.standard)
const expandedAmerican = expandCategory(americanBase, variants.standard)
const expandedCute = expandCategory(cuteBase, variants.standard)
const expandedJapanese = expandCategory(japaneseBase, variants.extra)
const expandedFilm = expandCategory(filmBase, variants.extra)
const expandedNature = expandCategory(natureBase, variants.standard)
const expandedXHS = expandCategory(xhsBase, variants.standard)
const expandedTrendy = expandCategory(trendyBase, variants.standard)
const expandedBnw = expandCategory(bnwBase, variants.bnw)
const expandedFood = expandCategory(foodBase, variants.food)
const expandedStreet = expandCategory(streetBase, variants.standard)

const allFilters = [
  ...buildFilters('korean', expandedKorean, 'kr', 120),
  ...buildFilters('american', expandedAmerican, 'us', 120),
  ...buildFilters('cute', expandedCute, 'cu', 100),
  ...buildFilters('japanese', expandedJapanese, 'jp', 120),
  ...buildFilters('film', expandedFilm, 'fi', 120),
  ...buildFilters('nature', expandedNature, 'na', 100),
  ...buildFilters('xiaohongshu', expandedXHS, 'xs', 100),
  ...buildFilters('trendy', expandedTrendy, 'tr', 80),
  ...buildFilters('bnw', expandedBnw, 'bw', 60),
  ...buildFilters('food', expandedFood, 'fd', 80),
  ...buildFilters('street', expandedStreet, 'st', 80),
]

export { categories, allFilters }
export default allFilters