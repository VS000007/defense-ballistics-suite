import React, { useState, useCallback } from 'react';
import { ControlPanel } from './ControlPanel';
import { SimulationScene } from './SimulationScene';
import { ResultCards } from './ResultCards';
import { ResultsTable } from './ResultsTable';
import { HowItWorks } from './HowItWorks';
import { SYNTHETIC_SCENARIOS } from '../../lib/syntheticData';
import { runOptimization } from '../../lib/optimizer';
import type { OptimizationResult, SimulationParams } from '../../lib/types';
import { ArrowLeft, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

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
      {/* 1. HEADER */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 bg-[#070d1e]/90 backdrop-blur-md border-b border-cyan-950/80 px-4 md:px-8 py-3.5 shadow-lg">
        <div className="max-w-[1520px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Brand & Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Back button */}
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

            {/* Badges */}
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500/50 text-emerald-300 shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Hackathon MVP
            </span>

            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              Synthetic Data
            </span>
          </div>

          {/* Header Safety Disclaimer */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-amber-500/30 px-3 py-1.5 rounded-lg text-[11px] font-mono text-amber-300/90 max-w-2xl">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate sm:whitespace-normal">
              Academic synthetic simulation — all locations, trajectories, probabilities, and results are fictional and not for operational use.
            </span>
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

        {/* Collapsible Educational Section: How the simulation works */}
        <div className="w-full pb-8">
          <HowItWorks />
        </div>
      </main>

      {/* ============================================================ */}
      {/* 3. FOOTER */}
      {/* ============================================================ */}
      <footer className="bg-[#040711] border-t border-slate-900 py-6 px-4 md:px-8 text-center text-xs font-mono text-slate-500">
        <div className="max-w-[1520px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>Synthetic Site Optimizer • Academic Research Prototype</span>
          <span>Fictional 100 × 100 km GIS Benchmark • Strictly Non-Operational</span>
        </div>
      </footer>
    </div>
  );
};
