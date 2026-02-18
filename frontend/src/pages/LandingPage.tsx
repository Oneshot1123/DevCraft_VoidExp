import { useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import {
    Shield,
    Globe,
    Cpu,
    Zap,
    Bot,
    ArrowRight
} from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
    onLogin: () => void;
    onTrack: () => void;
    isAuthenticated?: boolean;
    userRole?: string | null;
}

export default function LandingPage({ onGetStarted, onLogin, onTrack, isAuthenticated, userRole }: LandingPageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <div ref={containerRef} className="relative min-h-screen bg-zinc-950 text-white selection:bg-blue-500/30 overflow-hidden neural-noise">
            {/* Cinematic Background Layer */}
            <div className="fixed inset-0 z-0 mesh-gradient pointer-events-none opacity-50" />

            {/* Floating Neural Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="fixed top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.1, 0.15, 0.1],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"
            />

            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 h-24 glass border-none">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter uppercase italic translate-y-[1px]">CivicSense</span>
                </div>
                <div className="flex items-center gap-8">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Session Secure</span>
                            <button onClick={onGetStarted} className="px-6 py-3 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20">
                                {userRole === 'citizen' ? 'Enter Dispatch Hub' : 'Executive Dashboard'}
                            </button>
                        </div>
                    ) : (
                        <>
                            <button onClick={onLogin} className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Protocol Login</button>
                            <button onClick={onGetStarted} className="px-6 py-3 rounded-full bg-white text-black text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5">Initialize Registry</button>
                        </>
                    )}
                </div>
            </nav>

            <main className="relative z-10 pt-32">
                {/* HERO SECTION */}
                <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-8 max-w-6xl"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
                            <Bot className="w-3 h-3" /> Neural Governance Active
                        </div>

                        <h1 className="text-[12vw] md:text-[8vw] font-black leading-[0.85] tracking-tighter uppercase italic text-gradient">
                            Revolutionizing <br />
                            Civil Response
                        </h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed tracking-tight"
                        >
                            The world's first AI-native municipal orchestration engine. <br className="hidden md:block" />
                            Smarter triage. Faster resolution. Absolute transparency.
                        </motion.p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-10">
                            <button
                                onClick={onGetStarted}
                                className="group relative px-10 py-6 rounded-2xl bg-blue-600 text-white text-sm font-black uppercase tracking-[0.2em] overflow-hidden shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                <span className="relative flex items-center gap-3">
                                    Deploy Report <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                            <button
                                onClick={onTrack}
                                className="px-10 py-6 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-400 text-sm font-black uppercase tracking-[0.2em] hover:text-white hover:bg-zinc-800 transition-all"
                            >
                                Track Complaint
                            </button>
                            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">
                                Authorized for BMC 7.0 Standard
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* BENTO FEATURE PREVIEW */}
                <section className="container mx-auto px-6 py-40">
                    <div className="bento-grid grid-rows-2 auto-rows-fr">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="col-span-12 md:col-span-8 glass-card rounded-[3rem] p-12 flex flex-col justify-end gap-4 neural-noise group min-h-[400px]"
                        >
                            <div className="p-4 w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-500 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                <Globe className="w-full h-full" />
                            </div>
                            <h3 className="text-4xl font-black uppercase tracking-tighter">Geospatial Intelligence</h3>
                            <p className="text-zinc-400 max-w-md font-medium">Bespoke ward-level triage using point-in-polygon neural mapping for Mumbai administrative zones.</p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="col-span-12 md:col-span-4 glass-card rounded-[3rem] p-12 flex flex-col items-center justify-center text-center gap-4 neural-noise overflow-hidden min-h-[400px]"
                        >
                            <div className="absolute inset-0 bg-indigo-600/5" />
                            <Cpu className="w-20 h-20 text-indigo-400 mb-4 animate-pulse" />
                            <h3 className="text-2xl font-black uppercase tracking-tighter relative">Hyper-Triage</h3>
                            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest relative">72% faster processing</p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="col-span-12 md:col-span-4 glass-card rounded-[3rem] p-12 flex flex-col gap-4 neural-noise min-h-[400px]"
                        >
                            <Shield className="w-12 h-12 text-emerald-400" />
                            <h3 className="text-2xl font-black uppercase tracking-tighter">SLA Lock</h3>
                            <p className="text-zinc-400 text-sm font-medium">Mathematically guaranteed response windows backed by real-time municipal audits.</p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="col-span-12 md:col-span-8 glass-card rounded-[3rem] p-12 flex flex-col md:flex-row items-end gap-12 neural-noise overflow-hidden group min-h-[400px]"
                        >
                            <div className="flex-1 space-y-4">
                                <h3 className="text-4xl font-black uppercase tracking-tighter">Multi-Language Core</h3>
                                <p className="text-zinc-400 font-medium">Breaking linguistic barriers with deep institutional support for English, Hindi, and Marathi.</p>
                            </div>
                            <div className="flex gap-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                <span className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase">English</span>
                                <span className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase text-blue-400 underline decoration-2 underline-offset-8">Hindi</span>
                                <span className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase">Marathi</span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="py-20 border-t border-white/5 bg-zinc-950/50">
                    <div className="container mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-3 grayscale">
                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-black text-xl tracking-tighter uppercase italic">CivicSense</span>
                        </div>
                        <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest italic">
                            Powered by Elite-Governance Protocol 2026. BMC Operational Grade.
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    );
}
