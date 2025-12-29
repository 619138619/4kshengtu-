import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Upload, Download, Sparkles, Zap, Aperture, Palette, Image as ImageIcon, CheckCircle, Loader2, Eye, Grid3X3, ShoppingBag, Settings, Camera, ScanFace, Package, Key, X, Shuffle, Wand2, Box, Layers, Droplets, Snowflake, Wind, Moon, Sun, Monitor, Feather, Disc, User, UserCheck, Focus, Fingerprint, Crown, BookOpen, Anchor, Mountain, RefreshCw, Activity, DownloadCloud, Film, Lock, Unlock } from 'lucide-react';

/**
 * 流光·万相 (InfiniteMe) - The Final Release (v19.1 - No Key Required)
 * Updated to use @google/genai SDK
 */

// -----------------------------------------------------------------------------
// 0. Design Tokens & Global Styles
// -----------------------------------------------------------------------------
const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @layer utilities {
      .ease-fluid { transition-timing-function: cubic-bezier(0.32, 0.72, 0, 1); }
      .ease-snap { transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1); }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      .perspective-1000 { perspective: 1000px; }
      .preserve-3d { transform-style: preserve-3d; }
    }
    .bg-noise {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E");
    }
    .waveform-bar { animation: waveform 1s infinite ease-in-out; }
    @keyframes waveform {
      0%, 100% { height: 10%; }
      50% { height: 100%; }
    }
    @keyframes develop {
      0% { filter: blur(20px) grayscale(100%) sepia(30%); opacity: 0; transform: scale(1.05); }
      100% { filter: blur(0) grayscale(0%) sepia(0%); opacity: 1; transform: scale(1); }
    }
    @keyframes scan {
      0% { top: 0%; opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }
    @keyframes breathe {
      0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.1); transform: scale(1); }
      50% { box-shadow: 0 0 40px rgba(255,255,255,0.3); transform: scale(1.02); }
    }
  `}} />
);

// -----------------------------------------------------------------------------
// 1. Data Models (The 9 Fixed Masterpieces)
// -----------------------------------------------------------------------------

const PORTRAIT_LENSES = [
  { id: 'legend', name: 'LEGEND | 传奇', camera: 'Hasselblad 500C', basePrompt: 'Annie Leibovitz Style. Regal pose on vintage armchair. Painterly window light (Rembrandt). Deep reds and golds. Canvas texture.', caption: "每个人都是自己故事里的传奇。👑 #Timeless" },
  { id: 'poet', name: 'POET | 诗人', camera: 'Leica M6', basePrompt: 'Vanity Fair Editorial. Dusty library atmosphere. God rays. Chiaroscuro lighting. Muted browns and sepia. Intellectual, melancholic.', caption: "光影斑驳处，听见时间的低语。📖 #VanityFair" },
  { id: 'nomad', name: 'NOMAD | 游牧', camera: 'Canon 5D', basePrompt: 'Epic Landscape Portrait. Stormy highlands background. Windblown hair. Overcast dramatic skylight. Desaturated greens. Freedom and power.', caption: "心有荒野，不仅是过客。🏔️ #NomadSoul" },
  { id: 'icon', name: 'ICON | 巨星', camera: 'Phase One XF', basePrompt: 'Rolling Stone Cover style. Hand-painted canvas backdrop. Sculpted butterfly lighting. Intense eye contact. Hyper-realistic skin pores.', caption: "直视镜头，不需要任何解释。⭐️ #Iconic" },
  { id: 'real', name: 'ORIGIN | 本源', camera: 'Polaroid 600', icon: Fingerprint, basePrompt: 'Raw, unfiltered aesthetic. Direct flash. Authentic skin texture. Pure white background. Honest.', caption: "回归本源，最真实的自己。🤍" },
  { id: 'dreamer', name: 'DREAM | 梦境', camera: 'Pentax 67', basePrompt: 'Ethereal Fantasy. Submerged in dark lake or fog. Moonlight cool tones. Water reflection. Deep blues and silver. Surreal, magical.', caption: "在现实的边缘，做一场醒不来的梦。🌙 #Dreamscape" },
  { id: 'maker', name: 'MAKER | 匠人', camera: 'Fujifilm GFX', basePrompt: 'Environmental Workspace. Artist studio, cluttered but artful. Mixed warm/cool lighting. Creative genius at work.', caption: "专注，是这世上最性感的光。🛠️ #Craftsmanship" },
  { id: 'noir', name: 'NOIR | 黑色', camera: 'Leica Monochrom', basePrompt: 'Classic Hollywood Noir. B&W. Hard Venetian blind shadows. High contrast. Smoke swirls. Mystery detective vibe.', caption: "黑白之间，藏着彩色的秘密。🎬 #FilmNoir" },
  { id: 'vogue', name: 'VOGUE | 盛典', camera: 'Hasselblad H6D', basePrompt: 'Met Gala Aesthetic. Grand staircase. Couture attire. Crisp expensive strobe lighting. Jewel tones (Emerald, Sapphire).', caption: "今夜，星光只为你闪烁。✨ #VogueCover" }
];

const STUDIO_THEMES = [
  { id: 'couture', label: 'COUTURE', prompt: 'High-fashion luxury. Silk draping, gold accents, warm spotlight.', caption: "极致奢华，触手可及。💎" },
  { id: 'quantum', label: 'QUANTUM', prompt: 'Futuristic tech. Matte black void, blue laser rim lights, floating.', caption: "来自未来的科技美学。🚀" },
  { id: 'gaia', label: 'GAIA', prompt: 'Organic origin. Raw stone, moss, morning dew, sunlight.', caption: "回归本源，自然之力。🌿" },
  { id: 'liquid', label: 'HYDRO', prompt: 'High-speed liquid sculpture. Splashing water or mercury. Frozen motion.', caption: "至柔至刚，瞬间永恒。💧" },
  { id: 'arch', label: 'ARCH', prompt: 'Brutalist architecture. Concrete geometry, sharp shadows.', caption: "光影构建的秩序之美。🏛️" },
  { id: 'neon', label: 'NEON', prompt: 'Cyber-noir. Wet asphalt, pink/cyan reflections. Blade Runner.', caption: "霓虹深处，赛博寻梦。🌃" },
  { id: 'pure', label: 'PURE', prompt: 'Clinical purity. Infinite white background, softbox lighting.', caption: "纯粹，不含杂质。⚪️" },
  { id: 'pop', label: 'POP', prompt: 'Memphis pop art. Bright candy colors, hard shadows.', caption: "多巴胺爆发，快乐万岁！🎨" },
  { id: 'frozen', label: 'FROST', prompt: 'Encased in ice. Frost texture, dry ice fog.', caption: "封存此刻的冰点。❄️" },
  { id: 'eclipse', label: 'ECLIPSE', prompt: 'Solar eclipse background. Black silhouette, ring of fire.', caption: "日月同辉，史诗时刻。🌑" }
];

const CAMPAIGN_STORYBOARD = [
  { role: "TEASER", prompt: "Silhouette shot." },
  { role: "TEXTURE", prompt: "Extreme Macro." },
  { role: "LIFESTYLE", prompt: "Contextual shot." },
  { role: "TOUCH", prompt: "Human interaction." },
  { role: "HERO", prompt: "Center stage." },
  { role: "PARTS", prompt: "Exploded view." },
  { role: "GIFT", prompt: "Packaging shot." },
  { role: "MOOD", prompt: "Abstract atmosphere." },
  { role: "IMPACT", prompt: "Dynamic action." }
];

const LOADING_STEPS = ["Subject Acquired.", "Locking Features...", "Developing...", "Final Polish...", "Done."];

// -----------------------------------------------------------------------------
// 2. API Logic
// -----------------------------------------------------------------------------

const callGemini = async (imageBase64, prompt) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
  
  const generate = async (p) => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: p },
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } }
        ]
      },
      config: { responseModalities: ["IMAGE"] }
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/jpeg;base64,${part.inlineData.data}`;
      }
    }
    throw new Error('No Image Data');
  };

  try {
    return await generate(prompt);
  } catch (error) {
    console.warn("Generation failed, retrying with simple prompt...");
    const simplePrompt = "High quality photo of subject. " + prompt.slice(0, 100);
    try {
      return await generate(simplePrompt);
    } catch (e) {
      throw e;
    }
  }
};

