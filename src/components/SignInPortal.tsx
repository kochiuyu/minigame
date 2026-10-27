import React, { useState } from 'react';
import { AuthSession } from '../types';
import { generateNickname } from '../utils/nicknameGenerator';
import { generateFreshSampleStudent } from '../utils/trialGenerator';

interface SignInPortalProps {
  onSignIn: (session: AuthSession) => void;
  initialStudentInfo?: { name: string; id: string; alias: string };
}

export const SignInPortal: React.FC<SignInPortalProps> = ({
  onSignIn,
  initialStudentInfo = { name: '', id: '', alias: '' }
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'instructor'>('student');

  // Student Form State
  const [roomCode, setRoomCode] = useState('DOTE-3090');
  const [studentName, setStudentName] = useState(initialStudentInfo.name || '');
  const [studentId, setStudentId] = useState(initialStudentInfo.id || '');
  const [studentAlias, setStudentAlias] = useState(() => initialStudentInfo.alias || generateNickname());
  const [studentError, setStudentError] = useState('');

  // Instructor Form State
  const [instructorName, setInstructorName] = useState('Prof. Chiu');
  const [instructorCode, setInstructorCode] = useState('DOTE-3090');
  const [passcode, setPasscode] = useState('3090');
  const [instructorError, setInstructorError] = useState('');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setStudentError('Please enter a valid Room PIN / Code.');
      return;
    }
    if (!studentName.trim()) {
      setStudentError('Please enter your full name.');
      return;
    }
    if (!studentId.trim()) {
      setStudentError('Please enter your student ID.');
      return;
    }
    if (!studentAlias.trim()) {
      setStudentError('Please choose a classroom alias / codename.');
      return;
    }

    setStudentError('');
    onSignIn({
      role: 'student',
      name: studentName.trim(),
      id: studentId.trim(),
      alias: studentAlias.trim(),
      roomCode: roomCode.trim().toUpperCase()
    });
  };

  const handleInstructorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructorName.trim()) {
      setInstructorError('Please enter instructor name.');
      return;
    }
    if (passcode.trim() !== '3090' && passcode.trim().toLowerCase() !== 'admin') {
      setInstructorError('Invalid access passcode. (Demo passcode: 3090)');
      return;
    }

    setInstructorError('');
    onSignIn({
      role: 'instructor',
      name: instructorName.trim(),
      roomCode: instructorCode.trim().toUpperCase()
    });
  };

  const handleQuickStudentDemo = () => {
    const student = generateFreshSampleStudent();
    setStudentName(student.name);
    setStudentId(student.id);
    setStudentAlias(student.alias);
    setRoomCode(student.roomCode);
    setStudentError('');
  };

  const handleRerollNickname = () => {
    setStudentAlias(generateNickname());
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Branding Bar */}
      <header className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white font-mono text-base shadow-sm">
            Γ
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight block leading-none">
              DOTE 3090
            </span>
            <span className="text-xs text-slate-400 font-medium tracking-wide">
              Game Theory Experiment Lab
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium hidden sm:block">
          Interactive MobLab Classroom Edition
        </div>
      </header>

      {/* Main Sign-In Center Container */}
      <div className="max-w-md w-full mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Welcome to the Lab
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mb-3">
            Join a live classroom game or manage sessions as an instructor
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
            <span>🎮</span>
            <span>Classroom Games Suite: Auctions, Social Dilemmas, Strategic Thinking & Markets</span>
          </div>
        </div>

        {/* Portal Card */}
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-2xl backdrop-blur-sm">
          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-xl mb-6 border border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setStudentError('');
              }}
              className={`py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'student'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🎓</span> Student Entry
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('instructor');
                setInstructorError('');
              }}
              className={`py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'instructor'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>👨‍🏫</span> Instructor Portal
            </button>
          </div>

          {activeTab === 'student' ? (
            /* Student Entry Form */
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Session Room Code / PIN *
                </label>
                <input
                  type="text"
                  placeholder="e.g. DOTE-3090"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-mono font-bold tracking-wider text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Rivera"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3090123"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Your Classroom Codename
                  </label>
                  <span className="text-[10px] text-slate-400">Autogenerated · Anonymous</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-300 tracking-wide">
                      {studentAlias}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Active</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRerollNickname}
                    title="Generate another random codename"
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white text-xs font-bold rounded-lg border border-slate-600 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <span>🎲</span>
                    <span>Re-roll</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Your identity is kept anonymous to peers during classroom rounds.
                </p>
              </div>

              {studentError && (
                <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/80 text-xs text-red-200 font-semibold">
                  ⚠️ {studentError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-98 cursor-pointer mt-2"
              >
                Join Classroom Game
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleQuickStudentDemo}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline cursor-pointer inline-flex items-center gap-1.5"
                  title="Randomly generate a new student name, ID, and anonymous nickname for a fresh trial"
                >
                  <span>🎲</span>
                  <span>Fill Sample Student Data (Fresh Random Trial)</span>
                </button>
              </div>
            </form>
          ) : (
            /* Instructor Entry Form */
            <form onSubmit={handleInstructorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Instructor Name / Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Chiu"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs font-medium text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Course Session Room Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. DOTE-3090"
                  value={instructorCode}
                  onChange={(e) => setInstructorCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-mono font-bold tracking-wider text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase placeholder-slate-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Instructor Access Passcode *
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Demo: 3090</span>
                </div>
                <input
                  type="password"
                  placeholder="Enter access code (3090)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs font-medium text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                />
              </div>

              {instructorError && (
                <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/80 text-xs text-red-200 font-semibold">
                  ⚠️ {instructorError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-98 cursor-pointer mt-2"
              >
                Open Instructor Console
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer Feature Badges */}
      <footer className="max-w-6xl w-full mx-auto p-4 sm:p-6 text-center text-xs text-slate-500 border-t border-slate-800">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span>🤝 Prisoner's Dilemma</span>
          <span>·</span>
          <span>🔁 Repeated Trust & Retaliation</span>
          <span>·</span>
          <span>🏷️ Vickrey 2nd-Price Auction</span>
          <span>·</span>
          <span>🎯 First-Price Sealed Bid</span>
          <span>·</span>
          <span>💭 Keynesian Beauty Contest (2/3 Avg)</span>
          <span>·</span>
          <span>🌍 Public Goods (Free-Riders)</span>
          <span>·</span>
          <span>🥧 Split-the-Pie Bargaining</span>
        </div>
      </footer>
    </div>
  );
};
