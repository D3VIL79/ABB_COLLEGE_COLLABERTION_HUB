'use client';

import { useState, useEffect } from 'react';
import { usePlatformStore, Submission, Team } from '@/store/usePlatformStore';
import { 
  X, ChevronLeft, ChevronRight, ExternalLink, 
  FileText, CheckCircle2, AlertTriangle, MessageSquare, List 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface PresentationViewerModalProps {
  submission: Submission | null;
  team: Team | null;
  onClose: () => void;
  role?: string;
}

export function PresentationViewerModal({ submission, team, onClose, role }: PresentationViewerModalProps) {
  const { updateSubmissionFacultyNote, addToast } = usePlatformStore();
  const [activeTab, setActiveTab] = useState<'slides' | 'details' | 'feedback'>('slides');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [note, setNote] = useState(submission?.facultyNote || '');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Sync note state when submission changes
  useEffect(() => {
    if (submission) {
      setNote(submission.facultyNote || '');
    }
  }, [submission]);

  if (!submission || !team) return null;

  // 5 auto-generated slides
  const slides = [
    {
      title: team.name,
      subtitle: `Track: ${team.track} | College: ${team.college}`,
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="text-primary font-bold text-2xl">ABB</span>
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">{team.name}</h2>
            <p className="text-muted-foreground mt-2 text-lg font-medium">{team.college}</p>
          </div>
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-semibold tracking-wide uppercase">
            {team.track}
          </div>
          <div className="text-xs text-muted-foreground/60 font-medium">
            Submitted on {new Date(submission.submittedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </div>
        </div>
      )
    },
    {
      title: 'Problem Statement',
      subtitle: 'Background & Challenges Faced',
      content: (
        <div className="flex flex-col justify-center h-full p-6 sm:p-8 space-y-4">
          <div className="border-l-4 border-primary pl-4 py-1.5 bg-primary/5 rounded-r">
            <h4 className="text-sm font-bold text-primary uppercase tracking-wider">The Scenario</h4>
            <p className="text-base text-foreground/90 font-medium mt-1 leading-relaxed">
              Industrial settings generate immense data loads. Scaling systems efficiently while maintaining safety standards remains a crucial challenge.
            </p>
          </div>
          <div className="space-y-3 mt-2">
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Key Objectives Addressed:</h4>
            <ul className="list-none space-y-2">
              <li className="flex items-start gap-2.5 text-sm text-foreground/80 leading-relaxed font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                Designing reliable interfaces that minimize manual overhead.
              </li>
              <li className="flex items-start gap-2.5 text-sm text-foreground/80 leading-relaxed font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                Aggregating disparate inputs into a single, cohesive user view.
              </li>
              <li className="flex items-start gap-2.5 text-sm text-foreground/80 leading-relaxed font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                Optimizing performance thresholds under peak operational stresses.
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: 'Proposed Solution',
      subtitle: 'Technical Innovation Overview',
      content: (
        <div className="flex flex-col justify-center h-full p-6 sm:p-8 space-y-4">
          <p className="text-base text-foreground/90 leading-relaxed font-medium">
            {submission.description || "A comprehensive response to the design challenge, prioritizing stability, intuitive design paradigms, and optimal data visualization."}
          </p>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-[#181818]/60 border border-border/10 p-4 rounded-xl shadow-sm">
              <span className="text-xs font-bold text-muted-foreground uppercase">Collaboration Index</span>
              <div className="text-2xl font-bold text-primary mt-1">{team.collaborationScore}%</div>
            </div>
            <div className="bg-[#181818]/60 border border-border/10 p-4 rounded-xl shadow-sm">
              <span className="text-xs font-bold text-muted-foreground uppercase">Current Progress</span>
              <div className="text-2xl font-bold text-emerald-500 mt-1">{team.progress}%</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Technical Implementation',
      subtitle: 'Architecture & Repositories',
      content: (
        <div className="flex flex-col justify-center h-full p-6 sm:p-8 space-y-5">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Access Channels</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {submission.githubUrl ? (
                <a 
                  href={submission.githubUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3.5 bg-[#181818] border border-border/20 rounded-xl hover:border-primary/50 transition-colors"
                >
                  <Github className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-muted-foreground">Source Code</div>
                    <div className="text-sm font-bold text-foreground truncate max-w-[150px]">Open GitHub</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground/60 ml-auto flex-shrink-0" />
                </a>
              ) : (
                <div className="flex items-center gap-3 p-3.5 bg-[#181818]/40 border border-dashed border-border/10 rounded-xl opacity-60">
                  <Github className="w-5 h-5 text-muted-foreground/40" />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-muted-foreground/40">Source Code</div>
                    <div className="text-sm font-bold text-muted-foreground/40">Not Provided</div>
                  </div>
                </div>
              )}

              {submission.demoUrl ? (
                <a 
                  href={submission.demoUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3.5 bg-[#181818] border border-border/20 rounded-xl hover:border-primary/50 transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-muted-foreground">Interactive Demo</div>
                    <div className="text-sm font-bold text-foreground truncate max-w-[150px]">Launch App</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground/60 ml-auto flex-shrink-0" />
                </a>
              ) : (
                <div className="flex items-center gap-3 p-3.5 bg-[#181818]/40 border border-dashed border-border/10 rounded-xl opacity-60">
                  <ExternalLink className="w-5 h-5 text-muted-foreground/40" />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-muted-foreground/40">Interactive Demo</div>
                    <div className="text-sm font-bold text-muted-foreground/40">Not Provided</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-[#181818]/60 border border-border/10 p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
            <FileText className="w-6 h-6 text-primary flex-shrink-0" />
            <div className="text-left min-w-0">
              <span className="text-xs font-bold text-muted-foreground uppercase">Presentation Deck File</span>
              <div className="text-sm font-bold text-foreground truncate mt-0.5">{submission.presentationFile}</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Evaluation Metrics',
      subtitle: 'Judge Assessment Summary',
      content: (
        <div className="flex flex-col justify-center h-full p-6 sm:p-8 space-y-4">
          {submission.feedback && submission.feedback.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-primary/5 border border-primary/10 px-4 py-3 rounded-xl">
                <span className="text-sm font-bold text-muted-foreground">Current Cumulative Score</span>
                <span className="text-2xl font-extrabold text-primary">{submission.score ?? 'N/A'}/100</span>
              </div>
              <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {submission.feedback.map((f, i) => (
                  <div key={i} className="bg-[#181818]/60 p-3 rounded-xl border border-border/10 text-left">
                    <div className="flex justify-between text-xs font-bold text-muted-foreground">
                      <span>Evaluator: {f.judgeName}</span>
                      <span className="text-primary">
                        Score: {Math.round(f.scores.reduce((acc, curr) => acc + curr.score, 0) / f.scores.length)}/100
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 mt-1.5 italic font-medium leading-relaxed">
                      "{f.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
              <FileText className="w-10 h-10 text-muted-foreground/30" />
              <div className="text-sm font-bold text-muted-foreground">Pending Judge Evaluation</div>
              <p className="text-xs text-muted-foreground/60 max-w-[280px]">
                Submission is queued. Results and criteria evaluations will populate once the judging panel completes its audit.
              </p>
            </div>
          )}
        </div>
      )
    }
  ];

  // Key handlers for slide navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'slides') return;
      if (e.key === 'ArrowRight') {
        setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const handleAction = (status: 'endorsed' | 'flagged') => {
    setIsSubmittingNote(true);
    updateSubmissionFacultyNote(submission.id, note, status);
    addToast(
      status === 'endorsed' ? 'Submission Endorsed' : 'Submission Flagged',
      `You successfully ${status} the submission for ${team.name}.`,
      status === 'endorsed' ? 'success' : 'error'
    );
    setIsSubmittingNote(false);
  };

  const isFaculty = role === 'admin' || role === 'staff';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111111] border border-border/20 rounded-[21px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border/10 bg-[#161616]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{team.name} Submission</h3>
              <span className="text-xs px-2 py-0.5 bg-[#252525] border border-border/20 text-muted-foreground rounded-md uppercase font-semibold">
                {team.track}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{team.college}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-border/10"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border/10 bg-[#141414] px-6">
          <button 
            onClick={() => setActiveTab('slides')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold transition-all ${
              activeTab === 'slides' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-4 h-4" />
            Presentation Deck
          </button>
          <button 
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold transition-all ${
              activeTab === 'details' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-4 h-4" />
            Detailed Specs
          </button>
          <button 
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold transition-all ${
              activeTab === 'feedback' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Judge Reviews
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0a] min-h-[380px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {activeTab === 'slides' && (
              <motion.div 
                key="slides-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col justify-between min-h-[340px]"
              >
                {/* Slide Card Canvas */}
                <div className="bg-[#121212] border border-border/15 rounded-[16px] min-h-[260px] flex flex-col justify-between relative shadow-inner overflow-hidden">
                  
                  {/* Slide header banner */}
                  <div className="flex justify-between items-center px-5 py-2.5 bg-[#171717]/60 border-b border-border/10">
                    <span className="text-xs font-bold text-primary/80 tracking-wide uppercase">
                      {slides[currentSlide].title}
                    </span>
                    <span className="text-xs text-muted-foreground/60 font-semibold">
                      Slide {currentSlide + 1} of {slides.length}
                    </span>
                  </div>

                  {/* Slide content container */}
                  <div className="flex-1 flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                      >
                        {slides[currentSlide].content}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Slide footer banner */}
                  <div className="px-5 py-2 bg-[#171717]/30 border-t border-border/5 text-center text-[10px] text-muted-foreground/45 font-medium">
                    {slides[currentSlide].subtitle}
                  </div>
                </div>

                {/* Slider Controls */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    disabled={currentSlide === 0}
                    onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/20 text-xs font-semibold text-muted-foreground disabled:opacity-40 disabled:pointer-events-none hover:text-foreground hover:bg-white/5 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>

                  <div className="flex gap-2">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                          currentSlide === i ? 'bg-primary scale-110' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    disabled={currentSlide === slides.length - 1}
                    onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/20 text-xs font-semibold text-muted-foreground disabled:opacity-40 disabled:pointer-events-none hover:text-foreground hover:bg-white/5 transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'details' && (
              <motion.div 
                key="details-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5 text-left"
              >
                <div className="bg-[#121212] border border-border/10 p-5 rounded-xl space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Project Summary</h4>
                    <p className="text-sm text-foreground/90 font-medium leading-relaxed mt-1.5">
                      {submission.description || "No description provided."}
                    </p>
                  </div>

                  <div className="border-t border-border/5 pt-4 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-bold text-muted-foreground uppercase">Submitted By</span>
                      <p className="text-sm font-bold text-foreground mt-0.5">{team.name}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-muted-foreground uppercase">College Center</span>
                      <p className="text-sm font-bold text-foreground mt-0.5">{team.college}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#121212] border border-border/10 p-4 rounded-xl">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Submissions Filename</span>
                    <div className="text-sm font-bold text-foreground truncate mt-1 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                      {submission.presentationFile}
                    </div>
                  </div>
                  <div className="bg-[#121212] border border-border/10 p-4 rounded-xl">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Source Repository</span>
                    {submission.githubUrl ? (
                      <a 
                        href={submission.githubUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-sm font-bold text-primary hover:underline mt-1 flex items-center gap-1.5"
                      >
                        <Github className="w-4 h-4 flex-shrink-0" />
                        Open Github
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <div className="text-sm font-bold text-muted-foreground/50 mt-1">Not Provided</div>
                    )}
                  </div>
                  <div className="bg-[#121212] border border-border/10 p-4 rounded-xl">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Staged Application</span>
                    {submission.demoUrl ? (
                      <a 
                        href={submission.demoUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-sm font-bold text-primary hover:underline mt-1 flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        Launch demo
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <div className="text-sm font-bold text-muted-foreground/50 mt-1">Not Provided</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'feedback' && (
              <motion.div 
                key="feedback-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left"
              >
                <div className="bg-[#121212] border border-border/10 px-4 py-3 rounded-xl flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Submissions Score</span>
                  <span className="text-lg font-extrabold text-primary">{submission.score ?? 'Unscored'} / 100</span>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {submission.feedback && submission.feedback.length > 0 ? (
                    submission.feedback.map((feed, index) => (
                      <div key={index} className="bg-[#121212] border border-border/10 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center border-b border-border/5 pb-2">
                          <span className="text-sm font-bold text-foreground">{feed.judgeName}</span>
                          <span className="text-xs font-bold text-muted-foreground">
                            Evaluated
                          </span>
                        </div>

                        {/* Scores grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          {feed.scores.map((score, sIdx) => (
                            <div key={sIdx} className="bg-[#191919] p-2 rounded-lg border border-border/5">
                              <div className="text-[10px] text-muted-foreground truncate">{score.criteria}</div>
                              <div className="text-sm font-bold text-primary mt-0.5">{score.score}/100</div>
                            </div>
                          ))}
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Review Comment</span>
                          <p className="text-sm text-foreground/80 mt-1 font-medium leading-relaxed italic">
                            "{feed.comment}"
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-[#121212] border border-dashed border-border/10 p-8 rounded-xl text-center flex flex-col items-center justify-center space-y-2">
                      <MessageSquare className="w-8 h-8 text-muted-foreground/30" />
                      <div className="text-sm font-bold text-muted-foreground">No Feedback entries yet</div>
                      <p className="text-xs text-muted-foreground/60 max-w-xs">
                        This submission has not yet received grading feedback. Results will display here as evaluations are saved.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Faculty Review Controls */}
          {isFaculty && (
            <div className="border-t border-border/10 pt-4 mt-6 text-left space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Faculty Review Notes
                </label>
                {submission.facultyStatus && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    submission.facultyStatus === 'endorsed' 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}>
                    {submission.facultyStatus === 'endorsed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    {submission.facultyStatus}
                  </span>
                )}
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter internal review notes, issues found, or reason for endorsement..."
                className="w-full bg-[#121212] border border-border/20 focus:border-primary/50 outline-none rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/45 resize-none h-20 transition-colors"
              />
              <div className="flex justify-end gap-3">
                <button
                  disabled={isSubmittingNote}
                  onClick={() => handleAction('flagged')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 hover:text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Flag for Review
                </button>
                <button
                  disabled={isSubmittingNote}
                  onClick={() => handleAction('endorsed')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 hover:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Endorse Submission
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