const analyzeImage = async (imageBase64, mode) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = mode === 'identity' 
    ? "Perform a biometric analysis. 1. DETECT GENDER (Male/Female). 2. Key facial features. 3. Output concise description." 
    : "Analyze product: 1. Material. 2. Color. 3. Shape. Output concise brief.";
    
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-09-2025',
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: imageBase64.split(',')[1] } }
      ]
    }
  });
  
  return response.text || "Unique subject";
};

// -----------------------------------------------------------------------------
// 3. UI Components
// -----------------------------------------------------------------------------

const Waveform = ({ active }) => (
  <div className={`absolute bottom-8 right-8 flex items-center gap-[3px] h-8 transition-opacity duration-300 ${active ? 'opacity-80' : 'opacity-0'}`}>
    {Array.from({ length: 12 }).map((_, i) => (
      <div 
        key={i} 
        className="w-1 bg-white/80 rounded-full waveform-bar" 
        style={{ animationDelay: `${i * 0.1}s`, animationDuration: `${0.8 + Math.random() * 0.5}s` }} 
      />
    ))}
  </div>
);

const ParallaxCard = ({ item, onClick, onRegenerate, index, filmMode, active, onHover, isFocusMode }) => {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 });

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`group relative w-full h-full bg-[#0c0c0e] overflow-hidden cursor-pointer transition-all duration-700 ease-fluid perspective-1000 ${isFocusMode ? 'opacity-30 blur-sm scale-95' : 'opacity-100'}`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <div 
        className="w-full h-full overflow-hidden shadow-xl transition-transform duration-100 ease-out preserve-3d group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        style={{ transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(${rotate.x ? 1.05 : 1})` }}
      >
        {item.status === 'loading' && (
          <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
             <div className="w-full h-full opacity-10 bg-noise absolute inset-0" />
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 text-white/40 animate-spin mb-2" />
                <span className="text-[8px] font-mono tracking-[0.2em] text-white/30 uppercase animate-pulse">DEVELOPING...</span>
                <span className="text-[7px] font-mono tracking-[0.1em] text-white/20 uppercase mt-1">{item.name}</span>
             </div>
          </div>
        )}
        {item.status === 'success' && item.imageUrl && (
          <div className="w-full h-full relative">
            <img src={item.imageUrl} className="w-full h-full object-cover animate-[develop_1.5s_cubic-bezier(0.2,0.8,0.2,1)_forwards]" alt="result" />
            {filmMode && <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none mix-blend-overlay" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-fluid" />
            <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-snap transform translate-y-2 group-hover:translate-y-0">
               <p className="text-[9px] font-medium tracking-[0.2em] uppercase text-white/50 mb-1 font-mono">{item.camera || 'STUDIO'}</p>
               <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-white">{item.name}</p>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-md transition-all duration-300 z-30 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
            >
                <RefreshCw size={12} strokeWidth={2} />
            </button>
          </div>
        )}
        {item.status === 'error' && (
           <div className="absolute inset-0 bg-red-900/10 flex flex-col items-center justify-center border border-red-500/20">
              <span className="text-[9px] text-red-400 uppercase tracking-widest">Failed</span>
              <button onClick={(e) => { e.stopPropagation(); onRegenerate(); }} className="mt-2 text-[8px] text-white underline uppercase">Retry</button>
           </div>
        )}
        {item.status === 'idle' && (
           <div className="absolute inset-0 bg-white/[0.02] flex flex-col items-center justify-center transition-colors duration-500 group-hover:bg-white/[0.04] border-[0.5px] border-white/5">
              <span className="text-[8px] font-mono tracking-[0.2em] uppercase text-white/10 group-hover:text-white/30 transition-colors">{item.name || index + 1}</span>
           </div>
        )}
      </div>
    </div>
  );
};

