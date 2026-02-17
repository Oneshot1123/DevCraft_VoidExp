import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
    Zap,
    Shield,
    Mic,
    Camera,
    BarChart3,
    Layers,
    ArrowRight,
    AlertTriangle,
    CheckCircle2,
    Users,
    Search,
    ChevronDown,
    MapPin,
    Radio
} from "lucide-react";

interface LandingPageProps {
    onGetStarted: () => void;
    onLogin: () => void;
}

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"]
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Parallax Transforms
    const skyY = useTransform(smoothProgress, [0, 1], ["0%", "50%"]);
    const cityY = useTransform(smoothProgress, [0, 1], ["0%", "25%"]);
    const heroOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
    const heroScale = useTransform(smoothProgress, [0, 0.15], [1, 0.9]);

    const problemY = useTransform(smoothProgress, [0.1, 0.25], ["40px", "0px"]);
    const problemOpacity = useTransform(smoothProgress, [0.1, 0.2], [0, 1]);

    const stats = [
        { label: "AI Accuracy", value: "98.4%", color: "blue" },
        { label: "Avg. Resolution", value: "2.4h", color: "emerald" },
        { label: "Reports Triage", value: "50k+", color: "indigo" },
    ];

    const departments = [
        { name: "Electricity", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
        { name: "Public Safety", icon: Shield, color: "text-red-500", bg: "bg-red-50" },
        { name: "Infrastructure", icon: BarChart3, color: "text-blue-500", bg: "bg-blue-50" },
        { name: "Sanitation", icon: Layers, color: "text-emerald-500", bg: "bg-emerald-50" },
        { name: "Traffic", icon: Radio, color: "text-indigo-500", bg: "bg-indigo-50" },
        { name: "Water", icon: CheckCircle2, color: "text-cyan-500", bg: "bg-cyan-50" },
    ];

    return (
        <div ref={targetRef} className="relative min-h-[600vh] bg-white dark:bg-zinc-950 selection:bg-blue-100">
            {/* Header / Nav */}
            <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md border-b">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center group-hover:rotate-12 transition-transform">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-black tracking-tighter">CivicSense.</span>
                </div>
                <div className="flex items-center gap-8">
                    <button onClick={onLogin} className="text-sm font-bold hover:text-blue-600 transition-colors">Sign In</button>
                    <Button onClick={onGetStarted} className="rounded-full px-6 font-bold shadow-lg shadow-blue-500/20">Sign Up</Button>
                </div>
            </nav>

            {/* Parallax Hero Section */}
            <section className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
                <motion.div style={{ y: skyY }} className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white dark:from-zinc-900 dark:to-zinc-950" />
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:40px_40px]" />
                </motion.div>

                <motion.div style={{ y: cityY }} className="absolute bottom-0 w-full z-10 px-12">
                    <div className="flex items-end justify-between opacity-5 dark:opacity-10 translate-y-20">
                        <div className="h-64 w-32 bg-current rounded-t-3xl" />
                        <div className="h-96 w-48 bg-current rounded-t-3xl" />
                        <div className="h-80 w-40 bg-current rounded-t-3xl" />
                        <div className="h-[30rem] w-64 bg-current rounded-t-3xl" />
                        <div className="h-80 w-40 bg-current rounded-t-3xl" />
                        <div className="h-96 w-48 bg-current rounded-t-3xl" />
                        <div className="h-64 w-32 bg-current rounded-t-3xl" />
                    </div>
                </motion.div>

                <motion.div
                    style={{ opacity: heroOpacity, scale: heroScale }}
                    className="relative z-20 text-center space-y-8 px-6"
                >
                    <Badge variant="outline" className="rounded-full px-4 py-1 border-blue-200 text-blue-600 bg-blue-50/50 backdrop-blur-sm animate-reveal uppercase tracking-widest text-[10px] font-black">
                        Intelligent Municipal Logistics
                    </Badge>
                    <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.8] animate-reveal [animation-delay:200ms]">
                        SMART <br />
                        <span className="text-blue-600">GOVERNANCE.</span>
                    </h1>
                    <p className="text-xl text-zinc-500 max-w-xl mx-auto font-medium animate-reveal [animation-delay:400ms]">
                        The world's first autonomous triage engine for city infrastructure.
                        Vision-ready. Voice-enabled. Citizen-first.
                    </p>
                    <div className="flex justify-center gap-6 animate-reveal [animation-delay:600ms]">
                        <Button size="lg" onClick={onGetStarted} className="h-16 px-12 rounded-full text-lg font-black bg-zinc-900 hover:bg-zinc-800 shadow-2xl">
                            Report Issue <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 text-zinc-400">
                            <ChevronDown className="w-8 h-8" />
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Problem Section */}
            <section className="sticky top-0 h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-12 overflow-hidden">
                <motion.div
                    style={{ y: problemY, opacity: problemOpacity }}
                    className="max-w-6xl w-full grid md:grid-cols-2 gap-24 items-center"
                >
                    <div className="space-y-8">
                        <div className="w-16 h-2 bg-red-500 rounded-full" />
                        <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
                            Urban management is <span className="text-red-500">bottlenecked.</span>
                        </h2>
                        <p className="text-xl text-zinc-500 leading-relaxed">
                            Traditional cities rely on manual triage, leading to delayed responses,
                            administrative fatigue, and citizen frustration.
                            <span className="block mt-4 text-zinc-900 font-bold italic">CivicSense solves the 'Last Mile' of reporting.</span>
                        </p>
                        <div className="grid grid-cols-3 gap-8 pt-8">
                            {stats.map(s => (
                                <div key={s.label}>
                                    <p className={`text-4xl font-black text-${s.color}-600 tracking-tighter`}>{s.value}</p>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-red-100 rounded-[3rem] blur-2xl opacity-50" />
                        <div className="relative glass-panel rounded-[2rem] p-8 space-y-4 border-red-100">
                            <div className="flex gap-4 items-center p-4 rounded-xl bg-red-50/50 border border-red-100">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                                <div className="flex-1">
                                    <div className="h-2 w-24 bg-red-200 rounded mb-2" />
                                    <div className="h-2 w-full bg-red-100 rounded" />
                                </div>
                                <Badge className="bg-red-500">Urgent</Badge>
                            </div>
                            <div className="p-4 flex flex-col gap-2">
                                <Search className="w-8 h-8 text-zinc-300 mb-4" />
                                <div className="h-2 w-full bg-zinc-100 rounded" />
                                <div className="h-2 w-2/3 bg-zinc-100 rounded" />
                                <div className="h-2 w-1/2 bg-zinc-100 rounded" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* AI Flow Section */}
            <section className="sticky top-0 h-screen bg-zinc-950 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(37,99,235,0.1),transparent)]" />
                <div className="max-w-7xl w-full px-12 grid lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-5 space-y-6">
                        <Badge className="bg-blue-600 text-white border-none py-1.5 px-4 font-black tracking-widest uppercase text-[10px]">The Triage Engine</Badge>
                        <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
                            Autonomous Routing <br />
                            <span className="text-zinc-500 italic font-serif">by AI Intelligence.</span>
                        </h2>
                        <div className="space-y-4 pt-8">
                            {[
                                { t: "Multimodal Processing", d: "Handles Voice, Image, and Text instantly." },
                                { t: "Semantic Deduplication", d: "Clusters similar reports using Vector search." },
                                { t: "Urgency Scoring", d: "Predicts severity with 99% confidence." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="w-1 h-12 bg-zinc-800 group-hover:bg-blue-600 transition-colors" />
                                    <div>
                                        <p className="font-black text-white">{item.t}</p>
                                        <p className="text-zinc-500 text-sm">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-7 relative">
                        <div className="aspect-video glass-panel border-zinc-800 bg-zinc-900/50 rounded-3xl p-12 flex items-center justify-center">
                            <div className="relative w-full h-full flex items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-2 border-dashed border-zinc-800 rounded-full"
                                />
                                <div className="relative z-10 space-y-8 text-center">
                                    <div className="w-24 h-24 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(37,99,235,0.3)] border border-blue-500/50">
                                        <Zap className="w-10 h-10 text-blue-500 animate-pulse" />
                                    </div>
                                    <p className="text-xs font-mono text-blue-500 uppercase tracking-[0.3em] font-black">Analyzing Signal...</p>
                                </div>
                                <div className="absolute top-0 left-1/4 p-4 glass-panel border-zinc-800 rounded-2xl animate-float">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                                <div className="absolute bottom-1/4 right-0 p-4 glass-panel border-zinc-800 rounded-2xl animate-float [animation-delay:1s]">
                                    <Mic className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Department Coverage */}
            <section className="sticky top-0 h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-12">
                <div className="max-w-6xl w-full">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
                        <div className="space-y-4">
                            <h2 className="text-6xl font-black tracking-tighter">Seven Sectors. <br /> One System.</h2>
                            <p className="text-xl text-zinc-500 max-w-lg">Unified management across every critical municipal department.</p>
                        </div>
                        <Button size="lg" variant="outline" className="rounded-full px-8 h-14 font-bold border-2">Explore Integration</Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {departments.map((d, i) => (
                            <motion.div
                                key={d.name}
                                whileHover={{ y: -10 }}
                                className={`p-8 rounded-[2rem] ${d.bg} border transition-all cursor-default group`}
                            >
                                <d.icon className={`w-10 h-10 ${d.color} mb-6 transition-transform group-hover:scale-110`} />
                                <h3 className="text-2xl font-black tracking-tight">{d.name}</h3>
                                <div className="h-1 w-12 bg-current opacity-20 mt-4 rounded-full" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dashboard Preview */}
            <section className="sticky top-0 h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center p-12 overflow-hidden">
                <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-24 items-center">
                    <div className="order-2 lg:order-1 relative">
                        <div className="absolute -inset-12 bg-blue-100 rounded-full blur-[100px] opacity-50" />
                        <motion.div
                            initial={{ x: -100, rotate: -5 }}
                            whileInView={{ x: 0, rotate: 0 }}
                            className="relative glass-panel rounded-[3rem] shadow-2xl border-white/50 overflow-hidden"
                        >
                            <div className="h-10 bg-white/80 border-b flex items-center px-6 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                </div>
                            </div>
                            <div className="p-12 aspect-[4/3] bg-white flex flex-col gap-8">
                                <div className="grid grid-cols-3 gap-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-zinc-50 rounded-2xl border flex items-center justify-center"><BarChart3 className="w-6 h-6 text-zinc-200" /></div>)}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="h-32 rounded-3xl bg-blue-50 border border-blue-100 p-6 flex items-start justify-between">
                                        <div className="space-y-2">
                                            <div className="h-4 w-32 bg-blue-200 rounded" />
                                            <div className="h-4 w-48 bg-blue-100 rounded" />
                                        </div>
                                        <Badge className="bg-blue-600">Active</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-2 w-full bg-zinc-100 rounded" />
                                        <div className="h-2 w-2/3 bg-zinc-100 rounded" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    <div className="order-1 lg:order-2 space-y-8">
                        <Badge variant="outline" className="border-zinc-300">Executive Interface</Badge>
                        <h2 className="text-6xl font-black tracking-tighter leading-none">Command Center for <span className="text-blue-600">Decision Makers.</span></h2>
                        <p className="text-xl text-zinc-500 leading-relaxed">
                            A high-density operational view providing city administrators with
                            real-time insights, resource distribution, and efficiency metrics.
                        </p>
                        <div className="space-y-6">
                            {[
                                { i: Users, t: "Role Isolation", d: "Officers only see THEIR assigned tasks." },
                                { i: MapPin, t: "Geographic Clariyt", d: "Visualize incident density in real-time." }
                            ].map((f, i) => (
                                <div key={i} className="flex gap-6 items-start">
                                    <div className="p-3 rounded-2xl bg-white shadow-sm border">
                                        <f.i className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-black">{f.t}</p>
                                        <p className="text-zinc-500 text-sm">{f.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Call To Action */}
            <section className="sticky top-0 h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.2),transparent_70%)]" />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    className="relative z-10 text-center space-y-12"
                >
                    <div className="w-24 h-24 rounded-3xl bg-blue-600 mx-auto flex items-center justify-center shadow-[0_0_100px_rgba(37,99,235,0.4)]">
                        <Zap className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-none">Ready to <br /> Deploy?</h2>
                    <p className="text-xl text-zinc-400 max-w-lg mx-auto">
                        Empower your citizens. Optimize your departments.
                        Join the next generation of smart cities.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6 pt-12">
                        <Button size="lg" onClick={onGetStarted} className="h-20 px-16 rounded-full text-2xl font-black bg-white text-black hover:bg-zinc-100 hover:scale-105 transition-all shadow-[0_30px_60px_rgba(255,255,255,0.1)]">
                            Begin Onboarding
                        </Button>
                        <Button size="lg" variant="outline" className="h-20 px-16 rounded-full text-2xl font-black bg-transparent text-white border-2 border-zinc-800 hover:border-zinc-700 transition-all">
                            Talk To Expert
                        </Button>
                    </div>
                </motion.div>

                <footer className="absolute bottom-12 w-full px-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                    <p>© 2026 CivicSense AI</p>
                    <div className="flex gap-12">
                        <a href="#" className="hover:text-white">API Docs</a>
                        <a href="#" className="hover:text-white">Governance</a>
                        <a href="#" className="hover:text-white">Support</a>
                    </div>
                    <p>Built for the Future</p>
                </footer>
            </section>
        </div>
    );
}
