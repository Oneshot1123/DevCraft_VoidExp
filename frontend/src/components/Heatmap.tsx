import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Simple heatmap implementation using canvas since external library might be tricky to install/verify
function HeatmapLayer({ points }: { points: [number, number, number][] }) {
    const map = useMap();

    useEffect(() => {
        if (!map || points.length === 0) return;

        // Leaflet.heat is usually a global plugin, but we can simulate it or use a simple radius-based approach
        // For this implementation, we will use a custom canvas layer for maximum "Elite" performance
        const canvas = document.createElement('canvas');
        canvas.style.pointerEvents = 'none';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '400';

        const update = () => {
            const size = map.getSize();
            canvas.width = size.x;
            canvas.height = size.y;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            points.forEach(([lat, lng, intensity]) => {
                const point = map.latLngToContainerPoint([lat, lng]);
                const radius = intensity * 40;

                const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
                gradient.addColorStop(0, 'rgba(59, 130, 246, 0.6)'); // Blue
                gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.2)'); // Indigo
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                ctx.fillStyle = gradient;
                ctx.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
            });
        };

        map.on('moveend viewreset', update);
        map.getPanes().overlayPane.appendChild(canvas);
        update();

        return () => {
            map.off('moveend viewreset', update);
            if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        };
    }, [map, points]);

    return null;
}

export default function GeospatialHeatmap({ complaints }: { complaints: any[] }) {
    const points: [number, number, number][] = complaints
        .filter(c => c.latitude && c.longitude)
        .map(c => [
            c.latitude,
            c.longitude,
            c.urgency === 'critical' ? 1.0 : (c.urgency === 'high' ? 0.7 : 0.4)
        ]);

    return (
        <div className="w-full h-full rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl relative">
            <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
                <div className="glass px-4 py-2 rounded-full border border-blue-500/20 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Live Density Feed</span>
                </div>
            </div>

            <MapContainer
                center={[19.0760, 72.8777]} // Mumbai Center
                zoom={11}
                style={{ height: "100%", width: "100%", background: "#09090b" }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <HeatmapLayer points={points} />
            </MapContainer>
        </div>
    );
}
