"use client";

import { useEffect, useRef } from "react";

type BeamSceneProps = {
  length: number;
  /** Deflection samples along span (engineering units); scaled for display */
  deflection?: number[];
  stations?: { x: number; radius: number }[];
  mode?: "beam" | "shaft";
  className?: string;
};

/**
 * Lightweight Three.js engineering scene (EDP-4).
 * Dynamic import keeps three out of the critical SSR path.
 */
export default function EngineeringScene({
  length,
  deflection = [],
  stations,
  mode = "beam",
  className = "",
}: BeamSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const THREE = await import("three");
      if (disposed || !mountRef.current) return;

      const width = el.clientWidth || 640;
      const height = 280;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf8fafc);

      const camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 100);
      camera.position.set(length * 0.55, length * 0.35, length * 0.9);
      camera.lookAt(length / 2, 0, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el.appendChild(renderer.domElement);

      const light = new THREE.DirectionalLight(0xffffff, 1.1);
      light.position.set(2, 4, 3);
      scene.add(light);
      scene.add(new THREE.AmbientLight(0xffffff, 0.45));

      const grid = new THREE.GridHelper(Math.max(length * 1.4, 2), 12, 0xcbd5e1, 0xe2e8f0);
      grid.position.set(length / 2, -0.02, 0);
      scene.add(grid);

      if (mode === "shaft" && stations?.length) {
        for (let i = 0; i < stations.length - 1; i++) {
          const a = stations[i]!;
          const b = stations[i + 1]!;
          const segLen = Math.max(b.x - a.x, 1e-6);
          const r = Math.max((a.radius + b.radius) / 2, 0.01);
          const geom = new THREE.CylinderGeometry(r, r, segLen, 24);
          const mat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.4, roughness: 0.35 });
          const mesh = new THREE.Mesh(geom, mat);
          mesh.rotation.z = Math.PI / 2;
          mesh.position.set(a.x + segLen / 2, 0, 0);
          scene.add(mesh);
        }
      } else {
        const beamGeom = new THREE.BoxGeometry(length, 0.06, 0.12);
        const beamMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.2, roughness: 0.5 });
        const beam = new THREE.Mesh(beamGeom, beamMat);
        beam.position.set(length / 2, 0, 0);
        scene.add(beam);

        if (deflection.length > 1) {
          const maxAbs = Math.max(...deflection.map((v) => Math.abs(v)), 1e-12);
          const scale = (length * 0.12) / maxAbs;
          const pts: InstanceType<typeof THREE.Vector3>[] = [];
          for (let i = 0; i < deflection.length; i++) {
            const x = (i / (deflection.length - 1)) * length;
            pts.push(new THREE.Vector3(x, -(deflection[i] ?? 0) * scale, 0));
          }
          const curve = new THREE.CatmullRomCurve3(pts);
          const tube = new THREE.Mesh(
            new THREE.TubeGeometry(curve, 64, 0.012, 8, false),
            new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 0.15 })
          );
          scene.add(tube);
        }
      }

      let frame = 0;
      const animate = () => {
        if (disposed) return;
        frame = requestAnimationFrame(animate);
        camera.position.x = length * 0.55 + Math.sin(performance.now() / 4000) * length * 0.05;
        camera.lookAt(length / 2, 0, 0);
        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(frame);
        renderer.dispose();
        if (renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [length, deflection, stations, mode]);

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}>
      <div className="border-b border-slate-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-800">
        3D model (schematic)
      </div>
      <div ref={mountRef} className="min-h-[280px] w-full bg-slate-50 dark:bg-slate-900" />
    </div>
  );
}

/** Minimal glTF-like JSON attachment (not full binary glTF) for documentation export. */
export function exportSceneManifest(opts: {
  moduleId: string;
  length: number;
  deflection?: number[];
}): string {
  return JSON.stringify(
    {
      asset: { generator: "PhyCalcPro EDP-4", version: "2.0-schematic" },
      moduleId: opts.moduleId,
      length: opts.length,
      deflectionSamples: opts.deflection?.length ?? 0,
      note: "Schematic scene manifest — not manufacturing CAD.",
    },
    null,
    2
  );
}
