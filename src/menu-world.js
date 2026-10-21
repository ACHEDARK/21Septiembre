import * as THREE from "three";

const PAPER = {
  sunflower: { face: "#f1e5c9", edge: "#e4d3ad", ink: "#483b2d", accent: "#b6924f" },
  winter: { face: "#e6eee7", edge: "#cbd9d1", ink: "#31443e", accent: "#64867b" },
  midnight: { face: "#eae6f0", edge: "#d4cddd", ink: "#42394d", accent: "#8879a4" },
  rose: { face: "#f2e2e1", edge: "#dfc7c6", ink: "#54383e", accent: "#b87882" },
  birthday: { face: "#eee3f0", edge: "#d8c6df", ink: "#4a3c50", accent: "#9b78a6" },
};
const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const notes = {
  "flores-amarillas": "Hay detalles que siguen floreciendo en la memoria, incluso cuando cambian las estaciones.",
  navidad: "Ojal\u00e1 esta noche encuentre una forma sencilla de abrigarte el coraz\u00f3n.",
  "ano-nuevo": "Que lo nuevo te trate bonito. Guardo con cari\u00f1o lo que alguna vez compartimos.",
  "san-valentin": "Lo bonito que vivimos sigue teniendo un lugar tranquilo en mi memoria.",
  cumpleanos: "Hoy deseo que la vida te devuelva un poco de toda la luz que has dado.",
};
const W = 760, H = 1020, CARD_W = 2.75, CARD_H = 3.7, CARD_DEPTH = 0.09;
const poses = [
  [-5.3, -0.28, -0.15, -0.035, -0.18, -0.13],
  [0, 0.28, 0.58, 0.025, -0.025, -0.035],
  [-2.65, -0.12, 0.11, -0.015, -0.11, 0.10],
  [2.65, 0.22, 0.13, 0.02, 0.11, -0.09],
  [5.3, -0.3, -0.18, -0.04, 0.18, 0.14],
];

function roundedShape(width, height, radius) {
  const x = -width / 2, y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y); shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius); shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height); shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius); shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const words = text.split(" "); let line = "", lines = 0;
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y); line = word; y += lineHeight; lines++;
      if (lines >= maxLines - 1) break;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, y);
}

function drawIllustration(ctx, kind, x, y, color) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (kind === "sunflower") {
    ctx.beginPath(); ctx.moveTo(0, 55); ctx.bezierCurveTo(-7, 20, 7, -15, 0, -55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 28); ctx.quadraticCurveTo(-35, 5, -42, 18); ctx.quadraticCurveTo(-20, 36, 0, 28); ctx.stroke();
    for (let petal = 0; petal < 8; petal++) { ctx.save(); ctx.rotate(petal * Math.PI / 4); ctx.beginPath(); ctx.ellipse(0, -77, 10, 24, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
  } else if (kind === "winter") {
    ctx.beginPath(); ctx.moveTo(0, 64); ctx.lineTo(0, -64); ctx.stroke();
    for (let level = 0; level < 4; level++) { const yy = -42 + level * 29, span = 49 - level * 8; ctx.beginPath(); ctx.moveTo(0, yy + 20); ctx.lineTo(-span, yy - 17); ctx.moveTo(0, yy + 20); ctx.lineTo(span, yy - 17); ctx.stroke(); }
    [[-27,-19],[26,8],[-15,39],[18,-43]].forEach(([bx,by],i)=>{ctx.beginPath();ctx.arc(bx,by,5+i%2*2,0,Math.PI*2);ctx.fill();});
  } else if (kind === "midnight") {
    ctx.beginPath(); ctx.arc(-9, 0, 42, -1.2, 1.25); ctx.arc(13, -5, 41, 1.45, 4.8, true); ctx.stroke();
    [[-62,-35],[52,-53],[48,43],[-47,47],[4,-69]].forEach(([sx,sy],i)=>{ctx.globalAlpha=.45+i*.1;ctx.beginPath();ctx.moveTo(sx-7,sy);ctx.lineTo(sx+7,sy);ctx.moveTo(sx,sy-7);ctx.lineTo(sx,sy+7);ctx.stroke();});
  } else if (kind === "rose") {
    ctx.beginPath(); ctx.moveTo(0, 52); ctx.bezierCurveTo(5, 15, -4, -14, 0, -40); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 25); ctx.quadraticCurveTo(-38, 5, -39, 24); ctx.quadraticCurveTo(-20, 39, 0, 25); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -39); ctx.bezierCurveTo(-55, -83, -54, -9, 0, 13); ctx.bezierCurveTo(54, -9, 55, -83, 0, -39); ctx.stroke();
  } else {
    ctx.strokeRect(-46, 0, 92, 47); ctx.beginPath(); ctx.moveTo(-52, 0); ctx.lineTo(52, 0); ctx.moveTo(0, 0); ctx.lineTo(0, -46); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,-46); ctx.bezierCurveTo(-18,-61,2,-72,4,-82); ctx.bezierCurveTo(26,-63,13,-50,0,-46);ctx.fill();
    ctx.beginPath();ctx.moveTo(-31,4);ctx.lineTo(-31,44);ctx.moveTo(31,4);ctx.lineTo(31,44);ctx.stroke();
  }
  ctx.restore();
}

