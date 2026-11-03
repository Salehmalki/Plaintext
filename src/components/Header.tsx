import React from 'react';
import { Moon, Sun, Volume2, VolumeX, Printer, Calculator } from 'lucide-react';
import { formatDigits } from '../utils/division';

interface HeaderProps {
  isEastern: boolean;
  onToggleDigits: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isEastern,
  onToggleDigits,
  isDark,
  onToggleDark,
  soundEnabled,
  onToggleSound,
  onPrint,
}) => {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
      <div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[var(--btn)] text-[var(--btnt)] flex items-center justify-center font-bold shadow-sm">
            <Calculator className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--ink)] m-0">
            القسمة المطولة
          </h1>
        </div>
        <p className="text-sm sm:text-base text-[var(--soft)] mt-1 font-semibold">
          اكتب العددين وشاهد كل خطوة بهدوء: اقسم، اضرب، اطرح، أنزل.
        </p>
      </div>

      <div className="flex items-center flex-wrap gap-2 self-stretch sm:self-auto justify-end no-print">
        {/* Toggle Eastern/Western Numerals */}
        <button
          type="button"
          onClick={onToggleDigits}
          title="تغيير شكل الأرقام (مشرقية / مغربية)"
          className="px-3 py-1.5 rounded-xl border-2 border-[var(--line)] bg-[var(--card)] hover:border-[var(--btn)] text-xs sm:text-sm font-bold text-[var(--ink)] transition-colors shadow-xs"
        >
          {isEastern ? 'الأرقام: ١٢٣' : 'الأرقام: 123'}
        </button>

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          title={soundEnabled ? 'كتم المؤثرات الصوتية' : 'تفعيل المؤثرات الصوتية'}
          className="p-2 rounded-xl border-2 border-[var(--line)] bg-[var(--card)] hover:border-[var(--btn)] text-[var(--ink)] transition-colors"
          aria-label={soundEnabled ? 'كتم المؤثرات الصوتية' : 'تفعيل المؤثرات الصوتية'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[var(--green)]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[var(--soft)]" />
          )}
        </button>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleDark}
          title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
          className="p-2 sm:p-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--card)] hover:border-[var(--btn)] text-[var(--ink)] transition-colors min-w-[42px] min-h-[42px] flex items-center justify-center"
          aria-label={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-[var(--ink)]" />
          )}
        </button>

        {/* تم تعليق زر طباعة ورقة العمل مؤقتاً بناءً على الطلب (يمكن إعادة تفعيله لاحقاً) */}
        {/*
        <button
          type="button"
          onClick={onPrint}
          title="معاينة وطباعة ورقة العمل التعليمية"
          className="px-2.5 py-1.5 rounded-xl border-2 border-[var(--line)] bg-[var(--card)] hover:border-[var(--btn)] text-[var(--ink)] transition-colors flex items-center gap-1.5 shadow-xs"
          aria-label="معاينة وطباعة ورقة العمل التعليمية"
        >
          <Printer className="w-4 h-4 text-[var(--btn)]" />
          <span className="text-xs font-bold hidden sm:inline">ورقة عمل للطباعة</span>
        </button>
        */}
      </div>
    </header>
  );
};
