import { useState, useEffect } from 'react';
import { useLocalization } from '../context/LocalizationContext';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Loader2,
    AlertTriangle,
    CheckCircle2,
    BarChart3,
    Filter,
    TrendingUp,
    MapPin,
    Layers,
    Activity,
    Bot,
    Shield,
    XCircle,
    Clock,
    Flame,
    Unplug,
    Camera
} from "lucide-react";
import { motion } from "framer-motion";
import { CategoryPieChart, ResolutionTrendChart } from '@/components/DashboardCharts';
import GeospatialHeatmap from '@/components/Heatmap';
import { API_BASE_URL, WS_BASE_URL } from '../config';

interface Complaint {
    id: string;
    text: string;
    category: string;
    urgency: string;
    department: string;
    status: string;
    timestamp: string;
    ward?: string;
    duplicate_count?: number;
    rejection_reason?: string;
    resolution_note?: string;
    resolution_image_url?: string;
}

export default function AdminDashboard() {
    const { t } = useLocalization();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDept, setFilterDept] = useState("all");
    const [filterUrgency, setFilterUrgency] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [isAIActive, setIsAIActive] = useState(false);

    const userRole = localStorage.getItem("role");
    const userDept = localStorage.getItem("department") || "";

    useEffect(() => {
        if (userRole === 'officer' && userDept) {
            setFilterDept(userDept.toLowerCase());
        }
    }, [userRole, userDept]);

    const trendData = [
        { date: 'Mon', resolved: 10, total: 15 },
        { date: 'Tue', resolved: 12, total: 18 },
        { date: 'Wed', resolved: 15, total: 20 },
        { date: 'Thu', resolved: 18, total: 24 },
        { date: 'Fri', resolved: 22, total: 28 },
    ];

    const categoryData = [
        { name: 'Roads', value: 400 },
        { name: 'Waste', value: 300 },
        { name: 'Safety', value: 200 },
        { name: 'Water', value: 100 },
    ];

    useEffect(() => {
        fetchComplaints();
        // Setup WebSocket connection for real-time updates
        const socket = new WebSocket(`${WS_BASE_URL}/ws/admin`);
        socket.onmessage = (event) => {
            const update = JSON.parse(event.data);
            if (update.type === 'NEW_COMPLAINT') {
                fetchComplaints();
            }
        };
        return () => socket.close();
    }, []);

    const fetchComplaints = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/complaints/`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            if (!response.ok) throw new Error("Failed to fetch complaints");
            const data = await response.json();
            setComplaints(data);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            let rejection_reason = undefined;
            let resolution_note = undefined;

            if (newStatus === 'rejected') {
                rejection_reason = window.prompt("Reason for rejection:");
                if (!rejection_reason) return;
            }

            if (newStatus === 'resolved') {
                resolution_note = window.prompt("Official Resolution Note (Describe the work completed):");
                if (!resolution_note) return;
            }

            const res = await fetch(`${API_BASE_URL}/complaints/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    status: newStatus,
                    rejection_reason,
                    resolution_note
                })
            });
            if (res.ok) {
                fetchComplaints();
            } else {
                const errData = await res.json();
                console.error("Status Update Failed:", errData);
                window.alert(`Update Error: ${errData.detail || "The municipal register failed to synchronize."}`);
            }
        } catch (err) {
            console.error(err);
            window.alert("Network Error: Could not connect to the municipal core.");
        }
    };

    const handleAIProtocol = async () => {
        setIsAIActive(true);
        try {
            // Simulate AI Triage Cycle (Semantic Analysis + Cluster Detection)
            await new Promise(resolve => setTimeout(resolve, 2500));
            await fetchComplaints();
        } finally {
            setIsAIActive(false);
        }
    };

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status !== 'resolved').length,
        urgent: complaints.filter(c => c.urgency === 'critical').length,
        resolved: complaints.filter(c => c.status === 'resolved').length
    };

    const filteredComplaints = complaints.filter(c => {
        const deptMatch = filterDept === 'all' || c.department.toLowerCase().includes(filterDept.toLowerCase());
        const urgencyMatch = filterUrgency === 'all' || c.urgency.toLowerCase() === filterUrgency.toLowerCase();
        const statusMatch = filterStatus === 'all' || c.status.toLowerCase() === filterStatus.toLowerCase();
        return deptMatch && urgencyMatch && statusMatch;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Initializing Executive Environment</span>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 pb-20 neural-noise overflow-x-hidden">
            {isAIActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="fixed inset-0 z-50 pointer-events-none bg-primary/5 mix-blend-multiply"
                />
            )}
            <div className="fixed inset-0 z-0 mesh-gradient opacity-60 pointer-events-none" />

            <div className="relative z-10 p-8 pt-24 max-w-[1600px] mx-auto space-y-12">
                {/* HUD HEADER */}
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-12 border-b border-border">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-4 bg-primary rounded-full shadow-lg" />
                            <h1 className="text-6xl font-black tracking-tighter text-primary uppercase">
                                {t('adminDashboard')}
                            </h1>
                        </div>
                        <div className="flex items-center gap-4 pl-8">
                            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
                                <Activity className="w-3 h-3 mr-2" /> Live Environment
                            </Badge>
                            <span className="text-muted-foreground font-medium tracking-tight">System uptime: 99.98% • Active AI Agents: 42</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 glass p-2 rounded-2xl shadow-sm border border-border">
                        <Select
                            value={filterDept}
                            onValueChange={setFilterDept}
                            disabled={userRole === 'officer'}
                        >
                            <SelectTrigger className="w-[200px] h-14 bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest text-primary">
                                <Filter className="w-3 h-3 mr-2 text-primary" />
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border rounded-xl">
                                <SelectItem value="all">Depts: Global</SelectItem>
                                <SelectItem value="roads">Roads</SelectItem>
                                <SelectItem value="sanitation">Sanitation</SelectItem>
                                <SelectItem value="water">Water</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                            <SelectTrigger className="w-[180px] h-14 bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest border-l border-border text-primary">
                                <AlertTriangle className="w-3 h-3 mr-2 text-destructive" />
                                <SelectValue placeholder="Urgency" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border rounded-xl">
                                <SelectItem value="all">Urgency: All</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[180px] h-14 bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest border-l border-border text-primary">
                                <Activity className="w-3 h-3 mr-2 text-success" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border rounded-xl">
                                <SelectItem value="all">Status: All</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button onClick={fetchComplaints} variant="ghost" className="h-14 rounded-xl px-8 text-[10px] font-black uppercase tracking-widest hover:bg-muted border-l border-border text-primary">
                            Sync Core
                        </Button>
                    </div>
                </header>

                <section className="h-[500px] glass-card rounded-2xl p-4 relative overflow-hidden ring-1 ring-border">
                    <GeospatialHeatmap complaints={complaints} />
                </section>

                <main className="bento-grid grid-rows-[auto,auto,auto]">
                    {/* TOP METRICS BENTO PIECES */}
                    {[
                        { label: "Active Nodes", val: stats.total, icon: Layers, color: "primary" },
                        { label: "Critical Triage", val: stats.urgent, icon: AlertTriangle, color: "destructive" },
                        { label: "Resolution Rate", val: `${Math.round((stats.resolved / stats.total) * 100 || 0)}%`, icon: TrendingUp, color: "success" },
                        { label: "SLA Compliant", val: "94.2%", icon: Shield, color: "secondary" }
                    ].map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="col-span-12 md:col-span-3 glass-card rounded-2xl p-8 space-y-4 shadow-sm border border-border"
                        >
                            <div className={`p-4 w-14 h-14 rounded-2xl bg-muted text-${m.color === 'primary' ? 'primary' : m.color}`}>
                                <m.icon className="w-full h-full" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{m.label}</p>
                                <h4 className="text-5xl font-black tracking-tighter text-foreground">{m.val}</h4>
                            </div>
                        </motion.div>
                    ))}

                    {/* CHART HUD BENTO PIECES */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="col-span-12 lg:col-span-8 glass-card rounded-[3rem] p-10 min-h-[500px]"
                    >
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4 text-primary">
                                <BarChart3 className="text-primary" /> Operational Trajectory
                            </h3>
                            <div className="flex gap-2">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <div className="h-2 w-2 rounded-full bg-secondary" />
                            </div>
                        </div>
                        <div className="h-[350px]">
                            <ResolutionTrendChart data={trendData} />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="col-span-12 lg:col-span-4 glass-card rounded-[3rem] p-10 flex flex-col justify-center gap-12"
                    >
                        <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase tracking-tighter">Sector Flux</h3>
                            <p className="text-xs text-zinc-500 font-medium">Neural distribution across municipal zones.</p>
                        </div>
                        <div className="h-[250px]">
                            <CategoryPieChart data={categoryData} />
                        </div>
                    </motion.div>

                    {/* OPERATIONAL FEED HUD */}
                    <div className="col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 glass-card rounded-2xl overflow-hidden border border-border shadow-sm">
                            <div className="p-10 border-b border-border bg-muted flex items-center justify-between">
                                <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4 text-primary">
                                    <Activity className="text-primary" /> Dynamic Service Log
                                </h3>
                                <Badge variant="outline" className="border-border text-muted-foreground rounded-full font-black text-[9px] px-3 bg-white">
                                    {filteredComplaints.length} REPORTS STREAMING
                                </Badge>
                            </div>
                            <div className="max-h-[800px] overflow-y-auto neural-noise">
                                {filteredComplaints.map((c) => (
                                    <motion.div
                                        key={c.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-8 border-b border-border hover:bg-muted/50 transition-all group relative"
                                    >
                                        <div className="flex items-start justify-between gap-8">
                                            <div className="space-y-4 flex-1">
                                                <Badge className={`rounded-full font-black text-[9px] uppercase tracking-widest border-none ${c.urgency === 'critical' ? 'bg-destructive text-white' : 'bg-primary text-white'}`}>
                                                    {c.urgency}
                                                </Badge>
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-3">{new Date(c.timestamp).toLocaleTimeString()}</span>
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest ml-3">{c.department}</span>
                                                <p className="text-xl font-black tracking-tight leading-snug group-hover:text-primary transition-colors text-foreground mt-4">{c.text}</p>
                                                <div className="flex items-center gap-6 mt-4">
                                                    <span className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                        <MapPin className="w-3 h-3" /> {c.ward || "Sector 7"}
                                                    </span>
                                                    {c.duplicate_count ? (
                                                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                                            <Layers className="w-3 h-3" /> {c.duplicate_count} Clusters Detected
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                <Badge variant="secondary" className="px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] bg-muted border border-border text-primary">
                                                    {c.status.replace('_', ' ')}
                                                </Badge>
                                                <div className="flex gap-2">
                                                    {c.status === 'pending' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleUpdateStatus(c.id, 'in_progress')}
                                                            className="rounded-xl h-10 px-4 bg-muted hover:bg-muted/80 text-primary transition-all text-[8px] font-black uppercase tracking-widest border border-border"
                                                        >
                                                            <Clock className="w-3 h-3 mr-2" /> Start Phase
                                                        </Button>
                                                    )}
                                                    {c.status !== 'resolved' && c.status !== 'rejected' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleUpdateStatus(c.id, 'resolved')}
                                                                className="rounded-xl h-10 w-10 p-0 bg-success hover:bg-success/90 text-white transition-all shadow-md"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleUpdateStatus(c.id, 'rejected')}
                                                                className="rounded-xl h-10 w-10 p-0 bg-destructive/10 hover:bg-destructive text-destructive hover:text-white border border-destructive/20 transition-all"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    {c.status === 'resolved' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => window.alert(`RESOLUTION PROOF\n\nNote: ${c.resolution_note || 'No note provided.'}\n\nWork verified by municipal AI.`)}
                                                            className="h-10 px-4 rounded-xl text-[8px] font-black uppercase text-muted-foreground hover:text-primary"
                                                        >
                                                            <Camera className="w-3 h-3 mr-2" /> View Resolution
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* SIDE HUD BENTO PIECE */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="glass-card rounded-2xl p-10 space-y-8 bg-primary/5 border-primary/20 shadow-sm">
                                <div className="flex items-center gap-4 text-primary">
                                    <Bot className="w-8 h-8" />
                                    <h3 className="text-xl font-black uppercase tracking-tighter">AI Overseer</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="p-6 rounded-2xl bg-white border border-border shadow-inner">
                                        <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">
                                            "Analyzing flux in Sector 4. Traffic congestion is 12% above nominal. Recommending emergency dispatch."
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleAIProtocol}
                                        disabled={isAIActive}
                                        className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-lg"
                                    >
                                        {isAIActive ? (
                                            <span className="flex items-center gap-3">
                                                <Loader2 className="w-4 h-4 animate-spin" /> Orchestrating...
                                            </span>
                                        ) : "Initialize Protocol"}
                                    </Button>
                                </div>
                            </div>

                            <div className="glass-card rounded-2xl p-10 bg-white border border-border shadow-sm">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-3">
                                    <AlertTriangle className="w-4 h-4 text-destructive" /> Urgent Alerts
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { label: "Fire Detected", icon: Flame, color: "destructive", sector: "Sector 4" },
                                        { label: "Active Flooding", icon: Activity, color: "primary", sector: "Ward G-North" },
                                        { label: "Exposed Wires", icon: Unplug, color: "warning", sector: "Wadala Cluster" },
                                    ].map((alert, i) => (
                                        <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-muted/50 border border-border hover:bg-destructive/5 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg bg-${alert.color === 'primary' ? 'primary' : alert.color}/10 text-${alert.color === 'primary' ? 'primary' : alert.color}`}>
                                                    <alert.icon className="w-4 h-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase text-foreground">{alert.label}</p>
                                                    <p className="text-[8px] font-black uppercase text-muted-foreground">{alert.sector}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="border-destructive/20 text-destructive text-[8px] font-black">INTERCEPT</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div >
        </div >
    );
}
