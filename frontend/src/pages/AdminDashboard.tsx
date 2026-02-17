import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, CheckCircle, BarChart3, Users, Filter, TrendingUp, Clock, MapPin, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryPieChart, DepartmentBarChart, ResolutionTrendChart } from '@/components/DashboardCharts';

interface Complaint {
    id: string;
    text: string;
    category: string;
    urgency: string;
    department: string;
    status: string;
    timestamp: string;
    location?: string;
    duplicate_group_id?: string;
}

export default function AdminDashboard() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [departmentFilter, setDepartmentFilter] = useState("all");
    const role = localStorage.getItem("role");

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8000/complaints/", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            if (!response.ok) throw new Error("Failed to fetch dashboard data");
            const data = await response.json();
            setComplaints(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = role === 'city_admin';
    const filteredComplaints = departmentFilter === "all" ? complaints : complaints.filter(c => c.department === departmentFilter);

    // Dynamic Stats
    const stats = {
        total: complaints.length,
        submitted: complaints.filter(c => c.status === 'submitted').length,
        urgent: complaints.filter(c => ['critical', 'high'].includes(c.urgency)).length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
    };

    // Visualization Data Transformers
    const categoryData = Object.entries(
        complaints.reduce((acc: any, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name: name.replace('_', ' ').toUpperCase(), value: value as number }));

    const deptData = Object.entries(
        complaints.reduce((acc: any, curr) => {
            acc[curr.department] = (acc[curr.department] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value: value as number }));

    const trendData = [
        { date: 'Mon', resolved: 5, total: 8 },
        { date: 'Tue', resolved: 12, total: 15 },
        { date: 'Wed', resolved: 8, total: 20 },
        { date: 'Thu', resolved: 18, total: 22 },
        { date: 'Fri', resolved: 22, total: 25 },
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <p className="text-muted-foreground font-medium animate-pulse">Initializing Command Center...</p>
        </div>
    );

    return (
        <div className="container p-8 mx-auto max-w-[1600px] space-y-8 pb-16">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-2 bg-blue-600 rounded-full" />
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                            {isAdmin ? "Executive Command Center" : "Department Operations"}
                        </h1>
                    </div>
                    <p className="text-lg text-muted-foreground pl-5 max-w-2xl">
                        {isAdmin
                            ? "Real-time municipal health monitoring and oversight engine."
                            : `Mission-critical response dashboard for ${localStorage.getItem("department") || "assigned"} issues.`}
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 p-2 rounded-xl border shadow-sm self-start md:self-auto">
                    {isAdmin && (
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                            <SelectTrigger className="w-[240px] border-none focus:ring-0 font-semibold h-10">
                                <Filter className="w-4 h-4 mr-2 text-blue-600" />
                                <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Global Overview</SelectItem>
                                {Array.from(new Set(complaints.map(c => c.department))).filter(Boolean).map(dept => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <Button variant="ghost" size="icon" onClick={fetchComplaints} className="h-10 w-10 text-muted-foreground hover:text-blue-600">
                        <Clock className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Top Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total Load", value: stats.total, icon: BarChart3, color: "blue", trend: "+12%" },
                    { label: "Triage Required", value: stats.submitted, icon: Users, color: "orange", trend: "-5%" },
                    { label: "High Risk", value: stats.urgent, icon: AlertTriangle, color: "red", trend: "Critical" },
                    { label: "Res. Efficiency", value: `${stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%`, icon: CheckCircle, color: "emerald", trend: "Optimal" }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="relative overflow-hidden group border-none shadow-lg bg-white dark:bg-zinc-900">
                            <div className={`absolute top-0 left-0 w-full h-1 bg-${stat.color}-500/50 group-hover:h-2 transition-all`} />
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</CardTitle>
                                <stat.icon className={`w-5 h-5 text-${stat.color}-500 transition-transform group-hover:scale-110`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black mb-1">{stat.value}</div>
                                <div className={`text-[10px] font-bold ${stat.color === 'red' ? 'text-red-500' : 'text-muted-foreground'}`}>
                                    {stat.trend} from last session
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Interactive Visualizations */}
            <div className="grid gap-8 lg:grid-cols-3">
                <Card className="lg:col-span-1 shadow-xl border-none">
                    <CardHeader className="border-b bg-muted/30">
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            Incident Distribution
                        </CardTitle>
                        <CardDescription>By primary AI category</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <CategoryPieChart data={categoryData} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 shadow-xl border-none">
                    <CardHeader className="border-b bg-muted/30">
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            Resolution Efficiency
                        </CardTitle>
                        <CardDescription>5-day operational trend</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <ResolutionTrendChart data={trendData} />
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid gap-8 lg:grid-cols-12 items-start">
                {/* Priority Feed */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            Priority Stack
                        </h2>
                        <Badge variant="outline" className="font-mono text-[10px] uppercase">TOP 5 CRITICAL</Badge>
                    </div>

                    <div className="grid gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredComplaints
                                .filter(c => ['critical', 'high'].includes(c.urgency))
                                .slice(0, 5)
                                .map((c, i) => (
                                    <motion.div
                                        key={c.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Card className="group cursor-pointer hover:border-red-500/50 hover:shadow-md transition-all border-l-4 border-l-red-600 bg-white dark:bg-zinc-950">
                                            <CardContent className="p-4 flex gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <Badge variant="outline" className="text-[9px] uppercase tracking-tighter h-4 px-1">{c.department}</Badge>
                                                        <span className="text-[10px] text-muted-foreground">{new Date(c.timestamp).toLocaleTimeString()}</span>
                                                    </div>
                                                    <p className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-red-700 transition-colors">
                                                        {c.text}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-medium">
                                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.location || "City Center"}</span>
                                                        <span className="flex items-center gap-1 text-red-500 font-bold uppercase"><AlertTriangle className="w-3 h-3" /> {c.urgency}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))
                            }
                        </AnimatePresence>

                        {filteredComplaints.filter(c => ['critical', 'high'].includes(c.urgency)).length === 0 && (
                            <div className="py-12 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground">
                                <CheckCircle className="w-10 h-10 mb-2 text-emerald-500/30" />
                                <p className="text-sm font-medium italic">All critical sectors clear.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Operations Feed */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            Operational Feed
                        </h2>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest h-7">Export Logs</Button>
                        </div>
                    </div>

                    <Card className="shadow-2xl border-none overflow-hidden">
                        <div className="bg-muted/10 p-4 border-b grid grid-cols-12 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                            <div className="col-span-6">Incident Details</div>
                            <div className="col-span-3">Department</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-1">Action</div>
                        </div>
                        <CardContent className="p-0">
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {filteredComplaints.slice(0, 10).map((c) => (
                                    <div key={c.id} className="grid grid-cols-12 items-center p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                                        <div className="col-span-6 pr-8">
                                            <p className="text-sm font-medium truncate mb-1">{c.text}</p>
                                            <div className="flex items-center gap-3">
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                                                    <Clock className="w-3 h-3" /> {new Date(c.timestamp).toLocaleString()}
                                                </p>
                                                {c.duplicate_group_id && (
                                                    <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-600 border-amber-200 h-4 px-1 flex items-center gap-1">
                                                        <Layers className="w-2.5 h-2.5" /> Duplicate Cluster
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-span-3">
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize bg-zinc-100 text-zinc-600 border-none font-mono">
                                                {c.department}
                                            </Badge>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${c.status === 'resolved' ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`} />
                                                <span className="text-[10px] font-bold uppercase tracking-tight">{c.status}</span>
                                            </div>
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <TrendingUp className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
