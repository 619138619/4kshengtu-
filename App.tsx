import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Wand2, 
  Palette, 
  Image as ImageIcon, 
  Download, 
  X, 
  Sparkles, 
  LayoutGrid,
  Settings,
  AlertCircle
} from 'lucide-react';
import { Button } from './components/Button';
import { STYLE_PRESETS } from './constants';
import { AppMode, GeneratedImage, ImageSize } from './types';
import * as geminiService from './services/geminiService';

const ResultCard = ({ image }: { image: GeneratedImage }) => (
  <div className="relative group rounded-xl overflow-hidden bg-surface border border-slate-700 aspect-square">
    {image.isLoading ? (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-slate-400 text-center animate-pulse">
          {image.styleName ? `正在应用 ${image.styleName}...` : '正在生成...'}
        </p>
      </div>
    ) : image.url ? (
      <>
        <img src={image.url} alt="Generated" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <p className="text-white font-medium mb-2">{image.styleName || '生成图像'}</p>
          <a 
            href={image.url} 
            download={`gemini-gen-${image.id}.png`}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <Download size={16} /> 下载
          </a>
        </div>
      </>
    ) : (
      <div className="absolute inset-0 flex items-center justify-center text-red-400 bg-red-900/10">
        <AlertCircle size={24} className="mr-2" /> 失败
      </div>
    )}
  </div>
);

