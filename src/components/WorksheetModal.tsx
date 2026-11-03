import React, { useState } from 'react';
import {
  Printer,
  X,
  Copy,
  Check,
  FileText,
  HelpCircle,
  Eye,
  EyeOff,
  PlusCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  DivisionData,
  formatDigits,
  generateBoardState,
  STEP_LABELS,
} from '../utils/division';
import { MathBoard } from './MathBoard';

interface WorksheetModalProps {
  data: DivisionData;
  isEastern: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const WorksheetModal: React.FC<WorksheetModalProps> = ({
  data,
  isEastern,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [includeSolution, setIncludeSolution] = useState(true);
  const [includeMultiples, setIncludeMultiples] = useState(true);
  const [includeExercises, setIncludeExercises] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('');
  const [printError, setPrintError] = useState<string | null>(null);

  if (!isOpen) return null;

  const N_F = formatDigits(data.N, isEastern);
  const D_F = formatDigits(data.D, isEastern);
  const Q_F = formatDigits(data.Q, isEastern);
  const R_F = formatDigits(data.R, isEastern);
  const hasRemainder = data.R > 0;

  // Generate 2 practice exercises related to the problem difficulty
  const practiceExercises = [
    {
      dividend: Math.round(data.N * 0.85) + 3,
      divisor: data.D,
    },
    {
      dividend: Math.round(data.N * 1.4) + 7,
      divisor: data.D <= 9 ? data.D + 2 : Math.max(3, data.D - 3),
    },
  ];

  const handlePrint = () => {
    setPrintError(null);
    try {
      window.print();
    } catch (err) {
      console.warn('window.print() error in iframe:', err);
      setPrintError(
        'قد يمنع المتصفح نافذة الطباعة التلقائية داخل بعض الإطارات المضمنة. يمكنك الضغط على (Ctrl + P) أو نسخ ملخص ورقة العمل أدناه.'
      );
    }
  };

  const handleCopySummary = () => {
    const text = `ورقة عمل القسمة المطولة
المسألة: ${N_F} ÷ ${D_F}
ناتج القسمة: ${Q_F}
الباقي: ${R_F}
معادلة التحقق: (${Q_F} × ${D_F}) ${hasRemainder ? `+ ${R_F}` : ''} = ${N_F}
-----------------------------
جدول مضاعفات ${D_F}:
${Array.from({ length: 9 }, (_, i) => `${D_F} × ${formatDigits(i + 1, isEastern)} = ${formatDigits((i + 1) * data.D, isEastern)}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-4xl bg-[var(--card)] border-2 border-[var(--line)] rounded-3xl shadow-2xl flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:rounded-none overflow-hidden">
        {/* Modal Toolbar (Hidden during print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[var(--line)] bg-[var(--paper)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--btn)] text-[var(--btnt)] flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[var(--ink)] m-0">
                معاينة ورقة العمل القابلة للطباعة (Worksheet)
              </h2>
              <p className="text-xs text-[var(--soft)] font-semibold">
                ورقة عمل مدرسية مصممة للطباعة على ورق A4 أو حفظها كـ PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2 px-4 rounded-xl bg-[var(--btn)] hover:opacity-95 text-[var(--btnt)] font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة ورقة العمل (Ctrl + P)</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="py-2 px-3 rounded-xl border-2 border-[var(--line)] hover:border-[var(--btn)] text-[var(--ink)] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[var(--green)]" />
                  <span className="text-[var(--green)]">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ الملخص</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-[var(--line)] text-[var(--soft)] hover:text-[var(--ink)] hover:bg-[var(--line)]/40 transition-colors"
              aria-label="إغلاق المعاينة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customization Options Bar (Hidden during print) */}
        <div className="no-print px-5 py-3 border-b border-[var(--line)] bg-[var(--card)] flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-[var(--ink)]">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeSolution}
                onChange={(e) => setIncludeSolution(e.target.checked)}
                className="rounded border-[var(--line)] text-[var(--btn)] focus:ring-0"
              />
              <span>تضمين خطوات الحل الكاملة (نموذج إجابة)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeMultiples}
                onChange={(e) => setIncludeMultiples(e.target.checked)}
                className="rounded border-[var(--line)] text-[var(--btn)] focus:ring-0"
              />
              <span>تضمين جدول المضاعفات المساعد</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeExercises}
                onChange={(e) => setIncludeExercises(e.target.checked)}
                className="rounded border-[var(--line)] text-[var(--btn)] focus:ring-0"
              />
              <span>إضافة تمارين إضافية للحل الذاتي</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[var(--soft)]">اسم الطالب:</span>
            <input
              type="text"
              placeholder="اكتب الاسم هنا (اختياري)..."
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="py-1 px-2.5 text-xs rounded-lg border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] focus:outline-none"
            />
          </div>
        </div>

        {/* Notice if printing fails or blocked in sandbox */}
        {printError && (
          <div className="no-print mx-5 my-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{printError}</span>
          </div>
        )}

