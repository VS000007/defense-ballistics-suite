import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Database,
  CheckSquare,
  Percent,
  Cpu,
  Box,
  BarChart2,
  Play,
  Sliders,
  Eye,
  Target,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'beginner' | 'howToUse' | 'math'>('beginner');

  const steps = [
    {
      step: 'Step 1',
      title: 'Synthetic Space Setup',
      icon: <Database className="w-4 h-4 text-cyan-400" />,
      description:
        'The simulation builds a fictional 100 × 100 km defense grid with 10 candidate facility areas (S01–S10) and synthetic ballistic trajectory corridors (T01–T10).',
    },
    {
      step: 'Step 2',
      title: 'Coverage Feasibility',
      icon: <CheckSquare className="w-4 h-4 text-cyan-400" />,
      description:
        'The system calculates line-of-sight distance, elevation advantage, and geometry between each candidate battery and incoming trajectory paths.',
    },
    {
      step: 'Step 3',
      title: 'Probability Scoring',
      icon: <Percent className="w-4 h-4 text-cyan-400" />,
      description:
        'Each battery receives a single-point protection score (p_ij) based on distance decay and site topographic quality scores.',
    },
    {
      step: 'Step 4',
      title: 'Cost-Efficiency Optimization',
      icon: <Cpu className="w-4 h-4 text-cyan-400" />,
      description:
        'The solver evaluates site scores divided by site cost (Score/Cost) and greedily selects the highest impact sites that fit within the budget and site limit.',
    },
    {
      step: 'Step 5',
      title: '3D Visual Rendering',
      icon: <Box className="w-4 h-4 text-cyan-400" />,
      description:
        'Selected sites illuminate in bright green with active radar range rings. Standby sites stay in grey, and incoming targets animate along 3D ballistic arcs.',
    },
    {
      step: 'Step 6',
      title: 'Multi-Battery Protection Analysis',
      icon: <BarChart2 className="w-4 h-4 text-cyan-400" />,
      description:
        'Computes overlapping combined protection probability for each target vector, flagging protected trajectories versus vulnerable vectors below threshold.',
    },
  ];

  return (
    <div className="bg-[#0b1329]/95 backdrop-blur-md border border-cyan-900/50 rounded-xl overflow-hidden shadow-2xl text-slate-200">
      {/* Collapsible Header Bar */}
      <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <span>Complete Simulator User Manual & 3D Guide</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50 font-normal">
                Interactive Reference
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Beginner walkthrough, control guide, and defense siting mathematics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => { setActiveTab('beginner'); setIsOpen(true); }}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'beginner' && isOpen
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3D Simulation Guide (Beginners)
            </button>
            <button
              onClick={() => { setActiveTab('howToUse'); setIsOpen(true); }}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'howToUse' && isOpen
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              How to Use (Step-by-Step)
            </button>
            <button
              onClick={() => { setActiveTab('math'); setIsOpen(true); }}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'math' && isOpen
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mathematical Model
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded border border-slate-800 hover:border-slate-700"
          >
            <span>{isOpen ? 'Collapse' : 'Expand'}</span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body Content */}
      {isOpen && (
        <div className="p-6 flex flex-col gap-6">
          {/* TAB 1: BEGINNER 3D VISUAL GUIDE */}
          {activeTab === 'beginner' && (
            <div className="flex flex-col gap-6">
              <div className="bg-gradient-to-r from-cyan-950/40 to-slate-900/60 p-4 rounded-lg border border-cyan-500/30">
                <div className="flex items-center gap-2 text-cyan-300 font-bold font-mono text-sm">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Understanding the 3D Defense Simulation (For Beginners)
                </div>
                <p className="text-xs text-slate-300 font-mono mt-1.5 leading-relaxed">
                  Welcome! This interactive 3D simulator models how strategic defense planners choose the optimal locations for missile defense batteries across a fictional territory.
                </p>
              </div>

              {/* 3D Visual Elements Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
                    <span className="w-3 h-3 rounded-full bg-cyan-500" />
                    1. The 100 × 100 km Grid
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                    The blue ground plane represents a synthetic 100 km by 100 km territory with 5 km grid cells. It uses local (X, Y, Z) coordinates rather than real geographical coordinates.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    2. Candidate Sites (S01–S10)
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                    The circular platforms represent candidate land areas. <strong className="text-emerald-300">Bright Green</strong> sites with spinning rings are actively selected for defense. <strong className="text-slate-400">Grey</strong> sites are standby candidates.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
                    <span className="w-3 h-1 bg-orange-500 rounded" />
                    3. Curved Trajectories (T01–T10)
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                    The glowing arcs represent synthetic incoming ballistic missile trajectories showing the launch point, maximum altitude (apogee), and intended target coordinates.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
                    <span className="w-2.5 h-2.5 rotate-45 bg-yellow-300" />
                    4. Moving Target Markers
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                    The glowing yellow markers travel along the trajectory curves in real time. Each tag displays the vector ID and the calculated protection probability.
                  </p>
                </div>
              </div>

              {/* 3D Camera Controls Help */}
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div className="text-xs font-mono">
                    <div className="font-bold text-white">How to Control the 3D Camera:</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      • <strong>Left-Click & Drag</strong>: Rotate / Orbit 360° around the region
                      <br />• <strong>Scroll Wheel</strong>: Zoom in and out
                      <br />• <strong>Right-Click & Drag</strong>: Pan across the terrain
                    </div>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-3 py-1.5 rounded border border-cyan-800/40">
                  Tip: Click "Reset Camera" in the 3D box anytime to restore default view.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEP-BY-STEP HOW TO USE */}
          {activeTab === 'howToUse' && (
            <div className="flex flex-col gap-6">
              <div className="text-xs font-mono text-slate-300">
                Follow these 4 simple steps to run experiments and evaluate tactical trade-offs:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1 */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center font-bold font-mono text-cyan-300 shrink-0 text-sm">
                    1
                  </div>
                  <div className="flex flex-col gap-1 font-mono text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      Select a Threat Scenario
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Choose from <strong>Short</strong> (low-altitude rapid ingress), <strong>Medium</strong> (balanced multi-axis defense), or <strong>Long</strong> (exo-atmospheric high-apogee arcs).
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center font-bold font-mono text-cyan-300 shrink-0 text-sm">
                    2
                  </div>
                  <div className="flex flex-col gap-1 font-mono text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                      Adjust Budget & Site Constraints
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Set your <strong>Normalized Budget</strong> (5–30 units) and <strong>Max Selectable Sites</strong> (1–5). Each candidate site has an associated cost and capacity.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center font-bold font-mono text-cyan-300 shrink-0 text-sm">
                    3
                  </div>
                  <div className="flex flex-col gap-1 font-mono text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-amber-400" />
                      Set Protection Threshold
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Set the required defense confidence level (e.g. 65% or 80%). The dashboard flags any target vectors that fall below this target.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center font-bold font-mono text-cyan-300 shrink-0 text-sm">
                    4
                  </div>
                  <div className="flex flex-col gap-1 font-mono text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-cyan-400" />
                      Click "Run Optimization"
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      The engine solves the siting model, updates the 3D scene in real time, and renders metric cards, table breakdowns, and comparative charts.
                    </p>
                  </div>
                </div>
              </div>

              {/* 6-Step Technical Pipeline */}
              <div className="pt-2">
                <div className="text-xs font-mono text-slate-400 mb-3 uppercase tracking-wider font-bold">
                  Core Simulation Pipeline:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {steps.map((item) => (
                    <div
                      key={item.step}
                      className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                          {item.step}
                        </span>
                        {item.icon}
                      </div>
                      <div className="text-xs font-bold text-white font-mono">{item.title}</div>
                      <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MATHEMATICAL FORMULATION */}
          {activeTab === 'math' && (
            <div className="flex flex-col gap-5 text-xs font-mono">
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 leading-relaxed">
                <div className="font-bold text-cyan-400 mb-2">1. Single-Site Coverage Score:</div>
                <p className="text-slate-300 mb-2">
                  Each candidate site $j$ receives a composite score based on cumulative coverage over all trajectories, site topographic quality, and capacity, minus cost penalty:
                </p>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 text-cyan-300 font-mono text-center">
                  {'Score(j) = ∑ p_ij + (Quality_j × 2.5) + (Capacity_j / 5.0 × 1.8) - (Cost_j × 0.15)'}
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 leading-relaxed">
                <div className="font-bold text-cyan-400 mb-2">2. Efficiency Ratio & Greedy Siting:</div>
                <p className="text-slate-300 mb-2">
                  Candidate sites are ranked in descending order of their Score-per-Cost ratio:
                </p>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 text-emerald-300 font-mono text-center">
                  Efficiency(j) = Score(j) / Cost(j)
                </div>
                <p className="text-slate-400 text-[11px] mt-2">
                  Sites with highest efficiency are selected until either the Budget limit or Maximum Site limit is reached.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 leading-relaxed">
                <div className="font-bold text-cyan-400 mb-2">3. Multi-Battery Combined Protection Probability:</div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 text-amber-300 font-mono text-center">
                  {'P_combined(i) = 1 - ∏ (1 - p_si)'}
                </div>
                <p className="text-slate-400 text-[11px] mt-2">
                  This models the diminishing returns of layered defense: two 60% probability batteries yield 1 - (1 - 0.60)² = 84% combined protection.
                </p>
              </div>
            </div>
          )}

          {/* Safety Disclaimer Footer */}
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2.5 text-[11px] font-mono text-amber-200/90">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Academic Disclaimer: </span>
              All locations, trajectories, probabilities, and results in this simulator are synthetic and intended for decision-support and educational demonstrations.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
