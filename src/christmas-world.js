import * as THREE from "three";

function softParticleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 31);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(.18, "rgba(255,255,255,.8)");
  gradient.addColorStop(.58, "rgba(255,255,255,.18)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

function makeEnvironmentMaterial(texture) {
  return new THREE.ShaderMaterial({
    uniforms: { uMap: { value: texture }, uOpacity: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        vec4 sampleColor = texture2D(uMap, vUv);
        float horizontal = smoothstep(0.0, 0.16, vUv.x) * (1.0 - smoothstep(0.86, 1.0, vUv.x) * 0.28);
        float vertical = smoothstep(0.0, 0.12, vUv.y) * smoothstep(0.0, 0.12, 1.0 - vUv.y);
        gl_FragColor = vec4(sampleColor.rgb, sampleColor.a * horizontal * vertical * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

function createSnow(count, texture, color, size, opacity) {
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const drift = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (Math.random() - .5) * 34;
    positions[index * 3 + 1] = (Math.random() - .5) * 25;
    positions[index * 3 + 2] = -1 - Math.random() * 19;
    speeds[index] = .45 + Math.random() * 1.2;
    drift[index] = (Math.random() - .5) * .32;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color, map: texture, size, sizeAttenuation: true, transparent: true,
    opacity, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  return { points: new THREE.Points(geometry, material), positions, speeds, drift, geometry };
}

export function createChristmasWorld(canvas, imagePaths, reducedMotion = false) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: true, powerPreference: "low-power",
      failIfMajorPerformanceCaveat: false,
    });
  } catch {
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x10182b, .018);
  const camera = new THREE.PerspectiveCamera(48, 1, .1, 70);
  camera.position.set(0, 0, 0);
  camera.lookAt(0, 0, -12);
  scene.add(new THREE.HemisphereLight(0xe2edff, 0x19271f, 1.3));
  const candle = new THREE.PointLight(0xf6c96b, 36, 24, 2);
  candle.position.set(4.2, 1.5, -4.2);
  scene.add(candle);
  const moonlight = new THREE.PointLight(0x8eaddb, 28, 26, 2);
  moonlight.position.set(-5, 3, -8);
  scene.add(moonlight);

  const loader = new THREE.TextureLoader();
  const layers = new Map();
  const uniquePaths = [...new Set(imagePaths.filter(Boolean))];
  uniquePaths.forEach((path) => {
    const material = makeEnvironmentMaterial(null);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    mesh.position.set(0, -.1, -13);
    mesh.frustumCulled = false;
    scene.add(mesh);
    const layer = { mesh, material, loaded: false };
    layers.set(path, layer);
    loader.load(path, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
      material.uniforms.uMap.value = texture;
      layer.texture = texture;
      layer.loaded = true;
      if (reducedMotion && path === activePath) material.uniforms.uOpacity.value = 1;
      resize();
      renderOnce();
    }, undefined, () => {
      layer.failed = true;
    });
  });

  const particleTexture = softParticleTexture();
  const snow = createSnow(reducedMotion ? 80 : 640, particleTexture, 0xdbe8f0, .18, .5);
  const glimmers = createSnow(reducedMotion ? 18 : 110, particleTexture, 0xf6c96b, .31, .4);
  scene.add(snow.points, glimmers.points);

  let activePath = uniquePaths[0];
  let focus = 0;
  let snowPaused = reducedMotion;
  let frame = 0;
  let previousTime = 0;
  let disposed = false;
  let pointerX = 0, pointerY = 0, targetPointerX = 0, targetPointerY = 0;
  let phase = 0;

  function resize() {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const visibleHeight = 2 * 13 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const visibleWidth = visibleHeight * camera.aspect;
    for (const layer of layers.values()) {
      if (!layer.loaded) continue;
      const aspect = layer.texture.image.width / layer.texture.image.height;
      const planeWidth = visibleWidth / visibleHeight < aspect
        ? visibleHeight * .96 * aspect
        : Math.min(visibleWidth * .97, visibleHeight * .98 * aspect);
      const planeHeight = planeWidth / aspect;
      layer.mesh.geometry.dispose();
      layer.mesh.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 1, 1);
      layer.mesh.position.x = visibleWidth > 12 ? visibleWidth * .2 : visibleWidth * .23;
      layer.mesh.position.y = -visibleHeight * .035;
      layer.mesh.rotation.y = visibleWidth > 12 ? -.035 : -.012;
    }
  }

  function renderOnce() {
    if (disposed) return;
    renderer.render(scene, camera);
  }

  function setScene(path, selected = 0) {
    if (!layers.has(path)) return;
    activePath = path;
    focus = selected;
    phase = selected * 1.8 + performance.now() * .0002;
    if (reducedMotion) {
      for (const [key, layer] of layers) layer.material.uniforms.uOpacity.value = key === activePath ? 1 : 0;
      camera.position.x = 0;
      renderOnce();
    } else if (!frame) {
      frame = requestAnimationFrame(draw);
    }
  }

  function pointerMove(event) {
    targetPointerX = (event.clientX / window.innerWidth - .5) * 2;
    targetPointerY = (event.clientY / window.innerHeight - .5) * 2;
  }

  function driftParticles(group, delta, time) {
    if (snowPaused) return;
    const positions = group.positions;
    for (let index = 0; index < group.speeds.length; index += 1) {
      const offset = index * 3;
      positions[offset + 1] -= group.speeds[index] * delta;
      positions[offset] += (group.drift[index] + Math.sin(time * .00025 + index) * .08) * delta;
      if (positions[offset + 1] < -13) {
        positions[offset + 1] = 13;
        positions[offset] = (Math.random() - .5) * 34;
      }
    }
    group.geometry.attributes.position.needsUpdate = true;
  }

  function draw(time) {
    if (disposed || document.hidden) { frame = 0; return; }
    const delta = Math.min((time - previousTime) / 1000 || 0, .05);
    previousTime = time;
    pointerX = THREE.MathUtils.damp(pointerX, targetPointerX, 1.4, delta);
    pointerY = THREE.MathUtils.damp(pointerY, targetPointerY, 1.4, delta);
    const focusOffset = focus === 0 ? 0 : (focus - 1) * .34;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointerX * .22 + focusOffset, 1.8, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, -pointerY * .12, 1.8, delta);
    camera.lookAt(camera.position.x * .2, camera.position.y * .2, -12);
    for (const [path, layer] of layers) {
      const target = path === activePath && layer.loaded ? 1 : 0;
      const current = layer.material.uniforms.uOpacity.value;
      layer.material.uniforms.uOpacity.value = THREE.MathUtils.damp(current, target, 1.8, delta);
    }
    candle.intensity = 31 + Math.sin(time * .0011 + phase) * 6;
    driftParticles(snow, delta, time);
    driftParticles(glimmers, delta, time * .64);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(draw);
  }

  function wake() {
    if (!reducedMotion && !document.hidden && !frame) frame = requestAnimationFrame(draw);
  }
  function sleep() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }
  function visibilityChange() { document.hidden ? sleep() : wake(); }
  function pointerLeave() { targetPointerX = 0; targetPointerY = 0; }
  function reducedRender() { if (reducedMotion) renderOnce(); }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", pointerMove, { passive: true });
  window.addEventListener("blur", pointerLeave);
  document.addEventListener("visibilitychange", visibilityChange);
  resize();
  setScene(activePath);
  if (!reducedMotion) wake(); else reducedRender();

  return {
    setScene,
    setSnowPaused(value) { snowPaused = Boolean(value); },
    dispose() {
      disposed = true;
      sleep();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("blur", pointerLeave);
      document.removeEventListener("visibilitychange", visibilityChange);
      for (const layer of layers.values()) {
        layer.mesh.geometry.dispose();
        layer.material.dispose();
        layer.texture?.dispose();
      }
      snow.geometry.dispose(); snow.points.material.dispose();
      glimmers.geometry.dispose(); glimmers.points.material.dispose();
      particleTexture.dispose();
      renderer.dispose();
    },
  };
}
