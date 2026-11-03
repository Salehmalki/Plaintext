import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  DivisionData,
  DivisionStep,
  formatDigits,
  calculateSubtraction,
  STEP_LABELS,
  STEP_DESCRIPTIONS,
} from '../utils/division';

interface StepExplanationProps {
  data: DivisionData;
  stepIndex: number;
  isEastern: boolean;
}

const CYCLE_KEYS: ('div' | 'mul' | 'sub' | 'down')[] = [
  'div',
  'mul',
  'sub',
  'down',
];

export const StepExplanation: React.FC<StepExplanationProps> = ({
  data,
  stepIndex,
  isEastern,
}) => {
  const step = data.S[stepIndex];
  const totalSteps = data.S.length;
  const progressPercent = Math.round(((stepIndex + 1) / totalSteps) * 100);

  const eq = (val: string | number) => (
    <bdi dir="ltr" className="eq mx-1 font-mono">
      {formatDigits(val, isEastern)}
    </bdi>
  );

  const renderStepContent = (s: DivisionStep) => {
    const b = s.b;
    const D = data.D;
    const bl = data.blocks;
    const prevBlock = bl[bl.indexOf(b) - 1];

    switch (s.t) {
      case 'pick': {
        const k = b.e + 1;
        if (b.W < D) {
          return (
            <p className="text-base sm:text-lg leading-relaxed">
              نأخذ المقسوم كله {eq(b.W)}، وهو أصغر من {eq(D)}.
            </p>
          );
        }
        if (k === 1) {
          return (
            <p className="text-base sm:text-lg leading-relaxed">
              نبدأ بأول رقم في المقسوم: {eq(b.W)}. هو أكبر من {eq(D)} أو يساويه، فنستطيع القسمة مباشرة.
            </p>
          );
        }
        return (
          <p className="text-base sm:text-lg leading-relaxed">
            أول رقم {eq(data.dg[0])} أصغر من {eq(D)} فلا يكفي، فنأخذ{' '}
            {formatDigits(k, isEastern)} أرقام معًا: {eq(b.W)}.
          </p>
        );
      }

      case 'down': {
        return (
          <p className="text-base sm:text-lg leading-relaxed">
            ننزل الرقم التالي{' '}
            <bdi dir="ltr" className="eq mx-1 font-mono text-[var(--royal-blue)] font-black">
              {formatDigits(b.d, isEastern)}
            </bdi>{' '}
            (الضيف الجديد الموضح بالأزرق الملكي على اللوحة) بجانب الباقي السابق{' '}
            {eq(prevBlock ? prevBlock.R : 0)}، فيصبح العدد الجديد {eq(b.W)}.
          </p>
        );
      }

      case 'div': {
        if (b.q > 0) {
          return (
            <div className="space-y-2 text-base sm:text-lg leading-relaxed">
              <p>
                كم مرة يدخل {eq(D)} في {eq(b.W)}؟
              </p>
              <p>
                يدخل {eq(b.q)} مرات؛ لأن{' '}
                {eq(`${D} × ${b.q} = ${b.P}`)}، ولو جرّبنا {eq(b.q + 1)} لتجاوزنا{' '}
                {eq(b.W)} لأن {eq(`${D} × ${b.q + 1} = ${b.P + D}`)}.
              </p>
              <p className="text-sm sm:text-base font-semibold text-[var(--soft)]">
                نكتب {eq(b.q)} في خانة الناتج فوق آخر رقم أخذناه.
              </p>
            </div>
          );
        }
        return (
          <p className="text-base sm:text-lg leading-relaxed">
            {eq(b.W)} أصغر من {eq(D)} فلا يدخل فيه ولا مرة. نكتب {eq(0)} في الناتج
            {b === bl[bl.length - 1] ? (
              <span> ويصبح الباقي {eq(b.W)}.</span>
            ) : (
              <span> ثم ننزل الرقم التالي.</span>
            )}
          </p>
        );
      }

      case 'mul': {
        return (
          <div className="space-y-2 text-base sm:text-lg leading-relaxed">
            <p>
              نضرب الرقم الذي كتبناه في الناتج في المقسوم عليه:
            </p>
            <p className="font-bold text-[var(--ink)]">
              {eq(`${b.q} × ${D} = ${b.P}`)}
            </p>
            <p className="text-sm sm:text-base font-semibold text-[var(--soft)]">
              نكتب {eq(b.P)} مباشرة تحت {eq(b.W)}.
            </p>
          </div>
        );
      }

      case 'sub': {
        const r = calculateSubtraction(b.W, b.P, isEastern);
        return (
          <div className="space-y-3 text-base sm:text-lg leading-relaxed">
            <p>
              نطرح من اليمين، خانة بخانة:{' '}
              {eq(`${b.W} − ${b.P} = ${b.R}`)}.
            </p>

            {r && r.any ? (
              <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3 text-sm sm:text-base">
                <p className="font-bold text-[var(--warnt)] mb-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>خطوات الاستلاف والتحويل:</span>
                </p>
                <ul className="space-y-1 text-[var(--red)] pr-4 list-disc font-semibold">
                  {r.lines.map((line, lIdx) => (
                    <li key={lIdx}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm sm:text-base text-[var(--green)] font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>طرح مباشر: لا نحتاج إلى استلاف في هذه الخطوة.</span>
              </p>
            )}

            <p className="font-bold">
              {b === bl[bl.length - 1] ? (
                <span className="flex items-center gap-2 flex-wrap">
                  <span>الباقي النهائي للقسمة هو</span>
                  <span className="text-[var(--rem-color)] bg-[var(--rem-bg)] border border-[var(--rem-border)] px-2 py-0.5 rounded-lg font-mono font-black text-lg">
                    {formatDigits(b.R, isEastern)}
                  </span>
                  <span className="text-sm font-normal text-[var(--soft)]">
                    (الموضح باللون البرتقالي الدافئ أسفل السبورة)
                  </span>
                </span>
              ) : (
                <span>
                  الباقي هو {eq(b.R)}
                  {b.R < data.D ? (
                    <span>
                      {' '}وهو أصغر من المقسوم عليه {eq(data.D)}، فالقسمة تسير بشكل صحيح.
                    </span>
                  ) : (
                    '.'
                  )}
                </span>
              )}
            </p>
          </div>
        );
      }

      case 'end': {
        const R = data.R;
        const hasRemainder = R > 0;
        return (
          <div
            className={`rounded-2xl p-4 sm:p-5 border-2 ${
              hasRemainder
                ? 'bg-amber-50/70 dark:bg-amber-950/20 text-[var(--ink)] border-amber-300 dark:border-amber-800'
                : 'bg-[var(--okbg)] text-[var(--okt)] border-emerald-300 dark:border-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              {hasRemainder ? (
                <AlertCircle className="w-6 h-6 shrink-0 text-[var(--rem-color)]" />
              ) : (
                <CheckCircle2 className="w-6 h-6 shrink-0" />
              )}
              <h3 className="text-xl sm:text-2xl font-black m-0">
                {hasRemainder ? 'قسمة مع باقي' : 'قسمة تامة بدون باقي'}
              </h3>
            </div>

            <div className="space-y-3 text-base sm:text-lg">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold">ناتج القسمة: </span>
                <span className="text-[var(--green)] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 px-2.5 py-0.5 rounded-lg font-mono font-black text-xl">
                  {formatDigits(data.Q, isEastern)}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold">الباقي النهائي: </span>
                <span className="text-[var(--rem-color)] bg-[var(--rem-bg)] border border-[var(--rem-border)] px-2.5 py-0.5 rounded-lg font-mono font-black text-xl">
                  {formatDigits(R, isEastern)}
                </span>
                <span className="text-xs sm:text-sm text-[var(--soft)] font-semibold">
                  (المميز باللون البرتقالي الدافئ أسفل اللوحة)
                </span>
              </div>

              <p className="text-sm sm:text-base opacity-90">
                {hasRemainder
                  ? `بقي ${formatDigits(R, isEastern)} ولا يمكن قسمته على ${formatDigits(data.D, isEastern)} لأنه أصغر منه.`
                  : 'لا يوجد باقي لأن آخر عملية طرح انتهت بصفر.'}
              </p>

              {/* Visual Verification Formula tied to board colors */}
              <div className="mt-4 pt-3.5 border-t border-[var(--line)]">
                <div className="text-sm font-bold text-[var(--soft)] mb-2 flex items-center justify-between">
                  <span>معادلة التحقق (المقسوم = الناتج × المقسوم عليه + الباقي):</span>
                </div>
                <div
                  className="p-3 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 text-base sm:text-lg font-mono font-bold"
                  dir="ltr"
                >
                  <span className="text-[var(--soft)] font-normal">(</span>
                  <span
                    title="الناتج (أعلى اللوحة بالأخضر)"
                    className="text-[var(--green)] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-700"
                  >
                    {formatDigits(data.Q, isEastern)}
                  </span>
                  <span className="text-[var(--soft)]">×</span>
                  <span title="المقسوم عليه" className="text-[var(--ink)] px-1">
                    {formatDigits(data.D, isEastern)}
                  </span>
                  <span className="text-[var(--soft)] font-normal">)</span>
                  {hasRemainder && (
                    <>
                      <span className="text-[var(--soft)]">+</span>
                      <span
                        title="الباقي النهائي (أسفل اللوحة بالبرتقالي)"
                        className="text-[var(--rem-color)] bg-[var(--rem-bg)] px-2.5 py-0.5 rounded-md border border-[var(--rem-border)] shadow-xs"
                      >
                        {formatDigits(R, isEastern)}
                      </span>
                    </>
                  )}
                  <span className="text-[var(--soft)]">=</span>
                  <span title="المقسوم" className="text-[var(--ink)] font-black px-1">
                    {formatDigits(data.N, isEastern)}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-[var(--soft)] font-bold mt-2">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--green)] inline-block"></span>
                    <span>الناتج (أخضر)</span>
                  </span>
                  {hasRemainder && (
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--rem-color)] inline-block"></span>
                      <span>الباقي النهائي (برتقالي دافئ)</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <section className="bg-[var(--card)] border-2 border-[var(--line)] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs transition-colors">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-[var(--line)] rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-[var(--green)] transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Cycle Indicator Tabs */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-3">
        {CYCLE_KEYS.map((key) => {
          const isActive = step.t === key;
          return (
            <div
              key={key}
              className={`text-center py-1 sm:py-1.5 px-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                isActive
                  ? 'bg-[var(--btn)] text-[var(--btnt)] shadow-xs scale-[1.02]'
                  : 'bg-[var(--paper)] text-[var(--soft)] border border-[var(--line)]'
              }`}
            >
              {STEP_LABELS[key]}
            </div>
          );
        })}
      </div>

      {/* Step Header */}
      <div className="pb-2.5 mb-3 border-b border-[var(--line)]">
        <h2 className="text-lg sm:text-xl font-black text-[var(--ink)] m-0">
          شرح الخطوة: {STEP_LABELS[step.t]}{' '}
          <span className="text-xs sm:text-sm font-bold text-[var(--soft)]">
            (الخطوة {formatDigits(stepIndex + 1, isEastern)} من{' '}
            {formatDigits(totalSteps, isEastern)})
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-[var(--soft)] mt-0.5">
          {STEP_DESCRIPTIONS[step.t]}
        </p>
      </div>

      {/* Dynamic Content */}
      <div className="py-1" aria-live="polite">
        {renderStepContent(step)}
      </div>
    </section>
  );
};
