'use client';

import { useState } from 'react';
import { usePlatformStore } from '@/store/usePlatformStore';
import { 
  Award, ShieldCheck, CheckCircle2, ChevronRight, 
  ExternalLink, FileText, Check, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function JudgePortal() {
  const { activeTab, allTeams, gradeTeamSubmission, challenges } = usePlatformStore();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Criteria scores states
  const [algoScore, setAlgoScore] = useState(70);
  const [uiScore, setUiScore] = useState(70);
  const [archScore, setArchScore] = useState(70);
  const [presScore, setPresScore] = useState(70);
  const [comment, setComment] = useState('');
  const [gradingSuccess, setGradingSuccess] = useState(false);

  const selectedTeam = allTeams.find(t => t.id === selectedTeamId);
  const activeSubmission = selectedTeam?.submissions.find(s => s.status === 'pending') || selectedTeam?.submissions[0];

  // Calculate dynamic weighted score based on sliders
  const calculateWeightedScore = () => {
    // Weights: Algo 40%, UI 30%, Arch 20%, Pres 10%
    return Math.round((algoScore * 0.4) + (uiScore * 0.3) + (archScore * 0.2) + (presScore * 0.1));
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || !activeSubmission) return;

    const scoresList = [
      { criteria: 'Algorithmic Optimization', score: algoScore },
      { criteria: 'Dashboard UI/UX Design', score: uiScore },
      { criteria: 'Technical Scalability', score: archScore },
      { criteria: 'Presentation Quality', score: presScore }
    ];

    gradeTeamSubmission(selectedTeamId, activeSubmission.id, 'Judge Marcus', scoresList, comment);
    setGradingSuccess(true);
    setComment('');
    setTimeout(() => {
      setGradingSuccess(false);
      setSelectedTeamId(null);
    }, 3000);
  };

  // Sort teams for leaderboard ranking calculation
  const rankedTeams = [...allTeams].sort((a, b) => {
    const aScore = a.submissions[0]?.score || 0;
    const bScore = b.submissions[0]?.score || 0;
    return bScore - aScore;
  });

  return (
    <div className="flex-1 w-full overflow-y-auto bg-background font-satoshi">
      {/* A. GRADING HUB */}
      {activeTab === 'judge' && (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">
              Evaluation
            </span>
            <h2 className="text-xl font-black text-foreground mt-0.5">
              Team Deliverables Grading
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
              Score student team code repositories and simulation demonstration logs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Submissions List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-foreground">Pending Submissions</h3>

                <div className="divide-y divide-border/25">
                  {allTeams.filter(t => t.submissions.length > 0).map((team) => {
                    const latestSub = team.submissions[team.submissions.length - 1];
                    const isGraded = latestSub.status === 'reviewed';

                    return (
                      <div 
                        key={team.id} 
                        onClick={() => setSelectedTeamId(team.id)}
                        className={`py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/10 px-2 rounded-xl transition-all ${
                          selectedTeamId === team.id ? 'bg-primary/5 border border-primary/25' : ''
                        }`}
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                            {team.name}
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/20 uppercase">
                              {team.track}
                            </span>
                          </h4>
                          <p className="text-[10px] text-muted-foreground leading-normal mt-0.5 line-clamp-1 font-sans">
                            {latestSub.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {isGraded ? (
                            <span className="text-[10px] font-bold text-success flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Graded: {latestSub.score}%
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-warning flex items-center gap-1 uppercase">
                              Pending Grade
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Grading Form Drawer */}
            <div className="space-y-4">
              {selectedTeam && activeSubmission ? (
                <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                  
                  <div>
                    <span className="text-[9px] font-black uppercase text-primary tracking-widest">
                      {selectedTeam.track}
                    </span>
                    <h3 className="text-base font-extrabold text-foreground mt-1 leading-snug">
                      Evaluate: {selectedTeam.name}
                    </h3>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/25 bg-muted/15 space-y-2">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Deliverables Links:</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">GitHub Repo:</span>
                        <a href={activeSubmission.githubUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                          Open Repo <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Demo URL:</span>
                        <a href={activeSubmission.demoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                          Live Demo <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {gradingSuccess ? (
                    <div className="p-4 rounded-xl border border-success/30 bg-success/5 text-success text-xs font-semibold flex flex-col items-center gap-2 text-center py-10">
                      <Check className="w-8 h-8 rounded-full border-2 border-success p-1 animate-ping" />
                      Grade successfully saved and updated in leaderboard!
                    </div>
                  ) : (
                    <form onSubmit={handleGradeSubmit} className="space-y-4">
                      {/* Sliders */}
                      <div className="space-y-3">
                        {/* Algo slider (40%) */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-muted-foreground">Algorithmic Optimization (40%)</span>
                            <span className="font-mono text-foreground font-bold">{algoScore}/100</span>
                          </div>
                          <input 
                            type="range" min={0} max={100} value={algoScore} 
                            onChange={e => setAlgoScore(Number(e.target.value))} 
                            className="w-full h-1 bg-muted rounded-full outline-none accent-primary" 
                          />
                        </div>

                        {/* UI slider (30%) */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-muted-foreground">Dashboard UI/UX Design (30%)</span>
                            <span className="font-mono text-foreground font-bold">{uiScore}/100</span>
                          </div>
                          <input 
                            type="range" min={0} max={100} value={uiScore} 
                            onChange={e => setUiScore(Number(e.target.value))} 
                            className="w-full h-1 bg-muted rounded-full outline-none accent-primary" 
                          />
                        </div>

                        {/* Arch slider (20%) */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-muted-foreground">Technical Scalability (20%)</span>
                            <span className="font-mono text-foreground font-bold">{archScore}/100</span>
                          </div>
                          <input 
                            type="range" min={0} max={100} value={archScore} 
                            onChange={e => setArchScore(Number(e.target.value))} 
                            className="w-full h-1 bg-muted rounded-full outline-none accent-primary" 
                          />
                        </div>

                        {/* Pres slider (10%) */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-muted-foreground">Presentation Quality (10%)</span>
                            <span className="font-mono text-foreground font-bold">{presScore}/100</span>
                          </div>
                          <input 
                            type="range" min={0} max={100} value={presScore} 
                            onChange={e => setPresScore(Number(e.target.value))} 
                            className="w-full h-1 bg-muted rounded-full outline-none accent-primary" 
                          />
                        </div>
                      </div>

                      {/* Weighted Total Display */}
                      <div className="p-3 rounded-lg border border-border/30 bg-muted/10 flex justify-between items-center text-xs font-bold">
                        <span className="text-muted-foreground uppercase">Weighted Total Score:</span>
                        <span className="text-base text-primary font-mono">{calculateWeightedScore()}%</span>
                      </div>

                      {/* Comments */}
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Assessor Feedback Comments</label>
                        <textarea 
                          value={comment} onChange={e => setComment(e.target.value)} rows={3}
                          placeholder="Provide constructive review comments for code quality and UI layout..."
                          className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50 resize-none" 
                        />
                      </div>

                      <button type="submit" className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md">
                        Record Evaluation
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-border/40 bg-card p-5 text-center text-xs text-muted-foreground py-10">
                  Select a team submission from the list to preview deliverables and score sliders.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* B. REAL-TIME SCOREBOARD LEADERBOARD */}
      {activeTab === 'analytics' && (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">
              Standings
            </span>
            <h2 className="text-xl font-black text-foreground mt-0.5">
              Live Event Scoreboard
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
              Standings fluctuate in real-time as judges submit evaluations.
            </p>
          </div>

          <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
              <Trophy className="w-4.5 h-4.5 text-primary" />
              Event Leaderboard Ranking
            </h3>

            <div className="divide-y divide-border/25">
              {rankedTeams.map((team, idx) => {
                const latestSub = team.submissions[team.submissions.length - 1];
                const score = latestSub?.score || 0;
                
                return (
                  <div key={team.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        idx === 0 
                          ? 'bg-warning text-black font-extrabold shadow shadow-warning/35' 
                          : idx === 1 
                          ? 'bg-[#AAB2C0] text-black' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                          {team.name}
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted/65 text-muted-foreground border border-border/20 uppercase">
                            {team.track}
                          </span>
                        </h4>
                        <div className="text-[10px] text-muted-foreground font-mono leading-none mt-1">Progress: {team.progress}%</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold text-foreground font-mono">
                        {score > 0 ? `${score}%` : '---'}
                      </div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
                        Average Grade
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
