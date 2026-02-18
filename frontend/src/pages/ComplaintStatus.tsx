import { useState, useEffect } from 'react';
import { useLocalization } from '../context/LocalizationContext';
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, Shield, CheckCircle2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Complaint {
    id: string;
    text: string;
    category: string;
    urgency: string;
    department: string;
    status: string;
    timestamp: string;
    ward?: string;
    sla_eta?: string;
    rejection_reason?: string;
}

export default function ComplaintStatus() {
    const { t } = useLocalization();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const response = await fetch("http://localhost:8000/complaints/", {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            if (!response.ok) throw new Error("Failed to fetch complaints");
            const data = await response.json();
            setComplaints(data);
        } catch (err: any) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Initializing Tracking Matrix</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-blue-500/30 pb-20 neural-noise overflow-hidden">
            <div className="fixed inset-0 z-0 mesh-gradient opacity-40 pointer-events-none" />

            <div className="relative z-10 p-8 pt-24 max-w-5xl mx-auto space-y-12">
                <header className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-3 bg-blue-600 rounded-full shadow-lg shadow-blue-500/20" />
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gradient uppercase">
                            Sector Pulse
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 pl-7">
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/5 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
                            <Activity className="w-3 h-3 mr-2" /> Live Analytics
                        </Badge>
                        <span className="text-zinc-500 font-medium tracking-tight">Tracking {complaints.length} municipal nodes in your region.</span>
                    </div>
                </header>

                <div className="space-y-6">
                    {complaints.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="glass-card rounded-[3rem] p-20 text-center space-y-6"
                        >
                            <div className="w-20 h-20 rounded-full bg-zinc-900 mx-auto flex items-center justify-center text-zinc-700">
                                <Activity className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter">No Active Signals</h3>
                            <p className="text-zinc-500 font-medium">Your sector is currently within nominal parameters.</p>
                        </motion.div>
                    ) : (
                        <AnimatePresence>
                            {complaints.map((c, i) => (
                                <motion.div
                                    key={c.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-card rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group border-none flex flex-col gap-8 items-start"
                                >
                                    <div className="w-full flex flex-col md:flex-row gap-8 items-start">
                                        <div className="space-y-6 flex-1">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <Badge className={`rounded-full font-black text-[9px] uppercase tracking-widest border-none px-4 py-1.5 ${c.urgency === 'critical' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-blue-600 text-white'
                                                    }`}>
                                                    {c.urgency}
                                                </Badge>
                                                <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                                    <Clock className="w-3.5 h-3.5 text-blue-500" /> {new Date(c.timestamp).toLocaleDateString()}
                                                </div>
                                                <div className="h-1 w-1 rounded-full bg-zinc-800" />
                                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                    ID: <span className="text-zinc-600">{c.id.slice(0, 8)}</span>
                                                </div>
                                            </div>

                                            <h3 className="text-3xl font-black tracking-tighter leading-none group-hover:text-blue-400 transition-colors uppercase italic">
                                                {c.text}
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-10">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Department</span>
                                                    <p className="text-xs font-black uppercase tracking-tight text-blue-500">{c.department}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Location Sector</span>
                                                    <p className="text-xs font-black uppercase tracking-tight">{c.ward || "Mumbai Central"}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Calculated Resolution</span>
                                                    <div className="flex items-center gap-2 text-emerald-400">
                                                        <Shield className="w-3 h-3" />
                                                        <p className="text-xs font-black uppercase tracking-tight">{c.sla_eta || "24 Hours"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center justify-center p-8 bg-black/40 rounded-3xl border border-white/5 min-w-[200px] gap-4 self-stretch md:self-auto">
                                            <div className="p-3 rounded-full bg-blue-600/10 mb-2">
                                                {c.status === 'resolved' ? <CheckCircle2 className="w-10 h-10 text-emerald-500" /> : <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Service Status</p>
                                                <h4 className={`text-xl font-black uppercase tracking-tighter italic ${c.status === 'resolved' ? 'text-emerald-500' : (c.status === 'rejected' ? 'text-red-500' : 'text-blue-500')}`}>
                                                    {c.status}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                    {c.status === 'rejected' && c.rejection_reason && (
                                        <div className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Official Rejection Protocol</p>
                                            <p className="text-sm font-medium text-zinc-400 italic">"{c.rejection_reason}"</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
