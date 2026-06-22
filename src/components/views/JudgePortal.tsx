'use client';

import { useState, useMemo } from 'react';
import { usePlatformStore } from '@/store/usePlatformStore';
import { 
  Award, ShieldCheck, CheckCircle2, ChevronRight, 
  ExternalLink, FileText, Check, Trophy, Eye,
  LayoutDashboard, Settings, User, Percent, AlertTriangle,
  Building, Calendar, Mail, Sparkles, Star, ClipboardCheck,
  TrendingUp, Users, Clock, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, 
  Legend, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis, Cell 
} from 'recharts';
import { PresentationViewerModal } from '../shared/PresentationViewerModal';

export function JudgePortal() {
  const { activeTab, allTeams, gradeTeamSubmission, challenges, user, updateUserProfile, addToast, setTab } = usePlatformStore();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedAnalyticsTeamId, setSelectedAnalyticsTeamId] = useState<string | null>(null);
  const [isViewingDeck, setIsViewingDeck] = useState(false);

  // Criteria scores states
  const [algoScore, setAlgoScore] = useState(70);
  const [uiScore, setUiScore] = useState(70);
  const [archScore, setArchScore] = useState(70);
  const [presScore, setPresScore] = useState(70);
  const [comment, setComment] = useState('');
  const [gradingSuccess, setGradingSuccess] = useState(false);

  // Profile details states
  const [firstName, setFirstName] = useState(user.firstName || 'Marcus');
  const [lastName, setLastName] = useState(user.lastName || 'Vance');
  const [email, setEmail] = useState(user.email || 'marcus.vance@abb.com');
  const [organization, setOrganization] = useState(user.college || 'ABB Robotics');

  // Custom weights states (default to 40, 30, 20, 10)
  const [algoWeight, setAlgoWeight] = useState(40);
  const [uiWeight, setUiWeight] = useState(30);
  const [archWeight, setArchWeight] = useState(20);
  const [presWeight, setPresWeight] = useState(10);

  // Extra options
  const [anonymousComments, setAnonymousComments] = useState(false);
  const [sendEmailToStudents, setSendEmailToStudents] = useState(true);
  const [autoSaveDraft, setAutoSaveDraft] = useState(false);

  const selectedTeam = allTeams.find(t => t.id === selectedTeamId);
  const activeSubmission = selectedTeam?.submissions.find(s => s.status === 'pending') || selectedTeam?.submissions[0];

  // Calculate dynamic weighted score based on sliders and custom weights
  const calculateWeightedScore = () => {
    const totalWeight = algoWeight + uiWeight + archWeight + presWeight;
    if (totalWeight === 0) return 0;
    return Math.round(
      ((algoScore * algoWeight) + (uiScore * uiWeight) + (archScore * archWeight) + (presScore * presWeight)) / totalWeight
    );
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

    const finalScore = calculateWeightedScore();
    const judgeDisplayName = anonymousComments ? 'Anonymous Assessor' : `${firstName} ${lastName}`;

    gradeTeamSubmission(selectedTeamId, activeSubmission.id, judgeDisplayName, scoresList, comment, finalScore);
    addToast('Submission Graded', `Successfully evaluated team ${selectedTeam?.name} with a score of ${finalScore}%.`, 'success');
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
      {/* DASHBOARD VIEW (Assessor Hub) */}
      {activeTab === 'dashboard' && (() => {
        // Compute dashboard metrics
        const submittedTeams = allTeams.filter(t => t.submissions.length > 0);
        const totalSubmissions = submittedTeams.length;
        const gradedTeamsCount = submittedTeams.filter(t => t.submissions.some(s => s.status === 'reviewed')).length;
        const pendingTeamsCount = totalSubmissions - gradedTeamsCount;
        
        const averageGradedScore = (() => {
          const reviewedSubs = allTeams.flatMap(t => t.submissions).filter(s => s.status === 'reviewed');
          if (reviewedSubs.length === 0) return 0;
          return Math.round(reviewedSubs.reduce((sum, s) => sum + (s.score || 0), 0) / reviewedSubs.length);
        })();

        // Progress percentage
        const progressPercentage = totalSubmissions > 0 ? Math.round((gradedTeamsCount / totalSubmissions) * 100) : 0;

        return (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 text-left">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-card to-background p-6 rounded-2xl border border-border/20">
              <div>
                <span className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-primary" />
                  Assessor Command Room
                </span>
                <h2 className="text-2xl font-black text-foreground mt-1">
                  Welcome back, Assessor {firstName} {lastName}
                </h2>
                <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
                  Manage college student hackathon deliverables, coordinate rubrics, and view live leaderboard updates.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-muted/20 border border-border/15 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-muted-foreground">
                <Clock className="w-4 h-4 text-primary" />
                <span>Grading Closes: June 25, 23:59 IST</span>
              </div>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#111111] border border-border/15 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-1 bg-[#3b82f6]" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Submitted Teams</span>
                <span className="text-2xl font-black text-foreground mt-2 block font-mono">{totalSubmissions} / {allTeams.length}</span>
                <span className="text-[10px] text-muted-foreground/60 block mt-0.5">Projects delivered for evaluation</span>
              </div>

              <div className="bg-[#111111] border border-border/15 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-1 bg-success" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Evaluated Teams</span>
                <span className="text-2xl font-black text-success mt-2 block font-mono">{gradedTeamsCount} Graded</span>
                <span className="text-[10px] text-muted-foreground/60 block mt-0.5">{progressPercentage}% evaluation completeness</span>
              </div>

              <div className="bg-[#111111] border border-border/15 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-1 bg-warning animate-pulse" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Pending Grading</span>
                <span className="text-2xl font-black text-warning mt-2 block font-mono">{pendingTeamsCount} Pending</span>
                <span className="text-[10px] text-muted-foreground/60 block mt-0.5">Submissions awaiting score review</span>
              </div>

              <div className="bg-[#111111] border border-border/15 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-1 bg-primary" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Average Score</span>
                <span className="text-2xl font-black text-primary mt-2 block font-mono">{averageGradedScore}% Avg</span>
                <span className="text-[10px] text-muted-foreground/60 block mt-0.5">Across all graded submissions</span>
              </div>
            </div>

            {/* Main panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column: progress meter + active weights */}
              <div className="lg:col-span-1 space-y-6">
                {/* Circular / Line completeness card */}
                <div className="bg-card border border-border/40 p-5 rounded-2xl space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/5 pb-2">Grading Completion</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-semibold">Overall Progress</span>
                      <span className="font-bold font-mono text-primary">{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-[#151515] h-3 rounded-full overflow-hidden border border-border/10">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                    </div>
                    <div className="text-[10px] text-muted-foreground/75 leading-relaxed font-sans mt-2">
                      Ensure all submissions are evaluated prior to the final Demo Day session on June 26, 2026.
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setTab('judge')}
                      className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      Launch Grading Board
                    </button>
                  </div>
                </div>

                {/* Score Rubric Weights display */}
                <div className="bg-card border border-border/40 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-border/5 pb-2">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Evaluation Weights</h3>
                    <button onClick={() => setTab('profile')} className="text-[10px] font-black text-primary hover:underline uppercase">Modify</button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span className="text-muted-foreground">Algorithmic Optimization</span>
                        <span className="font-mono text-foreground font-bold">{algoWeight}%</span>
                      </div>
                      <div className="w-full bg-[#151515] h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${algoWeight}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span className="text-muted-foreground">Dashboard UI/UX Design</span>
                        <span className="font-mono text-foreground font-bold">{uiWeight}%</span>
                      </div>
                      <div className="w-full bg-[#151515] h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${uiWeight}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span className="text-muted-foreground">Technical Scalability</span>
                        <span className="font-mono text-foreground font-bold">{archWeight}%</span>
                      </div>
                      <div className="w-full bg-[#151515] h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${archWeight}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span className="text-muted-foreground">Presentation Quality</span>
                        <span className="font-mono text-foreground font-bold">{presWeight}%</span>
                      </div>
                      <div className="w-full bg-[#151515] h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${presWeight}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column: Recent submissions activity feed */}
              <div className="lg:col-span-2 bg-card border border-border/40 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/5 pb-2">Submissions Activity Feed</h3>
                
                <div className="divide-y divide-border/15 max-h-[380px] overflow-y-auto pr-1">
                  {submittedTeams.map((team) => {
                    const latestSub = team.submissions[team.submissions.length - 1];
                    const isReviewed = latestSub.status === 'reviewed';

                    return (
                      <div key={team.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                            {team.name}
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border uppercase">
                              {team.track}
                            </span>
                          </h4>
                          <span className="text-[10px] text-muted-foreground block mt-1">College: {team.college}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          {isReviewed ? (
                            <span className="text-[10px] font-bold text-success flex items-center gap-1 bg-success/5 border border-success/15 px-2 py-1 rounded-lg">
                              Score: {latestSub.score}%
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-warning flex items-center gap-1 bg-warning/5 border border-warning/15 px-2 py-1 rounded-lg animate-pulse uppercase">
                              Pending
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setSelectedTeamId(team.id);
                              setTab('judge');
                            }}
                            className="px-2.5 py-1 rounded-lg border border-border/20 text-[10px] font-black uppercase text-foreground hover:bg-muted/15 transition-all cursor-pointer"
                          >
                            {isReviewed ? 'Review' : 'Grade'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {submittedTeams.length === 0 && (
                    <div className="text-center py-12 text-xs text-muted-foreground/60 font-sans">
                      No deliverables submitted yet by student teams. Check back later.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
                      {activeSubmission.presentationFile && (
                        <div className="flex items-center justify-between border-t border-border/5 pt-1.5 mt-1.5">
                          <span className="text-muted-foreground">Presentation:</span>
                          <button
                            type="button"
                            onClick={() => setIsViewingDeck(true)}
                            className="text-primary hover:underline flex items-center gap-1 font-bold text-xs"
                          >
                            View Deck <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
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
      {activeTab === 'analytics' && (() => {
        const selectedTeamAnalytics = allTeams.find(t => t.id === selectedAnalyticsTeamId) || rankedTeams.find(t => t.submissions.length > 0);
        const activeSubForAnalytics = selectedTeamAnalytics?.submissions[0];

        const radarData = (() => {
          if (!activeSubForAnalytics || !activeSubForAnalytics.feedback || activeSubForAnalytics.feedback.length === 0) {
            // Check if there are default scores
            const defaultScore = activeSubForAnalytics?.score || 70;
            return [
              { criteria: 'Algorithm (40%)', score: defaultScore },
              { criteria: 'UI/UX (30%)', score: defaultScore },
              { criteria: 'Architecture (20%)', score: defaultScore },
              { criteria: 'Presentation (10%)', score: defaultScore }
            ];
          }
          const algoScores = activeSubForAnalytics.feedback.flatMap(f => f.scores.filter(s => s.criteria.toLowerCase().includes('algorithm') || s.criteria.toLowerCase().includes('algorithmic')).map(s => s.score));
          const uiScores = activeSubForAnalytics.feedback.flatMap(f => f.scores.filter(s => s.criteria.toLowerCase().includes('ui') || s.criteria.toLowerCase().includes('design') || s.criteria.toLowerCase().includes('ux')).map(s => s.score));
          const archScores = activeSubForAnalytics.feedback.flatMap(f => f.scores.filter(s => s.criteria.toLowerCase().includes('scalability') || s.criteria.toLowerCase().includes('architecture')).map(s => s.score));
          const presScores = activeSubForAnalytics.feedback.flatMap(f => f.scores.filter(s => s.criteria.toLowerCase().includes('presentation')).map(s => s.score));

          const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 70;

          return [
            { criteria: 'Algorithm (40%)', score: avg(algoScores) },
            { criteria: 'UI/UX (30%)', score: avg(uiScores) },
            { criteria: 'Architecture (20%)', score: avg(archScores) },
            { criteria: 'Presentation (10%)', score: avg(presScores) }
          ];
        })();

        const scoreDistributionData = (() => {
          const buckets = [
            { name: '0-40', count: 0, fill: '#ff000f' },
            { name: '41-60', count: 0, fill: '#f59e0b' },
            { name: '61-80', count: 0, fill: '#3b82f6' },
            { name: '81-100', count: 0, fill: '#10b981' }
          ];
          allTeams.flatMap(t => t.submissions).forEach(sub => {
            const score = sub.score;
            if (score === undefined) return;
            if (score <= 40) buckets[0].count++;
            else if (score <= 60) buckets[1].count++;
            else if (score <= 80) buckets[2].count++;
            else buckets[3].count++;
          });
          return buckets;
        })();

        return (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 text-left">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Leaderboard list */}
              <div className="lg:col-span-1 bg-card border border-border/40 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border/5 pb-2">
                  <Trophy className="w-4.5 h-4.5 text-primary" />
                  Ranking Standings
                </h3>

                <div className="divide-y divide-border/25">
                  {rankedTeams.map((team, idx) => {
                    const latestSub = team.submissions[team.submissions.length - 1];
                    const score = latestSub?.score || 0;
                    const isSelected = selectedTeamAnalytics?.id === team.id;
                    
                    return (
                      <div 
                        key={team.id} 
                        onClick={() => setSelectedAnalyticsTeamId(team.id)}
                        className={`py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all ${
                          isSelected ? 'bg-primary/5 border border-primary/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            idx === 0 
                              ? 'bg-warning text-black font-extrabold shadow shadow-warning/35' 
                              : idx === 1 
                              ? 'bg-[#AAB2C0] text-black' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-foreground truncate max-w-[110px]">
                              {team.name}
                            </h4>
                            <span className="text-[8.5px] font-bold text-muted-foreground block mt-0.5 uppercase tracking-wider">{team.track}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-extrabold text-foreground font-mono">
                            {score > 0 ? `${score}%` : '---'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Radar Criteria Analysis + Histogram */}
              <div className="lg:col-span-2 space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Radar Chart */}
                  <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase">Criteria Evaluation Radar</h4>
                      <span className="text-[10px] text-primary/80 font-bold block mt-0.5">{selectedTeamAnalytics?.name || 'No Selected Team'}</span>
                    </div>

                    <div className="h-[200px] w-full mt-4">
                      {selectedTeamAnalytics && activeSubForAnalytics ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#333" />
                            <PolarAngleAxis dataKey="criteria" stroke="#666" fontSize={8} />
                            <Radar name="Criteria Score" dataKey="score" stroke="#ff000f" fill="#ff000f" fillOpacity={0.25} />
                            <Tooltip content={({ active, payload }: any) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-[#181818] border border-border/25 p-2 rounded text-[10px] font-bold text-foreground">
                                    {payload[0].name}: {payload[0].value}/100
                                  </div>
                                );
                              }
                              return null;
                            }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-muted-foreground/55">No submitted project deliverables for this team.</div>
                      )}
                    </div>
                  </div>

                  {/* Score Distribution Histogram */}
                  <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase">Graded Scores Histogram</h4>
                      <span className="text-[10px] text-muted-foreground/60 font-semibold block mt-0.5">Bucket counts of graded deliverables</span>
                    </div>

                    <div className="h-[200px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scoreDistributionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                          <XAxis dataKey="name" stroke="#666" fontSize={9} />
                          <YAxis stroke="#666" fontSize={10} />
                          <Tooltip content={({ active, payload }: any) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-[#181818] border border-border/25 p-2 rounded text-[10px] font-bold text-foreground">
                                  Count: {payload[0].value}
                                </div>
                              );
                            }
                            return null;
                          }} />
                          <Bar dataKey="count" name="Submissions" radius={[3, 3, 0, 0]}>
                            {scoreDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Per-Judge Reviews table */}
                <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase">Evaluator Comments & Audit Trail</h4>
                  
                  <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar text-xs">
                    {activeSubForAnalytics && activeSubForAnalytics.feedback && activeSubForAnalytics.feedback.length > 0 ? (
                      activeSubForAnalytics.feedback.map((feed, idx) => (
                        <div key={idx} className="bg-[#151515] border border-border/5 p-3 rounded-xl">
                          <div className="flex justify-between font-bold text-foreground border-b border-white/5 pb-1.5 mb-1.5">
                            <span>Evaluated by: {feed.judgeName}</span>
                            <span className="text-primary">
                              Score: {Math.round(feed.scores.reduce((sum, item) => sum + item.score, 0) / feed.scores.length)}%
                            </span>
                          </div>
                          <p className="text-muted-foreground font-medium italic mt-1 leading-normal">
                            "{feed.comment}"
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground/45">No evaluation logs found for selected team's active submission.</div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {/* ASSESSOR SETTINGS & PROFILE CONFIG */}
      {activeTab === 'profile' && (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 text-left">
          <div>
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">
              Configuration
            </span>
            <h2 className="text-xl font-black text-foreground mt-0.5">
              Assessor Settings & Preferences
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
              Personalize grading identity details, evaluate custom criteria weights, and adjust notifications.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Personal details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile card */}
              <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm">
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Assessor Personal Details
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">First Name *</label>
                    <input 
                      value={firstName} 
                      onChange={e => setFirstName(e.target.value)} 
                      className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Last Name *</label>
                    <input 
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)} 
                      className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Email Address *</label>
                    <input 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Assessor Affiliation / College *</label>
                    <input 
                      value={organization} 
                      onChange={e => setOrganization(e.target.value)} 
                      className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" 
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (!firstName || !lastName || !email || !organization) {
                        addToast('Required Fields Missing', 'Please fill out all mandatory assessor profile fields.', 'error');
                        return;
                      }
                      updateUserProfile({ firstName, lastName, fullName: `${firstName} ${lastName}`, email, college: organization });
                      addToast('Assessor Profile Updated', 'Successfully saved personal details to workspace configuration.', 'success');
                    }}
                    className="py-2.5 px-6 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md shadow-primary/10"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </div>

              {/* Advanced Preferences Card */}
              <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm">
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  Assessor Evaluation Preferences
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-foreground">Anonymous Comments Mode</div>
                      <div className="text-[10px] text-muted-foreground leading-normal">Hide your assessor display name in evaluation feedback logs visible to students.</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={anonymousComments}
                      onChange={e => setAnonymousComments(e.target.checked)}
                      className="accent-primary w-4.5 h-4.5"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-border/10 pt-4">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-foreground">Send Score Notifications</div>
                      <div className="text-[10px] text-muted-foreground leading-normal">Automatically alert student teams via in-app notification when grades are locked.</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={sendEmailToStudents}
                      onChange={e => setSendEmailToStudents(e.target.checked)}
                      className="accent-primary w-4.5 h-4.5"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-border/10 pt-4">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-foreground">Enable Autosave Drafts</div>
                      <div className="text-[10px] text-muted-foreground leading-normal">Temporarily store sliders positions on your browser as local drafts while grading.</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={autoSaveDraft}
                      onChange={e => setAutoSaveDraft(e.target.checked)}
                      className="accent-primary w-4.5 h-4.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Scoring weights configuration */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                
                <div>
                  <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                    <Percent className="w-4 h-4 text-primary" />
                    Grading Rubric Weights
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                    Set relative weight percentages for each evaluation criteria. The sum total must equal 100%.
                  </p>
                </div>

                {/* Validation alert */}
                {algoWeight + uiWeight + archWeight + presWeight !== 100 ? (
                  <div className="p-3 rounded-xl border border-danger/30 bg-danger/5 text-danger text-[10px] font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Warning: Total sum is {algoWeight + uiWeight + archWeight + presWeight}%. Must sum up exactly to 100% to activate.</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-success/30 bg-success/5 text-success text-[10px] font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Success: Rubric weights are perfectly balanced at 100%.</span>
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  {/* Algo slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-muted-foreground">Algorithmic Optimization</span>
                      <span className="font-mono text-foreground font-bold">{algoWeight}%</span>
                    </div>
                    <input 
                      type="range" min={0} max={100} value={algoWeight} 
                      onChange={e => setAlgoWeight(Number(e.target.value))} 
                      className="w-full h-1 bg-muted rounded-full outline-none accent-primary" 
                    />
                  </div>

                  {/* UI slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-muted-foreground">Dashboard UI/UX Design</span>
                      <span className="font-mono text-foreground font-bold">{uiWeight}%</span>
                    </div>
                    <input 
                      type="range" min={0} max={100} value={uiWeight} 
                      onChange={e => setUiWeight(Number(e.target.value))} 
                      className="w-full h-1 bg-muted rounded-full outline-none accent-primary" 
                    />
                  </div>

                  {/* Arch slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-muted-foreground">Technical Scalability</span>
                      <span className="font-mono text-foreground font-bold">{archWeight}%</span>
                    </div>
                    <input 
                      type="range" min={0} max={100} value={archWeight} 
                      onChange={e => setArchWeight(Number(e.target.value))} 
                      className="w-full h-1 bg-muted rounded-full outline-none accent-primary" 
                    />
                  </div>

                  {/* Pres slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-muted-foreground">Presentation Quality</span>
                      <span className="font-mono text-foreground font-bold">{presWeight}%</span>
                    </div>
                    <input 
                      type="range" min={0} max={100} value={presWeight} 
                      onChange={e => setPresWeight(Number(e.target.value))} 
                      className="w-full h-1 bg-muted rounded-full outline-none accent-primary" 
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border/10 mt-4 flex items-center justify-between text-xs font-bold bg-[#151515] p-3 rounded-xl border">
                  <span className="text-muted-foreground uppercase text-[10px]">Sum Total Weight:</span>
                  <span className={`font-mono text-sm ${algoWeight + uiWeight + archWeight + presWeight === 100 ? 'text-success' : 'text-danger animate-pulse'}`}>{algoWeight + uiWeight + archWeight + presWeight}%</span>
                </div>

                <button
                  disabled={algoWeight + uiWeight + archWeight + presWeight !== 100}
                  onClick={() => {
                    addToast('Weights Configured', 'Grading rubric weighting parameters have been dynamically re-configured.', 'success');
                  }}
                  className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-md"
                >
                  Save Rubric Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render the presentation viewer modal when triggered */}
      {isViewingDeck && selectedTeam && activeSubmission && (
        <PresentationViewerModal
          submission={activeSubmission}
          team={selectedTeam}
          role="judge"
          onClose={() => setIsViewingDeck(false)}
        />
      )}
    </div>
  );
}
