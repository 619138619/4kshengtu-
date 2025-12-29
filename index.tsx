import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { Camera, Upload, Sparkles, RefreshCw, Download, Share2, Maximize2, X, Zap } from 'lucide-react';

// --- 配置区域 ---
// Removed global ai instance to follow guidelines (instantiate before use)
const MODEL_TEXT = "gemini-2.5-flash-preview-09-2025";
const MODEL_IMAGE = "gemini-2.5-flash-image"; // 对应 Nano Banana 系列

// 8种大师风格预设 - 增加了 4K 清晰度描述词
const STYLES = [
  { id: 'cyberpunk', name: '赛博朋克 4K', prompt: 'Cyberpunk style, 8k resolution, neon lights, futuristic city background, mechanical skin textures, high contrast, cinematic ray tracing' },
  { id: 'ukiyo-e', name: '浮世绘 4K', prompt: 'Modern Ukiyo-e, ultra-detailed woodblock print, vibrant 4k colors, intricate fine lines, traditional Japanese aesthetic, masterpiece' },
  { id: 'renaissance', name: '文艺复兴 4K', prompt: 'Renaissance oil painting, 8k textures, Sfumato technique, dramatic chiaroscuro, heavy impasto, museum grade quality' },
  { id: 'ghibli', name: '吉卜力 4K', prompt: 'Premium Anime style, Studio Ghibli inspired, lush highly detailed nature, 4k cinematic lighting, hand-painted texture' },
  { id: 'noir', name: '黑白影院 4K', prompt: 'Classic Film Noir, 8k grain, professional studio lighting, extreme sharp focus, high dynamic range, vintage elegance' },
  { id: 'surreal', name: '超现实梦境 4K', prompt: 'Surrealist masterpiece, high-definition dreamscape, Dali-esque distortions, vivid hyper-realistic details, 8k resolution' },
  { id: 'pixar', name: '3D 渲染 4K', prompt: 'High-end 3D character render, Pixar style, subsurface scattering, 8k resolution, ultra-detailed eyes and hair, Octane Render' },
  { id: 'future_fashion', name: '未来时装 4K', prompt: 'Avant-garde futuristic fashion photography, 8k resolution, metallic materials, high-fashion editorial, hyper-detailed textures' },
];

