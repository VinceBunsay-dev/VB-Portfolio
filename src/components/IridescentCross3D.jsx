import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function IridescentCross3D({ scrollRatio = 0, mouse = { x: 0, y: 0 } }) {
  const mountRef = useRef(null);
  const stateRef = useRef({ scrollRatio, mouse });

  useEffect(() => {
    stateRef.current = { scrollRatio, mouse };
  }, [scrollRatio, mouse]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();

    const getViewportMetrics = () => {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      const isMobile = width < 768;
      return { width, height, isMobile };
    };

    const initial = getViewportMetrics();
    const camera = new THREE.PerspectiveCamera(
      initial.isMobile ? 44 : 38,
      initial.width / Math.max(initial.height, 1),
      0.1,
      100
    );
    camera.position.z = initial.isMobile ? 10.5 : 8.8;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !initial.isMobile,
      powerPreference: "high-performance",
    });
    renderer.setSize(initial.width, initial.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, initial.isMobile ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Custom studio environment map tuned to electric lime, cyan, cobalt blue & violet
    const envCanvas = document.createElement("canvas");
    envCanvas.width = 512;
    envCanvas.height = 256;
    const ctx = envCanvas.getContext("2d");

    const bgGrad = ctx.createLinearGradient(0, 0, 512, 256);
    bgGrad.addColorStop(0.0, "#05070f");
    bgGrad.addColorStop(0.16, "#1d4ed8");
    bgGrad.addColorStop(0.32, "#7e22ce");
    bgGrad.addColorStop(0.5, "#2dd4bf");
    bgGrad.addColorStop(0.68, "#4ade80");
    bgGrad.addColorStop(0.84, "#2563eb");
    bgGrad.addColorStop(1.0, "#06080e");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 256);

    // Glowing neon & specular bands for crisp metallic reflection
    const limeBand = ctx.createLinearGradient(0, 0, 512, 0);
    limeBand.addColorStop(0, "rgba(74, 222, 128, 0)");
    limeBand.addColorStop(0.5, "rgba(132, 204, 22, 0.95)");
    limeBand.addColorStop(1, "rgba(74, 222, 128, 0)");
    ctx.fillStyle = limeBand;
    ctx.fillRect(40, 52, 430, 34);

    const blueBand = ctx.createLinearGradient(0, 0, 512, 0);
    blueBand.addColorStop(0, "rgba(59, 130, 246, 0)");
    blueBand.addColorStop(0.5, "rgba(99, 102, 241, 0.95)");
    blueBand.addColorStop(1, "rgba(59, 130, 246, 0)");
    ctx.fillStyle = blueBand;
    ctx.fillRect(30, 148, 450, 42);

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(90, 28, 150, 12);
    ctx.fillRect(260, 112, 170, 14);

    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = envTexture;

    // Colored & white lights matching the green/blue/cyan sheen
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 6, 7);
    scene.add(keyLight);

    const limeLight = new THREE.PointLight(0x4ade80, 5.5, 18);
    limeLight.position.set(3.5, 2.5, 4);
    scene.add(limeLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 5.5, 18);
    blueLight.position.set(-4, -1.5, 4);
    scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 4, 18);
    purpleLight.position.set(0, -4, 3);
    scene.add(purpleLight);

    const chromeMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#c7d2fe"),
      metalness: 1.0,
      roughness: 0.09,
      iridescence: 1.0,
      iridescenceIOR: 1.5,
      iridescenceThicknessMinimum: 200,
      iridescenceThicknessMaximum: 680,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.55,
    });

    const radialSegs = initial.isMobile ? 36 : 56;
    const crossGroup = new THREE.Group();

    // Central core block connecting all 6 tubular arms seamlessly
    const coreSize = 1.02;
    const coreGeo = new THREE.BoxGeometry(coreSize, coreSize, coreSize);
    const coreMesh = new THREE.Mesh(coreGeo, chromeMat);
    crossGroup.add(coreMesh);

    // Hollow cylindrical arm with rounded outer lip & inner bore
    const outerR = 0.52;
    const innerR = 0.28;
    const armLen = 1.15;
    const lipR = (outerR - innerR) * 0.5;
    const midR = (outerR + innerR) * 0.5;

    const armGroup = new THREE.Group();
    const cylGeo = new THREE.CylinderGeometry(outerR, outerR, armLen, radialSegs, 1, true);
    const cylMesh = new THREE.Mesh(cylGeo, chromeMat);
    cylMesh.position.y = armLen * 0.5;

    const innerGeo = new THREE.CylinderGeometry(innerR, innerR, armLen, radialSegs, 1, true);
    const innerMat = chromeMat.clone();
    innerMat.side = THREE.BackSide;
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    innerMesh.position.y = armLen * 0.5;

    const rimGeo = new THREE.TorusGeometry(midR, lipR, 20, radialSegs);
    rimGeo.rotateX(Math.PI / 2);
    const rimMesh = new THREE.Mesh(rimGeo, chromeMat);
    rimMesh.position.y = armLen;

    armGroup.add(cylMesh, innerMesh, rimMesh);

    // Place 6 arms: +Y, -Y, +X, -X, +Z, -Z
    const armConfigs = [
      [0, 0, 0],
      [Math.PI, 0, 0],
      [0, 0, -Math.PI / 2],
      [0, 0, Math.PI / 2],
      [Math.PI / 2, 0, 0],
      [-Math.PI / 2, 0, 0],
    ];

    armConfigs.forEach(([rx, ry, rz]) => {
      const arm = armGroup.clone();
      arm.rotation.set(rx, ry, rz);
      crossGroup.add(arm);
    });

    crossGroup.rotation.set(0.58, -0.62, 0.42);
    scene.add(crossGroup);

    const current = {
      x: 3.1,
      y: 0.1,
      scale: 0.92,
      rotX: 0.58,
      rotY: -0.62,
      rotZ: 0.42,
    };

    let frameId;
    const startTime = performance.now();
    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = (now) => {
      frameId = requestAnimationFrame(animate);
      const elapsed = ((now ?? performance.now()) - startTime) * 0.001;
      const { scrollRatio: s, mouse: m } = stateRef.current;
      const { isMobile } = getViewportMetrics();

      const xSpread = isMobile ? 0.55 : 1.0;
      const baseScale = isMobile ? 0.68 : 0.95;
      const startX = 3.1 * xSpread;
      const startY = 0.1;

      let targetX = startX;
      let targetY = startY;
      let targetScale = 0.95 * baseScale;

      if (s < 0.33) {
        const t = s / 0.33;
        targetX = lerp(startX, 0.25 * xSpread, t);
        targetY = lerp(startY, 0.05, t);
        targetScale = lerp(0.95 * baseScale, 0.92 * baseScale, t);
      } else if (s < 0.66) {
        const t = (s - 0.33) / 0.33;
        targetX = lerp(0.25 * xSpread, -1.75 * xSpread, t);
        targetY = lerp(0.05, 0.1, t);
        targetScale = lerp(0.92 * baseScale, 1.0 * baseScale, t);
      } else {
        const t = (s - 0.66) / 0.34;
        targetX = lerp(-1.75 * xSpread, 2.25 * xSpread, t);
        targetY = lerp(0.1, -1.45, t);
        targetScale = lerp(1.0 * baseScale, 0.85 * baseScale, t);
      }

      const safeMouseX = isMobile ? 0 : m.x;
      const safeMouseY = isMobile ? 0 : m.y;

      const targetRotX =
        0.58 + s * Math.PI * 2.1 + Math.sin(elapsed * 0.85) * 0.16 + safeMouseY * 0.35;
      const targetRotY =
        -0.62 + s * Math.PI * 2.5 + Math.cos(elapsed * 0.65) * 0.2 + safeMouseX * 0.45;
      const targetRotZ = 0.42 + s * Math.PI * 1.3 + Math.sin(elapsed * 0.55) * 0.12;

      current.x = lerp(current.x, targetX + safeMouseX * 0.2, 0.07);
      current.y = lerp(
        current.y,
        targetY - safeMouseY * 0.18 + Math.sin(elapsed * 1.2) * 0.07,
        0.07
      );
      current.scale = lerp(current.scale, targetScale, 0.07);
      current.rotX = lerp(current.rotX, targetRotX, 0.07);
      current.rotY = lerp(current.rotY, targetRotY, 0.07);
      current.rotZ = lerp(current.rotZ, targetRotZ, 0.07);

      crossGroup.position.set(current.x, current.y, 0);
      crossGroup.scale.setScalar(current.scale);
      crossGroup.rotation.set(current.rotX, current.rotY, current.rotZ);

      renderer.render(scene, camera);
    };

    frameId = requestAnimationFrame(animate);

    const handleResize = () => {
      const { width, height, isMobile } = getViewportMetrics();
      camera.fov = isMobile ? 44 : 38;
      camera.position.z = isMobile ? 10.5 : 8.8;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      coreGeo.dispose();
      cylGeo.dispose();
      innerGeo.dispose();
      rimGeo.dispose();
      innerMat.dispose();
      chromeMat.dispose();
      envTexture.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        zIndex: 2,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    />
  );
}