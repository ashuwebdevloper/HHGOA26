import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpRight,
  Badge,
  Camera,
  Check,
  ChevronRight,
  Code2,
  ImagePlus,
  Loader2,
  Maximize2,
  Move,
  RefreshCcw,
  RotateCcw,
  Share2,
  Sparkles,
  UserRound,
  WandSparkles,
  X,
} from 'lucide-react';
import { generateGraphic, type GenerateResult } from '@/lib/generate';
import { generateBuilderTitle, HASHTAG } from '@/lib/builderTitles';
import { cropPhoto } from '@/lib/image';
import { EVENT } from '@/lib/constants';

type Step = 'upload' | 'crop' | 'details' | 'result';
type Format = 'pfp' | 'card';

function App() {
  const [step, setStep] = useState<Step>('upload');
  const [format, setFormat] = useState<Format>('pfp');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [name, setName] = useState('');
  const [stack, setStack] = useState('');
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [shareToast, setShareToast] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const handleGenerate = useCallback(async (photo: File, selectedFormat: Format, cardInput?: { name: string; stack: string }) => {
    setGenerating(true);
    setError('');
    try {
      const generated = await generateGraphic(photo, selectedFormat, cardInput);
      setResult(generated);
      setStep('result');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The graphic could not be created. Try another photo.');
    } finally {
      setGenerating(false);
    }
  }, []);

  const handleFile = useCallback((photo: File) => {
    setError('');
    if (!photo.type.startsWith('image/') && !/\.(heic|heif)$/i.test(photo.name)) {
      setError('Use a JPG, PNG, or HEIC photo.');
      return;
    }
    setFile(photo);
    setPreviewUrl(URL.createObjectURL(photo));
    if (format === 'pfp') handleGenerate(photo, 'pfp');
    else setStep('crop');
  }, [format, handleGenerate]);

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const download = () => {
    if (!result) return;
    const anchor = document.createElement('a');
    anchor.href = result.dataUrl;
    anchor.download = `hhgoa-2026-${result.format}.png`;
    anchor.click();
  };

  const share = () => {
    if (!result) return;
    const text = encodeURIComponent(result.caption);
    const url = encodeURIComponent(result.shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
    setShareToast(true);
    window.setTimeout(() => setShareToast(false), 3000);
  };

  const confirmCrop = async () => {
    if (!file) return;
    const cropped = await cropPhoto(file, cropZoom, cropOffset);
    setFile(cropped);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(cropped));
    setStep('details');
  };

  const reset = () => {
    setStep('upload');
    setFile(null);
    setResult(null);
    setPreviewUrl('');
    setName('');
    setStack('');
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const predictedTitle = name || stack ? generateBuilderTitle(name, stack) : 'Your title appears here';
  const stepIndex = step === 'upload' ? 1 : step === 'crop' ? 2 : step === 'details' ? 3 : 4;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#005C37] text-[#FFED00]">
      {/* Ambient background layers */}
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-20" />
      <div className="pointer-events-none fixed inset-0 bg-dots opacity-30" />
      <div className="pointer-events-none fixed -left-40 top-0 h-[500px] w-[500px] rounded-full bg-[#FF0A8A]/15 blur-[120px] glow-pulse" />
      <div className="pointer-events-none fixed -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-[#FFED00]/10 blur-[120px] glow-pulse" style={{ animationDelay: '2s' }} />
      <div className="pointer-events-none fixed bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-[#FF0A8A]/10 blur-[100px] glow-pulse" style={{ animationDelay: '1s' }} />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 px-5 py-3 backdrop-blur-xl sm:px-10" style={{ background: 'rgba(0,93,55,0.6)' }}>
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#FFED00]/40 bg-[#FFED00]/10 text-[#FFED00] shadow-[0_0_20px_rgba(255,237,0,0.2)] backdrop-blur-md transition-transform hover:scale-110">
              <Sparkles size={20} strokeWidth={2.5} />
            </div>
            <div className="leading-none">
              <div className="display text-xl font-bold tracking-tight neon-text">HH GOA</div>
              <div className="mt-1 text-[9px] uppercase tracking-[.24em] text-white/50">Frame builder / 2026</div>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-[10px] uppercase tracking-[.22em] sm:flex">
            <span className="glass-pill rounded-full px-3 py-1.5 text-white/60">No login · No wait</span>
            <a href={`https://${EVENT.url}`} className="flex items-center gap-1 font-bold text-[#FFED00] transition-colors hover:text-white">{EVENT.url}<ArrowUpRight size={13} /></a>
          </div>
          <div className="glass-pill flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[.16em] sm:hidden"><span className="h-2 w-2 animate-pulse rounded-full bg-[#FF0A8A]" /> Live</div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1440px] px-5 pb-14 pt-8 sm:px-10 sm:pt-12">
        {/* Hero */}
        <section className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-20">
          <div className="max-w-[760px]">
            <div className="mb-5 flex items-center gap-3 text-[10px] uppercase tracking-[.24em] text-white/50"><span className="h-px w-10 bg-[#FF0A8A]" /> Goa, India · 2026</div>
            <h1 className="display text-[18vw] font-medium uppercase leading-[.78] tracking-[-.045em] sm:text-[120px] lg:text-[148px]" style={{ textShadow: '0 6px 0 rgba(0,0,0,0.15), 0 12px 40px rgba(0,0,0,0.3)' }}>Frame<br /><span className="shimmer-text">your</span><br />moment.</h1>
            <p className="mt-8 max-w-[520px] text-sm leading-7 text-white/65 sm:text-base">Turn one photo into a piece of HH Goa 2026. Pick your format, make it yours, and leave with something worth posting.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="glass-pill flex items-center gap-2 rounded-full px-4 py-2 text-[10px] uppercase tracking-[.16em] text-white/70"><Camera size={14} className="text-[#FFED00]" /> Auto color-grade</div>
              <div className="glass-pill flex items-center gap-2 rounded-full px-4 py-2 text-[10px] uppercase tracking-[.16em] text-white/70"><WandSparkles size={14} className="text-[#FF0A8A]" /> AI-styled frames</div>
              <div className="glass-pill flex items-center gap-2 rounded-full px-4 py-2 text-[10px] uppercase tracking-[.16em] text-white/70"><Share2 size={14} className="text-[#FFED00]" /> One-click share</div>
            </div>
          </div>
          <div className="hidden justify-end lg:flex"><HeroVisual /></div>
        </section>

        {/* Marquee */}
        <div className="my-10 overflow-hidden border-y border-white/10 py-3 text-[10px] uppercase tracking-[.28em] text-white/45 sm:my-14">
          <div className="marquee-track flex min-w-max gap-10"><span>{HASHTAG}</span><span>·</span><span>Made for builders</span><span>·</span><span>Ready for X</span><span>·</span><span>HH Goa 2026</span><span>·</span><span>{HASHTAG}</span><span>·</span><span>Made for builders</span><span>·</span><span>Ready for X</span><span>·</span><span>HH Goa 2026</span><span>·</span></div>
        </div>

        {/* Builder section */}
        <section className="grid gap-8 lg:grid-cols-[.74fr_1.26fr] lg:gap-14">
          <div className="space-y-7">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[.2em] text-white/50"><StepMarker number={stepIndex} /><span>Build your graphic</span></div>
            {step === 'upload' && <UploadPanel format={format} setFormat={setFormat} inputRef={inputRef} dragActive={dragActive} setDragActive={setDragActive} onDrop={onDrop} onFile={handleFile} error={error} />}
            {step === 'crop' && <CropPanel previewUrl={previewUrl} zoom={cropZoom} setZoom={setCropZoom} offset={cropOffset} setOffset={setCropOffset} onBack={reset} onConfirm={confirmCrop} />}
            {step === 'details' && <DetailsPanel previewUrl={previewUrl} name={name} setName={setName} stack={stack} setStack={setStack} predictedTitle={predictedTitle} generating={generating} onBack={() => setStep('crop')} onGenerate={() => file && handleGenerate(file, 'card', { name, stack })} />}
            {step === 'result' && result && <ResultPanel result={result} onDownload={download} onShare={share} onReset={reset} shareToast={shareToast} />}
            {generating && step === 'upload' && (
              <div className="glass-strong flex items-center gap-3 rounded-2xl p-4 text-xs uppercase tracking-[.15em] shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                <Loader2 size={18} className="animate-spin text-[#FFED00]" /> Composing your frame...
              </div>
            )}
          </div>
          <aside className="hidden lg:block"><Manifest /></aside>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 px-5 py-5 backdrop-blur-md sm:px-10" style={{ background: 'rgba(0,93,55,0.4)' }}>
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 text-[10px] uppercase tracking-[.2em] text-white/40">
          <span className="flex items-center gap-2"><Sparkles size={12} className="text-[#FFED00]/50" /> HH Goa 2026</span>
          <span>{EVENT.dateLine}</span>
          <span className="text-[#FF0A8A]/70">{HASHTAG}</span>
        </div>
      </footer>
    </div>
  );
}

