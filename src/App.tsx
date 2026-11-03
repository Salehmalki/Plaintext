/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { InputsCard } from './components/InputsCard';
import { MathBoard } from './components/MathBoard';
import { StepExplanation } from './components/StepExplanation';
import { MultiplesHelper } from './components/MultiplesHelper';
import { AllStepsList } from './components/AllStepsList';
import { PracticeMode } from './components/PracticeMode';
import { WorksheetModal } from './components/WorksheetModal';
import {
  buildDivision,
  formatDigits,
  normalizeDigits,
  DivisionData,
} from './utils/division';
import { playStepChime, playClick } from './utils/audio';

export default function App() {
  // Theme & Settings
  const [isEastern, setIsEastern] = useState<boolean>(true);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [appMode, setAppMode] = useState<'explain' | 'practice'>('explain');

  // Input states
  const [dividend, setDividend] = useState<string>('7843');
  const [divisor, setDivisor] = useState<string>('12');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Division math data & navigation
  const [data, setData] = useState<DivisionData | null>(null);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPracticeStepVerified, setIsPracticeStepVerified] = useState<boolean>(false);
  const [isWorksheetOpen, setIsWorksheetOpen] = useState<boolean>(false);

  const workSectionRef = useRef<HTMLDivElement>(null);

  // Initialize theme from system or preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        setIsDark(true);
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
  }, []);

  // Update theme on html root
  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDark]);

  // Initial calculation on first mount
  useEffect(() => {
    startDivision('7843', '12', true);
  }, []);

  // Auto-update inputs and calculation when digit system changes
  useEffect(() => {
    setDividend((prev) => {
      const norm = normalizeDigits(prev);
      return norm ? formatDigits(norm, isEastern) : '';
    });
    setDivisor((prev) => {
      const norm = normalizeDigits(prev);
      return norm ? formatDigits(norm, isEastern) : '';
    });
    if (data) {
      const normA = String(data.N);
      const numB = data.D;
      setData(buildDivision(normA, numB, isEastern));
    }
  }, [isEastern]);

  const startDivision = (
    dividendVal: string,
    divisorVal: string,
    easternFlag = isEastern,
    playSound = false
  ) => {
    const normA = normalizeDigits(dividendVal);
    const normB = normalizeDigits(divisorVal);

    if (!normA || !normB) {
      setErrorMessage('اكتب العددين أولًا.');
      return;
    }

    const numB = Number(normB);
    if (numB === 0) {
      setErrorMessage('لا يمكن القسمة على صفر. جرّب عددًا آخر.');
      return;
    }

    setErrorMessage('');
    const divisionResult = buildDivision(normA, numB, easternFlag);
    setData(divisionResult);
    setStepIndex(0);
    setIsPracticeStepVerified(false);
    setIsPlaying(false);

    if (soundEnabled && playSound) {
      playClick();
    }
  };

  const handleStart = () => {
    startDivision(dividend, divisor, isEastern, true);
    setTimeout(() => {
      workSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleRandomProblem = () => {
    // Generate clean problems with diverse mathematical scenarios:
    // 1) Zero in quotient (e.g. 4025 / 5)
    // 2) 2-digit divisor (e.g. 7843 / 12)
    // 3) 1-digit divisor with borrowing
    // 4) Exact division without remainder
    const roll = Math.random();
    let randA: number;
    let randB: number;

    if (roll < 0.28) {
      // Scenario 1: Zero in the quotient
      const baseQuotients = [102, 105, 204, 308, 405, 506, 608, 704, 805, 902];
      const q = baseQuotients[Math.floor(Math.random() * baseQuotients.length)];
      randB = [4, 5, 6, 7, 8, 9, 12][Math.floor(Math.random() * 7)];
      randA = q * randB + (Math.random() > 0.4 ? Math.floor(Math.random() * (randB - 1)) : 0);
    } else if (roll < 0.58) {
      // Scenario 2: 2-digit divisor
      const twoDigitDivisors = [11, 12, 14, 15, 18, 22, 24, 25, 28, 32, 35, 45];
      randB = twoDigitDivisors[Math.floor(Math.random() * twoDigitDivisors.length)];
      randA = Math.floor(Math.random() * 8800) + 1200;
    } else if (roll < 0.82) {
      // Scenario 3: 1-digit divisor with step-by-step borrowing
      const oneDigitDivisors = [3, 4, 5, 6, 7, 8, 9];
      randB = oneDigitDivisors[Math.floor(Math.random() * oneDigitDivisors.length)];
      randA = Math.floor(Math.random() * 9200) + 350;
    } else {
      // Scenario 4: Clean exact division without remainder
      randB = [4, 6, 8, 12, 15, 16, 24][Math.floor(Math.random() * 7)];
      const q = Math.floor(Math.random() * 450) + 40;
      randA = q * randB;
    }

    const formattedA = formatDigits(randA, isEastern);
    const formattedB = formatDigits(randB, isEastern);
    setDividend(formattedA);
    setDivisor(formattedB);
    startDivision(String(randA), String(randB), isEastern, true);

    setTimeout(() => {
      workSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleNextStep = () => {
    if (!data) return;
    if (stepIndex < data.S.length - 1) {
      setStepIndex((prev) => prev + 1);
      setIsPracticeStepVerified(false);
      if (soundEnabled) playStepChime();
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrevStep = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
      setIsPracticeStepVerified(false);
      if (soundEnabled) playClick();
    }
  };

  const handleResetStep = () => {
    setStepIndex(0);
    setIsPracticeStepVerified(false);
    setIsPlaying(false);
    if (soundEnabled) playClick();
  };

  const handleSelectStep = (idx: number) => {
    setStepIndex(idx);
    setIsPracticeStepVerified(false);
    setIsPlaying(false);
    if (soundEnabled) playStepChime();
  };

  const handleTogglePlay = () => {
    if (stepIndex >= (data?.S.length || 1) - 1) {
      setStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Autoplay interval timer
  useEffect(() => {
    if (!isPlaying || !data) return;

    const timer = setInterval(() => {
      setStepIndex((current) => {
        if (current >= data.S.length - 1) {
          setIsPlaying(false);
          return current;
        }
        if (soundEnabled) playStepChime();
        return current + 1;
      });
    }, 2800);

    return () => clearInterval(timer);
  }, [isPlaying, data, soundEnabled]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!data) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        // Next step in RTL reading flow
        e.preventDefault();
        handleNextStep();
      } else if (e.key === 'ArrowRight') {
        // Previous step in RTL reading flow
        e.preventDefault();
        handlePrevStep();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleTogglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data, stepIndex, isPlaying]);

  const activeQuotientDigit = data?.S[stepIndex]?.b?.q;

  return (
    <div className="max-w-3xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-4 sm:space-y-6">
      {/* 1. Header */}
      <Header
        isEastern={isEastern}
        onToggleDigits={() => setIsEastern(!isEastern)}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onPrint={() => setIsWorksheetOpen(true)}
      />

      {/* 2. Inputs & Presets Card */}
      <div className="no-print">
        <InputsCard
          dividend={dividend}
          divisor={divisor}
          onDividendChange={setDividend}
          onDivisorChange={setDivisor}
          onSubmit={handleStart}
          onRandomProblem={handleRandomProblem}
          errorMessage={errorMessage}
          isEastern={isEastern}
          appMode={appMode}
          onModeChange={(m) => {
            setAppMode(m);
            setStepIndex(0);
            setIsPracticeStepVerified(false);
            setIsPlaying(false);
          }}
        />
      </div>

      {/* 3. Multiples Helper Quick Drawer */}
      {data && (
        <MultiplesHelper
          divisor={data.D}
          activeQuotient={activeQuotientDigit}
          isEastern={isEastern}
        />
      )}

      {/* 4. Main Work Area (Math Board & Step Explanation) */}
      {data && (
        <section ref={workSectionRef} className="space-y-4">
          {/* Visual Long Division Tableau with Touch Navigation right below it */}
          <MathBoard
            data={data}
            currentStepIndex={
              appMode === 'practice'
                ? isPracticeStepVerified
                  ? stepIndex
                  : stepIndex - 1
                : stepIndex
            }
            isEastern={isEastern}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onReset={handleResetStep}
            canNext={stepIndex < data.S.length - 1}
            canPrev={stepIndex > 0}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            showControls={appMode === 'explain'}
          />

          {/* Mode Switch: Explanation vs Practice Quiz */}
          {appMode === 'explain' ? (
            <StepExplanation
              data={data}
              stepIndex={stepIndex}
              isEastern={isEastern}
            />
          ) : (
            <PracticeMode
              data={data}
              stepIndex={stepIndex}
              isStepVerified={isPracticeStepVerified}
              onStepVerified={setIsPracticeStepVerified}
              onAdvanceStep={handleNextStep}
              onReset={handleResetStep}
              isEastern={isEastern}
              soundEnabled={soundEnabled}
            />
          )}

          {/* All Steps Accordion */}
          <div className="bg-[var(--card)] border-2 border-[var(--line)] rounded-2xl p-4 shadow-xs">
            <AllStepsList
              data={data}
              currentStepIndex={stepIndex}
              onSelectStep={handleSelectStep}
              isEastern={isEastern}
            />
          </div>
        </section>
      )}

      {/* 5. Printable Educational Worksheet Modal (تم تعليقه مؤقتاً ويمكن إعادة تفعيله لاحقاً) */}
      {/*
      {data && (
        <WorksheetModal
          data={data}
          isEastern={isEastern}
          isOpen={isWorksheetOpen}
          onClose={() => setIsWorksheetOpen(false)}
        />
      )}
      */}
    </div>
  );
}
