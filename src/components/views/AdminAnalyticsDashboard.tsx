'use client';

import { useState, useMemo, useEffect } from 'react';
import { usePlatformStore, Team, Submission, TeamMember, Challenge, MentorRequest } from '@/store/usePlatformStore';
import { calculatePrecisionVelocity, getVelocityLabelFromVal } from '../../utils/mathEngines';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, Cell, PieChart, Pie, LineChart, Line, Legend, RadarChart, 
  Radar, PolarGrid, PolarAngleAxis, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  Users, FolderGit, CheckSquare, Star, Calendar, AlertCircle, TrendingUp, 
  Download, ChevronDown, ChevronUp, Filter, Search, FileSpreadsheet, Eye, 
  ExternalLink, BarChart3, HelpCircle, Pin, PinOff, Settings, Check
} from 'lucide-react';
import { PresentationViewerModal } from '../shared/PresentationViewerModal';

export function AdminAnalyticsDashboard() {
  const { 
    allTeams, 
    challenges, 
    mentors, 
    mentorRequests, 
    addToast,
    pinnedTeamIds,
    togglePinTeam
  } = usePlatformStore();

  // Filters state
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string>('All');
  const [selectedCollege, setSelectedCollege] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected submission for presentation modal
  const [activeSubTeam, setActiveSubTeam] = useState<{ submission: Submission; team: Team } | null>(null);

  // Sorting states for tables
  const [teamsSort, setTeamsSort] = useState<{ col: keyof Team | 'velocity' | 'membersCount' | 'submissionsCount'; asc: boolean }>({ col: 'progress', asc: false });
  const [studentsSort, setStudentsSort] = useState<{ col: keyof TeamMember | 'teamName' | 'track'; asc: boolean }>({ col: 'fullName', asc: true });
  const [submissionsSort, setSubmissionsSort] = useState<{ col: keyof Submission | 'teamName' | 'track' | 'college'; asc: boolean }>({ col: 'submittedAt', asc: false });
  const [requestsSort, setRequestsSort] = useState<{ col: keyof MentorRequest; asc: boolean }>({ col: 'priority', asc: false });

  // Pinned/Monitored teams
  const pinnedTeams = useMemo(() => {
    return allTeams.filter(t => pinnedTeamIds.includes(t.id));
  }, [allTeams, pinnedTeamIds]);

  // Graph Toggle settings panel state
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [visibleCharts, setVisibleCharts] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
    9: true,
    10: true
  });

  // Custom Analytics Builder states
  const [selectedDataset, setSelectedDataset] = useState<'Teams' | 'Students' | 'Submissions' | 'Requests' | 'Challenges'>('Teams');
  const [groupByKey, setGroupByKey] = useState<string>('track');
  const [metricKey, setMetricKey] = useState<string>('progress');
  const [aggregateFn, setAggregateFn] = useState<'Average' | 'Sum' | 'Min' | 'Max' | 'Count'>('Average');
  const [customChartType, setCustomChartType] = useState<'Bar' | 'Line' | 'Area' | 'Pie' | 'Scatter'>('Bar');

  // Get unique colleges from data
  const collegesList = useMemo(() => {
    const colleges = new Set<string>();
    allTeams.forEach(t => {
      if (t.college) colleges.add(t.college);
      t.members.forEach(m => {
        if (m.college) colleges.add(m.college);
      });
    });
    return Array.from(colleges);
  }, [allTeams]);

  // Velocity calculation helpers using precision engine
  const getVelocityValue = (team: Team) => {
    return calculatePrecisionVelocity(team.progressHistory || []);
  };

  const getVelocityLabel = (team: Team) => {
    return getVelocityLabelFromVal(getVelocityValue(team));
  };

  // Stuck Team checker
  const isTeamStuck = (team: Team) => {
    const requests = mentorRequests.filter(r => r.teamId === team.id && r.status !== 'resolved');
    const velocity = getVelocityValue(team);
    return team.progress < 40 && (requests.length >= 2 || velocity < 5);
  };

  // Dynamic filter engine for datasets
  const filteredTeams = useMemo(() => {
    return allTeams.filter(team => {
      const matchTrack = selectedTrack === 'All' || team.track === selectedTrack;
      const matchCollege = selectedCollege === 'All' || team.college === selectedCollege;
      const matchSearch = searchQuery === '' || 
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        team.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.members.some(m => m.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchTrack && matchCollege && matchSearch;
    });
  }, [allTeams, selectedTrack, selectedCollege, searchQuery]);

  const filteredRequests = useMemo(() => {
    return mentorRequests.filter(req => {
      const team = allTeams.find(t => t.id === req.teamId);
      if (!team) return false;
      const matchTrack = selectedTrack === 'All' || team.track === selectedTrack;
      const matchCollege = selectedCollege === 'All' || team.college === selectedCollege;
      const matchSearch = searchQuery === '' || 
        req.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTrack && matchCollege && matchSearch;
    });
  }, [mentorRequests, allTeams, selectedTrack, selectedCollege, searchQuery]);

  // Platform KPIs Calculations based on filteredTeams
  const kpis = useMemo(() => {
    const totalStudents = filteredTeams.reduce((sum, t) => sum + t.members.length, 0);
    const activeTeams = filteredTeams.length;
    const submittedTeamsCount = filteredTeams.filter(t => t.submissions.length > 0).length;
    const submissionRate = activeTeams > 0 ? Math.round((submittedTeamsCount / activeTeams) * 100) : 0;
    
    const gradedSubmissions = filteredTeams.flatMap(t => t.submissions).filter(s => s.score !== undefined);
    const avgScore = gradedSubmissions.length > 0
      ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length)
      : 0;

    const mentorSessions = filteredRequests.filter(r => r.status === 'resolved' || r.status === 'assigned').length;
    const stuckTeams = filteredTeams.filter(isTeamStuck).length;

    // Hottest track
    const trackCounts: Record<string, number> = {};
    filteredTeams.forEach(t => {
      trackCounts[t.track] = (trackCounts[t.track] || 0) + 1;
    });
    let hottestTrack = 'N/A';
    let maxTeams = 0;
    Object.entries(trackCounts).forEach(([track, count]) => {
      if (count > maxTeams) {
        maxTeams = count;
        hottestTrack = track;
      }
    });

    // Avg velocity
    const velocities = filteredTeams.map(getVelocityValue);
    const avgVelocity = velocities.length > 0
      ? Math.round((velocities.reduce((sum, v) => sum + v, 0) / velocities.length) * 1000) / 1000
      : 0;

    return {
      totalStudents,
      activeTeams,
      submissionRate,
      avgScore,
      mentorSessions,
      stuckTeams,
      hottestTrack,
      avgVelocity
    };
  }, [filteredTeams, filteredRequests]);

  // Custom tooltips to match dark UI
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const tooltipLabel = label || payload[0]?.payload?.name || '';
      return (
        <div className="bg-[#181818] border border-border/20 p-3 rounded-lg shadow-xl text-left font-sans">
          {tooltipLabel && <p className="text-xs font-bold text-muted-foreground">{tooltipLabel}</p>}
          {payload.map((pld: any, idx: number) => (
            <p key={idx} className="text-sm font-semibold mt-1" style={{ color: pld.color || pld.fill || '#ff000f' }}>
              {pld.name || 'Value'}: {pld.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // CSV download helper
  const downloadCSV = (headers: string[], rows: any[][], filename: string) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => {
        const strVal = val === undefined || val === null ? '' : String(val);
        return `"${strVal.replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Export Successful', `Saved CSV data to ${filename}`, 'success');
  };

  // Dynamic Chart calculations based on filtered datasets
  const progressOverTimeData = useMemo(() => {
    const datesSet = new Set<string>();
    filteredTeams.forEach(t => {
      t.progressHistory?.forEach(h => {
        datesSet.add(h.date.substring(0, 10));
      });
    });
    
    const sortedDates = Array.from(datesSet).sort();
    return sortedDates.map(dateStr => {
      const dataPoint: Record<string, any> = { date: dateStr };
      filteredTeams.forEach(t => {
        const historyOnOrBefore = t.progressHistory
          ?.filter(h => h.date.substring(0, 10) <= dateStr)
          .sort((a, b) => b.date.localeCompare(a.date));
        
        dataPoint[t.name] = historyOnOrBefore && historyOnOrBefore.length > 0 
          ? historyOnOrBefore[0].progress 
          : 0;
      });
      return dataPoint;
    });
  }, [filteredTeams]);

  const trackPopularityData = useMemo(() => {
    const trackCounts: Record<string, { track: string; teams: number; students: number }> = {};
    filteredTeams.forEach(t => {
      if (!trackCounts[t.track]) {
        trackCounts[t.track] = { track: t.track, teams: 0, students: 0 };
      }
      trackCounts[t.track].teams += 1;
      trackCounts[t.track].students += t.members.length;
    });
    return Object.values(trackCounts);
  }, [filteredTeams]);

  const funnelData = useMemo(() => {
    const total = filteredTeams.reduce((sum, t) => sum + t.members.length, 0);
    const inTeams = filteredTeams.flatMap(t => t.members).length;
    const submitted = filteredTeams.filter(t => t.submissions.length > 0).length;
    const reviewed = filteredTeams.flatMap(t => t.submissions).filter(s => s.status === 'reviewed').length;
    const endorsed = filteredTeams.flatMap(t => t.submissions).filter(s => s.facultyStatus === 'endorsed').length;

    return [
      { stage: 'Onboarded Students', value: total, percentage: 100 },
      { stage: 'Affiliated in Teams', value: inTeams, percentage: total > 0 ? Math.round((inTeams / total) * 100) : 0 },
      { stage: 'Submissions Loaded', value: submitted, percentage: filteredTeams.length > 0 ? Math.round((submitted / filteredTeams.length) * 100) : 0 },
      { stage: 'Judge Graded', value: reviewed, percentage: submitted > 0 ? Math.round((reviewed / submitted) * 100) : 0 },
      { stage: 'Faculty Endorsed', value: endorsed, percentage: reviewed > 0 ? Math.round((endorsed / reviewed) * 100) : 0 }
    ];
  }, [filteredTeams]);

  const scoreDistributionData = useMemo(() => {
    const buckets = [
      { name: '0-40', count: 0, fill: '#ff000f' },
      { name: '41-60', count: 0, fill: '#f59e0b' },
      { name: '61-80', count: 0, fill: '#3b82f6' },
      { name: '81-100', count: 0, fill: '#10b981' }
    ];
    filteredTeams.flatMap(t => t.submissions).forEach(sub => {
      const score = sub.score;
      if (score === undefined) return;
      if (score <= 40) buckets[0].count++;
      else if (score <= 60) buckets[1].count++;
      else if (score <= 80) buckets[2].count++;
      else buckets[3].count++;
    });
    return buckets;
  }, [filteredTeams]);

  const requestVolumeData = useMemo(() => {
    const trackRequests: Record<string, Record<string, number>> = {};
    filteredRequests.forEach(req => {
      const team = filteredTeams.find(t => t.id === req.teamId);
      const track = team ? team.track : 'General';
      if (!trackRequests[track]) {
        trackRequests[track] = { Low: 0, Medium: 0, High: 0, Urgent: 0 };
      }
      trackRequests[track][req.priority] = (trackRequests[track][req.priority] || 0) + 1;
    });

    return Object.entries(trackRequests).map(([track, counts]) => ({
      track,
      ...counts
    }));
  }, [filteredRequests, filteredTeams]);

  const pointsGrowthData = useMemo(() => {
    return [
      { name: 'Start', ...Object.fromEntries(filteredTeams.map(t => [t.name, 0])) },
      { name: 'Round 1', ...Object.fromEntries(filteredTeams.map(t => {
        const r1 = t.mentorEvaluations?.find(e => e.round === 1)?.pointsEarned || 0;
        return [t.name, r1];
      })) },
      { name: 'Round 2', ...Object.fromEntries(filteredTeams.map(t => {
        const r1 = t.mentorEvaluations?.find(e => e.round === 1)?.pointsEarned || 0;
        const r2 = t.mentorEvaluations?.find(e => e.round === 2)?.pointsEarned || 0;
        return [t.name, r1 + r2];
      })) },
      { name: 'Round 3', ...Object.fromEntries(filteredTeams.map(t => {
        const r1 = t.mentorEvaluations?.find(e => e.round === 1)?.pointsEarned || 0;
        const r2 = t.mentorEvaluations?.find(e => e.round === 2)?.pointsEarned || 0;
        const r3 = t.mentorEvaluations?.find(e => e.round === 3)?.pointsEarned || 0;
        return [t.name, r1 + r2 + r3];
      })) }
    ];
  }, [filteredTeams]);

  const badgeSummaryData = useMemo(() => {
    const counts: Record<string, number> = {
      "Pitch Master": 0,
      "MVP Builder": 0,
      "UIUX Wizard": 0,
      "Stellar Growth": 0,
      "Overachiever": 0
    };
    filteredTeams.forEach(t => {
      t.badges?.forEach(badge => {
        if (badge in counts) {
          counts[badge]++;
        }
      });
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [filteredTeams]);

  const stuckTeamScatterData = useMemo(() => {
    return filteredTeams.map(t => {
      const requestCount = filteredRequests.filter(r => r.teamId === t.id && r.status !== 'resolved').length;
      const size = t.members.length;
      let status = 'healthy';
      if (t.progress < 40 && requestCount >= 2) status = 'stuck';
      else if (t.progress < 50 || requestCount >= 1) status = 'watch';
      
      return {
        name: t.name,
        progress: t.progress,
        requests: requestCount,
        size,
        status
      };
    });
  }, [filteredTeams, filteredRequests]);

  const velocityData = useMemo(() => {
    return filteredTeams.map(t => ({
      name: t.name,
      velocity: getVelocityValue(t)
    })).sort((a, b) => b.velocity - a.velocity);
  }, [filteredTeams]);

  const collabVsProgressData = useMemo(() => {
    return filteredTeams.map(t => ({
      name: t.name,
      collab: t.collaborationScore,
      progress: t.progress,
      track: t.track
    }));
  }, [filteredTeams]);

  const mentorEffectivenessData = useMemo(() => {
    const mentorStats: Record<string, { name: string; sessions: number; progressGain: number }> = {};
    filteredRequests.filter(r => r.status === 'resolved' && r.mentorName).forEach(req => {
      const mentorName = req.mentorName!;
      if (!mentorStats[mentorName]) {
        mentorStats[mentorName] = { name: mentorName, sessions: 0, progressGain: 0 };
      }
      mentorStats[mentorName].sessions += 1;
      
      const team = filteredTeams.find(t => t.id === req.teamId);
      if (team && team.progressHistory && team.progressHistory.length > 1) {
        const start = team.progressHistory[0].progress;
        const end = team.progressHistory[team.progressHistory.length - 1].progress;
        mentorStats[mentorName].progressGain += (end - start);
      } else if (team) {
        mentorStats[mentorName].progressGain += team.progress;
      }
    });

    return Object.values(mentorStats).map(m => ({
      name: m.name,
      sessions: m.sessions,
      avgProgressGain: m.sessions > 0 ? Math.round((m.progressGain / m.sessions) * 10) / 10 : 0
    }));
  }, [filteredRequests, filteredTeams]);

  const collegeAnalyticsData = useMemo(() => {
    const collegeGroups: Record<string, { college: string; totalProgress: number; count: number; submissions: number; scoreSum: number; scoredCount: number }> = {};
    filteredTeams.forEach(t => {
      const col = t.college || 'Other';
      if (!collegeGroups[col]) {
        collegeGroups[col] = { college: col, totalProgress: 0, count: 0, submissions: 0, scoreSum: 0, scoredCount: 0 };
      }
      collegeGroups[col].totalProgress += t.progress;
      collegeGroups[col].count += 1;
      if (t.submissions.length > 0) {
        collegeGroups[col].submissions += 1;
        const score = t.submissions[0].score;
        if (score !== undefined) {
          collegeGroups[col].scoreSum += score;
          collegeGroups[col].scoredCount += 1;
        }
      }
    });

    return Object.values(collegeGroups).map(c => ({
      college: c.college,
      avgProgress: Math.round(c.totalProgress / c.count),
      submissionRate: Math.round((c.submissions / c.count) * 100),
      avgScore: c.scoredCount > 0 ? Math.round(c.scoreSum / c.scoredCount) : 0
    }));
  }, [filteredTeams]);

  // Lists of students and submissions derived from filteredTeams
  const allStudents = useMemo(() => {
    const students: (TeamMember & { teamName: string; track: string })[] = [];
    filteredTeams.forEach(t => {
      t.members.forEach(m => {
        students.push({
          ...m,
          teamName: t.name,
          track: t.track
        });
      });
    });
    return students;
  }, [filteredTeams]);

  const allSubmissions = useMemo(() => {
    const subs: (Submission & { teamName: string; track: string; college: string })[] = [];
    filteredTeams.forEach(t => {
      t.submissions.forEach(s => {
        subs.push({
          ...s,
          teamName: t.name,
          track: t.track,
          college: t.college || 'Other'
        });
      });
    });
    return subs;
  }, [filteredTeams]);

  // Dynamic grouping & schema introspector for "Any Graph" Builder
  const datasets = useMemo(() => {
    return {
      Teams: filteredTeams,
      Students: allStudents,
      Submissions: allSubmissions,
      Requests: filteredRequests,
      Challenges: challenges
    };
  }, [filteredTeams, allStudents, allSubmissions, filteredRequests, challenges]);

  const datasetOptions = useMemo(() => {
    const data = datasets[selectedDataset];
    if (!data || data.length === 0) return { groupable: [], numeric: [] };
    
    const item = data[0];
    const groupable: string[] = [];
    const numeric: string[] = [];
    
    Object.entries(item).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        if (val.length === 0 || typeof val[0] === 'string') {
          groupable.push(key);
        }
      } else if (typeof val === 'string' || typeof val === 'boolean') {
        const lowerKey = key.toLowerCase();
        if (!lowerKey.includes('url') && !lowerKey.includes('desc') && !lowerKey.includes('background') && !lowerKey.includes('objective') && !lowerKey.includes('requirement') && !lowerKey.includes('deliverable') && !lowerKey.includes('code') && !lowerKey.includes('file')) {
          groupable.push(key);
        }
      } else if (typeof val === 'number') {
        numeric.push(key);
      }
    });
    
    return { groupable, numeric };
  }, [selectedDataset, datasets]);

  // Sync builder keys when dataset changes
  useEffect(() => {
    if (datasetOptions.groupable.length > 0) {
      setGroupByKey(datasetOptions.groupable[0]);
    }
    if (datasetOptions.numeric.length > 0) {
      setMetricKey(datasetOptions.numeric[0]);
    } else {
      setMetricKey('');
    }
  }, [selectedDataset, datasetOptions]);

  // Generalized Aggregation calculation engine
  const customChartData = useMemo(() => {
    const data = datasets[selectedDataset];
    if (!data || data.length === 0) return [];

    const groups: Record<string, number[]> = {};

    data.forEach((item: any) => {
      let groupVal = item[groupByKey];
      
      if (Array.isArray(groupVal)) {
        if (groupVal.length === 0) {
          groupVal = 'None';
        } else {
          groupVal.forEach(val => {
            const groupStr = String(val);
            if (!groups[groupStr]) groups[groupStr] = [];
            const metricVal = item[metricKey];
            if (typeof metricVal === 'number' && aggregateFn !== 'Count') {
              groups[groupStr].push(metricVal);
            } else {
              groups[groupStr].push(1);
            }
          });
          return;
        }
      }

      const groupStr = groupVal !== undefined && groupVal !== null ? String(groupVal) : 'N/A';
      if (!groups[groupStr]) {
        groups[groupStr] = [];
      }

      const metricVal = item[metricKey];
      if (typeof metricVal === 'number' && aggregateFn !== 'Count') {
        groups[groupStr].push(metricVal);
      } else {
        groups[groupStr].push(1);
      }
    });

    return Object.entries(groups).map(([name, values]) => {
      let value = 0;
      if (aggregateFn === 'Count') {
        value = values.length;
      } else if (aggregateFn === 'Sum') {
        value = values.reduce((sum, v) => sum + v, 0);
      } else if (aggregateFn === 'Min') {
        value = values.length > 0 ? Math.min(...values) : 0;
      } else if (aggregateFn === 'Max') {
        value = values.length > 0 ? Math.max(...values) : 0;
      } else {
        const sum = values.reduce((sum, v) => sum + v, 0);
        value = values.length > 0 ? Math.round((sum / values.length) * 1000) / 1000 : 0;
      }

      return { name, value };
    }).sort((a, b) => b.value - a.value);
  }, [selectedDataset, groupByKey, metricKey, aggregateFn, datasets]);

  // Sorting handlers for tables
  const sortedTeams = useMemo(() => {
    const sortVal = (t: Team, col: typeof teamsSort.col) => {
      if (col === 'velocity') return getVelocityValue(t);
      if (col === 'membersCount') return t.members.length;
      if (col === 'submissionsCount') return t.submissions.length;
      if (col === 'points') return t.points || 0;
      return t[col as keyof Team] as number | string;
    };
    return [...filteredTeams].sort((a, b) => {
      const valA = sortVal(a, teamsSort.col);
      const valB = sortVal(b, teamsSort.col);
      if (typeof valA === 'string' && typeof valB === 'string') {
        return teamsSort.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return teamsSort.asc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [filteredTeams, teamsSort]);

  const sortedStudents = useMemo(() => {
    return [...allStudents].sort((a, b) => {
      const valA = a[studentsSort.col as keyof typeof a] || '';
      const valB = b[studentsSort.col as keyof typeof b] || '';
      if (typeof valA === 'string' && typeof valB === 'string') {
        return studentsSort.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });
  }, [allStudents, studentsSort]);

  const sortedSubmissions = useMemo(() => {
    return [...allSubmissions].sort((a, b) => {
      const valA = a[submissionsSort.col as keyof typeof a] || '';
      const valB = b[submissionsSort.col as keyof typeof b] || '';
      if (typeof valA === 'string' && typeof valB === 'string') {
        return submissionsSort.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return submissionsSort.asc ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [allSubmissions, submissionsSort]);

  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      const valA = a[requestsSort.col] || '';
      const valB = b[requestsSort.col] || '';
      if (typeof valA === 'string' && typeof valB === 'string') {
        return requestsSort.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });
  }, [filteredRequests, requestsSort]);

  // CSV Export Triggers
  const handleExportTeams = () => {
    const headers = ['Rank', 'Team Name', 'College', 'Track', 'Members Count', 'Progress %', 'Collaboration Score', 'Submissions Count', 'Velocity'];
    const rows = sortedTeams.map((t, idx) => [
      idx + 1,
      t.name,
      t.college,
      t.track,
      t.members.length,
      t.progress,
      t.collaborationScore,
      t.submissions.length,
      getVelocityValue(t)
    ]);
    downloadCSV(headers, rows, 'all_teams_report.csv');
  };

  const handleExportStudents = () => {
    const headers = ['Name', 'Email', 'College', 'Role', 'Skills', 'Team Name', 'Track', 'Status'];
    const rows = sortedStudents.map(s => [
      s.fullName,
      s.email,
      s.college || 'N/A',
      s.role,
      s.skills.join('; '),
      s.teamName,
      s.track,
      s.status
    ]);
    downloadCSV(headers, rows, 'students_roster_report.csv');
  };

  const handleExportSubmissions = () => {
    const headers = ['Team Name', 'Track', 'College', 'Submitted At', 'GitHub URL', 'Demo URL', 'File Name', 'Judge Score', 'Weighted Score', 'Faculty Status'];
    const rows = sortedSubmissions.map(s => [
      s.teamName,
      s.track,
      s.college,
      s.submittedAt,
      s.githubUrl,
      s.demoUrl,
      s.presentationFile,
      s.score ?? 'N/A',
      s.weightedScore ?? 'N/A',
      s.facultyStatus ?? 'pending'
    ]);
    downloadCSV(headers, rows, 'submissions_report.csv');
  };

  const handleExportRequests = () => {
    const headers = ['Request ID', 'Team Name', 'Challenge Track', 'Request Type', 'Priority', 'Status', 'Assigned Mentor', 'Created At'];
    const rows = sortedRequests.map(r => [
      r.id,
      r.teamName,
      r.challengeTitle,
      r.type,
      r.priority,
      r.status,
      r.mentorName || 'Unassigned',
      r.createdAt
    ]);
    downloadCSV(headers, rows, 'mentor_requests_report.csv');
  };

  const handleExportAllJSON = () => {
    const fullData = {
      allTeams,
      challenges,
      mentors,
      mentorRequests,
      exportedAt: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(fullData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `abb_platform_full_export_${Date.now()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('JSON Backup Triggered', 'Successfully downloaded full platform JSON backup.', 'success');
  };

  const colors = ['#ff000f', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6 text-left font-satoshi p-4 sm:p-6 lg:p-8 overflow-y-auto">
      
      {/* Overview/Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/10 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase text-primary tracking-widest">
            Telemetry & Data Aggregations
          </span>
          <h2 className="text-xl font-black text-foreground mt-0.5">
            Admin Analytics Command Room
          </h2>
          <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
            Real-time analytics engine processing checkpoints, support queues, and academic achievements.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportAllJSON}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#151515] border border-border/10 hover:border-border/30 rounded-xl text-xs font-bold text-foreground hover:bg-[#1a1a1a] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Raw JSON
          </button>
        </div>
      </div>

      {/* Pinned/Monitored Teams Section */}
      {pinnedTeams.length > 0 && (
        <div className="bg-[#0b0b0b] border border-primary/25 rounded-3xl p-6 space-y-4 shadow-[0_4px_30px_rgba(255,0,15,0.05)]">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-primary fill-primary animate-pulse" />
            <h3 className="text-sm font-extrabold uppercase text-foreground tracking-wider">
              Monitored Teams Roster ({pinnedTeams.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedTeams.map(t => {
              const pendingCount = mentorRequests.filter(r => r.teamId === t.id && r.status !== 'resolved').length;
              const isStuck = isTeamStuck(t);
              return (
                <div key={t.id} className={`bg-[#121212] border rounded-2xl p-4 flex flex-col justify-between transition-all ${isStuck ? 'border-red-500/40 hover:border-red-500/60 shadow-[0_4px_15px_rgba(239,68,68,0.1)]' : 'border-border/10 hover:border-border/25'}`}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-extrabold text-foreground">{t.name}</h4>
                        <span className="text-[10px] text-muted-foreground/60 block font-semibold truncate max-w-[200px]">{t.college}</span>
                      </div>
                      <button
                        onClick={() => togglePinTeam(t.id)}
                        className="p-1 hover:bg-white/5 rounded-lg text-primary transition-all cursor-pointer"
                        title="Unpin Team"
                      >
                        <PinOff className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-muted-foreground font-medium">Track:</span>
                      <span className="font-bold text-foreground">{t.track}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="text-foreground">{t.progress}%</span>
                      </div>
                      <div className="w-full bg-[#1c1c1c] h-1.5 rounded-full overflow-hidden">
                        <div className={`h-1.5 rounded-full ${isStuck ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${t.progress}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-[11px] font-bold">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Velocity:</span>
                      <span className="text-foreground">{getVelocityLabel(t)} ({getVelocityValue(t)}% / day)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Tickets:</span>
                      <span className={`px-1.5 py-0.5 rounded-md ${pendingCount >= 2 ? 'bg-red-500/10 text-red-500' : pendingCount === 1 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {pendingCount} Pending
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { id: 1, val: kpis.totalStudents, desc: 'Students Registered', icon: Users, color: 'text-primary' },
          { id: 2, val: kpis.activeTeams, desc: 'Active Innovation Teams', icon: FolderGit, color: 'text-blue-500' },
          { id: 3, val: `${kpis.submissionRate}%`, desc: 'Submission Completion Rate', icon: CheckSquare, color: 'text-emerald-400' },
          { id: 4, val: kpis.stuckTeams, desc: 'Stuck Teams Detected', icon: AlertCircle, color: kpis.stuckTeams > 0 ? 'text-red-500' : 'text-muted-foreground' },
          { id: 5, val: `${kpis.avgScore}/100`, desc: 'Average Judge Grade', icon: Star, color: 'text-amber-400' },
          { id: 6, val: kpis.mentorSessions, desc: 'Active Mentor Sessions', icon: Calendar, color: 'text-violet-400' },
          { id: 7, val: kpis.hottestTrack, desc: 'Hottest Track Segment', icon: TrendingUp, color: 'text-fuchsia-400' },
          { id: 8, val: `${kpis.avgVelocity}% / day`, desc: 'Average Roster Velocity', icon: BarChart3, color: 'text-cyan-400' }
        ].map(card => (
          <div key={card.id} className="rounded-2xl border border-border/40 bg-card p-4 relative overflow-hidden flex items-center gap-3">
            <div className="p-2 rounded-xl bg-muted/5 border border-border/10 text-muted-foreground shrink-0">
              <card.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 text-left">
              <div className={`text-base sm:text-lg font-extrabold text-foreground tracking-tight ${card.color}`}>
                {card.val}
              </div>
              <span className="text-[9px] text-muted-foreground/60 font-semibold uppercase tracking-wider block mt-0.5 truncate">
                {card.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Settings Row */}
      <div className="flex flex-col gap-4">
        
        {/* Filters Panel */}
        <div className="bg-[#111111] border border-border/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="w-full px-6 py-3 flex justify-between items-center bg-[#151515] hover:bg-[#181818] transition-colors cursor-pointer"
          >
            <span className="text-xs font-black uppercase text-foreground flex items-center gap-2 tracking-wider">
              <Filter className="w-4 h-4 text-primary" />
              Dynamic Calculations Filter Bar
            </span>
            {isFilterExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          {isFilterExpanded && (
            <div className="p-6 border-t border-border/5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#111] font-sans">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Real-Time Search</label>
                <div className="relative mt-1.5">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground/45" />
                  <input
                    type="text"
                    placeholder="Search teams, colleges, members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#181818] border border-border/15 rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/45 focus:border-primary/50 outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Filter by Track</label>
                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  className="w-full bg-[#181818] border border-border/15 rounded-xl px-3 py-2 text-xs text-foreground focus:border-primary/50 outline-none mt-1.5 transition-colors"
                >
                  <option value="All">All Tracks</option>
                  <option value="Energy Systems">Energy Systems</option>
                  <option value="Robotics">Robotics</option>
                  <option value="Sustainability">Sustainability</option>
                  <option value="E-Operations">E-Operations</option>
                  <option value="AI">AI</option>
                  <option value="IoT">IoT</option>
                  <option value="Edge AI">Edge AI</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Filter by College</label>
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="w-full bg-[#181818] border border-border/15 rounded-xl px-3 py-2 text-xs text-foreground focus:border-primary/50 outline-none mt-1.5 transition-colors"
                >
                  <option value="All">All Colleges</option>
                  {collegesList.map((col, idx) => (
                    <option key={idx} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Graph settings */}
        <div className="bg-[#111111] border border-border/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
            className="w-full px-6 py-3 flex justify-between items-center bg-[#151515] hover:bg-[#181818] transition-colors cursor-pointer"
          >
            <span className="text-xs font-black uppercase text-foreground flex items-center gap-2 tracking-wider">
              <Settings className="w-4 h-4 text-primary" />
              Graph Visualizer Toggles
            </span>
            {isSettingsExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          {isSettingsExpanded && (
            <div className="p-6 border-t border-border/5 bg-[#111] font-sans">
              <p className="text-xs text-muted-foreground mb-4">Toggle graphs ON/OFF to configure your telemetry control view:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { id: 1, label: '1. Upgrades & Points curves' },
                  { id: 2, label: '2. Track Enrollment Densities' },
                  { id: 3, label: '3. Conversion Funnel' },
                  { id: 4, label: '4. Badges Summary Distribution' },
                  { id: 5, label: '5. Support Tickets Priority' },
                  { id: 6, label: '6. Team Impediment Mapping' },
                  { id: 7, label: '7. Daily Checkpoint Velocity' },
                  { id: 8, label: '8. Collaboration vs Progress' },
                  { id: 9, label: '9. Mentor Effectiveness' },
                  { id: 10, label: '10. College Comparison Radar' }
                ].map(item => (
                  <label key={item.id} className="flex items-center gap-2.5 bg-[#181818] border border-border/10 rounded-xl p-2.5 hover:border-border/30 cursor-pointer select-none transition-all">
                    <input
                      type="checkbox"
                      checked={visibleCharts[item.id]}
                      onChange={() => setVisibleCharts(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                      className="accent-primary rounded"
                    />
                    <span className="text-xs font-bold text-foreground">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section C: Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart 1 */}
        {visibleCharts[1] && (
          <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl shadow-sm text-left">
            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase">1. Upgrades & Points Acceleration</h4>
              <span className="text-[10px] text-muted-foreground/50 block font-semibold mt-0.5">Accumulated points growth per team across Round 1, 2, and 3</span>
            </div>
            <div className="h-[250px] w-full">
              {pointsGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pointsGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                    {filteredTeams.map((team, idx) => (
                      <Line
                        key={team.id}
                        type="monotone"
                        dataKey={team.name}
                        stroke={colors[idx % colors.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No data matches current filters.</div>
              )}
            </div>
          </div>
        )}

        {/* Chart 2 */}
        {visibleCharts[2] && (
          <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl shadow-sm">
            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase">2. Track Enrollment Densities</h4>
              <span className="text-[10px] text-muted-foreground/50 block font-semibold mt-0.5">Distribution of active teams and members per sector</span>
            </div>
            <div className="h-[250px] w-full">
              {trackPopularityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trackPopularityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="track" stroke="#666" fontSize={9} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                    <Bar dataKey="teams" name="Teams Count" fill="#ff000f" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="students" name="Students Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No data matches current filters.</div>
              )}
            </div>
          </div>
        )}

        {/* Chart 3 */}
        {visibleCharts[3] && (
          <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl shadow-sm">
            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase">3. Submission Conversion Funnel</h4>
              <span className="text-[10px] text-muted-foreground/50 block font-semibold mt-0.5">Conversion flow from registration through faculty endorsement</span>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis type="number" stroke="#666" fontSize={10} />
                  <YAxis dataKey="stage" type="category" stroke="#666" fontSize={9} width={110} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Total Count" fill="#10b981" radius={[0, 4, 4, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#059669'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Chart 4 */}
        {visibleCharts[4] && (
          <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl shadow-sm text-left">
            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase">4. Badges Summary Distribution</h4>
              <span className="text-[10px] text-muted-foreground/50 block font-semibold mt-0.5">Distribution of achievement badges earned across all teams</span>
            </div>
            <div className="h-[250px] w-full">
              {badgeSummaryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={badgeSummaryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Badges Awarded" fill="#ff000f" radius={[4, 4, 0, 0]}>
                      {badgeSummaryData.map((entry, index) => {
                        const badgeColors = ['#eab308', '#3b82f6', '#a855f7', '#22c55e', '#ef4444'];
                        return <Cell key={`cell-${index}`} fill={badgeColors[index % badgeColors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No badges awarded yet.</div>
              )}
            </div>
          </div>
        )}

        {/* Chart 5 */}
        {visibleCharts[5] && (
          <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl shadow-sm">
            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase">5. Support Tickets by Severity</h4>
              <span className="text-[10px] text-muted-foreground/50 block font-semibold mt-0.5">Stacked volumes of mentor requests by priority rating</span>
            </div>
            <div className="h-[250px] w-full">
              {requestVolumeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={requestVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="track" stroke="#666" fontSize={9} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                    <Bar dataKey="Low" stackId="a" fill="#64748b" />
                    <Bar dataKey="Medium" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="High" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="Urgent" stackId="a" fill="#ff000f" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No data matches current filters.</div>
              )}
            </div>
          </div>
        )}

        {/* Chart 6 */}
        {visibleCharts[6] && (
          <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl shadow-sm">
            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase">6. Team Impediment Mapping</h4>
              <span className="text-[10px] text-muted-foreground/50 block font-semibold mt-0.5">Stalled progress mapped against pending support tickets</span>
            </div>
            <div className="h-[250px] w-full">
              {stuckTeamScatterData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                    <CartesianGrid stroke="#222" />
                    <XAxis type="number" dataKey="progress" name="Progress" unit="%" stroke="#666" fontSize={10} />
                    <YAxis type="number" dataKey="requests" name="Pending Requests" stroke="#666" fontSize={10} allowDecimals={false} />
                    <ZAxis type="number" dataKey="size" range={[50, 400]} name="Members" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                    <Scatter name="Teams" data={stuckTeamScatterData}>
                      {stuckTeamScatterData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.status === 'stuck' ? '#ff000f' : entry.status === 'watch' ? '#f59e0b' : '#10b981'} 
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No data matches current filters.</div>
              )}
            </div>
          </div>
        )}

        {/* Chart 7 */}
        {visibleCharts[7] && (
          <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl shadow-sm">
            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase">7. Checkpoint Velocity Metrics</h4>
              <span className="text-[10px] text-muted-foreground/50 block font-semibold mt-0.5">Average progress percentage increase per dashboard check-in</span>
            </div>
            <div className="h-[250px] w-full">
              {velocityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={velocityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} />
                    <YAxis stroke="#666" fontSize={10} label={{ value: '% / day', angle: -90, position: 'insideLeft', fill: '#666' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="velocity" name="Daily Velocity" fill="#ff000f" radius={[4, 4, 0, 0]}>
                      {velocityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.velocity > 15 ? '#10b981' : entry.velocity > 5 ? '#3b82f6' : '#ff000f'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No data matches current filters.</div>
              )}
            </div>
          </div>
        )}

        {/* Chart 8 */}
        {visibleCharts[8] && (
          <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl shadow-sm">
            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase">8. Engagement vs Acceleration</h4>
              <span className="text-[10px] text-muted-foreground/50 block font-semibold mt-0.5">Correlation mapping between collaboration score and progress</span>
            </div>
            <div className="h-[250px] w-full">
              {collabVsProgressData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                    <CartesianGrid stroke="#222" />
                    <XAxis type="number" dataKey="collab" name="Collab Score" unit="%" stroke="#666" fontSize={10} />
                    <YAxis type="number" dataKey="progress" name="Progress" unit="%" stroke="#666" fontSize={10} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                    <Scatter name="Teams" data={collabVsProgressData} fill="#ff000f" />
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No data matches current filters.</div>
              )}
            </div>
          </div>
        )}

        {/* Chart 9 */}
        {visibleCharts[9] && (
          <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl shadow-sm">
            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase">9. Mentor Activity & Effectiveness</h4>
              <span className="text-[10px] text-muted-foreground/50 block font-semibold mt-0.5">Resolved requests count vs team progress velocity increase</span>
            </div>
            <div className="h-[250px] w-full">
              {mentorEffectivenessData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mentorEffectivenessData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="name" stroke="#666" fontSize={8} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                    <Bar dataKey="sessions" name="Dealt Requests" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgProgressGain" name="Avg Team Progress Gain" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No data matches current filters.</div>
              )}
            </div>
          </div>
        )}

        {/* Chart 10 */}
        {visibleCharts[10] && (
          <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl shadow-sm">
            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase">10. College Hub Comparison</h4>
              <span className="text-[10px] text-muted-foreground/50 block font-semibold mt-0.5">Performance averages mapped across active academic institutions</span>
            </div>
            <div className="h-[250px] w-full">
              {collegeAnalyticsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={collegeAnalyticsData}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis dataKey="college" stroke="#666" fontSize={8} />
                    <Radar name="Avg Progress" dataKey="avgProgress" stroke="#ff000f" fill="#ff000f" fillOpacity={0.2} />
                    <Radar name="Submission Rate" dataKey="submissionRate" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                    <Radar name="Avg Score" dataKey="avgScore" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No data matches current filters.</div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Custom Analytics Builder Component */}
      <div className="bg-[#111111] border border-border/10 p-6 rounded-3xl space-y-6 shadow-sm">
        <div>
          <h4 className="text-sm font-black uppercase text-foreground">Custom Ad-hoc Analytics Builder</h4>
          <p className="text-[10px] text-muted-foreground/60 font-semibold mt-0.5 font-sans">
            Build custom chart views by combining dimensions, aggregates, and rendering styles.
          </p>
        </div>

        {/* Builder controls */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 bg-[#161616] p-4 rounded-2xl font-sans">
          
          {/* 1. Dataset */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase">1. Dataset</label>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value as any)}
              className="w-full bg-[#202020] border border-border/15 rounded-xl px-3 py-2 text-xs text-foreground focus:border-primary/50 outline-none mt-1.5"
            >
              <option value="Teams">Teams</option>
              <option value="Students">Students</option>
              <option value="Submissions">Submissions</option>
              <option value="Requests">Tickets Queue</option>
              <option value="Challenges">Challenges</option>
            </select>
          </div>

          {/* 2. Group By */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase">2. Group By (X-Axis)</label>
            <select
              value={groupByKey}
              onChange={(e) => setGroupByKey(e.target.value)}
              className="w-full bg-[#202020] border border-border/15 rounded-xl px-3 py-2 text-xs text-foreground focus:border-primary/50 outline-none mt-1.5"
            >
              {datasetOptions.groupable.map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
              {datasetOptions.groupable.length === 0 && (
                <option value="">No string keys</option>
              )}
            </select>
          </div>

          {/* 3. Metric */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase">3. Metric Key (Y-Axis)</label>
            <select
              value={metricKey}
              onChange={(e) => setMetricKey(e.target.value)}
              className="w-full bg-[#202020] border border-border/15 rounded-xl px-3 py-2 text-xs text-foreground focus:border-primary/50 outline-none mt-1.5"
            >
              {datasetOptions.numeric.map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
              <option value="">(Count Record Only)</option>
            </select>
          </div>

          {/* 4. Aggregation */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase">4. Operation</label>
            <select
              value={aggregateFn}
              onChange={(e) => setAggregateFn(e.target.value as any)}
              className="w-full bg-[#202020] border border-border/15 rounded-xl px-3 py-2 text-xs text-foreground focus:border-primary/50 outline-none mt-1.5"
            >
              <option value="Average">Average</option>
              <option value="Sum">Sum</option>
              <option value="Min">Minimum</option>
              <option value="Max">Maximum</option>
              <option value="Count">Count of Items</option>
            </select>
          </div>

          {/* 5. Rendering */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase">5. Chart Type</label>
            <select
              value={customChartType}
              onChange={(e) => setCustomChartType(e.target.value as any)}
              className="w-full bg-[#202020] border border-border/15 rounded-xl px-3 py-2 text-xs text-foreground focus:border-primary/50 outline-none mt-1.5"
            >
              <option value="Bar">Bar Chart</option>
              <option value="Line">Line Graph</option>
              <option value="Area">Area Chart</option>
              <option value="Pie">Pie Chart</option>
              <option value="Scatter">Scatter Plot</option>
            </select>
          </div>
        </div>

        {/* Builder Chart Display Area */}
        <div className="h-[300px] w-full border border-border/5 bg-[#151515]/40 rounded-2xl flex items-center justify-center p-4">
          {customChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {customChartType === 'Pie' ? (
                <PieChart>
                  <Pie
                    data={customChartData}
                    cx="50%"
                    cy="50%"
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#ff000f"
                    dataKey="value"
                  >
                    {customChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                </PieChart>
              ) : customChartType === 'Line' ? (
                <LineChart data={customChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="name" stroke="#666" fontSize={10} />
                  <YAxis stroke="#666" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                  <Line type="monotone" dataKey="value" name={`${aggregateFn} of ${metricKey || 'Records'}`} stroke="#ff000f" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              ) : customChartType === 'Area' ? (
                <AreaChart data={customChartData}>
                  <defs>
                    <linearGradient id="customColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff000f" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ff000f" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="name" stroke="#666" fontSize={10} />
                  <YAxis stroke="#666" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                  <Area type="monotone" dataKey="value" name={`${aggregateFn} of ${metricKey || 'Records'}`} stroke="#ff000f" fillOpacity={1} fill="url(#customColor)" strokeWidth={2.5} />
                </AreaChart>
              ) : customChartType === 'Scatter' ? (
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis type="category" dataKey="name" stroke="#666" fontSize={10} name="Category" />
                  <YAxis type="number" stroke="#666" fontSize={10} name="Value" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                  <Scatter name={`${aggregateFn} of ${metricKey || 'Records'}`} data={customChartData} fill="#ff000f" />
                </ScatterChart>
              ) : (
                <BarChart data={customChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="name" stroke="#666" fontSize={10} />
                  <YAxis stroke="#666" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                  <Bar dataKey="value" name={`${aggregateFn} of ${metricKey || 'Records'}`} fill="#ff000f" radius={[4, 4, 0, 0]}>
                    {customChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="text-xs text-muted-foreground font-sans">Select dimensions and metrics above to render a custom ad-hoc graph.</div>
          )}
        </div>
      </div>

      {/* Section D: Detailed Data Tables */}
      <div className="space-y-8 mt-8 border-t border-border/10 pt-8">
        
        {/* Table 1: All Teams Data Table */}
        <div className="bg-[#111111] border border-border/10 rounded-2xl overflow-hidden shadow-sm text-left">
          <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#151515] border-b border-border/5">
            <div>
              <h4 className="text-sm font-bold text-foreground">1. Team Roster Management Table</h4>
              <p className="text-[10px] text-muted-foreground/60 font-semibold mt-0.5">Aggregated checkpoints, colleges, and track metrics per team</p>
            </div>
            <button
              onClick={handleExportTeams}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#252525] border border-border/15 hover:border-border/30 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              Export Roster
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-muted-foreground">
              <thead className="text-[10px] font-bold text-muted-foreground uppercase bg-[#181818]/45 border-b border-border/5">
                <tr>
                  <th className="px-6 py-3 w-10 text-center">Pin</th>
                  <th className="px-6 py-3">Team Name</th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => setTeamsSort({ col: 'college', asc: !teamsSort.asc })}>College</th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => setTeamsSort({ col: 'track', asc: !teamsSort.asc })}>Track</th>
                  <th className="px-6 py-3 cursor-pointer text-center" onClick={() => setTeamsSort({ col: 'membersCount', asc: !teamsSort.asc })}>Members</th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => setTeamsSort({ col: 'progress', asc: !teamsSort.asc })}>Progress</th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => setTeamsSort({ col: 'collaborationScore', asc: !teamsSort.asc })}>Collab</th>
                  <th className="px-6 py-3 cursor-pointer text-center text-primary" onClick={() => setTeamsSort({ col: 'points', asc: !teamsSort.asc })}>Points</th>
                  <th className="px-6 py-3">Badges</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/5">
                {sortedTeams.map(team => {
                  const isPinned = pinnedTeamIds.includes(team.id);
                  return (
                    <tr key={team.id} className="hover:bg-white/[0.01]">
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => togglePinTeam(team.id)}
                          className={`p-1.5 rounded-lg border border-transparent hover:border-border/10 transition-all cursor-pointer ${isPinned ? 'text-primary' : 'text-muted-foreground/35 hover:text-foreground'}`}
                          title={isPinned ? 'Unpin Team' : 'Pin Team'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-primary' : ''}`} />
                        </button>
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">{team.name}</td>
                      <td className="px-6 py-4 truncate max-w-[150px]">{team.college}</td>
                      <td className="px-6 py-4">{team.track}</td>
                      <td className="px-6 py-4 text-center font-semibold">{team.members.length}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 w-16 bg-[#252525] rounded-full h-1.5 overflow-hidden">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${team.progress}%` }} />
                          </div>
                          <span className="font-semibold text-foreground">{team.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">{team.collaborationScore}%</td>
                      <td className="px-6 py-4 text-center font-extrabold text-primary font-mono">{team.points || 0} pts</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {team.badges && team.badges.length > 0 ? (
                            team.badges.map(badge => {
                              const emojis: Record<string, string> = {
                                "Pitch Master": "⭐",
                                "MVP Builder": "🚀",
                                "UIUX Wizard": "🎨",
                                "Stellar Growth": "📈",
                                "Overachiever": "👑"
                              };
                              return (
                                <span 
                                  key={badge} 
                                  title={badge} 
                                  className="inline-flex items-center justify-center text-[9px] bg-muted/40 rounded-full w-4 h-4 border border-border/10 cursor-help"
                                >
                                  {emojis[badge] || "🏅"}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-[10px] text-muted-foreground/35 italic">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {team.submissions.length > 0 ? (
                          <span className="inline-flex px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-md font-bold uppercase text-[9px]">
                            Submitted
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md font-bold uppercase text-[9px]">
                            Developing
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: All Students / Members Table */}
        <div className="bg-[#111111] border border-border/10 rounded-2xl overflow-hidden shadow-sm text-left">
          <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#151515] border-b border-border/5">
            <div>
              <h4 className="text-sm font-bold text-foreground">2. Student Directory</h4>
              <p className="text-[10px] text-muted-foreground/60 font-semibold mt-0.5">Directory list of all onboarded student profiles, roles, and competencies</p>
            </div>
            <button
              onClick={handleExportStudents}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#252525] border border-border/15 hover:border-border/30 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              Export Directory
            </button>
          </div>

          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-xs text-left text-muted-foreground">
              <thead className="text-[10px] font-bold text-muted-foreground uppercase bg-[#181818]/45 border-b border-border/5 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => setStudentsSort({ col: 'fullName', asc: !studentsSort.asc })}>Student Name</th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => setStudentsSort({ col: 'email', asc: !studentsSort.asc })}>Email Account</th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => setStudentsSort({ col: 'college', asc: !studentsSort.asc })}>College</th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => setStudentsSort({ col: 'teamName', asc: !studentsSort.asc })}>Affiliated Team</th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => setStudentsSort({ col: 'track', asc: !submissionsSort.asc })}>Track</th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => setStudentsSort({ col: 'role', asc: !studentsSort.asc })}>Core Role</th>
                  <th className="px-6 py-3">Key Skills</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/5">
                {sortedStudents.map(student => (
                  <tr key={student.id} className="hover:bg-white/[0.01]">
                    <td className="px-6 py-4 font-bold text-foreground">{student.fullName}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground/80">{student.email}</td>
                    <td className="px-6 py-4 truncate max-w-[120px]">{student.college || 'N/A'}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">{student.teamName}</td>
                    <td className="px-6 py-4 font-medium">{student.track}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-[#252525] border border-border/10 text-muted-foreground rounded text-[9px] font-bold uppercase">
                        {student.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {student.skills.map((s, idx) => (
                          <span key={idx} className="bg-primary/5 text-primary border border-primary/10 px-1.5 py-0.5 rounded text-[9px] font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 3: Submissions review Table */}
        <div className="bg-[#111111] border border-border/10 rounded-2xl overflow-hidden shadow-sm text-left">
          <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#151515] border-b border-border/5">
            <div>
              <h4 className="text-sm font-bold text-foreground">3. Innovation submissions dashboard</h4>
              <p className="text-[10px] text-muted-foreground/60 font-semibold mt-0.5">Code deliverables, presentation slides, and judge grades</p>
            </div>
            <button
              onClick={handleExportSubmissions}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#252525] border border-border/15 hover:border-border/30 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              Export Submissions
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-muted-foreground">
              <thead className="text-[10px] font-bold text-muted-foreground uppercase bg-[#181818]/45 border-b border-border/5">
                <tr>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => setSubmissionsSort({ col: 'teamName', asc: !submissionsSort.asc })}>Team</th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => setSubmissionsSort({ col: 'track', asc: !submissionsSort.asc })}>Track</th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => setSubmissionsSort({ col: 'college', asc: !submissionsSort.asc })}>College</th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => setSubmissionsSort({ col: 'submittedAt', asc: !submissionsSort.asc })}>Submitted At</th>
                  <th className="px-6 py-3">GitHub</th>
                  <th className="px-6 py-3">Live Demo</th>
                  <th className="px-6 py-3 cursor-pointer text-center" onClick={() => setSubmissionsSort({ col: 'score', asc: !submissionsSort.asc })}>Score</th>
                  <th className="px-6 py-3 text-right">Presentation Slide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/5">
                {sortedSubmissions.map(sub => {
                  const fullTeam = allTeams.find(t => t.id === sub.teamId);
                  return (
                    <tr key={sub.id} className="hover:bg-white/[0.01]">
                      <td className="px-6 py-4 font-bold text-foreground">{sub.teamName}</td>
                      <td className="px-6 py-4">{sub.track}</td>
                      <td className="px-6 py-4 truncate max-w-[120px]">{sub.college}</td>
                      <td className="px-6 py-4 font-mono text-muted-foreground/80">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <a href={sub.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline font-semibold">
                          Codebase <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <a href={sub.demoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline font-semibold">
                          Prototype <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-foreground">
                        {sub.score ?? 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            if (fullTeam) {
                              setActiveSubTeam({ submission: sub, team: fullTeam });
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/45 rounded-lg text-[10px] font-bold text-primary transition-all cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /> Inspect Slides
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 4: Mentor Requests Table */}
        <div className="bg-[#111111] border border-border/10 rounded-2xl overflow-hidden shadow-sm text-left">
          <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#151515] border-b border-border/5">
            <div>
              <h4 className="text-sm font-bold text-foreground">4. Mentor Support Request Queue</h4>
              <p className="text-[10px] text-muted-foreground/60 font-semibold mt-0.5">Tickets, technical bottlenecks, and resolution tracking metrics</p>
            </div>
            <button
              onClick={handleExportRequests}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#252525] border border-border/15 hover:border-border/30 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              Export Queue
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-muted-foreground">
              <thead className="text-[10px] font-bold text-muted-foreground uppercase bg-[#181818]/45 border-b border-border/5">
                <tr>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => setRequestsSort({ col: 'priority', asc: !requestsSort.asc })}>Severity</th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => setRequestsSort({ col: 'teamName', asc: !requestsSort.asc })}>Team</th>
                  <th className="px-6 py-3">Track / Topic</th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => setRequestsSort({ col: 'type', asc: !requestsSort.asc })}>Type</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Assigned Mentor</th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => setRequestsSort({ col: 'status', asc: !requestsSort.asc })}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/5">
                {sortedRequests.map(req => (
                  <tr key={req.id} className="hover:bg-white/[0.01]">
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
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
                    <td className="px-6 py-4 truncate max-w-[120px]">{req.challengeTitle}</td>
                    <td className="px-6 py-4 font-semibold">{req.type}</td>
                    <td className="px-6 py-4 truncate max-w-[180px]" title={req.description}>
                      {req.description}
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">{req.mentorName || 'Unassigned'}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Render the Presentation viewer overlay when triggered */}
      {activeSubTeam && (
        <PresentationViewerModal
          submission={activeSubTeam.submission}
          team={activeSubTeam.team}
          role="admin"
          onClose={() => setActiveSubTeam(null)}
        />
      )}

    </div>
  );
}
