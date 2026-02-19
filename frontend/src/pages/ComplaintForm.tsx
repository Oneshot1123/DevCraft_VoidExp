import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Zap,
    Globe,
    Shield,
    Loader2,
    Mic,
    Search
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { API_BASE_URL } from '../config';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function ComplaintForm() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [text, setText] = useState("");
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [address, setAddress] = useState("");
    const [isRecording, setIsRecording] = useState(false);

    useEffect(() => {
        if (step === 2 && !location) {
            // Auto-GPS capture
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.error("GPS inhibited:", err)
            );
        }
    }, [step, location]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const LocationMarker = () => {
        const markerRef = useRef<L.Marker>(null);
        useMapEvents({
            click(e) {
                setLocation(e.latlng);
            },
        });

        const eventHandlers = {
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    setLocation(marker.getLatLng());
                }
            },
        };

        return location ? (
            <Marker
                draggable={true}
                eventHandlers={eventHandlers}
                position={location}
                ref={markerRef}
            />
        ) : null;
    };

    const handleSubmit = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append("text", text);
        if (location) {
            formData.append("latitude", location.lat.toString());
            formData.append("longitude", location.lng.toString());
        }
        if (image) formData.append("image", image);

        try {
            const res = await fetch(`${API_BASE_URL}/complaints/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: formData
            });
            const data = await res.json();
            setResult(data);
            setStep(4);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground neural-noise selection:bg-primary/20 py-20 px-6">
            <div className="fixed inset-0 z-0 mesh-gradient opacity-60 pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto">
                <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-3 bg-primary rounded-full shadow-lg shadow-primary/20" />
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-primary uppercase">
                                Dispatch Report
                            </h1>
                        </div>
                        <p className="text-xl text-muted-foreground pl-7 max-w-xl font-medium leading-relaxed">
                            Official reporting protocol. Step {step} of 3.
                        </p>
                    </div>
                    {step < 4 && (
                        <div className="flex gap-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary' : 'bg-muted'}`} />
                            ))}
                        </div>
                    )}
                </header>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass-card rounded-[3rem] p-12 space-y-8 bg-white border border-border shadow-sm"
                        >
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Subject Metadata</label>
                                <textarea
                                    id="complaint-text"
                                    data-testid="complaint-text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Describe the institutional issue in detail..."
                                    className="w-full h-64 bg-muted border border-border rounded-3xl p-8 text-2xl font-black tracking-tight focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground/50 text-foreground"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    id="step1-next"
                                    data-testid="step1-next"
                                    disabled={!text}
                                    onClick={() => setStep(2)}
                                    className="px-10 py-5 rounded-2xl bg-primary text-white text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-20 flex items-center gap-3 shadow-xl shadow-primary/20"
                                >
                                    Next Phase <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass-card rounded-[3rem] p-12 space-y-8 h-[700px] flex flex-col bg-white border border-border shadow-sm"
                        >
                            <div className="flex-1 rounded-[2.5rem] overflow-hidden border border-border shadow-inner bg-muted relative">
                                <MapContainer center={[19.076, 72.8777]} zoom={12} className="h-full w-full opacity-90">
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <LocationMarker />
                                </MapContainer>
                                <div className="absolute top-8 left-8 z-[1000] glass-card bg-white/80 border border-border px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <Globe className="w-3 h-3 text-primary" /> Mapping Active
                                </div>
                                <div className="absolute bottom-8 left-8 right-8 z-[1000] space-y-4">
                                    <div className="glass shadow-2xl p-6 rounded-3xl flex items-center gap-6 bg-white/90 border border-border">
                                        <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                                            <Search className="w-6 h-6" />
                                        </div>
                                        <input
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Fallback: Enter Manual Identity/Address..."
                                            className="bg-transparent border-none focus:ring-0 text-sm font-bold tracking-tight text-foreground flex-1"
                                        />
                                    </div>
                                    <p className="text-center text-[8px] font-black text-muted-foreground uppercase tracking-widest bg-white/50 py-1 rounded-full backdrop-blur-sm">Dragging Enabled for Precision Calibration</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <button onClick={() => setStep(1)} className="text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    disabled={!location}
                                    onClick={() => setStep(3)}
                                    className="px-10 py-5 rounded-2xl bg-primary text-white text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-20 flex items-center gap-3 shadow-xl shadow-primary/20"
                                >
                                    Geocode Location <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass-card rounded-[3rem] p-12 space-y-12 bg-white border border-border shadow-sm"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Visual Evidence (Optional)</label>
                                    <div
                                        onClick={() => document.getElementById('image-upload')?.click()}
                                        className="h-80 w-full rounded-[2.5rem] bg-muted border-2 border-dashed border-border hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer relative overflow-hidden group"
                                    >
                                        {imagePreview ? (
                                            <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <>
                                                <Camera className="w-12 h-12 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Deploy Image Probe</span>
                                            </>
                                        )}
                                        <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </div>

                                    {/* Voice Input Probe */}
                                    <button
                                        onClick={() => setIsRecording(!isRecording)}
                                        className={`w-full py-6 rounded-2xl flex items-center justify-center gap-4 border transition-all ${isRecording ? 'bg-destructive/10 text-destructive animate-pulse border-destructive/30' : 'bg-muted text-muted-foreground hover:text-primary hover:bg-muted/80 border-border'}`}
                                    >
                                        <Mic className="w-5 h-5" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                            {isRecording ? "Listening to Audio Payload..." : "Initialize Voice Probe"}
                                        </span>
                                    </button>
                                </div>
                                <div className="space-y-8 flex flex-col justify-center">
                                    <div className="p-8 rounded-3xl space-y-4 bg-muted border border-border">
                                        <h4 className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">
                                            <Shield className="w-4 h-4" /> Verification Protocol
                                        </h4>
                                        <p className="text-sm text-muted-foreground font-medium">By initializing this report, you confirm the municipal accuracy of the provided metadata.</p>
                                    </div>
                                    <button
                                        id="complaint-submit"
                                        data-testid="complaint-submit"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="w-full h-24 rounded-3xl bg-primary text-white text-lg font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 group"
                                    >
                                        {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : (
                                            <>Commit Report <Zap className="w-6 h-6 group-hover:scale-125 transition-transform" /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && result && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card rounded-[3rem] p-16 text-center space-y-12 bg-white border border-border shadow-sm"
                        >
                            <div className="w-24 h-24 rounded-full bg-success/10 text-success mx-auto flex items-center justify-center animate-bounce shadow-2xl shadow-success/10">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-6xl font-black uppercase tracking-tighter text-primary">Report Anchored</h2>
                                <p className="text-xl text-muted-foreground font-medium">Your civic contribution has been TRIAGED and ROUTED.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="p-8 rounded-3xl space-y-2 border border-border bg-muted">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tracking ID</span>
                                    <p className="text-xl font-black uppercase text-primary">{result.id.slice(0, 8)}</p>
                                </div>
                                <div className="p-8 rounded-3xl space-y-2 border border-border bg-muted">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sector</span>
                                    <p className="text-xl font-black uppercase text-foreground">{result.ward || "Ward A"}</p>
                                </div>
                                <div className="p-8 rounded-3xl space-y-2 border border-primary/20 bg-primary/5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Neural Triage</span>
                                    <p className="text-xl font-black uppercase text-primary">{result.category || result.classification}</p>
                                </div>
                                <div className="p-8 rounded-3xl space-y-2 border border-success/20 bg-success/5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-success">Response SLA</span>
                                    <p className="text-xl font-black uppercase text-success">{result.sla_eta || "24 Hours"}</p>
                                </div>
                            </div>

                            <button onClick={() => navigate('/status')} className="px-12 py-6 rounded-2xl bg-primary text-white text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
                                Track Live Pulse
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
