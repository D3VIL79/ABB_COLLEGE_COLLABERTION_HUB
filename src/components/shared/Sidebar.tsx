'use client';

import { useState } from 'react';
import { usePlatformStore, UserRole } from '@/store/usePlatformStore';
import { 
  Home, Users, BookOpen, FileBadge, Building2, BarChart3, Settings, 
  ChevronLeft, ChevronRight, ShieldCheck, ClipboardCheck, MessageSquareCode, 
  HelpCircle, UserCheck, Trophy, MapPin, Award, Shield, GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';

export function Sidebar() {
  const { role, activeTab, setTab, team, notifications, mentorRequests, allTeams } = usePlatformStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (role === 'guest') return null;

  // Define sidebar menu options by active context role
  const menuConfig: Record<Exclude<UserRole, 'guest'>, { id: string; label: string; icon: any; badge?: number }[]> = {
    student: [
      { id: 'dashboard', label: 'Home', icon: Home },
      { id: 'explorer', label: 'Challenges', icon: Trophy },
      { id: 'twin', label: 'Venue Map', icon: MapPin },
      { id: 'leaderboard', label: 'Leaderboard', icon: Award },
      { id: 'team', label: 'Submissions', icon: ClipboardCheck },
      { id: 'help-desk', label: 'Help Desk', icon: HelpCircle },
      { id: 'profile', label: 'Settings', icon: Settings },
    ],
    staff: [
      { id: 'teams', label: 'Team Roster', icon: Users },
      { id: 'submissions', label: 'Submissions', icon: ClipboardCheck, badge: allTeams.flatMap(t => t.submissions).length },
      { id: 'requests', label: 'Support Queue', icon: MessageSquareCode, badge: mentorRequests.filter(r => r.status === 'pending').length },
      { id: 'manage-events', label: 'Challenge Config', icon: Trophy },
      { id: 'profile', label: 'Settings', icon: Settings },
    ],
    admin: [
      { id: 'dashboard', label: 'Event Hub', icon: Home },
      { id: 'manage-events', label: 'Manage Events', icon: Trophy },
      { id: 'analytics', label: 'Performance', icon: BarChart3 },
      { id: 'profile', label: 'Settings', icon: Settings },
    ],
    judge: [
      { id: 'dashboard', label: 'Assessor Hub', icon: Home },
      { id: 'judge', label: 'Grade Teams', icon: ShieldCheck, badge: 1 },
      { id: 'analytics', label: 'Leaderboard', icon: BarChart3 },
      { id: 'profile', label: 'Settings', icon: Settings },
    ],
    mentor: [
      { id: 'dashboard', label: 'Mentor Hub', icon: Home },
      { id: 'mentor', label: 'Help Requests', icon: MessageSquareCode, badge: mentorRequests.filter(r => r.status === 'pending').length },
      { id: 'analytics', label: 'My Impact', icon: BarChart3 },
      { id: 'twin', label: 'Venue Map', icon: MapPin },
      { id: 'profile', label: 'Settings', icon: Settings },
    ]
  };

  const activeMenus = menuConfig[role as Exclude<UserRole, 'guest'>] || [];

  return (
    <motion.div
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative hidden md:flex flex-col h-screen border-r border-white/5 bg-black shrink-0 z-40 select-none"
    >
      {/* Sidebar Header / Logo (doubled size, w-20 h-20) */}
      <div className={`p-4 border-b border-white/5 flex items-center justify-center ${isCollapsed ? 'py-6' : 'py-5'}`}>
        <img
          src="/abb-logo.png"
          alt="ABB Logo"
          className={`${isCollapsed ? 'w-8 h-8' : 'w-20 h-20'} object-contain transition-all duration-300`}
        />
      </div>
      {/* Collapse toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 -right-3 flex items-center justify-center w-6 h-6 rounded-full border border-border/50 bg-card shadow-md text-muted-foreground hover:text-foreground transition-all z-[60] cursor-pointer hover:scale-105"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Portal Role Indicator */}
      <div className="p-4 border-b border-border/20">
        <div className={`flex items-center gap-2.5 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="relative shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary">
            {role === 'student' && <Users className="w-4 h-4" />}
            {role === 'staff' && <GraduationCap className="w-4 h-4" />}
            {role === 'admin' && <Shield className="w-4 h-4" />}
            {role === 'judge' && <ShieldCheck className="w-4 h-4" />}
            {role === 'mentor' && <HelpCircle className="w-4 h-4" />}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h3 className="text-xs font-black tracking-wide text-foreground uppercase truncate">
                {role === 'student' ? 'Student Workspace' : role === 'staff' ? 'Faculty Workspace' : role === 'admin' ? 'ABB Admin console' : role === 'judge' ? 'Judge Panel' : 'Expert Mentor'}
              </h3>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">
                ABB College Hub
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Menu links */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {activeMenus.map((menu) => {
          const IconComponent = menu.icon;
          const isActive = menu.id === activeTab;

          return (
            <button
              key={menu.id}
              onClick={() => setTab(menu.id)}
              className={`w-full flex items-center p-3 transition-all duration-200 cursor-pointer relative group ${
                isCollapsed ? 'justify-center' : 'justify-start gap-4'
              } ${
                isActive 
                  ? 'bg-white/10 text-white rounded-lg' 
                  : 'text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg'
              }`}
            >
              {/* Active left indicator pill */}
              {isActive && (
                <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-primary rounded-r" />
              )}

              <div className="flex items-center gap-3">
                <IconComponent className={`w-4.5 h-4.5 shrink-0 transition-transform duration-300 group-hover:scale-105 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                {!isCollapsed && (
                  <span className="text-xs font-semibold tracking-wide">
                    {menu.label}
                  </span>
                )}
              </div>

              {/* Badges indicators */}
              {menu.badge !== undefined && menu.badge > 0 && (
                <span className={`flex items-center justify-center h-4 rounded-full font-bold text-[9px] px-1.5 shrink-0 ${
                  isActive ? 'bg-primary text-white' : 'bg-primary/20 text-primary'
                } ${isCollapsed ? 'absolute top-1.5 right-1.5 h-2 w-2 p-0' : ''}`}>
                  {!isCollapsed && menu.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Profile/Quick Stats summary */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border/20 bg-muted/5">
          <div className="rounded-xl border border-border/25 bg-background/30 p-2.5 flex flex-col gap-2">
            <div className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
              Event Status
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Network Status:</span>
              <span className="font-bold text-success flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Live
              </span>
            </div>
            {role === 'student' && (
              <div className="flex flex-col gap-1 text-[11px] mt-1 pt-1 border-t border-border/15">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Team Code:</span>
                  <span className="font-mono font-bold text-foreground truncate max-w-[100px]">
                    {team ? team.code : 'No Team'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
