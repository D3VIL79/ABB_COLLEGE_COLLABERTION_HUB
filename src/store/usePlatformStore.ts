import { create } from 'zustand';

export type UserRole = 'guest' | 'student' | 'staff' | 'judge' | 'mentor' | 'admin';

export interface Profile {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  year: string;
  skills: string[];
  resumeUploaded: boolean;
  collegeIdUploaded: boolean;
  profileStrength: number; // 0 to 100
  linkedin?: string;
  github?: string;
  portfolio?: string;
  bio?: string;
  certificates: Certificate[];
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
}

export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  role: 'Leader' | 'Developer' | 'Designer' | 'Researcher' | 'Presenter' | 'Analyst';
  skills: string[];
  status: 'active' | 'invited' | 'pending';
  college?: string;
  year?: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  track: string;
  challengeId: string;
  members: TeamMember[];
  progress: number; // 0 to 100
  submissions: Submission[];
  collaborationScore: number;
  progressHistory: { date: string; progress: number; note?: string }[];
  college: string;
  assignedMentorId?: string;
  assignedMentorName?: string;
  proposedFeatures?: { id: string; name: string; description: string; implemented: boolean; round: number }[];
  mentorEvaluations?: {
    round: number;
    mentorName: string;
    scores: { criteria: string; score: number }[];
    checklistRemarks: { featureName: string; implemented: boolean; score: number }[];
    comment: string;
    pointsEarned: number;
    submittedAt: string;
  }[];
  badges?: string[];
  points?: number; // Total points from evaluations
  previousPoints?: number; // Points from previous rounds to track shift
}

export interface ProblemStatement {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  tags: string[];
  description: string;
  background: string;
  objectives: string[];
  requirements: string[];
  deliverables: string[];
  evaluationCriteria: { criteria: string; weight: number }[];
}

export interface Challenge {
  id: string;
  title: string;
  track: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  tags: string[];
  description: string;
  background: string;
  objectives: string[];
  requirements: string[];
  deliverables: string[];
  evaluationCriteria: { criteria: string; weight: number }[];
  resources: { name: string; type: 'document' | 'video' | 'dataset' | 'code'; url: string }[];
  mentors: string[]; // Mentor names
  participantsCount: number;
  bookmarked?: boolean;
  problemStatements?: ProblemStatement[];
  maxCapacity?: number;
  status?: 'active' | 'paused' | 'closed';
}

export interface Submission {
  id: string;
  teamId: string;
  challengeId: string;
  submittedAt: string;
  githubUrl: string;
  demoUrl: string;
  description: string;
  presentationFile: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  score?: number;
  feedback?: {
    judgeName: string;
    scores: { criteria: string; score: number }[];
    comment: string;
  }[];
  weightedScore?: number;
  facultyNote?: string;
  facultyStatus?: 'pending' | 'endorsed' | 'flagged';
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  organization: string;
  expertise: string[];
  availability: string;
  linkedin: string;
  avatar: string;
}

export interface MentorRequest {
  id: string;
  teamId: string;
  teamName: string;
  challengeTitle: string;
  type: 'Technical' | 'Design' | 'Research' | 'Architecture' | 'Deployment' | 'General';
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  preferredTime: string;
  status: 'pending' | 'assigned' | 'resolved';
  mentorName?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'workshop' | 'session' | 'checkpoint' | 'deadline' | 'ceremony';
  description: string;
}

export interface Certificate {
  id: string;
  type: 'participation' | 'achievement' | 'award';
  title: string;
  issuedTo: string;
  issueDate: string;
  hash: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'mentor' | 'submission' | 'deadline' | 'certificate' | 'award';
  timestamp: string;
  read: boolean;
}

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface Phase {
  id: string;
  name: string;
  date: string;
  description: string;
}

export interface TwinAsset {
  id: string;
  name: string;
  floor: 1 | 2;
  temperature: number;
  occupancy: number;
  maxOccupancy: number;
  status: 'active' | 'idle' | 'warning';
  activeChallenge?: string;
}

interface PlatformState {
  role: UserRole;
  activeTab: string;
  selectedChallengeId: string | null;
  compareChallengeIds: string[];
  user: Profile;
  team: Team | null;
  challenges: Challenge[];
  allTeams: Team[];
  mentors: Mentor[];
  mentorRequests: MentorRequest[];
  calendarEvents: CalendarEvent[];
  notifications: NotificationItem[];
  twinAssets: TwinAsset[];
  countdownDate: string;
  phases: Phase[];
  activePhaseIndex: number;
  pinnedTeamIds: string[];
  evaluationRound: number;

