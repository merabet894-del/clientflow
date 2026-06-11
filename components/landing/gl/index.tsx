"use client";

import { Canvas } from "@react-three/fiber";
import { Particles } from "./particles";

export function HeroGL() {
  return (
    <Canvas
      camera={{
        position: [1.2629783123314589, 2.664606471394044, -1.8178993743288914],
        fov: 50,
        near: 0.01,
        far: 300,
      }}
    >
      <color attach="background" args={["#F5F4F0"]} />
      <Particles
        speed={1.0}
        aperture={1.79}
        focus={3.8}
        size={512}
        noiseScale={0.6}
        noiseIntensity={0.52}
        timeScale={1}
        pointSize={12.0}
        opacity={1.0}
        planeScale={10.0}
        useManualTime={false}
        manualTime={0}
        introspect={false}
      />
    </Canvas>
  );
}
