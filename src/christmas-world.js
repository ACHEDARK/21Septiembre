import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

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

function makeWrappingTexture(base, accent, variant) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const context = canvas.getContext("2d");
  const wash = context.createLinearGradient(0, 0, 256, 256);
  wash.addColorStop(0, base);
  wash.addColorStop(.52, accent);
  wash.addColorStop(1, base);
  context.fillStyle = wash;
  context.fillRect(0, 0, 256, 256);
  context.globalAlpha = .2;
  context.strokeStyle = variant === 1 ? "#f4e5b9" : "#ffffff";
  context.lineWidth = 1;
  for (let offset = -256; offset < 512; offset += 18) {
    context.beginPath();
    context.moveTo(offset, 0);
    context.bezierCurveTo(offset + 35, 78, offset - 24, 172, offset + 12, 256);
    context.stroke();
  }
  context.globalAlpha = .3;
  context.fillStyle = variant === 2 ? "#f6d987" : "#f7e8c3";
  for (let y = 12; y < 256; y += 32) {
    for (let x = 12 + (y % 2) * 12; x < 256; x += 32) {
      context.beginPath();
      context.arc(x, y, 1.6, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

function makeGift(index) {
  const wraps = [
    makeWrappingTexture("#5a222e", "#8e3940", 0),
    makeWrappingTexture("#173c32", "#32604b", 1),
    makeWrappingTexture("#8a6a2c", "#c7a858", 2),
  ];
  const sizes = [[.96, .76, .78], [.82, .92, .72], [1.04, .68, .82]][index % 3];
  const [width, height, depth] = sizes;
  const group = new THREE.Group();
  const paper = new THREE.MeshPhysicalMaterial({
    map: wraps[index % 3], roughness: .54, metalness: .03,
    clearcoat: .24, clearcoatRoughness: .42,
  });
  const satin = new THREE.MeshPhysicalMaterial({
    color: [0xe7c980, 0xb9d3c1, 0x782e37][index % 3],
    roughness: .24, metalness: .3, clearcoat: .85, clearcoatRoughness: .2,
  });
  const body = new THREE.Mesh(new RoundedBoxGeometry(width, height, depth, 5, .09), paper);
  body.position.y = 0;
  group.add(body);

  const lidPivot = new THREE.Group();
  lidPivot.position.y = height * .5 - .035;
  const lid = new THREE.Mesh(new RoundedBoxGeometry(width + .1, .18, depth + .1, 5, .055), paper);
  lid.position.y = .075;
  lidPivot.add(lid);
  group.add(lidPivot);

  const verticalBand = new THREE.Mesh(new RoundedBoxGeometry(.14, height + .04, depth + .025, 3, .035), satin);
  group.add(verticalBand);
  const crossBand = new THREE.Mesh(new RoundedBoxGeometry(width + .03, .035, .16, 3, .014), satin);
  crossBand.position.y = height * .5 + .006;
  group.add(crossBand);
  const lidBand = new THREE.Mesh(new RoundedBoxGeometry(.14, .19, depth + .13, 3, .035), satin);
  lidBand.position.y = height * .5 + .075;
  group.add(lidBand);

  for (const side of [-1, 1]) {
    const loop = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, .2, .03), new THREE.Vector3(side * .2, .24, .08),
      new THREE.Vector3(side * .4, .43, .03), new THREE.Vector3(side * .31, .49, -.04),
      new THREE.Vector3(side * .1, .36, -.02), new THREE.Vector3(0, .2, .03),
    ]);
    lidPivot.add(new THREE.Mesh(new THREE.TubeGeometry(loop, 30, .043, 8, false), satin));
    const tail = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, .2, .04), new THREE.Vector3(side * .13, .1, .12),
      new THREE.Vector3(side * .25, -.08, .14), new THREE.Vector3(side * .38, -.15, .12),
    ]);
    lidPivot.add(new THREE.Mesh(new THREE.TubeGeometry(tail, 20, .035, 8, false), satin));
  }
  const knot = new THREE.Mesh(new THREE.SphereGeometry(.095, 20, 14), satin);
  knot.position.set(0, .22, .05);
  lidPivot.add(knot);

  const giftGlow = new THREE.Mesh(
    new THREE.SphereGeometry(.12, 24, 18),
    new THREE.MeshBasicMaterial({ color: 0xffe6a2, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }),
  );
  giftGlow.position.y = height * .5 + .52;
  giftGlow.scale.setScalar(.01);
  group.add(giftGlow);
  group.userData = { body, lidPivot, giftGlow, wraps, baseZ: -8.3, baseY: -.85, layoutY: -.85 };
  return group;
}

