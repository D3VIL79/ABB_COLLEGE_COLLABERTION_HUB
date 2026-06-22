'use client';

import { useState, useMemo, Fragment } from 'react';
import { usePlatformStore, Team, Submission, TeamMember, Challenge, MentorRequest, NotificationItem } from '@/store/usePlatformStore';
import { calculatePrecisionVelocity, getVelocityLabelFromVal } from '../../utils/mathEngines';
import { 
  Users, FolderGit, CheckSquare, Calendar, AlertCircle, BarChart3, 
  HelpCircle, Settings, ChevronDown, ChevronUp, Search, Filter, 
  Download, Eye, Check, AlertTriangle, Send, FileText, ExternalLink, 
  Plus, Edit, Trash2, ShieldCheck, RefreshCw, X, Play
} from 'lucide-react';
import { PresentationViewerModal } from '../shared/PresentationViewerModal';

export function FacultyPortal() {
  const { 
    allTeams, challenges, mentors, mentorRequests, notifications, 
    updateTeamProgress, updateSubmissionFacultyNote, assignMentor, 
    resolveMentorRequest, addToast, addChallenge, deleteChallenge,
    activeTab
  } = usePlatformStore();

  // Presentation Viewer Modal State
  const [activeSubTeam, setActiveSubTeam] = useState<{ submission: Submission; team: Team } | null>(null);

  // Common filters state (used on various tabs)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('All');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [progressRange, setProgressRange] = useState(100);

  // Expanded team rows (Tab 2)
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  // Selected teams for bulk actions
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  // Broadcast popup state
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Selected submissions for bulk actions
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);

  // Selected requests for bulk actions
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [bulkMentorName, setBulkMentorName] = useState('');

  // Challenge CRUD edit state
  const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newTrack, setNewTrack] = useState('Energy Systems');
  const [newDifficulty, setNewDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Advanced');
  const [newTags, setNewTags] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBackground, setNewBackground] = useState('');
  const [newObjectives, setNewObjectives] = useState('');
  const [newRequirements, setNewRequirements] = useState('');
  const [newDeliverables, setNewDeliverables] = useState('');
  const [newMaxCapacity, setNewMaxCapacity] = useState(30);
  const [newStatus, setNewStatus] = useState<'active' | 'paused' | 'closed'>('active');

  const [selectedChallengeIdDetails, setSelectedChallengeIdDetails] = useState<string | null>(null);

  // Velocity helper using the precision OLS slope engine
  const getVelocityValue = (team: Team) => {
    return calculatePrecisionVelocity(team.progressHistory || []);
  };

  const getVelocityLabel = (team: Team) => {
    return getVelocityLabelFromVal(getVelocityValue(team));
  };

  const isTeamStuck = (team: Team) => {
    const requests = mentorRequests.filter(r => r.teamId === team.id && r.status !== 'resolved');
    const velocity = getVelocityValue(team);
    return team.progress < 40 && (requests.length >= 2 || velocity < 5);
  };

  // Get unique colleges
  const collegesList = useMemo(() => {
    const colleges = new Set<string>();
    allTeams.forEach(t => {
      if (t.college) colleges.add(t.college);
    });
    return Array.from(colleges);
  }, [allTeams]);

  // CSV helper
  const downloadCSV = (headers: string[], rows: any[][], filename: string) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.click();
    addToast('CSV Exported', `Downloaded ${filename} successfully.`, 'success');
  };

  // ----------------------------------------
  // TAB 1: DASHBOARD HANDLERS & CALCULATIONS
  // ----------------------------------------
  const dashboardKpis = useMemo(() => {
    const totalStudents = allTeams.reduce((sum, t) => sum + t.members.length, 0);
    const totalTeams = allTeams.length;
    const submissions = allTeams.filter(t => t.submissions.length > 0).length;
    const submissionRate = totalTeams > 0 ? Math.round((submissions / totalTeams) * 100) : 0;
    const mentorSessions = mentorRequests.filter(r => r.status === 'resolved').length;
    
    const progressSum = allTeams.reduce((sum, t) => sum + t.progress, 0);
    const avgProgress = totalTeams > 0 ? Math.round(progressSum / totalTeams) : 0;
    
    const stuckTeams = allTeams.filter(isTeamStuck).length;

    return { totalStudents, totalTeams, submissions, submissionRate, mentorSessions, avgProgress, stuckTeams };
  }, [allTeams, mentorRequests]);

  const recentNotifications = useMemo(() => {
    return notifications.slice(0, 10);
  }, [notifications]);

  // ----------------------------------------
  // TAB 2: TEAMS FILTERING & BULK ACTIONS
  // ----------------------------------------
  const filteredTeams = useMemo(() => {
    return allTeams.filter(t => {
      const matchSearch = searchQuery === '' || 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.members.some(m => m.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchTrack = selectedTrack === 'All' || t.track === selectedTrack;
      const matchCollege = selectedCollege === 'All' || t.college === selectedCollege;
      const matchProgress = t.progress <= progressRange;
      
      let matchStatus = true;
      if (selectedStatus === 'Has Submission') matchStatus = t.submissions.length > 0;
      else if (selectedStatus === 'No Submission') matchStatus = t.submissions.length === 0;
      else if (selectedStatus === 'Stuck') matchStatus = isTeamStuck(t);

      return matchSearch && matchTrack && matchCollege && matchProgress && matchStatus;
    });
  }, [allTeams, searchQuery, selectedTrack, selectedCollege, progressRange, selectedStatus]);

  const handleBulkApproveTeams = () => {
    selectedTeamIds.forEach(id => {
      // Set team progress to 100 or mark it as endorsed. Here we'll endorse the team's submissions.
      const team = allTeams.find(t => t.id === id);
      if (team && team.submissions.length > 0) {
        updateSubmissionFacultyNote(team.submissions[0].id, 'Roster and project review approved via bulk faculty endorsement.', 'endorsed');
      }
    });
    addToast('Bulk Endorsed', `Approved submissions for ${selectedTeamIds.length} teams.`, 'success');
    setSelectedTeamIds([]);
  };

  const handleBulkBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    addToast('Broadcast Dispatched', `Broadcast notification delivered to ${selectedTeamIds.length} teams.`, 'success');
    setShowBroadcastModal(false);
    setBroadcastMessage('');
    setSelectedTeamIds([]);
  };

  const handleBulkExportTeams = () => {
    const headers = ['Team ID', 'Team Name', 'College', 'Track', 'Progress %', 'Collaboration Score', 'Members Count'];
    const rows = filteredTeams
      .filter(t => selectedTeamIds.includes(t.id))
      .map(t => [t.id, t.name, t.college, t.track, t.progress, t.collaborationScore, t.members.length]);
    downloadCSV(headers, rows, `bulk_teams_export_${Date.now()}.csv`);
    setSelectedTeamIds([]);
  };

  // ----------------------------------------
  // TAB 3: SUBMISSIONS review & annotations
  // ----------------------------------------
  const flatSubmissions = useMemo(() => {
    const subs: (Submission & { team: Team })[] = [];
    allTeams.forEach(t => {
      t.submissions.forEach(s => {
        subs.push({ ...s, team: t });
      });
    });
    return subs;
  }, [allTeams]);

  const filteredSubmissions = useMemo(() => {
    return flatSubmissions.filter(sub => {
      const matchSearch = searchQuery === '' || 
        sub.team.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        sub.presentationFile.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTrack = selectedTrack === 'All' || sub.team.track === selectedTrack;
      const matchCollege = selectedCollege === 'All' || sub.team.college === selectedCollege;
      
      let matchStatus = true;
      if (selectedStatus !== 'All') {
        matchStatus = sub.facultyStatus === selectedStatus;
      }
      return matchSearch && matchTrack && matchCollege && matchStatus;
    });
  }, [flatSubmissions, searchQuery, selectedTrack, selectedCollege, selectedStatus]);

  const handleBulkEndorseSubmissions = () => {
    selectedSubmissionIds.forEach(id => {
      updateSubmissionFacultyNote(id, 'Bulk faculty endorsement.', 'endorsed');
    });
    addToast('Submissions Endorsed', `Successfully endorsed ${selectedSubmissionIds.length} submissions in bulk.`, 'success');
    setSelectedSubmissionIds([]);
  };

  const handleBulkFlagSubmissions = () => {
    selectedSubmissionIds.forEach(id => {
      updateSubmissionFacultyNote(id, 'Flagged in bulk for verification.', 'flagged');
    });
    addToast('Submissions Flagged', `Successfully flagged ${selectedSubmissionIds.length} submissions.`, 'error');
    setSelectedSubmissionIds([]);
  };

  const handleBulkExportSubmissions = () => {
    const headers = ['Submission ID', 'Team Name', 'College', 'Track', 'GitHub URL', 'Demo URL', 'File Name', 'Faculty Status', 'Faculty Note'];
    const rows = filteredSubmissions
      .filter(s => selectedSubmissionIds.includes(s.id))
      .map(s => [s.id, s.team.name, s.team.college, s.team.track, s.githubUrl, s.demoUrl, s.presentationFile, s.facultyStatus ?? 'pending', s.facultyNote ?? '']);
    downloadCSV(headers, rows, `bulk_submissions_export_${Date.now()}.csv`);
    setSelectedSubmissionIds([]);
  };

  // ----------------------------------------
  // TAB 5: SUPPORT REQUESTS MANAGER
  // ----------------------------------------
  const filteredRequests = useMemo(() => {
    return mentorRequests.filter(req => {
      const team = allTeams.find(t => t.id === req.teamId);
      if (!team) return false;
      const matchSearch = searchQuery === '' || 
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        req.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTrack = selectedTrack === 'All' || team.track === selectedTrack;
      const matchCollege = selectedCollege === 'All' || team.college === selectedCollege;
      const matchPriority = selectedStatus === 'All' || req.priority === selectedStatus; // Reusing selectedStatus dropdown for priority
      return matchSearch && matchTrack && matchCollege && matchPriority;
    });
  }, [mentorRequests, allTeams, searchQuery, selectedTrack, selectedCollege, selectedStatus]);

  const handleBulkAssignRequests = () => {
    if (!bulkMentorName) return;
    selectedRequestIds.forEach(id => {
      assignMentor(id, bulkMentorName);
    });
    addToast('Tickets Assigned', `Assigned ${selectedRequestIds.length} tickets to ${bulkMentorName}`, 'success');
    setSelectedRequestIds([]);
    setBulkMentorName('');
  };

  const handleBulkResolveRequests = () => {
    selectedRequestIds.forEach(id => {
      resolveMentorRequest(id);
    });
    addToast('Tickets Resolved', `Resolved ${selectedRequestIds.length} tickets.`, 'success');
    setSelectedRequestIds([]);
  };

  const handleEscalateRequest = (requestId: string) => {
    // Re-assign or trigger escalated severity
    addToast('Ticket Escalated', `Ticket ${requestId} has been escalated to URGENT priority.`, 'error');
  };

  // ----------------------------------------
  // TAB 6: EVENT & CHALLENGES CONFIGURATION
  // ----------------------------------------
  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) {
      addToast('Validation Error', 'Challenge Title and Description are required.', 'error');
      return;
    }

    const newChal: Omit<Challenge, 'participantsCount' | 'bookmarked'> = {
      id: editingChallengeId || `ch-${Date.now()}`,
      title: newTitle,
      track: newTrack,
      difficulty: newDifficulty,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      description: newDescription,
      background: newBackground,
      objectives: newObjectives.split('\n').map(o => o.trim()).filter(Boolean),
      requirements: newRequirements.split('\n').map(r => r.trim()).filter(Boolean),
      deliverables: newDeliverables.split('\n').map(d => d.trim()).filter(Boolean),
      evaluationCriteria: [
        { criteria: 'Technical Optimization', weight: 40 },
        { criteria: 'UI/UX & Accessibility', weight: 30 },
        { criteria: 'Architecture Soundness', weight: 20 },
        { criteria: 'Presentation Fidelity', weight: 10 }
      ],
      resources: [],
      mentors: ['Dr. Marcus Vancamp'],
      maxCapacity: newMaxCapacity,
      status: newStatus
    };

    if (editingChallengeId) {
      // Simulate overwrite edit by deleting then adding
      deleteChallenge(editingChallengeId);
      addChallenge(newChal);
      addToast('Challenge Updated', `Successfully updated challenge track: ${newTitle}`, 'success');
      setEditingChallengeId(null);
    } else {
      addChallenge(newChal);
      addToast('Challenge Created', `Successfully deployed new challenge track: ${newTitle}`, 'success');
    }

    // Reset inputs
    setNewTitle('');
    setNewDescription('');
    setNewBackground('');
    setNewObjectives('');
    setNewRequirements('');
    setNewDeliverables('');
    setNewTags('');
    setNewMaxCapacity(30);
    setNewStatus('active');
  };

  const handleEditChallengeClick = (chal: Challenge) => {
    setEditingChallengeId(chal.id);
    setNewTitle(chal.title);
    setNewTrack(chal.track);
    setNewDifficulty(chal.difficulty);
    setNewTags(chal.tags.join(', '));
    setNewDescription(chal.description);
    setNewBackground(chal.background || '');
    setNewObjectives(chal.objectives.join('\n'));
    setNewRequirements(chal.requirements.join('\n'));
    setNewDeliverables(chal.deliverables.join('\n'));
    setNewMaxCapacity(chal.maxCapacity ?? 30);
    setNewStatus(chal.status ?? 'active');
  };

  const handleDeleteChallenge = (id: string) => {
    deleteChallenge(id);
    addToast('Challenge Deleted', 'Challenge track removed successfully.', 'error');
  };

  return (
    <div className="flex-1 w-full bg-background font-satoshi overflow-y-auto min-h-screen">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        

        {/* ========================================================
            TAB 2: TEAM ROSTER MANAGER
           ======================================================== */}
        {activeTab === 'teams' && (
          <div className="space-y-6 text-left">
            {/* Filter Bar */}
            <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Search Team / Student</label>
                <div className="relative mt-1">
                  <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground/45" />
                  <input
                    type="text"
                    placeholder="Search name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#181818] border border-border/15 rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground focus:border-primary/50 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Track</label>
                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  className="w-full bg-[#181818] border border-border/15 rounded-lg px-2 py-2 text-xs text-foreground focus:border-primary/50 outline-none mt-1"
                >
                  <option value="All">All Tracks</option>
                  <option value="Energy Systems">Energy Systems</option>
                  <option value="Robotics">Robotics</option>
                  <option value="Sustainability">Sustainability</option>
                  <option value="E-Operations">E-Operations</option>
                  <option value="AI">AI</option>
                  <option value="IoT">IoT</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">College Hub</label>
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="w-full bg-[#181818] border border-border/15 rounded-lg px-2 py-2 text-xs text-foreground focus:border-primary/50 outline-none mt-1"
                >
                  <option value="All">All Colleges</option>
                  {collegesList.map((col, idx) => (
                    <option key={idx} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-[#181818] border border-border/15 rounded-lg px-2 py-2 text-xs text-foreground focus:border-primary/50 outline-none mt-1"
                >
                  <option value="All">All Statuses</option>
                  <option value="Has Submission">Has Submission</option>
                  <option value="No Submission">No Submission</option>
                  <option value="Stuck">Stuck / Blocked</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase flex justify-between">
                  <span>Max Progress</span>
                  <span className="text-primary font-bold">{progressRange}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressRange}
                  onChange={(e) => setProgressRange(Number(e.target.value))}
                  className="w-full accent-primary mt-3 h-1 bg-[#181818] rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Bulk Actions Panel */}
            {selectedTeamIds.length > 0 && (
              <div className="bg-[#ff000f]/10 border border-[#ff000f]/20 px-6 py-3 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  {selectedTeamIds.length} Teams Selected
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={handleBulkApproveTeams}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve Rosters
                  </button>
                  <button
                    onClick={() => setShowBroadcastModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Notice
                  </button>
                  <button
                    onClick={handleBulkExportTeams}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#252525] border border-border/20 text-muted-foreground hover:text-foreground rounded-lg text-xs font-bold transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </button>
                </div>
              </div>
            )}

            {/* Main Table */}
            <div className="bg-[#111111] border border-border/10 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left text-muted-foreground">
                <thead className="text-[10px] font-bold text-muted-foreground uppercase bg-[#181818]/45 border-b border-border/5">
                  <tr>
                    <th className="px-6 py-3 text-center w-12">
                      <input
                        type="checkbox"
                        checked={selectedTeamIds.length === filteredTeams.length && filteredTeams.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedTeamIds(filteredTeams.map(t => t.id));
                          else setSelectedTeamIds([]);
                        }}
                        className="rounded accent-primary bg-[#181818] border-border/25"
                      />
                    </th>
                    <th className="px-6 py-3">Team Name</th>
                    <th className="px-6 py-3">College</th>
                    <th className="px-6 py-3">Track</th>
                    <th className="px-6 py-3 text-center">Members</th>
                    <th className="px-6 py-3">Progress</th>
                    <th className="px-6 py-3">Velocity</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {filteredTeams.map(team => {
                    const isExpanded = expandedTeamId === team.id;
                    const submission = team.submissions[0];
                    return (
                      <Fragment key={team.id}>
                        <tr className={`hover:bg-white/[0.01] ${isExpanded ? 'bg-white/[0.01]' : ''}`}>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={selectedTeamIds.includes(team.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedTeamIds([...selectedTeamIds, team.id]);
                                else setSelectedTeamIds(selectedTeamIds.filter(id => id !== team.id));
                              }}
                              className="rounded accent-primary bg-[#181818] border-border/25"
                            />
                          </td>
                          <td className="px-6 py-4 font-bold text-foreground">{team.name}</td>
                          <td className="px-6 py-4">{team.college}</td>
                          <td className="px-6 py-4 font-semibold">{team.track}</td>
                          <td className="px-6 py-4 text-center font-bold text-foreground">{team.members.length}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-[#202020] h-1.5 rounded-full overflow-hidden flex items-center">
                                <div className="h-1.5 bg-primary rounded-full" style={{ width: `${team.progress}%` }} />
                              </div>
                              <span className="font-semibold text-foreground">{team.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-foreground">{getVelocityLabel(team)} ({getVelocityValue(team)}% / day)</td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2.5">
                            {submission && (
                              <button
                                onClick={() => setActiveSubTeam({ submission, team })}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-primary/10 border border-primary/20 hover:border-primary/45 rounded-lg text-[10px] font-bold text-primary transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                Deck
                              </button>
                            )}
                            <button
                              onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#252525] border border-border/20 rounded-lg text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              Inspect
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded details row */}
                        {isExpanded && (
                          <tr className="bg-[#161616]/50">
                            <td colSpan={8} className="px-6 py-5">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                
                                {/* Members List */}
                                <div className="space-y-3 bg-[#111] p-4 rounded-xl border border-border/5">
                                  <h5 className="text-[10px] font-bold text-primary uppercase tracking-wider">Team Roster Members</h5>
                                  <div className="space-y-2.5">
                                    {team.members.map(member => (
                                      <div key={member.id} className="flex justify-between items-center bg-[#151515] p-2.5 rounded-lg border border-border/5">
                                        <div>
                                          <div className="font-bold text-foreground">{member.fullName}</div>
                                          <div className="text-[10px] text-muted-foreground mt-0.5">{member.email}</div>
                                        </div>
                                        <div className="text-right">
                                          <span className="px-2 py-0.5 bg-[#202020] text-muted-foreground rounded text-[9px] font-semibold">{member.role}</span>
                                          <div className="text-[9px] text-muted-foreground/60 font-semibold mt-1 uppercase">{member.status}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Progress History Sparkline summary */}
                                <div className="space-y-3 bg-[#111] p-4 rounded-xl border border-border/5 text-left">
                                  <h5 className="text-[10px] font-bold text-primary uppercase tracking-wider">Kinematics Checkpoints</h5>
                                  <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                                    {team.progressHistory && team.progressHistory.map((hist, idx) => (
                                      <div key={idx} className="flex gap-3 text-xs leading-normal">
                                        <div className="flex flex-col items-center">
                                          <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
                                          {idx !== team.progressHistory.length - 1 && <span className="w-0.5 h-8 bg-border/20" />}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2 font-bold text-foreground">
                                            <span>Progress: {hist.progress}%</span>
                                            <span className="text-[9px] text-muted-foreground/60 font-semibold">{new Date(hist.date).toLocaleDateString()}</span>
                                          </div>
                                          <p className="text-muted-foreground text-[10px] font-medium mt-0.5">{hist.note}</p>
                                        </div>
                                      </div>
                                    ))}
                                    {(!team.progressHistory || team.progressHistory.length === 0) && (
                                      <div className="text-muted-foreground/50 py-4 text-center">No progress history snapshots recorded.</div>
                                    )}
                                  </div>
                                </div>

                                {/* Support tickets & submission reviews */}
                                <div className="space-y-4 bg-[#111] p-4 rounded-xl border border-border/5">
                                  <div>
                                    <h5 className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Metrics Summary</h5>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div className="bg-[#151515] p-3 rounded-lg border border-border/5">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Collab score</span>
                                        <div className="text-base font-extrabold text-foreground mt-0.5">{team.collaborationScore}%</div>
                                      </div>
                                      <div className="bg-[#151515] p-3 rounded-lg border border-border/5">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Grade Received</span>
                                        <div className="text-base font-extrabold text-primary mt-0.5">
                                          {submission?.score ? `${submission.score}/100` : '—'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="border-t border-border/5 pt-3">
                                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Quick Action Controls</h5>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {
                                          updateTeamProgress(team.id, Math.min(100, team.progress + 10), 'Milestone verified by faculty panel.');
                                          addToast('Progress Updated', `Incremeted progress for ${team.name}`, 'success');
                                        }}
                                        className="flex-1 py-1.5 bg-[#252525] border border-border/20 text-foreground hover:bg-[#303030] rounded-lg font-bold text-[10px] text-center transition-colors"
                                      >
                                        Increment Progress (+10)
                                      </button>
                                    </div>
                                  </div>
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: SUBMISSIONS REVIEW HUB
           ======================================================== */}
        {activeTab === 'submissions' && (
          <div className="space-y-6 text-left">
            {/* Filter Bar */}
            <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Search Team / Filename</label>
                <div className="relative mt-1">
                  <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground/45" />
                  <input
                    type="text"
                    placeholder="Search query..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#181818] border border-border/15 rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground focus:border-primary/50 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Track</label>
                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  className="w-full bg-[#181818] border border-border/15 rounded-lg px-2 py-2 text-xs text-foreground focus:border-primary/50 outline-none mt-1"
                >
                  <option value="All">All Tracks</option>
                  <option value="Energy Systems">Energy Systems</option>
                  <option value="Robotics">Robotics</option>
                  <option value="Sustainability">Sustainability</option>
                  <option value="E-Operations">E-Operations</option>
                  <option value="AI">AI</option>
                  <option value="IoT">IoT</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">College Hub</label>
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="w-full bg-[#181818] border border-border/15 rounded-lg px-2 py-2 text-xs text-foreground focus:border-primary/50 outline-none mt-1"
                >
                  <option value="All">All Colleges</option>
                  {collegesList.map((col, idx) => (
                    <option key={idx} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Faculty status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-[#181818] border border-border/15 rounded-lg px-2 py-2 text-xs text-foreground focus:border-primary/50 outline-none mt-1"
                >
                  <option value="All">All Statuses</option>
                  <option value="pending">Pending review</option>
                  <option value="endorsed">Endorsed</option>
                  <option value="flagged">Flagged</option>
                </select>
              </div>
            </div>

            {/* Bulk actions */}
            {selectedSubmissionIds.length > 0 && (
              <div className="bg-[#ff000f]/10 border border-[#ff000f]/20 px-6 py-3 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  {selectedSubmissionIds.length} Submissions Selected
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={handleBulkEndorseSubmissions}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Endorse Selected
                  </button>
                  <button
                    onClick={handleBulkFlagSubmissions}
                    className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Flag Selected
                  </button>
                  <button
                    onClick={handleBulkExportSubmissions}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#252525] border border-border/20 text-muted-foreground hover:text-foreground rounded-lg text-xs font-bold transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </button>
                </div>
              </div>
            )}

            {/* Main Table */}
            <div className="bg-[#111111] border border-border/10 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left text-muted-foreground">
                <thead className="text-[10px] font-bold text-muted-foreground uppercase bg-[#181818]/45 border-b border-border/5">
                  <tr>
                    <th className="px-6 py-3 text-center w-12">
                      <input
                        type="checkbox"
                        checked={selectedSubmissionIds.length === filteredSubmissions.length && filteredSubmissions.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedSubmissionIds(filteredSubmissions.map(s => s.id));
                          else setSelectedSubmissionIds([]);
                        }}
                        className="rounded accent-primary bg-[#181818] border-border/25"
                      />
                    </th>
                    <th className="px-6 py-3">Team Name</th>
                    <th className="px-6 py-3">Track</th>
                    <th className="px-6 py-3">Submitted At</th>
                    <th className="px-6 py-3">File Name</th>
                    <th className="px-6 py-3 text-center">Score</th>
                    <th className="px-6 py-3 text-center">Faculty Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {filteredSubmissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-white/[0.01]">
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedSubmissionIds.includes(sub.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedSubmissionIds([...selectedSubmissionIds, sub.id]);
                            else setSelectedSubmissionIds(selectedSubmissionIds.filter(id => id !== sub.id));
                          }}
                          className="rounded accent-primary bg-[#181818] border-border/25"
                        />
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">{sub.team.name}</td>
                      <td className="px-6 py-4 font-semibold">{sub.team.track}</td>
                      <td className="px-6 py-4">
                        {new Date(sub.submittedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </td>
                      <td className="px-6 py-4 truncate max-w-[150px]">{sub.presentationFile}</td>
                      <td className="px-6 py-4 text-center font-extrabold text-foreground">{sub.score ?? '—'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          sub.facultyStatus === 'endorsed' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : sub.facultyStatus === 'flagged' 
                              ? 'bg-rose-500/10 text-rose-500' 
                              : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {sub.facultyStatus ?? 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setActiveSubTeam({ submission: sub, team: sub.team })}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 hover:border-primary/50 hover:bg-primary/20 rounded-xl text-[10px] font-bold text-primary ml-auto transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View PPT
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSubmissions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-muted-foreground/50">No submissions matching current filter criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* ========================================================
            TAB 5: TICKETS QUEUE
           ======================================================== */}
        {activeTab === 'requests' && (
          <div className="space-y-6 text-left">
            {/* Filter Bar */}
            <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Search Request / Team</label>
                <div className="relative mt-1">
                  <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground/45" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#181818] border border-border/15 rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground focus:border-primary/50 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Track</label>
                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  className="w-full bg-[#181818] border border-border/15 rounded-lg px-2 py-2 text-xs text-foreground focus:border-primary/50 outline-none mt-1"
                >
                  <option value="All">All Tracks</option>
                  <option value="Energy Systems">Energy Systems</option>
                  <option value="Robotics">Robotics</option>
                  <option value="Sustainability">Sustainability</option>
                  <option value="E-Operations">E-Operations</option>
                  <option value="AI">AI</option>
                  <option value="IoT">IoT</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">College Hub</label>
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="w-full bg-[#181818] border border-border/15 rounded-lg px-2 py-2 text-xs text-foreground focus:border-primary/50 outline-none mt-1"
                >
                  <option value="All">All Colleges</option>
                  {collegesList.map((col, idx) => (
                    <option key={idx} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Severity</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-[#181818] border border-border/15 rounded-lg px-2 py-2 text-xs text-foreground focus:border-primary/50 outline-none mt-1"
                >
                  <option value="All">All Severities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Bulk actions */}
            {selectedRequestIds.length > 0 && (
              <div className="bg-[#ff000f]/10 border border-[#ff000f]/20 px-6 py-3 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  {selectedRequestIds.length} Support Tickets Selected
                </span>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-1.5">
                    <select
                      value={bulkMentorName}
                      onChange={(e) => setBulkMentorName(e.target.value)}
                      className="bg-[#181818] border border-border/20 rounded-lg text-xs text-foreground py-1 px-2 focus:border-primary outline-none"
                    >
                      <option value="">Assign Mentor...</option>
                      {mentors.map(m => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                    <button
                      disabled={!bulkMentorName}
                      onClick={handleBulkAssignRequests}
                      className="px-3 py-1 bg-primary disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Assign
                    </button>
                  </div>
                  <button
                    onClick={handleBulkResolveRequests}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark Resolved
                  </button>
                </div>
              </div>
            )}

            {/* Main Table */}
            <div className="bg-[#111111] border border-border/10 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left text-muted-foreground">
                <thead className="text-[10px] font-bold text-muted-foreground uppercase bg-[#181818]/45 border-b border-border/5">
                  <tr>
                    <th className="px-6 py-3 text-center w-12">
                      <input
                        type="checkbox"
                        checked={selectedRequestIds.length === filteredRequests.length && filteredRequests.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedRequestIds(filteredRequests.map(r => r.id));
                          else setSelectedRequestIds([]);
                        }}
                        className="rounded accent-primary bg-[#181818] border-border/25"
                      />
                    </th>
                    <th className="px-6 py-3">Severity</th>
                    <th className="px-6 py-3">Team Name</th>
                    <th className="px-6 py-3">Ticket Type</th>
                    <th className="px-6 py-3">Issue Description</th>
                    <th className="px-6 py-3">Assigned Expert</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {filteredRequests.map(req => (
                    <tr key={req.id} className="hover:bg-white/[0.01]">
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRequestIds.includes(req.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedRequestIds([...selectedRequestIds, req.id]);
                            else setSelectedRequestIds(selectedRequestIds.filter(id => id !== req.id));
                          }}
                          className="rounded accent-primary bg-[#181818] border-border/25"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          req.priority === 'Urgent' 
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                            : req.priority === 'High' 
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                              : req.priority === 'Medium' 
                                ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                                : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                        }`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">{req.teamName}</td>
                      <td className="px-6 py-4 font-semibold">{req.type}</td>
                      <td className="px-6 py-4 truncate max-w-[200px]" title={req.description}>
                        {req.description}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={req.mentorName || ''}
                          onChange={(e) => {
                            assignMentor(req.id, e.target.value);
                            addToast('Mentor Assigned', `Assigned ticket to ${e.target.value}`, 'info');
                          }}
                          className="bg-[#181818] border border-border/15 rounded px-2 py-1 text-xs text-foreground focus:border-primary outline-none"
                        >
                          <option value="">Unassigned</option>
                          {mentors.map(m => (
                            <option key={m.id} value={m.name}>{m.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          req.status === 'resolved' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : req.status === 'assigned' 
                              ? 'bg-blue-500/10 text-blue-500' 
                              : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        {req.status !== 'resolved' && (
                          <button
                            onClick={() => {
                              resolveMentorRequest(req.id);
                              addToast('Ticket Resolved', 'Mentor support request resolved successfully.', 'success');
                            }}
                            className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
                            title="Resolve Ticket"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEscalateRequest(req.id)}
                          className="p-1 text-rose-500 hover:bg-rose-500/10 rounded"
                          title="Escalate Severity"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-muted-foreground/50">No tickets found matching filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: CHALLENGE CONFIGURATION
           ======================================================== */}
        {activeTab === 'manage-events' && (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Form: Creation / Edit challenge */}
              <div className="lg:col-span-1 bg-[#111111] border border-border/10 p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border/5 pb-2">
                  <Plus className="w-4.5 h-4.5 text-primary" />
                  {editingChallengeId ? 'Edit Challenge Track' : 'Deploy New Challenge Track'}
                </h3>

                <form onSubmit={handleCreateChallenge} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Challenge Title *</label>
                    <input 
                      value={newTitle} 
                      onChange={e => setNewTitle(e.target.value)} 
                      placeholder="e.g. Decarbonization analytics..." 
                      className="w-full bg-[#181818] border border-border/15 rounded-lg px-3 py-2 text-foreground focus:border-primary/50 outline-none" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Track Category</label>
                      <select 
                        value={newTrack} 
                        onChange={e => setNewTrack(e.target.value)} 
                        className="w-full bg-[#181818] border border-border/15 rounded-lg px-2 py-2 text-foreground focus:border-primary/50 outline-none"
                      >
                        <option>Energy Systems</option>
                        <option>Robotics</option>
                        <option>Artificial Intelligence</option>
                        <option>Sustainability</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Difficulty</label>
                      <select 
                        value={newDifficulty} 
                        onChange={e => setNewDifficulty(e.target.value as any)} 
                        className="w-full bg-[#181818] border border-border/15 rounded-lg px-2 py-2 text-foreground focus:border-primary/50 outline-none"
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                        <option>Expert</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Capacity Limit</label>
                      <input 
                        type="number"
                        value={newMaxCapacity} 
                        onChange={e => setNewMaxCapacity(Number(e.target.value))} 
                        className="w-full bg-[#181818] border border-border/15 rounded-lg px-3 py-2 text-foreground focus:border-primary/50 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Status</label>
                      <select 
                        value={newStatus} 
                        onChange={e => setNewStatus(e.target.value as any)} 
                        className="w-full bg-[#181818] border border-border/15 rounded-lg px-2 py-2 text-foreground focus:border-primary/50 outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Tags (Comma Separated)</label>
                    <input 
                      value={newTags} 
                      onChange={e => setNewTags(e.target.value)} 
                      placeholder="SmartGrid, Decarbonization" 
                      className="w-full bg-[#181818] border border-border/15 rounded-lg px-3 py-2 text-foreground focus:border-primary/50 outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Brief Description *</label>
                    <textarea 
                      value={newDescription} 
                      onChange={e => setNewDescription(e.target.value)} 
                      rows={2} 
                      placeholder="Enter challenge scope..." 
                      className="w-full bg-[#181818] border border-border/15 rounded-lg p-2.5 text-foreground focus:border-primary/50 outline-none resize-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Context Background</label>
                    <textarea 
                      value={newBackground} 
                      onChange={e => setNewBackground(e.target.value)} 
                      rows={2} 
                      placeholder="Explain the background scenario..." 
                      className="w-full bg-[#181818] border border-border/15 rounded-lg p-2.5 text-foreground focus:border-primary/50 outline-none resize-none" 
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg transition-colors text-center"
                    >
                      {editingChallengeId ? 'Update Challenge' : 'Deploy Track'}
                    </button>
                    {editingChallengeId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingChallengeId(null);
                          setNewTitle('');
                          setNewDescription('');
                          setNewBackground('');
                          setNewObjectives('');
                          setNewRequirements('');
                          setNewDeliverables('');
                          setNewTags('');
                          setNewMaxCapacity(30);
                          setNewStatus('active');
                        }}
                        className="px-3 py-2 bg-[#252525] border border-border/20 text-muted-foreground hover:text-foreground rounded-lg font-bold transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right Column: Challenge list with enrollment bar */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Active Challenge Deployments</h3>

                <div className="grid grid-cols-1 gap-4">
                  {challenges.map(chal => {
                    const enrolledTeams = allTeams.filter(t => t.challengeId === chal.id);
                    const isSelected = selectedChallengeIdDetails === chal.id;
                    const maxCap = chal.maxCapacity ?? 30;
                    const capRate = Math.min(100, Math.round((chal.participantsCount / maxCap) * 100));
                    
                    return (
                      <div key={chal.id} className="bg-[#111111] border border-border/10 rounded-2xl p-5 space-y-4 text-left shadow-sm hover:border-border/20 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-foreground">{chal.title}</h4>
                              <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                                (chal.status ?? 'active') === 'active' 
                                  ? 'bg-emerald-500/10 text-emerald-500' 
                                  : (chal.status ?? 'active') === 'paused'
                                    ? 'bg-amber-500/10 text-amber-500'
                                    : 'bg-rose-500/10 text-rose-500'
                              }`}>
                                {chal.status ?? 'active'}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Track: {chal.track} | Difficulty: {chal.difficulty}</p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditChallengeClick(chal)}
                              className="p-1.5 bg-[#1a1a1a] hover:bg-[#252525] border border-border/10 rounded text-muted-foreground hover:text-foreground transition-colors"
                              title="Edit challenge"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteChallenge(chal.id)}
                              className="p-1.5 bg-[#1a1a1a] hover:bg-rose-600/15 border border-border/10 hover:border-rose-500/30 rounded text-muted-foreground hover:text-rose-500 transition-colors"
                              title="Delete challenge"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-normal">{chal.description}</p>

                        {/* Capacity meter */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-muted-foreground">Capacity Enrollment:</span>
                            <span className="text-foreground">{chal.participantsCount} / {maxCap} Students</span>
                          </div>
                          <div className="w-full bg-[#1c1c1c] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${capRate}%` }} />
                          </div>
                        </div>

                        {/* Expand enrolled teams */}
                        <div>
                          <button
                            onClick={() => setSelectedChallengeIdDetails(isSelected ? null : chal.id)}
                            className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                          >
                            {isSelected ? 'Hide Enrolled Teams' : `View Enrolled Teams (${enrolledTeams.length})`}
                          </button>

                          {isSelected && (
                            <div className="mt-3 bg-[#151515] border border-border/5 rounded-xl p-3.5 space-y-2.5">
                              <h5 className="text-[10px] font-bold text-muted-foreground uppercase">Affiliated Teams:</h5>
                              {enrolledTeams.map(t => (
                                <div key={t.id} className="flex justify-between text-xs bg-[#191919] p-2 rounded-lg border border-border/5">
                                  <span className="font-bold text-foreground">{t.name}</span>
                                  <span className="text-muted-foreground">{t.college}</span>
                                </div>
                              ))}
                              {enrolledTeams.length === 0 && (
                                <div className="text-center text-xs text-muted-foreground/45 py-2">No teams enrolled in this track yet.</div>
                              )}
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Render the Presentation viewer overlay when triggered */}
      {activeSubTeam && (
        <PresentationViewerModal
          submission={activeSubTeam.submission}
          team={activeSubTeam.team}
          role="staff"
          onClose={() => setActiveSubTeam(null)}
        />
      )}

      {/* Broadcast Modal popup */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-border/20 rounded-[21px] p-6 w-full max-w-md shadow-xl text-left space-y-4">
            <div className="flex justify-between items-center border-b border-border/10 pb-3">
              <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Broadcast Notice</h3>
              <button onClick={() => setShowBroadcastModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-muted-foreground">Deliver a broadcast notification to all members of the {selectedTeamIds.length} selected teams.</p>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={3}
                className="w-full bg-[#181818] border border-border/15 focus:border-primary/50 outline-none rounded-xl p-3 text-foreground resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="px-4 py-2 bg-[#202020] hover:bg-[#252525] border border-border/15 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                disabled={!broadcastMessage.trim()}
                onClick={handleBulkBroadcast}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Notice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