function makeTexture(celebration, side = "front", isPreview = false) {
  const palette = PAPER[celebration.tone] || PAPER.sunflower;
  const canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = palette.face; ctx.fillRect(0, 0, W, H);
  let seed = celebration.day * 71 + celebration.month * 29;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 1600; i++) { ctx.fillStyle = random() > .5 ? "rgba(92,70,45,.035)" : "rgba(255,255,255,.13)"; ctx.fillRect(random()*W, random()*H, 1+random()*2, 1+random()*2); }
  ctx.strokeStyle = palette.ink + "36"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(24, 24, W - 48, H - 48, 19); ctx.stroke();
  ctx.fillStyle = palette.accent + "19"; ctx.beginPath();ctx.roundRect(33,33,W-66,H-66,14);ctx.fill();
  if (side === "back") {
    ctx.fillStyle = palette.accent; ctx.font = "500 28px 'DM Sans', sans-serif"; ctx.textAlign = "center";
    ctx.fillText("UNA NOTA PARA TI", W/2, 150);
    ctx.strokeStyle = palette.accent + "88";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W*.37,184);ctx.quadraticCurveTo(W/2,198,W*.63,184);ctx.stroke();
    ctx.fillStyle = palette.ink; ctx.font = "500 48px 'Caveat', cursive";
    wrapText(ctx, notes[celebration.id] || "Guardo este momento con mucho cariño.", W/2, 335, W-130, 65, 7);
    ctx.fillStyle = palette.accent;ctx.font="500 44px 'Caveat', cursive";ctx.fillText("Con cariño, siempre",W/2,790);
    ctx.fillStyle = palette.ink + "a0";ctx.font="500 22px 'DM Sans', sans-serif";
    ctx.fillText(isPreview ? "Toca otra vez para abrir esta sorpresa" : "Cada cosa bonita llega a su tiempo",W/2,915);
  } else {
    ctx.textAlign = "left"; ctx.fillStyle = palette.ink;ctx.font="500 24px 'DM Sans', sans-serif";
    ctx.fillText("UNA FECHA QUE GUARDO",72,100);
    ctx.textAlign="right";ctx.fillStyle=palette.accent;ctx.font="600 28px 'DM Sans', sans-serif";
    ctx.fillText(String(celebration.day).padStart(2,"0")+"  "+monthNames[celebration.month-1].slice(0,3).toUpperCase(),W-72,101);
    ctx.strokeStyle=palette.accent+"70";ctx.beginPath();ctx.moveTo(72,126);ctx.lineTo(W-72,126);ctx.stroke();
    drawIllustration(ctx, celebration.tone, W/2, 340, palette.accent);
    ctx.textAlign="center";ctx.fillStyle=palette.ink;ctx.font="600 84px 'Cormorant Garamond', Georgia, serif";
    wrapText(ctx,celebration.title,W/2,555,W-110,88,2);
    ctx.fillStyle=palette.ink+"d0";ctx.font="400 37px 'DM Sans', sans-serif";
    wrapText(ctx,celebration.description,W/2,700,W-130,48,4);
    ctx.fillStyle=palette.accent;ctx.font="500 36px 'Caveat', cursive";
    ctx.fillText("Para volver cuando quieras",W/2,900);
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace=THREE.SRGBColorSpace; texture.anisotropy=4; texture.needsUpdate=true;
  return texture;
}

function makeCardShadow() {
  const canvas=document.createElement("canvas");canvas.width=256;canvas.height=320;
  const ctx=canvas.getContext("2d");
  const gradient=ctx.createRadialGradient(128,160,12,128,160,150);
  gradient.addColorStop(0,"rgba(8,5,12,.38)");gradient.addColorStop(.48,"rgba(8,5,12,.2)");gradient.addColorStop(1,"rgba(8,5,12,0)");
  ctx.fillStyle=gradient;ctx.fillRect(0,0,256,320);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;return texture;
}

