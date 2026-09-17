import React, { useState, useCallback } from 'react';
import { ControlPanel } from './ControlPanel';
import { SimulationScene } from './SimulationScene';
import { ResultCards } from './ResultCards';
import { ResultsTable } from './ResultsTable';
import { HowItWorks } from './HowItWorks';
import { SYNTHETIC_SCENARIOS } from '../../lib/syntheticData';
import { runOptimization } from '../../lib/optimizer';
import type { OptimizationResult, SimulationParams } from '../../lib/types';
import { ArrowLeft, Cpu, Activity } from 'lucide-react';

interface SimulatorDashboardProps {
  onBackToLanding?: () => void;
}

const DEFAULT_PARAMS: SimulationParams = {
  scenarioId: 'medium',
  budget: 18,
  maxSites: 4,
  minProtectionThreshold: 0.65,
};

export const SimulatorDashboard: React.FC<SimulatorDashboardProps> = ({
  onBackToLanding,
}) => {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  // Active scenario definition
  const currentScenario = SYNTHETIC_SCENARIOS[params.scenarioId] || SYNTHETIC_SCENARIOS.medium;

  // Active optimization result
  const [result, setResult] = useState<OptimizationResult>(() =>
    runOptimization(currentScenario, DEFAULT_PARAMS)
  );

  // Execute optimization
  const executeOptimization = useCallback((currentParams: SimulationParams) => {
    const activeScenario = SYNTHETIC_SCENARIOS[currentParams.scenarioId];
    setIsOptimizing(true);
    // 500ms smooth simulation loading experience
    setTimeout(() => {
      const newResult = runOptimization(activeScenario, currentParams);
      setResult(newResult);
      setIsOptimizing(false);
    }, 500);
  }, []);

  // Update params handler
  const handleParamChange = (newValues: Partial<SimulationParams>) => {
    const updated = { ...params, ...newValues };
    setParams(updated);
    // If scenario changed, re-run immediately
    if (newValues.scenarioId && newValues.scenarioId !== params.scenarioId) {
      const activeScenario = SYNTHETIC_SCENARIOS[newValues.scenarioId];
      const newResult = runOptimization(activeScenario, updated);
      setResult(newResult);
    }
  };

  const handleRunOptimization = () => {
    executeOptimization(params);
  };

  const handleReset = () => {
    setParams(DEFAULT_PARAMS);
    const defaultScenario = SYNTHETIC_SCENARIOS[DEFAULT_PARAMS.scenarioId];
    const newResult = runOptimization(defaultScenario, DEFAULT_PARAMS);
    setResult(newResult);
  };

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* ============================================================ */}
      {/* 1. CLEAN HEADER */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 bg-[#070d1e]/95 backdrop-blur-md border-b border-cyan-950/80 px-4 md:px-8 py-3.5 shadow-lg">
        <div className="max-w-[1520px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Brand & Nav */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding ? onBackToLanding : () => (window.location.href = '/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono text-slate-300 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Landing</span>
            </button>

            <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h1 className="text-base md:text-lg font-bold tracking-tight text-white font-mono">
                Synthetic Site Optimizer
              </h1>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              <Activity className="w-3 h-3 text-cyan-400" />
              Interactive 3D Engine
            </span>
          </div>

          {/* Clean Subtext */}
          <div className="text-[11px] font-mono text-slate-400 hidden md:block">
            100 × 100 km Defense Siting & Trajectory Simulation Benchmark
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MAIN DASHBOARD CONTENT */}
      {/* ============================================================ */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto px-4 md:px-8 py-6 flex flex-col gap-6">
        {/* Top Grid: Controls on Left, 3D Scene on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Control Panel (4 cols on lg) */}
          <div className="lg:col-span-4 xl:col-span-3 w-full">
            <ControlPanel
              params={params}
              onParamChange={handleParamChange}
              onRunOptimization={handleRunOptimization}
              onReset={handleReset}
              isOptimizing={isOptimizing}
            />
          </div>

          {/* Right Column: 3D Visualization + Result Cards (8 cols on lg) */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-5 w-full">
            {/* 3D Simulation Panel */}
            <SimulationScene
              scenario={currentScenario}
              optimizationResult={result}
            />

            {/* 5 Result Summary Cards */}
            <ResultCards
              scenario={currentScenario}
              result={result}
              budgetLimit={params.budget}
              threshold={params.minProtectionThreshold}
            />
          </div>
        </div>

        {/* Bottom Section: Result Table & Chart Analysis */}
        <div className="w-full">
          <ResultsTable
            scenario={currentScenario}
            result={result}
            threshold={params.minProtectionThreshold}
          />
        </div>

        {/* Full User Manual & 3D Simulation Walkthrough */}
        <div className="w-full pb-8">
          <HowItWorks />
        </div>
      </main>

      {/* ============================================================ */}
      {/* 3. FOOTER */}
      {/* ============================================================ */}
      <footer className="bg-[#040711] border-t border-slate-900 py-6 px-4 md:px-8 text-center text-xs font-mono text-slate-500">
        <div className="max-w-[1520px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>Synthetic Site Optimizer • Decision Support System</span>
          <span>100 × 100 km GIS Benchmark • Academic Demonstration</span>
        </div>
      </footer>
    </div>
  );
};