        {/* Scrollable Printable Document Sheet */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 printable-sheet bg-white text-slate-900 print:p-0 print:overflow-visible">
          {/* 1. School Worksheet Header */}
          <div className="border-b-2 border-slate-800 pb-4">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0">
                  ورقة عمل: القسمة المطولة خطوة بخطوة
                </h1>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  مادة الرياضيات · مهارات القسمة على عدد من منزلة ومنزلتين مع الاستلاف
                </p>
              </div>
              <div className="text-left font-mono font-bold text-sm bg-slate-100 py-1.5 px-3 rounded-lg border border-slate-300">
                <span>{N_F} ÷ {D_F}</span>
              </div>
            </div>

            {/* Student metadata fields */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold pt-2 border-t border-slate-200">
              <div>
                <span className="text-slate-500">اسم الطالب/ـة: </span>
                <span className="text-slate-900 border-b border-dotted border-slate-400 pb-0.5 inline-block min-w-[120px]">
                  {studentName || '................................'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">الصف: </span>
                <span className="text-slate-900 border-b border-dotted border-slate-400 pb-0.5 inline-block min-w-[70px]">
                  {className || '..................'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">التاريخ: </span>
                <span className="text-slate-900 border-b border-dotted border-slate-400 pb-0.5 inline-block min-w-[90px]">
                  {new Date().toLocaleDateString('ar-SA')}
                </span>
              </div>
              <div>
                <span className="text-slate-500">الدرجة / التقييم: </span>
                <span className="text-slate-900 border-b border-dotted border-slate-400 pb-0.5 inline-block min-w-[70px]">
                  ........ / ١٠
                </span>
              </div>
            </div>
          </div>

          {/* 2. Main Problem Title & Final Result */}
          <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-500 block mb-1">
                المسألة الرئيسية المراد حلها:
              </span>
              <div className="text-2xl font-black font-mono tracking-wide text-slate-900" dir="ltr">
                {N_F} ÷ {D_F} = {includeSolution ? Q_F : '؟'}
                {includeSolution && hasRemainder && (
                  <span className="text-base text-amber-700 font-sans mr-2">
                    (والباقي: {R_F})
                  </span>
                )}
              </div>
            </div>

            {includeSolution && (
              <div className="text-xs font-bold text-slate-700 bg-white py-2 px-3 rounded-lg border border-slate-200 space-y-1">
                <div>
                  <span className="text-slate-500">ناتج القسمة: </span>
                  <span className="font-mono text-emerald-700 text-sm">{Q_F}</span>
                </div>
                <div>
                  <span className="text-slate-500">الباقي: </span>
                  <span className="font-mono text-rose-700 text-sm">{R_F}</span>
                </div>
                <div className="border-t border-slate-100 pt-1 text-[11px] font-mono text-slate-600">
                  التحقق: ({Q_F} × {D_F}) {hasRemainder ? `+ ${R_F}` : ''} = {N_F}
                </div>
              </div>
            )}
          </div>

          {/* 3. Primary Division Tableau */}
          <div className="border border-slate-300 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200 text-xs font-black text-slate-700">
              <span>
                {includeSolution
                  ? 'أولاً: لوحة القسمة المطولة الكاملة مع خطوات الاستلاف والإنزال'
                  : 'أولاً: مساحة حل المسألة (اكتب خطوات القسمة المطولة بالتفصيل)'}
              </span>
              {includeSolution && (
                <span className="text-emerald-700 text-[11px]">نموذج الحل المعتمد</span>
              )}
            </div>

            {includeSolution ? (
              <div className="py-2">
                <MathBoard
                  data={data}
                  currentStepIndex={data.S.length - 1}
                  isEastern={isEastern}
                />
              </div>
            ) : (
              /* Blank Tableau Grid for Student to Solve */
              <div className="py-8 px-4 text-center border-2 border-dashed border-slate-300 rounded-lg min-h-[220px] flex flex-col items-center justify-center">
                <div className="text-slate-400 font-mono text-xl mb-2" dir="ltr">
                  _____{N_F} ) {D_F}
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  مساحة مخصصة للطالب لإجراء خطوات القسمة المطولة بقلم الرصاص (اقسم، اضرب، اطرح، أنزل)
                </span>
              </div>
            )}
          </div>

          {/* 4. Multiples Reference Table (if enabled) */}
          {includeMultiples && (
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              <span className="text-xs font-black text-slate-700 block mb-2">
                ثانياً: جدول مضاعفات المقسوم عليه ({D_F}) للمساعدة في سرعة الحساب:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 text-center text-xs font-mono">
                {Array.from({ length: 9 }, (_, i) => {
                  const m = i + 1;
                  const val = m * data.D;
                  return (
                    <div
                      key={m}
                      className="bg-white border border-slate-200 p-1 rounded-md"
                      dir="ltr"
                    >
                      <span className="text-[10px] text-slate-400 block">
                        {D_F}×{formatDigits(m, isEastern)}
                      </span>
                      <span className="font-bold text-slate-800">
                        {formatDigits(val, isEastern)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Additional Practice Exercises (if enabled) */}
          {includeExercises && (
            <div className="border-t-2 border-slate-800 pt-4">
              <span className="text-xs font-black text-slate-800 block mb-3">
                ثالثاً: مسائل تدريبية للحل الذاتي (واجب منزلي / تمرين فصلي):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {practiceExercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-300 rounded-xl p-3.5 space-y-2 bg-white"
                  >
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span>تمرين ({formatDigits(idx + 1, isEastern)}):</span>
                      <span className="font-mono text-sm bg-slate-100 px-2 py-0.5 rounded border border-slate-200" dir="ltr">
                        {formatDigits(ex.dividend, isEastern)} ÷ {formatDigits(ex.divisor, isEastern)} = ......
                      </span>
                    </div>
                    {/* Empty working box */}
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-300 text-xs">
                      مكان الحل والتحقق
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 font-semibold flex items-center justify-between">
            <span>تطبيق القسمة المطولة خطوة بخطوة · ورقة عمل تفاعلية</span>
            <span>التحقق: المقسوم = (ناتج القسمة × المقسوم عليه) + الباقي</span>
          </div>
        </div>
      </div>
    </div>
  );
};