const App = () => {
  // State
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.STYLES);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.SIZE_1K);
  
  // Logic to handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await geminiService.fileToBase64(file);
        setSelectedImage(base64);
        setGeneratedImages([]); // Clear previous results
      } catch (e) {
        console.error("Failed to load image", e);
      }
    }
  };

  // Check API Key on mount
  useEffect(() => {
    const checkKey = async () => {
      try {
        const ready = await geminiService.checkApiKeySelection();
        setApiKeyReady(ready);
      } catch (e) {
        console.error("Error checking API key", e);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    await geminiService.promptSelectKey();
    // Per guidelines: MUST assume the key selection was successful after triggering openSelectKey
    setApiKeyReady(true);
  };

  // 1. Logic for "8 Styles" Generation
  const generateStyles = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);
    setGeneratedImages([]); // Reset

    // Initialize placeholders
    const placeholders: GeneratedImage[] = STYLE_PRESETS.map(preset => ({
      id: preset.id,
      url: '',
      styleName: preset.name,
      prompt: preset.promptSuffix,
      isLoading: true
    }));
    setGeneratedImages(placeholders);

    // Launch parallel requests (note: might hit rate limits, so we handle individually)
    const promises = STYLE_PRESETS.map(async (preset, index) => {
      try {
        const url = await geminiService.generateStyledImage(selectedImage, preset.promptSuffix);
        setGeneratedImages(prev => prev.map(img => 
          img.id === preset.id ? { ...img, url, isLoading: false } : img
        ));
      } catch (error) {
        console.error(`Failed to generate ${preset.name}`, error);
        setGeneratedImages(prev => prev.map(img => 
          img.id === preset.id ? { ...img, isLoading: false } : img // Leave url empty or add error state
        ));
      }
    });

    await Promise.allSettled(promises);
    setIsProcessing(false);
  };

  // 2. Logic for Editing
  const handleEdit = async () => {
    if (!selectedImage || !prompt) return;
    setIsProcessing(true);
    const id = Date.now().toString();
    
    // Add placeholder
    setGeneratedImages(prev => [{
      id,
      url: '',
      prompt: prompt,
      isLoading: true
    }, ...prev]);

    try {
      const url = await geminiService.editImageWithPrompt(selectedImage, prompt);
      setGeneratedImages(prev => prev.map(img => 
        img.id === id ? { ...img, url, isLoading: false } : img
      ));
    } catch (error) {
      console.error("Edit failed", error);
      setGeneratedImages(prev => prev.filter(img => img.id !== id)); // Remove failed
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Logic for Generation
  const handleGenerate = async () => {
    if (!prompt) return;
    setIsProcessing(true);
    const id = Date.now().toString();

    setGeneratedImages(prev => [{
      id,
      url: '',
      prompt: prompt,
      isLoading: true
    }, ...prev]);

    try {
      const url = await geminiService.generateImageFromScratch(prompt, imageSize);
      setGeneratedImages(prev => prev.map(img => 
        img.id === id ? { ...img, url, isLoading: false } : img
      ));
    } catch (error) {
      console.error("Generation failed", error);
      setGeneratedImages(prev => prev.filter(img => img.id !== id));
    } finally {
      setIsProcessing(false);
    }
  };

  // UI Components
  const Navigation = () => (
    <nav className="flex flex-col md:flex-row gap-4 mb-8">
      <button 
        onClick={() => setMode(AppMode.STYLES)}
        className={`flex-1 p-4 rounded-xl border transition-all flex items-center justify-center gap-3 ${mode === AppMode.STYLES ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-slate-700 text-slate-400 hover:bg-slate-700'}`}
      >
        <LayoutGrid size={20} />
        <span className="font-semibold">风格百变 (8种风格)</span>
      </button>
      <button 
        onClick={() => setMode(AppMode.EDIT)}
        className={`flex-1 p-4 rounded-xl border transition-all flex items-center justify-center gap-3 ${mode === AppMode.EDIT ? 'bg-accent/20 border-accent text-accent' : 'bg-surface border-slate-700 text-slate-400 hover:bg-slate-700'}`}
      >
        <Wand2 size={20} />
        <span className="font-semibold">魔法编辑</span>
      </button>
      <button 
        onClick={() => setMode(AppMode.GENERATE)}
        className={`flex-1 p-4 rounded-xl border transition-all flex items-center justify-center gap-3 ${mode === AppMode.GENERATE ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-surface border-slate-700 text-slate-400 hover:bg-slate-700'}`}
      >
        <ImageIcon size={20} />
        <span className="font-semibold">创意生成</span>
      </button>
    </nav>
  );

  const Uploader = () => (
    <div className="relative group cursor-pointer">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload} 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${selectedImage ? 'border-primary/50 bg-primary/5' : 'border-slate-600 hover:border-slate-500 bg-surface'}`}>
        {selectedImage ? (
          <div className="relative w-64 h-64 rounded-lg overflow-hidden shadow-2xl">
            <img src={`data:image/png;base64,${selectedImage}`} alt="Uploaded" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white font-medium flex items-center gap-2">
                <Upload size={18} /> 更换图片
              </span>
            </div>
          </div>
        ) : (
          <div className="py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <Upload size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">上传参考照片</h3>
            <p className="text-slate-400">拖放或点击选择人像照片</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="border-b border-slate-800 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                PersonaMorph AI
              </h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">POWERED BY GEMINI</p>
            </div>
          </div>
          
          {!apiKeyReady ? (
            <Button onClick={handleSelectKey} variant="secondary">
              <Settings size={16} /> 连接 Google Cloud 项目
            </Button>
          ) : (
             <div className="flex items-center gap-2 text-green-500 text-sm font-medium bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               API 已连接
             </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4">重塑现实</h2>
          <p className="text-slate-400 text-lg">
            利用 Nano Banana Pro (Gemini 3) 的力量重塑风格、编辑和生成令人惊叹的视觉效果。
          </p>
        </div>

        <Navigation />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface border border-slate-700 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  输入
                </h3>
                {mode === AppMode.GENERATE && (
                   <select 
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value as ImageSize)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:ring-primary focus:border-primary"
                   >
                     <option value={ImageSize.SIZE_1K}>1K 分辨率</option>
                     <option value={ImageSize.SIZE_2K}>2K 分辨率</option>
                     <option value={ImageSize.SIZE_4K}>4K 分辨率</option>
                   </select>
                )}
              </div>

              {/* Dynamic Input Area based on Mode */}
              {mode !== AppMode.GENERATE && (
                <div className="mb-6">
                  <Uploader />
                </div>
              )}

              {/* Controls */}
              <div className="space-y-4">
                {mode === AppMode.STYLES && (
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-sm text-slate-400 mb-4">
                      我们将使用 <span className="text-primary font-mono">gemini-3-pro-image-preview</span> 自动为您生成 8 种独特的艺术变体。
                    </p>
                    <Button 
                      onClick={generateStyles} 
                      disabled={!selectedImage} 
                      isLoading={isProcessing} 
                      className="w-full py-4 text-lg"
                    >
                      <Palette size={20} /> 生成 8 种风格
                    </Button>
                  </div>
                )}

                {mode === AppMode.EDIT && (
                  <div className="space-y-4">
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="例如：'戴上一副墨镜' 或 '将背景改为海滩'"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-accent outline-none min-h-[120px]"
                    />
                    <Button 
                      onClick={handleEdit} 
                      disabled={!selectedImage || !prompt} 
                      isLoading={isProcessing} 
                      className="w-full"
                      variant="primary" // Changed to primary for better visibility
                    >
                      <Wand2 size={18} /> 编辑图片
                    </Button>
                  </div>
                )}

                {mode === AppMode.GENERATE && (
                  <div className="space-y-4">
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="详细描述您想要创建的图像..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-green-500 outline-none min-h-[160px]"
                    />
                    <Button 
                      onClick={handleGenerate} 
                      disabled={!prompt} 
                      isLoading={isProcessing} 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/20"
                    >
                      <Sparkles size={18} /> 创意生成
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Info Card */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3">
              <div className="mt-1 text-blue-400">
                <Settings size={18} />
              </div>
              <div>
                <h4 className="text-blue-200 font-medium text-sm mb-1">模型信息</h4>
                <p className="text-xs text-blue-300/70 leading-relaxed">
                  {mode === AppMode.STYLES && "使用 'gemini-3-pro-image-preview' (Nano Banana Pro) 进行高保真风格转换。"}
                  {mode === AppMode.EDIT && "使用 'gemini-2.5-flash-image' 进行快速、准确的指令编辑。"}
                  {mode === AppMode.GENERATE && "使用 'gemini-3-pro-image-preview' 进行 4K 高分辨率生成。"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel: Gallery */}
          <div className="lg:col-span-8">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-1 h-6 bg-accent rounded-full"></span>
                  画廊
                </h3>
                {generatedImages.length > 0 && (
                  <span className="text-sm text-slate-500">{generatedImages.length} 个结果</span>
                )}
             </div>

             {generatedImages.length === 0 ? (
               <div className="bg-surface border border-slate-700 border-dashed rounded-2xl h-[500px] flex flex-col items-center justify-center text-slate-500">
                 <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                   <ImageIcon size={32} className="opacity-50" />
                 </div>
                 <p className="text-lg font-medium">尚未生成图像</p>
                 <p className="text-sm opacity-70 mt-2 max-w-xs text-center">选择一种模式并开始创作，您的杰作将显示在这里。</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {generatedImages.map((img) => (
                   <ResultCard key={img.id} image={img} />
                 ))}
               </div>
             )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;