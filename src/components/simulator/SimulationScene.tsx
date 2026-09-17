import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { CandidateSite } from './CandidateSite';
import { TrajectoryLine } from './TrajectoryLine';
import type { CandidateSiteData, OptimizationResult, ScenarioDefinition, SyntheticTrajectoryData } from '../../lib/types';
import { RotateCcw, Compass, Eye } from 'lucide-react';

interface SimulationSceneProps {
  scenario: ScenarioDefinition;
  optimizationResult: OptimizationResult;
}

const SyntheticGround: React.FC = () => {
  return (
    <group>
      {/* 100 x 100 km Synthetic Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[100, 100, 32, 32]} />
        <meshStandardMaterial
          color="#0a1128"
          roughness={0.85}
          metalness={0.2}
        />
      </mesh>

      {/* Grid overlay (100km total, 20 subdivisions = 5km grid cells) */}
      <gridHelper
        args={[100, 20, '#1e3a8a', '#0f2744']}
        position={[0, 0.01, 0]}
      />

      {/* Outer Boundary Perimeter Line */}
      <lineSegments position={[0, 0.05, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(100, 0.1, 100)]} />
        <lineBasicMaterial color="#0284c7" transparent opacity={0.6} linewidth={2} />
      </lineSegments>

      {/* Synthetic Origin & Quadrant Indicators */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.5, 1.8, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

export const SimulationScene: React.FC<SimulationSceneProps> = ({
  scenario,
  optimizationResult,
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [hoveredSite, setHoveredSite] = useState<CandidateSiteData | null>(null);
  const [hoveredTrajectory, setHoveredTrajectory] = useState<SyntheticTrajectoryData | null>(null);

  const selectedSet = new Set(optimizationResult.selectedSiteIds);

  const targetResultsMap = new Map(
    optimizationResult.targetResults.map((r) => [r.targetId, r])
  );

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.object.position.set(0, 65, 80);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative w-full h-[480px] lg:h-[580px] bg-[#030712] rounded-xl overflow-hidden border border-cyan-900/40 shadow-2xl shadow-cyan-950/20 flex flex-col">
      {/* Top Scene Overlay Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-lg text-xs font-mono text-slate-300">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-white">Synthetic Region:</span>
          <span className="text-cyan-300 font-mono">100 × 100 km (Local Coordinates)</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleResetCamera}
            className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono font-medium shadow-md transition-all active:scale-95"
            title="Reset 3D Camera View"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            Reset Camera
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 w-full h-full">
        <Canvas
          camera={{ position: [0, 65, 80], fov: 48, near: 1, far: 500 }}
          gl={{ antialias: true, alpha: false }}
          shadows
        >
          <color attach="background" args={['#030712']} />
          <fog attach="fog" args={['#030712', 90, 220]} />

          {/* Scene Lights */}
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[40, 80, 40]}
            intensity={1.4}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[0, 30, 0]} intensity={1.0} color="#38bdf8" distance={100} />

          {/* Interactive Camera Controls */}
          <OrbitControls
            ref={controlsRef}
            makeDefault
            maxPolarAngle={Math.PI / 2.05} // Prevent going below ground
            minDistance={20}
            maxDistance={180}
            enableDamping
            dampingFactor={0.06}
          />

          {/* Synthetic Ground Plane & Grid */}
          <SyntheticGround />

          {/* 10 Candidate Deployment Sites */}
          {scenario.sites.map((site) => (
            <CandidateSite
              key={site.id}
              site={site}
              isSelected={selectedSet.has(site.id)}
              score={optimizationResult.siteScores[site.id]}
              onHover={setHoveredSite}
            />
          ))}

          {/* Synthetic Trajectories */}
          {scenario.trajectories.map((trajectory, index) => {
            const targetRes = targetResultsMap.get(trajectory.id);
            return (
              <TrajectoryLine
                key={trajectory.id}
                trajectory={trajectory}
                isProtected={targetRes?.isProtected ?? false}
                combinedProtection={targetRes?.combinedProtection ?? 0}
                timeOffset={index * 0.7}
                onHover={setHoveredTrajectory}
              />
            );
          })}
        </Canvas>
      </div>

      {/* Hover Info Tooltip (Bottom Left) */}
      {(hoveredSite || hoveredTrajectory) && (
        <div className="absolute bottom-16 left-3 z-10 pointer-events-none bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 p-3 rounded-lg shadow-xl max-w-xs text-xs font-mono text-slate-200">
          {hoveredSite && (
            <div>
              <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                {hoveredSite.name} ({hoveredSite.id})
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{hoveredSite.description}</div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[10px] text-slate-300">
                <span>Coord: ({hoveredSite.x}, {hoveredSite.y}) km</span>
                <span>Elevation: {hoveredSite.elevation} km</span>
                <span>Unit Cost: {hoveredSite.cost}</span>
                <span>Capacity: {hoveredSite.capacity} units</span>
                <span>Quality Score: {hoveredSite.qualityScore}</span>
                <span className={selectedSet.has(hoveredSite.id) ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  Status: {selectedSet.has(hoveredSite.id) ? 'SELECTED' : 'Standby'}
                </span>
              </div>
            </div>
          )}
          {hoveredTrajectory && (
            <div>
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {hoveredTrajectory.name} ({hoveredTrajectory.id})
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[10px] text-slate-300">
                <span>Speed: {hoveredTrajectory.speedKmS} km/s</span>
                <span>Apogee: {hoveredTrajectory.peakZ} km</span>
                <span>Synthetic Protection: {Math.round((targetResultsMap.get(hoveredTrajectory.id)?.combinedProtection ?? 0) * 100)}%</span>
                <span>
                  Status: {targetResultsMap.get(hoveredTrajectory.id)?.isProtected ? 'PROTECTED' : 'AT RISK'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scene Legend Overlay (Bottom Bar) */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-800/80 text-[11px] font-mono shadow-xl">
        <div className="flex flex-wrap items-center gap-4 text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-300 shadow-sm shadow-emerald-500/50" />
            <span className="text-emerald-300 font-medium">Selected Site (Active)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-500 border border-slate-400" />
            <span className="text-slate-400">Unselected Site</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-orange-500 rounded" />
            <span className="text-orange-300">Synthetic Trajectory</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rotate-45 bg-yellow-300 border border-yellow-100 shadow-sm shadow-yellow-300/50" />
            <span className="text-yellow-200">Target Marker</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Left-click: Orbit • Right-click: Pan • Scroll: Zoom</span>
        </div>
      </div>
    </div>
  );
};
