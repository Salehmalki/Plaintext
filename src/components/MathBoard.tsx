import React from 'react';
import {
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Play,
  Pause,
} from 'lucide-react';
import {
  DivisionData,
  generateBoardState,
  formatDigits,
  STEP_LABELS,
} from '../utils/division';

interface MathBoardProps {
  data: DivisionData;
  currentStepIndex: number;
  isEastern: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  onReset?: () => void;
  canNext?: boolean;
  canPrev?: boolean;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  showControls?: boolean;
}

export const MathBoard: React.FC<MathBoardProps> = ({
  data,
  currentStepIndex,
  isEastern,
  onNext,
  onPrev,
  onReset,
  canNext = true,
  canPrev = true,
  isPlaying = false,
  onTogglePlay,
  showControls = true,
}) => {
  const boardState = generateBoardState(data, currentStepIndex, isEastern);
  const { n, g, DFormatted, qRow, rows, used } = boardState;
  const currentStep = data.S[currentStepIndex];
  const totalSteps = data.S.length;
  const stepLabel = currentStep ? STEP_LABELS[currentStep.t] : '';

  return (
    <div className="bg-[var(--card)] border-2 border-[var(--line)] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs overflow-hidden transition-colors">
      {/* Board Header with Step Counter */}
      <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[var(--line)] text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="text-[var(--ink)] font-black text-sm sm:text-base">
            لوحة القسمة المطولة
          </span>
          {stepLabel && (
            <span className="px-2 py-0.5 rounded-md bg-[var(--btn)] text-[var(--btnt)] text-xs font-bold font-sans">
              {stepLabel}
            </span>
          )}
        </div>
        <div className="text-[var(--soft)] font-mono text-xs sm:text-sm">
          <span>
            الخطوة {formatDigits(currentStepIndex + 1, isEastern)} من{' '}
            {formatDigits(totalSteps, isEastern)}
          </span>
        </div>
      </div>

      {/* Board Canvas with smooth horizontal touch-scrolling if wide */}
      <div className="overflow-x-auto py-3 px-1.5 scrollbar-thin touch-pan-x" dir="ltr">
        <div
          className="math-board mx-auto min-w-max select-none"
          style={
            {
              '--n': n,
              '--g': g,
            } as React.CSSProperties
          }
        >
          {/* 1. Quotient Row (.qr) */}
          <div className="rw qr">
            <span className="gut"></span>
            {Array.from({ length: n }).map((_, col) => {
              const cell = qRow.cells[col];
              if (!cell) {
                return <span key={col} className="c"></span>;
              }
              return (
                <span
                  key={col}
                  className={`c q ${cell.cls}`}
                >
                  {cell.ch}
                </span>
              );
            })}
          </div>

          {/* 2. Dividend & Working Rows */}
          {rows.map((row, rIdx) => {
            const isDvd = row.cls === 'dvd';
            const isLn = !!row.ln;
            const rowClass = `rw ${row.cls || ''} ${isLn ? 'ln' : ''}`;

            return (
              <div key={rIdx} className={rowClass}>
                {/* Gutter (Divisor or Minus sign) */}
                <span className="gut">
                  {row.minus ? '−' : isDvd ? DFormatted : ''}
                </span>

                {/* Digit Columns */}
                {Array.from({ length: n }).map((_, col) => {
                  const cell = row.cells[col];
                  if (!cell) {
                    return <span key={col} className="c"></span>;
                  }

                  const isFuture = isDvd && used >= 0 && col > used;
                  const cellClasses = [
                    'c',
                    'f',
                    cell.cls || '',
                    isFuture ? 'fut' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <span key={col} className={cellClasses}>
                      {cell.over !== undefined && (
                        <i>{formatDigits(cell.over, isEastern)}</i>
                      )}
                      {cell.ch}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Touch-Optimized Navigation Controls directly under the board */}
      {showControls && (
        <div className="pt-3.5 mt-2 border-t-2 border-[var(--line)] no-print">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Previous Step (السابق) */}
            <button
              type="button"
              onClick={onPrev}
              disabled={!canPrev}
              aria-label="الخطوة السابقة"
              className="flex-1 min-h-[48px] sm:min-h-[52px] py-2.5 px-3 rounded-xl sm:rounded-2xl border-2 border-[var(--line)] hover:border-[var(--btn)] bg-[var(--paper)] text-[var(--ink)] font-black text-sm sm:text-base disabled:opacity-35 disabled:cursor-not-allowed transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 touch-manipulation select-none"
            >
              <ChevronRight className="w-5 h-5 shrink-0" />
              <span>السابق</span>
            </button>

            {/* Next Step (التالي) - Primary large button */}
            <button
              type="button"
              onClick={onNext}
              disabled={!canNext}
              aria-label="الخطوة التالية"
              className="flex-[2] min-h-[48px] sm:min-h-[52px] py-2.5 px-4 rounded-xl sm:rounded-2xl bg-[var(--btn)] hover:opacity-95 text-[var(--btnt)] font-black text-base sm:text-lg disabled:opacity-35 disabled:cursor-not-allowed transition-all active:scale-[0.97] flex items-center justify-center gap-2 shadow-sm touch-manipulation select-none"
            >
              <span>التالي</span>
              <ChevronLeft className="w-5 h-5 shrink-0" />
            </button>

            {/* Play / Pause Toggle (تشغيل تلقائي) */}
            {onTogglePlay && (
              <button
                type="button"
                onClick={onTogglePlay}
                title={isPlaying ? 'إيقاف التشغيل التلقائي' : 'تشغيل تلقائي للخطوات'}
                aria-label={isPlaying ? 'إيقاف التشغيل التلقائي' : 'تشغيل تلقائي'}
                className={`min-h-[48px] sm:min-h-[52px] px-3 sm:px-4 rounded-xl sm:rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 touch-manipulation select-none ${
                  isPlaying
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'border-[var(--line)] bg-[var(--paper)] hover:border-[var(--btn)] text-[var(--ink)]'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">إيقاف</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">تشغيل</span>
                  </>
                )}
              </button>
            )}

            {/* Reset Step (من البداية) */}
            <button
              type="button"
              onClick={onReset}
              title="الرجوع إلى أول خطوة"
              aria-label="الرجوع من البداية"
              className="min-h-[48px] sm:min-h-[52px] px-3 sm:px-4 rounded-xl sm:rounded-2xl border-2 border-[var(--line)] hover:border-[var(--btn)] bg-[var(--paper)] text-[var(--ink)] font-bold text-xs sm:text-sm transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 touch-manipulation select-none"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">من البداية</span>
            </button>
          </div>

          {/* Quick Keyboard hint for desktop */}
          <div className="hidden sm:flex items-center justify-center gap-1 text-[11px] text-[var(--soft)] font-semibold mt-2 text-center">
            <span>💡 يمكنك أيضاً استخدام مفاتيح الأسهم ➔ و  للتنقل، ومفتاح المسافة للتشغيل</span>
          </div>
        </div>
      )}
    </div>
  );
};
