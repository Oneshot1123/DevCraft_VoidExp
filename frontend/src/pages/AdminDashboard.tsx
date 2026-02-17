import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, CheckCircle, BarChart3, Users, Filter } from "lucide-react";

interface Complaint {
    id: string;
    text: string;
    category: string;
    urgency: string;
    department: string;
    status: string;
    timestamp: string;
}

export default function AdminDashboard() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [_error, setError] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("all");

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
            if (!response.ok) throw new Error("Failed to fetch dashboard data");
            const data = await response.json();
            setComplaints(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredComplaints = departmentFilter === "all"
        ? complaints
        : complaints.filter(c => c.department === departmentFilter);

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'pending').length,
        urgent: complaints.filter(c => ['critical', 'high'].includes(c.urgency)).length,
        resolved: complaints.filter(c => c.status === 'resolved').length
    };

    const departments = Array.from(new Set(complaints.map(c => c.department))).filter(Boolean);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container p-6 mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Executive Dashboard</h1>
                    <p className="text-muted-foreground">Monitor city-wide issues and infrastructure health.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments.map(dept => (
                                <SelectItem key={dept} value={dept || "Unknown"}>{dept}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => fetchComplaints()}>
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Incidents</CardTitle>
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Pending Action</CardTitle>
                        <Users className="w-4 h-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Critical Alerts</CardTitle>
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 font-mono">{stats.urgent}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Resolution Rate</CardTitle>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Priority Queue</CardTitle>
                        <CardDescription>Most urgent issues requiring immediate attention.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {filteredComplaints
                                .filter(c => ['critical', 'high'].includes(c.urgency))
                                .slice(0, 5)
                                .map(c => (
                                    <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50/30 dark:bg-red-900/10 hover:bg-red-100/50 transition-colors">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none line-clamp-1">{c.text}</p>
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="text-[10px] h-4 uppercase">{c.department}</Badge>
                                                <Badge variant="destructive" className="text-[10px] h-4 uppercase font-bold">{c.urgency}</Badge>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-xs h-8">View</Button>
                                    </div>
                                ))
                            }
                            {filteredComplaints.filter(c => ['critical', 'high'].includes(c.urgency)).length === 0 && (
                                <p className="text-center text-muted-foreground py-10 italic">No critical issues found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>All Complaints</CardTitle>
                        <CardDescription>Full feed of incoming reports.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {filteredComplaints.slice(0, 6).map(c => (
                                <div key={c.id} className="flex items-center space-x-4 border-b pb-4 last:border-0 last:pb-0">
                                    <div className={`p-2 rounded-full ${c.status === 'resolved' ? 'bg-green-100 text-green-600' :
                                            c.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{c.text}</p>
                                        <p className="text-xs text-muted-foreground">{c.department} • {new Date(c.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                    <Badge variant={c.status === 'resolved' ? 'default' : 'secondary'} className="text-[10px] h-5 px-1.5 uppercase">
                                        {c.status}
                                    </Badge>
                                </div>
                            ))}
                            {filteredComplaints.length === 0 && (
                                <p className="text-center text-muted-foreground py-10 italic">No reports yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