export function createChristmasWorld(canvas, imagePaths, reducedMotion = false, giftScenePaths = []) {
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

  const giftStage = new THREE.Group();
  const gifts = [makeGift(0), makeGift(1), makeGift(2)];
  gifts.forEach((gift) => giftStage.add(gift));
  giftStage.visible = false;
  scene.add(giftStage);

  const treeCenter = new THREE.Group();
  const treeCoordinates = [
    [0, 1.72], [.22, 1.47], [.62, 1.4], [.28, 1.34], [1.03, .86], [.46, .93],
    [1.46, .2], [.66, .42], [1.82, -.44], [.78, -.18], [2.08, -1.17], [.77, -.91],
    [.38, -1.5], [0, -1.5], [-.38, -1.5], [-.77, -.91], [-2.08, -1.17], [-.78, -.18],
    [-1.82, -.44], [-.66, .42], [-1.46, .2], [-.46, .93], [-1.03, .86], [-.28, 1.34],
    [-.62, 1.4], [-.22, 1.47], [0, 1.72],
  ];
  const treeCurve = new THREE.CatmullRomCurve3(
    treeCoordinates.map(([x, y]) => new THREE.Vector3(x, y, 0)), false, "catmullrom", .12,
  );
  const treePoints = treeCurve.getPoints(260);
  const treeGeometry = new THREE.BufferGeometry().setFromPoints(
    treePoints,
  );
  treeGeometry.setDrawRange(0, 0);
  const treeOutline = new THREE.Line(treeGeometry, new THREE.LineBasicMaterial({
    color: 0xffe7a3, transparent: true, opacity: .96, blending: THREE.AdditiveBlending,
    depthWrite: false, toneMapped: false,
  }));
  treeOutline.position.z = -5.8;
  treeCenter.add(treeOutline);

  const trunk = new THREE.Mesh(new RoundedBoxGeometry(.23, .64, .14, 5, .065),
    new THREE.MeshBasicMaterial({ color: 0xf0cd83, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
  trunk.position.set(0, -1.13, -5.78);
  treeCenter.add(trunk);

  const lightBulbs = [];
  for (let index = 0; index < 28; index += 1) {
    const progress = index / 27;
    const y = 1.38 - progress * 2.47;
    const breadth = .15 + progress * 1.76;
    const angle = progress * Math.PI * 6.3;
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(.034, 12, 10),
      new THREE.MeshBasicMaterial({
        color: index % 4 === 0 ? 0xffd68a : 0xfff1c2,
        transparent: true, opacity: 0, blending: THREE.AdditiveBlending,
      }),
    );
    bulb.position.set(Math.sin(angle) * breadth, y, -5.66 + Math.cos(angle) * .08);
    bulb.userData.progress = progress;
    treeCenter.add(bulb);
    lightBulbs.push(bulb);
  }

  const starShape = new THREE.Shape();
  for (let index = 0; index < 10; index += 1) {
    const angle = Math.PI * index / 5 - Math.PI / 2;
    const radius = index % 2 === 0 ? .19 : .085;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    index === 0 ? starShape.moveTo(x, y) : starShape.lineTo(x, y);
  }
  starShape.closePath();
  const treeStar = new THREE.Mesh(new THREE.ShapeGeometry(starShape), new THREE.MeshBasicMaterial({
    color: 0xffe79c, transparent: true, opacity: 0, blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide, depthWrite: false,
  }));
  treeStar.position.set(0, 1.9, -5.72);
  treeCenter.add(treeStar);

  const ceremonyShade = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
    color: 0x050812, transparent: true, opacity: 0, depthWrite: false,
  }));
  ceremonyShade.position.z = -10.5;
  scene.add(ceremonyShade);
  const spiritMaterial = new THREE.SpriteMaterial({
    map: particleTexture, color: 0xfff1bd, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  });
  const lightSpirit = new THREE.Sprite(spiritMaterial);
  lightSpirit.scale.set(.78, .78, 1);
  lightSpirit.position.set(-3.7, -2, -5.2);
  treeCenter.add(lightSpirit);
  scene.add(treeCenter);
  treeCenter.visible = false;

  let activePath = uniquePaths[0];
  let focus = 0;
  let snowPaused = reducedMotion;
  let frame = 0;
  let previousTime = 0;
  let disposed = false;
  let pointerX = 0, pointerY = 0, targetPointerX = 0, targetPointerY = 0;
  let phase = 0;
  let ceremonyStarted = 0;
  let ceremonyActive = false;
  let ceremonyResolve = null;
  let selectedGift = -1;
  const giftScenes = new Set(giftScenePaths);

  function resize() {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const visibleHeight = 2 * 13 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const visibleWidth = visibleHeight * camera.aspect;
    const shadeHeight = visibleHeight * 1.15;
    ceremonyShade.geometry.dispose();
    ceremonyShade.geometry = new THREE.PlaneGeometry(visibleWidth * 1.15, shadeHeight);
    ceremonyShade.position.z = -10.5;
    treeCenter.position.set(visibleWidth > 12 ? visibleWidth * .04 : 0, .15, 0);
    const stageWidth = visibleWidth * (8.3 / 13);
    const giftX = visibleWidth > 12
      ? [stageWidth * .1, stageWidth * .26, stageWidth * .42]
      : [-stageWidth * .3, 0, stageWidth * .3];
    gifts.forEach((gift, index) => {
      gift.userData.layoutY = visibleWidth > 12 ? -.72 : -1.32;
      gift.position.set(giftX[index], gift.userData.layoutY, gift.userData.baseZ);
    });
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
    giftStage.visible = giftScenes.has(path);
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
    if (ceremonyActive) {
      const elapsed = time - ceremonyStarted;
      const shade = THREE.MathUtils.smoothstep(elapsed, 150, 1250) * .9;
      ceremonyShade.material.opacity = shade;
      const drawing = THREE.MathUtils.smoothstep(elapsed, 1100, 4100);
      treeGeometry.setDrawRange(0, Math.floor(treePoints.length * drawing));
      trunk.material.opacity = THREE.MathUtils.smoothstep(elapsed, 3150, 3900);
      treeStar.material.opacity = THREE.MathUtils.smoothstep(elapsed, 3750, 4450);
      lightBulbs.forEach((bulb) => {
        bulb.material.opacity = THREE.MathUtils.smoothstep(elapsed, 3850 + bulb.userData.progress * 700, 4550 + bulb.userData.progress * 700);
        const pulse = .86 + Math.sin(time * .006 + bulb.userData.progress * 21) * .14;
        bulb.scale.setScalar(pulse);
      });
      const spiritProgress = THREE.MathUtils.clamp((elapsed - 350) / 3750, 0, 1);
      const spiritPoint = treeCurve.getPointAt(spiritProgress);
      lightSpirit.position.set(spiritPoint.x, spiritPoint.y, -5.2);
      spiritMaterial.opacity = elapsed < 450 || elapsed > 4800 ? 0 : 1;
      const pulse = .68 + Math.sin(time * .009) * .12;
      lightSpirit.scale.set(pulse, pulse, 1);
      if (elapsed >= (reducedMotion ? 1750 : 5850)) {
        ceremonyActive = false;
        ceremonyResolve?.();
        ceremonyResolve = null;
      }
    }
    gifts.forEach((gift, index) => {
      const selected = index === selectedGift;
      const bob = reducedMotion ? 0 : Math.sin(time * .0012 + index * 2.3) * .08;
      gift.position.y = THREE.MathUtils.damp(gift.position.y, gift.userData.layoutY + bob, 2, delta);
      gift.position.z = THREE.MathUtils.damp(gift.position.z, gift.userData.baseZ + (selected ? 1.45 : 0), 2.2, delta);
      gift.rotation.y = THREE.MathUtils.damp(gift.rotation.y, selected ? -.12 : Math.sin(time * .00055 + index) * .08, 2, delta);
      const targetScale = selected ? 1.14 : 1;
      const scale = THREE.MathUtils.damp(gift.scale.x, targetScale, 2.5, delta);
      gift.scale.setScalar(scale);
      gift.userData.lidPivot.rotation.x = THREE.MathUtils.damp(gift.userData.lidPivot.rotation.x, selected ? -1.06 : 0, 3, delta);
      gift.userData.giftGlow.material.opacity = THREE.MathUtils.damp(gift.userData.giftGlow.material.opacity, selected ? .75 : 0, 3, delta);
      const glowScale = THREE.MathUtils.damp(gift.userData.giftGlow.scale.x, selected ? 1.4 : .01, 3, delta);
      gift.userData.giftGlow.scale.setScalar(glowScale);
    });
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
    selectGift(index) { selectedGift = index; },
    playGreeting() {
      treeCenter.visible = true;
      treeGeometry.setDrawRange(0, 0);
      trunk.material.opacity = 0;
      treeStar.material.opacity = 0;
      lightBulbs.forEach((bulb) => { bulb.material.opacity = 0; });
      spiritMaterial.opacity = 0;
      ceremonyShade.material.opacity = 0;
      ceremonyStarted = performance.now();
      ceremonyActive = true;
      if (reducedMotion) {
        ceremonyShade.material.opacity = .9;
        treeGeometry.setDrawRange(0, treePoints.length);
        trunk.material.opacity = 1;
        treeStar.material.opacity = 1;
        lightBulbs.forEach((bulb) => { bulb.material.opacity = .9; });
        renderOnce();
        return new Promise((resolve) => { ceremonyResolve = resolve; window.setTimeout(resolve, 1750); });
      }
      if (!frame) frame = requestAnimationFrame(draw);
      return new Promise((resolve) => { ceremonyResolve = resolve; });
    },
    endGreeting() {
      treeCenter.visible = false;
      ceremonyShade.material.opacity = 0;
      ceremonyActive = false;
      renderOnce();
    },
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
