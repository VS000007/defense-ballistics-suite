import React from 'react';
import type { OptimizationResult, ScenarioDefinition } from '../../lib/types';
import { ShieldCheck, DollarSign, Target, AlertTriangle, CheckCircle2, Award } from 'lucide-react';

interface ResultCardsProps {
  scenario: ScenarioDefinition;
  result: OptimizationResult;
  budgetLimit: number;
  threshold: number;
}

export const ResultCards: React.FC<ResultCardsProps> = ({
  scenario,
  result,
  budgetLimit,
  threshold,
}) => {
  const selectedSitesData = scenario.sites.filter((s) =>
    result.selectedSiteIds.includes(s.id)
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 w-full">
      {/* 1. Selected Sites */}
      <div className="bg-[#0b1329]/90 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 shadow-lg flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-400" />
            Selected Sites
          </span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/30 text-[10px]">
            {result.selectedSiteIds.length} Active
          </span>
        </div>
        <div className="mt-2.5">
          <div className="flex flex-wrap gap-1.5">
            {result.selectedSiteIds.length > 0 ? (
              result.selectedSiteIds.map((id) => (
                <span
                  key={id}
                  className="px-2 py-1 bg-emerald-900/40 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold rounded shadow-sm"
                >
                  {id}
                </span>
              ))
            ) : (
              <span className="text-xs font-mono text-slate-500 italic">None selected</span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-2 truncate">
            {selectedSitesData.map((s) => s.name.split(' ')[0]).join(', ') || 'No deployment'}
          </div>
        </div>
      </div>

      {/* 2. Total Normalized Cost */}
      <div className="bg-[#0b1329]/90 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 shadow-lg flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-cyan-400" />
            Total Cost
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Limit: {budgetLimit}
          </span>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              {result.totalCost}
            </span>
            <span className="text-xs font-mono text-slate-400">
              / {budgetLimit} units ({result.budgetUsedPercentage}%)
            </span>
          </div>
          {/* Cost bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                result.totalCost > budgetLimit * 0.9 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, result.budgetUsedPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Average Synthetic Protection */}
      <div className="bg-[#0b1329]/90 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 shadow-lg flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Avg Protection
          </span>
          <Award className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {Math.round(result.averageProtection * 100)}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${result.averageProtection * 100}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Max Target: {Math.round(result.maxProtection * 100)}%
          </div>
        </div>
      </div>

      {/* 4. Minimum Target Protection */}
      <div className="bg-[#0b1329]/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 shadow-lg flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-400" />
            Min Target Protection
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Goal: &ge; {Math.round(threshold * 100)}%
          </span>
        </div>
        <div className="mt-2">
          <div
            className={`text-2xl font-bold font-mono ${
              result.minProtection >= threshold ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {Math.round(result.minProtection * 100)}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                result.minProtection >= threshold ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
              style={{ width: `${result.minProtection * 100}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Worst-case vector protection
          </div>
        </div>
      </div>

      {/* 5. Targets Below Threshold */}
      <div className="bg-[#0b1329]/90 border border-slate-800 hover:border-rose-500/40 rounded-xl p-4 shadow-lg flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            {result.targetsBelowThresholdCount === 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            Below Threshold
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {result.protectedTargetsCount} / {result.totalTargetsCount} Safe
          </span>
        </div>
        <div className="mt-2">
          <div
            className={`text-2xl font-bold font-mono ${
              result.targetsBelowThresholdCount === 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {result.targetsBelowThresholdCount}{' '}
            <span className="text-xs font-normal text-slate-400">
              / {result.totalTargetsCount}
            </span>
          </div>
          <div className="mt-2 text-[10px] font-mono">
            {result.targetsBelowThresholdCount === 0 ? (
              <span className="text-emerald-400 font-medium">100% vectors meet threshold</span>
            ) : (
              <span className="text-rose-400 font-medium">
                {result.targetsBelowThresholdCount} vector(s) require higher coverage
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
