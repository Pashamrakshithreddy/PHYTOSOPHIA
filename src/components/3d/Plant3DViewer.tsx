import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { GrowthStage, HealthState, LeafNode } from '../../types';
import { Eye, AlertTriangle, CheckCircle2, RotateCcw, Play, Pause } from 'lucide-react';

interface Plant3DProps {
  growthStage: GrowthStage;
  healthState: HealthState;
  healthScore: number;
  growthScore: number;
  speciesName: string;
  plantName: string;
  isWatering?: boolean;
  isFertilizing?: boolean;
  isSunlightActive?: boolean;
  isDiagnosticOverlay?: boolean;
  leafNodes?: LeafNode[];
  onSelectLeaf?: (leaf: LeafNode) => void;
}

// -------------------------------------------------------------
// 1. Procedural Botanical Geometry Helpers
// -------------------------------------------------------------

// Generate realistic organic leaf shape with curved margins and pointed apex
function createBotanicalLeafGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  // Right side outer blade curve with organic swell and tapered apex
  shape.bezierCurveTo(0.32, 0.22, 0.44, 0.68, 0.0, 1.25);
  // Left side outer blade curve
  shape.bezierCurveTo(-0.44, 0.68, -0.32, 0.22, 0, 0);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.015,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.01,
    bevelThickness: 0.01,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  return geom;
}

// Minimalist Ceramic Planter & Organic Soil
const LuxuryPot: React.FC<{ healthScore: number }> = ({ healthScore }) => {
  const soilColor = healthScore < 50 ? '#4d3a2b' : '#2b1d12';
  return (
    <group position={[0, -1.8, 0]}>
      {/* Soft Ground Contact Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.65, 32]} />
        <meshBasicMaterial color="#1e3a2b" transparent opacity={0.08} />
      </mesh>

      {/* Ceramic Outer Pot */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[1.28, 0.92, 1.6, 48]} />
        <meshStandardMaterial
          color="#f4f6f4"
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>

      {/* Pot Rim Accent */}
      <mesh position={[0, 1.58, 0]}>
        <cylinderGeometry args={[1.34, 1.31, 0.12, 48]} />
        <meshStandardMaterial color="#e5ede7" roughness={0.3} metalness={0.08} />
      </mesh>

      {/* Drainage Saucer Tray */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.15, 1.05, 0.16, 48]} />
        <meshStandardMaterial color="#e2eae4" roughness={0.35} />
      </mesh>

      {/* Rich Organic Potting Mix */}
      <mesh position={[0, 1.53, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.22, 36]} />
        <meshStandardMaterial color={soilColor} roughness={0.92} />
      </mesh>
    </group>
  );
};

// Smooth Organic Stem Mesh with curved petiole branches
const OrganicStem: React.FC<{ stage: GrowthStage; healthScore: number }> = ({ stage, healthScore }) => {
  const stemGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (stemGroupRef.current) {
      const t = state.clock.getElapsedTime();
      // Gentle natural wind sway
      stemGroupRef.current.rotation.z = Math.sin(t * 0.75) * 0.025;
      stemGroupRef.current.rotation.x = Math.cos(t * 0.55) * 0.018;
    }
  });

  const isDying = healthScore < 50;
  const stemColor = isDying ? '#66593a' : '#2c6b4f';
  const stemRoughness = 0.55;

  if (stage === 'SEED') {
    return (
      <group position={[0, -0.25, 0]}>
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshStandardMaterial color="#543e2b" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.035, 0.045, 0.26, 16]} />
          <meshStandardMaterial color="#34c759" roughness={0.4} />
        </mesh>
      </group>
    );
  }

  const heightMult = stage === 'SPROUT' ? 0.9 : stage === 'YOUNG' ? 1.6 : stage === 'HEALTHY' ? 2.3 : 2.8;

  return (
    <group ref={stemGroupRef} position={[0, -0.25, 0]}>
      {/* Main Central Stem */}
      <mesh position={[0, heightMult / 2, 0]}>
        <cylinderGeometry args={[0.055, 0.11, heightMult, 20]} />
        <meshStandardMaterial color={stemColor} roughness={stemRoughness} />
      </mesh>

      {/* Primary Branches / Petiole Junctions */}
      {(stage === 'YOUNG' || stage === 'HEALTHY' || stage === 'MATURE') && (
        <>
          <group position={[0.15, heightMult * 0.38, 0]} rotation={[0.15, 0.2, -Math.PI / 4]}>
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.028, 0.05, 0.8, 16]} />
              <meshStandardMaterial color={stemColor} roughness={stemRoughness} />
            </mesh>
          </group>
          <group position={[-0.15, heightMult * 0.58, 0]} rotation={[-0.1, -0.2, Math.PI / 3.8]}>
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.026, 0.048, 0.9, 16]} />
              <meshStandardMaterial color={stemColor} roughness={stemRoughness} />
            </mesh>
          </group>
        </>
      )}

      {stage === 'MATURE' && (
        <>
          <group position={[0.18, heightMult * 0.76, 0.1]} rotation={[0.25, 0.3, -Math.PI / 3.2]}>
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.022, 0.04, 0.7, 16]} />
              <meshStandardMaterial color={stemColor} roughness={stemRoughness} />
            </mesh>
          </group>
          <group position={[-0.18, heightMult * 0.82, -0.1]} rotation={[-0.2, -0.3, Math.PI / 3.2]}>
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.022, 0.04, 0.7, 16]} />
              <meshStandardMaterial color={stemColor} roughness={stemRoughness} />
            </mesh>
          </group>
        </>
      )}
    </group>
  );
};

