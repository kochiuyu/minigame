import { useState, useEffect } from 'react';
import {
  IconChevronDown,
  IconInfo,
  IconListChecks,
  IconCalculator,
  IconLock,
  IconUnlock,
  IconTarget,
  IconDollarSign
} from './components/icons';
import { WEEKS } from './data/weeks';
import { StudentInfo, RoundsState, ReflectionsState, RoundData } from './types';

export default function App() {
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({ name: '', id: '', alias: '' });
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [roundsData, setRoundsData] = useState<RoundsState>({});
  const [reflections, setReflections] = useState<ReflectionsState>({});
  const [copyStatus, setCopyStatus] = useState<string>('');

  // Load data from local storage on mount
  useEffect(() => {
    try {
      const savedInfo = localStorage.getItem('gameTheoryStudentInfo');
      const savedRounds = localStorage.getItem('gameTheoryRounds');
      const savedReflections = localStorage.getItem('gameTheoryReflections');
      if (savedInfo) setStudentInfo(JSON.parse(savedInfo));
      if (savedRounds) setRoundsData(JSON.parse(savedRounds));
      if (savedReflections) setReflections(JSON.parse(savedReflections));
    } catch (e) {
      console.error("Could not load local storage", e);
    }
  }, []);

  // Save data to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem('gameTheoryStudentInfo', JSON.stringify(studentInfo));
      localStorage.setItem('gameTheoryRounds', JSON.stringify(roundsData));
      localStorage.setItem('gameTheoryReflections', JSON.stringify(reflections));
    } catch (e) {
      console.error("Could not save to local storage", e);
    }
  }, [studentInfo, roundsData, reflections]);

  const handleInfoChange = (field: keyof StudentInfo, value: string) => {
    setStudentInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleFieldChange = (weekId: number, roundNum: number, fieldId: string, value: string) => {
    setRoundsData(prev => {
      const weekData = prev[weekId] || {};
      const roundData = weekData[roundNum] || {};
      return {
        ...prev,
        [weekId]: {
          ...weekData,
          [roundNum]: {
            ...roundData,
            [fieldId]: value
          }
        }
      };
    });
  };

  const handleReflectionChange = (weekId: number, text: string) => {
    setReflections(prev => ({ ...prev, [weekId]: text }));
  };

  const handleLockStep1 = (weekId: number, roundNum: number) => {
    const timeStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    setRoundsData(prev => {
      const weekData = prev[weekId] || {};
      const roundData = weekData[roundNum] || {};
      return {
        ...prev,
        [weekId]: {
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

  const handleLockStep2 = (weekId: number, roundNum: number) => {
    const timeStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    setRoundsData(prev => {
      const weekData = prev[weekId] || {};
      const roundData = weekData[roundNum] || {};
      return {
        ...prev,
        [weekId]: {
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

  const generateSubmissionText = () => {
    const weekConfig = WEEKS.find(w => w.id === activeWeek) || WEEKS[0];
    const wData = roundsData[activeWeek] || {};
    const refText = reflections[activeWeek] || "No reflection provided.";

    let text = `DOTE 3090 - Game Theory Submission\n`;
    text += `Student: ${studentInfo.name || "Unknown"} (${studentInfo.id || "No ID"})\n`;
    text += `Alias: ${studentInfo.alias || "None"}\n`;
    text += `Topic: ${weekConfig.title}\n\n`;
    text += `--- ROUND DATA ---\n`;

    for (let r = 1; r <= 6; r++) {
      const rData: RoundData = wData[r] || {};
      if (!rData.isStep1Locked && !rData.isStep2Locked) continue;

      text += `Round ${r}${rData.isStep2Locked ? ' [COMPLETED]' : ' [INCOMPLETE]'}:\n`;
      if (rData.step1Time) text += `  [Locked Step 1 at ${rData.step1Time}]\n`;
      if (rData.step2Time) text += `  [Locked Step 2 at ${rData.step2Time}]\n`;

      const numPartners = weekConfig.partners || 1;
      for (let p = 1; p <= numPartners; p++) {
        const alias = rData[`partnerAlias${p}`];
        if (alias) text += `  Group Member ${p} Alias: ${alias}\n`;
      }

      weekConfig.fields.forEach(field => {
        text += `  ${field.label}: ${rData[field.id] !== undefined && rData[field.id] !== '' ? rData[field.id] : "-"}\n`;
      });

      if (rData.isStep2Locked) {
        const calculated = weekConfig.calculate(rData);
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
      setCopyStatus('Copied! Paste this directly into Canvas/Blackboard.');
      setTimeout(() => setCopyStatus(''), 4000);
    } catch {
      setCopyStatus('Failed to copy. Please manually select and copy the summary.');
    }
  };

  const currentWeekConfig = WEEKS.find(w => w.id === activeWeek) || WEEKS[0];

  // Check if all header identification fields are filled
  const isReadyToSubmit =
    studentInfo.name.trim() !== '' &&
    studentInfo.id.trim() !== '' &&
    studentInfo.alias.trim() !== '';

  return (
    <div className="min-h-screen text-slate-800 font-sans pb-24 selection:bg-blue-200 bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-20">
        <h1 className="text-xl font-bold mb-3 tracking-tight flex justify-between items-center">
          <span>DOTE 3090 Mini-Games</span>
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Your Name *"
            className={`px-3 py-2 rounded text-black focus:outline-none focus:ring-2 font-medium transition-colors ${
              !studentInfo.name
                ? 'bg-red-100 placeholder-red-400 focus:ring-red-500'
                : 'bg-slate-100 focus:bg-white focus:ring-blue-500'
            }`}
            value={studentInfo.name}
            onChange={(e) => handleInfoChange('name', e.target.value)}
          />
          <input
            type="text"
            placeholder="Student ID *"
            className={`px-3 py-2 rounded text-black focus:outline-none focus:ring-2 font-medium transition-colors ${
              !studentInfo.id
                ? 'bg-red-100 placeholder-red-400 focus:ring-red-500'
                : 'bg-slate-100 focus:bg-white focus:ring-blue-500'
            }`}
            value={studentInfo.id}
            onChange={(e) => handleInfoChange('id', e.target.value)}
          />
          <input
            type="text"
            placeholder="Your Fun Alias *"
            className={`px-3 py-2 rounded text-black focus:outline-none focus:ring-2 font-medium transition-colors border ${
              !studentInfo.alias
                ? 'bg-red-100 border-red-200 placeholder-red-400 focus:ring-red-500'
                : 'bg-amber-50 border-amber-300 focus:bg-white focus:ring-amber-500'
            }`}
            value={studentInfo.alias}
            onChange={(e) => handleInfoChange('alias', e.target.value)}
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 mt-2">
        {/* Week Selector */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <label className="block text-sm font-bold mb-2 text-slate-500 uppercase tracking-wide">
            Select Topic
          </label>
          <div className="relative">
            <select
              className="block appearance-none w-full bg-slate-50 border border-slate-300 text-slate-900 py-3 px-4 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold text-lg cursor-pointer"
              value={activeWeek}
              onChange={(e) => setActiveWeek(parseInt(e.target.value, 10))}
            >
              {WEEKS.map(w => (
                <option key={w.id} value={w.id}>
                  {w.title}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <IconChevronDown size={20} />
            </div>
          </div>
        </div>

        {/* Instructions Card with Strategies and Payoffs */}
        <div className="mb-8 bg-blue-50 p-5 rounded-xl border border-blue-200 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-1 shrink-0">
              <IconInfo size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-900">Purpose</h2>
              <p className="text-blue-800 leading-snug">{currentWeekConfig.purpose}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-1 shrink-0">
              <IconTarget size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-900">Strategies</h2>
              <p className="text-blue-800 leading-snug">{currentWeekConfig.strategies}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-1 shrink-0">
              <IconDollarSign size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-900">Payoffs</h2>
              <p className="text-blue-800 leading-snug">{currentWeekConfig.payoffs}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-1 shrink-0">
              <IconListChecks size={24} />
            </div>
            <div className="w-full">
              <h2 className="text-lg font-bold text-blue-900 mb-1">How to Play</h2>
              <ol className="list-decimal ml-5 space-y-1 text-blue-900/90 font-medium">
                {currentWeekConfig.instructions.map((step, idx) => (
                  <li key={idx} className="pl-1">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Game Rounds */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-bold border-b-2 border-slate-300 pb-2 text-slate-800">
            Game Rounds
          </h2>

          {[1, 2, 3, 4, 5, 6].map(roundNum => {
            const rData: RoundData = (roundsData[activeWeek] && roundsData[activeWeek][roundNum]) || {};
            const isStep1Locked = rData.isStep1Locked === true;
            const isStep2Locked = rData.isStep2Locked === true;
            const numPartners = currentWeekConfig.partners || 1;

            const step1Fields = currentWeekConfig.fields.filter(f => f.step === 1);
            const step2Fields = currentWeekConfig.fields.filter(f => f.step === 2);
            const postRevealFields = currentWeekConfig.fields.filter(f => f.postReveal);

            // Safety check: Ensure all required fields for each step are filled before allowing lock
            const areAliasesReady = Array.from({ length: numPartners }).every((_, idx) => {
              const aliasVal = rData[`partnerAlias${idx + 1}`];
              return typeof aliasVal === 'string' && aliasVal.trim() !== '';
            });

            const isStep1Ready =
              step1Fields.every(f => rData[f.id] !== undefined && rData[f.id] !== '') && areAliasesReady;
            const isStep2Ready =
              step2Fields.every(
                f => f.label.includes('Optional') || (rData[f.id] !== undefined && rData[f.id] !== '')
              );

            let headerStyle = "bg-slate-200 text-slate-700 border-slate-300";
            let statusText = "🔓 Not Started";
            if (isStep2Locked) {
              headerStyle = "bg-emerald-100 text-emerald-800 border-emerald-300";
              statusText = "✅ Round Complete";
            } else if (isStep1Locked) {
              headerStyle = "bg-amber-100 text-amber-800 border-amber-300";
              statusText = "🔓 Awaiting Partner Data...";
            }

            return (
              <div
                key={roundNum}
                className={`bg-white rounded-xl shadow-sm border ${
                  isStep2Locked ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-300'
                } overflow-hidden`}
              >
                {/* Round Header */}
                <div
                  className={`${headerStyle} px-5 py-3 border-b flex justify-between items-center transition-colors`}
                >
                  <span className="font-black text-lg">Round {roundNum}</span>
                  <span className="text-xs font-bold px-2 py-1 bg-white/50 rounded uppercase tracking-wider">
                    {statusText}
                  </span>
                </div>

                {/* STEP 1 SECTION: My Choices */}
                <div
                  className={`p-5 ${
                    isStep1Locked ? 'bg-slate-50 grayscale-[20%]' : 'bg-blue-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-blue-800 uppercase tracking-widest flex items-center gap-2 m-0">
                      {isStep1Locked ? <IconLock size={16} /> : <IconUnlock size={16} />} Step 1: Your Decisions
                    </h3>
                    {rData.step1Time && (
                      <span className="text-xs font-bold text-blue-700 bg-blue-100/80 px-2 py-1 rounded">
                        Locked at {rData.step1Time}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {/* Aliases are part of Step 1 */}
                    {Array.from({ length: numPartners }).map((_, idx) => (
                      <div key={`alias-${idx}`} className="p-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {numPartners > 1 ? `Group Member ${idx + 1} Alias` : "Partner's Alias"}
                        </label>
                        <input
                          type="text"
                          placeholder="Who are you playing?"
                          className="w-full border-b-2 border-slate-300 py-2 focus:outline-none focus:border-blue-600 bg-transparent px-2 font-bold text-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                          value={(rData[`partnerAlias${idx + 1}`] as string) || ''}
                          disabled={isStep1Locked}
                          onChange={(e) =>
                            handleFieldChange(activeWeek, roundNum, `partnerAlias${idx + 1}`, e.target.value)
                          }
                        />
                      </div>
                    ))}

                    {/* Step 1 Fields */}
                    {step1Fields.map(field => (
                      <div key={field.id} className="p-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {field.label}
                        </label>
                        {field.type === 'select' ? (
                          <div className="relative">
                            <select
                              className="block appearance-none w-full bg-slate-100/50 border-b-2 border-slate-300 text-slate-800 py-2 px-2 pr-8 focus:outline-none focus:border-blue-600 font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                              value={(rData[field.id] as string) || ''}
                              disabled={isStep1Locked}
                              onChange={(e) =>
                                handleFieldChange(activeWeek, roundNum, field.id, e.target.value)
                              }
                            >
                              <option value="" disabled>
                                Select...
                              </option>
                              {field.options?.map(opt => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                              <IconChevronDown size={16} />
                            </div>
                          </div>
                        ) : (
                          <input
                            type="number"
                            placeholder="Enter amount..."
                            className="w-full border-b-2 border-slate-300 py-2 focus:outline-none focus:border-blue-600 bg-transparent px-2 font-bold text-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                            value={(rData[field.id] as string) || ''}
                            disabled={isStep1Locked}
                            onChange={(e) =>
                              handleFieldChange(activeWeek, roundNum, field.id, e.target.value)
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {!isStep1Locked && (
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => handleLockStep1(activeWeek, roundNum)}
                        disabled={!isStep1Ready}
                        className={`font-bold py-2.5 px-6 rounded-lg shadow transition-colors flex items-center gap-2 text-sm active:scale-95 ${
                          isStep1Ready
                            ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        🔒 Lock My Choices
                      </button>
                    </div>
                  )}
                </div>

                {/* STEP 2 SECTION: Partner's Choices */}
                <div
                  className={`p-5 border-t border-slate-200 transition-all ${
                    !isStep1Locked
                      ? 'opacity-40 pointer-events-none bg-slate-100'
                      : isStep2Locked
                      ? 'bg-slate-50 grayscale-[20%]'
                      : 'bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 m-0 ${
                        !isStep1Locked ? 'text-slate-500' : 'text-amber-700'
                      }`}
                    >
                      {isStep2Locked ? <IconLock size={16} /> : <IconUnlock size={16} />} Step 2: Partner's Decisions
                    </h3>
                    {rData.step2Time && (
                      <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-1 rounded">
                        Locked at {rData.step2Time}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {step2Fields.map(field => (
                      <div key={field.id} className="p-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {field.label}
                        </label>
                        {field.type === 'select' ? (
                          <div className="relative">
                            <select
                              className="block appearance-none w-full bg-slate-100/50 border-b-2 border-slate-300 text-slate-800 py-2 px-2 pr-8 focus:outline-none focus:border-amber-600 font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                              value={(rData[field.id] as string) || ''}
                              disabled={!isStep1Locked || isStep2Locked}
                              onChange={(e) =>
                                handleFieldChange(activeWeek, roundNum, field.id, e.target.value)
                              }
                            >
                              <option value="" disabled>
                                Select...
                              </option>
                              {field.options?.map(opt => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                              <IconChevronDown size={16} />
                            </div>
                          </div>
                        ) : (
                          <input
                            type="number"
                            placeholder="Enter amount..."
                            className="w-full border-b-2 border-slate-300 py-2 focus:outline-none focus:border-amber-600 bg-transparent px-2 font-bold text-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                            value={(rData[field.id] as string) || ''}
                            disabled={!isStep1Locked || isStep2Locked}
                            onChange={(e) =>
                              handleFieldChange(activeWeek, roundNum, field.id, e.target.value)
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {isStep1Locked && !isStep2Locked && (
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => handleLockStep2(activeWeek, roundNum)}
                        disabled={!isStep2Ready}
                        className={`font-bold py-2.5 px-6 rounded-lg shadow transition-colors flex items-center gap-2 text-sm active:scale-95 ${
                          isStep2Ready
                            ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        🔒 Record & Reveal Score
                      </button>
                    </div>
                  )}
                </div>

                {/* Auto-Calculated Results Box */}
                {isStep2Locked && currentWeekConfig.calculate(rData) && (
                  <div className="bg-emerald-50 p-5 border-t border-emerald-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2 sm:mb-0">
                      <IconCalculator size={22} />
                      <span>Round Results:</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(currentWeekConfig.calculate(rData) || {}).map(([key, val]) => (
                        <div
                          key={key}
                          className="bg-white px-3 py-2 rounded-lg shadow-sm border border-emerald-200"
                        >
                          <span className="text-[10px] uppercase text-emerald-600 font-black block mb-0.5 tracking-wider">
                            {key}
                          </span>
                          <span className="font-black text-slate-800">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Post Reveal Fields (e.g., True Value in Week 8) */}
                {postRevealFields.length > 0 && isStep2Locked && (
                  <div className="p-5 bg-purple-50/50 border-t border-purple-100">
                    <h4 className="text-xs font-black text-purple-800 uppercase tracking-widest mb-3">
                      Post-Round Reveal
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {postRevealFields.map(field => (
                        <div key={field.id} className="p-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            {field.label}
                          </label>
                          <input
                            type="number"
                            placeholder="Wait for instructor..."
                            className="w-full sm:w-1/2 border-b-2 border-purple-300 py-2 focus:outline-none focus:border-purple-600 bg-transparent px-2 font-bold text-slate-800"
                            value={(rData[field.id] as string) || ''}
                            onChange={(e) =>
                              handleFieldChange(activeWeek, roundNum, field.id, e.target.value)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Reflection */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-300">
          <h2 className="text-xl font-bold mb-2 text-slate-800">Weekly Reflection</h2>
          <p className="text-slate-600 mb-4 font-medium leading-relaxed">
            Based on today's games, what did you learn about strategy? How does this concept apply to real business scenarios?
          </p>
          <textarea
            className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-4 h-32 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-y text-slate-800 font-medium"
            placeholder="Type your reflection here..."
            value={reflections[activeWeek] || ''}
            onChange={(e) => handleReflectionChange(activeWeek, e.target.value)}
          />
        </div>

        {/* Submit Action */}
        <div className="bg-slate-900 p-8 rounded-xl shadow-xl text-center text-white">
          <h3 className="font-black text-2xl mb-3">Ready to Submit?</h3>
          <p className="text-slate-300 mb-6 font-medium max-w-lg mx-auto leading-relaxed">
            Click the button below to copy your answers, then paste them directly into your Canvas/Blackboard submission box!
          </p>

          {!isReadyToSubmit && (
            <div className="mb-6 p-4 bg-red-900/40 border border-red-500 rounded-lg max-w-lg mx-auto">
              <p className="text-red-200 font-bold flex items-center justify-center gap-2">
                ⚠️ Please fill in your Name, Student ID, and Alias at the top of the page first!
              </p>
            </div>
          )}

          <button
            onClick={handleCopySubmission}
            disabled={!isReadyToSubmit}
            className={`font-black py-4 px-8 rounded-xl w-full sm:w-auto shadow-lg transition-all transform active:scale-95 text-lg flex items-center justify-center gap-3 mx-auto ${
              isReadyToSubmit
                ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            📋 COPY SUBMISSION
          </button>

          {copyStatus && (
            <div
              className={`mt-5 font-bold p-3 rounded-lg max-w-sm mx-auto ${
                copyStatus.includes('Failed')
                  ? 'bg-red-900/50 text-red-200 border border-red-500'
                  : 'bg-emerald-900/50 text-emerald-200 border border-emerald-500'
              }`}
            >
              {copyStatus}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
