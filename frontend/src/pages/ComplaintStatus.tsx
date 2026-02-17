import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";

interface Complaint {
    id: string;
    text: string;
    category: string;
    urgency: string;
    department: string;
    status: string;
    timestamp: string;
}

export default function ComplaintStatus() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container p-4 mx-auto max-w-4xl">
            <h1 className="mb-6 text-3xl font-bold">My Complaints</h1>

            {error && (
                <div className="mb-6">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            )}

            <div className="grid gap-4">
                {complaints.length === 0 && !error ? (
                    <p className="text-muted-foreground text-center py-10">No complaints found.</p>
                ) : (
                    complaints.map((complaint) => (
                        <Card key={complaint.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <Badge variant="outline" className="mb-2 mr-2">{complaint.category}</Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(complaint.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <Badge
                                        variant={complaint.status === 'resolved' ? 'default' : 'secondary'}
                                        className={complaint.status === 'resolved' ? 'bg-green-600 hover:bg-green-700' : ''}
                                    >
                                        {complaint.status}
                                    </Badge>
                                </div>
                                <CardTitle className="text-lg font-medium line-clamp-2 md:line-clamp-1">
                                    {complaint.text}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <span className="mr-1 font-medium text-foreground">Urgency:</span>
                                        <span className={
                                            complaint.urgency === 'critical' ? 'text-red-600 font-bold' :
                                                complaint.urgency === 'high' ? 'text-orange-600 font-semibold' :
                                                    'text-foreground'
                                        }>
                                            {complaint.urgency.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="mx-2">•</div>
                                    <div>
                                        <span className="mr-1 font-medium text-foreground">Department:</span>
                                        {complaint.department}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
