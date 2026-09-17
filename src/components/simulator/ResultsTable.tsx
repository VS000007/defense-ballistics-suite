import React, { useState } from 'react';
import type { OptimizationResult, ScenarioDefinition } from '../../lib/types';
import { Table, BarChart3, CheckCircle, AlertCircle, Shield, ArrowUpDown } from 'lucide-react';

interface ResultsTableProps {
  scenario: ScenarioDefinition;
  result: OptimizationResult;
  threshold: number;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  scenario,
  result,
  threshold,
}) => {
  const [activeView, setActiveView] = useState<'table' | 'chart'>('table');
  const [sortBy, setSortBy] = useState<'id' | 'protection'>('id');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const sortedTargets = [...result.targetResults].sort((a, b) => {
    if (sortBy === 'protection') {
      return sortAsc
        ? a.combinedProtection - b.combinedProtection
        : b.combinedProtection - a.combinedProtection;
    }
    return sortAsc ? a.targetId.localeCompare(b.targetId) : b.targetId.localeCompare(a.targetId);
  });

  const toggleSort = (column: 'id' | 'protection') => {
    if (sortBy === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(column);
      setSortAsc(true);
    }
  };

  return (
    <div className="bg-[#0b1329]/90 backdrop-blur-md border border-cyan-900/40 rounded-xl p-5 shadow-xl text-slate-200 flex flex-col gap-4">
      {/* Table Header / View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wide font-mono">
            Synthetic Target Interception & Protection Analysis
          </h3>
        </div>

        {/* View Switch Buttons */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveView('table')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-colors ${
              activeView === 'table'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
          <button
            onClick={() => setActiveView('chart')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-colors ${
              activeView === 'chart'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Chart View</span>
          </button>
        </div>
      </div>

      {/* TABLE VIEW */}
      {activeView === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/40">
                <th
                  onClick={() => toggleSort('id')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Target</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('protection')}
                  className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Synthetic Protection</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold">Supporting Sites</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedTargets.map((target) => {
                const percent = Math.round(target.combinedProtection * 100);
                return (
                  <tr
                    key={target.targetId}
                    className="hover:bg-slate-900/50 transition-colors"
                  >
                    {/* Target ID & Name */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-200">{target.targetId}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                        {target.targetName}
                      </div>
                    </td>

                    {/* Synthetic Protection with mini-bar */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full ${
                              target.isProtected ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span
                          className={`font-bold ${
                            target.isProtected ? 'text-emerald-300' : 'text-rose-400'
                          }`}
                        >
                          {target.combinedProtection.toFixed(2)} ({percent}%)
                        </span>
                      </div>
                    </td>

                    {/* Supporting Sites */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {target.supportingSites.length > 0 ? (
                          target.supportingSites.map((siteId) => (
                            <span
                              key={siteId}
                              className="px-1.5 py-0.5 bg-cyan-950/70 border border-cyan-600/40 text-cyan-300 rounded text-[10px] font-bold"
                            >
                              {siteId}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-[10px] italic">
                            No primary coverage
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-3 text-center">
                      {target.isProtected ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          Protected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[10px] font-bold">
                          <AlertCircle className="w-3 h-3 text-rose-400" />
                          Below threshold
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CHART VIEW (CSS BARS) */}
      {activeView === 'chart' && (
        <div className="flex flex-col gap-4 py-2">
          {/* Target Protection Bars */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400">
              <span>Target Vector Protection Probability vs Threshold ({Math.round(threshold * 100)}%)</span>
              <span className="text-[10px] text-emerald-400">Green = &ge; Threshold • Red = &lt; Threshold</span>
            </div>

            <div className="space-y-2">
              {result.targetResults.map((t) => {
                const percent = Math.round(t.combinedProtection * 100);
                return (
                  <div key={t.targetId} className="flex items-center gap-3 text-xs font-mono">
                    <span className="w-10 font-bold text-slate-300 shrink-0">{t.targetId}</span>
                    <div className="flex-1 bg-slate-900 h-5 rounded overflow-hidden relative border border-slate-800">
                      {/* Threshold Guideline */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 opacity-70"
                        style={{ left: `${threshold * 100}%` }}
                        title={`Threshold: ${Math.round(threshold * 100)}%`}
                      />

                      {/* Bar fill */}
                      <div
                        className={`h-full transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold ${
                          t.isProtected
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white'
                            : 'bg-gradient-to-r from-rose-700 to-red-500 text-white'
                        }`}
                        style={{ width: `${percent}%` }}
                      >
                        {percent > 15 && `${percent}%`}
                      </div>
                    </div>
                    <span
                      className={`w-12 text-right font-bold ${
                        t.isProtected ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {percent}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Sites Score per Cost Ratio Bar */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="text-xs font-mono text-slate-400 mb-2">
              Candidate Site Efficiency Index (Score / Cost)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {scenario.sites.map((site) => {
                const isSelected = result.selectedSiteIds.includes(site.id);
                const score = result.siteScores[site.id] ?? 0;
                const ratio = result.siteScorePerCost[site.id] ?? 0;

                return (
                  <div
                    key={site.id}
                    className={`p-2.5 rounded-lg border text-xs font-mono flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{site.id}</span>
                      <span
                        className={`text-[9px] px-1 rounded ${
                          isSelected
                            ? 'bg-emerald-500 text-black font-bold'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isSelected ? 'SELECTED' : 'STANDBY'}
                      </span>
                    </div>
                    <div className="mt-1.5 text-[10px] space-y-0.5">
                      <div>Score: <span className="text-white">{score}</span></div>
                      <div>Cost: <span className="text-white">{site.cost}</span></div>
                      <div>Eff: <span className="text-cyan-300 font-bold">{ratio}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
