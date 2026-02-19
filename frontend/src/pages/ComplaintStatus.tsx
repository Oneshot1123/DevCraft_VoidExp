import { useState, useEffect } from 'react';
import { useLocalization } from '../context/LocalizationContext';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Activity, Shield, CheckCircle2, Clock, AlertCircle, MapPin, Search, ArrowRight, XCircle } from "lucide-react";
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
    resolution_note?: string;
    resolution_image_url?: string;
}

export default function ComplaintStatus() {
    const { } = useLocalization();
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
            <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Initializing Tracking Matrix</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 pb-20 neural-noise overflow-hidden">
            <div className="fixed inset-0 z-0 mesh-gradient opacity-60 pointer-events-none" />

            <div className="relative z-10 p-8 pt-24 max-w-5xl mx-auto space-y-12">
                <header className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-3 bg-primary rounded-full shadow-lg shadow-primary/20" />
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-primary uppercase">
                            Sector Pulse
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 pl-7">
                        <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
                            <Activity className="w-3 h-3 mr-2" /> Live Analytics
                        </Badge>
                        <span className="text-muted-foreground font-medium tracking-tight">Tracking {complaints.length} municipal nodes in your region.</span>
                    </div>
                </header>

                <div className="space-y-6">
                    {complaints.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white border border-border shadow-sm rounded-[3rem] p-20 text-center space-y-6"
                        >
                            <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center text-muted-foreground">
                                <Activity className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-primary">No Active Signals</h3>
                            <p className="text-muted-foreground font-medium">Your sector is currently within nominal parameters.</p>
                        </motion.div>
                    ) : (
                        <AnimatePresence>
                            {complaints.map((c, i) => (
                                <motion.div
                                    key={c.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white border border-border shadow-sm rounded-[2.5rem] p-8 hover:shadow-xl hover:shadow-primary/5 transition-all group flex flex-col gap-8 items-start"
                                >
                                    <div className="w-full flex flex-col md:flex-row gap-8 items-start">
                                        <div className="space-y-6 flex-1">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <Badge className={`rounded-full font-black text-[9px] uppercase tracking-widest border-none px-4 py-1.5 ${c.urgency === 'critical' ? 'bg-destructive text-white shadow-lg shadow-destructive/20' : 'bg-primary text-white'
                                                    }`}>
                                                    {c.urgency}
                                                </Badge>
                                                <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                                                    <Clock className="w-3.5 h-3.5 text-primary" /> {new Date(c.timestamp).toLocaleDateString()}
                                                </div>
                                                <div className="h-1 w-1 rounded-full bg-border" />
                                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                                    ID: <span className="text-muted-foreground">{c.id.slice(0, 8)}</span>
                                                </div>
                                            </div>

                                            <h3 className="text-3xl font-black tracking-tighter leading-none group-hover:text-primary transition-colors uppercase italic text-foreground">
                                                {c.text}
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-10">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Department</span>
                                                    <p className="text-xs font-black uppercase tracking-tight text-primary">{c.department}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Location Sector</span>
                                                    <p className="text-xs font-black uppercase tracking-tight text-foreground">{c.ward || "Mumbai Central"}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Calculated Resolution</span>
                                                    <div className="flex items-center gap-2 text-success">
                                                        <Shield className="w-3 h-3" />
                                                        <p className="text-xs font-black uppercase tracking-tight">{c.sla_eta || "24 Hours"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-3xl border border-border min-w-[200px] gap-4 self-stretch md:self-auto">
                                            <div className="p-3 rounded-full bg-primary/10 mb-2">
                                                {c.status === 'resolved' ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <CheckCircle2 className="w-10 h-10 text-success" />
                                                        <Button
                                                            variant="link"
                                                            onClick={() => window.alert(`RESOLUTION PROOF\n\nNote: ${c.resolution_note || 'Work completed successfully.'}\n\nVerified by: Municipal AI Registry`)}
                                                            className="text-[9px] font-black uppercase text-primary p-0 h-auto"
                                                        >
                                                            View Proof
                                                        </Button>
                                                    </div>
                                                ) : <Loader2 className="w-10 h-10 text-primary animate-spin" />}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Service Status</p>
                                                <h4 className={`text-xl font-black uppercase tracking-tighter italic ${c.status === 'resolved' ? 'text-success' : (c.status === 'rejected' ? 'text-destructive' : 'text-primary')}`}>
                                                    {c.status}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        c.status === 'rejected' && c.rejection_reason && (
                                            <div className="w-full p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-destructive mb-1">Official Rejection Protocol</p>
                                                <p className="text-sm font-medium text-muted-foreground italic">"{c.rejection_reason}"</p>
                                            </div>
                                        )
                                    }
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div >
    );
}
