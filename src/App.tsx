import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SignInPortal } from './components/SignInPortal';
import { StudentMobileView } from './components/StudentMobileView';
import { InstructorDashboard } from './components/InstructorDashboard';
import { SoloLabView } from './components/SoloLabView';
import { WhatIfSandbox } from './components/WhatIfSandbox';
import { WEEKS } from './data/weeks';
import { StudentInfo, RoundsState, ReflectionsState, RoundData, AuthSession } from './types';
import { safeStorage } from './utils/safeStorage';

export default function App() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [platformMode, setPlatformMode] = useState<'solo' | 'live' | 'sandbox'>('solo');
  const [sandboxGameId, setSandboxGameId] = useState<number>(7);
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({ name: '', id: '', alias: '' });
  const [activeWeekId, setActiveWeekId] = useState<number>(7);
  const [activeRoundNum, setActiveRoundNum] = useState<number>(1);
  const [totalRounds, setTotalRounds] = useState<number>(6);
  const [roundsData, setRoundsData] = useState<RoundsState>({});
  const [reflections, setReflections] = useState<ReflectionsState>({});
  const [copyStatus, setCopyStatus] = useState<string>('');
  const [soloModuleId, setSoloModuleId] = useState<number>(1);
  const [soloNodeLabel, setSoloNodeLabel] = useState<string>('Game 1 of 13');
  const [soloGameIndex, setSoloGameIndex] = useState<number>(1);
  const [totalSoloGames, setTotalSoloGames] = useState<number>(13);
  const [completedSoloGamesCount, setCompletedSoloGamesCount] = useState<number>(0);

  // Load data from safeStorage on mount
  useEffect(() => {
    try {
      const savedAuth = safeStorage.getItem('gameTheoryAuthSession');
      const savedInfo = safeStorage.getItem('gameTheoryStudentInfo');
      const savedRounds = safeStorage.getItem('gameTheoryRounds');
      const savedReflections = safeStorage.getItem('gameTheoryReflections');
      const savedWeek = safeStorage.getItem('gameTheoryActiveWeek');
      const savedRound = safeStorage.getItem('gameTheoryActiveRound');
      const savedTotalRounds = safeStorage.getItem('gameTheoryTotalRounds');
      const savedPlatformMode = safeStorage.getItem('gameTheoryPlatformMode');
      const savedSandboxGame = safeStorage.getItem('gameTheorySandboxGame');

      if (savedAuth) setAuthSession(JSON.parse(savedAuth));
      if (savedInfo) setStudentInfo(JSON.parse(savedInfo));
      if (savedRounds) setRoundsData(JSON.parse(savedRounds));
      if (savedReflections) setReflections(JSON.parse(savedReflections));
      if (savedWeek) setActiveWeekId(parseInt(savedWeek, 10));
      else setActiveWeekId(7); // Default to Auction Game as requested
      if (savedRound) setActiveRoundNum(parseInt(savedRound, 10));
      if (savedTotalRounds) setTotalRounds(parseInt(savedTotalRounds, 10));
      if (savedPlatformMode === 'solo' || savedPlatformMode === 'live' || savedPlatformMode === 'sandbox') {
        setPlatformMode(savedPlatformMode);
      }
      if (savedSandboxGame) setSandboxGameId(parseInt(savedSandboxGame, 10));
    } catch {
      // Graceful fallback without console error
    }
  }, []);

  // Save data to safeStorage on change
  useEffect(() => {
    try {
      if (authSession) {
        safeStorage.setItem('gameTheoryAuthSession', JSON.stringify(authSession));
      } else {
        safeStorage.removeItem('gameTheoryAuthSession');
      }
      safeStorage.setItem('gameTheoryStudentInfo', JSON.stringify(studentInfo));
      safeStorage.setItem('gameTheoryRounds', JSON.stringify(roundsData));
      safeStorage.setItem('gameTheoryReflections', JSON.stringify(reflections));
      safeStorage.setItem('gameTheoryActiveWeek', String(activeWeekId));
      safeStorage.setItem('gameTheoryActiveRound', String(activeRoundNum));
      safeStorage.setItem('gameTheoryTotalRounds', String(totalRounds));
      safeStorage.setItem('gameTheoryPlatformMode', platformMode);
      safeStorage.setItem('gameTheorySandboxGame', String(sandboxGameId));
    } catch {
      // Graceful fallback
    }
  }, [authSession, studentInfo, roundsData, reflections, activeWeekId, activeRoundNum, totalRounds, platformMode, sandboxGameId]);

  const handleSignIn = (session: AuthSession) => {
    setAuthSession(session);
    if (session.role === 'student') {
      const isNewStudent = !studentInfo.id || studentInfo.id !== session.id;
      setStudentInfo({
        name: session.name,
        id: session.id || '',
        alias: session.alias || ''
      });
      if (isNewStudent) {
        // Provide a clean fresh trial for the new student
        setRoundsData(prev => {
          const updated = { ...prev };
          delete updated[activeWeekId];
          return updated;
        });
        setActiveRoundNum(1);
      } else {
        // Resume student at first incomplete round
        const currentRounds = roundsData[activeWeekId] || {};
        const firstIncomplete = Array.from({ length: totalRounds }, (_, i) => i + 1).find(
          r => !currentRounds[r]?.isStep2Locked
        ) || 1;
        setActiveRoundNum(firstIncomplete);
      }
    }
  };

  const handleSignOut = () => {
    setAuthSession(null);
  };

  const handleFillFreshTrial = (newRounds: { [roundNum: number]: RoundData }) => {
    setRoundsData(prev => {
      const updated = {
        ...prev,
        [activeWeekId]: newRounds
      };
      try {
        safeStorage.setItem('gameTheoryRounds', JSON.stringify(updated));
      } catch {
        // Safe fallback
      }
      return updated;
    });
    setActiveRoundNum(totalRounds + 1); // Open full summary
  };

  const handleResetTrial = () => {
    setRoundsData(prev => {
      const updated = { ...prev };
      delete updated[activeWeekId];
      try {
        safeStorage.setItem('gameTheoryRounds', JSON.stringify(updated));
      } catch {
        // Safe fallback
      }
      return updated;
    });
    setActiveRoundNum(1);
  };

  const handleFieldChange = (roundNum: number, fieldId: string, value: string) => {
    setRoundsData(prev => {
      const weekData = prev[activeWeekId] || {};
      const roundData = weekData[roundNum] || {};
      return {
        ...prev,
        [activeWeekId]: {
          ...weekData,
          [roundNum]: {
            ...roundData,
            [fieldId]: value
          }
        }
      };
    });
  };

  const handleLockStep1 = (roundNum: number) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setRoundsData(prev => {
      const weekData = prev[activeWeekId] || {};
      const roundData = weekData[roundNum] || {};
      return {
        ...prev,
        [activeWeekId]: {
          ...weekData,
          [roundNum]: {
            ...roundData,
            isStep1Locked: true,
            step1Time: timeStr
          }
        }
      };
    });
  };

  const handleLockStep2 = (roundNum: number) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setRoundsData(prev => {
      const weekData = prev[activeWeekId] || {};
      const roundData = weekData[roundNum] || {};
      return {
        ...prev,
        [activeWeekId]: {
          ...weekData,
          [roundNum]: {
            ...roundData,
            isStep2Locked: true,
            step2Time: timeStr
          }
        }
      };
    });
  };

  const handleReflectionChange = (text: string) => {
    setReflections(prev => ({ ...prev, [activeWeekId]: text }));
  };

  const currentWeek = WEEKS.find(w => w.id === activeWeekId) || WEEKS[0];
  const currentWeekRounds = roundsData[activeWeekId] || {};
  const completedRoundsCount = Object.values(currentWeekRounds).filter(r => r.isStep2Locked).length;

  const generateSubmissionText = () => {
    const wData = roundsData[activeWeekId] || {};
    const refText = reflections[activeWeekId] || "No reflection provided.";

    let totalScore = 0;
    let completedCount = 0;

    for (let r = 1; r <= totalRounds; r++) {
      const rData = wData[r];
      if (rData && rData.isStep2Locked) {
        completedCount++;
        const calculated = currentWeek.calculate(rData);
        if (calculated && calculated["Your Score"]) {
          const match = String(calculated["Your Score"]).match(/(\d+)/);
          if (match) totalScore += parseInt(match[1], 10);
        }
      }
    }

    let text = `DOTE 3090 - Classroom Game Theory Lab Submission\n`;
    text += `Student: ${studentInfo.name || authSession?.name || "Unknown"} (${studentInfo.id || authSession?.id || "No ID"})\n`;
    text += `Alias: ${studentInfo.alias || authSession?.alias || "None"}\n`;
    text += `Room: ${authSession?.roomCode || "DOTE-3090"}\n`;
    text += `Game: ${currentWeek.title}\n`;
    text += `Total Score: ${totalScore} points across ${completedCount} of ${totalRounds} rounds\n\n`;
    text += `--- ROUND DATA ---\n`;

    for (let r = 1; r <= totalRounds; r++) {
      const rData: RoundData = wData[r] || {};
      if (!rData.isStep1Locked && !rData.isStep2Locked) continue;

      text += `Round ${r}${rData.isStep2Locked ? ' [COMPLETED]' : ' [INCOMPLETE]'}:\n`;
      if (rData.step1Time) text += `  [Locked at ${rData.step1Time}]\n`;
      if (rData.step2Time && rData.step2Time !== rData.step1Time) text += `  [Resolved at ${rData.step2Time}]\n`;

      const numPartners = currentWeek.partners || 1;
      for (let p = 1; p <= numPartners; p++) {
        const alias = rData[`partnerAlias${p}`];
        if (alias) text += `  Opponent/Group Member: ${alias}\n`;
      }

      currentWeek.fields.forEach(field => {
        text += `  ${field.label}: ${rData[field.id] !== undefined && rData[field.id] !== '' ? rData[field.id] : "-"}\n`;
      });

      if (rData.isStep2Locked) {
        const calculated = currentWeek.calculate(rData);
        if (calculated) {
          text += `  > Results:\n`;
          Object.entries(calculated).forEach(([key, val]) => {
            text += `    ${key}: ${val}\n`;
          });
        }
      }
    }

    text += `\n--- REFLECTION ---\n${refText}\n`;
    return text;
  };

  const handleCopySubmission = async () => {
    const text = generateSubmissionText();
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('Copied! Paste this directly into Canvas or Blackboard.');
      setTimeout(() => setCopyStatus(''), 4000);
    } catch {
      setCopyStatus('Failed to copy. Please manually copy the summary.');
    }
  };

  // If user is not signed in, show the Entry Portal
  if (!authSession) {
    return (
      <SignInPortal
        onSignIn={handleSignIn}
        initialStudentInfo={studentInfo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 selection:bg-blue-600 selection:text-white overflow-x-hidden max-w-full">
      {/* Global Header */}
      <Header
        authSession={authSession}
        onSignOut={handleSignOut}
        completedRoundsCount={completedRoundsCount}
        totalRounds={totalRounds}
        currentWeek={currentWeek}
        allWeeks={WEEKS}
        onSelectWeek={(id) => {
          setActiveWeekId(id);
          setActiveRoundNum(1);
        }}
        currentMode={platformMode}
        onSelectMode={setPlatformMode}
        soloModuleId={soloModuleId}
        soloNodeLabel={soloNodeLabel}
        soloGameIndex={soloGameIndex}
        totalSoloGames={totalSoloGames}
        completedSoloGamesCount={completedSoloGamesCount}
      />

      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 mt-3 sm:mt-6 max-w-full">
        {platformMode === 'solo' ? (
          <SoloLabView
            allGames={WEEKS}
            onOpenWhatIfSandbox={(id) => {
              setSandboxGameId(id);
              setPlatformMode('sandbox');
            }}
            onSwitchToLiveClass={() => setPlatformMode('live')}
            onModuleChange={(id, label, gameIndex, totalGames, completedCount) => {
              setSoloModuleId(id);
              if (label) setSoloNodeLabel(label);
              if (gameIndex) setSoloGameIndex(gameIndex);
              if (totalGames) setTotalSoloGames(totalGames);
              if (completedCount !== undefined) setCompletedSoloGamesCount(completedCount);
            }}
          />
        ) : platformMode === 'sandbox' ? (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                  ∫
                </span>
                <div>
                  <h2 className="text-base font-black text-white">Interactive What-If Curves Lab</h2>
                  <p className="text-xs text-slate-400">Dynamically adjust parameters to observe equilibrium shifts and counterfactual payoffs</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 1, label: "🤝 One-Shot Dilemma" },
                  { id: 13, label: '🦌 Stag Hunt' },
                  { id: 15, label: '🦅 Hawk-Dove' },
                  { id: 18, label: '🎭 Battle of the Sexes' },
                  { id: 17, label: '🪙 Matching Pennies' },
                  { id: 16, label: '🍰 Ultimatum Bargaining' },
                  { id: 19, label: '🏦 The Trust Game' },
                  { id: 12, label: '🌍 Public Goods' },
                  { id: 6, label: '🔁 Repeated Dilemma' },
                  { id: 7, label: '⚖️ Vickrey Auction' },
                  { id: 14, label: '🏷️ Bertrand Duopoly' },
                  { id: 11, label: '💭 Beauty Contest' },
                  { id: 20, label: '🐛 Centipede Game' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSandboxGameId(item.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      sandboxGameId === item.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <WhatIfSandbox
              game={WEEKS.find(w => w.id === sandboxGameId) || WEEKS[0]}
            />
          </div>
        ) : authSession.role === 'instructor' ? (
          /* Instructor Console View */
          <InstructorDashboard
            currentWeek={currentWeek}
            onSelectWeek={setActiveWeekId}
            allWeeks={WEEKS}
            currentRound={activeRoundNum > totalRounds ? totalRounds : activeRoundNum}
            onSelectRound={setActiveRoundNum}
            totalRounds={totalRounds}
            onSetTotalRounds={setTotalRounds}
          />
        ) : (
          /* Mobile-First Student Experience */
          <StudentMobileView
            currentWeek={currentWeek}
            allWeeks={WEEKS}
            currentWeekRounds={currentWeekRounds}
            activeRoundNum={activeRoundNum}
            setActiveRoundNum={setActiveRoundNum}
            onFieldChange={handleFieldChange}
            onLockStep1={handleLockStep1}
            onLockStep2={handleLockStep2}
            reflection={reflections[activeWeekId] || ''}
            onReflectionChange={handleReflectionChange}
            onCopySubmission={handleCopySubmission}
            copyStatus={copyStatus}
            studentInfo={studentInfo}
            authSession={authSession}
            onSelectWeek={(id) => {
              setActiveWeekId(id);
              setActiveRoundNum(1);
            }}
            totalRounds={totalRounds}
            onFillFreshTrial={handleFillFreshTrial}
            onResetTrial={handleResetTrial}
          />
        )}
      </main>
    </div>
  );
}
