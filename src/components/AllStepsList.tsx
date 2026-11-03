import React from 'react';
import { ListOrdered } from 'lucide-react';
import { DivisionData, formatDigits, STEP_LABELS } from '../utils/division';

interface AllStepsListProps {
  data: DivisionData;
  currentStepIndex: number;
  onSelectStep: (idx: number) => void;
  isEastern: boolean;
}

export const AllStepsList: React.FC<AllStepsListProps> = ({
  data,
  currentStepIndex,
  onSelectStep,
  isEastern,
}) => {
  const eq = (val: string | number) => (
    <bdi dir="ltr" className="eq mx-1 font-mono">
      {formatDigits(val, isEastern)}
    </bdi>
  );

  const getStepSummary = (idx: number) => {
    const s = data.S[idx];
    const b = s.b;
    const D = data.D;

    switch (s.t) {
      case 'pick':
        return `البدء بأول رقم: ${formatDigits(b.W, isEastern)}`;
      case 'down':
        return `إنزال الرقم ${formatDigits(b.d, isEastern)} ليصبح العدد ${formatDigits(b.W, isEastern)}`;
      case 'div':
        return `قسمة ${formatDigits(b.W, isEastern)} ÷ ${formatDigits(D, isEastern)} = ${formatDigits(b.q, isEastern)}`;
      case 'mul':
        return `ضرب ${formatDigits(b.q, isEastern)} × ${formatDigits(D, isEastern)} = ${formatDigits(b.P, isEastern)}`;
      case 'sub':
        return `طرح ${formatDigits(b.W, isEastern)} − ${formatDigits(b.P, isEastern)} = الباقي ${formatDigits(b.R, isEastern)}`;
      case 'end':
        return `النتيجة النهائية: الناتج ${formatDigits(data.Q, isEastern)} والباقي ${formatDigits(data.R, isEastern)}`;
    }
  };

  return (
    <details className="mt-4 pt-3 border-t border-[var(--line)] group">
      <summary className="cursor-pointer font-bold text-sm sm:text-base text-[var(--ink)] hover:text-[var(--btn)] transition-colors select-none flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-[var(--btn)]" />
        <span>كل الخطوات في قائمة (اضغط للانتقال المباشر)</span>
      </summary>

      <ol className="mt-3 space-y-2 pr-4 list-decimal text-sm font-semibold text-[var(--ink)]">
        {data.S.map((step, idx) => {
          const isCurrent = idx === currentStepIndex;
          return (
            <li
              key={idx}
              onClick={() => onSelectStep(idx)}
              className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                isCurrent
                  ? 'bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 font-bold scale-[1.01]'
                  : 'hover:bg-[var(--paper)] hover:text-[var(--btn)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="font-black text-[var(--btn)] ml-1">
                    {STEP_LABELS[step.t]}:
                  </span>
                  <span>{getStepSummary(idx)}</span>
                </div>
                {isCurrent && (
                  <span className="text-[10px] bg-[var(--btn)] text-[var(--btnt)] px-2 py-0.5 rounded-md font-sans">
                    الخطوة الحالية
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </details>
  );
};
