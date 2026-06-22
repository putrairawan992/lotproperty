import { useEffect, useRef } from "react";
import * as THREE from "three";

const STAR_COUNT = 28;
const DUST_COUNT = 45;

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
}

export default function HofFallingStars({
  isDark = true,
  mode = "stars",
  color,
}: {
  isDark?: boolean;
  mode?: "stars" | "embers" | "bubbles" | "lightning";
  color?: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 400;
    let height = container.clientHeight || 200;

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Parse custom color if provided
    let customColorNum: number | undefined;
    if (color) {
      customColorNum = parseInt(color.replace("#", "0x"), 16);
    }

    // Colors: stars (gold), embers (red/orange), bubbles (warm/greenish), lightning (electric cyan/blue)
    const starColor = customColorNum ?? (
      mode === "embers" ? 0xff4500 : 
      mode === "lightning" ? 0x00f0ff : 
      (isDark ? 0xffe08a : 0xffd54f)
    );
    const dustColor = customColorNum ?? (
      mode === "embers" ? 0xff8800 : 
      mode === "lightning" ? 0xa5f3fc : 
      (isDark ? 0xfff4c2 : 0xffe9a8)
    );

    const linePositions = new Float32Array(STAR_COUNT * 2 * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: starColor,
      transparent: true,
      opacity: mode === "embers" ? 0.85 : (isDark ? 0.75 : 0.55),
      blending: THREE.AdditiveBlending,
    });

    const shootingStars = new THREE.LineSegments(lineGeo, lineMat);
    
    const stars: Star[] = [];

    const spawnStar = (fromEdge = false) => {
      const x = (Math.random() - 0.5) * width * 1.1;
      let y = (Math.random() - 0.5) * height;
      
      if (fromEdge) {
        if (mode === "embers") {
          y = -height / 2 - Math.random() * 40;
        } else {
          y = height / 2 + Math.random() * 40;
        }
      }

      const speed = Math.random() * 2.8 + 1.8;
      const baseAngle = mode === "embers" ? Math.PI / 2 : -Math.PI / 2;
      const angle = baseAngle + (Math.random() - 0.5) * 0.55;
      
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: Math.random() * 28 + 18,
      };
    };

    const dustPositions = new Float32Array(DUST_COUNT * 3);
    const dustVel: { vx: number; vy: number }[] = [];
    const dustGeo = new THREE.BufferGeometry();
    const dustMat = new THREE.PointsMaterial({
      color: dustColor,
      size: mode === "embers" ? 3.0 : mode === "lightning" ? 2.5 : (isDark ? 2.2 : 1.8),
      transparent: true,
      opacity: mode === "embers" ? 0.8 : mode === "lightning" ? 0.9 : (isDark ? 0.55 : 0.4),
      blending: THREE.AdditiveBlending,
      sizeAttenuation: false,
    });
    const dust = new THREE.Points(dustGeo, dustMat);

    // Dynamic Bubble texture generator for bubble mode
    const createBubbleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, 32, 32);
        ctx.beginPath();
        ctx.arc(16, 16, 12, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(173, 216, 230, 0.25)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(11, 11, 2.5, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const bubbleTexture = mode === "bubbles" ? createBubbleTexture() : null;
    
    // Bubble systems array
    const bubbleSystems: {
      points: THREE.Points;
      geo: THREE.BufferGeometry;
      positions: Float32Array;
      vels: { vx: number; vy: number; wobbleSpeed: number; wobbleScale: number; wobbleOffset: number }[];
      size: number;
    }[] = [];

    // Lightning/Electric system setup
    const MAX_BOLTS = 2;
    const SEGMENTS_PER_BOLT = 8;
    const boltGeo = new THREE.BufferGeometry();
    const boltPositions = new Float32Array(MAX_BOLTS * SEGMENTS_PER_BOLT * 2 * 3);
    boltGeo.setAttribute("position", new THREE.BufferAttribute(boltPositions, 3));
    const boltMat = new THREE.LineBasicMaterial({
      color: starColor,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const lightningLines = new THREE.LineSegments(boltGeo, boltMat);

    const activeBolts: {
      points: { x: number; y: number }[];
      lifetime: number;
      maxLifetime: number;
      opacity: number;
    }[] = [];

    for (let i = 0; i < MAX_BOLTS; i++) {
      activeBolts.push({ points: [], lifetime: 0, maxLifetime: 0, opacity: 0 });
    }

    const generateLightningPoints = (startX: number, startY: number, endX: number, endY: number) => {
      const pts = [];
      const dx = endX - startX;
      const dy = endY - startY;
      const len = Math.sqrt(dx * dx + dy * dy);
      const perpX = -dy / (len || 1);
      const perpY = dx / (len || 1);

      pts.push({ x: startX, y: startY });

      for (let i = 1; i < SEGMENTS_PER_BOLT; i++) {
        const t = i / SEGMENTS_PER_BOLT;
        const bx = startX + dx * t;
        const by = startY + dy * t;
        const envelope = Math.sin(t * Math.PI);
        const disp = (Math.random() - 0.5) * 35 * envelope;
        
        pts.push({
          x: bx + perpX * disp,
          y: by + perpY * disp
        });
      }

      pts.push({ x: endX, y: endY });
      return pts;
    };

    if (mode === "bubbles") {
      const bubbleTiers = [
        { count: 18, size: 8, speedMin: 0.35, speedMax: 0.75, wobbleScale: 0.15 },
        { count: 12, size: 14, speedMin: 0.25, speedMax: 0.55, wobbleScale: 0.25 },
        { count: 6,  size: 20, speedMin: 0.15, speedMax: 0.35, wobbleScale: 0.4 }
      ];

      bubbleTiers.forEach((tier) => {
        const positions = new Float32Array(tier.count * 3);
        const vels: any[] = [];
        
        for (let i = 0; i < tier.count; i++) {
          positions[i * 3] = (Math.random() - 0.5) * width;
          positions[i * 3 + 1] = (Math.random() - 0.5) * height - height/2;
          positions[i * 3 + 2] = 0;
          
          vels.push({
            vx: 0,
            vy: Math.random() * (tier.speedMax - tier.speedMin) + tier.speedMin,
            wobbleSpeed: Math.random() * 0.02 + 0.015,
            wobbleScale: Math.random() * 0.4 + tier.wobbleScale,
            wobbleOffset: Math.random() * Math.PI * 2
          });
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
          color: customColorNum ?? 0xbbf7d0,
          size: tier.size,
          transparent: true,
          opacity: 0.65,
          map: bubbleTexture || undefined,
          blending: THREE.NormalBlending,
          sizeAttenuation: false,
          depthWrite: false
        });

        const points = new THREE.Points(geo, mat);
        scene.add(points);
        bubbleSystems.push({ points, geo, positions, vels, size: tier.size });
      });
    } else if (mode === "lightning") {
      scene.add(lightningLines);
      for (let i = 0; i < DUST_COUNT; i++) {
        dustPositions[i * 3] = (Math.random() - 0.5) * width;
        dustPositions[i * 3 + 1] = (Math.random() - 0.5) * height;
        dustPositions[i * 3 + 2] = 0;
        
        dustVel.push({
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5,
        });
      }
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
      scene.add(dust);
    } else {
      scene.add(shootingStars);
      for (let i = 0; i < STAR_COUNT; i++) stars.push(spawnStar());

      for (let i = 0; i < DUST_COUNT; i++) {
        dustPositions[i * 3] = (Math.random() - 0.5) * width;
        dustPositions[i * 3 + 1] = (Math.random() - 0.5) * height;
        dustPositions[i * 3 + 2] = 0;
        
        const vyFactor = mode === "embers" ? 1 : -1;
        dustVel.push({
          vx: (Math.random() - 0.5) * 0.35,
          vy: vyFactor * (Math.random() * 0.9 + 0.25),
        });
      }
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
      scene.add(dust);
    }

    let animationId = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (mode === "bubbles") {
        const time = Date.now();
        bubbleSystems.forEach((sys) => {
          const posAttr = sys.geo.getAttribute("position") as THREE.BufferAttribute;
          const count = sys.vels.length;
          
          for (let i = 0; i < count; i++) {
            const v = sys.vels[i];
            let x = posAttr.getX(i);
            let y = posAttr.getY(i) + v.vy;
            
            x += Math.sin(time * v.wobbleSpeed + v.wobbleOffset) * v.wobbleScale * 0.15;
            
            if (y > height / 2 + sys.size) {
              y = -height / 2 - sys.size - Math.random() * 20;
              x = (Math.random() - 0.5) * width;
            }
            
            posAttr.setXYZ(i, x, y, 0);
          }
          posAttr.needsUpdate = true;
        });
      } else if (mode === "lightning") {
        // Update active lightning bolts
        let activeCount = 0;
        for (let i = 0; i < MAX_BOLTS; i++) {
          const bolt = activeBolts[i];
          if (bolt.lifetime > 0) {
            bolt.lifetime--;
            // Flicker opacity
            const t = bolt.lifetime / bolt.maxLifetime;
            bolt.opacity = Math.random() < 0.35 ? 0 : (0.2 + 0.8 * t);
            activeCount++;
          } else {
            // Trigger a lightning strike with 1.5% probability per frame
            if (Math.random() < 0.015 && activeCount < 2) {
              const startX = (Math.random() - 0.5) * width;
              const startY = height / 2;
              const endX = startX + (Math.random() - 0.5) * width * 0.45;
              const endY = -height / 2;

              bolt.points = generateLightningPoints(startX, startY, endX, endY);
              bolt.maxLifetime = Math.floor(Math.random() * 8) + 8; // 8 to 15 frames
              bolt.lifetime = bolt.maxLifetime;
              bolt.opacity = 1.0;
              activeCount++;
            } else {
              bolt.opacity = 0;
            }
          }
        }

        // Draw lightning lines inside BufferGeometry
        const boltPosAttr = boltGeo.getAttribute("position") as THREE.BufferAttribute;
        let vIdx = 0;
        for (let i = 0; i < MAX_BOLTS; i++) {
          const bolt = activeBolts[i];
          if (bolt.opacity > 0 && bolt.points.length > 1) {
            for (let s = 0; s < SEGMENTS_PER_BOLT; s++) {
              const p1 = bolt.points[s];
              const p2 = bolt.points[s + 1];
              boltPosAttr.setXYZ(vIdx++, p1.x, p1.y, 0);
              boltPosAttr.setXYZ(vIdx++, p2.x, p2.y, 0);
            }
          } else {
            for (let s = 0; s < SEGMENTS_PER_BOLT; s++) {
              boltPosAttr.setXYZ(vIdx++, 0, 0, 0);
              boltPosAttr.setXYZ(vIdx++, 0, 0, 0);
            }
          }
        }
        boltPosAttr.needsUpdate = true;

        // Flicker material opacity based on overall strike activity
        boltMat.opacity = activeCount > 0 ? (Math.random() * 0.4 + 0.6) : 0;

        // Animate electric sparks wiggling erratically
        const dustAttr = dustGeo.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < DUST_COUNT; i++) {
          // Spark moves and wiggles
          let x = dustAttr.getX(i) + dustVel[i].vx + (Math.random() - 0.5) * 1.2;
          let y = dustAttr.getY(i) + dustVel[i].vy + (Math.random() - 0.5) * 1.2;

          // Boundary wrap
          if (x > width / 2) x = -width / 2;
          if (x < -width / 2) x = width / 2;
          if (y > height / 2) y = -height / 2;
          if (y < -height / 2) y = height / 2;

          // Occasionally change spark velocity direction for a jagged/erratic path
          if (Math.random() < 0.08) {
            dustVel[i].vx = (Math.random() - 0.5) * 2.5;
            dustVel[i].vy = (Math.random() - 0.5) * 2.5;
          }

          dustAttr.setXYZ(i, x, y, 0);
        }
        dustAttr.needsUpdate = true;
      } else {
        const posAttr = lineGeo.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < STAR_COUNT; i++) {
          const s = stars[i];
          s.x += s.vx;
          s.y += s.vy;

          const tailX = s.x - s.vx * (s.len / 6);
          const tailY = s.y - s.vy * (s.len / 6);

          posAttr.setXYZ(i * 2, tailX, tailY, 0);
          posAttr.setXYZ(i * 2 + 1, s.x, s.y, 0);

          const outOfBounds = mode === "embers"
            ? (s.y > height / 2 + 60 || s.x > width / 2 + 80 || s.x < -width / 2 - 80)
            : (s.y < -height / 2 - 60 || s.x > width / 2 + 80 || s.x < -width / 2 - 80);

          if (outOfBounds) {
            stars[i] = spawnStar(true);
          }
        }
        posAttr.needsUpdate = true;

        const dustAttr = dustGeo.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < DUST_COUNT; i++) {
          let x = dustAttr.getX(i) + dustVel[i].vx;
          let y = dustAttr.getY(i) + dustVel[i].vy;
          
          const resetBound = mode === "embers"
            ? (y > height / 2 + 10)
            : (y < -height / 2 - 10);

          if (resetBound) {
            y = mode === "embers" ? -height / 2 - Math.random() * 20 : height / 2 + Math.random() * 20;
            x = (Math.random() - 0.5) * width;
          }
          dustAttr.setXYZ(i, x, y, 0);
        }
        dustAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      width = container.clientWidth || 400;
      height = container.clientHeight || 200;
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      lineGeo.dispose();
      lineMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      
      if (mode === "lightning") {
        boltGeo.dispose();
        boltMat.dispose();
      }

      bubbleSystems.forEach((sys) => {
        sys.geo.dispose();
        (sys.points.material as THREE.Material).dispose();
      });
      if (bubbleTexture) bubbleTexture.dispose();

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDark, mode, color]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden
    />
  );
}
