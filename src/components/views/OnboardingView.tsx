'use client';

import { useState, useRef } from 'react';
import { usePlatformStore } from '@/store/usePlatformStore';
import { 
  User, School, Cpu, UploadCloud, Link as LinkIcon, CheckCircle2, 
  Eye, EyeOff, Sparkles, Plus, AlertCircle, FileText, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function OnboardingView() {
  const { user, updateUserProfile, setTab, createTeam, joinTeam } = usePlatformStore();
  
  // View states: 'login' | 'register' | 'otp' | 'welcome'
  const [authStep, setAuthStep] = useState<'login' | 'register' | 'otp' | 'welcome'>('login');
  const [regStep, setRegStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('abb-engineering-2026');

  // OTP inputs state (6 boxes)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Onboarding registration form values
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [college, setCollege] = useState(user.college);
  const [branch, setBranch] = useState(user.branch);
  const [year, setYear] = useState(user.year);
  const [skills, setSkills] = useState<string[]>(user.skills);
  const [newSkill, setNewSkill] = useState('');
  
  // Verification files mock
  const [resumeFile, setResumeFile] = useState<{ name: string; size: string } | null>(null);
  const [collegeIdFile, setCollegeIdFile] = useState<{ name: string; size: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isDragging, setIsDragging] = useState(false);

  // Social / Links
  const [linkedin, setLinkedin] = useState('https://linkedin.com/in/alex-chen');
  const [github, setGithub] = useState('https://github.com/alexchen');
  const [bio, setBio] = useState('Enthusiastic engineering student focusing on robotics, control systems, and industrial automation algorithms.');

  // Team Create/Join inside onboarding
  const [newTeamName, setNewTeamName] = useState('');
  const [joinTeamCode, setJoinTeamCode] = useState('');
  const [teamCreatedSuccess, setTeamCreatedSuccess] = useState(false);
  const [teamJoinedSuccess, setTeamJoinedSuccess] = useState(false);
  const [onboardError, setOnboardError] = useState('');

  // 1. Handle OTP focus navigation
  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next box if filled
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      otpRefs.current[5]?.focus();
    }
  };

  // 2. Handle Skills adding
  const handleAddSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // 3. Simulated file upload
  const simulateUpload = (fileType: 'resume' | 'id', fileName: string, fileSize: string) => {
    setUploadProgress(prev => ({ ...prev, [fileType]: 0 }));
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const current = prev[fileType] || 0;
        if (current >= 100) {
          clearInterval(interval);
          if (fileType === 'resume') {
            setResumeFile({ name: fileName, size: fileSize });
            updateUserProfile({ resumeUploaded: true });
          } else {
            setCollegeIdFile({ name: fileName, size: fileSize });
            updateUserProfile({ collegeIdUploaded: true });
          }
          return prev;
        }
        return { ...prev, [fileType]: current + 20 };
      });
    }, 150);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'resume' | 'id') => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const sizeStr = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
      simulateUpload(type, file.name, sizeStr);
    }
  };

  // 4. Save registration edits
  const handleNextStep = () => {
    if (regStep === 1) {
      if (!firstName || !lastName || !email) {
        setOnboardError('Please fill in required fields.');
        return;
      }
      setOnboardError('');
      updateUserProfile({ firstName, lastName, fullName: `${firstName} ${lastName}`, email, phone });
    }
    if (regStep === 2) {
      if (!college || !branch) {
        setOnboardError('Please fill in college profile info.');
        return;
      }
      setOnboardError('');
      updateUserProfile({ college, branch, year });
    }
    if (regStep === 3) {
      updateUserProfile({ skills });
    }
    if (regStep === 5) {
      updateUserProfile({ linkedin, github, bio });
      setAuthStep('otp'); // Trigger OTP verification phase
      return;
    }
    setRegStep(prev => prev + 1);
  };

  // OTP Verification validation
  const handleVerifyOtp = () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setOnboardError('Please fill in the 6-digit verification code.');
      return;
    }
    setOnboardError('');
    setAuthStep('welcome');
  };

  // Team controls in onboarding welcome screen
  const handleCreateTeamOnboard = () => {
    if (!newTeamName) {
      setOnboardError('Please input a valid team name.');
      return;
    }
    setOnboardError('');
    createTeam(newTeamName, 'ch-01'); // Selects smart grid challenge by default
    setTeamCreatedSuccess(true);
  };

  const handleJoinTeamOnboard = () => {
    if (!joinTeamCode) {
      setOnboardError('Please input a valid team join code.');
      return;
    }
    setOnboardError('');
    joinTeam(joinTeamCode);
    setTeamJoinedSuccess(true);
  };

  return (
    <div className="flex-1 w-full min-h-[calc(100vh-64px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background relative overflow-y-auto font-satoshi">
      {/* Absolute Ambient Background Lights */}
      <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] rounded-full bg-primary/5 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full bg-blue-500/5 blur-[80px]" />

      <div className="relative z-10 w-full max-w-lg rounded-2xl glass-panel p-6 sm:p-8 shadow-2xl border border-border/40 backdrop-blur-xl">
        <AnimatePresence mode="wait">
          {/* A. LOGIN PAGE */}
          {authStep === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-primary text-white font-extrabold flex items-center justify-center text-xl mx-auto shadow-md">
                  A
                </div>
                <h2 className="text-2xl font-black mt-4 text-foreground tracking-tight">
                  Welcome back to ABB College
                </h2>
                <p className="text-xs text-muted-foreground mt-1.5 font-sans leading-normal">
                  Frictionless SSO and credentials access for students, staff, judges, and mentors.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Campus Email Address
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.chen@college.edu"
                    className="w-full text-xs font-semibold p-3 rounded-xl border border-border/30 bg-background text-foreground outline-none focus:border-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex justify-between">
                    Authentication Password
                    <a href="#" className="text-primary hover:underline lowercase font-semibold normal-case">
                      Forgot Password?
                    </a>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full text-xs font-semibold p-3 pr-10 rounded-xl border border-border/30 bg-background text-foreground outline-none focus:border-primary/50"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" className="accent-primary rounded border-border" />
                  <label htmlFor="remember" className="text-xs text-muted-foreground font-semibold">
                    Remember this device for 30 days
                  </label>
                </div>

                <button
                  onClick={() => {
                    // Instantly login as registered student
                    usePlatformStore.getState().setRole('student');
                    setTab('dashboard');
                  }}
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-md shadow-primary/10"
                >
                  Authorize Profile
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-border/20"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Or New to Event?
                  </span>
                  <div className="flex-grow border-t border-border/20"></div>
                </div>

                <button
                  onClick={() => setAuthStep('register')}
                  className="w-full py-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 text-foreground border border-border/30 hover:border-border/60 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Create Participant Account
                </button>
              </div>
            </motion.div>
          )}

          {/* B. STEPPED REGISTRATION FORM */}
          {authStep === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-6"
            >
              {/* Progress Stepper header */}
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                  Step {regStep} of 5
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {regStep === 1 && 'Personal Info'}
                  {regStep === 2 && 'Academic'}
                  {regStep === 3 && 'Skills'}
                  {regStep === 4 && 'ID Verification'}
                  {regStep === 5 && 'Social Links'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(regStep / 5) * 100}%` }}
                />
              </div>

              {onboardError && (
                <div className="p-3 rounded-xl border border-danger/30 bg-danger/5 text-danger text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {onboardError}
                </div>
              )}

              {/* FORM VIEWS BY STEP */}
              <div className="min-h-[260px] flex flex-col justify-center">
                {/* Step 1: Personal Info */}
                {regStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">First Name *</label>
                        <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full text-xs font-semibold p-3 rounded-xl border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Last Name *</label>
                        <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full text-xs font-semibold p-3 rounded-xl border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Email Address *</label>
                      <input value={email} onChange={e => setEmail(e.target.value)} className="w-full text-xs font-semibold p-3 rounded-xl border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Phone Number</label>
                      <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full text-xs font-semibold p-3 rounded-xl border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" />
                    </div>
                  </div>
                )}

                {/* Step 2: Academic Info */}
                {regStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Engineering College / Institute *</label>
                      <input value={college} onChange={e => setCollege(e.target.value)} placeholder="Search College Name..." className="w-full text-xs font-semibold p-3 rounded-xl border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Branch / Department *</label>
                      <input value={branch} onChange={e => setBranch(e.target.value)} placeholder="Robotics, CSE, EE..." className="w-full text-xs font-semibold p-3 rounded-xl border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Current Semester / Year *</label>
                      <select value={year} onChange={e => setYear(e.target.value)} className="w-full text-xs font-semibold p-3 rounded-xl border border-border/30 bg-background text-foreground outline-none focus:border-primary/50">
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                        <option>Postgraduate</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Step 3: Skills selection */}
                {regStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Add Coding / Engineering Skills</label>
                      <div className="flex gap-2">
                        <input 
                          value={newSkill} 
                          onChange={e => setNewSkill(e.target.value)} 
                          onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                          placeholder="Python, ROS, React, C++..." 
                          className="w-full text-xs font-semibold p-3 rounded-xl border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" 
                        />
                        <button 
                          onClick={handleAddSkill}
                          className="px-4 rounded-xl bg-primary hover:bg-primary/95 text-white flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {skills.map(s => (
                        <span key={s} className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary">
                          {s}
                          <button onClick={() => handleRemoveSkill(s)} className="text-primary hover:text-foreground text-[10px] font-bold cursor-pointer">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: ID card & Resume Upload (Drag Drop States) */}
                {regStep === 4 && (
                  <div className="space-y-4">
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Verification Documents Upload</label>
                    
                    {/* Resume Area */}
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'resume')}
                      className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer ${
                        isDragging ? 'border-primary bg-primary/5' : 'border-border/50 bg-background/20 hover:border-border'
                      }`}
                    >
                      <UploadCloud className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                      <div className="text-xs font-bold text-foreground">Drag and Drop Resume (PDF)</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Maximum size: 5MB</div>
                      
                      {resumeFile && (
                        <div className="flex items-center justify-between gap-3 mt-3 p-2 bg-success/5 border border-success/20 rounded-lg text-left">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-success" />
                            <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">{resumeFile.name}</span>
                          </div>
                          <button onClick={() => setResumeFile(null)} className="text-muted-foreground hover:text-danger cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      )}

                      {uploadProgress.resume !== undefined && uploadProgress.resume < 100 && (
                        <div className="w-full bg-muted rounded-full h-1 mt-3">
                          <div className="bg-primary h-1 rounded-full transition-all" style={{ width: `${uploadProgress.resume}%` }} />
                        </div>
                      )}
                    </div>

                    {/* ID Card Area */}
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'id')}
                      className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer ${
                        isDragging ? 'border-primary bg-primary/5' : 'border-border/50 bg-background/20 hover:border-border'
                      }`}
                    >
                      <UploadCloud className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                      <div className="text-xs font-bold text-foreground">Drag and Drop College ID Card</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">JPEG or PDF files allowed</div>

                      {collegeIdFile && (
                        <div className="flex items-center justify-between gap-3 mt-3 p-2 bg-success/5 border border-success/20 rounded-lg text-left">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-success" />
                            <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">{collegeIdFile.name}</span>
                          </div>
                          <button onClick={() => setCollegeIdFile(null)} className="text-muted-foreground hover:text-danger cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      )}

                      {uploadProgress.id !== undefined && uploadProgress.id < 100 && (
                        <div className="w-full bg-muted rounded-full h-1 mt-3">
                          <div className="bg-primary h-1 rounded-full transition-all" style={{ width: `${uploadProgress.id}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 5: Social / Professional Profiles */}
                {regStep === 5 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <LinkIcon className="w-4 h-4 text-[#0A66C2]" /> LinkedIn Profile Link
                      </label>
                      <input value={linkedin} onChange={e => setLinkedin(e.target.value)} className="w-full text-xs font-semibold p-3 rounded-xl border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <LinkIcon className="w-4 h-4 text-foreground" /> GitHub Repository Profile
                      </label>
                      <input value={github} onChange={e => setGithub(e.target.value)} className="w-full text-xs font-semibold p-3 rounded-xl border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Brief Bio / Interests</label>
                      <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full text-xs font-semibold p-3 rounded-xl border border-border/30 bg-background text-foreground outline-none focus:border-primary/50 resize-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-4">
                {regStep > 1 && (
                  <button
                    onClick={() => setRegStep(prev => prev - 1)}
                    className="flex-1 py-3 rounded-xl bg-muted/40 hover:bg-muted/70 text-foreground border border-border/30 font-bold text-xs uppercase cursor-pointer"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNextStep}
                  className="flex-2 py-3 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10"
                >
                  {regStep === 5 ? 'Finalize Profile' : 'Continue'}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* C. OTP VERIFICATION VIEW */}
          {authStep === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-6 text-center"
            >
              <div>
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
                <h2 className="text-xl font-black text-foreground">Verify Your Campus Identity</h2>
                <p className="text-xs text-muted-foreground mt-1.5 font-sans leading-normal">
                  We have dispatched a 6-digit confirmation ticket code to <br className="hidden sm:inline" />
                  <span className="font-bold text-foreground">{email}</span>.
                </p>
              </div>

              {onboardError && (
                <div className="p-3 rounded-xl border border-danger/30 bg-danger/5 text-danger text-xs font-semibold flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {onboardError}
                </div>
              )}

              {/* OTP Multi-boxes */}
              <div className="flex justify-center gap-2.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpRefs.current[idx] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    onPaste={handleOtpPaste}
                    className="w-10 h-12 rounded-lg bg-background border border-border/40 focus:border-primary text-center text-lg font-bold outline-none shadow-sm focus:ring-1 focus:ring-primary/20"
                  />
                ))}
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleVerifyOtp}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  Verify Ticket Code
                </button>
                <div className="text-[11px] text-muted-foreground">
                  Didn't receive verification email?{' '}
                  <button onClick={() => setOtp(['4', '8', '2', '0', '1', '9'])} className="text-primary hover:underline font-semibold cursor-pointer">
                    Resend Code
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* D. ONBOARDING WELCOME / DIRECT ACTION SCREEN */}
          {authStep === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-6"
            >
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-bounce" />
                <h2 className="text-2xl font-black text-foreground">Welcome to ABB Ecosystem!</h2>
                <p className="text-xs text-muted-foreground mt-1 font-sans">
                  Alex, your campus engineering profile is now verified.
                </p>
              </div>

              {/* Profile strength summary */}
              <div className="p-4 rounded-xl border border-border/30 bg-muted/15 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-muted-foreground">Profile Completion Score</span>
                  <span className="text-success">{user.profileStrength}% Strength</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-success transition-all duration-700" style={{ width: `${user.profileStrength}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal font-sans pt-1">
                  Complete other details in your Dashboard Settings tab (e.g. uploading college ID) to achieve maximum visibility for judges.
                </p>
              </div>

              {onboardError && (
                <div className="p-3 rounded-xl border border-danger/30 bg-danger/5 text-danger text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {onboardError}
                </div>
              )}

              {/* Actions box: Create or Join Team */}
              <div className="space-y-4">
                {/* Create team block */}
                <div className="p-4 rounded-xl border border-border/25 bg-background space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Option A: Create a New Team
                  </h4>
                  {teamCreatedSuccess ? (
                    <div className="p-2 text-xs font-semibold text-success flex items-center gap-1.5 bg-success/5 border border-success/20 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      Team created successfully! Proceed to portal.
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="Team name (e.g. CyberPulse)"
                        className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50"
                      />
                      <button
                        onClick={handleCreateTeamOnboard}
                        className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider rounded-lg shrink-0 cursor-pointer"
                      >
                        Create
                      </button>
                    </div>
                  )}
                </div>

                {/* Join team block */}
                <div className="p-4 rounded-xl border border-border/25 bg-background space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Option B: Join Existing Team
                  </h4>
                  {teamJoinedSuccess ? (
                    <div className="p-2 text-xs font-semibold text-success flex items-center gap-1.5 bg-success/5 border border-success/20 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      Joined team successfully! Proceed to portal.
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={joinTeamCode}
                        onChange={(e) => setJoinTeamCode(e.target.value)}
                        placeholder="Invitation Code (e.g. ABB-CPLSE-98)"
                        className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50"
                      />
                      <button
                        onClick={handleJoinTeamOnboard}
                        className="px-4 py-2 bg-foreground hover:bg-foreground/90 text-background dark:bg-card dark:text-foreground font-bold text-xs uppercase tracking-wider rounded-lg shrink-0 border border-border/40 cursor-pointer"
                      >
                        Join
                      </button>
                    </div>
                  )}
                </div>

                {/* Proceed button */}
                <button
                  onClick={() => {
                    usePlatformStore.getState().setRole('student');
                    setTab('dashboard');
                  }}
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-md shadow-primary/10"
                >
                  Enter Student Portal Workspace
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
