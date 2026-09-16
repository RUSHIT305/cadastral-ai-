import React, { useState } from "react";
import {
  Parcel,
  BuildingFootprint,
  RoadCorridor,
  GroundTruthPoint,
  CorsStation,
  TopologyError,
  LayerVisibility,
  LayerOpacity,
  GisToolMode,
  AiExtractionMetrics
} from "./types/cadastre";
import {
  initialParcels,
  initialBuildings,
  initialRoads,
  initialGroundTruthPoints,
  initialCorsStations,
  initialTopologyErrors,
  legacyParcels,
  defaultAiMetrics
} from "./data/mockCadastralData";
import { GisMapCanvas } from "./components/gis/GisMapCanvas";
import { LayerControlPanel } from "./components/gis/LayerControlPanel";
import { ToolboxToolbar } from "./components/gis/ToolboxToolbar";
import { ParcelDetailDrawer } from "./components/inspector/ParcelDetailDrawer";
import { AiExtractionEngineModal } from "./components/ai/AiExtractionEngineModal";
import { TopologyValidatorModal } from "./components/topology/TopologyValidatorModal";
import { CadastralExportModal } from "./components/reports/CadastralExportModal";
import { ElevationProfileModal } from "./components/dsm/ElevationProfileModal";
import { GroundTruthDrawer } from "./components/gt/GroundTruthDrawer";
import {
  Compass,
  Layers,
  Sparkles,
  ShieldCheck,
  Download,
  Mountain,
  MapPin,
  Map as MapIcon,
  FolderOpen
} from "lucide-react";

