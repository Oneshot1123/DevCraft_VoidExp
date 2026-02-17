import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Zap, BarChart3, Users, ArrowRight, CheckCircle2 } from "lucide-react";

interface LandingPageProps {
    onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 flex flex-col items-center px-6">
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-8 animate-fade-in">
                    <Zap className="w-3 h-3 fill-blue-600" />
                    <span>Next-Gen Municipal Intelligence</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-center tracking-tighter leading-[0.9] text-gray-900 max-w-4xl mb-8">
                    Smart City Management <br />
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">Powered by AI.</span>
                </h1>

                <p className="text-xl text-muted-foreground text-center max-w-2xl mb-10 leading-relaxed">
                    CivicSense uses advanced Vision, Language, and Audio models to triage, prioritize, and route infrastructure issues in real-time.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all" onClick={onGetStarted}>
                        Get Started <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold rounded-2xl border-2">
                        View Demo
                    </Button>
                </div>

                <div className="mt-20 w-full max-w-5xl rounded-3xl border-2 border-gray-200 shadow-2xl overflow-hidden bg-gray-50 group hover:border-blue-400 transition-colors duration-500">
                    <div className="h-10 border-b bg-white flex items-center px-4 gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <div className="mx-auto text-[10px] font-mono text-muted-foreground">civicsense.gov/admin/dashboard</div>
                    </div>
                    <div className="p-8 h-[400px] flex items-center justify-center bg-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent pointer-events-none" />
                        <div className="relative z-10 grid grid-cols-2 gap-8 w-full max-w-3xl">
                            <div className="space-y-4">
                                <div className="h-24 rounded-2xl bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center flex-col gap-2">
                                    <BarChart3 className="w-8 h-8 text-blue-500" />
                                    <span className="text-[10px] uppercase font-black text-muted-foreground">Triage Engine</span>
                                </div>
                                <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-blue-600 animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-full bg-gray-100 rounded" />
                                    <div className="h-2 w-2/3 bg-gray-100 rounded" />
                                </div>
                            </div>
                            <div className="space-y-4 pt-12">
                                <Card className="border-2 shadow-lg">
                                    <div className="p-4 flex items-center gap-4">
                                        <div className="p-2 rounded-full bg-green-100 text-green-600">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm font-bold">Issue Resolved</div>
                                            <div className="text-[10px] text-muted-foreground italic">Pothole fixed on Main St.</div>
                                        </div>
                                    </div>
                                </Card>
                                <div className="h-2 w-full bg-gray-100 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-gray-50 border-y">
                <div className="container mx-auto px-6">
                    <div className="max-w-2xl mb-16">
                        <h2 className="text-4xl font-black mb-4 tracking-tight">Built for modern cities.</h2>
                        <p className="text-lg text-muted-foreground">We've integrated state-of-the-art AI to handle the complexity of urban management.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Visual Triage", desc: "Automatic pothole and damage detection using YOLOv8.", icon: ShieldCheck },
                            { title: "Voice Reporting", desc: "Transcribe complaints instantly with Whisper-tiny STT.", icon: Zap },
                            { title: "Smart Routing", desc: "NLP-driven departmental routing with 98% accuracy.", icon: Users },
                            { title: "Deduplication", desc: "Clustering similar reports using semantic vector similarity.", icon: ShieldCheck },
                            { title: "Priority Queue", desc: "Sentiment-aware urgency scoring for critical actions.", icon: Zap },
                            { title: "Executive Insights", desc: "Comprehensive dashboards for city-wide infrastructure.", icon: BarChart3 },
                        ].map((f, i) => (
                            <div key={i} className="group p-8 bg-white rounded-3xl border border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <f.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
