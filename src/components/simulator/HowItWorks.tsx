import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Database, CheckSquare, Percent, Cpu, Box, BarChart2, ShieldAlert } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const steps = [
    {
      step: 'Step 1',
      title: 'Synthetic Data',
      icon: <Database className="w-4 h-4 text-cyan-400" />,
      description:
        'The application creates fictional trajectories and candidate areas inside a synthetic 100 × 100 km region using localized XYZ coordinates.',
    },
    {
      step: 'Step 2',
      title: 'Feasibility',
      icon: <CheckSquare className="w-4 h-4 text-cyan-400" />,
      description:
        'The application checks which candidate sites are compatible with each synthetic trajectory based on synthetic range and elevation.',
    },
    {
      step: 'Step 3',
      title: 'Probability',
      icon: <Percent className="w-4 h-4 text-cyan-400" />,
      description:
        'Each compatible site receives a synthetic protection score p_ij evaluated against the flight path of incoming synthetic target vectors.',
    },
    {
      step: 'Step 4',
      title: 'Optimization',
      icon: <Cpu className="w-4 h-4 text-cyan-400" />,
      description:
        'The application selects the best sites under the chosen budget and site limit using score-per-cost efficiency ranking and combined probability calculation.',
    },
    {
      step: 'Step 5',
      title: 'Visualization',
      icon: <Box className="w-4 h-4 text-cyan-400" />,
      description:
        'The 3D scene shows selected areas (green), standby areas (blue/grey), synthetic trajectories (orange/red), and animated target markers in real time.',
    },
    {
      step: 'Step 6',
      title: 'Results',
      icon: <BarChart2 className="w-4 h-4 text-cyan-400" />,
      description:
        'The dashboard reports cost, selected sites, average protection, minimum protection, and uncovered targets with interactive table and chart views.',
    },
  ];

  return (
    <div className="bg-[#0b1329]/90 backdrop-blur-md border border-cyan-900/40 rounded-xl overflow-hidden shadow-xl text-slate-200">
      {/* Collapsible Header Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between bg-slate-900/80 hover:bg-slate-900 text-left transition-colors border-b border-slate-800"
      >
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              How the simulation works
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              6-step explanation of the synthetic siting and optimization pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span>{isOpen ? 'Collapse' : 'Expand'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Collapsible Body Content */}
      {isOpen && (
        <div className="p-5 flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map((item) => (
              <div
                key={item.step}
                className="bg-slate-900/70 border border-slate-800/90 rounded-lg p-4 flex flex-col gap-2 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                    {item.step}
                  </span>
                  {item.icon}
                </div>
                <h4 className="text-xs font-bold text-white font-mono">{item.title}</h4>
                <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Academic Prototype Safety Disclaimer */}
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-lg p-3.5 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs font-mono text-amber-200/90 leading-relaxed">
              <span className="font-bold text-amber-300">Important: </span>
              This is an academic visualization and optimization prototype. It does not represent real missile performance or real military planning.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
