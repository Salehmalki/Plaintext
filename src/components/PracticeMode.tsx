import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  Sparkles,
  RotateCcw,
  Award,
} from 'lucide-react';
import {
  DivisionData,
  formatDigits,
  STEP_LABELS,
} from '../utils/division';
import { playSuccessChime, playClick } from '../utils/audio';

interface PracticeModeProps {
  data: DivisionData;
  stepIndex: number;
  isStepVerified: boolean;
  onStepVerified: (verified: boolean) => void;
  onAdvanceStep: () => void;
  onReset: () => void;
  isEastern: boolean;
  soundEnabled: boolean;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({
  data,
  stepIndex,
  onStepVerified,
  onAdvanceStep,
  onReset,
  isEastern,
  soundEnabled,
}) => {
  const [selectedCorrect, setSelectedCorrect] = useState<number | null>(null);
  const [selectedWrong, setSelectedWrong] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const step = data.S[stepIndex];
  const b = step.b;
  const D = data.D;

  // Reset local step selection whenever step changes
  useEffect(() => {
    setSelectedCorrect(null);
    setSelectedWrong(null);
    setShowHint(false);
    setIsTransitioning(false);
  }, [stepIndex]);

  // Expected answer calculation
  let expectedAnswer = '';
  let questionPrompt = '';
  let hintText = '';

  switch (step.t) {
    case 'pick':
      expectedAnswer = String(b.W);
      questionPrompt = `ما هو العدد الذي نبدأ بقسمته من أرقام المقسوم؟`;
      hintText =
        b.e === 0
          ? `الرقم الأول هو ${formatDigits(b.W, isEastern)}، وهو أكبر من أو يساوي ${formatDigits(D, isEastern)}.`
          : `الرقم الأول ${formatDigits(data.dg[0], isEastern)} أصغر من ${formatDigits(D, isEastern)}، لذلك نأخذ رقمين معًا.`;
      break;
    case 'div':
      expectedAnswer = String(b.q);
      questionPrompt = `كم مرة يدخل ${formatDigits(D, isEastern)} في ${formatDigits(b.W, isEastern)}؟ (اختر رقم الناتج)`;
      hintText = `ابحث في جدول ضرب ${formatDigits(D, isEastern)} عن أكبر عدد لا يتجاوز ${formatDigits(b.W, isEastern)}.`;
      break;
    case 'mul':
      expectedAnswer = String(b.P);
      questionPrompt = `ما حاصل ضرب الناتج (${formatDigits(b.q, isEastern)}) في المقسوم عليه (${formatDigits(D, isEastern)})؟`;
      hintText = `${formatDigits(b.q, isEastern)} × ${formatDigits(D, isEastern)} = ؟`;
      break;
    case 'sub': {
      const isFinalSub = b === data.blocks[data.blocks.length - 1];
      expectedAnswer = String(b.R);
      questionPrompt = isFinalSub
        ? `ما ناتج الطرح الأخير (الباقي النهائي المميّز باللون البرتقالي الدافئ): ${formatDigits(b.W, isEastern)} − ${formatDigits(b.P, isEastern)}؟`
        : `ما ناتج الطرح (الباقي): ${formatDigits(b.W, isEastern)} − ${formatDigits(b.P, isEastern)}؟`;
      hintText = `اطرح من اليمين: ${formatDigits(b.W, isEastern)} − ${formatDigits(b.P, isEastern)}.`;
      break;
    }
    case 'down':
      expectedAnswer = String(b.d);
      questionPrompt = `ما هو الرقم التالي من المقسوم الذي ننزله الآن (ليظهر بالأزرق الملكي) بجانب الباقي؟`;
      hintText = `انظر للخانة التالية مباشرة في المقسوم، سينزل الرقم ليكون الضيف الجديد باللون الأزرق الملكي.`;
      break;
    case 'end':
      expectedAnswer = 'done';
      questionPrompt = `أحسنت! اكتملت جميع خطوات القسمة بنجاح!`;
      break;
  }

  // Generate 4 plausible multiple choice options (2x2 grid)
  const options = useMemo(() => {
    if (step.t === 'end') return [];
    const correctNum = Number(expectedAnswer);
    const setOfOpts = new Set<number>();
    setOfOpts.add(correctNum);

    if (step.t === 'pick') {
      // e.g. 7843 / 12 -> 7, 78, 79, 784
      setOfOpts.add(data.dg[0]);
      setOfOpts.add(correctNum + 1);
      if (b.e + 1 < data.dg.length) {
        setOfOpts.add(Number(data.dg.slice(0, b.e + 2).join('')));
      } else {
        setOfOpts.add(Math.max(1, correctNum * 10));
      }
    } else if (step.t === 'div') {
      if (correctNum > 0) setOfOpts.add(correctNum - 1);
      setOfOpts.add(correctNum + 1);
      setOfOpts.add(correctNum + 2);
    } else if (step.t === 'mul') {
      setOfOpts.add(Math.max(0, correctNum - D));
      setOfOpts.add(correctNum + D);
      setOfOpts.add(correctNum + 2);
    } else if (step.t === 'sub') {
      setOfOpts.add(Math.max(0, correctNum - 1));
      setOfOpts.add(correctNum + 1);
      setOfOpts.add(correctNum + 2);
    } else if (step.t === 'down') {
      [...data.dg].forEach((d) => setOfOpts.add(d));
      setOfOpts.add((correctNum + 1) % 10);
      setOfOpts.add((correctNum + 3) % 10);
    }

    // Ensure we always have exactly 4 unique options
    let offset = 1;
    while (setOfOpts.size < 4) {
      setOfOpts.add(correctNum + offset);
      if (correctNum - offset >= 0) setOfOpts.add(correctNum - offset);
      offset++;
    }

    const arr = Array.from(setOfOpts).slice(0, 4);
    // Shuffle deterministically based on step index
    return arr.sort((x, y) => {
      const hashX = (x * 37 + stepIndex * 13) % 100;
      const hashY = (y * 37 + stepIndex * 13) % 100;
      return hashX - hashY;
    });
  }, [expectedAnswer, step.t, stepIndex, D, data.dg, b.e]);

  const handleOptionClick = (opt: number) => {
    if (isTransitioning) return;

    const optStr = String(opt);
    const isMatch = optStr === expectedAnswer.trim();

    if (isMatch) {
      setSelectedCorrect(opt);
      setSelectedWrong(null);
      setIsTransitioning(true);

      if (soundEnabled) playSuccessChime();
      setScore((prev) => prev + 1);

      // Reveal step on the math board immediately!
      onStepVerified(true);

      // If last problem step, celebrate
      if (stepIndex === data.S.length - 2) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      // Automatically advance to the next step after a smooth visual confirmation
      setTimeout(() => {
        onStepVerified(false);
        onAdvanceStep();
      }, 650);
    } else {
      setSelectedWrong(opt);
      if (soundEnabled) playClick();
      setMistakes((prev) => prev + 1);

      // Clear the red indicator after a moment so the student can retry cleanly
      setTimeout(() => {
        setSelectedWrong(null);
      }, 900);
    }
  };

  // Final completion summary card
  if (step.t === 'end') {
    return (
      <div className="bg-[var(--card)] border-2 border-[var(--line)] rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-center space-y-4 shadow-xs transition-colors">
        <div className="w-16 h-16 bg-emerald-100 text-[var(--green)] rounded-full flex items-center justify-center mx-auto shadow-xs">
          <Award className="w-9 h-9" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-[var(--green)] m-0">
          مبروك! أتممت حل مسألة القسمة بنجاح!
        </h3>
        <p className="text-base sm:text-lg text-[var(--ink)] font-bold">
          ناتج القسمة هو{' '}
          <span className="font-mono text-xl text-[var(--green)] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 rounded-md">
            {formatDigits(data.Q, isEastern)}
          </span>{' '}
          والباقي النهائي هو{' '}
          <span className="font-mono text-xl text-[var(--rem-color)] bg-[var(--rem-bg)] border border-[var(--rem-border)] px-2 py-0.5 rounded-md">
            {formatDigits(data.R, isEastern)}
          </span>
          .
        </p>

        {/* Verification equation */}
        <div className="p-3 bg-[var(--paper)] border border-[var(--line)] rounded-xl inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-base font-mono font-bold mx-auto" dir="ltr">
          <span className="text-[var(--soft)]">(</span>
          <span className="text-[var(--green)] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-700">
            {formatDigits(data.Q, isEastern)}
          </span>
          <span className="text-[var(--soft)]">×</span>
          <span className="text-[var(--ink)]">{formatDigits(data.D, isEastern)}</span>
          <span className="text-[var(--soft)]">)</span>
          {data.R > 0 && (
            <>
              <span className="text-[var(--soft)]">+</span>
              <span className="text-[var(--rem-color)] bg-[var(--rem-bg)] px-2 py-0.5 rounded-md border border-[var(--rem-border)]">
                {formatDigits(data.R, isEastern)}
              </span>
            </>
          )}
          <span className="text-[var(--soft)]">=</span>
          <span className="text-[var(--ink)] font-black">{formatDigits(data.N, isEastern)}</span>
        </div>

        <div className="flex items-center justify-center gap-6 py-2">
          <div className="text-center">
            <span className="text-xs text-[var(--soft)] font-bold block">
              النقاط المحققة
            </span>
            <span className="text-2xl font-black text-[var(--green)]">
              {formatDigits(score, isEastern)} ⭐
            </span>
          </div>
          <div className="text-center">
            <span className="text-xs text-[var(--soft)] font-bold block">
              المحاولات الخاطئة
            </span>
            <span className="text-2xl font-black text-[var(--soft)]">
              {formatDigits(mistakes, isEastern)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="min-h-[48px] py-3 px-6 bg-[var(--btn)] text-[var(--btnt)] font-black text-base rounded-xl sm:rounded-2xl shadow-xs inline-flex items-center gap-2 hover:opacity-95 active:scale-95 transition-all touch-manipulation"
        >
          <RotateCcw className="w-5 h-5" />
          <span>حل مسألة جديدة</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] border-2 border-[var(--line)] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5 transition-colors">
      {/* Header with Step Tracker */}
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
        <span className="font-black text-sm sm:text-base text-[var(--btn)] flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>تحدي الخطوة: {STEP_LABELS[step.t]}</span>
        </span>
        <div className="flex items-center gap-3 text-xs font-bold text-[var(--soft)]">
          <span>
            الخطوة {formatDigits(stepIndex + 1, isEastern)} من{' '}
            {formatDigits(data.S.length, isEastern)}
          </span>
          <span className="text-[var(--green)] font-black">
            ⭐ {formatDigits(score, isEastern)}
          </span>
        </div>
      </div>

      {/* Question Prompt */}
      <div>
        <p className="text-base sm:text-lg font-black text-[var(--ink)] leading-relaxed">
          {questionPrompt}
        </p>
        <p className="text-xs text-[var(--soft)] font-semibold mt-0.5">
          اضغط على الخيار الصحيح للحل والانتقال المباشر للخطوة التالية:
        </p>
      </div>

      {/* 2x2 Grid: Exactly 4 Options */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 my-2">
        {options.map((opt, oIdx) => {
          const isThisCorrect = selectedCorrect === opt;
          const isThisWrong = selectedWrong === opt;

          let btnStyle =
            'bg-[var(--paper)] text-[var(--ink)] border-2 border-[var(--line)] hover:border-[var(--btn)] shadow-xs';

          if (isThisCorrect) {
            btnStyle =
              'bg-emerald-600 text-white border-2 border-emerald-600 shadow-md scale-[1.02] ring-4 ring-emerald-500/25';
          } else if (isThisWrong) {
            btnStyle =
              'bg-rose-600 text-white border-2 border-rose-600 shadow-xs animate-shake';
          }

          return (
            <button
              key={oIdx}
              type="button"
              disabled={isTransitioning}
              onClick={() => handleOptionClick(opt)}
              className={`min-h-[58px] sm:min-h-[66px] py-3 px-4 rounded-xl sm:rounded-2xl font-mono font-black text-xl sm:text-2xl transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 select-none touch-manipulation cursor-pointer ${btnStyle}`}
              dir="ltr"
            >
              {isThisCorrect && (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-white animate-bounce" />
              )}
              {isThisWrong && (
                <XCircle className="w-5 h-5 shrink-0 text-white" />
              )}
              <span>{formatDigits(opt, isEastern)}</span>
            </button>
          );
        })}
      </div>

      {/* Hint Toggle */}
      <div className="flex items-center justify-between pt-1 text-xs font-bold text-[var(--soft)]">
        <button
          type="button"
          onClick={() => setShowHint(!showHint)}
          className="hover:text-[var(--btn)] flex items-center gap-1.5 transition-colors py-1"
        >
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{showHint ? 'إخفاء التلميح' : 'أحتاج إلى تلميح'}</span>
        </button>

        {selectedWrong !== null && (
          <span className="text-rose-600 font-bold animate-pulse">
            إجابة غير صحيحة، جرّب خياراً آخر!
          </span>
        )}
      </div>

      {/* Hint Content Callout */}
      {showHint && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs sm:text-sm font-semibold text-[var(--warnt)]">
          💡 {hintText}
        </div>
      )}
    </div>
  );
};