// Realistic Botanical Leaf Component with gentle swaying, midrib vein, and interactive inspection
const BotanicalLeaf: React.FC<{
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  health: number;
  leafIndex: number;
  isDiagnostic?: boolean;
  leafData?: LeafNode;
  onSelectLeaf?: (leaf: LeafNode) => void;
}> = ({ position, rotation, scale = 1, health, leafIndex, isDiagnostic, leafData, onSelectLeaf }) => {
  const [hovered, setHovered] = useState(false);
  const leafRef = useRef<THREE.Group>(null);

  // Procedural leaf geometry
  const leafGeom = useMemo(() => createBotanicalLeafGeometry(), []);

  useFrame((state) => {
    if (leafRef.current) {
      const t = state.clock.getElapsedTime();
      // Realistic fluttering leaf sway
      const swayZ = Math.sin(t * 1.3 + leafIndex * 1.2) * 0.04;
      const swayX = Math.cos(t * 1.1 + leafIndex * 0.8) * 0.03;
      leafRef.current.rotation.z = rotation[2] + swayZ;
      leafRef.current.rotation.x = rotation[0] + swayX;
    }
  });

  // Color calculation based on health and diagnostic SAM state
  let primaryColor = '#2c6b4f'; // Rich forest green
  let veinColor = '#1f4e39';

  if (isDiagnostic) {
    if (health > 85) {
      primaryColor = '#34c759'; // Vibrant healthy
      veinColor = '#259a43';
    } else if (health > 65) {
      primaryColor = '#eab308'; // Chlorosis yellow
      veinColor = '#ca8a04';
    } else {
      primaryColor = '#ef4444'; // Necrotic lesion red
      veinColor = '#b91c1c';
    }
  } else {
    if (health < 50) {
      primaryColor = '#785b3a';
      veinColor = '#594024';
    } else if (health < 75) {
      primaryColor = '#b89d3d';
      veinColor = '#8a7428';
    } else {
      primaryColor = '#2c6b4f';
    }
  }

  if (hovered) {
    primaryColor = '#34c759';
  }

  return (
    <group
      ref={leafRef}
      position={position}
      rotation={rotation}
      scale={hovered ? scale * 1.12 : scale}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (leafData && onSelectLeaf) {
          onSelectLeaf(leafData);
        }
      }}
    >
      {/* Curved Petiole Connector */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.018, 0.024, 0.45, 12]} />
        <meshStandardMaterial color={veinColor} roughness={0.5} />
      </mesh>

      {/* Organic Extruded Botanical Leaf Blade */}
      <mesh geometry={leafGeom} position={[0, 0.45, 0]}>
        <meshStandardMaterial
          color={primaryColor}
          roughness={0.32}
          metalness={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Subtle Central Spine Vein (Midrib) */}
      <mesh position={[0, 0.45, 0.012]}>
        <cylinderGeometry args={[0.012, 0.018, 1.1, 10]} />
        <meshStandardMaterial color={veinColor} roughness={0.4} />
      </mesh>

      {/* Diagnostic Lesion Patch indicator (if unhealthy & diagnostic mode) */}
      {isDiagnostic && health < 80 && (
        <mesh position={[0.08, 0.5, 0.02]}>
          <circleGeometry args={[0.16, 16]} />
          <meshBasicMaterial
            color={health < 65 ? '#ef4444' : '#eab308'}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}

      {/* Interactive Light-Themed Leaf Telemetry Tooltip */}
      {hovered && leafData && (
        <Html position={[0, 0.8, 0]} center distanceFactor={7.5}>
          <div className="bg-white/95 text-[#172a21] text-xs p-3 rounded-2xl border border-[#e8f0e9] shadow-[0px_10px_30px_rgba(44,107,79,0.12)] backdrop-blur-md whitespace-nowrap z-50 pointer-events-none transition-all">
            <div className="flex items-center gap-1.5 font-bold text-[#2c6b4f] mb-0.5">
              <span className="w-2 h-2 rounded-full bg-[#34c759]" />
              <span>{leafData.label}</span>
            </div>
            <div className="text-[11px] text-[#4a5d52]">
              Vitality: <strong className={leafData.health > 80 ? 'text-[#34c759]' : 'text-[#eab308]'}>{leafData.health}%</strong>
            </div>
            {leafData.issue ? (
              <div className="text-rose-600 font-semibold text-[10px] mt-0.5">⚠️ {leafData.issue}</div>
            ) : (
              <div className="text-[#34c759] text-[10px] font-medium mt-0.5">Optimal photosynthetic vigor</div>
            )}
            <div className="text-[9px] text-[#83978b] mt-1 pt-1 border-t border-[#e8f0e9]">Tap leaf to inspect telemetry</div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Flower Bloom for Mature Stage
const BloomFlower: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const bloomRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (bloomRef.current) {
      bloomRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
    }
  });

  return (
    <group ref={bloomRef} position={position}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.13, 20, 20]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.25} />
      </mesh>
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <mesh
            key={i}
            position={[Math.sin(rad) * 0.22, Math.cos(rad) * 0.22, 0]}
            rotation={[0, 0, -rad]}
          >
            <coneGeometry args={[0.11, 0.36, 16]} />
            <meshStandardMaterial color="#ec4899" roughness={0.35} />
          </mesh>
        );
      })}
    </group>
  );
};