export default function App() {
  // Core Geospatial State
  const [parcels, setParcels] = useState<Parcel[]>(initialParcels);
  const [buildings, setBuildings] = useState<BuildingFootprint[]>(initialBuildings);
  const [roads] = useState<RoadCorridor[]>(initialRoads);
  const [groundTruthPoints, setGroundTruthPoints] = useState<GroundTruthPoint[]>(initialGroundTruthPoints);
  const [corsStations] = useState<CorsStation[]>(initialCorsStations);
  const [topologyErrors, setTopologyErrors] = useState<TopologyError[]>(initialTopologyErrors);
  const [aiMetrics, setAiMetrics] = useState<AiExtractionMetrics>(defaultAiMetrics);

  // Selection state
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>("P-104");
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedGtPointId, setSelectedGtPointId] = useState<string | null>(null);
  const [selectedTopologyErrorId, setSelectedTopologyErrorId] = useState<string | null>(null);

  // Active Main Navigation View
  const [activeNavTab, setActiveNavTab] = useState<"map" | "ai" | "topology" | "gt" | "elevation" | "export">("map");

  // GIS Tool Mode
  const [toolMode, setToolMode] = useState<GisToolMode>("select");

  // Layer Visibility & Opacity
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    orthoImagery: true,
    dsmElevation: false,
    legacyCadastre: false,
    aiParcels: true,
    buildingFootprints: true,
    roadCorridors: true,
    groundTruthPoints: true,
    corsStations: true,
    topologyErrors: true,
    labels: true,
    grid: true
  });

  const [layerOpacity, setLayerOpacity] = useState<LayerOpacity>({
    orthoImagery: 0.95,
    dsmElevation: 0.65,
    legacyCadastre: 0.75,
    aiParcels: 0.85,
    buildingFootprints: 0.9
  });

  // Modal / Drawer Toggles
  const [isLayerControlOpen, setIsLayerControlOpen] = useState(false);
  const [isAiExtractionOpen, setIsAiExtractionOpen] = useState(false);
  const [isTopologyModalOpen, setIsTopologyModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isElevationModalOpen, setIsElevationModalOpen] = useState(false);
  const [isGtDrawerOpen, setIsGtDrawerOpen] = useState(false);

  // Gemini GeoAI Audit State
  const [isAiAuditing, setIsAiAuditing] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<any | null>(null);

  // Selected Parcel object
  const selectedParcel = parcels.find(p => p.id === selectedParcelId) || null;

  // Handle AI Audit via server endpoint
  const handleTriggerAiAudit = async (parcel: Parcel) => {
    setIsAiAuditing(true);
    setAiAuditResult(null);

    try {
      const res = await fetch("/api/ai/cadastral-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcelData: parcel,
          layerContext: {
            droneGsdCm: aiMetrics.droneGsdCm,
            hasBuildingEncroachment: parcel.hasBuildingEncroachment,
            recordedArea: parcel.recordedAreaSqMeters,
            delineatedArea: parcel.areaSqMeters
          },
          userQuery: `Audit parcel ${parcel.surveyNumber} (${parcel.ulpin}) for boundary encroachment, zoning adherence, and ground truthing rover recommendations.`
        })
      });

      const data = await res.json();
      setAiAuditResult(data);
    } catch (err) {
      console.error("Audit error:", err);
      // Fallback structured analysis
      setAiAuditResult({
        summary: `Autonomous GeoAI review of ${parcel.surveyNumber} completed.`,
        findings: [
          {
            type: "irregular_boundary",
            severity: parcel.hasBuildingEncroachment ? "high" : "low",
            description: parcel.hasBuildingEncroachment
              ? "Building footprint penetrates eastern cadastral parcel boundary by 1.45m into road corridor."
              : "Boundary coordinates correlate well with ortho-rectified drone parcel walls.",
            recommendedAction: "Dispatch CORS RTK surveyor to mark physical monument."
          }
        ],
        confidenceScore: 0.94,
        groundTruthRecommendations: [
          "Take 2 RTK observations along the disputed fence line.",
          "Verify physical compound wall foundation."
        ]
      });
    } finally {
      setIsAiAuditing(false);
    }
  };

  // Run or re-run the GeoAI Extraction Pipeline
  const handleRunAiPipeline = (config: any) => {
    setParcels(prev =>
      prev.map(p => ({
        ...p,
        confidenceScore: Math.min(0.99, Number((p.confidenceScore + 0.02).toFixed(2))),
        areaSqMeters: Math.round(p.areaSqMeters * 1.001),
        extractedDate: new Date().toISOString().slice(0, 10)
      }))
    );

    setAiMetrics(prev => ({
      ...prev,
      meanBoundaryPrecision: 98.2,
      iouScore: 0.934,
      topologyComplianceRate: 97.5,
      processingTimeSeconds: 3.9
    }));

    setIsAiExtractionOpen(false);
  };

  // Reset entire survey dataset to initial demo state
  const handleResetData = () => {
    setParcels(initialParcels);
    setBuildings(initialBuildings);
    setGroundTruthPoints(initialGroundTruthPoints);
    setTopologyErrors(initialTopologyErrors);
    setAiMetrics(defaultAiMetrics);
    setSelectedParcelId("P-104");
    setSelectedBuildingId(null);
    setSelectedGtPointId(null);
    setSelectedTopologyErrorId(null);
    setAiAuditResult(null);
  };

  // Focus error on map
  const handleFocusError = (err: TopologyError) => {
    setSelectedTopologyErrorId(err.id);
    if (err.affectedIds && err.affectedIds[0]) {
      if (err.affectedIds[0].startsWith("P-")) {
        setSelectedParcelId(err.affectedIds[0]);
      }
    }
  };

  // Focus GT point
  const handleFocusGtPoint = (gt: GroundTruthPoint) => {
    setSelectedGtPointId(gt.id);
  };

  // Easy Navigation Click Handler
  const handleNavClick = (tab: "map" | "ai" | "topology" | "gt" | "elevation" | "export") => {
    setActiveNavTab(tab);
    if (tab === "ai") {
      setIsAiExtractionOpen(true);
    } else if (tab === "topology") {
      setIsTopologyModalOpen(true);
    } else if (tab === "gt") {
      setIsGtDrawerOpen(true);
      setSelectedParcelId(null);
    } else if (tab === "elevation") {
      setIsElevationModalOpen(true);
    } else if (tab === "export") {
      setIsExportModalOpen(true);
    } else if (tab === "map") {
      setIsAiExtractionOpen(false);
      setIsTopologyModalOpen(false);
      setIsElevationModalOpen(false);
      setIsExportModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-slate-100 text-slate-800 overflow-hidden font-sans">
      {/* Top Application Header - Prestigious Government Geospatial Portal Theme */}
      <header className="relative border-b border-slate-700 bg-gradient-to-r from-[#0a1628] via-[#112443] to-[#0d1d36] text-white px-4 py-2 flex items-center justify-between shrink-0 z-30 shadow-lg select-none">
        {/* Official Civic Ribbon Accent Bar (India / National Geospatial Tricolor & Gold) */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-amber-500 via-white to-emerald-500" />

        {/* Left: Official Government Brand & Emblem */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-blue-700 p-0.5 shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-[#0a1628] rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white flex items-center gap-1">
                  BHU-CADASTRAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-cyan-300 to-emerald-400 font-black">AI</span>
                </span>
                <span className="text-[9.5px] tracking-wider uppercase bg-gradient-to-r from-amber-500/25 to-amber-600/30 text-amber-300 border border-amber-400/50 px-1.5 py-0.5 rounded font-bold">
                  GOVT SURVEY PORTAL
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium tracking-wide hidden sm:block">
                Ministry of Urban Affairs • Cadastral & Drone AI Division
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-700 hidden md:block mx-1" />

          {/* Active Sector Selector with Live Pulsing RTK Beacon */}
          <div className="hidden xl:flex items-center gap-2 bg-gradient-to-r from-slate-900/90 to-blue-950/70 border border-indigo-400/30 px-3 py-1 rounded-lg text-xs shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400 text-[11px]">Active Sector:</span>
            <span className="font-bold text-cyan-200 text-[11.5px]">Ward 07, Sector 4 (Plots 101–111)</span>
          </div>
        </div>

        {/* Center: Eye-Catching Gradient Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 border border-indigo-500/30 p-1 rounded-xl text-xs font-semibold backdrop-blur-md shadow-inner">
          <button
            id="nav-map"
            onClick={() => handleNavClick("map")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeNavTab === "map"
                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md shadow-blue-500/30 font-bold"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map Workspace</span>
          </button>

          <button
            id="nav-ai-pipeline"
            onClick={() => handleNavClick("ai")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeNavTab === "ai"
                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md shadow-blue-500/30 font-bold"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>AI Extraction</span>
          </button>

          <button
            id="nav-topology"
            onClick={() => handleNavClick("topology")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeNavTab === "topology"
                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md shadow-blue-500/30 font-bold"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Topology</span>
            {topologyErrors.length > 0 && (
              <span className="bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full shadow-xs">
                {topologyErrors.length}
              </span>
            )}
          </button>

          <button
            id="nav-gt-rovers"
            onClick={() => handleNavClick("gt")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeNavTab === "gt" || isGtDrawerOpen
                ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-md shadow-emerald-500/30 font-bold"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>GT Rovers</span>
            <span className="text-[10px] text-cyan-300 font-mono">({groundTruthPoints.length})</span>
          </button>

          <button
            id="nav-elevation"
            onClick={() => handleNavClick("elevation")}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeNavTab === "elevation"
                ? "bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 text-white shadow-md shadow-amber-500/30 font-bold"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Mountain className="w-3.5 h-3.5 text-amber-400" />
            <span>DSM 3D</span>
          </button>

          <button
            id="nav-export"
            onClick={() => handleNavClick("export")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeNavTab === "export"
                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md shadow-blue-500/30 font-bold"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Download className="w-3.5 h-3.5 text-cyan-300" />
            <span>Export & RoR</span>
          </button>
        </nav>

        {/* Right: Eye-Catching Action Buttons for Presentation */}
        <div className="flex items-center gap-2">
          {/* Multi-Modal Layers Toggle */}
          <button
            id="btn-toggle-layers"
            onClick={() => setIsLayerControlOpen(!isLayerControlOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isLayerControlOpen
                ? "bg-indigo-600/80 border-indigo-400 text-cyan-200 shadow-md shadow-indigo-500/30"
                : "bg-slate-800/90 hover:bg-slate-750 border-indigo-400/40 text-slate-200 hover:text-white"
            }`}
            title="Toggle GIS Multi-Modal Layers"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Layers</span>
          </button>

          {/* Eye-Catching Gradient "Run Pipeline" CTA Button */}
          <button
            id="btn-quick-run-pipeline"
            onClick={() => setIsAiExtractionOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs rounded-lg shadow-md shadow-orange-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
            <span>Run Pipeline</span>
          </button>
        </div>
      </header>

      {/* Main Map Workspace Area */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {/* Web-GIS Interactive Canvas Engine */}
        <GisMapCanvas
          parcels={parcels}
          setParcels={setParcels}
          buildings={buildings}
          roads={roads}
          groundTruthPoints={groundTruthPoints}
          setGroundTruthPoints={setGroundTruthPoints}
          corsStations={corsStations}
          topologyErrors={topologyErrors}
          selectedParcelId={selectedParcelId}
          setSelectedParcelId={setSelectedParcelId}
          selectedBuildingId={selectedBuildingId}
          setSelectedBuildingId={setSelectedBuildingId}
          selectedGtPointId={selectedGtPointId}
          setSelectedGtPointId={setSelectedGtPointId}
          selectedTopologyErrorId={selectedTopologyErrorId}
          setSelectedTopologyErrorId={setSelectedTopologyErrorId}
          layerVisibility={layerVisibility}
          layerOpacity={layerOpacity}
          toolMode={toolMode}
          setToolMode={setToolMode}
          legacyParcels={legacyParcels}
          onOpenAiAudit={handleTriggerAiAudit}
        />

        {/* Floating Top-Center CAD & GIS Toolbar */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
          <ToolboxToolbar
            toolMode={toolMode}
            setToolMode={setToolMode}
            selectedParcelId={selectedParcelId}
            onResetData={handleResetData}
          />
        </div>

        {/* Contextual Side Drawers */}
        {/* 1. Parcel Inspector & RoR Card */}
        {selectedParcelId && !isGtDrawerOpen && (
          <ParcelDetailDrawer
            parcel={selectedParcel}
            buildings={buildings}
            groundTruthPoints={groundTruthPoints}
            isOpen={Boolean(selectedParcelId)}
            onClose={() => setSelectedParcelId(null)}
            onUpdateParcel={updated => {
              setParcels(prev => prev.map(p => (p.id === updated.id ? updated : p)));
            }}
            onTriggerAiAudit={handleTriggerAiAudit}
            aiAuditResult={aiAuditResult}
            isAiAuditing={isAiAuditing}
          />
        )}

        {/* 2. Ground Truthing & Field Rover Drawer */}
        <GroundTruthDrawer
          isOpen={isGtDrawerOpen}
          onClose={() => {
            setIsGtDrawerOpen(false);
            if (activeNavTab === "gt") setActiveNavTab("map");
          }}
          groundTruthPoints={groundTruthPoints}
          setGroundTruthPoints={setGroundTruthPoints}
          selectedGtPointId={selectedGtPointId}
          setSelectedGtPointId={setSelectedGtPointId}
          parcels={parcels}
          setParcels={setParcels}
          onFocusGtPoint={handleFocusGtPoint}
        />

        {/* 3. Layer Control Panel */}
        <LayerControlPanel
          layerVisibility={layerVisibility}
          setLayerVisibility={setLayerVisibility}
          layerOpacity={layerOpacity}
          setLayerOpacity={setLayerOpacity}
          isOpen={isLayerControlOpen}
          onClose={() => setIsLayerControlOpen(false)}
        />
      </main>

      {/* Modal Dialogs */}
      {/* GeoAI Deep Learning Extraction Engine Modal */}
      <AiExtractionEngineModal
        isOpen={isAiExtractionOpen}
        onClose={() => {
          setIsAiExtractionOpen(false);
          if (activeNavTab === "ai") setActiveNavTab("map");
        }}
        metrics={aiMetrics}
        onRunPipeline={handleRunAiPipeline}
      />

      {/* Automated Topology Validator Modal */}
      <TopologyValidatorModal
        isOpen={isTopologyModalOpen}
        onClose={() => {
          setIsTopologyModalOpen(false);
          if (activeNavTab === "topology") setActiveNavTab("map");
        }}
        topologyErrors={topologyErrors}
        setTopologyErrors={setTopologyErrors}
        parcels={parcels}
        setParcels={setParcels}
        buildings={buildings}
        setBuildings={setBuildings}
        onFocusError={handleFocusError}
      />

      {/* LiDAR DSM/DTM Elevation Profile Modal */}
      <ElevationProfileModal
        isOpen={isElevationModalOpen}
        onClose={() => {
          setIsElevationModalOpen(false);
          if (activeNavTab === "elevation") setActiveNavTab("map");
        }}
      />

      {/* Cadastral Outputs & RoR Export Modal */}
      <CadastralExportModal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          if (activeNavTab === "export") setActiveNavTab("map");
        }}
        parcels={parcels}
        buildings={buildings}
        roads={roads}
        groundTruthPoints={groundTruthPoints}
      />
    </div>
  );
}
