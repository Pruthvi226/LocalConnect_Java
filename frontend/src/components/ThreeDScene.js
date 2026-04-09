import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedSphere() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 100, 200]} scale={2}>
      <MeshDistortMaterial
        color="#0ea5e9"
        attach="material"
        distort={0.3}
        speed={2}
        roughness={0.1}
        metalness={0.8}
      />
    </Sphere>
  );
}

function FloatingIcons() {
  const icons = useRef([]);
  
  useFrame((state) => {
    icons.current.forEach((icon, i) => {
      if (icon) {
        icon.position.y = Math.sin(state.clock.elapsedTime + i) * 0.5;
        icon.rotation.y += 0.01;
      }
    });
  });

  return (
    <>
      {[...Array(5)].map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (icons.current[i] = el)}
          position={[
            Math.cos((i / 5) * Math.PI * 2) * 3,
            Math.sin((i / 5) * Math.PI * 2) * 0.5,
            Math.sin((i / 5) * Math.PI * 2) * 3,
          ]}
        >
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#d946ef" metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
    </>
  );
}

export default function ThreeDScene() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        <AnimatedSphere />
        <FloatingIcons />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}

