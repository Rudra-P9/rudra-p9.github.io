import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";

import CanvasLoader from "../Loader";

const Computers = ({ isMobile }) => {
  // load from public folder (absolute path) to avoid bundler-case/path surprises
  const earth = useGLTF("/earth/scene.gltf");
  const meshRef = useRef();

  // gentle rotation for mobile (only when mobile)
  useFrame((state, delta) => {
    if (meshRef.current && isMobile) {
      meshRef.current.rotation.y += delta * 0.5;
    } else if (meshRef.current && !isMobile) {
      // subtle rotation on desktop as well (optional)
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor="black" />
      <spotLight
        position={[-20, 50, 10]}
        angle={0.12}
        penumbra={1}
        intensity={1}
        castShadow
        shadow-mapSize={1024}
      />
      <pointLight intensity={1} />

      {/* group lets us fine tune scale/position/rotation without touching the model file */}
      <group
        ref={meshRef}
        scale={isMobile ? 0.6 : 0.9}               // tuned so Earth isn't cropped
        position={isMobile ? [0, -1.2, 0] : [0, -1.6, 0]}
        rotation={isMobile ? [0, 0, 0] : [0, 0.2, 0]}
      >
        <primitive object={earth.scene} />
      </group>
    </mesh>
  );
};

export const ComputersCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 500px)");
    setIsMobile(mediaQuery.matches);
    const handleMediaQueryChange = (event) => setIsMobile(event.matches);
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    return () => mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, []);

  return (
    <Canvas
      frameloop="always"
      shadows
      dpr={[1, 2]}
      camera={
        isMobile
          ? { position: [0, 0, 20], fov: 50 }
          : { position: [20, 3, 5], fov: 25 }
      }
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        {!isMobile && (
          <OrbitControls
            enableZoom={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
            autoRotate={true}
            autoRotateSpeed={0.4}
          />
        )}
        <Computers isMobile={isMobile} />
      </Suspense>

      <Preload all />
    </Canvas>
  );
};

export default ComputersCanvas;
