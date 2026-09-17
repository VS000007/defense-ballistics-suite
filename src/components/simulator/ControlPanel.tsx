import React from 'react';
import type { ScenarioId, SimulationParams } from '../../lib/types';
import { Play, RotateCcw, Sliders, Layers, DollarSign, Target, ShieldCheck, HelpCircle } from 'lucide-react';

interface ControlPanelProps {
  params: SimulationParams;
  onParamChange: (newParams: Partial<SimulationParams>) => void;
  onRunOptimization: () => void;
  onReset: () => void;
  isOptimizing: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  params,
  onParamChange,
  onRunOptimization,
  onReset,
  isOptimizing,
}) => {
  return (
    <div className="bg-[#0b1329]/90 backdrop-blur-md border border-cyan-900/40 rounded-xl p-5 shadow-xl text-slate-200 flex flex-col gap-5">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-wide">Simulation Controls</h2>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-semibold">
          Client Engine
        </span>
      </div>

      {/* Scenario Dropdown */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-mono text-slate-300 font-medium flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Threat Scenario
          </span>
          <span className="text-[10px] text-slate-400">10 Synthetic Vectors</span>
        </label>
        <select
          value={params.scenarioId}
          onChange={(e) => onParamChange({ scenarioId: e.target.value as ScenarioId })}
          className="bg-slate-900/90 border border-slate-700 hover:border-cyan-500/60 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer transition-colors"
        >
          <option value="short">Short Synthetic Scenario (Low-Altitude Ingress)</option>
          <option value="medium">Medium Synthetic Scenario (Balanced Multi-Axis)</option>
          <option value="long">Long Synthetic Scenario (Exo-Atmospheric Arc)</option>
        </select>
        <p className="text-[10px] text-slate-400 font-mono">
          {params.scenarioId === 'short' && 'High-speed terminal vectors with localized defensive requirements.'}
          {params.scenarioId === 'medium' && 'Balanced territorial corridors across the synthetic 100 × 100 km grid.'}
          {params.scenarioId === 'long' && 'High-apogee sub-orbital vectors requiring wide sensor coordination.'}
        </p>
      </div>

      {/* Budget Slider */}
      <div className="flex flex-col gap-1.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-300">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Normalized Budget
          </span>
          <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 text-xs">
            {params.budget} Units
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={30}
          step={1}
          value={params.budget}
          onChange={(e) => onParamChange({ budget: Number(e.target.value) })}
          className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>Min: 5</span>
          <span>Default: 18</span>
          <span>Max: 30</span>
        </div>
      </div>

      {/* Maximum Selected Sites Slider */}
      <div className="flex flex-col gap-1.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            Max Selectable Sites
          </span>
          <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 text-xs">
            {params.maxSites} / 10 Sites
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={params.maxSites}
          onChange={(e) => onParamChange({ maxSites: Number(e.target.value) })}
          className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>1 Site</span>
          <span>Limit: 5 Sites</span>
        </div>
      </div>

      {/* Protection Threshold Slider */}
      <div className="flex flex-col gap-1.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Protection Threshold
          </span>
          <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 text-xs">
            {Math.round(params.minProtectionThreshold * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0.40}
          max={0.95}
          step={0.05}
          value={params.minProtectionThreshold}
          onChange={(e) => onParamChange({ minProtectionThreshold: Number(e.target.value) })}
          className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>0.40 (40%)</span>
          <span>0.65 (65%)</span>
          <span>0.95 (95%)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5 pt-2">
        <button
          onClick={onRunOptimization}
          disabled={isOptimizing}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-mono text-xs uppercase font-bold tracking-wider transition-all duration-200 shadow-lg ${
            isOptimizing
              ? 'bg-cyan-800/50 text-cyan-200 cursor-not-allowed border border-cyan-600/40'
              : 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white shadow-emerald-950/50 border border-emerald-400/50 hover:shadow-emerald-500/20'
          }`}
        >
          {isOptimizing ? (
            <>
              <div className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
              <span>Optimizing Sites...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Optimization</span>
            </>
          )}
        </button>

        <button
          onClick={onReset}
          disabled={isOptimizing}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-mono text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 transition-colors active:scale-[0.98]"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Simulation</span>
        </button>
      </div>

      {/* Note footer */}
      <div className="flex items-start gap-1.5 text-[10px] text-slate-400 font-mono border-t border-slate-800/80 pt-3">
        <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
        <span>Optimization is solved instantaneously using client-side score-per-cost heuristic ranking.</span>
      </div>
    </div>
  );
};