// Action Particle Effects
const ActionParticles: React.FC<{
  isWatering?: boolean;
  isFertilizing?: boolean;
  isSunlight?: boolean;
}> = ({ isWatering, isFertilizing, isSunlight }) => {
  return (
    <>
      {isWatering && (
        <Sparkles
          count={140}
          scale={[2.6, 3.6, 2.6]}
          position={[0, 1.4, 0]}
          size={4}
          speed={3}
          color="#38bdf8"
        />
      )}
      {isFertilizing && (
        <Sparkles
          count={110}
          scale={[2.4, 2.6, 2.4]}
          position={[0, 0.8, 0]}
          size={5}
          speed={2.2}
          color="#34c759"
        />
      )}
      {isSunlight && (
        <Sparkles
          count={90}
          scale={[3.2, 3.2, 3.2]}
          position={[0, 2.2, 0]}
          size={6}
          speed={1.5}
          color="#fde047"
        />
      )}
    </>
  );
};

// -------------------------------------------------------------
// 2. Main 3D Plant Scene Assembler
// -------------------------------------------------------------
const Plant3DScene: React.FC<Plant3DProps> = (props) => {
  const {
    growthStage,
    healthScore,
    isWatering,
    isFertilizing,
    isSunlightActive,
    isDiagnosticOverlay,
    leafNodes = [],
    onSelectLeaf,
  } = props;

  const leavesToRender = useMemo(() => {
    if (growthStage === 'SEED') return [];

    if (growthStage === 'SPROUT') {
      return [
        { pos: [0.22, 0.25, 0] as [number, number, number], rot: [0.15, 0.35, -0.65] as [number, number, number], scale: 0.55, leaf: leafNodes[0] },
        { pos: [-0.22, 0.32, 0] as [number, number, number], rot: [-0.15, -0.35, 0.65] as [number, number, number], scale: 0.55, leaf: leafNodes[1] },
      ];
    }

    if (growthStage === 'YOUNG') {
      return [
        { pos: [0.45, 0.6, 0.1] as [number, number, number], rot: [0.25, 0.2, -0.55] as [number, number, number], scale: 0.8, leaf: leafNodes[0] },
        { pos: [-0.5, 0.8, -0.1] as [number, number, number], rot: [-0.2, -0.3, 0.65] as [number, number, number], scale: 0.85, leaf: leafNodes[1] },
        { pos: [0.25, 1.2, -0.2] as [number, number, number], rot: [0.35, 0.7, -0.45] as [number, number, number], scale: 0.9, leaf: leafNodes[2] },
        { pos: [-0.25, 1.3, 0.2] as [number, number, number], rot: [-0.35, -0.5, 0.55] as [number, number, number], scale: 0.85, leaf: leafNodes[3] },
      ];
    }

    if (growthStage === 'HEALTHY' || growthStage === 'MATURE') {
      return [
        { pos: [0.65, 0.75, 0.2] as [number, number, number], rot: [0.25, 0.2, -0.65] as [number, number, number], scale: 1.05, leaf: leafNodes[0] },
        { pos: [-0.7, 0.95, -0.2] as [number, number, number], rot: [-0.2, -0.3, 0.75] as [number, number, number], scale: 1.1, leaf: leafNodes[1] },
        { pos: [0.45, 1.4, -0.3] as [number, number, number], rot: [0.35, 0.75, -0.55] as [number, number, number], scale: 1.15, leaf: leafNodes[2] },
        { pos: [-0.45, 1.6, 0.3] as [number, number, number], rot: [-0.35, -0.55, 0.65] as [number, number, number], scale: 1.15, leaf: leafNodes[3] },
        { pos: [0.25, 2.0, 0.25] as [number, number, number], rot: [0.2, 0.45, -0.35] as [number, number, number], scale: 1.0, leaf: leafNodes[4] },
        { pos: [-0.25, 2.1, -0.25] as [number, number, number], rot: [-0.25, -0.4, 0.45] as [number, number, number], scale: 1.0, leaf: leafNodes[5] },
      ];
    }

    return [];
  }, [growthStage, leafNodes]);

  return (
    <group position={[0, -0.2, 0]}>
      <LuxuryPot healthScore={healthScore} />
      <OrganicStem stage={growthStage} healthScore={healthScore} />

      {leavesToRender.map((item, idx) => (
        <BotanicalLeaf
          key={idx}
          position={item.pos}
          rotation={item.rot}
          scale={item.scale}
          health={item.leaf?.health ?? healthScore}
          leafIndex={idx}
          isDiagnostic={isDiagnosticOverlay}
          leafData={item.leaf}
          onSelectLeaf={onSelectLeaf}
        />
      ))}

      {growthStage === 'MATURE' && (
        <>
          <BloomFlower position={[0, 2.45, 0]} />
          <BloomFlower position={[0.55, 1.7, 0.15]} />
          <BloomFlower position={[-0.5, 1.9, -0.15]} />
        </>
      )}

      <ActionParticles
        isWatering={isWatering}
        isFertilizing={isFertilizing}
        isSunlight={isSunlightActive}
      />
    </group>
  );
};

