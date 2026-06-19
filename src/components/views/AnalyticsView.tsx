'use client';

import { useState, useEffect } from 'react';
import { usePlatformStore } from '@/store/usePlatformStore';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, LineChart, Line, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, FileText, HelpCircle, 
  Sparkles, CheckCircle2, ShieldAlert
} from 'lucide-react';

export function AnalyticsView() {
  const { allTeams, challenges } = usePlatformStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // 1. KPI Stats Metrics
  const totalTeams = allTeams.length;
  const submissionsCount = allTeams.filter(t => t.submissions.length > 0).length;
  const activeStudents = allTeams.reduce((sum, t) => sum + t.members.length, 0);
  const completionRate = totalTeams > 0 ? Math.round((submissionsCount / totalTeams) * 100) : 0;

  // 2. Chart A Data: Grid energy loads (Area Chart)
  const gridLoadData = [
    { time: '00:00', solarSupply: 20, loadDemand: 45, batteryStorage: 80 },
    { time: '04:00', solarSupply: 15, loadDemand: 35, batteryStorage: 65 },
    { time: '08:00', solarSupply: 40, loadDemand: 65, batteryStorage: 50 },
    { time: '12:00', solarSupply: 95, loadDemand: 80, batteryStorage: 85 },
    { time: '16:00', solarSupply: 70, loadDemand: 90, batteryStorage: 90 },
    { time: '20:00', solarSupply: 30, loadDemand: 75, batteryStorage: 70 },
  ];

  // 3. Chart B Data: Fleet Robot coordination paths congestion (Bar Chart)
  const fleetCongestionData = [
    { robot: 'AMR-01', taskCompleteTime: 120, collisionAlerts: 1 },
    { robot: 'AMR-02', taskCompleteTime: 180, collisionAlerts: 4 },
    { robot: 'AMR-03', taskCompleteTime: 95, collisionAlerts: 0 },
    { robot: 'AMR-04', taskCompleteTime: 145, collisionAlerts: 2 },
    { robot: 'AMR-05', taskCompleteTime: 210, collisionAlerts: 5 },
  ];

  // 4. Chart C Data: Acceleration Vibration Telemetry anomalies (Line Chart)
  const vibrationTelemetryData = [
    { sample: 1, motorVibration: 2.1, threshold: 3.5 },
    { sample: 2, motorVibration: 2.3, threshold: 3.5 },
    { sample: 3, motorVibration: 3.8, threshold: 3.5 }, // Anomaly spike
    { sample: 4, motorVibration: 2.5, threshold: 3.5 },
    { sample: 5, motorVibration: 2.2, threshold: 3.5 },
    { sample: 6, motorVibration: 2.0, threshold: 3.5 },
  ];

  // 5. Chart D Data: Teams Track distribution (Pie Chart)
  const trackDistribution = challenges.map((ch, idx) => {
    const matchingTeamsCount = allTeams.filter(t => t.challengeId === ch.id).length;
    
    // Custom colors for tracks
    const colors = ['#FF000F', '#2196F3', '#00C853', '#FFC107'];
    return {
      name: ch.track,
      value: matchingTeamsCount || 1, // Fallback to 1 for visuals if 0
      color: colors[idx % colors.length]
    };
  });

  // Custom tooltips styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-border/40 bg-card p-3 shadow-xl backdrop-blur text-xs font-satoshi">
          <p className="font-bold text-foreground">{label}</p>
          <div className="space-y-1.5 mt-2">
            {payload.map((item: any, idx: number) => (
              <p key={idx} className="flex items-center gap-2" style={{ color: item.color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}:</span>
                <span className="font-bold text-foreground font-mono">{item.value}</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto bg-background font-satoshi">
      
      {/* Dashboard KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Active Innovators', value: activeStudents, trend: '+15% vs yesterday', isUp: true },
          { icon: FileText, label: 'Submissions Received', value: submissionsCount, trend: `${completionRate}% submission rate`, isUp: true },
          { icon: Sparkles, label: 'Registered Teams', value: totalTeams, trend: '4 teams active', isUp: true },
          { icon: HelpCircle, label: 'Mentor Hours Booked', value: '32.5 hrs', trend: '+8.2 hrs this week', isUp: true },
        ].map((kpi, idx) => {
          const IconComponent = kpi.icon;
          return (
            <div key={idx} className="relative rounded-2xl border border-border/40 bg-card p-5 shadow-sm overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    {kpi.label}
                  </span>
                  <span className="text-2xl font-black text-foreground font-mono block">
                    {kpi.value}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <IconComponent className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1.5 font-semibold font-sans">
                {kpi.isUp ? <TrendingUp className="w-3.5 h-3.5 text-success" /> : <TrendingDown className="w-3.5 h-3.5 text-danger" />}
                {kpi.trend}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid supply load forecast charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart - Decentralized grid */}
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm space-y-4">
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Decentralized Microgrid
            </span>
            <h3 className="text-sm font-extrabold text-foreground mt-0.5">
              Energy Generation & Load Demand (kW)
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gridLoadData}>
                <defs>
                  <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFC107" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#FFC107" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF000F" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#FF000F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="solarSupply" stroke="#FFC107" strokeWidth={2} fillOpacity={1} fill="url(#solarGrad)" name="Solar Supply" />
                <Area type="monotone" dataKey="loadDemand" stroke="#FF000F" strokeWidth={2} fillOpacity={1} fill="url(#loadGrad)" name="Load Demand" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Robotics fleets */}
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm space-y-4">
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Autonomous Mobile Robots
            </span>
            <h3 className="text-sm font-extrabold text-foreground mt-0.5">
              AMR Task Completion & Path Collision Warnings
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fleetCongestionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="robot" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="taskCompleteTime" fill="#2196F3" radius={[4, 4, 0, 0]} name="Task Time (s)">
                  {fleetCongestionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.collisionAlerts > 3 ? '#FF5252' : '#2196F3'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart - Anomaly detector vibration (2 columns width) */}
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm space-y-4 lg:col-span-2">
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Edge AI Telemetry
            </span>
            <h3 className="text-sm font-extrabold text-foreground mt-0.5">
              Motor Vibration Accelerometer Streaming Anomaly (Hz)
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vibrationTelemetryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="sample" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="motorVibration" stroke="#2196F3" strokeWidth={2.5} name="Motor Hz" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="threshold" stroke="#FF5252" strokeWidth={1.5} strokeDasharray="5 5" name="Failure Limit" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Track distributions (1 column width) */}
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Hackathon Tracks
            </span>
            <h3 className="text-sm font-extrabold text-foreground mt-0.5">
              Team Distributions
            </h3>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trackDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {trackDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center font-mono">
              <span className="text-xl font-black text-foreground">{totalTeams}</span>
              <span className="text-[8px] text-muted-foreground uppercase font-semibold">Active Teams</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {trackDistribution.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}
                </div>
                <span className="font-mono text-foreground font-bold">{entry.value} teams</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
