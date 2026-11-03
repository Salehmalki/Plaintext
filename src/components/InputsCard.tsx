import React from 'react';
import { Sparkles, Dices, GraduationCap, BookOpen } from 'lucide-react';
import { formatDigits, normalizeDigits } from '../utils/division';

interface InputsCardProps {
  dividend: string;
  divisor: string;
  onDividendChange: (val: string) => void;
  onDivisorChange: (val: string) => void;
  onSubmit: () => void;
  onRandomProblem: () => void;
  errorMessage: string;
  isEastern: boolean;
  appMode: 'explain' | 'practice';
  onModeChange: (mode: 'explain' | 'practice') => void;
}

export const InputsCard: React.FC<InputsCardProps> = ({
  dividend,
  divisor,
  onDividendChange,
  onDivisorChange,
  onSubmit,
  onRandomProblem,
  errorMessage,
  isEastern,
  appMode,
  onModeChange,
}) => {
  const handleDividendInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const norm = normalizeDigits(raw);
    onDividendChange(norm ? formatDigits(norm, isEastern) : '');
  };

  const handleDivisorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const norm = normalizeDigits(raw);
    onDivisorChange(norm ? formatDigits(norm, isEastern) : '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <section className="bg-[var(--card)] border-2 border-[var(--line)] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs transition-colors">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[var(--paper)] rounded-xl border border-[var(--line)] mb-3.5 max-w-sm">
        <button
          type="button"
          onClick={() => onModeChange('explain')}
          className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-black transition-all active:scale-[0.98] ${
            appMode === 'explain'
              ? 'bg-[var(--btn)] text-[var(--btnt)] shadow-xs'
              : 'text-[var(--soft)] hover:text-[var(--ink)]'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>شرح خطوة بخطوة</span>
        </button>
        <button
          type="button"
          onClick={() => onModeChange('practice')}
          className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-black transition-all active:scale-[0.98] ${
            appMode === 'practice'
              ? 'bg-[var(--btn)] text-[var(--btnt)] shadow-xs'
              : 'text-[var(--soft)] hover:text-[var(--ink)]'
          }`}
        >
          <GraduationCap className="w-4 h-4 shrink-0" />
          <span>تمرن بنفسك</span>
        </button>
      </div>

      {/* Inputs Row */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Dividend (المقسوم) */}
        <label className="flex-1 block">
          <span className="block text-xs sm:text-sm font-bold text-[var(--ink)] mb-1">
            المقسوم
          </span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={9}
            autoComplete="off"
            value={dividend}
            onChange={handleDividendInput}
            onKeyDown={handleKeyDown}
            placeholder={formatDigits('7843', isEastern)}
            className="w-full min-h-[48px] text-center text-xl sm:text-2xl font-black font-mono bg-[var(--paper)] text-[var(--ink)] border-2 border-[var(--line)] rounded-xl py-2 px-2.5 focus:border-[var(--btn)] focus:outline-none transition-colors"
            dir="ltr"
          />
        </label>

        {/* Division Sign */}
        <div className="text-2xl sm:text-3xl font-black text-[var(--btn)] pt-6 select-none shrink-0">
          ÷
        </div>

        {/* Divisor (المقسوم عليه) */}
        <label className="flex-1 block">
          <span className="block text-xs sm:text-sm font-bold text-[var(--ink)] mb-1">
            المقسوم عليه
          </span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            autoComplete="off"
            value={divisor}
            onChange={handleDivisorInput}
            onKeyDown={handleKeyDown}
            placeholder={formatDigits('12', isEastern)}
            className="w-full min-h-[48px] text-center text-xl sm:text-2xl font-black font-mono bg-[var(--paper)] text-[var(--ink)] border-2 border-[var(--line)] rounded-xl py-2 px-2.5 focus:border-[var(--btn)] focus:outline-none transition-colors"
            dir="ltr"
          />
        </label>
      </div>

      {/* Action Buttons Row: Main Submit + Random Problem */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2.5 mt-4">
        {/* Main Action Button */}
        <button
          type="button"
          onClick={onSubmit}
          className="flex-[3] min-h-[48px] sm:min-h-[52px] py-2.5 px-4 bg-[var(--btn)] hover:opacity-95 active:scale-[0.98] text-[var(--btnt)] font-black text-base sm:text-lg rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 touch-manipulation"
        >
          <Sparkles className="w-5 h-5 shrink-0" />
          <span>{appMode === 'explain' ? 'ابدأ الشرح الآن' : 'ابدأ التمرين'}</span>
        </button>

        {/* Random Problem Button */}
        <button
          type="button"
          onClick={onRandomProblem}
          title="توليد مسألة عشوائية جديدة بتنوع وتشويق"
          className="flex-[2] min-h-[48px] sm:min-h-[52px] py-2.5 px-4 bg-[var(--paper)] hover:bg-[var(--line)]/40 active:scale-[0.98] text-[var(--ink)] font-black text-sm sm:text-base border-2 border-[var(--line)] hover:border-[var(--btn)] rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 touch-manipulation"
        >
          <Dices className="w-5 h-5 text-[var(--btn)] shrink-0" />
          <span>مسألة عشوائية</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          role="alert"
          className="mt-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-[var(--red)] text-sm font-bold text-center"
        >
          {errorMessage}
        </div>
      )}
    </section>
  );
};
