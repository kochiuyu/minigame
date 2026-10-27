import React from 'react';
import { WeekConfig, RoundData } from '../types';
import { IconChevronDown, IconLock, IconUnlock, IconCalculator } from './icons';

interface RoundCardProps {
  roundNum: number;
  activeWeek: WeekConfig;
  roundData: RoundData;
  onFieldChange: (fieldId: string, value: string) => void;
  onLockStep1: () => void;
  onLockStep2: () => void;
}

export const RoundCard: React.FC<RoundCardProps> = ({
  roundNum,
  activeWeek,
  roundData,
  onFieldChange,
  onLockStep1,
  onLockStep2
}) => {
  const isStep1Locked = roundData.isStep1Locked === true;
  const isStep2Locked = roundData.isStep2Locked === true;
  const numPartners = activeWeek.partners || 1;

  const step1Fields = activeWeek.fields.filter(f => f.step === 1);
  const step2Fields = activeWeek.fields.filter(f => f.step === 2);
  const postRevealFields = activeWeek.fields.filter(f => f.postReveal);

  // Safety checks
  const areAliasesReady = Array.from({ length: numPartners }).every((_, idx) => {
    const aliasVal = roundData[`partnerAlias${idx + 1}`];
    return typeof aliasVal === 'string' && aliasVal.trim() !== '';
  });

  const isStep1Ready =
    step1Fields.every(f => roundData[f.id] !== undefined && roundData[f.id] !== '') && areAliasesReady;

  const isStep2Ready =
    step2Fields.every(
      f => f.label.includes('Optional') || (roundData[f.id] !== undefined && roundData[f.id] !== '')
    );

  let headerStyle = "bg-slate-100 text-slate-700 border-slate-200";
  let statusText = "Ready to Play";
  if (isStep2Locked) {
    headerStyle = "bg-emerald-50 text-emerald-800 border-emerald-200";
    statusText = "Completed";
  } else if (isStep1Locked) {
    headerStyle = "bg-amber-50 text-amber-800 border-amber-200";
    statusText = "Awaiting Partner";
  }

  const results = isStep2Locked ? activeWeek.calculate(roundData) : null;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border ${
        isStep2Locked ? 'border-emerald-300 ring-1 ring-emerald-200/50' : 'border-slate-200'
      } overflow-hidden`}
    >
      {/* Round Header Bar */}
      <div className={`${headerStyle} px-4 py-2.5 border-b flex justify-between items-center text-xs font-semibold`}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 text-sm">Round {roundNum}</span>
          <span className="text-slate-400">·</span>
          <span>{numPartners > 1 ? `${numPartners + 1}-Player Group` : '2-Player Dyad'}</span>
        </div>
        <div className="flex items-center gap-2">
          {roundData.step1Time && !isStep2Locked && (
            <span className="text-[11px] text-amber-700 font-mono">
              Locked at {roundData.step1Time}
            </span>
          )}
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            isStep2Locked ? 'bg-emerald-100 text-emerald-800' : isStep1Locked ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
          }`}>
            {statusText}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1: Your Choice */}
        <div className={`p-4 rounded-lg border transition-colors ${
          isStep1Locked ? 'bg-slate-50/70 border-slate-200' : 'bg-blue-50/30 border-blue-200/60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              {isStep1Locked ? <IconLock size={14} /> : <IconUnlock size={14} />} Step 1: Your Move
            </h4>
            {roundData.step1Time && (
              <span className="text-[10px] text-slate-400 font-mono">
                {roundData.step1Time}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {/* Group member aliases */}
            {Array.from({ length: numPartners }).map((_, idx) => (
              <div key={`alias-${idx}`}>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {numPartners > 1 ? `Group Member ${idx + 1} Alias` : "Partner's Alias"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Partner Alias / ID"
                  disabled={isStep1Locked}
                  value={(roundData[`partnerAlias${idx + 1}`] as string) || ''}
                  onChange={(e) => onFieldChange(`partnerAlias${idx + 1}`, e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            ))}

            {/* Step 1 input fields */}
            {step1Fields.map((field) => (
              <div key={field.id}>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <div className="relative">
                    <select
                      disabled={isStep1Locked}
                      value={(roundData[field.id] as string) || ''}
                      onChange={(e) => onFieldChange(field.id, e.target.value)}
                      className="w-full appearance-none bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>Select choice...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                      <IconChevronDown size={14} />
                    </div>
                  </div>
                ) : (
                  <input
                    type="number"
                    placeholder="Enter value..."
                    disabled={isStep1Locked}
                    value={(roundData[field.id] as string) || ''}
                    onChange={(e) => onFieldChange(field.id, e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                )}
              </div>
            ))}
          </div>

          {!isStep1Locked && (
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex justify-end">
              <button
                onClick={onLockStep1}
                disabled={!isStep1Ready}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isStep1Ready
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <IconLock size={14} /> Lock My Choice
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Partner's Choice */}
        <div className={`p-4 rounded-lg border transition-colors ${
          !isStep1Locked
            ? 'opacity-40 pointer-events-none bg-slate-50 border-slate-200'
            : isStep2Locked
            ? 'bg-slate-50/70 border-slate-200'
            : 'bg-amber-50/30 border-amber-200/60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              {isStep2Locked ? <IconLock size={14} /> : <IconUnlock size={14} />} Step 2: Partner Move
            </h4>
            {roundData.step2Time && (
              <span className="text-[10px] text-slate-400 font-mono">
                {roundData.step2Time}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {step2Fields.map((field) => (
              <div key={field.id}>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <div className="relative">
                    <select
                      disabled={!isStep1Locked || isStep2Locked}
                      value={(roundData[field.id] as string) || ''}
                      onChange={(e) => onFieldChange(field.id, e.target.value)}
                      className="w-full appearance-none bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>Select partner move...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                      <IconChevronDown size={14} />
                    </div>
                  </div>
                ) : (
                  <input
                    type="number"
                    placeholder="Enter value..."
                    disabled={!isStep1Locked || isStep2Locked}
                    value={(roundData[field.id] as string) || ''}
                    onChange={(e) => onFieldChange(field.id, e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                )}
              </div>
            ))}
          </div>

          {isStep1Locked && !isStep2Locked && (
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex justify-end">
              <button
                onClick={onLockStep2}
                disabled={!isStep2Ready}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isStep2Ready
                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <IconLock size={14} /> Record & Reveal Outcome
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auto-Calculated Results Strip */}
      {isStep2Locked && results && (
        <div className="bg-emerald-50/80 border-t border-emerald-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            <IconCalculator size={18} />
            <span>Round {roundNum} Outcome:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(results).map(([key, val]) => (
              <div key={key} className="bg-white px-2.5 py-1.5 rounded-lg border border-emerald-200 shadow-2xs">
                <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">{key}</span>
                <span className="font-bold text-slate-900 font-mono">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post Reveal Fields (e.g. Week 8 True Value) */}
      {postRevealFields.length > 0 && isStep2Locked && (
        <div className="bg-purple-50/70 border-t border-purple-200 p-4 text-xs">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-bold text-purple-900 uppercase tracking-wider text-[11px]">
              Post-Round Instructor Reveal
            </h5>
            <span className="text-purple-600 text-[11px]">Check Instructor Broadcast</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {postRevealFields.map((field) => (
              <div key={field.id}>
                <label className="block text-slate-600 font-bold mb-1">{field.label}</label>
                <input
                  type="number"
                  placeholder="Enter revealed value..."
                  value={(roundData[field.id] as string) || ''}
                  onChange={(e) => onFieldChange(field.id, e.target.value)}
                  className="w-full bg-white border border-purple-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
