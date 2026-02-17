import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Send, Mic, Square, MapPin, Image as ImageIcon, CheckCircle, Paperclip } from "lucide-react";

export default function ComplaintForm() {
    const [text, setText] = useState("");
    const [location, setLocation] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];
            mediaRecorder.current.ondataavailable = (event) => audioChunks.current.push(event.data);
            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
                await transcribeAudio(audioBlob);
            };
            mediaRecorder.current.start();
            setIsRecording(true);
            setError("");
        } catch (err) {
            setError("Microphone access denied.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current) {
            mediaRecorder.current.stop();
            setIsRecording(false);
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const transcribeAudio = async (blob: Blob) => {
        setIsTranscribing(true);
        const formData = new FormData();
        formData.append("file", blob, "recording.wav");
        try {
            const response = await fetch("http://localhost:8000/voice/transcribe", {
                method: "POST",
                body: formData
            });
            if (!response.ok) throw new Error("Transcription failed");
            const data = await response.json();
            setText(prev => (prev ? prev + " " + data.text : data.text));
        } catch (err) {
            setError("Voice transcription failed.");
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        setSuccess(false);

        const formData = new FormData();
        formData.append("text", text);
        if (location) formData.append("location", location);
        if (imageFile) formData.append("image", imageFile);

        try {
            const response = await fetch("http://localhost:8000/complaints/", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: formData
            });

            if (!response.ok) throw new Error("Failed to submit complaint");
            const data = await response.json();
            setAiResult(data);
            setSuccess(true);
            setText("");
            setLocation("");
            setImageFile(null);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container max-w-2xl py-10 px-4 mx-auto">
            <Card className="shadow-2xl border-none ring-1 ring-gray-200 bg-white">
                <CardHeader className="text-center pb-8 border-b mb-6 space-y-2">
                    <CardTitle className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">Public Report</CardTitle>
                    <CardDescription className="text-sm font-medium">Empowering citizens with AI-driven municipal response.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <Label htmlFor="text" className="text-xs font-black uppercase tracking-widest text-blue-600">Issue Description</Label>
                            <div className="relative group">
                                <Textarea
                                    id="text"
                                    placeholder="Describe the issue clearly. Our AI will handle the rest."
                                    className="min-h-[160px] resize-none pr-12 text-base border-2 focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all rounded-xl"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    required
                                />
                                <div className="absolute right-4 bottom-4 flex gap-3">
                                    {!isRecording ? (
                                        <Button
                                            type="button" variant="secondary" size="icon"
                                            onClick={startRecording} disabled={isTranscribing}
                                            className="h-10 w-10 rounded-full shadow-sm hover:bg-blue-50 hover:text-blue-600 transition-all"
                                        >
                                            <Mic className="h-5 w-5" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button" variant="destructive" size="icon"
                                            onClick={stopRecording}
                                            className="h-10 w-10 rounded-full animate-pulse shadow-md"
                                        >
                                            <Square className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {isTranscribing && (
                                <div className="flex items-center gap-2 text-xs text-blue-600 font-bold animate-pulse px-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    AI Transcribing...
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="location" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-orange-500" /> Location Details
                                </Label>
                                <Input
                                    id="location" placeholder="e.g., Corner of 5th & Oak"
                                    value={location} onChange={(e) => setLocation(e.target.value)}
                                    className="h-12 border-2 rounded-xl focus-visible:ring-blue-600"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4 text-purple-500" /> Evidence Photo
                                </Label>
                                <input
                                    type="file" accept="image/*" className="hidden"
                                    ref={fileInputRef} onChange={handleFileChange}
                                />
                                <Button
                                    variant="outline" type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-full h-12 border-2 border-dashed rounded-xl transition-all ${imageFile ? 'border-green-500 bg-green-50/50 text-green-700' : 'hover:border-blue-400 hover:bg-blue-50/50'}`}
                                >
                                    {imageFile ? <div className="flex items-center gap-2 font-bold"><Paperclip className="h-4 w-4" /> {imageFile.name.substring(0, 15)}...</div> : <div className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Add Photo</div>}
                                </Button>
                            </div>
                        </div>

                        {error && (
                            <Alert variant="destructive" className="border-2 bg-red-50 text-red-900 rounded-xl">
                                <AlertTitle className="font-bold">Submission Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full h-14 text-xl font-black shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 rounded-xl bg-blue-700 hover:bg-blue-800" disabled={isSubmitting}>
                            {isSubmitting ? <div className="flex items-center gap-3"><Loader2 className="h-6 w-6 animate-spin" /> Running Triage...</div> : <div className="flex items-center gap-3"><Send className="h-5 w-5" /> Submit to City Hall</div>}
                        </Button>
                    </form>
                </CardContent>

                {success && aiResult && (
                    <div className="m-6 p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-inner">
                        <div className="flex items-center gap-3 mb-6 text-green-800 font-extrabold uppercase text-sm tracking-widest">
                            <CheckCircle className="h-6 w-6 text-green-600" /> AI Intelligent Triage Report
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-green-200">
                                <span className="block text-[10px] text-muted-foreground font-black uppercase mb-1">AI Classification</span>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-none font-bold px-3 py-1 text-xs">{aiResult.category}</Badge>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-green-200">
                                <span className="block text-[10px] text-muted-foreground font-black uppercase mb-1">Priority Score</span>
                                <Badge variant={aiResult.urgency === 'critical' ? 'destructive' : 'default'} className="uppercase font-black text-xs px-3 py-1">
                                    {aiResult.urgency}
                                </Badge>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-green-200">
                                <span className="block text-[10px] text-muted-foreground font-black uppercase mb-1">Smart Routing</span>
                                <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-600" /> {aiResult.department}
                                </span>
                            </div>
                        </div>
                        {aiResult.duplicate_group_id && (
                            <div className="mt-6 flex gap-3 p-4 bg-blue-100/50 border-2 border-blue-200 rounded-xl">
                                <ImageIcon className="h-5 w-5 text-blue-600 shrink-0" />
                                <p className="text-xs text-blue-900 font-medium leading-relaxed">
                                    <strong>Duplicate Detected:</strong> Our vision and language models found 3 similar reports nearby. We've consolidated your report with case #{aiResult.duplicate_group_id.substring(0, 8)} to prioritize field action.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}