  // Actions
  setRole: (role: UserRole) => void;
  setTab: (tab: string) => void;
  setSelectedChallengeId: (id: string | null) => void;
  toggleCompareChallenge: (id: string) => void;
  clearCompareChallenges: () => void;
  updateUserProfile: (updates: Partial<Profile>) => void;
  createTeam: (teamName: string, challengeId: string) => void;
  joinTeam: (code: string) => void;
  inviteMember: (email: string, role: TeamMember['role']) => void;
  removeMember: (memberId: string) => void;
  submitProject: (githubUrl: string, demoUrl: string, description: string, presentationFile: string) => void;
  gradeTeamSubmission: (teamId: string, submissionId: string, judgeName: string, scores: { criteria: string; score: number }[], comment: string, customFinalScore?: number) => void;
  updateTeamProgress: (teamId: string, progress: number, note?: string) => void;
  updateSubmissionFacultyNote: (submissionId: string, note: string, status: 'endorsed' | 'flagged') => void;
  requestMentor: (type: MentorRequest['type'], category: string, description: string, priority: MentorRequest['priority'], preferredTime: string) => void;
  assignMentor: (requestId: string, mentorName: string) => void;
  resolveMentorRequest: (requestId: string) => void;
  toggleChallengeBookmark: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  updateTwinAsset: (id: string, updates: Partial<TwinAsset>) => void;
  addNotification: (title: string, content: string, type: NotificationItem['type']) => void;
  addCalendarEvent: (title: string, start: string, end: string, type: CalendarEvent['type'], description: string) => void;
  addChallenge: (challenge: Omit<Challenge, 'participantsCount' | 'bookmarked'>) => void;
  deleteChallenge: (id: string) => void;
  updateChallengeProblemStatements: (challengeId: string, problemStatements: ProblemStatement[]) => void;
  setCountdownDate: (date: string) => void;
  setActivePhaseIndex: (index: number) => void;
  addPhase: (name: string, date: string, description: string) => void;
  updatePhase: (id: string, name: string, date: string, description: string) => void;
  deletePhase: (id: string) => void;
  togglePinTeam: (teamId: string) => void;
  setEvaluationRound: (round: number) => void;
  assignMentorToTeam: (teamId: string, mentorId: string) => void;
  updateProposedFeatures: (teamId: string, features: NonNullable<Team['proposedFeatures']>) => void;
  submitMentorEvaluation: (
    teamId: string,
    round: number,
    mentorName: string,
    scores: { criteria: string; score: number }[],
    checklistRemarks: { featureName: string; implemented: boolean; score: number }[],
    comment: string,
    progress: number
  ) => void;
  toasts: ToastItem[];
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const usePlatformStore = create<PlatformState>((set) => ({
  role: 'guest',
  activeTab: 'home',
  selectedChallengeId: null,
  toasts: [],
  addToast: (title, message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, title, message, type }]
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }));
    }, 4000);
  },
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),
  countdownDate: '2026-07-21T09:00:00+05:30',
  activePhaseIndex: 0,
  evaluationRound: 1,
  phases: [
    {
      id: 'p-1',
      date: 'July 22, 2026',
      name: 'Opening Ceremony & Keynote',
      description: 'Platform launch, welcome address from ABB leadership, and innovation challenge briefing.'
    },
    {
      id: 'p-2',
      date: 'July 22, 2026',
      name: 'Team Formation & Ideation',
      description: 'Form your teams, select your challenge track, and begin the brainstorming sprint.'
    },
    {
      id: 'p-3',
      date: 'July 23, 2026',
      name: 'Workshops & Mentor Sessions',
      description: 'Attend hands-on workshops on Smart Grids, Robotics, Edge AI, and Sustainability.'
    },
    {
      id: 'p-4',
      date: 'July 24, 2026',
      name: 'Checkpoint Review',
      description: 'Present your project architecture and progress to mentors for mid-event feedback.'
    },
    {
      id: 'p-5',
      date: 'July 25, 2026',
      name: 'Final Submissions Due',
      description: 'Submit your code repositories, demo videos, and presentation decks by 23:59 IST.'
    },
    {
      id: 'p-6',
      date: 'July 26, 2026',
      name: 'Demo Day & Awards Ceremony',
      description: 'Top teams present live demos. Winners announced and prizes awarded by ABB executives.'
    }
  ],
  compareChallengeIds: [],

  user: {
    firstName: 'Om',
    lastName: 'Zambare',
    fullName: 'Om Zambare',
    email: 'om.zambare@college.edu',
    phone: '+1 (555) 019-2834',
    college: 'ABB Engineering Institute',
    branch: 'Robotics and Automation',
    year: '4th Year',
    skills: ['React', 'TypeScript', 'Node.js', 'Python'],
    resumeUploaded: false,
    collegeIdUploaded: false,
    profileStrength: 45,
    certificates: [],
    notifications: {
      email: true,
      push: true,
      sms: false,
      inApp: true,
    }
  },

  team: {
    id: 't-01',
    name: 'CyberPulse',
    code: 'ABB-CPLSE-98',
    track: 'Energy Systems',
    challengeId: 'ch-01',
    progress: 65,
    collaborationScore: 92,
    college: 'ABB Engineering Institute',
    assignedMentorId: 'men-02',
    assignedMentorName: 'Elena Rostova',
    points: 85,
    previousPoints: 0,
    badges: ['Pitch Master'],
    proposedFeatures: [
      { id: 'f-1', name: 'Real-time Solar Generation Tracker', description: 'Tracks localized solar irradiance and battery load.', implemented: true, round: 1 },
      { id: 'f-2', name: 'Smart Load Balancer Engine', description: 'Algorithmic reinforcement solver to distribute batteries.', implemented: true, round: 2 },
      { id: 'f-3', name: 'Interactive Grid Topology Map', description: 'SVG based visualization of microgrid distribution hubs.', implemented: false, round: 3 }
    ],
    mentorEvaluations: [
      {
        round: 1,
        mentorName: 'Elena Rostova',
        scores: [
          { criteria: 'Core Idea & PPT', score: 92 },
          { criteria: 'Feature Set Completeness', score: 85 },
          { criteria: 'Unique Value Proposition', score: 88 }
        ],
        checklistRemarks: [
          { featureName: 'Real-time Solar Generation Tracker', implemented: true, score: 10 }
        ],
        comment: 'Excellent pitch. The weather forecasting API integration is a solid USP.',
        pointsEarned: 85,
        submittedAt: '2026-06-22T14:30:00Z'
      }
    ],
    progressHistory: [
      { date: '2026-06-22T09:00:00Z', progress: 15, note: 'Team registration and brainstorming' },
      { date: '2026-06-22T15:00:00Z', progress: 30, note: 'Architecture diagram finalized' },
      { date: '2026-06-23T10:00:00Z', progress: 50, note: 'Decentralized solver core completed' },
      { date: '2026-06-24T14:30:00Z', progress: 65, note: 'Framer Motion dashboard integrated' }
    ],
    submissions: [
      {
        id: 'sub-01',
        teamId: 't-01',
        challengeId: 'ch-01',
        submittedAt: '2026-06-17T14:30:00Z',
        githubUrl: 'https://github.com/cyberpulse/abb-grid',
        demoUrl: 'https://cyberpulse-grid.vercel.app',
        description: 'Decentralized microgrid simulator leveraging localized weather data and reinforcement learning logic to balance residential solar cell distribution.',
        presentationFile: 'cyberpulse_deck.pdf',
        status: 'pending',
        weightedScore: 78,
        facultyStatus: 'pending'
      }
    ],
    members: [
      { id: 'm-01', fullName: 'Sarah Connor', email: 's.connor@college.edu', role: 'Leader', skills: ['Python', 'AI'], status: 'active', college: 'ABB Engineering Institute', year: '3rd Year' },
      { id: 'm-02', fullName: 'John Doe', email: 'j.doe@college.edu', role: 'Developer', skills: ['React', 'TypeScript'], status: 'active', college: 'ABB Engineering Institute', year: '3rd Year' },
      { id: 'm-03', fullName: 'Elena Gilbert', email: 'e.gilbert@college.edu', role: 'Designer', skills: ['Figma', 'CSS'], status: 'active', college: 'ABB Engineering Institute', year: '3rd Year' },
      { id: 'm-stud', fullName: 'Om Zambare', email: 'om.zambare@college.edu', role: 'Developer', skills: ['React', 'TypeScript', 'Node.js', 'Python'], status: 'active', college: 'ABB Engineering Institute', year: '4th Year' }
    ]
  },

  challenges: [
    {
      id: 'ch-eops',
      title: 'Real-time Virtual Operations Control Center',
      track: 'E-Operations',
      difficulty: 'Advanced',
      tags: ['Shopfloor Telemetry', 'Dashboard', 'Line Balancing', 'Operations'],
      description: 'Design an interactive virtual control dashboard that collects live industrial telemetry to optimize energy efficiency, predict bottlenecks, and coordinate maintenance alerts dynamically across automated shop floors.',
      background: 'Modern automated shop floors generate massive amounts of machine state data. Without a unified dashboard to coordinate operations, lines experience delays, energy waste, and high response times to line stops.',
      objectives: [
        'Forecast line bottlenecks based on machine cycle counts.',
        'Optimize energy routing across heavy robotic arms.',
        'Simulate alert escalations for maintenance teams when lines stop.'
      ],
      requirements: [
        'Web dashboard showing real-time line throughput graphs.',
        'Operations dispatch logic reacting to simulated line stops.',
        'Integration with simulated MQTT telemetry brokers.'
      ],
      deliverables: [
        'Interactive operations control panel frontend.',
        'Tested bottleneck prediction algorithm script.',
        '3-minute project implementation video summary.'
      ],
      evaluationCriteria: [
        { criteria: 'Operations Optimization Efficiency', weight: 40 },
        { criteria: 'Dashboard User Experience and Polish', weight: 30 },
        { criteria: 'Technical Architecture & Scalability', weight: 20 },
        { criteria: 'Presentation Quality', weight: 10 }
      ],
      resources: [
        { name: 'ABB E-Ops Telemetry API Specs.pdf', type: 'document', url: '#' },
        { name: 'Conveyor Cycle Dataset.json', type: 'dataset', url: '#' }
      ],
      mentors: ['Dr. Marcus Vancamp', 'Elena Rostova'],
      participantsCount: 15,
      problemStatements: [
        {
          id: 'ps-eops-1',
          title: 'Real-time Virtual Operations Control Center',
          difficulty: 'Advanced',
          tags: ['Shopfloor Telemetry', 'Dashboard', 'Line Balancing', 'Operations'],
          description: 'Design an interactive virtual control dashboard that collects live industrial telemetry to optimize energy efficiency, predict bottlenecks, and coordinate maintenance alerts dynamically across automated shop floors.',
          background: 'Modern automated shop floors generate massive amounts of machine state data. Without a unified dashboard to coordinate operations, lines experience delays, energy waste, and high response times to line stops.',
          objectives: [
            'Forecast line bottlenecks based on machine cycle counts.',
            'Optimize energy routing across heavy robotic arms.',
            'Simulate alert escalations for maintenance teams when lines stop.'
          ],
          requirements: [
            'Web dashboard showing real-time line throughput graphs.',
            'Operations dispatch logic reacting to simulated line stops.',
            'Integration with simulated MQTT telemetry brokers.'
          ],
          deliverables: [
            'Interactive operations control panel frontend.',
            'Tested bottleneck prediction algorithm script.',
            '3-minute project implementation video summary.'
          ],
          evaluationCriteria: [
            { criteria: 'Operations Optimization Efficiency', weight: 40 },
            { criteria: 'Dashboard User Experience and Polish', weight: 30 },
            { criteria: 'Technical Architecture & Scalability', weight: 20 },
            { criteria: 'Presentation Quality', weight: 10 }
          ]
        },
        {
          id: 'ps-eops-2',
          title: 'Self-Healing Shopfloor Conveyor Routing',
          difficulty: 'Expert',
          tags: ['Routing Heuristics', 'Conveyor Control', 'AGV Coordination', 'Self-Healing'],
          description: 'Design a self-healing routing agent that detects localized conveyor mechanical failures and automatically re-routes production trays through alternative assembly lines or AGV tracks without human intervention.',
          background: 'Mechanical switch failures or package jams on sorting belts currently freeze entire assembly loops. Implementing dynamic routing heuristics at the edge can preserve throughput during disruptions.',
          objectives: [
            'Model a multi-path conveyor system as a directed graph.',
            'Identify node jams through simulated sensor status feeds.',
            'Perform dynamic path updates in under 100ms.'
          ],
          requirements: [
            'Visual network path editor showing carrier hops.',
            'Dynamic graph routing server implementing Dijkstra or A*.',
            'Interactive dashboard to manually block tracks and watch routes recalculate.'
          ],
          deliverables: [
            'Responsive routing mesh UI simulator.',
            'Graph calculation engine source code.',
            'Throughput improvement validation report.'
          ],
          evaluationCriteria: [
            { criteria: 'Re-routing Algorithm Optimality', weight: 40 },
            { criteria: 'Mesh Interactive UX and Controls', weight: 30 },
            { criteria: 'Robustness in Complex Jams', weight: 20 },
            { criteria: 'Code Cleanliness', weight: 10 }
          ]
        },
        {
          id: 'ps-eops-3',
          title: 'Energy-Aware Robotic Workload Balancer',
          difficulty: 'Advanced',
          tags: ['Power Management', 'Load Balancing', 'Workload Optimization', 'Smart Grids'],
          description: 'Architect a workload coordinator for automated manufacturing cells that balances the operating schedules of multiple heavy robotic arms, ensuring peak aggregate power draw remains below strict factory limits.',
          background: 'Robotic work cells drawing power simultaneously create demand spikes, leading to grid surcharges. Synchronizing cycles slightly can smooth power draws without affecting line speed.',
          objectives: [
            'Monitor real-time simulated current draws for 4 robotic arms.',
            'De-conflict cycle start signals to distribute electrical load.',
            'Optimize power scheduling based on production urgency parameters.'
          ],
          requirements: [
            'Robotic cycle Gantt chart overlay showing power peaks.',
            'Workload scheduler resolving power spikes.',
            'Integration with shopfloor power limit controls.'
          ],
          deliverables: [
            'Power telemetry dashboard UI.',
            'Coordinated scheduling algorithm scripts.',
            'Power shaving validation analysis.'
          ],
          evaluationCriteria: [
            { criteria: 'Peak Power Reduction Rate', weight: 45 },
            { criteria: 'Dashboard Analytics UX', weight: 25 },
            { criteria: 'Scheduling Logic Flexibility', weight: 20 },
            { criteria: 'Documentation Clarity', weight: 10 }
          ]
        },
        {
          id: 'ps-eops-4',
          title: 'Predictive AGV Dispatcher & Traffic Orchestrator',
          difficulty: 'Advanced',
          tags: ['Traffic Control', 'AGV Fleet', 'Predictive Dispatching', 'Deadlock Resolution'],
          description: 'Build a predictive fleet dispatcher that monitors warehouse AGV coordinates, forecasts pathway intersections to prevent deadlocks, and dispatch tasks to vehicles nearest to incoming part requests.',
          background: 'Automated guided vehicles often get stuck in head-to-head narrow corridor deadlocks, requiring manual resets. Predictive dispatching calculates path collision grids in advance.',
          objectives: [
            'Track spatial coordinates of 10 virtual AGVs.',
            'Detect head-on corridor conflict risks before they happen.',
            'Allocate requests based on vehicle battery, current task, and physical proximity.'
          ],
          requirements: [
            'Real-time 2D grid overlay of warehouse routes.',
            'Conflict solver engine returning reservation grids.',
            'CSV dispatch records tracking idle times.'
          ],
          deliverables: [
            'AGV fleet visual tracking screen.',
            'Orchestration backend codebase.',
            'Deadlock prevention scenario tests.'
          ],
          evaluationCriteria: [
            { criteria: 'Conflict/Deadlock Resolution Rate', weight: 40 },
            { criteria: 'Map Tracking Responsiveness', weight: 30 },
            { criteria: 'Fleet Average Waiting Time reduction', weight: 20 },
            { criteria: 'Presentation Quality', weight: 10 }
          ]
        }
      ]
    },
    {
      id: 'ch-prod',
      title: 'Dynamic Job-Shop Scheduling & Sequencing Optimizer',
      track: 'Production Planning',
      difficulty: 'Expert',
      tags: ['Job Scheduling', 'Operations Research', 'Queue Optimization', 'Algorithmic Planning'],
      description: 'Build a dynamic algorithmic planner that automatically schedules batch production runs, optimizes queue sequencing to minimize setup times, and responds instantly to supply chain disruptions or rush orders.',
      background: 'Job-shop sequencing is NP-hard. Machine changeover times represent a primary source of waste. An automated optimization tool is required to schedule tasks across parallel assembly lines dynamically.',
      objectives: [
        'Minimize machine makespan and job idle times.',
        'Incorporate changeover setup penalties dynamically.',
        'Allow interactive drag-and-drop manual schedule modifications.'
      ],
      requirements: [
        'Interactive Gantt chart scheduler canvas.',
        'Heuristic or constraint programming scheduling solver engine.',
        'CSV exports of optimized production sequence timetables.'
      ],
      deliverables: [
        'Scheduling engine front-end visualizer.',
        'Optimized sequencing algorithm source code.',
        'Design report and system logic flow diagram.'
      ],
      evaluationCriteria: [
        { criteria: 'Sequencing Algorithm Performance', weight: 45 },
        { criteria: 'Gantt Chart Interactive UX', weight: 25 },
        { criteria: 'System Architecture & Modularity', weight: 20 },
        { criteria: 'Documentation Clarity', weight: 10 }
      ],
      resources: [
        { name: 'Job Shop Heuristics Guide.pdf', type: 'document', url: '#' },
        { name: 'Sample Batch Orders Dataset.json', type: 'dataset', url: '#' }
      ],
      mentors: ['Kenji Sato', 'Raj Kumar'],
      participantsCount: 22,
      problemStatements: [
        {
          id: 'ps-prod-1',
          title: 'Dynamic Job-Shop Scheduling & Sequencing Optimizer',
          difficulty: 'Expert',
          tags: ['Job Scheduling', 'Operations Research', 'Queue Optimization', 'Algorithmic Planning'],
          description: 'Build a dynamic algorithmic planner that automatically schedules batch production runs, optimizes queue sequencing to minimize setup times, and responds instantly to supply chain disruptions or rush orders.',
          background: 'Job-shop sequencing is NP-hard. Machine changeover times represent a primary source of waste. An automated optimization tool is required to schedule tasks across parallel assembly lines dynamically.',
          objectives: [
            'Minimize machine makespan and job idle times.',
            'Incorporate changeover setup penalties dynamically.',
            'Allow interactive drag-and-drop manual schedule modifications.'
          ],
          requirements: [
            'Interactive Gantt chart scheduler canvas.',
            'Heuristic or constraint programming scheduling solver engine.',
            'CSV exports of optimized production sequence timetables.'
          ],
          deliverables: [
            'Scheduling engine front-end visualizer.',
            'Optimized sequencing algorithm source code.',
            'Design report and system logic flow diagram.'
          ],
          evaluationCriteria: [
            { criteria: 'Sequencing Algorithm Performance', weight: 45 },
            { criteria: 'Gantt Chart Interactive UX', weight: 25 },
            { criteria: 'System Architecture & Modularity', weight: 20 },
            { criteria: 'Documentation Clarity', weight: 10 }
          ]
        },
        {
          id: 'ps-prod-2',
          title: 'Supply-Chain Risk Resilience Scheduler',
          difficulty: 'Expert',
          tags: ['Risk Modeling', 'Resilient Scheduling', 'Supply Chain', 'Predictive Buffer'],
          description: 'Develop a production rescheduling assistant that monitors raw material supplier delivery alerts and dynamically updates shop floor schedules, shifting tasks to alternative parts when parts are delayed.',
          background: 'Late deliveries of components like semiconductors or customized chassis halt assembly runs, causing warehouse congestion. A planner must insert dynamic buffers based on risk probabilities.',
          objectives: [
            'Integrate incoming simulated API warnings for component delays.',
            'Calculate alternative job schedules matching current inventory constraints.',
            'Reduce idle machine setups during component outages.'
          ],
          requirements: [
            'Risk analytics screen showing machine status overlays.',
            'Material availability-constrained job shop scheduling engine.',
            'One-click schedule redistribution system.'
          ],
          deliverables: [
            'Risk-resilient schedule interface.',
            'Constraint-based solver model source code.',
            'Performance simulation comparison metrics.'
          ],
          evaluationCriteria: [
            { criteria: 'Schedule Resilience & Adaptation Speed', weight: 40 },
            { criteria: 'Supply Chain Alert UI/UX', weight: 30 },
            { criteria: 'Risk Metric Modeling Rigor', weight: 20 },
            { criteria: 'Pitch Presentation', weight: 10 }
          ]
        },
        {
          id: 'ps-prod-3',
          title: 'Setup Changeover Waste Minimizer',
          difficulty: 'Advanced',
          tags: ['Changeover Optimization', 'Sequence Dependent Setup', 'TSP Variant', 'Cost Shaving'],
          description: 'Create an algorithmic job sequencer that reviews a list of products to run on a paint-spray line, solving for the optimal order that minimizes color flushing cycles and chemical waste.',
          background: 'Switching colors (e.g. Red to White) requires purging nozzles, which is highly wasteful. Sequencing from light to dark colors minimizes flushing solvent and down time.',
          objectives: [
            'Compute setup penalty matrices based on color/material tags.',
            'Solve the Traveling Salesperson (TSP) sequence variant for incoming order list.',
            'Minimize aggregate wash-solvent liters used.'
          ],
          requirements: [
            'Batch order list input form with color/nozzle tags.',
            'TSP-variant heuristic solver engine.',
            'Sequence visualization charts comparing random order to optimized order.'
          ],
          deliverables: [
            'Interactive batch optimizer console.',
            'Color sequencing codebase.',
            'Flush-waste savings audit report.'
          ],
          evaluationCriteria: [
            { criteria: 'Waste Reduction & Efficiency Gain', weight: 50 },
            { criteria: 'Telemetry Charts UX', weight: 20 },
            { criteria: 'Solver Scalability (100+ Jobs)', weight: 20 },
            { criteria: 'Documentation Quality', weight: 10 }
          ]
        },
        {
          id: 'ps-prod-4',
          title: 'Multi-Warehouse Demand-Driven Inventory Coordinator',
          difficulty: 'Advanced',
          tags: ['Inventory Control', 'Demand Forecasting', 'Multi-Warehouse', 'Distribution Routing'],
          description: 'Design a coordinator that balances production output schedules against multi-warehouse stock levels and regional customer demand trends to prevent stockouts while keeping storage costs low.',
          background: 'Overproducing high-volume items creates severe storage overages in central factories, while regional nodes experience stockouts due to sluggish transport schedules.',
          objectives: [
            'Collect inventory status datasets from 3 regional nodes.',
            'Formulate optimal manufacturing batch quantities based on demand forecasts.',
            'Trigger automatic freight transfers when local safety stock drops.'
          ],
          requirements: [
            'Multi-node supply mapping screen.',
            'Inventory depletion solver forecasting 14 days out.',
            'Automated production order trigger system.'
          ],
          deliverables: [
            'Multi-node inventory dashboard layout.',
            'Depletion forecast package codebase.',
            'Supply loop simulation summary.'
          ],
          evaluationCriteria: [
            { criteria: 'Inventory Holding Cost Reduction', weight: 40 },
            { criteria: 'Map Visualization and UI Flow', weight: 30 },
            { criteria: 'Demand Forecasting Logic Accuracy', weight: 20 },
            { criteria: 'Presentation Quality', weight: 10 }
          ]
        }
      ]
    },
    {
      id: 'ch-qual',
      title: 'Computer Vision Defect Inspection & Analysis Pipeline',
      track: 'Quality Management',
      difficulty: 'Expert',
      tags: ['Computer Vision', 'Deep Learning', 'Defect Detection', 'Quality Control'],
      description: 'Develop a high-speed computer vision pipeline that analyzes manufactured parts on assembly conveyors to detect anomalies (micro-cracks, surface abrasions, dimensional deviations) and flag them in real-time.',
      background: 'Manual inspection is error-prone. Computer vision models at the edge can inspect parts in milliseconds, logging defects instantly and stopping bad parts from shipping.',
      objectives: [
        'Classify defects (scratch, dent, crack, normal) on raw product feeds.',
        'Calculate defect frequency statistics in real-time.',
        'Trigger conveyor stopper alarms when defect rates exceed safety limits.'
      ],
      requirements: [
        'Inspection panel showing live image stream and bounding boxes.',
        'Edge-capable image classification and defect localization network model.',
        'Quality metrics log dashboard with CSV data export.'
      ],
      deliverables: [
        'Edge defect detection dashboard mock.',
        'Trained defect classifier script (Python/PyTorch/ONNX).',
        'Quality inspection results summary presentation.'
      ],
      evaluationCriteria: [
        { criteria: 'Defect Classification Accuracy & Speed', weight: 40 },
        { criteria: 'Technician UI Design & Alerts Layout', weight: 30 },
        { criteria: 'Model Performance & FPS benchmarks', weight: 20 },
        { criteria: 'Documentation Quality', weight: 10 }
      ],
      resources: [
        { name: 'Defect Image Dataset.zip', type: 'dataset', url: '#' },
        { name: 'ONNX Defect Model Boilerplate.js', type: 'code', url: '#' }
      ],
      mentors: ['Sarah Jenkins', 'Ananya Patel'],
      participantsCount: 18,
      problemStatements: [
        {
          id: 'ps-qual-1',
          title: 'Computer Vision Defect Inspection & Analysis Pipeline',
          difficulty: 'Expert',
          tags: ['Computer Vision', 'Deep Learning', 'Defect Detection', 'Quality Control'],
          description: 'Develop a high-speed computer vision pipeline that analyzes manufactured parts on assembly conveyors to detect anomalies (micro-cracks, surface abrasions, dimensional deviations) and flag them in real-time.',
          background: 'Manual inspection is error-prone. Computer vision models at the edge can inspect parts in milliseconds, logging defects instantly and stopping bad parts from shipping.',
          objectives: [
            'Classify defects (scratch, dent, crack, normal) on raw product feeds.',
            'Calculate defect frequency statistics in real-time.',
            'Trigger conveyor stopper alarms when defect rates exceed safety limits.'
          ],
          requirements: [
            'Inspection panel showing live image stream and bounding boxes.',
            'Edge-capable image classification and defect localization network model.',
            'Quality metrics log dashboard with CSV data export.'
          ],
          deliverables: [
            'Edge defect detection dashboard mock.',
            'Trained defect classifier script (Python/PyTorch/ONNX).',
            'Quality inspection results summary presentation.'
          ],
          evaluationCriteria: [
            { criteria: 'Defect Classification Accuracy & Speed', weight: 40 },
            { criteria: 'Technician UI Design & Alerts Layout', weight: 30 },
            { criteria: 'Model Performance & FPS benchmarks', weight: 20 },
            { criteria: 'Documentation Quality', weight: 10 }
          ]
        },
        {
          id: 'ps-qual-2',
          title: 'Acoustic Weld-Seam Quality Analyzer',
          difficulty: 'Expert',
          tags: ['Acoustic Analysis', 'Weld Inspection', 'Signal Processing', 'Pattern Matching'],
          description: 'Build a signal processing module that listens to high-frequency audio or electromagnetic arc hums during spot welding processes to predict weld joint strength and catalog internal void defects.',
          background: 'Weld seam pores or poor penetration cannot be easily seen without expensive X-ray runs. Analyzing acoustic signature frequencies in real-time flags defect welds immediately.',
          objectives: [
            'Parse mock audio feeds from ultrasonic or welding arc sensors.',
            'Filter ambient shop floor noise using Bandpass or Fourier Transforms.',
            'Classify weld quality states (solid joint, gas pore, carbon inclusion).'
          ],
          requirements: [
            'Weld audio wave visualizer showing frequency spectrograms.',
            'Quality scoring model parsing high-frequency sensor streams.',
            'Fault alerting overlay for operators.'
          ],
          deliverables: [
            'Technician inspection dashboard screen.',
            'Acoustic signal processing code.',
            'Weld quality prediction benchmark report.'
          ],
          evaluationCriteria: [
            { criteria: 'Weld Defect Prediction Accuracy', weight: 45 },
            { criteria: 'Spectrogram Visuals and Layout', weight: 25 },
            { criteria: 'Noise Filtering Algorithm Efficiency', weight: 20 },
            { criteria: 'Documentation Quality', weight: 10 }
          ]
        },
        {
          id: 'ps-qual-3',
          title: 'High-Precision Laser Scan Inspection Engine',
          difficulty: 'Advanced',
          tags: ['Laser Scanning', 'Point Cloud', 'Dimensional Verification', 'Quality Tolerances'],
          description: 'Design a geometric auditing program that compares part scan coordinates (point clouds) against standard CAD mesh coordinates to verify dimensional tolerances within 0.05mm bounds.',
          background: 'Even slight tooling shifts deform turbine blade profiles or valve guides. Direct point-cloud-to-mesh verification checks dimensions, saving hours compared to physical caliper testing.',
          objectives: [
            'Import coordinates representing 3D point cloud structures.',
            'Register and align scans with CAD target meshes using ICP algorithms.',
            'Calculate color-coded delta maps highlighting out-of-tolerance regions.'
          ],
          requirements: [
            'Part dimensions delta visualizer showing 3D/2D tolerances.',
            'Point alignment solver script.',
            'Quality report generator highlighting pass/fail flags.'
          ],
          deliverables: [
            'Tolerances check UI dashboard.',
            'Alignment and distance calculation codebase.',
            'Part test cases output report.'
          ],
          evaluationCriteria: [
            { criteria: 'Dimensional Verification Precision', weight: 40 },
            { criteria: 'Delta Matrix Color-Map Visuals', weight: 30 },
            { criteria: 'Scan Registration Performance', weight: 20 },
            { criteria: 'Pitch Quality', weight: 10 }
          ]
        },
        {
          id: 'ps-qual-4',
          title: 'Packaging & Labels Compliance Inspection System',
          difficulty: 'Beginner',
          tags: ['Label Matching', 'OCR Inspection', 'Packaging Compliance', 'Visual Verification'],
          description: 'Develop a visual OCR analyzer that verifies that barcode labels, serial tags, and chemical hazard emblems are correctly aligned, match product orders, and are readable on shipping crates.',
          background: 'Shipping crates missing safety icons or carrying smudged barcodes get blocked at port customs. An automated camera checker inspects tags prior to shrink-wrap application.',
          objectives: [
            'Read barcode data and OCR strings on packaging box images.',
            'Cross-check details against master product inventory databases.',
            'Verify safety icon presence on chemical container sides.'
          ],
          requirements: [
            'Packaging camera checker screen mockup.',
            'OCR comparison script.',
            'Visual pass/fail indicator and inventory matching logs.'
          ],
          deliverables: [
            'Packaging QA dashboard console.',
            'Label verification source code.',
            'Accuracy evaluation test sheet.'
          ],
          evaluationCriteria: [
            { criteria: 'Barcode & Tag Reading Accuracy', weight: 40 },
            { criteria: 'Visual Log Layout and UX', weight: 30 },
            { criteria: 'DB Matching Speed', weight: 20 },
            { criteria: 'Documentation Clarity', weight: 10 }
          ]
        }
      ]
    },
    {
      id: 'ch-npd',
      title: 'Collaborative Product Lifecycle Management Sandbox',
      track: 'New Product Development',
      difficulty: 'Advanced',
      tags: ['PLM', 'BOM Calculator', 'CAD Viewer', 'Product Collaboration'],
      description: 'Design a web-based design-to-prototype workspace where engineers can collaborate in real-time to build, simulate, and validate physical or virtual model configurations with automatic BOM costing.',
      background: 'Moving from CAD design to procurement is slowed by outdated spreadsheets. Collaborating in real-time on product bills of materials (BOM) speeds up launch cycles and cost estimations.',
      objectives: [
        'Allow multi-user collaborative product editing on model trees.',
        'Calculate real-time cost impacts as BOM components change.',
        'Verify dimensional compatibility across assembly joints.'
      ],
      requirements: [
        'Interactive product tree editor showing component costs.',
        'Real-time data sync using WebSockets or collaborative hooks.',
        'BOM cost analytics charts and report exporter.'
      ],
      deliverables: [
        'PLM editor front-end console.',
        'BOM cost calculation engine package.',
        'NPD pitch deck presentation.'
      ],
      evaluationCriteria: [
        { criteria: 'Collaborative Sync UX and Performance', weight: 35 },
        { criteria: 'BOM Optimization Logic', weight: 35 },
        { criteria: 'Product Aesthetics & UI Polish', weight: 20 },
        { criteria: 'Pitch Quality', weight: 10 }
      ],
      resources: [
        { name: 'Product Lifecycle Standards.pdf', type: 'document', url: '#' }
      ],
      mentors: ['Dr. Marcus Vancamp', 'Sarah Jenkins'],
      participantsCount: 14,
      problemStatements: [
        {
          id: 'ps-npd-1',
          title: 'Collaborative Product Lifecycle Management Sandbox',
          difficulty: 'Advanced',
          tags: ['PLM', 'BOM Calculator', 'CAD Viewer', 'Product Collaboration'],
          description: 'Design a web-based design-to-prototype workspace where engineers can collaborate in real-time to build, simulate, and validate physical or virtual model configurations with automatic BOM costing.',
          background: 'Moving from CAD design to procurement is slowed by outdated spreadsheets. Collaborating in real-time on product bills of materials (BOM) speeds up launch cycles and cost estimations.',
          objectives: [
            'Allow multi-user collaborative product editing on model trees.',
            'Calculate real-time cost impacts as BOM components change.',
            'Verify dimensional compatibility across assembly joints.'
          ],
          requirements: [
            'Interactive product tree editor showing component costs.',
            'Real-time data sync using WebSockets or collaborative hooks.',
            'BOM cost analytics charts and report exporter.'
          ],
          deliverables: [
            'PLM editor front-end console.',
            'BOM cost calculation engine package.',
            'NPD pitch deck presentation.'
          ],
          evaluationCriteria: [
            { criteria: 'Collaborative Sync UX and Performance', weight: 35 },
            { criteria: 'BOM Optimization Logic', weight: 35 },
            { criteria: 'Product Aesthetics & UI Polish', weight: 20 },
            { criteria: 'Pitch Quality', weight: 10 }
          ]
        },
        {
          id: 'ps-npd-2',
          title: 'Smart CAD Parametric Cost Estimator',
          difficulty: 'Advanced',
          tags: ['CAD Parsing', 'Parametric Costing', 'BOM Generator', 'Cost Estimation'],
          description: 'Build a parametric costing tool that extracts product parameters (volume, surface area, material composition, tap hole counts) from 3D model files and generates a manufacturing cost baseline.',
          background: 'Estimating custom machining costs traditionally requires manual layout reviews. Parametric cost estimation parses geometry features directly, providing real-time quotes to designers.',
          objectives: [
            'Extract volume, perimeter, and machining tags from model files.',
            'Map parameters to standard raw material weight rates and cutting speeds.',
            'Output line-item expense calculations for setup, material, and runtime.'
          ],
          requirements: [
            'Model properties extraction console.',
            'Parametric cost calculator engine.',
            'Summary table showing cost changes as parameters are edited.'
          ],
          deliverables: [
            'Interactive estimation dashboard view.',
            'Cost calculation codebase.',
            'Project cost case study report.'
          ],
          evaluationCriteria: [
            { criteria: 'Geometric Pricing Engine Accuracy', weight: 45 },
            { criteria: 'Estimation Breakdown UX', weight: 25 },
            { criteria: 'Custom Parameters Flexibility', weight: 20 },
            { criteria: 'Documentation Clarity', weight: 10 }
          ]
        },
        {
          id: 'ps-npd-3',
          title: 'Generative Assembly Manual & Guideline Builder',
          difficulty: 'Intermediate',
          tags: ['Assembly Manuals', 'Generative Instructions', 'Step Sequencer', 'Instruction Builder'],
          description: 'Design a step sequencer that consumes a bill of materials and assembly constraints (join tolerances, tightening torques) to generate chronological assembly manuals for shop floor technicians.',
          background: 'Drafting manual sequences is highly repetitive. Automating instruction generation based on material hierarchy and fastener specifications ensures standardization across lines.',
          objectives: [
            'Define chronological step flows from BOM trees.',
            'Assign torque and calibration warnings to specific stages.',
            'Format step layouts into responsive digital assembly cards.'
          ],
          requirements: [
            'Interactive manual builder editor canvas.',
            'Instruction sequencing generation logic.',
            'Technician step viewer panel with safety alert popups.'
          ],
          deliverables: [
            'Step sequencer editor interface.',
            'Sequencing algorithm codebase.',
            'Sample generated PDF/HTML assembly cards.'
          ],
          evaluationCriteria: [
            { criteria: 'Assembly Logic Optimality', weight: 40 },
            { criteria: 'Technician Step Viewer UX', weight: 30 },
            { criteria: 'Fastener Spec Mapping Accuracy', weight: 20 },
            { criteria: 'Project Presentation', weight: 10 }
          ]
        },
        {
          id: 'ps-npd-4',
          title: 'Sustainable Material Substitute Auditor',
          difficulty: 'Advanced',
          tags: ['Carbon Audit', 'Material Substitution', 'BOM Sustainability', 'Green Engineering'],
          description: 'Create a materials auditing plugin that scans a product BOM, calculates its global warming potential, and queries databases to recommend eco-friendly material alternatives with minimal cost impact.',
          background: 'Global environmental regulations demand carbon footprint reduction. Recommending green substitutions directly within PLM sandboxes prompts engineers to choose sustainable options.',
          objectives: [
            'Import component material tags and calculate baseline carbon footprints.',
            'Match parts against alternate materials (e.g. bio-polymers, recycled alloy).',
            'Plot cost-versus-footprint trade-off charts.'
          ],
          requirements: [
            'BOM carbon score analyzer panel.',
            'Material database connector returning alternatives.',
            'Interactive substitution checklist with instant cost updates.'
          ],
          deliverables: [
            'BOM auditor dashboard mockup.',
            'Material comparison engine codebase.',
            'Carbon footprint reduction audit report.'
          ],
          evaluationCriteria: [
            { criteria: 'Carbon Footprint Calculation Logic', weight: 40 },
            { criteria: 'Alternative Recommendation Value', weight: 30 },
            { criteria: 'Trade-off Graph Visuals & Layout', weight: 20 },
            { criteria: 'Documentation Quality', weight: 10 }
          ]
        }
      ]
    },
    {
      id: 'ch-dig',
      title: 'Legacy Shopfloor Protocol Gateway & Digital Twin',
      track: 'Digitalization',
      difficulty: 'Intermediate',
      tags: ['Digital Twin', 'Protocol Translation', 'OPC-UA', 'WebSockets'],
      description: 'Build a protocol gateway that translates legacy industrial messages (Modbus, OPC-UA) into unified JSON payloads, mapping them to a real-time 2D/3D digital twin dashboard representation.',
      background: 'Legacy factory machines speak disparate field protocols. Translating this data at the edge and mapping it to a real-time digital twin representation allows unified plant-floor monitoring.',
      objectives: [
        'Parse legacy hex packets into readable JSON telemetry.',
        'Link telemetry outputs to interactive 2D digital twin overlays.',
        'Raise visual warning indicators when machines overheat or overload.'
      ],
      requirements: [
        'Mock Modbus TCP stream server and parsing gateway.',
        'Interactive digital twin floorplan canvas overlay.',
        'Historical event logs showing warnings and faults.'
      ],
      deliverables: [
        'Digital twin visualization dashboard.',
        'Protocol parsing gateway source code.',
        'System architecture topology mapping.'
      ],
      evaluationCriteria: [
        { criteria: 'Gateway Parsing Accuracy & Efficiency', weight: 40 },
        { criteria: 'Digital Twin Interactive UX & Detail', weight: 30 },
        { criteria: 'Warning Alert System Logic', weight: 20 },
        { criteria: 'Setup Documentation', weight: 10 }
      ],
      resources: [
        { name: 'OPC-UA specifications.pdf', type: 'document', url: '#' },
        { name: 'Modbus Hex Samples.json', type: 'dataset', url: '#' }
      ],
      mentors: ['Kenji Sato', 'Elena Rostova'],
      participantsCount: 19,
      problemStatements: [
        {
          id: 'ps-dig-1',
          title: 'Legacy Shopfloor Protocol Gateway & Digital Twin',
          difficulty: 'Intermediate',
          tags: ['Digital Twin', 'Protocol Translation', 'OPC-UA', 'WebSockets'],
          description: 'Build a protocol gateway that translates legacy industrial messages (Modbus, OPC-UA) into unified JSON payloads, mapping them to a real-time 2D/3D digital twin dashboard representation.',
          background: 'Legacy factory machines speak disparate field protocols. Translating this data at the edge and mapping it to a real-time digital twin representation allows unified plant-floor monitoring.',
          objectives: [
            'Parse legacy hex packets into readable JSON telemetry.',
            'Link telemetry outputs to interactive 2D digital twin overlays.',
            'Raise visual warning indicators when machines overheat or overload.'
          ],
          requirements: [
            'Mock Modbus TCP stream server and parsing gateway.',
            'Interactive digital twin floorplan canvas overlay.',
            'Historical event logs showing warnings and faults.'
          ],
          deliverables: [
            'Digital twin visualization dashboard.',
            'Protocol parsing gateway source code.',
            'System architecture topology mapping.'
          ],
          evaluationCriteria: [
            { criteria: 'Gateway Parsing Accuracy & Efficiency', weight: 40 },
            { criteria: 'Digital Twin Interactive UX & Detail', weight: 30 },
            { criteria: 'Warning Alert System Logic', weight: 20 },
            { criteria: 'Setup Documentation', weight: 10 }
          ]
        },
        {
          id: 'ps-dig-2',
          title: 'Shopfloor Spatial Heatmap & Asset Tracker',
          difficulty: 'Advanced',
          tags: ['Spatial Heatmap', 'UWB Tracking', 'Asset Location', 'Zone Management'],
          description: 'Design a location-aware dashboard that consumes simulated Ultra-Wideband (UWB) beacon streams to track the real-time coordinates of assets, generating density heatmaps to audit workspace bottlenecks.',
          background: 'Warehouse forklift collisions and operator congestion slow down logistics loops. Overlaying beacons coordinates onto digital floorplans highlights highly congested layout paths.',
          objectives: [
            'Aggregate coordinate telemetry from 20 simulated beacons.',
            'Render real-time spatial heatmaps over factory floor plans.',
            'Define virtual geo-fence zones and log alerts when unauthorized vehicles enter.'
          ],
          requirements: [
            'Floor map visualization showing color-coded operator clusters.',
            'UWB coordinate parsing broker.',
            'Zone configuration interface with threshold trigger logs.'
          ],
          deliverables: [
            'Spatial tracking UI dashboard.',
            'Coordinate filtering algorithm codebase.',
            'Geo-fence alert testing results.'
          ],
          evaluationCriteria: [
            { criteria: 'Heatmap Rendering Performance (60 FPS)', weight: 45 },
            { criteria: 'Geo-fence Zone Configuration UX', weight: 25 },
            { criteria: 'Asset Tracking Accuracy', weight: 20 },
            { criteria: 'Documentation Clarity', weight: 10 }
          ]
        },
        {
          id: 'ps-dig-3',
          title: 'Factory Time-Travel Diagnostics & Telemetry Replayer',
          difficulty: 'Advanced',
          tags: ['Time Travel', 'Data Playback', 'Incident Analysis', 'Telemetry Recorder'],
          description: 'Develop a diagnostic dashboard tool that records telemetry streams (motor temperatures, conveyor speeds) and allows engineers to play back machine logs frame-by-frame during line stops.',
          background: 'Understanding intermittent factory faults requires correlating multiple variables before the shut down. A "time-travel" panel lets technicians scrub backward to trace failure origins.',
          objectives: [
            'Store continuous telemetry logs in standard buffer formats.',
            'Provide interactive play, pause, rewind, and speed controls for historical playbacks.',
            'Mark anomalous values on charts during playback.'
          ],
          requirements: [
            'Diagnostics console with seek-bar slider.',
            'Telemetry recording and playback database structure.',
            'Multi-chart synchronized layout scrubbing.'
          ],
          deliverables: [
            'Telemetry replay terminal UI.',
            'Buffer recording and playback codebase.',
            'Incident replay sample test case.'
          ],
          evaluationCriteria: [
            { criteria: 'Playback Synchronization Accuracy', weight: 40 },
            { criteria: 'Chart Control & Timeline Scrubbing UX', weight: 35 },
            { criteria: 'Telemetry Processing Performance', weight: 15 },
            { criteria: 'Presentation Quality', weight: 10 }
          ]
        },
        {
          id: 'ps-dig-4',
          title: 'Paperless Digital Shift Handover Terminal',
          difficulty: 'Beginner',
          tags: ['Shift Handover', 'Digital Logs', 'Task Management', 'Operator Portal'],
          description: 'Build a tablet-focused shift log console where plant operators can review outstanding work orders, document line parameters, and record shift logs digitally to replace paper forms.',
          background: 'Shift handovers using notebooks lead to lost warnings about machine quirks. Digitizing shift handovers ensures safety compliance logs carry forward to incoming technicians.',
          objectives: [
            'Implement shift log entry templates for active tasks.',
            'Allow photo attachments and digitizing supervisor sign-offs.',
            'Pin urgent safety alerts to handoff overview grids.'
          ],
          requirements: [
            'Tablet-optimized operator dashboard.',
            'Handover checklist builder forms.',
            'Database interface storing historical handover records.'
          ],
          deliverables: [
            'Digital Shift Handover portal.',
            'Checklist database schemas.',
            'Shift handover report exports.'
          ],
          evaluationCriteria: [
            { criteria: 'Operator Ease of Use & UI Layout', weight: 40 },
            { criteria: 'Database Relational Integrity', weight: 30 },
            { criteria: 'Alert Pinning and Visibility', weight: 20 },
            { criteria: 'Documentation Clarity', weight: 10 }
          ]
        }
      ]
    },
    {
      id: 'ch-ai',
      title: 'Predictive Maintenance & Acoustic Anomaly Diagnostics',
      track: 'AI',
      difficulty: 'Expert',
      tags: ['Predictive Maintenance', 'Vibration Analysis', 'Deep Learning', 'Acoustic AI'],
      description: 'Implement an AI engine that processes audio or vibration sensor streams from industrial motors to diagnose bearing wear, gear friction, or coil anomalies before critical failures occur.',
      background: 'Motors and turbines hum differently when failing. Acoustic AI models can listen to high-frequency audio or vibration feeds to predict bearing breakdown weeks in advance, avoiding costly shut downs.',
      objectives: [
        'Process raw vibration sensor feeds and calculate spectrogram indices.',
        'Classify machine health states (healthy, warning, failure).',
        'Dispatch push or email alerts once machine states degrade.'
      ],
      requirements: [
        'Vibration spectrogram charts displaying real-time frequency components.',
        'Trained bearing wear predictive model executing on node mock.',
        'Maintenance action planner dashboard panel.'
      ],
      deliverables: [
        'Technician diagnostics dashboard frontend.',
        'Acoustic classification scripts.',
        'Diagnostic analysis benchmarking report.'
      ],
      evaluationCriteria: [
        { criteria: 'Acoustic Classification Accuracy', weight: 40 },
        { criteria: 'Frequency Chart Rendering Performance (FPS)', weight: 30 },
        { criteria: 'Alerts Dispatcher Integration Quality', weight: 20 },
        { criteria: 'Presentation Quality', weight: 10 }
      ],
      resources: [
        { name: 'Motor Acoustic Samples.zip', type: 'dataset', url: '#' },
        { name: 'Spectrogram Calculation Boilerplate.js', type: 'code', url: '#' }
      ],
      mentors: ['Sarah Jenkins', 'Elena Rostova'],
      participantsCount: 26,
      problemStatements: [
        {
          id: 'ps-ai-1',
          title: 'Predictive Maintenance & Acoustic Anomaly Diagnostics',
          difficulty: 'Expert',
          tags: ['Predictive Maintenance', 'Vibration Analysis', 'Deep Learning', 'Acoustic AI'],
          description: 'Implement an AI engine that processes audio or vibration sensor streams from industrial motors to diagnose bearing wear, gear friction, or coil anomalies before critical failures occur.',
          background: 'Motors and turbines hum differently when failing. Acoustic AI models can listen to high-frequency audio or vibration feeds to predict bearing breakdown weeks in advance, avoiding costly shut downs.',
          objectives: [
            'Process raw vibration sensor feeds and calculate spectrogram indices.',
            'Classify machine health states (healthy, warning, failure).',
            'Dispatch push or email alerts once machine states degrade.'
          ],
          requirements: [
            'Vibration spectrogram charts displaying real-time frequency components.',
            'Trained bearing wear predictive model executing on node mock.',
            'Maintenance action planner dashboard panel.'
          ],
          deliverables: [
            'Technician diagnostics dashboard frontend.',
            'Acoustic classification scripts.',
            'Diagnostic analysis benchmarking report.'
          ],
          evaluationCriteria: [
            { criteria: 'Acoustic Classification Accuracy', weight: 40 },
            { criteria: 'Frequency Chart Rendering Performance (FPS)', weight: 30 },
            { criteria: 'Alerts Dispatcher Integration Quality', weight: 20 },
            { criteria: 'Presentation Quality', weight: 10 }
          ]
        },
        {
          id: 'ps-ai-2',
          title: 'High-Voltage Transformer Temperature Forecaster',
          difficulty: 'Expert',
          tags: ['Load Forecasting', 'Transformer Health', 'LSTM Model', 'Thermal Forecast'],
          description: 'Develop an AI forecasting model that processes load currents and ambient temperatures to predict grid transformer core temperatures, alerting grid managers 24 hours prior to overload risks.',
          background: 'Power transformer core insulation breaks down rapidly under heat, causing costly network blackouts. Thermal prediction allows load shedding routines to run preemptively.',
          objectives: [
            'Train a time-series neural network (LSTM/GRU) on simulated historical loads.',
            'Forecast winding core temperatures 24 hours out.',
            'Raise cooling system activation signals when projections exceed 95C.'
          ],
          requirements: [
            'Temperature prediction timeline overlay compared to target lines.',
            'Time-series forecasting script.',
            'Load control response simulation dashboard.'
          ],
          deliverables: [
            'Grid manager forecasting dashboard.',
            'Model prediction python code.',
            'Prediction error validation charts.'
          ],
          evaluationCriteria: [
            { criteria: 'Forecasting Accuracy (Mean Absolute Error)', weight: 45 },
            { criteria: 'Interactive Dashboard and Charts', weight: 25 },
            { criteria: 'Load Dispatcher Logic Integration', weight: 20 },
            { criteria: 'Documentation Clarity', weight: 10 }
          ]
        },
        {
          id: 'ps-ai-3',
          title: 'Operator Safety Zone Edge Vision Monitor',
          difficulty: 'Advanced',
          tags: ['Object Detection', 'Edge AI', 'Safety Compliance', 'Conveyor Safety'],
          description: 'Architect an object detection vision system at the edge that processes factory safety camera feeds, flags when operator hands pass dangerous mechanical boundaries, and triggers machine stops.',
          background: 'Mechanical pinch rollers and high-force punches present major hand-injury hazards. Instant edge detection (under 20ms) triggers dynamic stops, preventing severe incidents.',
          objectives: [
            'Detect human hands and fingers on simulated video feeds.',
            'Define geometric safety bounds (risk polygons) on live streams.',
            'Generate trip signals to conveyor controllers in under 30ms.'
          ],
          requirements: [
            'Safety camera layout showing detection polygons.',
            'Lightweight object detector (YOLO/ONNX) running on video frames.',
            'Trigger alert log showing response delay times.'
          ],
          deliverables: [
            'Factory safety visual panel.',
            'Lightweight detection model scripts.',
            'Speed and accuracy verification reports.'
          ],
          evaluationCriteria: [
            { criteria: 'Object Detection Latency (under 30ms)', weight: 40 },
            { criteria: 'Hazard Zone Alert Visuals', weight: 35 },
            { criteria: 'Detection Precision (False Alarms Rate)', weight: 15 },
            { criteria: 'Presentation Quality', weight: 10 }
          ]
        },
        {
          id: 'ps-ai-4',
          title: 'AI Copilot for Field Repair Technicians',
          difficulty: 'Advanced',
          tags: ['RAG System', 'AI Copilot', 'Repair Manuals', 'Field Service'],
          description: 'Design a retrieval-augmented (RAG) assistant that indexes complex machine instruction manuals and repair PDFs, allowing maintenance staff to ask troubleshooting questions via voice or text.',
          background: 'Technicians spend up to 40% of their time flipping through huge paper manuals to find specific fuse alignments. A chat assistant returns correct page paragraphs instantly.',
          objectives: [
            'Extract text and coordinate maps from mockup machinery manuals.',
            'Build a semantic search index matching user symptom searches.',
            'Return localized repair instructions alongside relevant diagram indexes.'
          ],
          requirements: [
            'Mobile-friendly technician chat assistant portal.',
            'RAG search broker parsing manual data.',
            'Document source highlighting panels.'
          ],
          deliverables: [
            'Mobile chat UI mockup.',
            'Manual text parser and vector query code.',
            'Search relevancy test document.'
          ],
          evaluationCriteria: [
            { criteria: 'Query Relevancy & Retrieval Accuracy', weight: 45 },
            { criteria: 'Mobile Chat Interface UX', weight: 25 },
            { criteria: 'Processing speed (Latency)', weight: 20 },
            { criteria: 'Documentation Clarity', weight: 10 }
          ]
        }
      ]
    },
    {
      id: 'ch-iot',
      title: 'Decentralized Edge-to-Cloud Sensor Mesh Network',
      track: 'IoT',
      difficulty: 'Advanced',
      tags: ['IoT Mesh', 'Edge Computing', 'Telemetry Sync', 'Decentralized Networks'],
      description: 'Architect an IoT mesh network simulator that aggregates sensor readings (temperature, humidity, vibration) from 100+ edge nodes, processes them locally for anomalies, and syncs updates to a centralized hub.',
      background: 'Deploying thousands of sensors over large campuses is blocked by cellular cost. Mesh topologies allow nodes to pass readings peer-to-peer, routing them back to a single edge gateway.',
      objectives: [
        'Simulate message hop routing across 100 virtual edge nodes.',
        'Aggregate telemetry streams at gateway points.',
        'Compress payloads to minimize wireless network congestion.'
      ],
      requirements: [
        'Interactive node network map visualizing active hop lines.',
        'Gateway queue manager syncing local aggregates to the cloud.',
        'Warning indicator when nodes drop connection.'
      ],
      deliverables: [
        'IoT mesh dashboard monitoring console.',
        'Mesh message simulator script.',
        'Network design specification presentation.'
      ],
      evaluationCriteria: [
        { criteria: 'Mesh Routing Simulator Logic', weight: 40 },
        { criteria: 'Node Map UX & Topology Visuals', weight: 30 },
        { criteria: 'Sync Gateway Queuing Performance', weight: 20 },
        { criteria: 'Pitch Quality', weight: 10 }
      ],
      resources: [
        { name: 'IoT Mesh protocol specification.pdf', type: 'document', url: '#' }
      ],
      mentors: ['Kenji Sato', 'Raj Kumar'],
      participantsCount: 20,
      problemStatements: [
        {
          id: 'ps-iot-1',
          title: 'Decentralized Edge-to-Cloud Sensor Mesh Network',
          difficulty: 'Advanced',
          tags: ['IoT Mesh', 'Edge Computing', 'Telemetry Sync', 'Decentralized Networks'],
          description: 'Architect an IoT mesh network simulator that aggregates sensor readings (temperature, humidity, vibration) from 100+ edge nodes, processes them locally for anomalies, and syncs updates to a centralized hub.',
          background: 'Deploying thousands of sensors over large campuses is blocked by cellular cost. Mesh topologies allow nodes to pass readings peer-to-peer, routing them back to a single edge gateway.',
          objectives: [
            'Simulate message hop routing across 100 virtual edge nodes.',
            'Aggregate telemetry streams at gateway points.',
            'Compress payloads to minimize wireless network congestion.'
          ],
          requirements: [
            'Interactive node network map visualizing active hop lines.',
            'Gateway queue manager syncing local aggregates to the cloud.',
            'Warning indicator when nodes drop connection.'
          ],
          deliverables: [
            'IoT mesh dashboard monitoring console.',
            'Mesh message simulator script.',
            'Network design specification presentation.'
          ],
          evaluationCriteria: [
            { criteria: 'Mesh Routing Simulator Logic', weight: 40 },
            { criteria: 'Node Map UX & Topology Visuals', weight: 30 },
            { criteria: 'Sync Gateway Queuing Performance', weight: 20 },
            { criteria: 'Pitch Quality', weight: 10 }
          ]
        },
        {
          id: 'ps-iot-2',
          title: 'Battery-Optimized Fleet Asset Beacon System',
          difficulty: 'Advanced',
          tags: ['Power Shaving', 'Asset Tracking', 'Frugal Telemetry', 'Sleep Scheduling'],
          description: 'Create a sleep-scheduling algorithm for vehicle-mounted telemetry beacons that automatically dials down update rates based on low battery warnings and accelerometer motion data.',
          background: 'GPS/LTE asset tracking beacons run out of battery in weeks. Adjusting updates dynamically (e.g. hourly while parked, every 10s while moving) extends battery life to 3 years.',
          objectives: [
            'Simulate beacon tracking states (moving, stationary, battery-critical).',
            'Compute optimal sleep periods to minimize battery draw.',
            'Demonstrate how battery drain changes under multiple dynamic profiles.'
          ],
          requirements: [
            'Asset tracking dashboard indicating beacon battery and activity status.',
            'Sleep cycle scheduling engine.',
            'Telemetry stream mock tracking battery drainage levels.'
          ],
          deliverables: [
            'Battery analytics dashboard console.',
            'Sleep optimizer code module.',
            'Estimated battery lifespan charts.'
          ],
          evaluationCriteria: [
            { criteria: 'Battery Lifetime Extension Rate', weight: 50 },
            { criteria: 'Asset Dashboard Map UI', weight: 20 },
            { criteria: 'Adaptive Updating Agility', weight: 20 },
            { criteria: 'Documentation Quality', weight: 10 }
          ]
        },
        {
          id: 'ps-iot-3',
          title: 'Tamper-Proof Cryptographic Sensor Identity Manager',
          difficulty: 'Advanced',
          tags: ['IoT Security', 'Sensor Tampering', 'Cryptographic Signatures', 'Data Integrity'],
          description: 'Develop a security client for factory temperature sensors that signs telemetry payloads cryptographically, enabling the central receiving database to verify data origins and discard spoofed packets.',
          background: 'Malicious actors spoofing temperature telemetry can trigger false factory shutdowns. Lightweight cryptographic signatures verify that readings match certified physical sensors.',
          objectives: [
            'Implement lightweight signing (HMAC or elliptic curve) on edge sensor data.',
            'Verify signatures at the receiver gateway database.',
            'Audit and flag spoofed packets injected by mock attackers.'
          ],
          requirements: [
            'Gateway logs terminal highlighting verified versus rejected packets.',
            'HMAC / ECDSA cryptos library integration.',
            'Simulation controls to trigger mock injection attacks.'
          ],
          deliverables: [
            'Security audit logs console UI.',
            'Signature and validation scripts.',
            'Attack mitigation summary document.'
          ],
          evaluationCriteria: [
            { criteria: 'Attack Detection / Mitigations', weight: 45 },
            { criteria: 'Audit Logs Terminal UX', weight: 25 },
            { criteria: 'Signing Computation Efficiency', weight: 20 },
            { criteria: 'Documentation Clarity', weight: 10 }
          ]
        },
        {
          id: 'ps-iot-4',
          title: 'Plant-Wide Environmental Gas & Air Quality Monitor',
          difficulty: 'Beginner',
          tags: ['Environmental Quality', 'Air Monitoring', 'Gas Detection', 'Industrial Safety'],
          description: 'Build an air safety console that tracks CO2, volatile organic compounds (VOC), and humidity telemetry from 20 storage areas, raising alarms when concentrations breach toxic thresholds.',
          background: 'Chemical processing yards can leak hazardous solvent fumes. Continuous low-cost IoT gas sensors map air quality distributions, warning operators before they enter dangerous rooms.',
          objectives: [
            'Monitor gas and VOC level arrays.',
            'Formulate safety threshold trigger levels.',
            'Generate evacuation siren alerts when concentrations exceed danger indices.'
          ],
          requirements: [
            'Storage room air quality layout overlays.',
            'Telemetry comparison solver returning safety categories.',
            'Siren activation buttons and real-time logs.'
          ],
          deliverables: [
            'Environmental safety dashboard panel.',
            'Gas parsing codebase.',
            'Calibration logs test sheet.'
          ],
          evaluationCriteria: [
            { criteria: 'Alarm Dispatch Response Speed', weight: 40 },
            { criteria: 'Air Status Floor Layout UX', weight: 30 },
            { criteria: 'Safety Alerting Logic Robustness', weight: 20 },
            { criteria: 'Documentation Quality', weight: 10 }
          ]
        }
      ]
    }
  ],

  allTeams: [
    {
      id: 't-01',
      name: 'CyberPulse',
      code: 'ABB-CPLSE-98',
      track: 'Energy Systems',
      challengeId: 'ch-01',
      progress: 65,
      collaborationScore: 92,
      college: 'ABB Engineering Institute',
      assignedMentorId: 'men-02',
      assignedMentorName: 'Elena Rostova',
      points: 85,
      previousPoints: 0,
      badges: ['Pitch Master'],
      proposedFeatures: [
        { id: 'f-1', name: 'Real-time Solar Generation Tracker', description: 'Tracks localized solar irradiance and battery load.', implemented: true, round: 1 },
        { id: 'f-2', name: 'Smart Load Balancer Engine', description: 'Algorithmic reinforcement solver to distribute batteries.', implemented: true, round: 2 },
        { id: 'f-3', name: 'Interactive Grid Topology Map', description: 'SVG based visualization of microgrid distribution hubs.', implemented: false, round: 3 }
      ],
      mentorEvaluations: [
        {
          round: 1,
          mentorName: 'Elena Rostova',
          scores: [
            { criteria: 'Core Idea & PPT', score: 92 },
            { criteria: 'Feature Set Completeness', score: 85 },
            { criteria: 'Unique Value Proposition', score: 88 }
          ],
          checklistRemarks: [
            { featureName: 'Real-time Solar Generation Tracker', implemented: true, score: 10 }
          ],
          comment: 'Excellent pitch. The weather forecasting API integration is a solid USP.',
          pointsEarned: 85,
          submittedAt: '2026-06-22T14:30:00Z'
        }
      ],
      progressHistory: [
        { date: '2026-06-22T09:00:00Z', progress: 15, note: 'Team registration and brainstorming' },
        { date: '2026-06-22T15:00:00Z', progress: 30, note: 'Architecture diagram finalized' },
        { date: '2026-06-23T10:00:00Z', progress: 50, note: 'Decentralized solver core completed' },
        { date: '2026-06-24T14:30:00Z', progress: 65, note: 'Framer Motion dashboard integrated' }
      ],
      submissions: [
        {
          id: 'sub-01',
          teamId: 't-01',
          challengeId: 'ch-01',
          submittedAt: '2026-06-17T14:30:00Z',
          githubUrl: 'https://github.com/cyberpulse/abb-grid',
          demoUrl: 'https://cyberpulse-grid.vercel.app',
          description: 'Decentralized microgrid simulator leveraging localized weather data and reinforcement learning logic to balance residential solar cell distribution.',
          presentationFile: 'cyberpulse_deck.pdf',
          status: 'pending',
          weightedScore: 78,
          facultyStatus: 'pending'
        }
      ],
      members: [
        { id: 'm-01', fullName: 'Sarah Connor', email: 's.connor@college.edu', role: 'Leader', skills: ['Python', 'AI'], status: 'active', college: 'ABB Engineering Institute', year: '3rd Year' },
        { id: 'm-02', fullName: 'John Doe', email: 'j.doe@college.edu', role: 'Developer', skills: ['React', 'TypeScript'], status: 'active', college: 'ABB Engineering Institute', year: '3rd Year' },
        { id: 'm-03', fullName: 'Elena Gilbert', email: 'e.gilbert@college.edu', role: 'Designer', skills: ['Figma', 'CSS'], status: 'active', college: 'ABB Engineering Institute', year: '3rd Year' },
        { id: 'm-stud', fullName: 'Om Zambare', email: 'om.zambare@college.edu', role: 'Developer', skills: ['React', 'TypeScript', 'Node.js', 'Python'], status: 'active', college: 'ABB Engineering Institute', year: '4th Year' }
      ]
    },
    {
      id: 't-02',
      name: 'RoboKnights',
      code: 'ABB-RKNTS-54',
      track: 'Robotics',
      challengeId: 'ch-02',
      progress: 80,
      collaborationScore: 88,
      college: 'Pune Institute of Computer Technology',
      assignedMentorId: 'men-03',
      assignedMentorName: 'Kenji Sato',
      points: 0,
      previousPoints: 0,
      badges: [],
      proposedFeatures: [
        { id: 'f-4', name: 'LiDAR Telemetry Parser', description: 'Parses raw sensor packets into coordinates.', implemented: true, round: 1 },
        { id: 'f-5', name: 'ROS Navigation Planner Node', description: 'Computes autonomous collision-free paths.', implemented: false, round: 2 }
      ],
      mentorEvaluations: [],
      progressHistory: [
        { date: '2026-06-22T09:00:00Z', progress: 15, note: 'ROS node setup' },
        { date: '2026-06-23T09:00:00Z', progress: 45, note: 'Kinematics verification' },
        { date: '2026-06-24T11:00:00Z', progress: 80, note: 'Visualizer dashboard complete' }
      ],
      submissions: [],
      members: [
        { id: 'm-04', fullName: 'Ken Block', email: 'k.block@college.edu', role: 'Leader', skills: ['C++', 'ROS'], status: 'active', college: 'Pune Institute of Computer Technology', year: '4th Year' },
        { id: 'm-05', fullName: 'Lewis Hamilton', email: 'l.hamilton@college.edu', role: 'Developer', skills: ['ROS', 'Pathfinding'], status: 'active', college: 'Pune Institute of Computer Technology', year: '4th Year' }
      ]
    },
    {
      id: 't-03',
      name: 'EcoSync',
      code: 'ABB-ECOSY-12',
      track: 'Sustainability',
      challengeId: 'ch-04',
      progress: 40,
      collaborationScore: 85,
      college: 'K.K. Wagh COE, Nashik',
      assignedMentorId: 'men-01',
      assignedMentorName: 'Dr. Marcus Vancamp',
      points: 0,
      previousPoints: 0,
      badges: [],
      proposedFeatures: [
        { id: 'f-6', name: 'Carbon Accounting Formula Engine', description: 'Standardized carbon ledger calculator.', implemented: true, round: 1 },
        { id: 'f-7', name: 'Green Credit Dashboard', description: 'Renders credit balance and certificates.', implemented: false, round: 2 }
      ],
      mentorEvaluations: [],
      progressHistory: [
        { date: '2026-06-22T09:00:00Z', progress: 15, note: 'Topic selected: Carbon Accounting' },
        { date: '2026-06-23T14:00:00Z', progress: 40, note: 'Initial calculations and models structured' }
      ],
      submissions: [],
      members: [
        { id: 'm-06', fullName: 'Greta Thunberg', email: 'g.thunberg@college.edu', role: 'Leader', skills: ['Carbon Accounting'], status: 'active', college: 'K.K. Wagh COE, Nashik', year: '2nd Year' }
      ]
    },
    {
      id: 't-04',
      name: 'ApexLearners',
      code: 'ABB-APEXL-42',
      track: 'AI',
      challengeId: 'ch-03',
      progress: 90,
      collaborationScore: 95,
      college: 'IIT Bombay',
      assignedMentorId: 'men-04',
      assignedMentorName: 'Sarah Jenkins',
      points: 0,
      previousPoints: 0,
      badges: [],
      proposedFeatures: [
        { id: 'f-8', name: 'CNN Classification Core', description: 'Classifies microgrid thermal anomalies.', implemented: true, round: 1 },
        { id: 'f-9', name: 'Safety Alerting API Dispatcher', description: 'Sends automated warning hooks.', implemented: false, round: 2 }
      ],
      mentorEvaluations: [],
      progressHistory: [
        { date: '2026-06-22T09:00:00Z', progress: 20, note: 'Brainstormed AI models' },
        { date: '2026-06-23T10:00:00Z', progress: 55, note: 'Dataset preparation complete' },
        { date: '2026-06-24T16:00:00Z', progress: 90, note: 'CNN model training completed' }
      ],
      submissions: [],
      members: [
        { id: 'm-07', fullName: 'Aarav Mehta', email: 'aarav@iitb.ac.in', role: 'Leader', skills: ['Python', 'PyTorch', 'Computer Vision'], status: 'active', college: 'IIT Bombay', year: '3rd Year' },
        { id: 'm-08', fullName: 'Ananya Sharma', email: 'ananya@iitb.ac.in', role: 'Developer', skills: ['AI', 'Data Processing'], status: 'active', college: 'IIT Bombay', year: '3rd Year' },
        { id: 'm-09', fullName: 'Kabir Kapoor', email: 'kabir@iitb.ac.in', role: 'Designer', skills: ['Figma', 'React'], status: 'active', college: 'IIT Bombay', year: '3rd Year' }
      ]
    },
    {
      id: 't-05',
      name: 'EdgeSync',
      code: 'ABB-EDGSN-88',
      track: 'Edge AI',
      challengeId: 'ch-05',
      progress: 75,
      collaborationScore: 89,
      college: 'BITS Pilani',
      assignedMentorId: 'men-04',
      assignedMentorName: 'Sarah Jenkins',
      points: 155,
      previousPoints: 80,
      badges: ['Pitch Master', 'MVP Builder'],
      proposedFeatures: [
        { id: 'f-10', name: 'TensorRT Acceleration Layer', description: 'Model conversion for embedded processors.', implemented: true, round: 1 },
        { id: 'f-11', name: 'Resource Monitor Daemon', description: 'Monitors memory, CPU, and temperatures.', implemented: true, round: 2 },
        { id: 'f-12', name: 'Vibration Signal Spectrum Chart', description: 'FFT calculations and graph rendering.', implemented: true, round: 2 },
        { id: 'f-13', name: 'Anomaly Warning SMS dispatch', description: 'SMS alerting hook for remote operators.', implemented: false, round: 3 }
      ],
      mentorEvaluations: [
        {
          round: 1,
          mentorName: 'Sarah Jenkins',
          scores: [
            { criteria: 'Core Idea & PPT', score: 90 },
            { criteria: 'Feature Set Completeness', score: 80 },
            { criteria: 'Unique Value Proposition', score: 70 }
          ],
          checklistRemarks: [
            { featureName: 'TensorRT Acceleration Layer', implemented: true, score: 10 }
          ],
          comment: 'Solid idea, very relevant to ABB digital vents. Ensure target hardware metrics are tracked.',
          pointsEarned: 80,
          submittedAt: '2026-06-22T16:00:00Z'
        },
        {
          round: 2,
          mentorName: 'Sarah Jenkins',
          scores: [
            { criteria: 'Implemented Features Quality', score: 85 },
            { criteria: 'Functionality & Stability', score: 90 },
            { criteria: 'Code Architecture scalability', score: 80 }
          ],
          checklistRemarks: [
            { featureName: 'Resource Monitor Daemon', implemented: true, score: 10 },
            { featureName: 'Vibration Signal Spectrum Chart', implemented: true, score: 10 }
          ],
          comment: 'The memory monitor works well on simulated boards. Great progress!',
          pointsEarned: 75,
          submittedAt: '2026-06-23T18:00:00Z'
        }
      ],
      progressHistory: [
        { date: '2026-06-22T10:00:00Z', progress: 10, note: 'Edge controller initialized' },
        { date: '2026-06-23T11:00:00Z', progress: 40, note: 'TensorRT compiler pipeline fixed' },
        { date: '2026-06-24T12:00:00Z', progress: 75, note: 'Model deployed on simulated edge node' }
      ],
      submissions: [
        {
          id: 'sub-02',
          teamId: 't-05',
          challengeId: 'ch-05',
          submittedAt: '2026-06-24T18:00:00Z',
          githubUrl: 'https://github.com/edgesync/abb-edge-ai',
          demoUrl: 'https://edgesync-abb.vercel.app',
          description: 'High-speed anomaly detection system running on resource-constrained micro-controller simulations.',
          presentationFile: 'edgesync_deck.pdf',
          status: 'reviewed',
          weightedScore: 85,
          facultyStatus: 'endorsed'
        }
      ],
      members: [
        { id: 'm-10', fullName: 'Rohan Deshmukh', email: 'rohan@bits-pilani.ac.in', role: 'Leader', skills: ['C++', 'TensorRT', 'Embedded Systems'], status: 'active', college: 'BITS Pilani', year: '4th Year' },
        { id: 'm-11', fullName: 'Sanya Gupta', email: 'sanya@bits-pilani.ac.in', role: 'Developer', skills: ['Python', 'Edge AI', 'Optimization'], status: 'active', college: 'BITS Pilani', year: '4th Year' }
      ]
    },
    {
      id: 't-06',
      name: 'DTU-Sensing',
      code: 'ABB-DTUSN-33',
      track: 'IoT',
      challengeId: 'ch-06',
      progress: 55,
      collaborationScore: 82,
      college: 'Delhi Technological University',
      assignedMentorId: 'men-02',
      assignedMentorName: 'Elena Rostova',
      points: 0,
      previousPoints: 0,
      badges: [],
      proposedFeatures: [
        { id: 'f-18', name: 'MQTT packet broker connection', description: 'Validates packet flow rates.', implemented: true, round: 1 },
        { id: 'f-19', name: 'UI Gauge controls', description: 'Dashboard elements for temperature telemetry.', implemented: false, round: 2 },
        { id: 'f-19b', name: 'Real-time Signal Graph', description: 'Visualizes historical telemetry waveforms.', implemented: false, round: 3 }
      ],
      mentorEvaluations: [],
      progressHistory: [
        { date: '2026-06-22T09:00:00Z', progress: 15, note: 'Sensor protocols defined' },
        { date: '2026-06-23T15:00:00Z', progress: 55, note: 'MQTT packet brokers validated' }
      ],
      submissions: [],
      members: [
        { id: 'm-12', fullName: 'Devansh Verma', email: 'devansh@dtu.ac.in', role: 'Leader', skills: ['MQTT', 'IoT', 'Python'], status: 'active', college: 'Delhi Technological University', year: '3rd Year' },
        { id: 'm-13', fullName: 'Isha Sen', email: 'isha@dtu.ac.in', role: 'Developer', skills: ['C++', 'Arduino'], status: 'active', college: 'Delhi Technological University', year: '3rd Year' },
        { id: 'm-14', fullName: 'Pranav Joshi', email: 'pranav@dtu.ac.in', role: 'Designer', skills: ['CSS', 'Dashboard UX'], status: 'active', college: 'Delhi Technological University', year: '3rd Year' }
      ]
    },
    {
      id: 't-07',
      name: 'GreenWatt',
      code: 'ABB-GWATT-77',
      track: 'Sustainability',
      challengeId: 'ch-04',
      progress: 30,
      collaborationScore: 70,
      college: 'RV College of Engineering',
      assignedMentorId: 'men-01',
      assignedMentorName: 'Dr. Marcus Vancamp',
      points: 0,
      previousPoints: 0,
      badges: [],
      proposedFeatures: [
        { id: 'f-20', name: 'Grid emissions factors API', description: 'Calls international carbon values.', implemented: true, round: 1 },
        { id: 'f-21', name: 'React visual map interface', description: 'Visualizes carbon offset areas.', implemented: false, round: 2 }
      ],
      mentorEvaluations: [],
      progressHistory: [
        { date: '2026-06-22T11:00:00Z', progress: 10, note: 'Project proposal drafted' },
        { date: '2026-06-23T16:00:00Z', progress: 30, note: 'Initial carbon offset formula setup' }
      ],
      submissions: [],
      members: [
        { id: 'm-15', fullName: 'Meera Nair', email: 'meera@rvce.edu.in', role: 'Leader', skills: ['Environmental Science', 'Formulas'], status: 'active', college: 'RV College of Engineering', year: '2nd Year' },
        { id: 'm-16', fullName: 'Aditya Rao', email: 'aditya@rvce.edu.in', role: 'Developer', skills: ['React', 'CSS'], status: 'active', college: 'RV College of Engineering', year: '2nd Year' }
      ]
    },
    {
      id: 't-08',
      name: 'VIT-Robo',
      code: 'ABB-VITRB-99',
      track: 'Robotics',
      challengeId: 'ch-02',
      progress: 95,
      collaborationScore: 94,
      college: 'Vellore Institute of Technology',
      assignedMentorId: 'men-03',
      assignedMentorName: 'Kenji Sato',
      points: 175,
      previousPoints: 85,
      badges: ['Pitch Master', 'MVP Builder'],
      proposedFeatures: [
        { id: 'f-14', name: 'LiDAR Telemetry Map Visualizer', description: 'Interactive canvas maps sensor coordinates.', implemented: true, round: 1 },
        { id: 'f-15', name: 'Autonomous Path-Planner Core', description: 'A* pathfinding solver logic.', implemented: true, round: 2 },
        { id: 'f-16', name: 'Fleet Controller Coordinator', description: 'Syncs multiple robots coordination.', implemented: true, round: 2 },
        { id: 'f-17', name: 'Obstacle Alert Dispatcher', description: 'Broadcasting telemetry hooks on warnings.', implemented: false, round: 3 }
      ],
      mentorEvaluations: [
        {
          round: 1,
          mentorName: 'Kenji Sato',
          scores: [
            { criteria: 'Core Idea & PPT', score: 95 },
            { criteria: 'Feature Set Completeness', score: 90 },
            { criteria: 'Unique Value Proposition', score: 85 }
          ],
          checklistRemarks: [
            { featureName: 'LiDAR Telemetry Map Visualizer', implemented: true, score: 10 }
          ],
          comment: 'LiDAR maps look spectacular. Pathfinding algorithm will be the main bottleneck, focus there.',
          pointsEarned: 90,
          submittedAt: '2026-06-22T11:00:00Z'
        },
        {
          round: 2,
          mentorName: 'Kenji Sato',
          scores: [
            { criteria: 'Implemented Features Quality', score: 90 },
            { criteria: 'Functionality & Stability', score: 95 },
            { criteria: 'Code Architecture scalability', score: 90 }
          ],
          checklistRemarks: [
            { featureName: 'Autonomous Path-Planner Core', implemented: true, score: 10 },
            { featureName: 'Fleet Controller Coordinator', implemented: true, score: 10 }
          ],
          comment: 'Very stable ROS path solver. UI UX is highly polished.',
          pointsEarned: 85,
          submittedAt: '2026-06-23T15:00:00Z'
        }
      ],
      progressHistory: [
        { date: '2026-06-22T09:00:00Z', progress: 25, note: 'LiDAR path mapping setup' },
        { date: '2026-06-23T11:00:00Z', progress: 60, note: 'Localization algorithm optimized' },
        { date: '2026-06-24T10:00:00Z', progress: 95, note: 'Simulation rendering fully operational' }
      ],
      submissions: [
        {
          id: 'sub-03',
          teamId: 't-08',
          challengeId: 'ch-02',
          submittedAt: '2026-06-24T19:30:00Z',
          githubUrl: 'https://github.com/vitrobo/pathfinder',
          demoUrl: 'https://vitrobo-path.vercel.app',
          description: 'Autonomous pathfinder simulation with real-time LiDAR telemetry visualization.',
          presentationFile: 'vit_robo_pathfinder.pdf',
          status: 'reviewed',
          weightedScore: 92,
          facultyStatus: 'endorsed'
        }
      ],
      members: [
        { id: 'm-17', fullName: 'Arjun Pillai', email: 'arjun@vit.ac.in', role: 'Leader', skills: ['C++', 'LiDAR', 'ROS'], status: 'active', college: 'Vellore Institute of Technology', year: '4th Year' },
        { id: 'm-18', fullName: 'Riya Mathews', email: 'riya@vit.ac.in', role: 'Developer', skills: ['ROS', 'Math'], status: 'active', college: 'Vellore Institute of Technology', year: '4th Year' },
        { id: 'm-19', fullName: 'Neil Dsouza', email: 'neil@vit.ac.in', role: 'Developer', skills: ['React', 'D3.js'], status: 'active', college: 'Vellore Institute of Technology', year: '4th Year' },
        { id: 'm-20', fullName: 'Tanya Bose', email: 'tanya@vit.ac.in', role: 'Designer', skills: ['UX Design', 'Figma'], status: 'active', college: 'Vellore Institute of Technology', year: '4th Year' }
      ]
    },
    {
      id: 't-09',
      name: 'GridPulse',
      code: 'ABB-GRDPL-55',
      track: 'Energy Systems',
      challengeId: 'ch-01',
      progress: 45,
      collaborationScore: 80,
      college: 'SRM University',
      assignedMentorId: 'men-02',
      assignedMentorName: 'Elena Rostova',
      points: 0,
      previousPoints: 0,
      badges: [],
      proposedFeatures: [
        { id: 'f-22', name: 'Microgrid circuit definitions', description: 'Compiles resistance and reactance formulas.', implemented: true, round: 1 },
        { id: 'f-23', name: 'Power factor controller dashboard', description: 'Visualizes capacitors and load states.', implemented: false, round: 2 }
      ],
      mentorEvaluations: [],
      progressHistory: [
        { date: '2026-06-22T09:00:00Z', progress: 15, note: 'Conceptual model finalized' },
        { date: '2026-06-23T14:00:00Z', progress: 45, note: 'Circuit equations solved' }
      ],
      submissions: [],
      members: [
        { id: 'm-21', fullName: 'Vikram Singh', email: 'vikram@srm.edu.in', role: 'Leader', skills: ['Power Electronics'], status: 'active', college: 'SRM University', year: '3rd Year' },
        { id: 'm-22', fullName: 'Pooja Hegde', email: 'pooja@srm.edu.in', role: 'Developer', skills: ['MATLAB', 'Python'], status: 'active', college: 'SRM University', year: '3rd Year' }
      ]
    },
    {
      id: 't-10',
      name: 'CEG-Ops',
      code: 'ABB-CEGOP-66',
      track: 'E-Operations',
      challengeId: 'ch-07',
      progress: 60,
      collaborationScore: 84,
      college: 'College of Engineering Guindy',
      assignedMentorId: 'men-01',
      assignedMentorName: 'Dr. Marcus Vancamp',
      points: 0,
      previousPoints: 0,
      badges: [],
      proposedFeatures: [
        { id: 'f-24', name: 'Operations flowchart canvas', description: 'Visualizes industrial workflows.', implemented: true, round: 1 },
        { id: 'f-25', name: 'Throughput optimization solver', description: 'Calculates maximum network bottlenecks.', implemented: false, round: 2 }
      ],
      mentorEvaluations: [],
      progressHistory: [
        { date: '2026-06-22T10:00:00Z', progress: 20, note: 'Operations flowcharts created' },
        { date: '2026-06-23T12:00:00Z', progress: 60, note: 'Optimization engine coded' }
      ],
      submissions: [],
      members: [
        { id: 'm-23', fullName: 'Harish Kumar', email: 'harish@ceg.edu', role: 'Leader', skills: ['Optimization', 'Data Science'], status: 'active', college: 'College of Engineering Guindy', year: '4th Year' },
        { id: 'm-24', fullName: 'Nisha Rajan', email: 'nisha@ceg.edu', role: 'Developer', skills: ['React', 'Node.js'], status: 'active', college: 'College of Engineering Guindy', year: '4th Year' },
        { id: 'm-25', fullName: 'Sanjay Dutt', email: 'sanjay@ceg.edu', role: 'Designer', skills: ['UI/UX', 'Figma'], status: 'active', college: 'College of Engineering Guindy', year: '4th Year' }
      ]
    }
  ],

  mentors: [
    {
      id: 'men-01',
      name: 'Dr. Marcus Vancamp',
      role: 'Principal Research Engineer',
      organization: 'ABB Energy Industries',
      expertise: ['Decarbonization', 'Smart Grids', 'Renewable Integration'],
      availability: 'Wednesdays 14:00 - 18:00',
      linkedin: 'https://linkedin.com/in/marcus-vancamp',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus'
    },
    {
      id: 'men-02',
      name: 'Elena Rostova',
      role: 'Senior Software Architect',
      organization: 'ABB Robotics & Discrete Automation',
      expertise: ['Industrial IoT', 'Edge Computing', 'React', 'TypeScript'],
      availability: 'Thursdays 10:00 - 13:00',
      linkedin: 'https://linkedin.com/in/elena-rostova',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena'
    },
    {
      id: 'men-03',
      name: 'Kenji Sato',
      role: 'Lead Robotics Researcher',
      organization: 'ABB Corporate Research',
      expertise: ['Pathfinding Algorithms', 'ROS 2', 'Fleet Path Optimization'],
      availability: 'Mondays 09:00 - 12:00',
      linkedin: 'https://linkedin.com/in/kenji-sato',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kenji'
    },
    {
      id: 'men-04',
      name: 'Sarah Jenkins',
      role: 'Edge AI Lead Scientist',
      organization: 'ABB Digital Ventures',
      expertise: ['Edge ML', 'Anomaly Detection', 'Vibration Analysis'],
      availability: 'Tuesdays 15:00 - 17:00',
      linkedin: 'https://linkedin.com/in/sarah-jenkins',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
    }
  ],

  mentorRequests: [
    {
      id: 'req-01',
      teamId: 't-01',
      teamName: 'CyberPulse',
      challengeTitle: 'Smart Decentralized Grid Management',
      type: 'Architecture',
      description: 'Need assistance setting up the WebSocket connection from our simulated smart-meters to update the React frontend dashboard efficiently.',
      priority: 'High',
      preferredTime: 'Thursday 11:30 AM',
      status: 'pending',
      createdAt: '2026-06-18T10:00:00Z'
    },
    {
      id: 'req-02',
      teamId: 't-02',
      teamName: 'RoboKnights',
      challengeTitle: 'Autonomous Mobile Robot Fleet Coordination',
      type: 'Technical',
      description: 'Experiencing minor path collisions when two robots approach the intersection simultaneously in narrow layout models.',
      priority: 'Urgent',
      preferredTime: 'Monday 10:00 AM',
      status: 'assigned',
      mentorName: 'Kenji Sato',
      createdAt: '2026-06-18T09:15:00Z'
    },
    {
      id: 'req-03',
      teamId: 't-07',
      teamName: 'GreenWatt',
      challengeTitle: 'Carbon Offset Tracker',
      type: 'Technical',
      description: 'Stuck with the carbon offset solver calculation for solar irradiance. Need a math review.',
      priority: 'Urgent',
      preferredTime: 'Tuesday 2:00 PM',
      status: 'pending',
      createdAt: '2026-06-22T11:30:00Z'
    },
    {
      id: 'req-04',
      teamId: 't-07',
      teamName: 'GreenWatt',
      challengeTitle: 'Carbon Offset Tracker',
      type: 'Design',
      description: 'Need input on how to design our visualization overlay so it looks premium and professional.',
      priority: 'High',
      preferredTime: 'Wednesday 10:00 AM',
      status: 'pending',
      createdAt: '2026-06-23T09:00:00Z'
    },
    {
      id: 'req-05',
      teamId: 't-09',
      teamName: 'GridPulse',
      challengeTitle: 'Smart Decentralized Grid Management',
      type: 'Architecture',
      description: 'Deciding between active load balancing algorithms for our microgrid model.',
      priority: 'Medium',
      preferredTime: 'Tuesday 4:00 PM',
      status: 'resolved',
      mentorName: 'Dr. Marcus Vancamp',
      createdAt: '2026-06-22T10:00:00Z'
    }
  ],

  calendarEvents: [
    { id: 'ev-01', title: 'Platform Launch & Keynote Speech', start: '2026-06-19T09:00:00', end: '2026-06-19T10:30:00', type: 'workshop', description: 'ABB Leadership welcomes all participating colleges.' },
    { id: 'ev-02', title: 'AI & Smart Grid Architecture Workshop', start: '2026-06-19T14:00:00', end: '2026-06-19T16:00:00', type: 'workshop', description: 'Learn how to consume raw grid data simulator outputs.' },
    { id: 'ev-03', title: 'First Checkpoint Review Deadline', start: '2026-06-20T18:00:00', end: '2026-06-20T18:00:00', type: 'checkpoint', description: 'Teams must upload brief project design architecture sheets.' },
    { id: 'ev-04', title: 'Autonomous Pathfinding Guidance Seminar', start: '2026-06-21T11:00:00', end: '2026-06-21T13:00:00', type: 'session', description: 'Expert Kenji Sato outlines path collision prevention strategies.' },
    { id: 'ev-05', title: 'Final Code Submission Cutoff', start: '2026-06-23T23:59:59', end: '2026-06-23T23:59:59', type: 'deadline', description: 'All repositories and demonstration uploads close.' },
    { id: 'ev-06', title: 'Grand Awards Ceremony', start: '2026-06-25T15:00:00', end: '2026-06-25T18:00:00', type: 'ceremony', description: 'Exhibition of top winners and certificate presentations.' }
  ],

  notifications: [
    { id: 'not-01', title: 'Mentor Session Assigned', content: 'Kenji Sato has accepted your fleet coordination review request for Monday at 10:00 AM.', type: 'mentor', timestamp: '2026-06-18T12:00:00Z', read: false },
    { id: 'not-02', title: 'Grid API Reference Uploaded', content: 'ABB Grid API documentation.pdf has been attached to the Smart Decentralized Grid track.', type: 'announcement', timestamp: '2026-06-18T08:30:00Z', read: true },
    { id: 'not-03', title: 'Registration Deadline', content: 'Registration closes in exactly 24 hours. Ensure all team members have completed their profiles.', type: 'deadline', timestamp: '2026-06-17T18:00:00Z', read: true }
  ],

  twinAssets: [
    { id: 'room-01', name: 'Exhibition Arena A', floor: 1, temperature: 21.8, occupancy: 78, maxOccupancy: 150, status: 'active', activeChallenge: 'Innovation Showcases' },
    { id: 'room-02', name: 'Smart Power Lab', floor: 1, temperature: 24.1, occupancy: 12, maxOccupancy: 30, status: 'warning', activeChallenge: 'Smart Decentralized Grid Management' },
    { id: 'room-03', name: 'Robotics Control Room', floor: 2, temperature: 20.5, occupancy: 42, maxOccupancy: 50, status: 'active', activeChallenge: 'Autonomous Mobile Robot Fleet Coordination' },
    { id: 'room-04', name: 'Seminar Hall B', floor: 2, temperature: 22.0, occupancy: 0, maxOccupancy: 80, status: 'idle' }
  ],
  pinnedTeamIds: [],

  // Actions implementations
  setRole: (role) => set({ role, activeTab: role === 'guest' ? 'home' : 'dashboard' }),
  setTab: (activeTab) => set({ activeTab }),
  setSelectedChallengeId: (selectedChallengeId) => set({ selectedChallengeId }),

  togglePinTeam: (teamId) => set((state) => {
    const isPinned = state.pinnedTeamIds.includes(teamId);
    const pinnedTeamIds = isPinned
      ? state.pinnedTeamIds.filter(id => id !== teamId)
      : [...state.pinnedTeamIds, teamId];
    return { pinnedTeamIds };
  }),

  toggleCompareChallenge: (id) => set((state) => {
    const isCompared = state.compareChallengeIds.includes(id);
    if (isCompared) {
      return { compareChallengeIds: state.compareChallengeIds.filter(item => item !== id) };
    } else {
      if (state.compareChallengeIds.length >= 3) return {}; // limit to 3
      return { compareChallengeIds: [...state.compareChallengeIds, id] };
    }
  }),

  clearCompareChallenges: () => set({ compareChallengeIds: [] }),

  updateUserProfile: (updates) => set((state) => {
    const updatedUser = { ...state.user, ...updates };

    // Calculate profile strength dynamically
    let strength = 20; // baseline
    if (updatedUser.firstName && updatedUser.lastName) strength += 15;
    if (updatedUser.phone) strength += 10;
    if (updatedUser.college && updatedUser.branch) strength += 20;
    if (updatedUser.skills.length > 0) strength += 15;
    if (updatedUser.resumeUploaded) strength += 10;
    if (updatedUser.collegeIdUploaded) strength += 10;

    updatedUser.profileStrength = Math.min(100, strength);
    return { user: updatedUser };
  }),

  createTeam: (teamName, challengeId) => set((state) => {
    const selectedChallenge = state.challenges.find(c => c.id === challengeId);
    const newTeam: Team = {
      id: `t-${Date.now()}`,
      name: teamName,
      code: `ABB-${teamName.substring(0, 5).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      track: selectedChallenge ? selectedChallenge.track : 'General',
      challengeId,
      progress: 15,
      collaborationScore: 100,
      submissions: [],
      members: [
        {
          id: 'm-leader',
          fullName: state.user.fullName,
          email: state.user.email,
          role: 'Leader',
          skills: state.user.skills,
          status: 'active',
          college: state.user.college,
          year: state.user.year
        }
      ],
      college: state.user.college,
      progressHistory: [
        { date: new Date().toISOString(), progress: 15, note: 'Team created and leader onboarded' }
      ]
    };

    // Increment participants counter on challenge
    const updatedChallenges = state.challenges.map(c =>
      c.id === challengeId ? { ...c, participantsCount: c.participantsCount + 1 } : c
    );

    // Track activity feed
    const newNotification: NotificationItem = {
      id: `not-${Date.now()}`,
      title: 'Team Registered Successfully',
      content: `You created team ${teamName} under ${selectedChallenge?.title} track. Share your code ${newTeam.code} to invite members!`,
      type: 'announcement',
      timestamp: new Date().toISOString(),
      read: false
    };

    return {
      team: newTeam,
      allTeams: [...state.allTeams, newTeam],
      challenges: updatedChallenges,
      notifications: [newNotification, ...state.notifications]
    };
  }),

  joinTeam: (code) => set((state) => {
    const foundTeam = state.allTeams.find(t => t.code === code);
    if (!foundTeam) return {}; // UI handles validation error

    // Add user as a developer member in this team
    const updatedMembers = [
      ...foundTeam.members,
      {
        id: `m-${Date.now()}`,
        fullName: state.user.fullName,
        email: state.user.email,
        role: 'Developer' as const,
        skills: state.user.skills,
        status: 'active' as const,
        college: state.user.college,
        year: state.user.year
      }
    ];

    const updatedTeam = { ...foundTeam, members: updatedMembers };
    const updatedAllTeams = state.allTeams.map(t => t.id === foundTeam.id ? updatedTeam : t);

    const newNotification: NotificationItem = {
      id: `not-${Date.now()}`,
      title: 'Joined Team',
      content: `You have successfully joined the team ${foundTeam.name}. Welcome aboard!`,
      type: 'announcement',
      timestamp: new Date().toISOString(),
      read: false
    };

    return {
      team: updatedTeam,
      allTeams: updatedAllTeams,
      notifications: [newNotification, ...state.notifications]
    };
  }),

  inviteMember: (email, role) => set((state) => {
    if (!state.team) return {};
    const updatedMembers = [
      ...state.team.members,
      {
        id: `m-${Date.now()}`,
        fullName: email.split('@')[0], // placeholder name
        email,
        role,
        skills: ['Pending Onboarding'],
        status: 'invited' as const
      }
    ];
    const updatedTeam = { ...state.team, members: updatedMembers };
    const updatedAllTeams = state.allTeams.map(t => t.id === state.team!.id ? updatedTeam : t);

    return {
      team: updatedTeam,
      allTeams: updatedAllTeams
    };
  }),

  removeMember: (memberId) => set((state) => {
    if (!state.team) return {};
    const updatedMembers = state.team.members.filter(m => m.id !== memberId);
    const updatedTeam = { ...state.team, members: updatedMembers };
    const updatedAllTeams = state.allTeams.map(t => t.id === state.team!.id ? updatedTeam : t);

    return {
      team: updatedTeam,
      allTeams: updatedAllTeams
    };
  }),

  submitProject: (githubUrl, demoUrl, description, presentationFile) => set((state) => {
    if (!state.team) return {};
    const newSubmission: Submission = {
      id: `sub-${Date.now()}`,
      teamId: state.team.id,
      challengeId: state.team.challengeId,
      submittedAt: new Date().toISOString(),
      githubUrl,
      demoUrl,
      description,
      presentationFile,
      status: 'pending',
      facultyStatus: 'pending'
    };

    const updatedTeam = {
      ...state.team,
      progress: 100,
      submissions: [...state.team.submissions, newSubmission]
    };

    const updatedAllTeams = state.allTeams.map(t => {
      if (t.id === state.team!.id) {
        return updatedTeam;
      }
      return t;
    });

    const newNotification: NotificationItem = {
      id: `not-${Date.now()}`,
      title: 'Submission Uploaded',
      content: `Your project submission for ${state.team.name} has been received. ABB evaluation panels have been notified.`,
      type: 'submission',
      timestamp: new Date().toISOString(),
      read: false
    };

    return {
      team: updatedTeam,
      allTeams: updatedAllTeams,
      notifications: [newNotification, ...state.notifications]
    };
  }),

  gradeTeamSubmission: (teamId, submissionId, judgeName, scores, comment, customFinalScore) => set((state) => {
    const updatedAllTeams = state.allTeams.map(t => {
      if (t.id === teamId) {
        const updatedSubmissions = t.submissions.map(sub => {
          if (sub.id === submissionId) {
            const algoItem = scores.find(s => s.criteria.toLowerCase().includes('algorithm') || s.criteria.toLowerCase().includes('algorithmic'));
            const uiItem = scores.find(s => s.criteria.toLowerCase().includes('ui') || s.criteria.toLowerCase().includes('ux') || s.criteria.toLowerCase().includes('design'));
            const archItem = scores.find(s => s.criteria.toLowerCase().includes('scalability') || s.criteria.toLowerCase().includes('architecture') || s.criteria.toLowerCase().includes('technical'));
            const presItem = scores.find(s => s.criteria.toLowerCase().includes('presentation'));

            const algo = algoItem ? algoItem.score : 0;
            const ui = uiItem ? uiItem.score : 0;
            const arch = archItem ? archItem.score : 0;
            const pres = presItem ? presItem.score : 0;

            const hasAllCriteria = algoItem && uiItem && archItem && presItem;
            const finalScore = typeof customFinalScore === 'number'
              ? customFinalScore
              : (hasAllCriteria
                ? Math.round((algo * 0.4) + (ui * 0.3) + (arch * 0.2) + (pres * 0.1))
                : Math.round(scores.reduce((sum, item) => sum + item.score, 0) / scores.length));

            const existingFeedback = sub.feedback || [];
            return {
              ...sub,
              status: 'reviewed' as const,
              score: finalScore,
              weightedScore: finalScore,
              feedback: [...existingFeedback, { judgeName, scores, comment }]
            };
          }
          return sub;
        });
        return { ...t, submissions: updatedSubmissions };
      }
      return t;
    });

    let updatedTeam = state.team;
    if (state.team && state.team.id === teamId) {
      const teamInDb = updatedAllTeams.find(t => t.id === teamId);
      if (teamInDb) updatedTeam = teamInDb;
    }

    const targetTeamName = state.allTeams.find(t => t.id === teamId)?.name || 'Your Team';

    const newNotification: NotificationItem = {
      id: `not-${Date.now()}`,
      title: 'Submission Graded',
      content: `Submission for team ${targetTeamName} has been reviewed by ${judgeName}.`,
      type: 'award',
      timestamp: new Date().toISOString(),
      read: false
    };

    return {
      allTeams: updatedAllTeams,
      team: updatedTeam,
      notifications: [newNotification, ...state.notifications]
    };
  }),

  updateTeamProgress: (teamId, progress, note) => set((state) => {
    const date = new Date().toISOString();
    const updatedAllTeams = state.allTeams.map(t => {
      if (t.id === teamId) {
        const progressHistory = t.progressHistory || [];
        return {
          ...t,
          progress,
          progressHistory: [...progressHistory, { date, progress, note: note || 'Progress update' }]
        };
      }
      return t;
    });

    let updatedTeam = state.team;
    if (state.team && state.team.id === teamId) {
      const teamInDb = updatedAllTeams.find(t => t.id === teamId);
      if (teamInDb) updatedTeam = teamInDb;
    }

    const teamName = state.allTeams.find(t => t.id === teamId)?.name || 'Team';

    const newNotification: NotificationItem = {
      id: `not-${Date.now()}`,
      title: 'Progress Updated',
      content: `Team ${teamName} updated progress to ${progress}%.`,
      type: 'announcement',
      timestamp: date,
      read: false
    };

    return {
      allTeams: updatedAllTeams,
      team: updatedTeam,
      notifications: [newNotification, ...state.notifications]
    };
  }),

  updateSubmissionFacultyNote: (submissionId, note, status) => set((state) => {
    let teamIdOfSub = '';
    const updatedAllTeams = state.allTeams.map(t => {
      const hasSubmission = t.submissions.some(s => s.id === submissionId);
      if (hasSubmission) {
        teamIdOfSub = t.id;
        const updatedSubmissions = t.submissions.map(sub => {
          if (sub.id === submissionId) {
            return {
              ...sub,
              facultyNote: note,
              facultyStatus: status
            };
          }
          return sub;
        });
        return { ...t, submissions: updatedSubmissions };
      }
      return t;
    });

    let updatedTeam = state.team;
    if (state.team && state.team.id === teamIdOfSub) {
      const teamInDb = updatedAllTeams.find(t => t.id === teamIdOfSub);
      if (teamInDb) updatedTeam = teamInDb;
    }

    const teamName = state.allTeams.find(t => t.id === teamIdOfSub)?.name || 'Team';

    const newNotification: NotificationItem = {
      id: `not-${Date.now()}`,
      title: status === 'endorsed' ? 'Submission Endorsed' : 'Submission Flagged',
      content: `Faculty has ${status} the submission for team ${teamName}. Note: ${note}`,
      type: 'submission',
      timestamp: new Date().toISOString(),
      read: false
    };

    return {
      allTeams: updatedAllTeams,
      team: updatedTeam,
      notifications: [newNotification, ...state.notifications]
    };
  }),

  requestMentor: (type, category, description, priority, preferredTime) => set((state) => {
    const teamName = state.team ? state.team.name : 'Individual Participant';
    const challengeTitle = state.team
      ? (state.challenges.find(c => c.id === state.team!.challengeId)?.title || 'General Development')
      : 'General Development';

    const newRequest: MentorRequest = {
      id: `req-${Date.now()}`,
      teamId: state.team ? state.team.id : 'indiv',
      teamName,
      challengeTitle,
      type,
      description,
      priority,
      preferredTime,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const newNotification: NotificationItem = {
      id: `not-${Date.now()}`,
      title: 'Mentor Ticket Submitted',
      content: `Your request for ${type} assistance has been successfully queued. Priority: ${priority}.`,
      type: 'mentor',
      timestamp: new Date().toISOString(),
      read: false
    };

    const toastId = `toast-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter(t => t.id !== toastId) }));
    }, 4000);

    return {
      mentorRequests: [...state.mentorRequests, newRequest],
      notifications: [newNotification, ...state.notifications],
      toasts: [...state.toasts, { id: toastId, title: 'Mentor Ticket Submitted', message: newNotification.content, type: 'info' }]
    };
  }),

  assignMentor: (requestId, mentorName) => set((state) => {
    const updatedRequests = state.mentorRequests.map(req =>
      req.id === requestId ? { ...req, status: 'assigned' as const, mentorName } : req
    );

    const targetReq = state.mentorRequests.find(r => r.id === requestId);
    const newNotification: NotificationItem = {
      id: `not-${Date.now()}`,
      title: 'Mentor Assigned',
      content: `${mentorName} has been assigned to help your team with "${targetReq?.type}" ticket.`,
      type: 'mentor',
      timestamp: new Date().toISOString(),
      read: false
    };

    const toastId = `toast-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter(t => t.id !== toastId) }));
    }, 4000);

    return {
      mentorRequests: updatedRequests,
      notifications: [newNotification, ...state.notifications],
      toasts: [...state.toasts, { id: toastId, title: 'Mentor Assigned', message: newNotification.content, type: 'info' }]
    };
  }),

  resolveMentorRequest: (requestId) => set((state) => {
    const updatedRequests = state.mentorRequests.map(req =>
      req.id === requestId ? { ...req, status: 'resolved' as const } : req
    );
    return { mentorRequests: updatedRequests };
  }),

  toggleChallengeBookmark: (id) => set((state) => {
    const updatedChallenges = state.challenges.map(c =>
      c.id === id ? { ...c, bookmarked: !c.bookmarked } : c
    );
    return { challenges: updatedChallenges };
  }),

  markNotificationAsRead: (id) => set((state) => {
    const updatedNotifications = state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    return { notifications: updatedNotifications };
  }),

  markAllNotificationsAsRead: () => set((state) => {
    const updatedNotifications = state.notifications.map(n => ({ ...n, read: true }));
    return { notifications: updatedNotifications };
  }),

  updateTwinAsset: (id, updates) => set((state) => {
    const updatedAssets = state.twinAssets.map(asset =>
      asset.id === id ? { ...asset, ...updates } : asset
    );
    return { twinAssets: updatedAssets };
  }),

  addNotification: (title, content, type) => set((state) => {
    const newNotification: NotificationItem = {
      id: `not-${Date.now()}`,
      title,
      content,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    const toastType = type === 'submission' ? 'success' : type === 'deadline' ? 'error' : 'info';
    const toastId = `toast-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter(t => t.id !== toastId) }));
    }, 4000);
    return {
      notifications: [newNotification, ...state.notifications],
      toasts: [...state.toasts, { id: toastId, title, message: content, type: toastType }]
    };
  }),

  addCalendarEvent: (title, start, end, type, description) => set((state) => {
    const newEvent: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title,
      start,
      end,
      type,
      description
    };
    return { calendarEvents: [...state.calendarEvents, newEvent] };
  }),

  addChallenge: (newChallenge) => set((state) => {
    const challenge: Challenge = {
      ...newChallenge,
      participantsCount: 0,
      bookmarked: false
    };
    return {
      challenges: [...state.challenges, challenge]
    };
  }),

  deleteChallenge: (id) => set((state) => ({
    challenges: state.challenges.filter(c => c.id !== id)
  })),

  updateChallengeProblemStatements: (challengeId, problemStatements) => set((state) => {
    const updatedChallenges = state.challenges.map((c) =>
      c.id === challengeId ? { ...c, problemStatements } : c
    );
    return { challenges: updatedChallenges };
  }),

  setCountdownDate: (countdownDate) => set({ countdownDate }),
  setActivePhaseIndex: (activePhaseIndex) => set({ activePhaseIndex }),
  addPhase: (name, date, description) => set((state) => {
    const newPhase: Phase = {
      id: `p-${Date.now()}`,
      name,
      date,
      description
    };
    return { phases: [...state.phases, newPhase] };
  }),
  updatePhase: (id, name, date, description) => set((state) => {
    const updatedPhases = state.phases.map((p) =>
      p.id === id ? { ...p, name, date, description } : p
    );
    return { phases: updatedPhases };
  }),
  deletePhase: (id) => set((state) => {
    const updatedPhases = state.phases.filter((p) => p.id !== id);
    const newActiveIndex = Math.min(state.activePhaseIndex, Math.max(0, updatedPhases.length - 1));
    return {
      phases: updatedPhases,
      activePhaseIndex: newActiveIndex
    };
  }),

  setEvaluationRound: (round) => set((state) => {
    const title = `Evaluation Round ${round} Started`;
    const content = `Admin has initialized Round ${round} evaluation. Mentors can now submit reviews and students can update their checklists.`;
    const newNotification: NotificationItem = {
      id: `not-${Date.now()}`,
      title,
      content,
      type: 'announcement',
      timestamp: new Date().toISOString(),
      read: false
    };
    return {
      evaluationRound: round,
      notifications: [newNotification, ...state.notifications],
      toasts: [...state.toasts, { id: `toast-${Date.now()}-${Math.floor(Math.random() * 1000000)}`, title, message: content, type: 'info' }]
    };
  }),

  assignMentorToTeam: (teamId, mentorId) => set((state) => {
    const mentor = state.mentors.find(m => m.id === mentorId);
    const mentorName = mentor ? mentor.name : mentorId;

    const updatedAllTeams = state.allTeams.map((t) =>
      t.id === teamId ? { ...t, assignedMentorId: mentorId, assignedMentorName: mentorName } : t
    );

    let updatedTeam = state.team;
    if (state.team && state.team.id === teamId) {
      const teamInDb = updatedAllTeams.find(t => t.id === teamId);
      if (teamInDb) updatedTeam = teamInDb;
    }

    const teamName = state.allTeams.find(t => t.id === teamId)?.name || 'Team';
    const newNotification: NotificationItem = {
      id: `not-${Date.now()}`,
      title: 'Mentor Assigned',
      content: `Mentor ${mentorName} has been assigned to Team ${teamName}.`,
      type: 'mentor',
      timestamp: new Date().toISOString(),
      read: false
    };

    return {
      allTeams: updatedAllTeams,
      team: updatedTeam,
      notifications: [newNotification, ...state.notifications],
      toasts: [...state.toasts, {
        id: `toast-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        title: 'Mentor Assigned',
        message: `Assigned ${mentorName} to ${teamName}.`,
        type: 'success'
      }]
    };
  }),

  updateProposedFeatures: (teamId, features) => set((state) => {
    const updatedAllTeams = state.allTeams.map((t) =>
      t.id === teamId ? { ...t, proposedFeatures: features } : t
    );

    let updatedTeam = state.team;
    if (state.team && state.team.id === teamId) {
      const teamInDb = updatedAllTeams.find(t => t.id === teamId);
      if (teamInDb) updatedTeam = teamInDb;
    }

    return {
      allTeams: updatedAllTeams,
      team: updatedTeam
    };
  }),

  submitMentorEvaluation: (teamId, round, mentorName, scores, checklistRemarks, comment, progress) => set((state) => {
    const averageScore = scores.reduce((sum, s) => sum + s.score, 0) / (scores.length || 1);
    const verifiedChecklistCount = checklistRemarks.filter(r => r.implemented).length;
    const checklistScore = verifiedChecklistCount * 10;
    const pointsEarned = Math.round(averageScore + checklistScore);

    const targetTeam = state.allTeams.find(t => t.id === teamId);
    if (!targetTeam) return {};

    const currentEvaluations = targetTeam.mentorEvaluations || [];
    const currentBadges = targetTeam.badges || [];
    const previousTotalPoints = targetTeam.points || 0;

    const filteredEvaluations = currentEvaluations.filter(e => e.round !== round);

    const newEvaluation = {
      round,
      mentorName,
      scores,
      checklistRemarks,
      comment,
      pointsEarned,
      submittedAt: new Date().toISOString()
    };

    const updatedEvaluations = [...filteredEvaluations, newEvaluation];
    const newTotalPoints = updatedEvaluations.reduce((sum, evalItem) => sum + evalItem.pointsEarned, 0);

    const newBadges = [...currentBadges];

    if (round === 1 && averageScore >= 90 && !newBadges.includes("Pitch Master")) {
      newBadges.push("Pitch Master");
    }
    if (round === 2 && verifiedChecklistCount >= 3 && !newBadges.includes("MVP Builder")) {
      newBadges.push("MVP Builder");
    }
    if (round === 3 && !newBadges.includes("UIUX Wizard")) {
      const uiuxScore = scores.find(s => s.criteria.toLowerCase().includes('ui') || s.criteria.toLowerCase().includes('ux'))?.score ?? averageScore;
      if (uiuxScore >= 90) {
        newBadges.push("UIUX Wizard");
      }
    }
    if (round === 2 && !newBadges.includes("Stellar Growth")) {
      const r1Eval = updatedEvaluations.find(e => e.round === 1);
      if (r1Eval) {
        const r1Points = r1Eval.pointsEarned;
        if (pointsEarned - r1Points >= 40) {
          newBadges.push("Stellar Growth");
        }
      }
    }
    if (newTotalPoints >= 250 && !newBadges.includes("Overachiever")) {
      newBadges.push("Overachiever");
    }

    let updatedProposedFeatures = targetTeam.proposedFeatures || [];
    checklistRemarks.forEach(remark => {
      updatedProposedFeatures = updatedProposedFeatures.map(f =>
        f.name === remark.featureName ? { ...f, implemented: remark.implemented } : f
      );
    });

    const updatedAllTeams = state.allTeams.map(t => {
      if (t.id === teamId) {
        const updatedProgressHistory = [
          ...(t.progressHistory || []),
          { date: new Date().toISOString(), progress, note: `Round ${round} Evaluation: Progress set by mentor ${mentorName}` }
        ];
        return {
          ...t,
          points: newTotalPoints,
          previousPoints: previousTotalPoints,
          mentorEvaluations: updatedEvaluations,
          badges: newBadges,
          proposedFeatures: updatedProposedFeatures,
          progress,
          progressHistory: updatedProgressHistory
        };
      }
      return t;
    });

    let updatedTeam = state.team;
    if (state.team && state.team.id === teamId) {
      const teamInDb = updatedAllTeams.find(t => t.id === teamId);
      if (teamInDb) updatedTeam = teamInDb;
    }

    const dateStr = new Date().toISOString();
    const newNotification: NotificationItem = {
      id: `not-${Date.now()}`,
      title: `Round ${round} Evaluation Submitted`,
      content: `Mentor ${mentorName} submitted evaluation for Team ${targetTeam.name}. Points earned: ${pointsEarned}.`,
      type: 'mentor',
      timestamp: dateStr,
      read: false
    };

    return {
      allTeams: updatedAllTeams,
      team: updatedTeam,
      notifications: [newNotification, ...state.notifications],
      toasts: [...state.toasts, {
        id: `toast-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        title: `Evaluation Submitted`,
        message: `Team ${targetTeam.name} earned ${pointsEarned} points in Round ${round}!`,
        type: 'success'
      }]
    };
  })
}));
