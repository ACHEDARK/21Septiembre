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

// A single three-dimensional fir sprig. Repeated around the trunk it makes
// layered foliage with a soft, irregular silhouette instead of a wire outline.
function eased(value) {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function makeFirBoughGeometry() {
  const profile = [
    [0, .075, .08, 0], [.13, .16, .17, .015], [.32, .23, .22, .01],
    [.52, .235, .21, -.035], [.7, .19, .16, -.085], [.86, .12, .1, -.14],
    [.97, .045, .04, -.19], [1, .008, .01, -.2],
  ];
  const around = 16;
  const positions = [];
  const indices = [];
  profile.forEach(([x, radiusY, radiusZ, centerY], ring) => {
    for (let side = 0; side < around; side += 1) {
      const angle = side / around * Math.PI * 2;
      const waviness = 1 + .045 * Math.sin(angle * 5 + ring * 2.3);
      positions.push(
        x,
        centerY + Math.sin(angle) * radiusY * waviness,
        Math.cos(angle) * radiusZ * waviness,
      );
    }
  });
  for (let ring = 0; ring < profile.length - 1; ring += 1) {
    for (let side = 0; side < around; side += 1) {
      const a = ring * around + side;
      const b = ring * around + (side + 1) % around;
      const c = (ring + 1) * around + (side + 1) % around;
      const d = (ring + 1) * around + side;
      indices.push(a, d, b, b, d, c);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
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

function makeGift(index, particleTexture) {
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
  giftGlow.position.y = height * .22;
  giftGlow.scale.setScalar(.01);
  group.add(giftGlow);

  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  const shadowContext = shadowCanvas.getContext("2d");
  const shadowGradient = shadowContext.createRadialGradient(64, 64, 4, 64, 64, 62);
  shadowGradient.addColorStop(0, "rgba(0,0,0,.58)");
  shadowGradient.addColorStop(.42, "rgba(0,0,0,.25)");
  shadowGradient.addColorStop(1, "rgba(0,0,0,0)");
  shadowContext.fillStyle = shadowGradient;
  shadowContext.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 2.2, depth * 2.25),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, -height * .5 - .025, 0);
  group.add(shadow);

  const particleCount = 56;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleAngles = new Float32Array(particleCount);
  const particleOffsets = new Float32Array(particleCount);
  for (let particle = 0; particle < particleCount; particle += 1) {
    particleAngles[particle] = particle * 2.399;
    particleOffsets[particle] = particle / particleCount;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const giftParticles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
    color: 0xffe6a2, map: particleTexture, size: .19, sizeAttenuation: true,
    transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  giftParticles.frustumCulled = false;
  group.add(giftParticles);
  group.userData = {
    body, lidPivot, giftGlow, giftParticles, particleGeometry, particlePositions,
    particleAngles, particleOffsets, wraps, reveal: 0, baseZ: -6.4,
    layoutX: 0, layoutY: 0,
  };
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
  const snow = createSnow(reducedMotion ? 80 : 900, particleTexture, 0xe5f0ff, .24, .62);
  const glimmers = createSnow(reducedMotion ? 18 : 150, particleTexture, 0xf6d994, .3, .42);
  const ceremonySnow = createSnow(reducedMotion ? 60 : 360, particleTexture, 0xe8f2ff, .34, .82);
  for (let index = 0; index < ceremonySnow.speeds.length; index += 1) {
    const offset = index * 3;
    ceremonySnow.positions[offset] = (Math.random() - .5) * 12;
    ceremonySnow.positions[offset + 1] = (Math.random() - .5) * 8;
    ceremonySnow.positions[offset + 2] = -4 - Math.random() * 4;
    ceremonySnow.speeds[index] = .34 + Math.random() * .52;
    ceremonySnow.drift[index] = (Math.random() - .5) * .12;
  }
  ceremonySnow.geometry.attributes.position.needsUpdate = true;
  scene.add(snow.points, glimmers.points, ceremonySnow.points);

  const giftStage = new THREE.Group();
  const gifts = [makeGift(0, particleTexture), makeGift(1, particleTexture), makeGift(2, particleTexture)];
  gifts.forEach((gift) => giftStage.add(gift));
  giftStage.visible = false;
  scene.add(giftStage);

  const treeCenter = new THREE.Group();
  const branchLayout = [];
  const tierCount = 8;
  for (let tier = 0; tier < tierCount; tier += 1) {
    const fraction = tier / (tierCount - 1);
    const y = 1.43 - fraction * 2.58;
    const radius = .12 + Math.pow(fraction, .88) * 1.65;
    const count = tier < 2 ? 10 : 16;
    for (let branch = 0; branch < count; branch += 1) {
      const angle = branch / count * Math.PI * 2 + tier * 2.399;
      const jitter = Math.sin(tier * 11.7 + branch * 5.3) * .08;
      const length = radius * (.83 + .13 * Math.sin(branch * 4.1 + tier));
      const origin = new THREE.Vector3(0, y + jitter, 0);
      const direction = new THREE.Vector3(Math.cos(angle), -.17 - fraction * .34, Math.sin(angle)).normalize();
      // Rounded, tapered boughs overlap in irregular tiers for an organic fir.
      branchLayout.push({
        boughPosition: origin,
        boughQuaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction),
        boughScale: new THREE.Vector3(length * 1.18, .86, .9),
        progress: .08 + fraction * .68 + (branch % 5) * .022,
        color: [0x70a879, 0x8abd87, 0x4d8b62][(tier + branch) % 3],
      });
    }
  }
  const branchMatrix = new THREE.Matrix4();
  const branchScale = new THREE.Vector3();
  const boughGeometry = makeFirBoughGeometry();
  const boughMaterial = new THREE.MeshStandardMaterial({
    color: 0x9abf86, emissive: 0x205536, emissiveIntensity: .72,
    roughness: .86, metalness: .01, vertexColors: true,
  });
  const boughs = new THREE.InstancedMesh(boughGeometry, boughMaterial, branchLayout.length);
  branchLayout.forEach((branch, index) => {
    boughs.setMatrixAt(index, new THREE.Matrix4().compose(branch.boughPosition, branch.boughQuaternion, branch.boughScale));
    boughs.setColorAt(index, new THREE.Color(branch.color));
  });
  boughs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  boughs.position.z = -5.8;
  treeCenter.add(boughs);

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.12, .19, .77, 12, 1), new THREE.MeshStandardMaterial({
    color: 0x68452f, roughness: .94, transparent: true, opacity: 0,
  }));
  trunk.position.set(0, -1.31, -5.8);
  treeCenter.add(trunk);

  const bulbGeometry = new THREE.SphereGeometry(.041, 12, 10);
  const bulbMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffe3a1, emissive: 0xffb84f, emissiveIntensity: 1.2,
    roughness: .22, metalness: .12, transparent: true, opacity: 1,
  });
  const bulbLayout = [];
  for (let index = 0; index < 45; index += 1) {
    const progress = (index + .5) / 45;
    const y = 1.28 - progress * 2.42;
    const breadth = .12 + progress * 1.48;
    const angle = index * 2.399;
    const pos = new THREE.Vector3(Math.cos(angle) * breadth, y, Math.sin(angle) * breadth * .44 - 5.67);
    const scale = .7 + ((index * 17) % 7) * .09;
    bulbLayout.push({
      position: pos, scale, progress,
      reveal: .74 + progress * .22,
      color: [0xffd37c, 0xffefc2, 0xb7d7cb, 0xc96d61][index % 4],
    });
  }
  const lightBulbs = new THREE.InstancedMesh(bulbGeometry, bulbMaterial, bulbLayout.length);
  const bulbDummy = new THREE.Object3D();
  bulbLayout.forEach((bulb, index) => {
    bulbDummy.position.copy(bulb.position);
    bulbDummy.scale.setScalar(.001);
    bulbDummy.updateMatrix();
    lightBulbs.setMatrixAt(index, bulbDummy.matrix);
    lightBulbs.setColorAt(index, new THREE.Color(bulb.color));
  });
  lightBulbs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  treeCenter.add(lightBulbs);

  const ornamentGeometry = new THREE.SphereGeometry(.102, 24, 20);
  const ornamentMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, emissive: 0x2b1407, emissiveIntensity: .34,
    roughness: .2, metalness: .38, clearcoat: .92, clearcoatRoughness: .16,
  });
  const ornamentPalette = [0xc85b50, 0xe8c879, 0x84b9a3, 0xe7dcc2];
  const ornamentLayout = [];
  const ornamentCount = reducedMotion ? 14 : 34;
  for (let index = 0; index < ornamentCount; index += 1) {
    const progress = .22 + (index / ornamentCount) * .72;
    const radius = .2 + Math.pow(progress, .9) * 1.35;
    const angle = index * 2.399 + .8;
    ornamentLayout.push({
      position: new THREE.Vector3(Math.cos(angle) * radius, 1.32 - progress * 2.4, Math.sin(angle) * radius * .5 - 5.69),
      scale: .75 + (index % 4) * .12, progress, color: ornamentPalette[index % ornamentPalette.length],
    });
  }
  const ornaments = new THREE.InstancedMesh(ornamentGeometry, ornamentMaterial, ornamentLayout.length);
  ornamentLayout.forEach((ornament, index) => {
    bulbDummy.position.copy(ornament.position);
    bulbDummy.scale.setScalar(.001);
    bulbDummy.updateMatrix();
    ornaments.setMatrixAt(index, bulbDummy.matrix);
    ornaments.setColorAt(index, new THREE.Color(ornament.color));
  });
  ornaments.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  treeCenter.add(ornaments);

  const garlandPoints = [];
  const garlandTurns = 4.4;
  for (let index = 0; index <= 220; index += 1) {
    const t = index / 220;
    const angle = t * Math.PI * 2 * garlandTurns;
    const radius = .14 + t * 1.48;
    garlandPoints.push(new THREE.Vector3(Math.cos(angle) * radius, 1.32 - t * 2.48, Math.sin(angle) * radius * .52 - 5.72));
  }
  const garlandCurve = new THREE.CatmullRomCurve3(garlandPoints);
  const garland = new THREE.Mesh(new THREE.TubeGeometry(garlandCurve, 260, .011, 6, false), new THREE.MeshPhysicalMaterial({
    color: 0xffdfa0, emissive: 0xe3a84c, emissiveIntensity: 1.8,
    roughness: .25, metalness: .48, transparent: true, opacity: 0,
  }));
  treeCenter.add(garland);

  // A volumetric, precomputed upward spiral of motes; no hand-drawn strokes.
  const energyCount = reducedMotion ? 120 : 360;
  const energyPositions = new Float32Array(energyCount * 3);
  const energyGeometry = new THREE.BufferGeometry();
  energyGeometry.setAttribute("position", new THREE.BufferAttribute(energyPositions, 3));
  const energyMaterial = new THREE.PointsMaterial({
    color: 0xffd889, map: particleTexture, size: .12, transparent: true, opacity: 0,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  const energyStream = new THREE.Points(energyGeometry, energyMaterial);
  energyStream.position.z = -5.72;
  treeCenter.add(energyStream);

  const bulbGlow = new THREE.PointLight(0xffd174, 0, 12, 1.6);
  bulbGlow.position.set(0, 1.8, -5.4);
  treeCenter.add(bulbGlow);

  const starShape = new THREE.Shape();
  for (let index = 0; index < 10; index += 1) {
    const angle = Math.PI * index / 5 - Math.PI / 2;
    const radius = index % 2 === 0 ? .25 : .112;
    const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
    index === 0 ? starShape.moveTo(x, y) : starShape.lineTo(x, y);
  }
  starShape.closePath();
  const treeStar = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, {
    depth: .12, bevelEnabled: true, bevelThickness: .035, bevelSize: .028, bevelSegments: 3,
  }), new THREE.MeshBasicMaterial({
    color: 0xffd778, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, toneMapped: false,
  }));
  treeStar.position.set(0, 1.78, -5.7);
  treeStar.scale.setScalar(.01);
  treeCenter.add(treeStar);
  const starGlowMaterial = new THREE.SpriteMaterial({
    map: particleTexture, color: 0xffd980, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  });
  const starGlow = new THREE.Sprite(starGlowMaterial);
  starGlow.position.copy(treeStar.position);
  starGlow.scale.set(1.35, 1.35, 1);
  treeCenter.add(starGlow);

  // Deterministic burst particles: initial positions and velocities are stable.
  const burstCount = reducedMotion ? 100 : 260;
  const burstPositions = new Float32Array(burstCount * 3);
  const burstVelocity = [];
  for (let index = 0; index < burstCount; index += 1) {
    const y = 1 - 2 * (index + .5) / burstCount;
    const radius = Math.sqrt(1 - y * y), angle = index * 2.399;
    burstVelocity.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius).multiplyScalar(.7 + (index % 11) * .09));
  }
  const burstGeometry = new THREE.BufferGeometry();
  burstGeometry.setAttribute("position", new THREE.BufferAttribute(burstPositions, 3));
  const burstMaterial = new THREE.PointsMaterial({
    color: 0xffe0a0, map: particleTexture, size: .16, transparent: true,
    opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  const burst = new THREE.Points(burstGeometry, burstMaterial);
  burst.position.copy(treeStar.position);
  treeCenter.add(burst);
  const shockwave = new THREE.Mesh(new THREE.RingGeometry(.75, .8, 64), new THREE.MeshBasicMaterial({
    color: 0xffe3aa, transparent: true, opacity: 0, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  shockwave.position.copy(treeStar.position);
  treeCenter.add(shockwave);

  const spiritGroup = new THREE.Group();
  const spiritCore = new THREE.Sprite(new THREE.SpriteMaterial({
    map: particleTexture, color: 0xfff0c2, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  }));
  spiritCore.scale.set(1.2, 1.8, 1);
  spiritGroup.add(spiritCore);
  const spiritHalo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: particleTexture, color: 0xffd889, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  }));
  spiritHalo.scale.set(2.8, 2.8, 1);
  spiritGroup.add(spiritHalo);
  const spiritOrbitCount = 48;
  const spiritOrbitPositions = new Float32Array(spiritOrbitCount * 3);
  const spiritOrbitGeo = new THREE.BufferGeometry();
  spiritOrbitGeo.setAttribute("position", new THREE.BufferAttribute(spiritOrbitPositions, 3));
  const spiritOrbitMat = new THREE.PointsMaterial({
    color: 0xffe8bb, map: particleTexture, size: .105, transparent: true, opacity: 0,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const spiritOrbit = new THREE.Points(spiritOrbitGeo, spiritOrbitMat);
  spiritGroup.add(spiritOrbit);
  spiritGroup.position.set(0, -1.95, -5.15);
  treeCenter.add(spiritGroup);

  const ceremonyShade = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
    color: 0x050812, transparent: true, opacity: 0, depthWrite: false,
  }));
  ceremonyShade.position.z = -10.5;
  scene.add(ceremonyShade);
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
  let ceremonyOnState = null;
  let ceremonyState = "IDLE";
  let burstStarted = false;
  const ceremonyScale = reducedMotion ? .3 : 1;
  const ceremonyTimes = {
    DARKEN: 0, SPIRIT_APPEARS: 1250, TREE_FORMING: 2350,
    STAR_FORMING: 6750, STAR_BURST: 8250, MESSAGE_REVEAL: 9000,
    GIFT_SECTION: 11700,
  };
  let selectedGift = -1;
  let giftRevealStarted = 0;
  const giftScenes = new Set(giftScenePaths);
  let giftSectionElement = null;
  let giftAnchorElements = [];

  function giftWorldPoint(clientX, clientY, z = -6.4) {
    const rayPoint = new THREE.Vector3(
      (clientX / window.innerWidth) * 2 - 1,
      1 - (clientY / window.innerHeight) * 2,
      .5,
    ).unproject(camera);
    const direction = rayPoint.sub(camera.position).normalize();
    const distance = (z - camera.position.z) / direction.z;
    return camera.position.clone().addScaledVector(direction, distance);
  }

  function updateGiftLayout() {
    if (!giftSectionElement) return;
    const root = canvas.closest(".christmas-world");
    const bounds = giftSectionElement.getBoundingClientRect();
    const inViewport = bounds.bottom > 0 && bounds.top < window.innerHeight
      && bounds.right > 0 && bounds.left < window.innerWidth;
    const clipTop = inViewport ? THREE.MathUtils.clamp(bounds.top, 0, window.innerHeight) : window.innerHeight;
    const clipRight = inViewport ? THREE.MathUtils.clamp(window.innerWidth - bounds.right, 0, window.innerWidth) : 0;
    const clipBottom = inViewport ? THREE.MathUtils.clamp(window.innerHeight - bounds.bottom, 0, window.innerHeight) : 0;
    const clipLeft = inViewport ? THREE.MathUtils.clamp(bounds.left, 0, window.innerWidth) : 0;
    root?.style.setProperty("--gift-clip-top", `${clipTop}px`);
    root?.style.setProperty("--gift-clip-right", `${clipRight}px`);
    root?.style.setProperty("--gift-clip-bottom", `${clipBottom}px`);
    root?.style.setProperty("--gift-clip-left", `${clipLeft}px`);
    if (inViewport && !giftScenes.has(activePath)) {
      activePath = giftScenePaths[0];
      focus = 0;
    }
    const visible = giftScenes.has(activePath) && inViewport;
    giftStage.visible = visible;
    root?.classList.toggle("is-gifts-front", visible);

    const smallScreen = window.innerWidth <= 850;
    const scale = smallScreen ? .23 : .32;
    gifts.forEach((gift, index) => {
      const anchor = giftAnchorElements[index];
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const point = giftWorldPoint(rect.left + rect.width / 2, rect.top + (smallScreen ? 24 : 30), gift.userData.baseZ);
      gift.userData.layoutX = point.x;
      gift.userData.layoutY = point.y;
      gift.userData.baseScale = scale;
      gift.scale.setScalar(scale);
    });
    if (reducedMotion) {
      gifts.forEach((gift) => {
        gift.position.set(gift.userData.layoutX, gift.userData.layoutY, gift.userData.baseZ);
        gift.scale.setScalar(gift.userData.baseScale ?? (smallScreen ? .23 : .32));
      });
      renderOnce();
    }
  }

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
    treeCenter.position.set(0, .08, 0);
    const treeScale = .34 * Math.sqrt(Math.min(camera.aspect / 1.6, 1));
    treeCenter.scale.setScalar(treeScale);
    gifts.forEach((gift, index) => {
      gift.position.set(gift.userData.layoutX, gift.userData.layoutY, gift.userData.baseZ);
      gift.scale.setScalar(gift.userData.baseScale ?? (window.innerWidth > 850 ? .5 : .3));
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
    updateGiftLayout();
    phase = selected * 1.8 + performance.now() * .0002;
    if (reducedMotion) {
      for (const [key, layer] of layers) layer.material.uniforms.uOpacity.value = key === activePath ? (giftScenes.has(key) ? 0 : 1) : 0;
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
      const target = path === activePath && layer.loaded ? (giftScenes.has(path) ? 0 : 1) : 0;
      const current = layer.material.uniforms.uOpacity.value;
      layer.material.uniforms.uOpacity.value = THREE.MathUtils.damp(current, target, 1.8, delta);
    }
    if (ceremonyActive) {
      const elapsed = (time - ceremonyStarted) / ceremonyScale;
      const stage = elapsed >= ceremonyTimes.GIFT_SECTION ? "GIFT_SECTION"
        : elapsed >= ceremonyTimes.MESSAGE_REVEAL ? "MESSAGE_REVEAL"
        : elapsed >= ceremonyTimes.STAR_BURST ? "STAR_BURST"
        : elapsed >= ceremonyTimes.STAR_FORMING ? "STAR_FORMING"
        : elapsed >= ceremonyTimes.TREE_FORMING ? "TREE_FORMING"
        : elapsed >= ceremonyTimes.SPIRIT_APPEARS ? "SPIRIT_APPEARS" : "DARKEN";
      if (stage !== ceremonyState) {
        ceremonyState = stage;
        ceremonyOnState?.(stage);
      }

      const shadeIn = eased(elapsed / 1250);
      const flash = elapsed >= ceremonyTimes.STAR_BURST
        ? Math.exp(-Math.max(0, elapsed - ceremonyTimes.STAR_BURST) / 800) * .16 : 0;
      ceremonyShade.material.opacity = Math.min(.91, shadeIn * .91) - flash;

      // The spirit gathers from a soft core and orbiting particles, then lends
      // its energy to the tree rather than travelling along a drawn contour.
      const spiritIn = eased((elapsed - 500) / 1500);
      const spiritFade = 1 - eased((elapsed - 1950) / 800);
      spiritCore.material.opacity = spiritIn * spiritFade * .95;
      spiritHalo.material.opacity = spiritIn * spiritFade * .48;
      const spiritPulse = .94 + Math.sin(time * .0022) * .045;
      spiritGroup.scale.setScalar(spiritPulse * (.68 + spiritIn * .32));
      spiritGroup.position.y = THREE.MathUtils.lerp(-1.95, -1.38, eased((elapsed - 1350) / 900));
      spiritGroup.position.x = Math.sin(time * .00055) * .1;
      spiritOrbitMat.opacity = spiritIn * spiritFade * .94;
      for (let index = 0; index < spiritOrbitCount; index += 1) {
        const a = index * 2.399 + time * .00034;
        const r = .28 + (index % 8) * .047;
        const offset = index * 3;
        spiritOrbitPositions[offset] = Math.cos(a) * r;
        spiritOrbitPositions[offset + 1] = Math.sin(a * 1.19) * .82;
        spiritOrbitPositions[offset + 2] = Math.sin(a) * r * .42;
      }
      spiritOrbitGeo.attributes.position.needsUpdate = true;

      // Stable, eased instance transforms let the crown of the tree grow in
      // layered boughs. Nothing is randomized from frame to frame.
      const foliageProgress = eased((elapsed - ceremonyTimes.TREE_FORMING) / 3300);
      for (let index = 0; index < branchLayout.length; index += 1) {
        const branch = branchLayout[index];
        const reveal = eased((foliageProgress - branch.progress * .7) / .22);
        const amount = Math.max(.001, reveal);
        branchScale.set(branch.boughScale.x * amount, branch.boughScale.y * amount, branch.boughScale.z * amount);
        branchMatrix.compose(branch.boughPosition, branch.boughQuaternion, branchScale);
        boughs.setMatrixAt(index, branchMatrix);
      }
      boughs.instanceMatrix.needsUpdate = true;
      const trunkIn = eased((elapsed - 2950) / 1000);
      trunk.material.opacity = trunkIn;
      trunk.scale.y = Math.max(.001, trunkIn);
      trunk.position.y = -1.31 - .38 * (1 - trunkIn) * .5;

      // A slow golden helix is made of luminous motes with stable destinations.
      const streamIn = eased((elapsed - 1600) / 1000) * (1 - eased((elapsed - 6050) / 550));
      energyMaterial.opacity = streamIn * .75;
      for (let index = 0; index < energyCount; index += 1) {
        const progress = index / energyCount;
        const angle = progress * Math.PI * 9 + time * .00042;
        const radius = .12 + (1 - progress) * 1.62;
        const offset = index * 3;
        energyPositions[offset] = Math.cos(angle) * radius;
        energyPositions[offset + 1] = -1.43 + progress * 3.18;
        energyPositions[offset + 2] = Math.sin(angle) * radius * .48;
      }
      energyGeometry.attributes.position.needsUpdate = true;

      const treeComplete = eased((elapsed - 5300) / 900);
      const starIn = eased((elapsed - ceremonyTimes.STAR_FORMING) / 980) * treeComplete;
      treeStar.material.opacity = starIn;
      treeStar.scale.setScalar(.01 + starIn * .99);
      treeStar.rotation.y = Math.sin(time * .0008) * .12;
      treeStar.rotation.z = Math.sin(time * .0006) * .045;
      starGlowMaterial.opacity = starIn * (.4 + Math.sin(time * .003) * .12);
      starGlow.scale.setScalar(1.1 + starIn * .5);
      bulbGlow.intensity = 5 + starIn * (12 + Math.sin(time * .003) * 3);

      const lightsOn = eased((elapsed - ceremonyTimes.STAR_FORMING) / 400);
      for (let index = 0; index < bulbLayout.length; index += 1) {
        const bulb = bulbLayout[index];
        const progress = eased((elapsed - (ceremonyTimes.STAR_FORMING + bulb.reveal * 650)) / 480) * lightsOn;
        const twinkle = reducedMotion ? 1 : .92 + .08 * Math.sin(time * .002 + index * 1.73);
        bulbDummy.position.copy(bulb.position);
        bulbDummy.scale.setScalar(Math.max(.001, bulb.scale * progress * twinkle));
        bulbDummy.updateMatrix();
        lightBulbs.setMatrixAt(index, bulbDummy.matrix);
      }
      lightBulbs.instanceMatrix.needsUpdate = true;
      const ornamentReveal = eased((elapsed - ceremonyTimes.STAR_FORMING + 2400) / 1800);
      for (let index = 0; index < ornamentLayout.length; index += 1) {
        const ornament = ornamentLayout[index];
        const reveal = eased((elapsed - (ceremonyTimes.STAR_FORMING + ornament.progress * 420)) / 600) * ornamentReveal;
        bulbDummy.position.copy(ornament.position);
        bulbDummy.scale.setScalar(Math.max(.001, ornament.scale * reveal));
        bulbDummy.updateMatrix();
        ornaments.setMatrixAt(index, bulbDummy.matrix);
      }
      ornaments.instanceMatrix.needsUpdate = true;
      garland.material.opacity = eased((elapsed - 4300) / 2100) * .9;

      const burstAge = (elapsed - ceremonyTimes.STAR_BURST) / 1000;
      if (burstAge >= 0) {
        if (!burstStarted) {
          burstStarted = true;
          burstPositions.fill(0);
          burstGeometry.attributes.position.needsUpdate = true;
        }
        const burstFade = 1 - eased((burstAge - .16) / 2.1);
        burstMaterial.opacity = burstFade * .96;
        for (let index = 0; index < burstCount; index += 1) {
          const velocity = burstVelocity[index];
          const travel = Math.max(0, burstAge) * Math.exp(-.48 * Math.max(0, burstAge));
          const offset = index * 3;
          burstPositions[offset] = velocity.x * travel;
          burstPositions[offset + 1] = velocity.y * travel;
          burstPositions[offset + 2] = velocity.z * travel;
        }
        burstGeometry.attributes.position.needsUpdate = true;
        const wave = eased((burstAge - .03) / .8);
        shockwave.scale.setScalar(.01 + wave * 8);
        shockwave.material.opacity = (1 - wave) * .48;
      }
      treeCenter.rotation.y = Math.sin(time * .00028) * .025;

      if (stage === "GIFT_SECTION") {
        ceremonyActive = false;
        ceremonyResolve?.();
        ceremonyResolve = null;
      }
    }
    gifts.forEach((gift, index) => {
      const selected = index === selectedGift;
      gift.position.x = THREE.MathUtils.damp(gift.position.x, gift.userData.layoutX, 5, delta);
      gift.position.y = THREE.MathUtils.damp(gift.position.y, gift.userData.layoutY, 3.5, delta);
      gift.position.z = THREE.MathUtils.damp(gift.position.z, gift.userData.baseZ + (selected ? 1.05 : 0), 2.2, delta);
      gift.rotation.y = THREE.MathUtils.damp(gift.rotation.y, selected ? -.12 : (index - 1) * .045, 2, delta);
      const baseScale = gift.userData.baseScale ?? (window.innerWidth > 850 ? .32 : .23);
      const targetScale = baseScale * (selected ? 1.2 : 1);
      const scale = THREE.MathUtils.damp(gift.scale.x, targetScale, 2.5, delta);
      gift.scale.setScalar(scale);
      gift.userData.lidPivot.rotation.x = THREE.MathUtils.damp(gift.userData.lidPivot.rotation.x, selected ? -1.06 : 0, 3, delta);
      gift.userData.giftGlow.material.opacity = THREE.MathUtils.damp(gift.userData.giftGlow.material.opacity, selected ? .48 : 0, 3, delta);
      const glowScale = THREE.MathUtils.damp(gift.userData.giftGlow.scale.x, selected ? 2.3 : .01, 3, delta);
      gift.userData.giftGlow.scale.setScalar(glowScale);
      const revealTarget = selected ? 1 : 0;
      gift.userData.reveal = THREE.MathUtils.damp(gift.userData.reveal, revealTarget, selected ? 1.5 : 3, delta);
      const particleFade = Math.min(1, (time - giftRevealStarted) / 700);
      gift.userData.giftParticles.material.opacity = gift.userData.reveal * particleFade * .9;
      const positions = gift.userData.particlePositions;
      for (let particle = 0; particle < gift.userData.particleAngles.length; particle += 1) {
        const cycle = (time * .00022 + gift.userData.particleOffsets[particle]) % 1;
        const angle = gift.userData.particleAngles[particle] + time * .00016;
        const radius = .12 + cycle * .62;
        const offset = particle * 3;
        positions[offset] = Math.cos(angle) * radius;
        positions[offset + 1] = .06 + cycle * (1.65 + (particle % 4) * .13);
        positions[offset + 2] = Math.sin(angle) * radius;
      }
      gift.userData.particleGeometry.attributes.position.needsUpdate = true;
    });
    candle.intensity = 31 + Math.sin(time * .0011 + phase) * 6;
    driftParticles(snow, delta, time);
    driftParticles(glimmers, delta, time * .64);
    if (ceremonyActive) driftParticles(ceremonySnow, delta, time * .8);
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
  window.addEventListener("resize", updateGiftLayout, { passive: true });
  window.addEventListener("scroll", updateGiftLayout, { passive: true });
  window.addEventListener("pointermove", pointerMove, { passive: true });
  window.addEventListener("blur", pointerLeave);
  document.addEventListener("visibilitychange", visibilityChange);
  resize();
  setScene(activePath);
  if (!reducedMotion) wake(); else reducedRender();

  return {
    setScene,
    setGiftAnchors(section, anchors) {
      giftSectionElement = section;
      giftAnchorElements = anchors;
      updateGiftLayout();
    },
    giftScreenPosition(index) {
      const gift = gifts[index];
      if (!gift) return null;
      const point = gift.localToWorld(new THREE.Vector3(0, .12, .08));
      point.project(camera);
      return { x: point.x * window.innerWidth / 2, y: -point.y * window.innerHeight / 2 };
    },
    selectGift(index) {
      selectedGift = index;
      updateGiftLayout();
      giftRevealStarted = performance.now();
      ceremonyState = "GIFT_INTERACTION";
      ceremonyOnState?.("GIFT_INTERACTION");
    },
    playGreeting(onState = null) {
      treeCenter.visible = true;
      trunk.material.opacity = 0;
      treeStar.material.opacity = 0;
      trunk.scale.y = .001;
      const initialMatrix = new THREE.Matrix4().makeScale(.001, .001, .001);
      for (let index = 0; index < branchLayout.length; index += 1) boughs.setMatrixAt(index, initialMatrix);
      boughs.instanceMatrix.needsUpdate = true;
      for (let index = 0; index < bulbLayout.length; index += 1) {
        bulbDummy.position.copy(bulbLayout[index].position);
        bulbDummy.scale.setScalar(.001);
        bulbDummy.updateMatrix();
        lightBulbs.setMatrixAt(index, bulbDummy.matrix);
      }
      lightBulbs.instanceMatrix.needsUpdate = true;
      for (let index = 0; index < ornamentLayout.length; index += 1) ornaments.setMatrixAt(index, initialMatrix);
      ornaments.instanceMatrix.needsUpdate = true;
      garland.material.opacity = 0;
      spiritCore.material.opacity = 0;
      spiritHalo.material.opacity = 0;
      spiritOrbitMat.opacity = 0;
      energyMaterial.opacity = 0;
      burstMaterial.opacity = 0;
      shockwave.material.opacity = 0;
      starGlowMaterial.opacity = 0;
      starGlow.scale.setScalar(.001);
      treeStar.scale.setScalar(.01);
      burstPositions.fill(0);
      burstGeometry.attributes.position.needsUpdate = true;
      burstStarted = false;
      ceremonyShade.material.opacity = 0;
      ceremonyStarted = performance.now();
      ceremonyActive = true;
      ceremonyState = "IDLE";
      ceremonyOnState = onState;
      if (!frame) frame = requestAnimationFrame(draw);
      return new Promise((resolve) => { ceremonyResolve = resolve; });
    },
    endGreeting() {
      treeCenter.visible = false;
      ceremonyShade.material.opacity = 0;
      ceremonyActive = false;
      ceremonyOnState = null;
      renderOnce();
    },
    setSnowPaused(value) { snowPaused = Boolean(value); },
    dispose() {
      disposed = true;
      sleep();
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", updateGiftLayout);
      window.removeEventListener("scroll", updateGiftLayout);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("blur", pointerLeave);
      document.removeEventListener("visibilitychange", visibilityChange);
      for (const layer of layers.values()) {
        layer.mesh.geometry.dispose();
        layer.material.dispose();
        layer.texture?.dispose();
      }
      gifts.forEach((gift) => gift.userData.wraps.forEach((texture) => texture.dispose()));
      snow.geometry.dispose(); snow.points.material.dispose();
      glimmers.geometry.dispose(); glimmers.points.material.dispose();
      ceremonySnow.geometry.dispose(); ceremonySnow.points.material.dispose();
      const disposedGeometries = new Set();
      const disposedMaterials = new Set();
      scene.traverse((object) => {
        if (object.geometry && !disposedGeometries.has(object.geometry)) {
          disposedGeometries.add(object.geometry);
          object.geometry.dispose();
        }
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.filter(Boolean).forEach((material) => {
          if (!disposedMaterials.has(material)) { disposedMaterials.add(material); material.dispose(); }
        });
      });
      particleTexture.dispose();
      renderer.dispose();
    },
  };
}
