import { useEffect, useRef, useState } from "react";
import {
  ArcRotateCamera,
  Color3,
  DirectionalLight,
  ShadowGenerator,
  Color4,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PointerEventTypes,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";

type PlotState = "empty" | "growing" | "ready";
type Plot = { id: number; state: PlotState; plantedAt: number | null };

const GROW_TIME = 20_000;

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const plotMeshes = useRef<Map<number, Mesh>>(new Map());
  const cropVisuals = useRef<Map<number, Mesh[]>>(new Map());
  const [plots, setPlots] = useState<Plot[]>([
    { id: 1, state: "empty", plantedAt: null },
    { id: 2, state: "empty", plantedAt: null },
    { id: 3, state: "empty", plantedAt: null },
    { id: 4, state: "empty", plantedAt: null },
  ]);
  const [selected, setSelected] = useState(1);
  const [seeds, setSeeds] = useState(5);
  const [cassava, setCassava] = useState(0);
  const [xp, setXp] = useState(0);
  const [notice, setNotice] = useState("Choose a plot to begin farming.");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.49, 0.72, 0.56, 1);
    sceneRef.current = scene;

    const camera = new ArcRotateCamera(
      "farm-camera",
      -Math.PI / 4,
      1.02,
      15,
      new Vector3(0, 0, 0),
      scene,
    );
    camera.lowerRadiusLimit = 9;
    camera.upperRadiusLimit = 23;
    camera.wheelPrecision = 45;
    camera.panningSensibility = 85;
    camera.attachControl(canvas, true);

    const light = new HemisphericLight("ambient-sky", new Vector3(0.2, 1, 0.3), scene);
    light.intensity = 0.82;
    const sun = new DirectionalLight("golden-hour-sun", new Vector3(-0.55, -1, 0.42), scene);
    sun.position = new Vector3(-8, 14, -7);
    sun.intensity = 1.35;
    const shadows = new ShadowGenerator(1024, sun);
    shadows.useBlurExponentialShadowMap = true;
    shadows.blurKernel = 24;
    shadows.bias = 0.0005;

    const mat = (name: string, hex: string) => {
      const material = new StandardMaterial(name, scene);
      material.diffuseColor = Color3.FromHexString(hex);
      return material;
    };
    const grass = mat("grass", "#73a95d");
    const soil = mat("soil", "#805638");
    const border = mat("plot-border", "#d5b47a");
    const crop = mat("cassava-leaves", "#347b43");
    const trunk = mat("cassava-stem", "#a9a16a");
    const path = mat("path", "#c5a77a");
    const water = mat("water", "#70c5d5");

    const ground = MeshBuilder.CreateGround("island", { width: 14, height: 12 }, scene);
    ground.position.y = -0.12;
    ground.material = grass;
    ground.receiveShadows = true;

    const road = MeshBuilder.CreateBox("farm-path", { width: 14, height: 0.08, depth: 1.1 }, scene);
    road.position.set(0, -0.02, 2.55);
    road.material = path;

    const pond = MeshBuilder.CreateCylinder("pond", { diameter: 2.1, height: 0.12, tessellation: 48 }, scene);
    pond.position.set(5.1, -0.02, -3.7);
    pond.material = water;

    const house = MeshBuilder.CreateBox("farmhouse", { width: 2.2, height: 1.55, depth: 1.8 }, scene);
    house.position.set(-4.8, 0.78, -3.5);
    house.material = mat("house-wall", "#e8d6ad");
    const roof = MeshBuilder.CreateCylinder("roof", { diameterTop: 0, diameterBottom: 2.8, height: 1.15, tessellation: 4 }, scene);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(-4.8, 2.05, -3.5);
    roof.material = mat("roof", "#a84e37");

    const positions = [
      [-2.25, -0.5], [0.15, -0.5], [-2.25, -3.05], [0.15, -3.05],
    ];
    positions.forEach(([x, z], index) => {
      const base = MeshBuilder.CreateBox(
        `plot-${index + 1}`,
        { width: 1.9, height: 0.16, depth: 1.9 },
        scene,
      );
      base.position.set(x, 0.02, z);
      base.material = border;
      const soilTop = MeshBuilder.CreateGround(
        `soil-${index + 1}`,
        { width: 1.65, height: 1.65 },
        scene,
      );
      soilTop.position.set(x, 0.115, z);
      soilTop.material = soil;
      base.isPickable = true;
      soilTop.isPickable = true;
      plotMeshes.current.set(index + 1, base);
    });

    const treePositions = [[-6, -0.3], [6, 1], [4.7, 4.4], [-6, 4.3], [2.8, -5]];
    treePositions.forEach(([x, z], i) => {
      const stem = MeshBuilder.CreateCylinder(`tree-stem-${i}`, { height: 0.9, diameter: 0.25 }, scene);
      stem.position.set(x, 0.42, z);
      stem.material = trunk;
      const crown = MeshBuilder.CreateSphere(`tree-crown-${i}`, { diameter: 1.5, segments: 8 }, scene);
      crown.position.set(x, 1.25, z);
      crown.material = crop;
    });

    // Premium environment pass: layered architecture, paths, props and a living farm silhouette.
    const wood = mat("warm-wood", "#70452d");
    const timber = mat("light-timber", "#bd8c54");
    const plaster = mat("cream-plaster", "#f0dcb4");
    const terracotta = mat("terracotta-roof", "#a94732");
    const leafLight = mat("leaf-light", "#70a94e");
    const leafDark = mat("leaf-dark", "#285b38");
    const stone = mat("river-stone", "#87918a");
    const gold = mat("lantern-gold", "#f5c86b");
    const darkMetal = mat("dark-metal", "#39433c");

    const cast = (mesh: Mesh) => { mesh.receiveShadows = true; shadows.addShadowCaster(mesh); return mesh; };
    const box = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, material: StandardMaterial) => {
      const m = MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
      m.position.set(x, y, z); m.material = material; return cast(m);
    };
    const roof = (name: string, x: number, y: number, z: number, w: number, d: number) => {
      const r = MeshBuilder.CreateCylinder(name, { diameterTop: 0, diameterBottom: Math.max(w, d) * 1.48, height: 1.05, tessellation: 4 }, scene);
      r.scaling.set(w / Math.max(w, d), 1, d / Math.max(w, d));
      r.rotation.y = Math.PI / 4; r.position.set(x, y, z); r.material = terracotta; return cast(r);
    };

    // Main homestead: layered walls, roof, porch, door, windows and stone foundation.
    box("homestead-foundation", 2.8, 0.28, 2.35, -4.7, 0.16, -3.45, stone);
    box("homestead-wall", 2.55, 1.55, 2.1, -4.7, 1.02, -3.45, plaster);
    roof("homestead-roof", -4.7, 2.23, -3.45, 2.7, 2.35);
    box("front-door", 0.55, 1.05, 0.09, -4.7, 0.72, -2.38, wood);
    box("window-left", 0.48, 0.48, 0.08, -5.48, 1.2, -2.37, darkMetal);
    box("window-right", 0.48, 0.48, 0.08, -3.92, 1.2, -2.37, darkMetal);
    box("porch-floor", 1.65, 0.12, 0.7, -4.7, 0.25, -2.05, timber);
    for (let i = 0; i < 3; i++) {
      const post = MeshBuilder.CreateCylinder("porch-post-" + i, { height: 1.45, diameter: 0.12 }, scene);
      post.position.set(-5.35 + i * 0.65, 0.98, -1.83); post.material = wood; cast(post);
    }

    // Processing shed and market stall give the district a recognisable purpose.
    box("processing-foundation", 2.4, 0.22, 2, 3.9, 0.12, -3.5, stone);
    box("processing-shed", 2.2, 1.55, 1.8, 3.9, 0.95, -3.5, timber);
    roof("processing-roof", 3.9, 2.05, -3.5, 2.45, 2.05);
    box("shed-door", 0.7, 1.05, 0.08, 3.9, 0.68, -2.57, wood);
    box("market-counter", 2.1, 0.72, 0.75, 4.45, 0.45, 1.0, wood);
    box("market-awning", 2.35, 0.16, 1.1, 4.45, 1.48, 1.0, terracotta);
    for (let i = 0; i < 3; i++) {
      const post = MeshBuilder.CreateCylinder("market-post-" + i, { height: 1.45, diameter: 0.1 }, scene);
      post.position.set(3.55 + i * 0.9, 0.77, 1.35); post.material = wood; cast(post);
    }
    for (let i = 0; i < 5; i++) {
      const sack = MeshBuilder.CreateSphere("market-sack-" + i, { diameter: 0.34, segments: 10 }, scene);
      sack.scaling.y = 0.72; sack.position.set(3.75 + (i % 3) * 0.48, 0.92, 0.82 + Math.floor(i / 3) * 0.22);
      sack.material = i % 2 ? plaster : gold; cast(sack);
    }

    // Timber fencing around the homestead and garden edges.
    for (let i = 0; i < 13; i++) {
      const x = -6.35 + i * 1.05;
      box("fence-front-post-" + i, 0.13, 0.72, 0.13, x, 0.35, 5.15, wood);
      if (i < 12) box("fence-front-rail-" + i, 1.0, 0.11, 0.1, x + 0.5, 0.48, 5.15, timber);
    }
    for (let i = 0; i < 9; i++) {
      const z = -4.5 + i * 1.05;
      box("fence-side-post-" + i, 0.13, 0.72, 0.13, -6.35, 0.35, z, wood);
      if (i < 8) box("fence-side-rail-" + i, 0.1, 0.11, 1.0, -6.35, 0.48, z + 0.5, timber);
    }

    // Water tower, windmill and lamps become skyline landmarks.
    const towerLegs = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
    towerLegs.forEach(([dx, dz], i) => {
      const leg = MeshBuilder.CreateCylinder("water-tower-leg-" + i, { height: 2.1, diameter: 0.12 }, scene);
      leg.position.set(5.55 + dx * 0.42, 1.05, -0.9 + dz * 0.42); leg.material = darkMetal; cast(leg);
    });
    const tank = MeshBuilder.CreateCylinder("water-tank", { diameter: 1.25, height: 0.9, tessellation: 16 }, scene);
    tank.position.set(5.55, 2.25, -0.9); tank.material = water; cast(tank);
    const millPole = MeshBuilder.CreateCylinder("windmill-pole", { height: 2.7, diameter: 0.16 }, scene);
    millPole.position.set(-1.1, 1.35, 4.0); millPole.material = wood; cast(millPole);
    const millHub = MeshBuilder.CreateSphere("windmill-hub", { diameter: 0.3 }, scene);
    millHub.position.set(-1.1, 2.75, 4.0); millHub.material = gold; cast(millHub);
    for (let i = 0; i < 4; i++) {
      const blade = box("windmill-blade-" + i, 0.16, 1.35, 0.08, -1.1, 3.45, 4.0, plaster);
      blade.rotation.z = i * Math.PI / 2;
    }
    for (const [x, z] of [[-3.1, 1.8], [2.3, 1.8], [5.6, 3.4]]) {
      const pole = MeshBuilder.CreateCylinder("garden-lamp-pole", { height: 1.35, diameter: 0.09 }, scene);
      pole.position.set(x, 0.68, z); pole.material = darkMetal; cast(pole);
      const glow = MeshBuilder.CreateSphere("garden-lamp-glow", { diameter: 0.27 }, scene);
      glow.position.set(x, 1.42, z); glow.material = gold;
    }

    // Dense low vegetation, flower beds and stone edging soften the geometry.
    for (let i = 0; i < 28; i++) {
      const x = -6 + ((i * 37) % 120) / 10;
      const z = -5 + ((i * 23) % 95) / 10;
      if ((x > -3.4 && x < 2.5 && z > -3.9 && z < 1.0) || (x > -5.9 && x < -3.2 && z > -4.8 && z < -1.8)) continue;
      const shrub = MeshBuilder.CreateSphere("shrub-" + i, { diameter: 0.42 + (i % 3) * 0.12, segments: 8 }, scene);
      shrub.scaling.y = 0.7; shrub.position.set(x, 0.22, z); shrub.material = i % 2 ? leafDark : leafLight; cast(shrub);
    }
    for (let i = 0; i < 18; i++) {
      const x = -5.8 + (i % 9) * 1.35;
      const z = 4.5 + (i % 2) * 0.35;
      const flower = MeshBuilder.CreateSphere("flower-" + i, { diameter: 0.13, segments: 8 }, scene);
      flower.position.set(x, 0.16, z); flower.material = i % 2 ? gold : plaster;
    }

    // A small farmer silhouette gives the scene a sense of scale.
    const farmerBody = MeshBuilder.CreateCapsule("farmer-body", { height: 1.05, radius: 0.24 }, scene);
    farmerBody.position.set(1.65, 0.65, 1.6); farmerBody.material = mat("farmer-clothes", "#315d78"); cast(farmerBody);
    const farmerHead = MeshBuilder.CreateSphere("farmer-head", { diameter: 0.42, segments: 12 }, scene);
    farmerHead.position.set(1.65, 1.34, 1.6); farmerHead.material = mat("farmer-skin", "#9c6849"); cast(farmerHead);
    const farmerHat = MeshBuilder.CreateCylinder("farmer-hat", { diameterTop: 0.28, diameterBottom: 0.58, height: 0.15, tessellation: 12 }, scene);
    farmerHat.position.set(1.65, 1.59, 1.6); farmerHat.material = gold; cast(farmerHat);

    // Plot soil gets a raised, framed edge and a few scattered stones.
    positions.forEach(([x, z], i) => {
      for (let k = 0; k < 4; k++) {
        const pebble = MeshBuilder.CreateSphere("plot-pebble-" + i + "-" + k, { diameter: 0.11, segments: 6 }, scene);
        pebble.scaling.y = 0.45;
        pebble.position.set(x - 0.62 + k * 0.38, 0.19, z + 0.76);
        pebble.material = stone;
      }
    });

    // Register scene meshes for soft real-time shadows.
    scene.meshes.forEach((mesh) => {
      if (mesh !== ground && mesh.isEnabled() && mesh.getTotalVertices() > 0) {
        try { shadows.addShadowCaster(mesh); } catch { /* decorative mesh */ }
      }
    });

    scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type !== PointerEventTypes.POINTERPICK) return;
      const picked = pointerInfo.pickInfo?.pickedMesh;
      if (!picked) return;
      const match = picked.name.match(/(?:plot|soil)-(\d+)/);
      if (match) setSelected(Number(match[1]));
    });

    engine.runRenderLoop(() => scene.render());
    const resize = () => engine.resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      scene.dispose();
      engine.dispose();
      sceneRef.current = null;
      plotMeshes.current.clear();
      cropVisuals.current.clear();
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPlots((current) => current.map((plot) => {
        if (plot.state === "growing" && plot.plantedAt && Date.now() - plot.plantedAt >= GROW_TIME) {
          return { ...plot, state: "ready" };
        }
        return plot;
      }));
    }, 500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const plotPositions: Record<number, [number, number]> = {
      1: [-2.25, -0.5], 2: [0.15, -0.5], 3: [-2.25, -3.05], 4: [0.15, -3.05],
    };
    const leafMaterial = new StandardMaterial("living-cassava-leaf", scene);
    leafMaterial.diffuseColor = Color3.FromHexString("#4f9b45");
    const stemMaterial = new StandardMaterial("living-cassava-stem", scene);
    stemMaterial.diffuseColor = Color3.FromHexString("#8c7544");
    plots.forEach((plot) => {
      cropVisuals.current.get(plot.id)?.forEach((mesh) => mesh.dispose());
      cropVisuals.current.delete(plot.id);
      if (plot.state === "empty") return;
      const [x, z] = plotPositions[plot.id];
      const stage = plot.state === "ready" ? 1 : 0.68;
      const created: Mesh[] = [];
      const stem = MeshBuilder.CreateCylinder("cassava-stem-" + plot.id, { height: 0.72 * stage, diameter: 0.1 }, scene);
      stem.position.set(x, 0.48, z); stem.material = stemMaterial; created.push(stem);
      for (let i = 0; i < 7; i++) {
        const leaf = MeshBuilder.CreateSphere("cassava-leaf-" + plot.id + "-" + i, { diameter: 0.42 * stage, segments: 8 }, scene);
        const angle = (i / 7) * Math.PI * 2;
        leaf.scaling.set(1.35, 0.34, 0.68);
        leaf.position.set(x + Math.cos(angle) * 0.28 * stage, 0.78 * stage, z + Math.sin(angle) * 0.28 * stage);
        leaf.rotation.y = angle; leaf.material = leafMaterial; created.push(leaf);
      }
      if (plot.state === "ready") {
        for (let i = 0; i < 3; i++) {
          const root = MeshBuilder.CreateCylinder("cassava-root-" + plot.id + "-" + i, { height: 0.35, diameterTop: 0.08, diameterBottom: 0.17 }, scene);
          root.rotation.z = Math.PI / 2; root.position.set(x - 0.25 + i * 0.22, 0.25, z + 0.35);
          const rootMaterial = new StandardMaterial("cassava-root-material-" + plot.id + "-" + i, scene);
          rootMaterial.diffuseColor = Color3.FromHexString("#d6b77c");
          root.material = rootMaterial; created.push(root);
        }
      }
      cropVisuals.current.set(plot.id, created);
    });
  }, [plots]);

  const activePlot = plots.find((plot) => plot.id === selected)!;

  const plant = () => {
    if (activePlot.state !== "empty") {
      setNotice("This plot is already occupied. Select an empty plot.");
      return;
    }
    if (seeds < 1) {
      setNotice("You have no seeds left.");
      return;
    }
    setPlots((current) => current.map((plot) =>
      plot.id === selected ? { ...plot, state: "growing", plantedAt: Date.now() } : plot,
    ));
    setSeeds((value) => value - 1);
    setNotice("Cassava planted. Your crop will be ready in about 20 seconds.");
  };

  const harvest = () => {
    if (activePlot.state !== "ready") {
      setNotice("This cassava is not ready to harvest yet.");
      return;
    }
    setPlots((current) => current.map((plot) =>
      plot.id === selected ? { ...plot, state: "empty", plantedAt: null } : plot,
    ));
    setCassava((value) => value + 3);
    setXp((value) => value + 10);
    setNotice("Harvest complete: +3 cassava and +10 prototype XP.");
  };

  const progress = activePlot.state === "ready"
    ? 100
    : activePlot.state === "growing" && activePlot.plantedAt
      ? Math.min(99, Math.floor(((Date.now() - activePlot.plantedAt) / GROW_TIME) * 100))
      : 0;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">G</div>
        <div className="brand-copy">
          <strong>GARRIVERSE <span>3D</span></strong>
          <small>ISOMETRIC FARM TYCOON</small>
        </div>
        <div className="top-status"><i /> PROTOTYPE WORLD</div>
      </header>

      <section className="game-layout">
        <div className="world-panel">
          <div className="world-heading">
            <div><span className="eyebrow">YOUR HOMESTEAD</span><h1>Farm District</h1></div>
            <span className="district-tag">DISTRICT 01</span>
          </div>
          <div className="canvas-wrap">
            <canvas ref={canvasRef} aria-label="Interactive 3D cassava farm. Drag to rotate and scroll to zoom." />
            <div className="canvas-tip">DRAG TO ROTATE · PINCH / SCROLL TO ZOOM</div>
          </div>
          <div className="notice"><span className="notice-dot" />{notice}</div>
        </div>

        <aside className="side-panel">
          <div className="player-card">
            <div className="avatar">F</div>
            <div><small>FARMER PROFILE</small><strong>New Farmer</strong><span>Level 1 · Seedling</span></div>
          </div>

          <div className="stats-grid">
            <div className="stat"><small>PROTOTYPE XP</small><strong>{xp}</strong></div>
            <div className="stat"><small>CASSAVA</small><strong>{cassava}</strong></div>
            <div className="stat"><small>SEEDS</small><strong>{seeds}</strong></div>
            <div className="stat"><small>ACTIVE PLOTS</small><strong>{plots.filter((p) => p.state !== "empty").length}/4</strong></div>
          </div>

          <section className="action-card">
            <div className="section-label">FARM ACTIONS</div>
            <div className="selected-plot">
              <div><small>SELECTED PLOT</small><strong>Plot {selected}</strong></div>
              <span className={`state-pill ${activePlot.state}`}>{activePlot.state === "empty" ? "EMPTY" : activePlot.state === "ready" ? "READY" : "GROWING"}</span>
            </div>
            <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
            <div className="progress-label"><span>Crop growth</span><b>{progress}%</b></div>
            <button className="primary-action" onClick={plant} disabled={activePlot.state !== "empty" || seeds < 1}>＋ Plant cassava</button>
            <button className="secondary-action" onClick={harvest} disabled={activePlot.state !== "ready"}>Harvest cassava</button>
            <p className="action-help">Tap a soil plot in the 3D world to select it. Crops mature automatically in this prototype.</p>
          </section>

          <section className="district-card">
            <div className="section-label">COMING TO THE WORLD</div>
            <div className="district-row"><span>💧</span><div><b>Water District</b><small>Wells and irrigation</small></div><em>PLANNED</em></div>
            <div className="district-row"><span>🏭</span><div><b>Processing District</b><small>Cassava to garri</small></div><em>PLANNED</em></div>
            <div className="district-row"><span>🏪</span><div><b>Garri Market</b><small>Warehouse and market</small></div><em>PLANNED</em></div>
          </section>
        </aside>
      </section>

      <footer className="footer-note">
        <span>GARRIVERSE 3D · EARLY PLAYABLE PROTOTYPE</span>
        <span>Prototype XP and inventory are local only — no real $GARRI rewards.</span>
      </footer>
    </main>
  );
}