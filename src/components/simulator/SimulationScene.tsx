import React, { useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { CandidateSite } from './CandidateSite';
import { TrajectoryLine } from './TrajectoryLine';
import type { CandidateSiteData, OptimizationResult, ScenarioDefinition, SyntheticTrajectoryData } from '../../lib/types';
import { RotateCcw, Compass, Eye, Mountain, Navigation } from 'lucide-react';

interface SimulationSceneProps {
  scenario: ScenarioDefinition;
  optimizationResult: OptimizationResult;
}

// Procedural Topographic Elevation Function
export function getTerrainHeight(x: number, y: number): number {
  let h = 0;
  // Northern High-Altitude Mountain Ridges (Himalayan-style high peaks, Y > 10)
  if (y > 8) {
    const northFactor = (y - 8) / 42;
    const ridge1 = Math.sin(x * 0.14) * Math.cos(y * 0.12) * 2.5;
    const ridge2 = Math.sin(x * 0.3 + 1.5) * 1.8;
    const ridge3 = Math.cos(x * 0.22 - y * 0.15) * 1.2;
    h += northFactor * (4.2 + ridge1 + ridge2 + ridge3);
  }
  // North-Eastern and Eastern Mountain Flanks (X > 12)
  if (x > 12) {
    const eastFactor = (x - 12) / 38;
    const ridgeE = Math.cos(y * 0.16) * 2.2 + Math.sin(x * 0.2) * 1.0;
    h += eastFactor * (3.0 + ridgeE);
  }
  // Central Mesa / Elevated Strategic Plateau (around S03 at x=0, y=5 and S10 at x=-5, y=-15)
  const distCenter = Math.sqrt(x * x + (y - 5) * (y - 5));
  if (distCenter < 20) {
    h += (1 - distCenter / 20) * 3.4;
  }
  // South-Western Pass Elevation
  const distSW = Math.sqrt((x + 25) * (x + 25) + (y + 35) * (y + 35));
  if (distSW < 16) {
    h += (1 - distSW / 16) * 1.8;
  }
  // Base rolling topography
  h += Math.sin(x * 0.08) * Math.cos(y * 0.08) * 0.4;

  return Math.max(0.15, h);
}

const TopographicTerrain: React.FC = () => {
  // Generate 3D displaced mountain mesh and wireframe
  const { geometry, wireGeometry } = useMemo(() => {
    const width = 100;
    const height = 100;
    const segments = 64; // High fidelity 64x64 grid mesh

    const geom = new THREE.PlaneGeometry(width, height, segments, segments);
    geom.rotateX(-Math.PI / 2);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i); // In 3D plane, Z corresponds to 2D Y
      const h = getTerrainHeight(x, z);
      pos.setY(i, h);
    }
    geom.computeVertexNormals();

    const wireGeom = new THREE.WireframeGeometry(geom);

    return { geometry: geom, wireGeometry: wireGeom };
  }, []);

  return (
    <group>
      {/* 1. Shaded Low-Poly Mountain Terrain */}
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial
          color="#061226"
          roughness={0.8}
          metalness={0.25}
          flatShading
        />
      </mesh>

      {/* 2. Tactical Wireframe Contour Lines */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <primitive
        object={
          new THREE.LineSegments(
            wireGeometry,
            new THREE.LineBasicMaterial({
              color: new THREE.Color('#0369a1'),
              transparent: true,
              opacity: 0.28,
            })
          )
        }
      />

      {/* 3. Base Ground Boundary Perimeter */}
      <lineSegments position={[0, 0.05, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(100, 0.1, 100)]} />
        <lineBasicMaterial color="#0284c7" transparent opacity={0.6} linewidth={2} />
      </lineSegments>

      {/* 4. Strategic 3D Cardinal Sector Badges */}
      {/* NORTH SECTOR (High-Altitude Mountain Ridge Corridor) */}
      <group position={[0, 7.5, 50]}>
        <Html center distanceFactor={85}>
          <div className="pointer-events-none select-none px-2.5 py-1 rounded bg-slate-950/90 border border-cyan-500/70 text-[10px] font-mono font-bold text-cyan-300 shadow-xl flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md">
            <Mountain className="w-3 h-3 text-cyan-400" />
            <span>NORTH • High-Altitude Mountain Ridge Corridor</span>
          </div>
        </Html>
      </group>

      {/* WEST SECTOR (Western Plains & Low-Altitude Corridor) */}
      <group position={[-50, 2.5, 0]}>
        <Html center distanceFactor={85}>
          <div className="pointer-events-none select-none px-2.5 py-1 rounded bg-slate-950/90 border border-amber-500/70 text-[10px] font-mono font-bold text-amber-300 shadow-xl flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md">
            <Navigation className="w-3 h-3 text-amber-400 rotate-[270deg]" />
            <span>WEST • Western Plains Corridor</span>
          </div>
        </Html>
      </group>

      {/* EAST SECTOR (Eastern Himalayan Foothill Axis) */}
      <group position={[50, 4.5, 0]}>
        <Html center distanceFactor={85}>
          <div className="pointer-events-none select-none px-2.5 py-1 rounded bg-slate-950/90 border border-teal-500/70 text-[10px] font-mono font-bold text-teal-300 shadow-xl flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md">
            <Navigation className="w-3 h-3 text-teal-400 rotate-90" />
            <span>EAST • Eastern Foothill Axis</span>
          </div>
        </Html>
      </group>

      {/* SOUTH SECTOR (Southern Plain & Maritime Axis) */}
      <group position={[0, 1.5, -50]}>
        <Html center distanceFactor={85}>
          <div className="pointer-events-none select-none px-2.5 py-1 rounded bg-slate-950/90 border border-blue-500/70 text-[10px] font-mono font-bold text-blue-300 shadow-xl flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md">
            <Navigation className="w-3 h-3 text-blue-400 rotate-180" />
            <span>SOUTH • Southern Tactical Corridor</span>
          </div>
        </Html>
      </group>

      {/* 5. 3D Compass Rose in Bottom Corner */}
      <group position={[-42, 0.4, -42]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.5, 3.2, 32]} />
          <meshBasicMaterial color="#0284c7" transparent opacity={0.6} />
        </mesh>
        {/* North Arrow Pointer */}
        <mesh position={[0, 0.1, 2.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.9, 2.2, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <Html position={[0, 0.6, 4.2]} center distanceFactor={60}>
          <div className="pointer-events-none select-none text-[11px] font-mono font-bold text-cyan-400 bg-slate-950/80 px-1 rounded border border-cyan-700/60">
            N
          </div>
        </Html>
      </group>
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
      controlsRef.current.object.position.set(0, 68, 85);
      controlsRef.current.target.set(0, 2, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative w-full h-[520px] lg:h-[620px] bg-[#02050e] rounded-xl overflow-hidden border border-cyan-900/50 shadow-2xl shadow-cyan-950/30 flex flex-col">
      {/* Top Scene Overlay Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/70 shadow-lg text-xs font-mono text-slate-300">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-white">Topographic Theater:</span>
          <span className="text-cyan-300 font-mono">100 × 100 km High-Altitude Mountain & Corridor Grid</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleResetCamera}
            className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono font-medium shadow-md transition-all active:scale-95 cursor-pointer"
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
          camera={{ position: [0, 68, 85], fov: 46, near: 1, far: 500 }}
          gl={{ antialias: true, alpha: false }}
          shadows
        >
          <color attach="background" args={['#02050e']} />
          <fog attach="fog" args={['#02050e', 100, 240]} />

          {/* Scene Lights */}
          <ambientLight intensity={0.9} />
          <directionalLight
            position={[50, 90, 45]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-40, 50, -40]} intensity={0.6} color="#38bdf8" />
          <pointLight position={[0, 40, 0]} intensity={1.2} color="#38bdf8" distance={120} />

          {/* Interactive Camera Controls */}
          <OrbitControls
            ref={controlsRef}
            makeDefault
            maxPolarAngle={Math.PI / 2.05} // Prevent going below ground
            minDistance={20}
            maxDistance={200}
            enableDamping
            dampingFactor={0.06}
          />

          {/* 3D Procedural Mountain Terrain with Sector Orientations */}
          <TopographicTerrain />

          {/* 10 Candidate Deployment Sites sitting on Terrain Summits */}
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
                timeOffset={index * 0.75}
                onHover={setHoveredTrajectory}
              />
            );
          })}
        </Canvas>
      </div>

      {/* Hover Info Tooltip (Bottom Left) */}
      {(hoveredSite || hoveredTrajectory) && (
        <div className="absolute bottom-16 left-3 z-10 pointer-events-none bg-slate-950/95 backdrop-blur-md border border-cyan-500/50 p-3 rounded-lg shadow-2xl max-w-xs text-xs font-mono text-slate-200">
          {hoveredSite && (
            <div>
              <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                {hoveredSite.name} ({hoveredSite.id})
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{hoveredSite.description}</div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[10px] text-slate-300">
                <span>Coord: ({hoveredSite.x}, {hoveredSite.y}) km</span>
                <span>Terrain Elevation: {hoveredSite.elevation} km</span>
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
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-800/90 text-[11px] font-mono shadow-xl">
        <div className="flex flex-wrap items-center gap-4 text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-300 shadow-sm shadow-emerald-500/50" />
            <span className="text-emerald-300 font-medium">Selected Battery (Active)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-500 border border-slate-400" />
            <span className="text-slate-400">Standby Candidate Site</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-orange-500 rounded" />
            <span className="text-orange-300">3D Ballistic Trajectory</span>
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
