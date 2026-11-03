import React, { useState } from 'react';
import { Table, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDigits } from '../utils/division';

interface MultiplesHelperProps {
  divisor: number;
  activeQuotient?: number;
  isEastern: boolean;
}

export const MultiplesHelper: React.FC<MultiplesHelperProps> = ({
  divisor,
  activeQuotient,
  isEastern,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const multiples = Array.from({ length: 9 }, (_, i) => {
    const mult = i + 1;
    return {
      mult,
      val: mult * divisor,
    };
  });

  return (
    <div className="bg-[var(--card)] border-2 border-[var(--line)] rounded-2xl p-4 shadow-xs mb-4 no-print transition-colors">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between font-bold text-[var(--ink)] text-sm sm:text-base hover:text-[var(--btn)] transition-colors"
      >
        <span className="flex items-center gap-2">
          <Table className="w-4 h-4 text-[var(--btn)]" />
          <span>
            جدول مضاعفات المقسوم عليه ({formatDigits(divisor, isEastern)} × ...)
          </span>
        </span>
        <span className="text-xs text-[var(--soft)] flex items-center gap-1 font-semibold">
          <span>{isOpen ? 'إخفاء' : 'عرض للمساعدة'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-[var(--line)] grid grid-cols-3 sm:grid-cols-9 gap-2">
          {multiples.map(({ mult, val }) => {
            const isMatch = activeQuotient === mult;
            return (
              <div
                key={mult}
                className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-xl border text-xs font-mono transition-all ${
                  isMatch
                    ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-400 font-black text-amber-900 dark:text-amber-200 scale-105 shadow-xs'
                    : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)]'
                }`}
                dir="ltr"
              >
                <span className="text-[10px] text-[var(--soft)] font-sans">
                  {formatDigits(divisor, isEastern)} × {formatDigits(mult, isEastern)}
                </span>
                <span className="text-sm font-bold mt-0.5">
                  {formatDigits(val, isEastern)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