const Viewfinder = ({ image, onUpload, label, isScanning, detectedGender, onGenderToggle, filmMode }) => (
  <div className={`relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden transition-all duration-700 ease-fluid group cursor-pointer ${image ? 'bg-black shadow-2xl' : 'bg-white/[0.02] border border-white/10 hover:border-white/30'}`}>
    {filmMode && <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none z-10 mix-blend-overlay" />}
    {!image && (
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity duration-500">
         <div className="w-16 h-16 rounded-full border-[0.5px] border-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ease-snap"><Camera size={24} strokeWidth={1} className="text-white" /></div>
         <span className="text-[9px] font-medium tracking-[0.3em] text-white/50 uppercase group-hover:text-white transition-colors">{label}</span>
      </div>
    )}
    {image && (
      <div className="relative w-full h-full animate-in fade-in duration-1000">
        <img src={image} className="w-full h-full object-cover opacity-80 transition-opacity duration-700 ease-fluid group-hover:opacity-60" alt="target" />
        <Waveform active={isScanning} />
        {detectedGender && (
          <div onClick={(e) => { e.stopPropagation(); onGenderToggle(); }} className="absolute top-4 left-4 flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-700 cursor-pointer hover:scale-105 transition-transform z-30">
             <div className={`w-6 h-6 rounded-full backdrop-blur-md flex items-center justify-center border transition-colors ${detectedGender === 'Male' ? 'bg-blue-500/20 border-blue-400/50' : 'bg-pink-500/20 border-pink-400/50'}`}>
               {detectedGender === 'Male' ? <User size={12} className="text-blue-200"/> : <UserCheck size={12} className="text-pink-200"/>}
             </div>
          </div>
        )}
        {isScanning && <div className="absolute inset-0 z-20 pointer-events-none"><div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-[scan_2s_ease-in-out_infinite]" /></div>}
        <button onClick={(e) => {e.stopPropagation(); onUpload(null);}} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-md transition-all duration-300 ease-snap z-30 opacity-0 group-hover:opacity-100 hover:scale-110"><X size={12} /></button>
      </div>
    )}
    <input type="file" onChange={onUpload} accept="image/*" className={`absolute inset-0 opacity-0 ${image ? 'hidden' : 'cursor-pointer'} z-10`} />
  </div>
);

const ShutterButton = ({ status, onClick, disabled, accentColor }) => (
  <button onClick={onClick} disabled={disabled} className={`group relative w-20 h-20 flex items-center justify-center outline-none select-none transition-all duration-500 ease-fluid ${disabled ? 'opacity-30 cursor-not-allowed scale-95' : 'cursor-pointer hover:scale-105 active:scale-95'}`}>
    {!disabled && status === 'idle' && <div className="absolute inset-0 rounded-full bg-white/5 animate-[breathe_3s_infinite_ease-in-out]" />}
    {/* Active Spinner */}
    {(status === 'analyzing' || status === 'generating') && (
      <div className="absolute inset-0 rounded-full border-t-[1.5px] border-l-[1.5px] border-white/50 animate-spin" />
    )}
    <div className={`absolute inset-0 rounded-full border-[1.5px] transition-all duration-700 ease-snap ${status !== 'idle' && status !== 'complete' ? 'border-white/0 scale-90' : 'border-white/20 group-hover:border-white/60'}`} style={{ borderColor: accentColor ? `rgba(${accentColor}, 0.5)` : '' }} />
    <div className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ease-snap shadow-[0_0_40px_rgba(255,255,255,0.1)] ${status !== 'idle' && status !== 'complete' ? 'bg-white scale-[0.2]' : 'bg-white group-active:scale-90'}`} style={{ backgroundColor: accentColor ? `rgb(${accentColor})` : 'white' }} />
  </button>
);

const Dock = ({ activeMode, setActiveMode }) => (
  <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-20 duration-1000 ease-snap">
    <div className="flex bg-white/5 backdrop-blur-2xl p-1.5 rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] ring-1 ring-white/10 transition-all hover:scale-105 hover:bg-white/10 duration-500 ease-fluid gap-4 px-4">
      {['identity', 'poster'].map((mode) => {
        const isActive = activeMode === mode;
        return (
          <button key={mode} onClick={() => setActiveMode(mode)} className={`relative py-3 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-500 ease-fluid flex items-center gap-3 ${isActive ? 'text-white scale-105' : 'text-white/40 hover:text-white'}`}>
            {mode === 'identity' ? <ScanFace size={16} /> : <Package size={16} />}
            <span className={`transition-all duration-500 overflow-hidden ${isActive ? 'w-auto opacity-100 ml-1' : 'w-0 opacity-0'}`}>{mode === 'identity' ? 'Portrait' : 'Studio'}</span>
          </button>
        );
      })}
      <div className="w-[1px] h-4 bg-white/10 my-auto" />
      <button className="text-white/30 hover:text-white transition-colors"><Settings size={14} /></button>
    </div>
  </div>
);

const CinemaPreview = ({ images, mode, onClose, posterPrompt }) => {
  const validImages = images.filter(img => img.status === 'success' && img.imageUrl);
  const getCaption = () => {
    if (mode === 'identity') {
      const lens = PORTRAIT_LENSES.find(l => l.name === validImages[0]?.name);
      return lens ? lens.caption : "在万相之中，遇见另一个自己。✨ #InfiniteMe";
    } else {
      const theme = STUDIO_THEMES.find(t => t.prompt === posterPrompt);
      return theme ? theme.caption : "顶级质感，一触即发。🔥 #NewArrival";
    }
  };
  const caption = validImages.length > 0 ? getCaption() : "Loading...";

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex items-center justify-center animate-in zoom-in-95 duration-300">
      <button onClick={onClose} className="absolute top-8 right-8 text-white/50 hover:text-white p-2 rounded-full border border-white/10 hover:bg-white/10 transition-all"><X size={24} /></button>
      <div className="w-full max-w-sm bg-white rounded-[2rem] overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-10 duration-500">
        <div className="bg-gradient-to-b from-neutral-100 to-white pt-6 pb-2 px-4 border-b border-gray-100">
           <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white"><Sparkles size={16}/></div><span className="font-bold text-black text-sm">InfiniteMe</span><span className="ml-auto text-xs text-gray-400">刚刚</span></div>
        </div>
        <div className="p-4 bg-white">
           <p className="text-sm text-gray-800 mb-3 leading-relaxed font-medium">{caption}</p>
           <div className={`grid gap-1 rounded-xl overflow-hidden ${validImages.length === 1 ? 'grid-cols-1' : 'grid-cols-3 aspect-square'}`}>
              {validImages.map((item, idx) => (<img key={idx} src={item.imageUrl} className={`w-full h-full object-cover bg-gray-100 ${validImages.length === 1 ? 'aspect-[4/5]' : ''}`} alt="preview" />))}
           </div>
           <div className="flex justify-between items-center mt-4 border-t border-gray-50 pt-3">
              <div className="flex gap-4"><Activity size={20} className="text-black" /><span className="text-xs font-bold mt-0.5">8.8w</span></div>
              <button className="bg-[#07c160] text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-[#06ad56] transition-colors">一键发布</button>
           </div>
        </div>
      </div>
    </div>
  );
};

interface ResultState {
  status: string;
  name: string;
  imageUrl: string | null;
  camera?: string;
}

// -----------------------------------------------------------------------------
// Main Application
// -----------------------------------------------------------------------------

export default function InfiniteMe() {
  const [activeMode, setActiveMode] = useState('identity');
  // Settings
  const [filmMode, setFilmMode] = useState(true);
  const [fidelityMode, setFidelityMode] = useState(true);
  const [ageModifier, setAgeModifier] = useState(0); 
  const [magicMode, setMagicMode] = useState(false); 
  const [duoMode, setDuoMode] = useState(false); 
  const [showPreview, setShowPreview] = useState(false);
  const [steveMode, setSteveMode] = useState(false);
  
  const [sourceImage, setSourceImage] = useState(null);
  const [status, setStatus] = useState('idle');
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [detectedGender, setDetectedGender] = useState(null);
  const [accentColor, setAccentColor] = useState(null);
  
  const [analysisData, setAnalysisData] = useState('');
  const [genderContextData, setGenderContextData] = useState('');
  
  // Single Source of Truth for Images
  const [results, setResults] = useState<ResultState[]>(Array.from({ length: 9 }, () => ({ status: 'idle', name: '', imageUrl: null })));
  
  const [hoveredImage, setHoveredImage] = useState(null);
  const [posterPrompt, setPosterPrompt] = useState('');
  const [logoClicks, setLogoClicks] = useState(0);
  const [generatingIndex, setGeneratingIndex] = useState(null);

  useEffect(() => {
    if (status === 'generating') {
      const interval = setInterval(() => { setLoadingStep(prev => (prev + 1) % LOADING_STEPS.length); }, 500);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Update results state when mode changes (Reset logic)
  useEffect(() => {
    if (status === 'idle') {
      if (activeMode === 'identity') {
        setResults(PORTRAIT_LENSES.map(lens => ({ status: 'idle', name: lens.name, imageUrl: null })));
      } else {
        setResults(Array.from({ length: 9 }, (_, i) => ({ status: 'idle', name: CAMPAIGN_STORYBOARD[i].role, imageUrl: null })));
      }
    }
  }, [activeMode]);

  const handleUpload = (e) => {
    if (!e) {
      setSourceImage(null);
      setStatus('idle');
      setDetectedGender(null);
      setAnalysisData('');
      setGenderContextData('');
      setResults(Array(9).fill({ status: 'idle', name: '' })); 
      setAccentColor('255, 255, 255');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) { return; }
    const reader = new FileReader();
    reader.onload = () => {
      setSourceImage(reader.result);
      setStatus('idle');
      setDetectedGender(null);
      setAnalysisData('');
      setGenderContextData('');
      // CORRECT Initialization
      if (activeMode === 'identity') {
         setResults(PORTRAIT_LENSES.map(lens => ({ status: 'idle', name: lens.name, imageUrl: null })));
      } else {
         setResults(Array.from({ length: 9 }, (_, i) => ({ status: 'idle', name: CAMPAIGN_STORYBOARD[i].role, imageUrl: null })));
      }
      setAccentColor('255, 255, 255');
    };
    reader.readAsDataURL(file);
  };

  const toggleGender = () => {
    const newGender = detectedGender === 'Male' ? 'Female' : 'Male';
    setDetectedGender(newGender);
    const newContext = newGender === 'Male' ? "SUBJECT IS MALE. WEAR MENSWEAR. MASCULINE POSE." : "SUBJECT IS FEMALE. WEAR WOMENSWEAR. FEMININE POSE.";
    setGenderContextData(newContext);
  };

  const handleLogoClick = () => {
    setLogoClicks(prev => prev + 1);
    if (logoClicks + 1 === 5) {
        setSteveMode(!steveMode);
        setLogoClicks(0);
    }
  };

  const handleSaveAll = () => {
    results.forEach((item, i) => {
      if (item.status === 'success' && item.imageUrl) {
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = item.imageUrl;
          link.download = `InfiniteMe_${i}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, i * 200);
      }
    });
  };

  const handleRegenerateSingle = async (index) => {
    if (!sourceImage || !analysisData) return;
    
    setGeneratingIndex(index);
    setResults(prev => { 
        const n = [...prev]; 
        n[index] = { ...n[index], status: 'loading' }; 
        return n; 
    });

    try {
        let url;
        const magicPrompt = magicMode ? "Add magical fantasy elements, sparkles, surreal atmosphere." : "";
        
        if (activeMode === 'identity') {
            const style = PORTRAIT_LENSES[index];
            let agePrompt = ageModifier === 1 ? "Make subject look 20 years older." : ageModifier === -1 ? "Make subject look younger." : "";
            let duoPrompt = duoMode ? "Add a partner. Couple portrait." : "";
            
            const fidelityPrompt = fidelityMode 
                ? "STRICT FACE LOCK. 100% resemblance." 
                : "20% BEAUTIFICATION allowed. Dreamy likeness.";

            const prompt = `
                ROLE: Master Photographer (Annie Leibovitz Style).
                TASK: Re-photograph the PERSON.
                GENDER: ${genderContextData}. 
                ${fidelityPrompt}
                MODIFIERS: ${agePrompt} ${duoPrompt} ${magicPrompt}. 
                STYLE: ${style.basePrompt}. 
                BIOMETRICS: ${analysisData}.
                NEGATIVE: text, bad hands, plastic.
            `;
            url = await callGemini(sourceImage, prompt);
            setResults(prev => { 
                const n = [...prev]; 
                n[index] = { ...n[index], status: 'success', imageUrl: url, name: style.name, camera: style.camera }; 
                return n; 
            });
        } else {
            const shotConfig = CAMPAIGN_STORYBOARD[index];
            const themePrompt = posterPrompt || 'Minimalist Luxury';
            const prompt = `ROLE: Commercial Photographer. IMAGE ${index+1}/9. THEME: ${themePrompt}. SHOT: ${shotConfig.role} - ${shotConfig.prompt}. PRODUCT: ${analysisData}. 8K. NO TEXT. PHYSICS: Caustics/Reflection.`;
            url = await callGemini(sourceImage, prompt);
            setResults(prev => { 
                const n = [...prev]; 
                n[index] = { ...n[index], status: 'success', imageUrl: url, name: shotConfig.role }; 
                return n; 
            });
        }
    } catch (e) {
        setResults(prev => { 
            const n = [...prev]; 
            n[index] = { ...n[index], status: 'error' }; 
            return n; 
        });
    } finally {
        setGeneratingIndex(null);
    }
  };

  const runProcess = async () => {
    if (!sourceImage) return;
    
    const blackout = document.createElement('div');
    blackout.className = "fixed inset-0 bg-[#09090b] z-[200] animate-out fade-out duration-300 pointer-events-none";
    document.body.appendChild(blackout);
    setTimeout(() => blackout.remove(), 300);

    setStatus('analyzing');
    
    try {
      const desc = await analyzeImage(sourceImage, activeMode);
      setAnalysisData(desc);
      
      const isWarm = desc.includes('warm') || desc.includes('gold') || desc.includes('red');
      setAccentColor(isWarm ? '255, 200, 100' : '200, 220, 255');

      let genderContext = "";
      if (activeMode === 'identity') {
        const isMale = desc.toLowerCase().includes('male') && !desc.toLowerCase().includes('female');
        const isFemale = desc.toLowerCase().includes('female');
        if (isMale) { setDetectedGender("Male"); genderContext = "SUBJECT IS MALE. WEAR MENSWEAR. MASCULINE POSE."; } 
        else if (isFemale) { setDetectedGender("Female"); genderContext = "SUBJECT IS FEMALE. WEAR WOMENSWEAR. FEMININE POSE."; } 
        else { setDetectedGender("Neutral"); genderContext = "SUBJECT GENDER NEUTRAL."; }
        setGenderContextData(genderContext);
      }
      
      setStatus('generating');

      if (activeMode === 'identity') {
        // Init loading state for all
        setResults(PORTRAIT_LENSES.map(lens => ({ status: 'loading', name: lens.name, imageUrl: null })));
        
        const promises = PORTRAIT_LENSES.map(async (style, idx) => {
          let agePrompt = ageModifier === 1 ? "Make subject look 20 years older." : ageModifier === -1 ? "Make subject look younger." : "";
          let duoPrompt = duoMode ? "Add a partner. Couple portrait." : "";
          const magicPrompt = magicMode ? "Add magical fantasy elements, sparkles, surreal atmosphere." : "";
          
          const fidelityPrompt = fidelityMode 
             ? "CRITICAL: STRICT IDENTITY LOCK. Biometric match." 
             : "CREATIVE: 20% Beautification allowed. Idealized version.";

          const prompt = `
            ROLE: Master Photographer (Annie Leibovitz Style).
            TASK: Re-photograph the PERSON.
            GENDER PROTOCOL: ${genderContext}
            ${fidelityPrompt}
            MODIFIERS: ${agePrompt} ${duoPrompt} ${magicPrompt}
            STYLE SETTINGS: ${style.basePrompt}
            SUBJECT BIOMETRICS: ${desc}
            NEGATIVE PROMPT: text, watermark, bad hands, extra fingers, cartoon, plastic skin, ${genderContext.includes('MALE') ? 'dress, makeup' : 'beard'}.
          `;
          try {
            const url = await callGemini(sourceImage, prompt);
            setResults(prev => { 
                const n = [...prev]; 
                n[idx] = { ...n[idx], status: 'success', imageUrl: url, name: style.name, camera: style.camera }; 
                return n; 
            });
          } catch(e) { 
            setResults(prev => { 
                const n = [...prev]; 
                n[idx] = { ...n[idx], status: 'error' }; 
                return n; 
            });
          }
        });
        await Promise.all(promises);
      } else {
        // Init loading state for all posters
        setResults(CAMPAIGN_STORYBOARD.map(shot => ({ status: 'loading', name: shot.role, imageUrl: null })));
        
        const promises = CAMPAIGN_STORYBOARD.map(async (shotConfig, idx) => {
          const themePrompt = posterPrompt || 'Minimalist Luxury';
          const prompt = `
            ROLE: Top-Tier Commercial Photographer.
            TASK: Image ${idx + 1}/9 for Product Campaign.
            PRODUCT BRIEF: ${desc} (Must Preserve Logo/Shape).
            CAMPAIGN THEME: ${themePrompt}.
            SHOT ROLE: ${shotConfig.role}.
            VISUAL DIRECTION: ${shotConfig.prompt}.
            TECH SPECS: Octane Render Style, Global Illumination, 8K Texture.
            NO TEXT. NO LABELS. PURE VISUALS.
          `;
          try {
            const url = await callGemini(sourceImage, prompt);
            setResults(prev => { 
                const n = [...prev]; 
                n[idx] = { ...n[idx], status: 'success', imageUrl: url, name: shotConfig.role }; 
                return n; 
            });
          } catch(e) { 
            setResults(prev => { 
                const n = [...prev]; 
                n[idx] = { ...n[idx], status: 'error' }; 
                return n; 
            });
          }
        });
        await Promise.all(promises);
      }
      setStatus('complete');
    } catch (err) { setErrorMsg(err.message); setStatus('idle'); }
  };

  const readyToShoot = sourceImage && (activeMode === 'identity' || (activeMode === 'poster' && posterPrompt));

  return (
    <div className={`relative w-full h-screen font-sans overflow-hidden selection:bg-white/20 cursor-default transition-colors duration-1000 ${steveMode ? 'bg-white text-black' : 'bg-[#09090b] text-zinc-100'}`}>
      <GlobalStyles />
      
      {/* 7. Ambient Immersive Background */}
      <div className="absolute inset-0 pointer-events-none z-0 transition-all duration-[2000ms] ease-out">
        {/* Background changes based on Hovered Image */}
        <div className={`absolute inset-0 bg-noise opacity-${filmMode ? '50' : '0'}`} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#09090b]/80 to-[#09090b]" />
        
        {hoveredImage ? (
           <div className="absolute inset-0 bg-cover bg-center blur-[80px] opacity-40 scale-110 transition-all duration-[1000ms] ease-out" style={{backgroundImage: `url(${hoveredImage})`}} />
        ) : sourceImage ? (
          <div className="absolute inset-0 bg-cover bg-center blur-[120px] opacity-20 scale-125 transition-all duration-[3000ms] ease-fluid" style={{backgroundImage: `url(${sourceImage})`}} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-30"><div className="w-[80vw] h-[80vw] bg-white/5 rounded-full blur-[150px]" /></div>
        )}
      </div>

      {/* 6. Minimal Header (Logo Only) */}
      <div className="absolute top-10 left-10 z-40 opacity-40 hover:opacity-100 transition-opacity duration-700 ease-fluid cursor-pointer" onClick={handleLogoClick}>
         <span className="font-light tracking-[0.4em] text-[9px] uppercase">InfiniteMe v19.1</span>
      </div>
      
      {/* Main Stage */}
      <div className="relative z-10 w-full h-full flex flex-col md:flex-row gap-8 p-8 md:p-12">
        
        {/* Floating Console */}
        <div className="w-full md:w-[360px] flex flex-col justify-center gap-8 h-full relative z-20">
           {/* Viewfinder */}
           <Viewfinder 
             image={sourceImage} 
             onUpload={handleUpload} 
             label={activeMode === 'identity' ? "Subject" : "Object"} 
             isScanning={status === 'analyzing'} 
             detectedGender={detectedGender}
             onGenderToggle={toggleGender}
             filmMode={filmMode}
           />
           
           {/* Contextual Tools */}
           <div className="flex flex-col gap-4">
             {activeMode === 'identity' ? (
                <div className="flex justify-center gap-6 text-white/30">
                   {/* 1. Fidelity Toggle */}
                   <button onClick={() => setFidelityMode(!fidelityMode)} className={`flex items-center gap-2 hover:text-white transition-colors ${!fidelityMode && 'text-purple-400'}`}>
                      {fidelityMode ? <Lock size={12}/> : <Unlock size={12}/>} {fidelityMode ? 'Strict' : 'Dream'}
                   </button>
                   <button onClick={() => setDuoMode(!duoMode)} className={`flex items-center gap-2 hover:text-white transition-colors ${duoMode && 'text-purple-400'}`}><UserCheck size={12}/> Duo</button>
                   <button onClick={() => setMagicMode(!magicMode)} className={`flex items-center gap-2 hover:text-white transition-colors ${magicMode && 'text-amber-400'}`}><Wand2 size={12}/> Magic</button>
                </div>
             ) : (
               <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar mask-gradient justify-center">
                  {STUDIO_THEMES.map(hook => (
                    <button key={hook.id} onClick={() => setPosterPrompt(hook.prompt)} className={`whitespace-nowrap text-[9px] font-bold tracking-[0.2em] uppercase transition-all duration-300 ease-fluid ${posterPrompt === hook.prompt ? 'text-white scale-110' : 'text-neutral-600 hover:text-neutral-400'}`}>
                      {hook.label.split('|')[0]}
                    </button>
                  ))}
               </div>
             )}
           </div>

           {/* Shutter */}
           <div className="flex flex-col items-center gap-6">
              <ShutterButton status={status} onClick={runProcess} disabled={!readyToShoot || status === 'analyzing' || status === 'generating'} accentColor={accentColor} />
              <div className="h-4 text-[9px] font-mono tracking-[0.25em] text-neutral-600 uppercase transition-colors duration-500">
                 {status === 'analyzing' ? 'Acquiring Subject...' : status === 'generating' ? LOADING_STEPS[loadingStep] : 'Ready'}
              </div>
           </div>
        </div>

        {/* Gallery */}
        <div className="flex-1 h-full flex items-center justify-center relative z-10">
           <div className="grid grid-cols-3 gap-[2px] w-full max-w-[80vh] aspect-square bg-[#121214] p-[2px] shadow-2xl rounded-sm transition-all duration-500">
              {results.map((item, idx) => (
                 <ParallaxCard 
                   key={idx} 
                   index={idx} 
                   item={item} 
                   onClick={() => item.imageUrl && window.open(item.imageUrl, '_blank')} 
                   onRegenerate={() => handleRegenerateSingle(idx)}
                   filmMode={filmMode}
                   active={true}
                   onHover={() => item.imageUrl && setHoveredImage(item.imageUrl)}
                   isFocusMode={generatingIndex !== null && generatingIndex !== idx}
                 />
              ))}
           </div>
           
           {status === 'complete' && (
             <div className="absolute top-0 right-0 p-4 flex flex-col gap-4 items-end">
               <button onClick={() => setShowPreview(true)} className="text-white/20 hover:text-white transition-colors flex items-center gap-2 text-[10px] tracking-widest uppercase">
                 <Activity size={14} /> Preview
               </button>
               <button onClick={handleSaveAll} className="text-white/20 hover:text-white transition-colors flex items-center gap-2 text-[10px] tracking-widest uppercase">
                 <DownloadCloud size={14} /> Save All
               </button>
             </div>
           )}
        </div>
      </div>

      <Dock activeMode={activeMode} setActiveMode={setActiveMode} />
      
      {showPreview && <CinemaPreview images={results} mode={activeMode} posterPrompt={posterPrompt} onClose={() => setShowPreview(false)} />}
      
      {errorMsg && <div className="fixed top-10 left-1/2 -translate-x-1/2 text-[9px] text-red-400/50 font-mono tracking-widest uppercase animate-in fade-in slide-in-from-top-4 duration-700">{errorMsg}</div>}
    </div>
  );
}