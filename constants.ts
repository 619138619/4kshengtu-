import { StylePreset } from './types';

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'cyberpunk',
    name: '霓虹赛博朋克',
    description: '霓虹灯和高科技装备的未来主义美学。',
    promptSuffix: 'in a futuristic cyberpunk city with neon lights, high-tech clothing, glowing cybernetics, rainy night atmosphere, cinematic lighting, 8k resolution, highly detailed',
    color: 'from-pink-500 to-cyan-500'
  },
  {
    id: 'watercolor',
    name: '空灵水彩',
    description: '柔和梦幻的水彩画风格。',
    promptSuffix: 'as a soft watercolor painting, pastel colors, dreamy atmosphere, artistic brush strokes, white background, detailed features, illustration style',
    color: 'from-rose-400 to-orange-300'
  },
  {
    id: 'renaissance',
    name: '文艺复兴油画',
    description: '16世纪的经典油画风格。',
    promptSuffix: 'as a classic Renaissance oil painting, dramatic chiaroscuro lighting, intricate clothing details, cracked texture, museum quality, masterpiece',
    color: 'from-yellow-700 to-yellow-900'
  },
  {
    id: 'anime',
    name: '现代动漫',
    description: '高质量的日本动画风格。',
    promptSuffix: 'in a modern high-quality anime style, vibrant colors, clean lines, expressive eyes, Shinkai-esque background, beautiful lighting',
    color: 'from-indigo-400 to-purple-500'
  },
  {
    id: 'clay',
    name: '3D 粘土动画',
    description: '充满趣味和质感的 3D 粘土渲染。',
    promptSuffix: 'as a 3D claymation character, cute, plasticine texture, studio lighting, depth of field, miniature world, whimsical',
    color: 'from-emerald-400 to-teal-500'
  },
  {
    id: 'noir',
    name: '黑色电影',
    description: '黑白情绪侦探风格。',
    promptSuffix: 'in a 1940s film noir style, black and white, high contrast, dramatic shadows, detective atmosphere, rainy street, mystery',
    color: 'from-gray-600 to-gray-900'
  },
  {
    id: 'fantasy',
    name: '史诗奇幻',
    description: '带有魔法元素的 RPG 角色艺术风格。',
    promptSuffix: 'as an epic fantasy RPG character, wearing intricate armor, magical aura, detailed background of a mystical forest, digital art, ArtStation trending',
    color: 'from-amber-500 to-red-600'
  },
  {
    id: 'sketch',
    name: '铅笔素描',
    description: '粗犷艺术的石墨铅笔素描。',
    promptSuffix: 'as a rough graphite pencil sketch on textured paper, detailed shading, cross-hatching, artistic, monochromatic, hand-drawn look',
    color: 'from-slate-400 to-slate-600'
  }
];