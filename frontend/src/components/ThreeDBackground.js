import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function LowPolySphere() {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.2, 16, 16]} />
      <meshStandardMaterial color="#0ea5e9" metalness={0.4} roughness={0.6} />
    </mesh>
  );
}

function FloatingRing() {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.08;
    }
  });
  return (
    <mesh ref={meshRef} position={[0, 0, -1]}>
      <torusGeometry args={[1.5, 0.05, 8, 24]} />
      <meshStandardMaterial color="#a855f7" metalness={0.6} roughness={0.3} />
    </mesh>
  );
}

export default function ThreeDBackground({ className = '', style = {} }) {
  return (
    <div className={`w-full h-full min-h-[200px] ${className}`} style={style}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 3]} intensity={0.8} />
        <pointLight position={[-3, -2, 2]} intensity={0.3} />
        <LowPolySphere />
        <FloatingRing />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} />
      </Canvas>
    </div>
  );
}

