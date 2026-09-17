import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { SyntheticTrajectoryData } from '../../lib/types';

interface TrajectoryLineProps {
  trajectory: SyntheticTrajectoryData;
  isProtected: boolean;
  combinedProtection?: number;
  timeOffset?: number;
  onHover?: (trajectory: SyntheticTrajectoryData | null) => void;
}

export const TrajectoryLine: React.FC<TrajectoryLineProps> = ({
  trajectory,
  isProtected,
  combinedProtection = 0,
  timeOffset = 0,
  onHover,
}) => {
  const markerRef = useRef<THREE.Group>(null);
  const targetOrbRef = useRef<THREE.Mesh>(null);

  // Generate 3D curved trajectory path (Catmull-Rom spline)
  const { curve, lineGeometry } = useMemo(() => {
    const pStart = new THREE.Vector3(trajectory.startX, trajectory.startZ, trajectory.startY);
    const pPeak = new THREE.Vector3(trajectory.peakX, trajectory.peakZ, trajectory.peakY);
    const pTarget = new THREE.Vector3(trajectory.targetX, trajectory.targetZ, trajectory.targetY);

    const mid1 = new THREE.Vector3().lerpVectors(pStart, pPeak, 0.55);
    mid1.y *= 0.95;
    const mid2 = new THREE.Vector3().lerpVectors(pPeak, pTarget, 0.45);
    mid2.y *= 0.95;

    const spline = new THREE.CatmullRomCurve3([pStart, mid1, pPeak, mid2, pTarget]);
    const points = spline.getPoints(50);
    const geom = new THREE.BufferGeometry().setFromPoints(points);

    return { curve: spline, lineGeometry: geom };
  }, [trajectory]);

  // Animate target marker traveling along trajectory
  useFrame(({ clock }) => {
    if (!markerRef.current) return;
    const duration = Math.max(5, 14 / (trajectory.speedKmS || 2));
    const elapsed = clock.getElapsedTime() + timeOffset;
    const progress = (elapsed % duration) / duration;

    const pos = curve.getPointAt(progress);
    const tangent = curve.getTangentAt(progress);

    markerRef.current.position.copy(pos);
    markerRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);

    if (targetOrbRef.current) {
      targetOrbRef.current.rotation.y += 0.03;
    }
  });

  const trajectoryColor = isProtected ? '#f97316' : '#ef4444';
  const markerColor = '#fef08a';

  return (
    <group>
      {/* Curved Trajectory Line */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <primitive
        object={
          new THREE.Line(
            lineGeometry,
            new THREE.LineBasicMaterial({
              color: new THREE.Color(trajectoryColor),
              transparent: true,
              opacity: 0.7,
              linewidth: 2,
            })
          )
        }
      />

      {/* Target Impact Point on Ground */}
      <mesh
        position={[trajectory.targetX, 0.08, trajectory.targetY]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover?.(trajectory);
        }}
        onPointerOut={() => onHover?.(null)}
      >
        <ringGeometry args={[0.9, 1.5, 20]} />
        <meshBasicMaterial
          color={isProtected ? '#10b981' : '#f87171'}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Animated Moving Target Marker along Trajectory */}
      <group ref={markerRef}>
        <mesh ref={targetOrbRef} castShadow>
          <octahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial
            color={markerColor}
            emissive="#eab308"
            emissiveIntensity={1.4}
            roughness={0.2}
          />
        </mesh>

        {/* Small Trajectory Particle Flare */}
        <pointLight color="#fbbf24" intensity={2.0} distance={6} />

        {/* Compact Clean Vector Tag */}
        <Html distanceFactor={60} position={[0, 1.2, 0]} center>
          <div className="pointer-events-none select-none px-1.5 py-0.5 rounded bg-black/85 border border-amber-500/60 text-[9px] font-mono text-amber-200 font-bold shadow-md whitespace-nowrap backdrop-blur-sm">
            {trajectory.id} {Math.round(combinedProtection * 100)}%
          </div>
        </Html>
      </group>
    </group>
  );
};
