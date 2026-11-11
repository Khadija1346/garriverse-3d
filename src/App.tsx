import { useEffect, useRef, useState } from "react";
import {
  ArcRotateCamera,
  Color3,
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

    const light = new HemisphericLight("sun", new Vector3(0.2, 1, 0.3), scene);
    light.intensity = 0.95;

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