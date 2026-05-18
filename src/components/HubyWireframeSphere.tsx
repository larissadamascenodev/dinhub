import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  isSpeaking: boolean;
  audioLevel: number;
}

const NEON = new THREE.Color("#00ff7b");

const SphereMesh: React.FC<Props> = ({ isSpeaking, audioLevel }) => {
  const groupRef = useRef<THREE.Group>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Build an icosphere-like wireframe using IcosahedronGeometry with subdivisions
  const { lineGeom, pointGeom } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.6, 4);
    const wire = new THREE.WireframeGeometry(geo);

    // Unique vertices for points (deduplicate from non-indexed wire positions)
    const posAttr = geo.attributes.position;
    const verts: number[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);
      const k = `${x.toFixed(3)}_${y.toFixed(3)}_${z.toFixed(3)}`;
      if (!seen.has(k)) {
        seen.add(k);
        verts.push(x, y, z);
      }
    }
    const pGeom = new THREE.BufferGeometry();
    pGeom.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));

    geo.dispose();
    return { lineGeom: wire, pointGeom: pGeom };
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (0.18 + audioLevel * 0.6);
      groupRef.current.rotation.x += delta * 0.05;
      const targetScale = 1 + audioLevel * 0.15 + (isSpeaking ? 0.04 : 0);
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.45 + audioLevel * 0.5 + (isSpeaking ? 0.1 : 0);
    }
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.size = 0.028 + audioLevel * 0.04;
      mat.opacity = 0.85 + audioLevel * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments ref={lineRef} geometry={lineGeom}>
        <lineBasicMaterial
          color={NEON}
          transparent
          opacity={0.5}
          linewidth={1}
        />
      </lineSegments>
      <points ref={pointsRef} geometry={pointGeom}>
        <pointsMaterial
          color={NEON}
          size={0.03}
          sizeAttenuation
          transparent
          opacity={0.9}
        />
      </points>
    </group>
  );
};

export const HubyWireframeSphere: React.FC<Props> = ({ isSpeaking, audioLevel }) => {
  return (
    <div className="relative w-full h-full">
      {/* Atmospheric glow behind sphere */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(circle at center, rgba(0,255,123,0.28) 0%, rgba(0,255,123,0.08) 35%, transparent 65%)",
          opacity: 0.6 + audioLevel * 0.6 + (isSpeaking ? 0.1 : 0),
          filter: `blur(${20 + audioLevel * 30}px)`,
        }}
      />
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <SphereMesh isSpeaking={isSpeaking} audioLevel={audioLevel} />
      </Canvas>
    </div>
  );
};

export default HubyWireframeSphere;