/* ── 3D tilt hook ── */
function useTilt(maxDeg = 14) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1200px) rotateY(${x * maxDeg}deg) rotateX(${-y * maxDeg}deg)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg)';
  };
  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

/* ── Hero visual: floating Hindi Goa mark ── */
function HeroVisual() {
  return (
    <div className="relative flex min-h-[360px] w-full items-center justify-center" style={{ perspective: '1000px' }}>
      <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-[#FFED00]/20 blur-3xl glow-pulse" />
      <div className="pointer-events-none absolute h-44 w-44 rounded-full border border-[#FF0A8A]/30 slow-spin" style={{ animationDuration: '20s' }} />
      <div className="hero-float relative" style={{ transform: 'translateZ(40px)' }}>
        <div className="absolute inset-0 rounded-full bg-[#FFED00]/30 blur-2xl" />
        <img src="/assets/goa_hindi.svg" alt="गोवा" className="relative h-48 w-48 drop-shadow-[0_12px_35px_rgba(255,237,0,0.4)] sm:h-64 sm:w-64" style={{ transform: 'rotate(-2deg)' }} />
      </div>
    </div>
  );
}

/* ── Crop panel ── */
function CropPanel({ previewUrl, zoom, setZoom, offset, setOffset, onBack, onConfirm }: { previewUrl: string; zoom: number; setZoom: (z: number) => void; offset: { x: number; y: number }; setOffset: (o: { x: number; y: number }) => void; onBack: () => void; onConfirm: () => void }) {
  return (
    <div className="space-y-5 fade-in">
      <div className="glass-pill flex items-center gap-3 rounded-xl px-4 py-2.5 text-[10px] uppercase tracking-[.2em] text-white/60"><Camera size={15} className="text-[#FFED00]" /><span>Step 02 / Position your photo</span></div>

      <div className="glass-strong relative mx-auto aspect-[290/360] w-full max-w-[300px] overflow-hidden rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
        {previewUrl && <img src={previewUrl} alt="Crop preview" className="absolute inset-0 h-full w-full select-none object-cover" style={{ transform: `scale(${zoom}) translate(${offset.x * 50}%, ${offset.y * 50}%)`, transition: 'transform .15s ease-out' }} draggable={false} />}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-0 h-full w-px bg-white/20" /><div className="absolute left-2/3 top-0 h-full w-px bg-white/20" />
          <div className="absolute left-0 top-1/3 h-px w-full bg-white/20" /><div className="absolute left-0 top-2/3 h-px w-full bg-white/20" />
        </div>
        <div className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-[#FF0A8A]" />
        <div className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-[#FF0A8A]" />
        <div className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-[#FF0A8A]" />
        <div className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-[#FF0A8A]" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-[.18em] text-white/45"><span className="flex items-center gap-1.5"><Maximize2 size={12} /> Zoom</span><span className="text-[#FF0A8A]">{zoom.toFixed(1)}x</span></div>
        <input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="neon-slider w-full" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[.18em] text-white/45"><Move size={12} /> Position</div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { dx: -0.1, dy: -0.1, rot: '-rotate-45' }, { dx: 0, dy: -0.1, rot: '-rotate-90' }, { dx: 0.1, dy: -0.1, rot: 'rotate-45' },
            { dx: -0.1, dy: 0, rot: 'rotate-180' }, { dx: 0, dy: 0, rot: '', reset: true }, { dx: 0.1, dy: 0, rot: '' },
            { dx: -0.1, dy: 0.1, rot: 'rotate-135' }, { dx: 0, dy: 0.1, rot: 'rotate-90' }, { dx: 0.1, dy: 0.1, rot: 'rotate-45' },
          ].map((btn, i) => btn.reset ? (
            <button key={i} onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} className="glass-pill grid h-10 place-items-center rounded-lg hover:border-[#FF0A8A]/60"><RotateCcw size={14} className="text-[#FF0A8A]" /></button>
          ) : (
            <button key={i} onClick={() => setOffset({ x: offset.x + btn.dx, y: offset.y + btn.dy })} className="glass-pill grid h-10 place-items-center rounded-lg hover:border-[#FFED00]/40"><Move size={14} className={btn.rot} /></button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[9px] uppercase tracking-[.18em] text-white/45">Presets:</span>
        {[1, 1.5, 2, 3].map((z) => (
          <button key={z} onClick={() => setZoom(z)} className={`rounded-lg px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-all ${zoom === z ? 'bg-[#FFED00] text-[#005C37]' : 'glass-pill text-white/55'}`}>{z}x</button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={onBack} className="glass-pill rounded-xl px-5 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-white/70 hover:text-white">Back</button>
        <button onClick={onConfirm} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFED00] px-5 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#005C37] shadow-[0_5px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] neon-glow-yellow"><Check size={16} /> Looks good <ArrowUpRight size={15} /></button>
      </div>
      <p className="text-[10px] uppercase leading-5 tracking-[.14em] text-white/35">Center your face using the grid. The crop matches your ID card's proportions exactly.</p>
    </div>
  );
}

/* ── Step marker ── */
function StepMarker({ number }: { number: number }) {
  return <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#FFED00] font-bold text-[#005C37] shadow-[0_3px_0_rgba(0,0,0,0.3),0_0_16px_rgba(255,237,0,0.3)]">0{number}</span>;
}

/* ── Upload panel ── */
function UploadPanel({ format, setFormat, inputRef, dragActive, setDragActive, onDrop, onFile, error }: { format: Format; setFormat: (format: Format) => void; inputRef: React.RefObject<HTMLInputElement | null>; dragActive: boolean; setDragActive: (active: boolean) => void; onDrop: (event: React.DragEvent<HTMLDivElement>) => void; onFile: (file: File) => void; error: string }) {
  return (
    <div className="space-y-5 fade-in">
      <div className="glass grid grid-cols-2 gap-2 rounded-2xl p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
        <FormatButton active={format === 'pfp'} onClick={() => setFormat('pfp')} icon={<UserRound size={17} />} title="PFP frame" copy="Square / profile" />
        <FormatButton active={format === 'card'} onClick={() => setFormat('card')} icon={<Badge size={17} />} title="Builder ID" copy="Portrait / post" />
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`group relative min-h-[320px] cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-8 transition-all duration-300 sm:min-h-[380px] ${dragActive ? 'border-[#FF0A8A] bg-[#FF0A8A]/10 shadow-[0_20px_60px_rgba(255,10,138,0.3)]' : 'glass border-white/15 hover:border-[#FFED00]/50 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] hover:-translate-y-1'}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif" onChange={(e) => { const photo = e.target.files?.[0]; if (photo) onFile(photo); }} className="hidden" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-10" />
        <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
          <div className="upload-ring mb-6 grid h-20 w-20 place-items-center rounded-full border border-[#FFED00]/40 bg-[#FFED00]/10 text-[#FFED00] shadow-[0_10px_40px_rgba(255,237,0,0.2),inset_0_2px_8px_rgba(255,255,255,0.1)] backdrop-blur-md transition-transform group-hover:scale-110">
            <ImagePlus size={30} strokeWidth={2.5} />
          </div>
          <div className="display text-4xl uppercase leading-none sm:text-5xl neon-text">Drop your<br />best shot.</div>
          <p className="mt-4 text-[10px] uppercase tracking-[.18em] text-white/45">JPG · PNG · HEIC / tap to browse</p>
          <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#FF0A8A]">Start creating <ChevronRight size={14} /></div>
        </div>
      </div>

      {error && <div className="glass-strong flex items-center gap-2 rounded-xl border border-[#FF0A8A]/40 p-3 text-xs text-[#FFED00] shadow-[0_4px_15px_rgba(255,10,138,0.2)]"><AlertCircle size={16} className="text-[#FF0A8A]" />{error}</div>}
      <p className="text-[10px] uppercase leading-5 tracking-[.14em] text-white/35">Your photo gets color-graded, vignetted, and grain-textured automatically — no editing skills needed.</p>
    </div>
  );
}

function FormatButton({ active, onClick, icon, title, copy }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; copy: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 rounded-xl p-3 text-left transition-all ${active ? 'bg-[#FFED00] text-[#005C37] shadow-[0_4px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]' : 'text-white/55 hover:bg-white/5'}`}>
      <span>{icon}</span>
      <span><span className="block text-xs font-bold uppercase tracking-[.08em]">{title}</span><span className="mt-1 block text-[9px] uppercase tracking-[.12em] opacity-65">{copy}</span></span>
    </button>
  );
}

/* ── Details panel ── */
function DetailsPanel({ previewUrl, name, setName, stack, setStack, predictedTitle, generating, onBack, onGenerate }: { previewUrl: string; name: string; setName: (value: string) => void; stack: string; setStack: (value: string) => void; predictedTitle: string; generating: boolean; onBack: () => void; onGenerate: () => void }) {
  return (
    <div className="space-y-6 fade-in">
      <div className="glass-strong flex items-center gap-5 rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-[#FFED00]/40 bg-[#FFED00]/5 shadow-[0_6px_20px_rgba(0,0,0,0.3),inset_0_2px_6px_rgba(0,0,0,0.2)]">
          {previewUrl && <img src={previewUrl} alt="Your upload" className="h-full w-full object-cover" style={{ filter: 'contrast(1.1) saturate(1.15) brightness(1.03)' }} />}
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[.2em] text-white/45">Step 03 / Identity</div>
          <div className="display mt-2 text-3xl uppercase leading-none neon-text">Make it yours.</div>
        </div>
      </div>

      <div className="space-y-4">
        <Field label="Your name" value={name} onChange={setName} placeholder="Alex Rivera" icon={<UserRound size={16} />} />
        <Field label="Stack / role" value={stack} onChange={setStack} placeholder="Frontend · AI · Design" icon={<Code2 size={16} />} />
      </div>

      <div className="glass-strong rounded-2xl border-l-4 border-[#FF0A8A] p-4 shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
        <div className="text-[9px] uppercase tracking-[.2em] text-white/45">Generated builder title</div>
        <div className="mt-2 text-sm font-bold text-[#FFED00]">{predictedTitle}</div>
      </div>

      <div className="flex gap-2">
        <button onClick={onBack} className="glass-pill rounded-xl px-5 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-white/70 hover:text-white">Back</button>
        <button onClick={onGenerate} disabled={!name.trim() || generating} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFED00] px-5 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#005C37] shadow-[0_5px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] neon-glow-yellow disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:translate-y-0">
          {generating ? <Loader2 size={16} className="animate-spin" /> : <WandSparkles size={16} />} Generate badge <ArrowUpRight size={15} />
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, icon }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; icon: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-white/55">{icon}{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={50} className="glass-strong w-full rounded-xl border border-white/10 px-4 py-4 text-sm text-[#FFED00] outline-none placeholder:text-white/20 focus:border-[#FF0A8A]/50 focus:shadow-[0_4px_20px_rgba(255,10,138,0.15)]" />
    </label>
  );
}

/* ── Result panel ── */
function ResultPanel({ result, onDownload, onShare, onReset, shareToast }: { result: GenerateResult; onDownload: () => void; onShare: () => void; onReset: () => void; shareToast: boolean }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(12);

  return (
    <div className="space-y-5 fade-in-scale">
      <div className="glass flex items-center justify-between rounded-2xl border-b border-white/10 p-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.2em] text-[#FF0A8A]"><Check size={15} /> Graphic ready</div>
          <div className="display mt-2 text-3xl uppercase leading-none neon-text sm:text-4xl">Looks good.<br />Now make noise.</div>
        </div>
        <button onClick={onReset} className="glass-pill rounded-xl p-3 text-white/60 hover:text-white" aria-label="Start over"><RefreshCcw size={17} /></button>
      </div>

      <div className="relative" style={{ perspective: '1000px' }}>
        <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className="glass-card tilt-card relative overflow-hidden rounded-2xl p-2 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <img src={result.dataUrl} alt="Generated HH Goa graphic" className="mx-auto max-h-[580px] w-auto max-w-full rounded-lg" style={{ transform: 'translateZ(20px)' }} />
          <div className="absolute left-4 top-4 rounded-lg bg-[#FF0A8A] px-2 py-1 text-[9px] font-bold uppercase tracking-widest shadow-[0_4px_12px_rgba(255,10,138,0.4)]" style={{ transform: 'translateZ(40px)' }}>Final PNG</div>
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-transparent" style={{ transform: 'translateZ(30px)' }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={onDownload} className="glass-pill flex items-center justify-center gap-2 rounded-xl px-4 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#FFED00] shadow-[0_5px_0_rgba(0,0,0,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(0,0,0,0.3)]"><ArrowDownToLine size={16} /> Download</button>
        <button onClick={onShare} className="flex items-center justify-center gap-2 rounded-xl bg-[#FFED00] px-4 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#005C37] shadow-[0_5px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] neon-glow-yellow"><X size={17} /> Share to X</button>
      </div>

      <div className="glass-strong rounded-xl p-4">
        <div className="mb-2 flex items-center gap-2 text-[9px] uppercase tracking-[.18em] text-white/45"><Share2 size={13} /> Tweet copy ready</div>
        <p className="whitespace-pre-line text-xs leading-6 text-[#FFED00]/85">{result.caption}</p>
      </div>

      {shareToast && <div className="glass-strong fade-in flex items-center gap-2 rounded-xl border border-[#FF0A8A]/40 p-3 text-[10px] font-bold uppercase tracking-[.15em] text-[#FF0A8A] shadow-[0_8px_25px_rgba(255,10,138,0.4)]"><Check size={15} /> X opened in a new tab</div>}
    </div>
  );
}

/* ── Manifest sidebar ── */
function Manifest() {
  return (
    <div className="sticky top-24 space-y-8">
      <div className="glass-card relative overflow-hidden rounded-2xl p-6">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-15" />
        <div className="relative">
          <div className="mb-4 text-[10px] uppercase tracking-[.24em] text-white/45">The brief</div>
          <div className="display text-5xl uppercase leading-[.82] neon-text">One photo.<br /><span className="shimmer-text">Two ways</span><br />to show up.</div>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { n: '01', t: 'Upload any photo — portrait, landscape, off-center. We auto-crop and color-grade it.' },
          { n: '02', t: 'Wrap it in the official HH Goa PFP frame or build a shareable identity card.' },
          { n: '03', t: 'Download a real PNG or post straight to X with a pre-written caption.' },
        ].map((s) => (
          <div key={s.n} className="glass-pill flex gap-4 rounded-xl p-4 text-xs leading-6 text-white/60">
            <span className="text-[#FF0A8A] font-bold">{s.n}</span>
            <span>{s.t}</span>
          </div>
        ))}
      </div>

      <div className="glass-strong rounded-2xl p-4 text-[10px] uppercase leading-5 tracking-[.14em] text-white/45">Designed for the feed.<br />Built for the builders.</div>
    </div>
  );
}

export default App;