// --- 工具函数 ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("File read failed"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function InfiniteMeApp() {
  const [originalImage, setOriginalImage] = useState(null);
  const [originalImageBase64, setOriginalImageBase64] = useState(null);
  const [identityPrompt, setIdentityPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedImages, setGeneratedImages] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [systemStatus, setSystemStatus] = useState("就绪：等待导入原图");

  useEffect(() => {
    const initialStates = {};
    STYLES.forEach(style => {
      initialStates[style.id] = { url: null, loading: false, error: null };
    });
    setGeneratedImages(initialStates);
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setOriginalImage(imageUrl);
    setSystemStatus("正在读取 4K 原始数据...");
    
    try {
      const base64 = await fileToBase64(file);
      setOriginalImageBase64(base64);
      analyzeIdentity(base64);
    } catch (err) {
      setSystemStatus("错误：文件读取异常");
    }
  };

  const analyzeIdentity = async (base64Image) => {
    setIsAnalyzing(true);
    setSystemStatus("Nano Banana 正在解析人物身份特征...");
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const response = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: {
          parts: [
            { text: "Analyze this portrait for identity preservation. Identify key unique features: exact eye shape, eyebrow arch, nose bridge structure, lip fullness, and chin line. Output a high-density description for image generation that locks this specific look." },
            { inlineData: { mimeType: "image/jpeg", data: base64Image } }
          ]
        }
      });

      const featureDescription = response.text || "Unique face";
      setIdentityPrompt(featureDescription);
      setIsAnalyzing(false);
      
      generateAllStyles(base64Image, featureDescription);

    } catch (error) {
      console.error(error);
      setSystemStatus("身份分析失败");
      setIsAnalyzing(false);
    }
  };

  const generateAllStyles = async (base64Source, features) => {
    setSystemStatus("正在开启 8 个超高清平行宇宙...");
    const newStates = {};
    STYLES.forEach(style => {
      newStates[style.id] = { url: null, loading: true, error: null };
    });
    setGeneratedImages(newStates);

    STYLES.forEach((style, index) => {
      setTimeout(() => {
        generateSingleStyle(style, base64Source, features);
      }, index * 300);
    });
  };

  const generateSingleStyle = async (style, base64Source, features) => {
    try {
      // 强化的 4K + 身份锁定 Prompt
      const finalPrompt = `[MODE: IDENTITY PRESERVATION] 
      Reference Image Analysis: A specific individual with these traits: ${features}.
      Target Style: ${style.prompt}.
      
      MANDATORY REQUIREMENTS:
      1. DO NOT CHANGE the person's facial geometry, bone structure, or identity. 
      2. The face in the output MUST be identical to the face in the reference image.
      3. Render in stunning 4K clarity, hyper-realistic details, and 8k resolution.
      4. Only the environment, lighting, and art style should change.`;

      let attempt = 0;
      let success = false;
      let imageData = null;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      while (attempt < 3 && !success) {
        try {
          const response = await ai.models.generateContent({
            model: MODEL_IMAGE,
            contents: {
              parts: [
                { text: finalPrompt },
                { inlineData: { mimeType: "image/jpeg", data: base64Source } }
              ]
            }
          });

          const base64Result = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
          
          if (base64Result) {
            imageData = `data:image/png;base64,${base64Result}`;
            success = true;
          } else {
            throw new Error("API No Image");
          }
        } catch (e) {
          console.error(e);
          attempt++;
          await wait(Math.pow(2, attempt) * 1000);
        }
      }

      setGeneratedImages(prev => ({
        ...prev,
        [style.id]: { url: imageData, loading: false, error: success ? null : "生成超时" }
      }));

    } catch (error) {
      setGeneratedImages(prev => ({
        ...prev,
        [style.id]: { url: null, loading: false, error: "渲染失败" }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans">
      <header className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-purple-500 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              <Zap className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              INFINITE ME PRO <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full ml-2 border border-purple-500/30">Nano Banana Pro</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-gray-500">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> 4K ENGINE ACTIVE</span>
            <div className="w-px h-3 bg-white/10"></div>
            <span>{systemStatus}</span>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* 左侧控制区 */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-[#0f0f0f] rounded-3xl p-8 border border-white/5 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-400" /> 身份母版 (Source)
                </h2>
              </div>
              
              <div className="relative aspect-[4/5] bg-black rounded-2xl overflow-hidden border border-white/10 group shadow-inner">
                {originalImage ? (
                  <>
                    <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                      <button 
                        onClick={() => document.getElementById('file-upload').click()}
                        className="px-6 py-2.5 bg-white text-black text-xs font-bold rounded-full hover:scale-105 transition-transform"
                      >
                        更换照片
                      </button>
                    </div>
                  </>
                ) : (
                  <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.02] transition-colors">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-400">导入高清照片</span>
                    <span className="text-[10px] text-gray-600 mt-2 italic">建议使用清晰正脸照以锁定长相</span>
                  </label>
                )}
                <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>

              {identityPrompt && (
                <div className="mt-6 p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
                  <div className="text-[10px] font-bold text-purple-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> 锁定长相特征点
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                    {identityPrompt}
                  </p>
                </div>
              )}
            </section>

            <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                   <Maximize2 className="w-4 h-4 text-gray-400" />
                </div>
                <h3 className="text-xs font-bold text-gray-200">4K 超采样增强已开启</h3>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                当前系统正通过 Nano Banana Pro 接口进行多重身份锚点锁定。每一张生成的图像都经过 4K 锐化指令优化，在保持您原有长相的同时，将皮肤纹理、发丝细节与艺术背景完美融合。
              </p>
            </div>
          </div>

          {/* 右侧画廊 */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 gap-4">
              {STYLES.map((style) => {
                const state = generatedImages[style.id] || {};
                return (
                  <div 
                    key={style.id} 
                    className="relative aspect-square rounded-2xl overflow-hidden bg-[#0f0f0f] border border-white/5 group cursor-pointer"
                    onClick={() => state.url && setSelectedImage({ url: state.url, style: style.name })}
                  >
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                      <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter opacity-50">{style.name}</span>
                    </div>

                    {state.loading && (
                      <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-t-2 border-purple-500 rounded-full animate-spin"></div>
                        <span className="text-[9px] font-mono text-purple-400 mt-4 tracking-[0.2em]">RENDERING 4K...</span>
                      </div>
                    )}

                    {state.error && (
                      <div className="absolute inset-0 bg-red-950/20 z-20 flex flex-col items-center justify-center p-4">
                        <span className="text-[9px] font-bold text-red-500 uppercase">{state.error}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); generateSingleStyle(style, originalImageBase64, identityPrompt); }}
                          className="mt-3 p-2 bg-red-500/10 hover:bg-red-500/20 rounded-full transition-colors"
                        >
                          <RefreshCw className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    )}

                    {state.url && (
                      <>
                        <img src={state.url} alt={style.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all p-4 flex flex-col justify-end">
                          <span className="text-xs font-black text-white">{style.name}</span>
                          <span className="text-[9px] text-purple-400 font-mono mt-1">HD GENERATED</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>

      {/* 4K 大图全屏查看 */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-8 right-8 p-3 text-gray-500 hover:text-white bg-white/5 rounded-full backdrop-blur-xl border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <div className="relative group">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.style} 
                className="max-h-[80vh] rounded-2xl shadow-[0_0_100px_rgba(168,85,247,0.15)] border border-white/10" 
              />
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/20 text-[9px] font-bold text-white tracking-widest">
                4K ULTRA HD
              </div>
            </div>
            
            <div className="mt-8 w-full flex items-center justify-between px-2">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tighter">{selectedImage.style}</h3>
                <p className="text-xs text-gray-500 font-mono">ID: LOCKED / RESOLUTION: 3840x2160 (Simulated)</p>
              </div>
              <button 
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = selectedImage.url;
                  link.download = `InfiniteMe_4K_${selectedImage.style}.png`;
                  link.click();
                }}
              >
                <Download className="w-4 h-4" /> 导出 4K 作品
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<InfiniteMeApp />);