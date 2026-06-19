'use client';

import { useState, useEffect } from 'react';
import { usePlatformStore, TwinAsset } from '@/store/usePlatformStore';
import { 
  Building2, Thermometer, Users, ShieldAlert, Navigation, 
  Layers, MapPin, Check, Info, ShieldCheck, Compass, Eye, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function DigitalTwinView() {
  const { twinAssets, updateTwinAsset } = usePlatformStore();
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room-01');
  const [activeFloor, setActiveFloor] = useState<1 | 2>(1);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [mapType, setMapType] = useState<'h' | 'k' | 'm' | 'p'>('h');

  // Simulated telemetry updates
  useEffect(() => {
    const telemetryTimer = setInterval(() => {
      const roomIds = ['room-01', 'room-02', 'room-03', 'room-04'];
      const randomRoomId = roomIds[Math.floor(Math.random() * roomIds.length)];
      const targetRoom = twinAssets.find(r => r.id === randomRoomId);
      
      if (!targetRoom) return;

      const tempDiff = (Math.random() - 0.5) * 0.4;
      const newTemp = Number((targetRoom.temperature + tempDiff).toFixed(1));
      
      const occDiff = Math.random() > 0.5 ? 1 : -1;
      const newOcc = Math.max(0, Math.min(targetRoom.maxOccupancy, targetRoom.occupancy + occDiff));

      updateTwinAsset(targetRoom.id, {
        temperature: newTemp,
        occupancy: newOcc,
        status: newOcc > targetRoom.maxOccupancy * 0.9 ? 'warning' : 'active'
      });
    }, 4000);

    return () => clearInterval(telemetryTimer);
  }, [twinAssets, updateTwinAsset]);

  const selectedRoom = twinAssets.find(r => r.id === selectedRoomId) || twinAssets[0];

  // Helper colors for heatmaps
  const getRoomColor = (room: TwinAsset) => {
    if (heatmapEnabled) {
      const density = room.occupancy / room.maxOccupancy;
      if (density > 0.8) return 'border-red-500 bg-red-500/10 text-red-400'; 
      if (density > 0.4) return 'border-yellow-500 bg-yellow-500/10 text-yellow-400'; 
      return 'border-emerald-500 bg-emerald-500/10 text-emerald-400'; 
    }
    return room.id === selectedRoomId 
      ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(255,0,15,0.15)]' 
      : 'border-border/30 bg-card/60 text-muted-foreground hover:text-foreground hover:border-border/60';
  };

  // Filtered rooms based on floor
  const floorRooms = twinAssets.filter(r => r.floor === activeFloor);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full font-satoshi bg-background relative overflow-y-auto">
      
      {/* LEFT SECTION: 2D Interactive Map & Floorplan Workspace */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col gap-6 overflow-y-auto">
        
        {/* Render controllers */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/15">
          <div>
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
              <Compass className="w-4.5 h-4.5 text-primary" />
              ABB Nashik Campus
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-sans">
              Plot 79, Street 17, MIDC Industrial Area, Nashik, Maharashtra
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-border/30 bg-card/65 backdrop-blur p-1 flex">
              <button
                onClick={() => { setActiveFloor(1); setSelectedRoomId('room-01'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeFloor === 1 ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Floor 1
              </button>
              <button
                onClick={() => { setActiveFloor(2); setSelectedRoomId('room-03'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeFloor === 2 ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Floor 2
              </button>
            </div>

            <button
              onClick={() => setHeatmapEnabled(!heatmapEnabled)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur transition-all flex items-center gap-1.5 cursor-pointer ${
                heatmapEnabled 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-card/65 border-border/30 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {heatmapEnabled ? 'Density Heatmap' : 'Heatmap'}
            </button>
          </div>
        </div>

        {/* 1. Real-world Google Map Embed (Always Visible) */}
        <div className="w-full h-64 sm:h-72 rounded-2xl border border-border/20 overflow-hidden relative shadow-sm shrink-0 bg-background/5">
          <iframe
            title="ABB Nashik Location Map"
            src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2755.052340638405!2d73.72655283588146!3d20.002875411003306!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bddec671e4dde8f%3A0xe13d322758665730!2sABB%20India%20Limited!5e0!3m2!1sen!2sus!4v1781852892801!5m2!1sen!2sus${
              mapType === 'k' ? '&maptype=satellite' : mapType === 'h' ? '&maptype=hybrid' : mapType === 'p' ? '&maptype=terrain' : ''
            }`}
            className="w-full h-full border-none pointer-events-auto"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
          
          {/* Overlay Badge Top Left */}
          <div className="absolute top-4 left-4 z-10 px-2.5 py-1.5 rounded-lg bg-card/90 backdrop-blur border border-border text-[9px] font-bold text-foreground shadow-md flex items-center gap-1">
            <MapPin className="w-3 h-3 text-primary animate-bounce" />
            <span>ABB Satpur (Plot 79)</span>
          </div>

          {/* Overlay View Switcher Top Right */}
          <div className="absolute top-4 right-4 z-10 rounded-lg border border-border/40 bg-card/90 backdrop-blur p-1 flex gap-1 shadow-md">
            {[
              { id: 'h', label: 'Hybrid' },
              { id: 'k', label: 'Sat' },
              { id: 'm', label: 'Map' },
              { id: 'p', label: 'Terrain' }
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setMapType(view.id as any)}
                className={`px-2 py-1 rounded text-[8px] font-bold transition-all uppercase cursor-pointer ${
                  mapType === view.id 
                    ? 'bg-primary text-white' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Interactive Floorplan (Always Visible) */}
        <div className="w-full rounded-2xl border border-border/20 bg-background/5 p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              Interactive 2D Floor Plan (Floor {activeFloor})
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              Select a zone below to read sensors
            </span>
          </div>

          {/* SVG Visualizer / Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {floorRooms.map((room) => {
              const density = room.occupancy / room.maxOccupancy;
              const colorClass = getRoomColor(room);
              const isSelected = room.id === selectedRoomId;

              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`p-5 rounded-xl border-2 text-left transition-all duration-300 relative flex flex-col justify-between h-40 cursor-pointer group ${colorClass}`}
                >
                  {isSelected && (
                    <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
                  )}
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[10px] font-black uppercase tracking-wider">{room.id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                        room.status === 'warning' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {room.status}
                      </span>
                    </div>
                    <h3 className="text-xs font-extrabold text-foreground mt-2 group-hover:underline truncate">
                      {room.name}
                    </h3>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/15">
                    <div className="flex justify-between text-[9px]">
                      <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-primary" /> Temperature</span>
                      <span className="font-bold font-mono text-foreground">{room.temperature}°C</span>
                    </div>
                    <div className="flex justify-between text-[9px]">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-blue-400" /> Occupancy</span>
                      <span className="font-bold font-mono text-foreground">{room.occupancy}/{room.maxOccupancy}</span>
                    </div>
                    
                    {/* Mini density bar */}
                    <div className="w-full bg-muted border border-border/10 rounded-full h-1 overflow-hidden">
                      <div className={`h-full rounded-full ${
                        density > 0.8 ? 'bg-red-500' : density > 0.4 ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`} style={{ width: `${Math.min(100, density * 100)}%` }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ambient overlay info */}
        <div className="flex gap-4 text-[10px] font-semibold text-muted-foreground bg-card/40 border border-border/20 p-2 rounded-xl self-start">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-primary" />
            Selected Zone
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-muted-foreground" />
            Other Zones
          </div>
          {heatmapEnabled && (
            <div className="flex items-center gap-3 border-l border-border/30 pl-3">
              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded bg-emerald-500" /> Low density</span>
              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded bg-yellow-500" /> Mid density</span>
              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded bg-red-500" /> High density</span>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Telemetry Stats Details Panel */}
      <div className="w-full lg:w-80 p-5 flex flex-col gap-6 bg-card/10 border-t lg:border-t-0 border-border/20 z-10 shrink-0">
        <div>
          <span className="text-[10px] font-black uppercase text-primary tracking-widest">
            Asset Telemetry
          </span>
          <h2 className="text-lg font-black text-foreground mt-0.5 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            ABB Venue Telemetry
          </h2>
          <p className="text-[10px] text-muted-foreground leading-normal mt-1 font-sans">
            Real-time environmental indices and safety alarms from physical hardware gateways.
          </p>
        </div>

        {/* Stats card */}
        <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-foreground truncate max-w-[150px]">{selectedRoom.name}</span>
            <span className="text-[10px] font-bold text-muted-foreground font-mono">{selectedRoom.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/15">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Temperature</span>
              <div className="text-lg font-black text-foreground font-mono flex items-baseline gap-0.5">
                {selectedRoom.temperature}
                <span className="text-[10px] font-bold text-muted-foreground">°C</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Occupancy</span>
              <div className="text-lg font-black text-foreground font-mono flex items-baseline gap-0.5">
                {selectedRoom.occupancy}
                <span className="text-[10px] font-semibold text-muted-foreground">/{selectedRoom.maxOccupancy}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase">
              <span>Roster Density</span>
              <span>{Math.round((selectedRoom.occupancy / selectedRoom.maxOccupancy) * 100)}%</span>
            </div>
            <div className="w-full bg-muted border border-border/10 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  selectedRoom.occupancy > selectedRoom.maxOccupancy * 0.9 
                    ? 'bg-red-500' 
                    : selectedRoom.occupancy > selectedRoom.maxOccupancy * 0.4 
                    ? 'bg-yellow-500' 
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${(selectedRoom.occupancy / selectedRoom.maxOccupancy) * 100}%` }}
              />
            </div>
          </div>

          {selectedRoom.activeChallenge && (
            <div className="pt-3 border-t border-border/15">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">Active Hackathon Track</span>
              <span className="text-[10px] font-semibold text-foreground leading-normal block">
                {selectedRoom.activeChallenge}
              </span>
            </div>
          )}
        </div>

        {/* Safety Anomaly Alarms log */}
        <div className="flex-1 flex flex-col gap-3 min-h-[150px]">
          <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Security & Safety Gateways
          </h3>

          <div className="flex-1 rounded-2xl border border-border/40 bg-card p-3 space-y-3 overflow-y-auto max-h-[220px]">
            {twinAssets.some(r => r.status === 'warning') ? (
              <div className="p-2.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 flex gap-2">
                <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-bold uppercase">High Roster Density Alert</h4>
                  <p className="text-[9px] text-muted-foreground leading-normal mt-0.5 font-sans">
                    Zone {twinAssets.find(r => r.status === 'warning')?.id} exceeds 90% threshold occupancy limits.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 flex gap-2">
                <ShieldCheck className="w-4.5 h-4.5 shrink-0 text-emerald-500 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-bold uppercase">All Gateways Clean</h4>
                  <p className="text-[9px] text-muted-foreground leading-normal mt-0.5 font-sans">
                    HVAC units, security portals, and fire routes operating within nominal criteria.
                  </p>
                </div>
              </div>
            )}

            <div className="divide-y divide-border/15 pt-2">
              <div className="py-2 flex justify-between text-[9px]">
                <span className="text-muted-foreground">HVAC Status:</span>
                <span className="font-bold text-foreground uppercase">Nominal (Auto)</span>
              </div>
              <div className="py-2 flex justify-between text-[9px]">
                <span className="text-muted-foreground">Gateway Fire-Routes:</span>
                <span className="font-bold text-emerald-400 uppercase">Clear</span>
              </div>
              <div className="py-2 flex justify-between text-[9px]">
                <span className="text-muted-foreground">SSID Wi-Fi Gateway:</span>
                <span className="font-mono text-foreground">ABB-Innovators-2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
