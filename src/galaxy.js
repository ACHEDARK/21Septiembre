import * as THREE from "three";
import { CONFIG, qualitySettings } from "./config.js";
const random = (a, b) => a + Math.random() * (b - a);
const smooth = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
function texture(kind = 0) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.translate(128, 128);
  if (kind === -1) {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 128);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.08, "#ffffff");
    g.addColorStop(0.25, "#ffffff55");
    g.addColorStop(1, "#ffffff00");
    ctx.fillStyle = g;
    ctx.fillRect(-128, -128, 256, 256);
  } else if (kind === 2) {
    const g = ctx.createLinearGradient(0, -90, 0, 90);
    g.addColorStop(0, "#fff2a6");
    g.addColorStop(1, "#ba7c26");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -105);
    ctx.bezierCurveTo(-85, -20, -32, 85, 0, 107);
    ctx.bezierCurveTo(85, 15, 32, -75, 0, -105);
    ctx.fill();
  } else {
    const petals = kind === 1 ? 9 : 19;
    for (let layer = 1; layer >= 0; layer--)
      for (let i = 0; i < petals; i++) {
        ctx.save();
        ctx.rotate((i / petals) * Math.PI * 2 + layer * 0.13);
        const g = ctx.createLinearGradient(0, -20, 0, -102);
        g.addColorStop(0, "#95601d");
        g.addColorStop(0.45, CONFIG.colors.flower);
        g.addColorStop(1, kind === 1 ? "#fff1ad" : "#ffe885");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(-7, -24);
        ctx.bezierCurveTo(-33, -65, -16, -106, 0, -111 + layer * 11);
        ctx.bezierCurveTo(22, -92, 27, -53, 7, -24);
        ctx.fill();
        ctx.strokeStyle = "#a96b2440";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -29);
        ctx.quadraticCurveTo(-3, -60, 0, -96);
        ctx.stroke();
        ctx.restore();
      }
    const core = ctx.createRadialGradient(-8, -9, 1, 0, 0, 34);
    core.addColorStop(0, "#8e672e");
    core.addColorStop(0.7, "#38250e");
    core.addColorStop(1, "#ae7830");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, kind === 1 ? 22 : 34, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 380; i++) {
      const r = Math.sqrt(Math.random()) * (kind === 1 ? 20 : 31),
        a = i * 2.399;
      ctx.fillStyle = i % 3 ? "#cc984d90" : "#1c150bc0";
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 0.8, 0, 7);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
export class Galaxy {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor("#050505");
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 180);
    this.camera.position.set(0, 0, 25);
    this.pointer = new THREE.Vector2(5, 5);
    this.raycaster = new THREE.Raycaster();
    this.quality = qualitySettings();
    this.time = 0;
    this.mode = "intro";
    this.textures = [texture(0), texture(1), texture(-1), texture(2)];
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.flowerGroup = new THREE.Group();
    this.scene.add(this.flowerGroup);
    this.bursts = [];
    this.createStars();
    this.resize();
  }
  createStars() {
    const positions = [],
      colors = [];
    for (let i = 0; i < 1400; i++) {
      positions.push(random(-55, 55), random(-34, 34), random(-70, -8));
      const c = random(0.12, 0.8);
      colors.push(c, c * 0.79, c * 0.46);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    this.stars = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.045,
        vertexColors: true,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
      }),
    );
    this.scene.add(this.stars);
  }
  clear() {
    for (const group of [this.group, this.flowerGroup]) {
      while (group.children.length) {
        const child = group.children[0];
        group.remove(child);
        child.geometry?.dispose();
        child.material?.dispose();
      }
    }
    for (const b of this.bursts) {
      this.scene.remove(b.mesh);
      b.mesh.geometry.dispose();
      b.mesh.material.dispose();
    }
    this.bursts = [];
  }
  start(special, name) {
    this.clear();
    this.special = special;
    this.time = 0;
    this.mode = "galaxy";
    this.quality = qualitySettings();
    this.name = name;
    const count = Math.floor(
      CONFIG.galaxyParticles * this.quality.factor * (special ? 1 : 0.78),
    );
    this.count = count;
    const positions = new Float32Array(count * 3),
      seeds = new Float32Array(count),
      targets = new Float32Array(count * 3);
    const points = this.namePoints(name);
    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), i % 4 === 0 ? 2.8 : 0.64) * 10.8,
        a =
          ((i % 5) / 5) * Math.PI * 2 +
          r * 0.66 +
          random(-0.38, 0.38) * (r / 10 + 0.2);
      positions.set(
        [Math.cos(a) * r, random(-0.36, 0.36) * (1 - r / 13), Math.sin(a) * r],
        i * 3,
      );
      seeds[i] = Math.random();
      const p = points[Math.floor((i / count) * points.length)];
      targets.set(
        [
          p.x + random(-0.014, 0.014),
          p.y + random(-0.014, 0.014),
          random(-0.07, 0.07),
        ],
        i * 3,
      );
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute("target", new THREE.BufferAttribute(targets, 3));
    this.uniforms = {
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uMorph: { value: 0 },
      uBloom: { value: 0 },
      uFade: { value: 1 },
      uSpread: { value: 0 },
      uSpeed: { value: special ? 0.045 : 0.075 },
      uNameScale: { value: 1 },
      uDpr: { value: 1 },
      uPointer: { value: new THREE.Vector2(99, 99) },
      uInner: { value: new THREE.Color(CONFIG.colors.inner) },
      uOuter: { value: new THREE.Color(CONFIG.colors.outer) },
      uGlow: { value: CONFIG.glow },
    };
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `attribute float seed;attribute vec3 target;uniform float uTime,uReveal,uMorph,uBloom,uSpread,uSpeed,uDpr,uNameScale;uniform vec2 uPointer;varying float vSeed,vRadius,vVisible;void main(){vSeed=seed;float r=length(position.xz);vRadius=r/11.;float a=atan(position.z,position.x)+uTime*uSpeed/(.45+r*.14);vec3 p=vec3(cos(a)*r,position.y,sin(a)*r);float flowerR=r*(.74+.23*cos(a*5.));p.x=mix(p.x,cos(a)*flowerR,uBloom);p.z=mix(p.z,sin(a)*flowerR,uBloom);p=vec3(p.x,p.y*.91-p.z*.42,p.y*.42+p.z*.91);p.xy+=normalize(p.xy-uPointer+vec2(.0001))*exp(-length(p.xy-uPointer)*1.2)*.35;p=mix(p,target*uNameScale,uMorph);p*=1.+uSpread*(1.+seed*2.);p.z+=uSpread*(seed-.5)*14.;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((2.0+seed*3.8)*uDpr*20./-mv.z,1.,8.);vVisible=step(seed,uReveal);}`,
      fragmentShader: `uniform vec3 uInner,uOuter;uniform float uTime,uFade,uGlow;varying float vSeed,vRadius,vVisible;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;float glow=exp(-d*d*5.);vec3 color=mix(uInner,uOuter,clamp(vRadius,0.,1.));float flicker=.72+.28*sin(uTime*(.5+vSeed)+vSeed*70.);gl_FragColor=vec4(color*1.6,glow*flicker*vVisible*uFade*(.5+uGlow*.5));}`,
    });
    this.particles = new THREE.Points(geo, material);
    this.particles.frustumCulled = false;
    this.group.add(this.particles);
    this.glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.textures[2],
        color: 0xffd485,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.glow.scale.set(10, 4, 1);
    this.group.add(this.glow);
    this.flowers = [];
    const flowerCount = Math.floor(
      CONFIG.flowerCount * this.quality.flowers * (special ? 1 : 1.2),
    );
    for (let i = 0; i < flowerCount; i++) {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.textures[
            i > 0 && i % 7 === 0 ? 3 : !special && i % 3 === 0 ? 1 : 0
          ],
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      );
      // Cada flor nace sobre uno de los brazos, en vez de flotar como un
      // adorno separado: comparte radio y fase con el polvo estelar.
      const r = random(2.7, 10.6),
        arm = i % 5,
        a = (arm / 5) * Math.PI * 2 + r * 0.66 + random(-0.22, 0.22);
      sprite.userData = {
        angle: a,
        r,
        arm,
        size: i === 0 ? 0.105 : random(0.16, 0.65),
        phase: random(0, 6),
        hidden: i === 0,
        born: false,
        index: i,
      };
      this.flowers.push(sprite);
      this.flowerGroup.add(sprite);
    }
    this.starMarkers = [];
    const starCount = special ? 15 : 10;
    for (let i = 0; i < starCount; i++) {
      const star = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.textures[2],
          color: i % 3 === 0 ? 0xfff1a7 : 0xffcb4d,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      const angle = (i / starCount) * Math.PI * 2;
      const starColors = [0xffd866, 0x79baff, 0xd09aff, 0xff8c9e, 0x72e8b0];
      star.userData = {
        interactiveStar: true,
        angle,
        radius: 4.5 + (i % 4) * 1.7,
        phase: i * 1.4,
        speed: 0.025 + (i % 4) * 0.009,
        color: starColors[i % starColors.length],
        secretType: ["heart", "comet", "rain", "constellation"][i % 4],
      };
      star.material.color.setHex(star.userData.color);
      star.position.set(
        Math.cos(angle) * star.userData.radius,
        Math.sin(angle) * 3.2,
        -1.5 + (i % 3),
      );
      this.starMarkers.push(star);
      this.flowerGroup.add(star);
    }
    this.hero = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.textures[0],
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    this.hero.position.z = 3.4;
    this.flowerGroup.add(this.hero);
    // Escena reservada para el último verso: una flor central y pétalos que
    // aparecen alrededor de ella como una pequeña celebración.
    this.finalPetals = [];
    for (let i = 0; i < 18; i++) {
      const petal = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.textures[i % 5 === 0 ? 1 : 0],
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      petal.userData = {
        angle: (i / 18) * Math.PI * 2,
        radius: 2.4 + (i % 3) * 1.25,
        phase: i * 0.7,
      };
      this.finalPetals.push(petal);
      this.flowerGroup.add(petal);
    }
    this.fireworkStage = -1;
    this.resize();
  }
  setConstellation(text, offsetY = 0) {
    const points = this.namePoints(text, false);
    const target = this.particles.geometry.attributes.target;
    for (let i = 0; i < target.count; i++) {
      const point = points[Math.floor((i / target.count) * points.length)];
      target.setXYZ(
        i,
        point.x + random(-0.012, 0.012),
        point.y + offsetY + random(-0.012, 0.012),
        random(-0.04, 0.04),
      );
    }
    target.needsUpdate = true;
  }
  namePoints(name, uppercase = true) {
    const c = document.createElement("canvas");
    c.width = 1200;
    c.height = 400;
    const ctx = c.getContext("2d");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let size = 160;
    ctx.font = `500 ${size}px Georgia`;
    const lines = (uppercase ? name.toLocaleUpperCase("es") : name).split("\n");
    size *= Math.min(
      1,
      1100 / Math.max(...lines.map((line) => ctx.measureText(line).width)),
    );
    ctx.font = `500 ${size}px Georgia`;
    lines.forEach((line, index) =>
      ctx.fillText(
        line,
        600,
        200 + (index - (lines.length - 1) / 2) * size * 1.4,
      ),
    );
    const data = ctx.getImageData(0, 0, 1200, 400).data,
      points = [];
    for (let y = 0; y < 400; y += 2)
      for (let x = 0; x < 1200; x += 2)
        if (data[(y * 1200 + x) * 4 + 3] > 120)
          points.push({ x: (x - 600) / 65, y: (200 - y) / 65 + 1 });
    return points.length ? points : [{ x: 0, y: 0 }];
  }
  resize() {
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.quality.dpr));
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    if (this.uniforms) {
      this.uniforms.uDpr.value = this.renderer.getPixelRatio();
      this.uniforms.uNameScale.value = innerWidth < 600 ? 0.65 : 1;
    }
    this.baseDistance = innerWidth < 600 ? 37 : 25;
  }
  move(x, y) {
    this.pointer.set((x / innerWidth) * 2 - 1, (-y / innerHeight) * 2 + 1);
    if (this.uniforms)
      this.uniforms.uPointer.value.set(
        this.pointer.x * 14,
        this.pointer.y * 10,
      );
  }
  hit(x, y) {
    this.move(x, y);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster.intersectObjects(
      [...this.flowers, ...(this.starMarkers || [])].filter(
        (f) => f.material.opacity > 0.3,
      ),
    )[0]?.object;
  }
  burst(position = new THREE.Vector3(), options = {}) {
    if (this.bursts.length > 24) return;
    const p = [],
      v = [];
    const count = options.count || 100;
    for (let i = 0; i < count; i++) {
      p.push(position.x, position.y, position.z);
      if (options.shape === "heart") {
        const theta = (i / count) * Math.PI * 2;
        const x = 16 * Math.sin(theta) ** 3;
        const y =
          13 * Math.cos(theta) -
          5 * Math.cos(2 * theta) -
          2 * Math.cos(3 * theta) -
          Math.cos(4 * theta);
        v.push(x * 0.12, y * 0.12, random(-0.18, 0.18));
      } else if (options.shape === "comet") {
        v.push(random(1.2, 3.2), random(-0.45, 0.45), random(-0.2, 0.2));
      } else if (options.firework) {
        const angle = (i / count) * Math.PI * 2 + random(-0.06, 0.06);
        const speed = random(1.4, 3.2);
        v.push(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          random(-0.2, 0.2),
        );
      } else v.push(random(-1, 1), random(-1, 1), random(-1, 1));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    const mesh = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: options.color || 0xffda79,
        size: options.firework ? 0.105 : 0.045,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.scene.add(mesh);
    this.bursts.push({
      mesh,
      v,
      age: 0,
      duration: options.duration || 2.7,
      firework: !!options.firework,
    });
  }
  update(dt, elapsed, finalAge = -1, dedication = null) {
    this.time += dt * CONFIG.speed;
    const t = this.time;
    this.stars.rotation.z = t * 0.001;
    this.stars.material.opacity = this.mode === "intro" ? 0.2 : 0.65;
    if (this.mode !== "intro") {
      this.uniforms.uTime.value = CONFIG.autoRotate ? t : 0;
      this.uniforms.uReveal.value = dedication
        ? 1
        : smooth(0.8, this.special ? 10 : 7, elapsed);
      const lastDedication = dedication?.index === 8;
      const morph = dedication
        ? smooth(0, 2.8, dedication.age) *
          (1 -
            smooth(dedication.seconds - 2, dedication.seconds, dedication.age))
        : finalAge < 0
          ? 0
          : smooth(0, 6, finalAge);
      this.uniforms.uMorph.value = morph;
      this.uniforms.uBloom.value =
        finalAge < 0 && !dedication
          ? smooth(16, 23, elapsed) * (1 - smooth(31, 38, elapsed))
          : 0;
      this.uniforms.uSpread.value =
        finalAge > 26 ? smooth(26, 36, finalAge) * 2 : 0;
      this.uniforms.uFade.value = 1 - smooth(27, 37, finalAge);
      this.glow.material.opacity = lastDedication
        ? 1.15 * smooth(0, 3, dedication.age)
        : smooth(2, 11, elapsed) * 0.75 * CONFIG.glow * (1 - morph);
      this.glow.material.rotation = Math.sin(t * 0.08) * 0.08;
      this.flowers.forEach((f) => {
        const d = f.userData,
          a = d.angle + t * (this.special ? 0.025 : 0.043),
          reveal = smooth(7 + d.index * 0.055, 11 + d.index * 0.055, elapsed);
        f.position.set(
          Math.cos(a) * d.r,
          Math.sin(a) * d.r * 0.42 + Math.sin(t * 0.35 + d.phase) * 0.25,
          Math.sin(a) * 2.5 + Math.sin(t * 0.2 + d.phase) * 0.55,
        );
        const dx = f.position.x - this.pointer.x * 14,
          dy = f.position.y - this.pointer.y * 10,
          dist = Math.hypot(dx, dy);
        if (dist < 2) {
          f.position.x += dx * 0.15;
          f.position.y += dy * 0.15;
        }
        f.scale.setScalar(
          d.size * reveal * (1 + Math.sin(t * 0.3 + d.phase) * 0.12),
        );
        f.material.rotation = a * 0.3;
        f.material.opacity = reveal * (1 - morph) * 0.9;
        if (reveal > 0.7 && !d.born) {
          d.born = true;
          if (d.index % 9 === 0) this.burst(f.position);
        }
      });
      (this.starMarkers || []).forEach((star) => {
        const d = star.userData;
        const orbitAngle = d.angle + t * d.speed;
        star.position.set(
          Math.cos(orbitAngle) * d.radius,
          Math.sin(orbitAngle) * d.radius * 0.48,
          -2.8 + Math.cos(orbitAngle * 2 + d.phase) * 1.4,
        );
        star.material.opacity =
          smooth(3, 8, elapsed) * (0.72 + 0.28 * Math.sin(t * 1.5 + d.phase));
        star.scale.setScalar(
          0.62 + Math.max(0, Math.sin(t * 1.2 + d.phase)) * 0.2,
        );
        star.material.rotation = t * (d.phase % 2 ? -0.18 : 0.18);
      });
      const opening =
        dedication && lastDedication
          ? smooth(0, 3.5, dedication.age) *
            (1 - smooth(12, 15, dedication.age))
          : dedication
            ? 0
            : finalAge < 0
              ? smooth(21, 28, elapsed) * (1 - smooth(34, 41, elapsed))
              : smooth(31, 37, finalAge) * (1 - smooth(46, 51, finalAge));
      this.hero.position.y = lastDedication ? 2.8 : 0;
      this.hero.material.opacity = opening;
      this.hero.scale.setScalar(
        (lastDedication ? 7.4 : finalAge < 0 ? 2.7 : 2.1) * opening,
      );
      this.hero.material.rotation = Math.sin(t * 0.15) * 0.06;
      this.finalPetals.forEach((petal, index) => {
        const d = petal.userData;
        const bloom = lastDedication
          ? smooth(1, 5, dedication.age) * (1 - smooth(12, 15, dedication.age))
          : 0;
        const angle = d.angle + t * (index % 2 ? -0.08 : 0.06);
        const radius =
          d.radius * (0.45 + bloom * 1.25) + Math.sin(t + d.phase) * 0.12;
        petal.position.set(
          Math.cos(angle) * radius,
          2.8 + Math.sin(angle) * radius * 0.75,
          1.2 + Math.sin(angle) * 0.8,
        );
        petal.scale.setScalar(bloom * (0.5 + (index % 4) * 0.1));
        petal.material.opacity = bloom * 0.8;
        petal.material.rotation = angle + Math.PI / 2;
      });
      if (lastDedication) {
        const stage =
          dedication.age > 10
            ? 2
            : dedication.age > 4
              ? 1
              : dedication.age > 1.5
                ? 0
                : -1;
        if (stage !== this.fireworkStage) {
          this.fireworkStage = stage;
          if (stage === 0) {
            [-6, 0, 6].forEach((x, i) =>
              this.burst(new THREE.Vector3(x, 2 + (i % 2) * 2, -1), {
                firework: true,
                count: 150,
                color: i === 1 ? 0xfff3a4 : 0xffc83d,
                duration: 3.8,
              }),
            );
          } else if (stage === 1) {
            [-8, -4, 4, 8].forEach((x, i) =>
              this.burst(new THREE.Vector3(x, random(0, 6), -1), {
                firework: true,
                count: 130,
                color: i % 2 ? 0xffe88a : 0xffb52e,
                duration: 3.8,
              }),
            );
          } else if (stage === 2) {
            [-9, -5, 0, 5, 9].forEach((x, i) =>
              this.burst(new THREE.Vector3(x, random(1, 7), -1), {
                firework: true,
                count: 120,
                color: i % 2 ? 0xfff6bd : 0xffc334,
                duration: 4.2,
              }),
            );
          }
        }
      }
      if (elapsed > 25 && !this.heroBorn) {
        this.heroBorn = true;
        this.burst(this.hero.position);
      }
      const target =
        this.baseDistance +
        (dedication ? 0 : (1 - smooth(0, 12, elapsed)) * -9) +
        smooth(27, 40, finalAge) * 7;
      this.camera.position.z +=
        (target - this.camera.position.z) * Math.min(1, dt * 1.5);
      const px = Math.abs(this.pointer.x) <= 1 ? this.pointer.x : 0,
        py = Math.abs(this.pointer.y) <= 1 ? this.pointer.y : 0;
      this.camera.position.x +=
        (px * CONFIG.cameraSpeed - this.camera.position.x) * dt * 2;
      this.camera.position.y +=
        (py * CONFIG.cameraSpeed - this.camera.position.y) * dt * 2;
      this.camera.lookAt(0, 0, 0);
    }
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.age += dt;
      const p = b.mesh.geometry.attributes.position;
      for (let j = 0; j < p.array.length; j++) p.array[j] += b.v[j] * dt * 0.8;
      p.needsUpdate = true;
      b.mesh.material.opacity = Math.max(0, 1 - b.age / b.duration);
      if (b.age > b.duration) {
        this.scene.remove(b.mesh);
        b.mesh.geometry.dispose();
        b.mesh.material.dispose();
        this.bursts.splice(i, 1);
      }
    }
    this.renderer.render(this.scene, this.camera);
  }
  reset() {
    this.clear();
    this.mode = "intro";
    this.heroBorn = false;
    this.camera.position.set(0, 0, 25);
  }
}