// -------------------------------------------------------------
// 3. Exported Interactive 3D Digital Twin Viewer
// -------------------------------------------------------------
export const Plant3DViewer: React.FC<Plant3DProps> = (props) => {
  const {
    growthStage,
    healthScore,
    growthScore,
    speciesName,
    plantName,
    isDiagnosticOverlay,
  } = props;

  const [diagnosticMode, setDiagnosticMode] = useState(isDiagnosticOverlay ?? false);
  const [selectedLeaf, setSelectedLeaf] = useState<LeafNode | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const controlsRef = useRef<any>(null);

  const getStageBadgeColor = (stage: GrowthStage) => {
    switch (stage) {
      case 'SEED': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'SPROUT': return 'bg-lime-50 text-lime-800 border-lime-200';
      case 'YOUNG': return 'bg-[#e8f0e9] text-[#2c6b4f] border-[#c5ddc7]';
      case 'HEALTHY': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'MATURE': return 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200';
    }
  };

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-[460px] sm:h-[520px] rounded-[24px] overflow-hidden bg-gradient-to-b from-[#ffffff] to-[#f4f7f4] border border-[#e8f0e9] shadow-[0px_12px_35px_rgba(44,107,79,0.06)]">
      {/* Top Floating Control Bar (Warm Luxury White) */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full border border-[#e8f0e9] flex items-center gap-3 shadow-[0px_4px_16px_rgba(44,107,79,0.06)]">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#172a21] leading-tight">{plantName}</h4>
            <div className="text-[10px] text-[#2c6b4f] font-medium italic">{speciesName}</div>
          </div>
          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStageBadgeColor(growthStage)}`}>
            Stage: {growthStage}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {/* SAM Diagnostic Mode Toggle */}
          <button
            onClick={() => setDiagnosticMode(!diagnosticMode)}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0px_2px_8px_rgba(44,107,79,0.06)] hover:-translate-y-0.5 ${
              diagnosticMode
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-white text-[#2c6b4f] border border-[#e8f0e9] hover:bg-[#f2f7f3]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{diagnosticMode ? 'SAM Pathology Matrix' : 'Photorealistic Mode'}</span>
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="p-2 bg-white hover:bg-[#f2f7f3] text-[#4a5d52] hover:text-[#172a21] border border-[#e8f0e9] rounded-full transition-all shadow-xs hover:-translate-y-0.5"
            title={autoRotate ? 'Pause Auto-Rotation' : 'Resume Auto-Rotation'}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Reset Camera View */}
          <button
            onClick={handleResetCamera}
            className="p-2 bg-white hover:bg-[#f2f7f3] text-[#4a5d52] hover:text-[#172a21] border border-[#e8f0e9] rounded-full transition-all shadow-xs hover:-translate-y-0.5"
            title="Reset Camera View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <Canvas className="w-full h-full cursor-grab active:cursor-grabbing">
        <PerspectiveCamera makeDefault position={[0, 1.2, 5.4]} fov={45} />
        
        {/* Warm Studio Ambient & Directional Lighting */}
        <ambientLight intensity={1.4} color="#fcfbf7" />
        <directionalLight position={[5, 8, 5]} intensity={1.8} color="#fffbe8" castShadow />
        <directionalLight position={[-5, 4, -5]} intensity={0.6} color="#e0f2fe" />
        <pointLight position={[0, -0.8, 2.2]} intensity={0.9} color="#2c6b4f" />

        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.25}>
          <Plant3DScene
            {...props}
            isDiagnosticOverlay={diagnosticMode}
            onSelectLeaf={(leaf) => setSelectedLeaf(leaf)}
          />
        </Float>

        <OrbitControls
          ref={controlsRef}
          autoRotate={autoRotate}
          autoRotateSpeed={0.8}
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 + 0.08}
          minPolarAngle={Math.PI / 6}
          minDistance={3.2}
          maxDistance={8.0}
        />
      </Canvas>

      {/* Interactive Selected Leaf Telemetry Drawer (Warm Luxury White) */}
      {selectedLeaf && (
        <div className="absolute bottom-16 left-4 right-4 bg-white/95 border border-[#e8f0e9] p-4 rounded-2xl shadow-[0px_14px_36px_rgba(44,107,79,0.12)] backdrop-blur-md z-20 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex justify-between items-start mb-2.5">
            <div>
              <span className="text-[10px] font-bold text-[#2c6b4f] uppercase tracking-wider">Leaf Node Telemetry</span>
              <h5 className="text-sm font-bold text-[#172a21]">{selectedLeaf.label}</h5>
            </div>
            <button
              onClick={() => setSelectedLeaf(null)}
              className="text-xs text-[#83978b] hover:text-[#172a21] px-2.5 py-1 bg-[#f2f7f3] hover:bg-[#e8f0e9] rounded-full transition-all"
            >
              Close ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs mb-2.5">
            <div className="bg-[#f7faf8] p-2.5 rounded-xl border border-[#e8f0e9]">
              <span className="text-[#83978b] block text-[10px]">Tissue Vitality</span>
              <span className={`font-bold text-sm ${selectedLeaf.health > 80 ? 'text-[#34c759]' : 'text-[#eab308]'}`}>
                {selectedLeaf.health}%
              </span>
            </div>
            <div className="bg-[#f7faf8] p-2.5 rounded-xl border border-[#e8f0e9]">
              <span className="text-[#83978b] block text-[10px]">Turgor Moisture</span>
              <span className="font-bold text-sm text-sky-600">{selectedLeaf.moisture}%</span>
            </div>
          </div>
          {selectedLeaf.issue ? (
            <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <strong>Pathology Marker:</strong> {selectedLeaf.issue}
              </div>
            </div>
          ) : (
            <div className="bg-[#e8f0e9]/70 border border-[#c5ddc7] p-2.5 rounded-xl text-xs text-[#2c6b4f] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#34c759] shrink-0" />
              <div>Optimal cellular turgor and active chlorophyll density.</div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Telemetry Badges */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs z-10 pointer-events-none">
        <div className="pointer-events-auto flex gap-2">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#e8f0e9] flex items-center gap-2 text-[#172a21] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#34c759]" />
            <span className="text-xs font-bold text-[#2c6b4f]">Health: {healthScore}%</span>
          </div>
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#e8f0e9] flex items-center gap-2 text-[#172a21] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="text-xs font-bold text-teal-800">Growth: {growthScore}%</span>
          </div>
        </div>

        <div className="pointer-events-auto text-[10px] font-medium text-[#4a5d52] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#e8f0e9] shadow-xs">
          Orbit 360° • Zoom • Tap Leaves
        </div>
      </div>
    </div>
  );
};