export function createPostcardWorld(canvas, celebrations, isPreview, onOpen) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true, powerPreference:"high-performance", failIfMajorPerformanceCaveat:false }); }
  catch (error) { console.warn("No se pudo abrir el peque\u00f1o mundo 3D:", error); return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.12;
  
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(34,1,.1,80);camera.position.set(0,.55,12.2);camera.lookAt(0,0,0);
  scene.add(new THREE.HemisphereLight(0xffedcf,0x211922,2.15));
  const key=new THREE.DirectionalLight(0xffe4bd,3.1);key.position.set(-3,7,8);scene.add(key);
  const fill=new THREE.PointLight(0x8a718e,32,17,2);fill.position.set(5,1,5);scene.add(fill);
  const warm=new THREE.PointLight(0xf2c77b,25,16,2);warm.position.set(-5,-1,5);scene.add(warm);
  
  const world=new THREE.Group();scene.add(world);
  const cards=[];const shadowTexture=makeCardShadow();const cardShape=roundedShape(CARD_W,CARD_H,.21);
  const geometry=new THREE.ExtrudeGeometry(cardShape,{depth:CARD_DEPTH,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.035,bevelThickness:.035,curveSegments:12});geometry.computeVertexNormals();
  const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();let hovered=null,selected=Math.max(0,celebrations.findIndex(item=>item.id==="navidad")),drag=null,dragged=false,active=false,disposed=false,compact=false;
  celebrations.forEach((celebration,index)=>{
    const palette=PAPER[celebration.tone]||PAPER.sunflower;
    const frontTexture=makeTexture(celebration,"front");const backTexture=makeTexture(celebration,"back",isPreview);
    const board=new THREE.Mesh(geometry,[new THREE.MeshStandardMaterial({color:palette.edge,roughness:.82,metalness:0}),new THREE.MeshStandardMaterial({color:palette.edge,roughness:.7,metalness:0})]);
    board.castShadow=true;board.receiveShadow=true;
    const front=new THREE.Mesh(new THREE.PlaneGeometry(CARD_W-.08,CARD_H-.08),new THREE.MeshStandardMaterial({map:frontTexture,roughness:.89,metalness:0,transparent:true,side:THREE.DoubleSide}));front.position.z=CARD_DEPTH+.038;board.add(front);
    const back=new THREE.Mesh(new THREE.PlaneGeometry(CARD_W-.08,CARD_H-.08),new THREE.MeshStandardMaterial({map:backTexture,roughness:.9,metalness:0,transparent:true,side:THREE.DoubleSide}));back.position.z=-.038;back.rotation.y=Math.PI;board.add(back);
    board.userData.cardIndex=index;front.userData.cardIndex=index;back.userData.cardIndex=index;
    const pose=poses[index]||[0,0,0,0,0,0];
    const shadow=new THREE.Mesh(new THREE.PlaneGeometry(CARD_W*1.42,CARD_H*1.12),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,opacity:.72,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));shadow.position.set(.1,-.1,-.12);shadow.renderOrder=0;
    const group=new THREE.Group();group.add(shadow);group.add(board);group.position.set(pose[0],pose[1],pose[2]);group.rotation.set(pose[3],pose[4],pose[5]);group.scale.setScalar(celebration.id==="navidad"?1.06:.96);world.add(group);
    cards.push({celebration,group,board,front,back,frontTexture,backTexture,baseX:pose[0],baseY:pose[1],baseZ:pose[2],baseRotX:pose[3],baseRotY:pose[4],baseRotZ:pose[5],baseScale:celebration.id==="navidad"?1.06:.96,phase:index*1.4,flipped:false,flipTarget:0,hover:0,targetTiltX:0,targetTiltY:0});
  });
  const size=()=>{const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;compact=camera.aspect<.82;camera.position.z=compact?13.8:camera.aspect<1.2?14.2:15;camera.updateProjectionMatrix();camera.lookAt(0,0,0);};size();
  const localPoint=(event)=>{const rect=canvas.getBoundingClientRect();pointer.x=((event.clientX-rect.left)/rect.width)*2-1;pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(cards.map(c=>c.board),true);};
  const cardFrom=(hits)=>{for(const hit of hits){const index=hit.object.userData.cardIndex;if(Number.isInteger(index))return cards[index];}return null;};
  const flip=(card)=>{card.flipped=!card.flipped;card.flipTarget=card.flipped?Math.PI:0;selected=cards.indexOf(card);canvas.setAttribute("aria-label",card.flipped?"Postal abierta. Pulsa Enter otra vez para abrir la experiencia.":"Postal cerrada. Pulsa Enter para descubrir lo que guarda.");};
  const activate=(card)=>{if(!card.flipped){flip(card);return;}onOpen(card.celebration);};
  const onDown=(event)=>{canvas.setPointerCapture?.(event.pointerId);drag={x:event.clientX,y:event.clientY,rx:world.rotation.x,ry:world.rotation.y};dragged=false;};
  const onMove=(event)=>{if(drag){const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.hypot(dx,dy)>5)dragged=true;if(dragged){world.rotation.y=THREE.MathUtils.clamp(drag.ry+dx*.003,-.32,.32);world.rotation.x=THREE.MathUtils.clamp(drag.rx+dy*.002,-.11,.11);canvas.style.cursor="grabbing";}return;}const hits=localPoint(event),card=cardFrom(hits);if(hovered!==card){hovered=card;canvas.style.cursor=card?"pointer":"grab";}if(card&&hits[0]){const local=card.board.worldToLocal(hits[0].point.clone());card.targetTiltX=THREE.MathUtils.clamp(-local.y/CARD_H*.22,-.2,.2);card.targetTiltY=THREE.MathUtils.clamp(local.x/CARD_W*.24,-.22,.22);}};
  const onUp=(event)=>{if(!drag)return;const didDrag=dragged;drag=null;if(!didDrag){const card=cardFrom(localPoint(event));if(card)activate(card);}canvas.style.cursor="grab";};
  const onKey=(event)=>{if(event.key==="ArrowRight"||event.key==="ArrowDown"){event.preventDefault();selected=(selected+1)%cards.length;}else if(event.key==="ArrowLeft"||event.key==="ArrowUp"){event.preventDefault();selected=(selected-1+cards.length)%cards.length;}else if(event.key==="Enter"||event.key===" "){event.preventDefault();activate(cards[selected]);}};
  canvas.addEventListener("pointerdown",onDown);canvas.addEventListener("pointermove",onMove);canvas.addEventListener("pointerup",onUp);canvas.addEventListener("pointercancel",()=>{drag=null;});canvas.addEventListener("keydown",onKey);canvas.style.cursor="grab";
  const observer=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;if(active&&!frameId)frameId=requestAnimationFrame(draw);});let frameId=0;observer.observe(canvas);
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;let lastTime=0;
  function draw(time){if(disposed||!active){frameId=0;return;}const delta=Math.min((time-lastTime)/1000||0,.05);lastTime=time;
    cards.forEach((card,index)=>{const hoverTarget=card===hovered?1:0;card.hover=THREE.MathUtils.damp(card.hover,hoverTarget,7,delta);const offset=index-selected;const mobileX=compact?offset*.78:card.baseX;const mobileY=compact?-.08-Math.abs(offset)*.12:card.baseY;const mobileZ=compact?.48-Math.abs(offset)*.46:card.baseZ;const scaleTarget=compact?(offset===0?1.02:.78):card.baseScale;card.group.position.x=THREE.MathUtils.damp(card.group.position.x,mobileX,5,delta);card.group.position.y=THREE.MathUtils.damp(card.group.position.y,mobileY+(reduced?0:Math.sin(time*.0008+card.phase)*.075)+card.hover*.12,5,delta);card.group.position.z=THREE.MathUtils.damp(card.group.position.z,mobileZ+card.hover*.42,5,delta);card.group.scale.setScalar(THREE.MathUtils.damp(card.group.scale.x,scaleTarget,5,delta));card.group.rotation.x=THREE.MathUtils.damp(card.group.rotation.x,card.baseRotX+card.targetTiltX-(card===hovered?.035:0),6,delta);card.group.rotation.y=THREE.MathUtils.damp(card.group.rotation.y,card.baseRotY+card.flipTarget+card.targetTiltY,6,delta);card.group.rotation.z=THREE.MathUtils.damp(card.group.rotation.z,card.baseRotZ+(compact?offset*.045:0),5,delta);});
    renderer.render(scene,camera);frameId=requestAnimationFrame(draw);
  }
  const resizeObserver=new ResizeObserver(size);resizeObserver.observe(canvas);
  return {dispose(){disposed=true;observer.disconnect();resizeObserver.disconnect();if(frameId)cancelAnimationFrame(frameId);cards.forEach(c=>{c.frontTexture.dispose();c.backTexture.dispose();c.board.geometry.dispose();c.board.material.forEach(m=>m.dispose());c.front.material.dispose();c.back.material.dispose();});shadowTexture.dispose();renderer.dispose();}};
}
