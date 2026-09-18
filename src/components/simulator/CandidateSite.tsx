import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { CandidateSiteData } from '../../lib/types';
import { getTerrainHeight } from './SimulationScene';

interface CandidateSiteProps {
  site: CandidateSiteData;
  isSelected: boolean;
  score?: number;
  onHover?: (site: CandidateSiteData | null) => void;
}

export const CandidateSite: React.FC<CandidateSiteProps> = ({
  site,
  isSelected,
  score,
  onHover,
}) => {
  const pulseRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Position in synthetic 3D space resting directly on mountain/plateau elevation
  const posX = site.x;
  const posY = getTerrainHeight(site.x, site.y);
  const posZ = site.y; // Map 2D Y to 3D Z for horizontal ground plane

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (pulseRef.current) {
      const scale = 1 + (Math.sin(t * 2 + site.x) * 0.15 + 0.15);
      pulseRef.current.scale.set(scale, 1, scale);
    }
    if (ringRef.current && isSelected) {
      ringRef.current.rotation.y = t * 0.8;
    }
  });

  const activeColor = isSelected ? '#10b981' : '#64748b'; // Bright emerald vs Slate/grey
  const beaconColor = isSelected ? '#34d399' : '#38bdf8'; // Emerald bright vs Cyan accent
  const glowOpacity = isSelected ? 0.45 : 0.18;

  return (
    <group position={[posX, posY, posZ]}>
      {/* 3D Cylindrical Base Platform */}
      <mesh
        position={[0, 0.4, 0]}
        castShadow
        receiveShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover?.(site);
        }}
        onPointerOut={() => onHover?.(null)}
      >
        <cylinderGeometry args={[2.4, 2.8, 0.8, 24]} />
        <meshStandardMaterial
          color={activeColor}
          roughness={0.3}
          metalness={0.7}
          emissive={isSelected ? '#059669' : '#1e293b'}
          emissiveIntensity={isSelected ? 0.6 : 0.2}
        />
      </mesh>

      {/* Outer Glow Pulse Cylinder */}
      <mesh ref={pulseRef} position={[0, 0.6, 0]}>
        <cylinderGeometry args={[3.2, 3.2, 0.3, 24]} />
        <meshBasicMaterial
          color={beaconColor}
          transparent
          opacity={glowOpacity}
          wireframe={!isSelected}
        />
      </mesh>

      {/* Rotating Radar Range Ring if Selected */}
      {isSelected && (
        <mesh ref={ringRef} position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[4.5, 5.0, 32]} />
          <meshBasicMaterial
            color="#10b981"
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Center Beacon Orb */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.65, 16, 16]} />
        <meshStandardMaterial
          color={isSelected ? '#a7f3d0' : '#94a3b8'}
          emissive={isSelected ? '#10b981' : '#0284c7'}
          emissiveIntensity={isSelected ? 1.2 : 0.4}
        />
      </mesh>

      {/* Compact Clean Label */}
      <Html position={[0, 2.8, 0]} center distanceFactor={55}>
        <div
          className={`pointer-events-none select-none px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider whitespace-nowrap shadow-lg transition-all duration-200 backdrop-blur-sm border ${
            isSelected
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-300 border-slate-700/60'
          }`}
        >
          <div className="flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSelected ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
              }`}
            />
            <span>{site.id}</span>
            {score !== undefined && (
              <span className="opacity-70 text-[9px] font-normal">
                (Cost: {site.cost})
              </span>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
};
