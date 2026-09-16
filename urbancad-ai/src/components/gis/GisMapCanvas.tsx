import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
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
  Coordinate
} from "../../types/cadastre";
import {
  calculatePolygonArea,
  calculatePerimeter,
  calculateCentroid,
  calculateDistance,
  metersToLatLng,
  snapVertex
} from "../../utils/geometry";
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  Compass,
  Crosshair,
  Radio,
  MapPin,
  Ruler,
  Split
} from "lucide-react";

interface GisMapCanvasProps {
  parcels: Parcel[];
  setParcels: React.Dispatch<React.SetStateAction<Parcel[]>>;
  buildings: BuildingFootprint[];
  roads: RoadCorridor[];
  groundTruthPoints: GroundTruthPoint[];
  setGroundTruthPoints: React.Dispatch<React.SetStateAction<GroundTruthPoint[]>>;
  corsStations: CorsStation[];
  topologyErrors: TopologyError[];
  selectedParcelId: string | null;
  setSelectedParcelId: (id: string | null) => void;
  selectedBuildingId: string | null;
  setSelectedBuildingId: (id: string | null) => void;
  selectedGtPointId: string | null;
  setSelectedGtPointId: (id: string | null) => void;
  selectedTopologyErrorId: string | null;
  setSelectedTopologyErrorId: (id: string | null) => void;
  layerVisibility: LayerVisibility;
  layerOpacity: LayerOpacity;
  toolMode: GisToolMode;
  setToolMode: (mode: GisToolMode) => void;
  legacyParcels: Parcel[];
  onOpenAiAudit: (parcel: Parcel) => void;
}

export const GisMapCanvas: React.FC<GisMapCanvasProps> = ({
  parcels,
  setParcels,
  buildings,
  roads,
  groundTruthPoints,
  setGroundTruthPoints,
  corsStations,
  topologyErrors,
  selectedParcelId,
  setSelectedParcelId,
  selectedBuildingId,
  setSelectedBuildingId,
  selectedGtPointId,
  setSelectedGtPointId,
  selectedTopologyErrorId,
  setSelectedTopologyErrorId,
  layerVisibility,
  layerOpacity,
  toolMode,
  setToolMode,
  legacyParcels
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewTransform, setViewTransform] = useState({ x: 40, y: 30, scale: 1.05 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [cursorCoord, setCursorCoord] = useState<{ x: number; y: number; lat: number; lng: number; elevation: number }>({
    x: 0,
    y: 0,
    lat: 28.6139,
    lng: 77.2090,
    elevation: 218.4
  });

  // Vertex drag editing state
  const [draggingVertex, setDraggingVertex] = useState<{ parcelId: string; vertexIndex: number } | null>(null);

  // Measurement tool state
  const [measurePoints, setMeasurePoints] = useState<Coordinate[]>([]);

  // Split parcel line tool state
  const [splitLine, setSplitLine] = useState<Coordinate[]>([]);

  // Swipe compare slider position (percentage 0 - 100)
  const [swipePosition, setSwipePosition] = useState(50);
  const [isDraggingSwipe, setIsDraggingSwipe] = useState(false);

  // Helper to convert screen to world coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number): Coordinate => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const relX = screenX - rect.left;
    const relY = screenY - rect.top;
    const worldX = (relX - viewTransform.x) / viewTransform.scale;
    const worldY = (relY - viewTransform.y) / viewTransform.scale;
    return {
      x: Math.round(worldX * 10) / 10,
      y: Math.round(worldY * 10) / 10
    };
  }, [viewTransform]);

  // Handle Wheel Zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newScale = Math.max(0.4, Math.min(6.0, viewTransform.scale * zoomFactor));

    const newX = mouseX - (mouseX - viewTransform.x) * (newScale / viewTransform.scale);
    const newY = mouseY - (mouseY - viewTransform.y) * (newScale / viewTransform.scale);

    setViewTransform({ x: newX, y: newY, scale: newScale });
  };

  // Handle Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (toolMode === "pan" || e.button === 1 || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewTransform.x, y: e.clientY - viewTransform.y });
    }
  };

  // Handle Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    const world = screenToWorld(e.clientX, e.clientY);
    const latLng = metersToLatLng(world.x, world.y);
    const elevation = 216.5 + Math.sin(world.x / 120) * 3 + Math.cos(world.y / 150) * 2;
    setCursorCoord({
      x: world.x,
      y: world.y,
      lat: latLng.lat,
      lng: latLng.lng,
      elevation: Math.round(elevation * 10) / 10
    });

    if (isPanning) {
      setViewTransform(prev => ({
        ...prev,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      }));
      return;
    }

    if (draggingVertex) {
      const allTargets: Coordinate[] = [];
      parcels.forEach(p => {
        if (p.id !== draggingVertex.parcelId) {
          allTargets.push(...p.coordinates);
        }
      });
      corsStations.forEach(c => allTargets.push(c.coordinate));

      const { snapped } = snapVertex(world, allTargets, 4.0);

      setParcels(prev =>
        prev.map(p => {
          if (p.id !== draggingVertex.parcelId) return p;
          const updatedCoords = [...p.coordinates];
          updatedCoords[draggingVertex.vertexIndex] = snapped;
          const newArea = Math.round(calculatePolygonArea(updatedCoords));
          const newPerimeter = Math.round(calculatePerimeter(updatedCoords));
          return {
            ...p,
            coordinates: updatedCoords,
            areaSqMeters: newArea,
            perimeterMeters: newPerimeter
          };
        })
      );
    }

    if (isDraggingSwipe && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pct = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
      setSwipePosition(pct);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingVertex(null);
    setIsDraggingSwipe(false);
  };

  // Handle Canvas Click for various tool modes
  const handleCanvasClick = (e: React.MouseEvent) => {
    const world = screenToWorld(e.clientX, e.clientY);

    if (toolMode === "measure_distance") {
      setMeasurePoints(prev => [...prev, world]);
      return;
    }

    if (toolMode === "add_gt_point") {
      const newGtPoint: GroundTruthPoint = {
        id: `GT-${Date.now().toString().slice(-4)}`,
        surveyorId: "SURV-FIELD-ROVER",
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
        coordinate: world,
        accuracyCm: 1.5,
        elevationMeters: Math.round(cursorCoord.elevation * 100) / 100,
        featureObserved: "Cadastral Boundary Stone",
        verificationStatus: "Matches AI",
        offsetMeters: 0.05,
        notes: `Recorded at E:${world.x}m N:${world.y}m with RTK FIX. Sub-centimeter accuracy.`
      };
      setGroundTruthPoints(prev => [...prev, newGtPoint]);
      setSelectedGtPointId(newGtPoint.id);
      setToolMode("select");
      return;
    }

    if (toolMode === "split_parcel" && selectedParcelId) {
      if (splitLine.length === 0) {
        setSplitLine([world]);
      } else {
        const p1 = splitLine[0];
        const p2 = world;
        setSplitLine([]);
        executeSplitParcel(selectedParcelId, p1, p2);
        setToolMode("select");
      }
    }
  };

  const executeSplitParcel = (parcelId: string, p1: Coordinate, p2: Coordinate) => {
    const target = parcels.find(p => p.id === parcelId);
    if (!target) return;

    const midX = (p1.x + p2.x) / 2;
    const halfArea = Math.round(target.areaSqMeters / 2);

    const parcelA: Parcel = {
      ...target,
      id: `${target.id}-A`,
      ulpin: `${target.ulpin}-A`,
      surveyNumber: `${target.surveyNumber}/1`,
      coordinates: target.coordinates.map(c => ({
        x: c.x < midX ? c.x : midX - 2,
        y: c.y
      })),
      areaSqMeters: halfArea,
      recordedAreaSqMeters: halfArea,
      notes: "Subdivided via automated parcel split tool."
    };

    const parcelB: Parcel = {
      ...target,
      id: `${target.id}-B`,
      ulpin: `${target.ulpin}-B`,
      surveyNumber: `${target.surveyNumber}/2`,
      coordinates: target.coordinates.map(c => ({
        x: c.x >= midX ? c.x : midX + 2,
        y: c.y
      })),
      areaSqMeters: target.areaSqMeters - halfArea,
      recordedAreaSqMeters: target.areaSqMeters - halfArea,
      notes: "Subdivided via automated parcel split tool."
    };

    setParcels(prev => [...prev.filter(p => p.id !== parcelId), parcelA, parcelB]);
    setSelectedParcelId(parcelA.id);
  };

  const fitToBounds = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    let minX = 60, maxX = 780, minY = 50, maxY = 580;
    if (parcels.length > 0) {
      const allCoords = parcels.flatMap(p => p.coordinates);
      if (allCoords.length > 0) {
        minX = Math.min(...allCoords.map(c => c.x));
        maxX = Math.max(...allCoords.map(c => c.x));
        minY = Math.min(...allCoords.map(c => c.y));
        maxY = Math.max(...allCoords.map(c => c.y));
      }
    }

    const contentW = Math.max(250, (maxX - minX) + 120);
    const contentH = Math.max(200, (maxY - minY) + 120);

    const scaleX = rect.width / contentW;
    const scaleY = rect.height / contentH;
    const newScale = Math.max(0.4, Math.min(2.8, Math.min(scaleX, scaleY) * 0.9));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const newX = rect.width / 2 - centerX * newScale;
    const newY = rect.height / 2 - centerY * newScale;

    setViewTransform({
      x: Math.round(newX),
      y: Math.round(newY),
      scale: Number(newScale.toFixed(3))
    });
  }, [parcels]);

  useEffect(() => {
    const timer = setTimeout(fitToBounds, 80);
    const handleResize = () => fitToBounds();
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [fitToBounds]);

  // Color mapping by Land Use Category with rich government jewel tones and contrast
  const getLandUseFill = (landUse: string) => {
    switch (landUse) {
      case "Residential":
        return "rgba(30, 64, 175, 0.22)"; // Royal Sapphire Blue
      case "Commercial":
        return "rgba(217, 119, 6, 0.24)"; // Deep Amber Gold
      case "Mixed-Use":
        return "rgba(126, 34, 206, 0.22)"; // Royal Violet
      case "Institutional":
        return "rgba(14, 116, 144, 0.24)"; // Deep Cyan-Teal
      case "Industrial":
        return "rgba(51, 65, 85, 0.22)"; // Steel Slate
      case "Open Space / Park":
        return "rgba(5, 150, 105, 0.26)"; // Lush Emerald Jade
      case "Encroached / Disputed":
        return "rgba(220, 38, 38, 0.26)"; // High-Alert Crimson
      default:
        return "rgba(100, 116, 139, 0.20)";
    }
  };

  const getLandUseStroke = (landUse: string) => {
    switch (landUse) {
      case "Residential":
        return "#1d4ed8";
      case "Commercial":
        return "#d97706";
      case "Mixed-Use":
        return "#7e22ce";
      case "Institutional":
        return "#0e7490";
      case "Industrial":
        return "#334155";
      case "Open Space / Park":
        return "#059669";
      case "Encroached / Disputed":
        return "#dc2626";
      default:
        return "#475569";
    }
  };

  const totalMeasuredDistance = useMemo(() => {
    if (measurePoints.length < 2) return 0;
    let sum = 0;
    for (let i = 0; i < measurePoints.length - 1; i++) {
      sum += calculateDistance(measurePoints[i], measurePoints[i + 1]);
    }
    return Math.round(sum * 10) / 10;
  }, [measurePoints]);

  return (
    <div
      ref={containerRef}
      id="cadastral-gis-canvas"
      className="relative w-full h-full bg-slate-100 overflow-hidden select-none cursor-crosshair"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
    >
      {/* SVG Map Render Engine */}
      <svg
        className="w-full h-full"
        style={{
          transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`,
          transformOrigin: "0 0"
        }}
      >
        <defs>
          {/* Light Cadastral Grid Pattern */}
          <pattern id="grid-pattern" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(148, 163, 184, 0.35)" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.5" fill="rgba(100, 116, 139, 0.3)" />
          </pattern>

          {/* Light Orthophoto Asphalt Road Texture */}
          <pattern id="road-asphalt-light" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#94a3b8" />
            <path d="M 0 10 L 20 10" stroke="#f8fafc" strokeWidth="0.75" strokeDasharray="3 3" />
          </pattern>

          {/* Light Orthophoto Park Texture */}
          <pattern id="green-park-light" width="30" height="30" patternUnits="userSpaceOnUse">
            <rect width="30" height="30" fill="#dcfce7" />
            <circle cx="10" cy="10" r="6" fill="#86efac" opacity="0.6" />
            <circle cx="22" cy="22" r="5" fill="#4ade80" opacity="0.5" />
          </pattern>

          {/* DSM Elevation Heatmap Gradient */}
          <linearGradient id="dsm-gradient-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#06b6d4" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#10b981" stopOpacity="0.45" />
            <stop offset="85%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.5" />
          </linearGradient>

          {/* Building Drop Shadow */}
          <filter id="building-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="2" dy="3" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.25" />
          </filter>

          {/* Pulsing Error Glow */}
          <filter id="error-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Base Orthorectified Imagery (ORI) Simulation Layer */}
        {layerVisibility.orthoImagery && (
          <g opacity={layerOpacity.orthoImagery}>
            {/* Background Terrain Canvas */}
            <rect x="0" y="0" width="1000" height="750" fill="#f1f5f9" />
            <rect x="20" y="20" width="960" height="710" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />

            {/* Simulated Aerial Landscape Textures */}
            <rect x="640" y="115" width="175" height="165" fill="url(#green-park-light)" rx="4" />
            <rect x="635" y="310" width="180" height="175" fill="#e2e8f0" rx="4" />

            {/* Reservoir / Water Feature */}
            <circle cx="720" cy="180" r="28" fill="#38bdf8" opacity="0.6" stroke="#0284c7" strokeWidth="2" />
            <text x="720" y="184" fill="#0369a1" fontSize="9" textAnchor="middle" fontWeight="bold">RESERVOIR</text>

            <rect x="135" y="490" width="135" height="150" fill="#e2e8f0" />
            <line x1="140" y1="530" x2="265" y2="530" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="140" y1="570" x2="265" y2="570" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="140" y1="610" x2="265" y2="610" stroke="#cbd5e1" strokeWidth="2" />
          </g>
        )}

        {/* 2. Digital Surface Model (DSM) Elevation Layer */}
        {layerVisibility.dsmElevation && (
          <g opacity={layerOpacity.dsmElevation}>
            <rect x="20" y="20" width="960" height="710" fill="url(#dsm-gradient-light)" style={{ mixBlendMode: "multiply" }} />
            <ellipse cx="350" cy="350" rx="280" ry="180" fill="none" stroke="rgba(15, 23, 42, 0.3)" strokeWidth="1" strokeDasharray="4 4" />
            <ellipse cx="380" cy="360" rx="190" ry="120" fill="none" stroke="rgba(15, 23, 42, 0.4)" strokeWidth="1" />
            <ellipse cx="400" cy="370" rx="100" ry="60" fill="none" stroke="rgba(15, 23, 42, 0.5)" strokeWidth="1.2" />
            <text x="405" y="375" fill="#0f172a" fontSize="10" fontWeight="bold">224m</text>
            <text x="385" y="245" fill="#0f172a" fontSize="10" fontWeight="bold">220m</text>
            <text x="355" y="175" fill="#0f172a" fontSize="10" fontWeight="bold">216m</text>
          </g>
        )}

        {/* 3. Coordinate Survey Grid */}
        {layerVisibility.grid && (
          <rect x="0" y="0" width="1000" height="750" fill="url(#grid-pattern)" pointerEvents="none" />
        )}

        {/* 4. Road Networks & Access Corridors */}
        {layerVisibility.roadCorridors && (
          <g>
            {roads.map(road => (
              <g key={road.id} className="cursor-pointer">
                <polygon
                  points={road.polygon.map(p => `${p.x},${p.y}`).join(" ")}
                  fill={road.category === "Arterial Road" ? "#64748b" : "#94a3b8"}
                  stroke="#475569"
                  strokeWidth={road.category === "Arterial Road" ? "2" : "1"}
                  opacity="0.9"
                />
                <polyline
                  points={road.centerline.map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={road.category === "Arterial Road" ? "1.5" : "1"}
                  strokeDasharray={road.category === "Arterial Road" ? "6 4" : "4 4"}
                />
                {layerVisibility.labels && (
                  <text
                    x={(road.centerline[0].x + road.centerline[1].x) / 2}
                    y={(road.centerline[0].y + road.centerline[1].y) / 2 - 4}
                    fill="#0f172a"
                    fontSize="9.5"
                    fontWeight="700"
                    textAnchor="middle"
                    className="pointer-events-none drop-shadow-sm"
                  >
                    {road.name} ({road.widthMeters}m ROW)
                  </text>
                )}
              </g>
            ))}
          </g>
        )}

        {/* 5. Legacy Cadastral Survey Layer (Old Revenue Map Overlay) */}
        {layerVisibility.legacyCadastre && (
          <g opacity={layerOpacity.legacyCadastre}>
            {legacyParcels.map(legacy => (
              <polygon
                key={legacy.id}
                points={legacy.coordinates.map(p => `${p.x},${p.y}`).join(" ")}
                fill="rgba(217, 119, 6, 0.08)"
                stroke="#d97706"
                strokeWidth="2"
                strokeDasharray="6 3"
                className="pointer-events-none"
              />
            ))}
          </g>
        )}

        {/* 6. AI Extracted Preliminary Parcels */}
        {layerVisibility.aiParcels && (
          <g opacity={layerOpacity.aiParcels}>
            {parcels.map(parcel => {
              const isSelected = parcel.id === selectedParcelId;
              const centroid = calculateCentroid(parcel.coordinates);
              const pointsStr = parcel.coordinates.map(p => `${p.x},${p.y}`).join(" ");

              return (
                <g key={parcel.id} className="group">
                  <polygon
                    id={`parcel-poly-${parcel.id}`}
                    points={pointsStr}
                    fill={getLandUseFill(parcel.landUse)}
                    stroke={isSelected ? "#0284c7" : getLandUseStroke(parcel.landUse)}
                    strokeWidth={isSelected ? "3.5" : "2"}
                    strokeDasharray={parcel.topologyStatus !== "Clean" ? "5 3" : undefined}
                    className="cursor-pointer transition-colors duration-150 hover:opacity-90"
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedParcelId(parcel.id);
                      setSelectedBuildingId(null);
                      setSelectedGtPointId(null);
                    }}
                  />

                  {/* Parcel Centroid Badge & Label */}
                  {layerVisibility.labels && (
                    <g
                      className="pointer-events-none"
                      transform={`translate(${centroid.x}, ${centroid.y})`}
                    >
                      <rect
                        x="-45"
                        y="-16"
                        width="90"
                        height="32"
                        rx="5"
                        fill="rgba(255, 255, 255, 0.95)"
                        stroke={isSelected ? "#0284c7" : "#cbd5e1"}
                        strokeWidth="1.2"
                      />
                      <text
                        x="0"
                        y="-3"
                        fill="#0f172a"
                        fontSize="9.5"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {parcel.surveyNumber}
                      </text>
                      <text
                        x="0"
                        y="10"
                        fill="#475569"
                        fontSize="8"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {parcel.areaSqMeters.toLocaleString()} m²
                      </text>
                    </g>
                  )}

                  {/* Node Handles when Selected or in Edit Vertex Mode */}
                  {(isSelected || toolMode === "edit_vertex") &&
                    parcel.coordinates.map((coord, idx) => (
                      <circle
                        key={`v-${parcel.id}-${idx}`}
                        cx={coord.x}
                        cy={coord.y}
                        r={toolMode === "edit_vertex" && isSelected ? 6 : 4}
                        fill={isSelected ? "#0284c7" : "#ffffff"}
                        stroke="#0f172a"
                        strokeWidth="1.5"
                        className="cursor-move hover:scale-125 transition-transform"
                        onMouseDown={e => {
                          e.stopPropagation();
                          if (toolMode === "edit_vertex" || isSelected) {
                            setDraggingVertex({ parcelId: parcel.id, vertexIndex: idx });
                          }
                        }}
                      />
                    ))}
                </g>
              );
            })}
          </g>
        )}

        {/* 7. Building Footprints */}
        {layerVisibility.buildingFootprints && (
          <g opacity={layerOpacity.buildingFootprints} filter="url(#building-shadow)">
            {buildings.map(bldg => {
              const isSelected = bldg.id === selectedBuildingId;
              const pointsStr = bldg.coordinates.map(p => `${p.x},${p.y}`).join(" ");
              const centroid = calculateCentroid(bldg.coordinates);

              const roofColor = bldg.isEncroaching
                ? "rgba(239, 68, 68, 0.88)"
                : bldg.type === "Commercial"
                ? "rgba(249, 115, 22, 0.88)"
                : bldg.type === "Multi-Storey"
                ? "rgba(14, 165, 233, 0.88)"
                : "rgba(100, 116, 139, 0.88)";

              return (
                <g key={bldg.id}>
                  <polygon
                    id={`bldg-poly-${bldg.id}`}
                    points={pointsStr}
                    fill={roofColor}
                    stroke={isSelected ? "#0284c7" : bldg.isEncroaching ? "#dc2626" : "#475569"}
                    strokeWidth={isSelected ? "2.5" : "1.2"}
                    className="cursor-pointer transition-all hover:brightness-105"
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedBuildingId(bldg.id);
                      setSelectedParcelId(bldg.parcelId);
                    }}
                  />
                  {layerVisibility.labels && (
                    <text
                      x={centroid.x}
                      y={centroid.y + 3}
                      fill="#ffffff"
                      fontSize="8.5"
                      fontWeight="700"
                      textAnchor="middle"
                      className="pointer-events-none drop-shadow-sm"
                    >
                      {bldg.heightMeters}m ({bldg.floors}F)
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* 8. Topology Error Highlights */}
        {layerVisibility.topologyErrors && (
          <g filter="url(#error-glow)">
            {topologyErrors.map(err => {
              const isSelected = err.id === selectedTopologyErrorId;
              return (
                <g
                  key={err.id}
                  className="cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedTopologyErrorId(err.id);
                  }}
                >
                  <circle
                    cx={err.coordinate.x}
                    cy={err.coordinate.y}
                    r={isSelected ? 16 : 12}
                    fill={err.severity === "high" ? "rgba(239, 68, 68, 0.75)" : "rgba(234, 179, 8, 0.75)"}
                    stroke={err.severity === "high" ? "#dc2626" : "#ca8a04"}
                    strokeWidth="2.5"
                    className="animate-pulse"
                  />
                  <text
                    x={err.coordinate.x}
                    y={err.coordinate.y + 4}
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="900"
                    textAnchor="middle"
                  >
                    !
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* 9. Ground Truthing (GT) Survey Rover Points */}
        {layerVisibility.groundTruthPoints && (
          <g>
            {groundTruthPoints.map(gt => {
              const isSelected = gt.id === selectedGtPointId;
              const isMatch = gt.verificationStatus === "Matches AI";
              return (
                <g
                  key={gt.id}
                  className="cursor-pointer"
                  transform={`translate(${gt.coordinate.x}, ${gt.coordinate.y})`}
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedGtPointId(gt.id);
                  }}
                >
                  <circle
                    r={gt.accuracyCm * 3}
                    fill="none"
                    stroke={isMatch ? "rgba(22, 163, 74, 0.5)" : "rgba(234, 88, 12, 0.5)"}
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <circle
                    r={isSelected ? 7 : 5}
                    fill={isMatch ? "#16a34a" : "#ea580c"}
                    stroke="#ffffff"
                    strokeWidth="1.8"
                  />
                  <path d="M -3 0 L 3 0 M 0 -3 L 0 3" stroke="#ffffff" strokeWidth="1" />
                </g>
              );
            })}
          </g>
        )}

        {/* 10. CORS Base Stations */}
        {layerVisibility.corsStations && (
          <g>
            {corsStations.map(station => (
              <g
                key={station.id}
                transform={`translate(${station.coordinate.x}, ${station.coordinate.y})`}
                className="cursor-pointer"
              >
                <circle r="22" fill="none" stroke="rgba(2, 132, 199, 0.3)" strokeWidth="1.5" className="animate-ping" />
                <circle r="14" fill="none" stroke="#0284c7" strokeWidth="1.5" opacity="0.7" />
                <polygon points="0,-10 -6,6 6,6" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
                <circle cx="0" cy="-10" r="3" fill="#ffffff" />
                <text
                  x="0"
                  y="18"
                  fill="#0369a1"
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="middle"
                  className="pointer-events-none drop-shadow-sm font-mono"
                >
                  {station.stationCode}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* 11. Measurement Line Overlay */}
        {measurePoints.length > 0 && (
          <g>
            <polyline
              points={measurePoints.map(p => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#db2777"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
            {measurePoints.map((p, idx) => (
              <circle key={idx} cx={p.x} cy={p.y} r="4" fill="#db2777" stroke="#ffffff" strokeWidth="1.5" />
            ))}
          </g>
        )}

        {/* 12. Split Parcel Line */}
        {splitLine.length > 0 && (
          <g>
            <circle cx={splitLine[0].x} cy={splitLine[0].y} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
            <line
              x1={splitLine[0].x}
              y1={splitLine[0].y}
              x2={cursorCoord.x}
              y2={cursorCoord.y}
              stroke="#2563eb"
              strokeWidth="2"
              strokeDasharray="5 3"
            />
          </g>
        )}
      </svg>

      {/* Swipe Compare Split Line */}
      {toolMode === "swipe_compare" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - swipePosition}% 0 0)` }}
        >
          <div className="w-full h-full bg-amber-500/10 border-r-2 border-amber-500" />
        </div>
      )}

      {toolMode === "swipe_compare" && (
        <div
          id="swipe-divider-handle"
          className="absolute top-0 bottom-0 w-1 bg-amber-500 cursor-ew-resize flex items-center justify-center pointer-events-auto"
          style={{ left: `${swipePosition}%` }}
          onMouseDown={e => {
            e.stopPropagation();
            setIsDraggingSwipe(true);
          }}
        >
          <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-lg border border-white select-none">
            ⇄
          </div>
          <div className="absolute top-4 -left-36 bg-gradient-to-r from-amber-900/90 to-amber-950/90 text-amber-200 font-bold text-xs px-2.5 py-1 rounded shadow-md border border-amber-400/40 whitespace-nowrap">
            Legacy Revenue Map
          </div>
          <div className="absolute top-4 left-6 bg-gradient-to-r from-blue-900/90 to-indigo-950/90 text-cyan-200 font-bold text-xs px-2.5 py-1 rounded shadow-md border border-cyan-400/40 whitespace-nowrap">
            AI Proposal (ParcelVision)
          </div>
        </div>
      )}

      {/* Top Map Floating HUD (GIS Coordinates & Active Mode) */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 bg-gradient-to-r from-[#0a1628]/95 via-[#10223e]/95 to-[#0a1628]/95 backdrop-blur-md border border-indigo-400/40 px-3.5 py-2 rounded-xl shadow-xl text-xs font-mono text-white max-w-[calc(100vw-300px)]">
        <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span>E: <strong className="text-white">{cursorCoord.x.toFixed(1)}m</strong></span>
          <span className="text-indigo-400/50">|</span>
          <span>N: <strong className="text-white">{cursorCoord.y.toFixed(1)}m</strong></span>
        </div>
        <span className="text-indigo-400/40 hidden sm:inline">/</span>
        <div className="text-slate-300 hidden sm:block">
          WGS84: <span className="text-emerald-300">{cursorCoord.lat.toFixed(5)}°N, {cursorCoord.lng.toFixed(5)}°E</span>
        </div>
        <span className="text-indigo-400/40">/</span>
        <div className="text-amber-300 font-bold flex items-center gap-1">
          <span>DSM:</span> <span className="text-white bg-amber-500/30 px-1.5 py-0.5 rounded border border-amber-400/40">{cursorCoord.elevation}m</span>
        </div>
      </div>

      {/* Tool Guidance Banners (Centered horizontally to prevent collision with side panels) */}
      {toolMode === "measure_distance" && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-pink-950/90 to-rose-950/90 border border-pink-400/50 text-pink-100 px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xl backdrop-blur-md font-medium whitespace-nowrap">
          <Ruler className="w-4 h-4 text-pink-400" />
          <span>Click points to measure real-world distance. Total: <strong className="text-white font-bold">{totalMeasuredDistance}m</strong></span>
          <button
            onClick={() => setMeasurePoints([])}
            className="ml-2 px-2 py-0.5 bg-pink-500/20 hover:bg-pink-500/40 rounded text-pink-200 border border-pink-400/30 font-semibold"
          >
            Clear
          </button>
        </div>
      )}

      {toolMode === "add_gt_point" && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border border-emerald-400/50 text-emerald-100 px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xl backdrop-blur-md font-medium whitespace-nowrap">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>Click on canvas to record RTK Rover Ground Truthing (FieldLink) benchmark.</span>
        </div>
      )}

      {toolMode === "split_parcel" && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-blue-950/90 to-cyan-950/90 border border-cyan-400/50 text-cyan-100 px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xl backdrop-blur-md font-medium whitespace-nowrap">
          <Split className="w-4 h-4 text-cyan-400" />
          <span>
            {splitLine.length === 0
              ? "Click first boundary point on target parcel polygon to begin bisecting."
              : "Click second boundary point to complete legal parcel subdivision."}
          </span>
        </div>
      )}

      {/* Floating Canvas Controls (Zoom, Fit, Compass) */}
      <div className="absolute bottom-5 right-5 z-10 flex flex-col items-center gap-1.5 bg-gradient-to-b from-[#0a1628]/95 via-[#10223e]/95 to-[#0a1628]/95 backdrop-blur-md border border-indigo-400/40 p-1.5 rounded-xl shadow-xl text-white">
        <button
          id="btn-zoom-in"
          title="Zoom In"
          onClick={() => setViewTransform(v => ({ ...v, scale: Math.min(6, v.scale * 1.2) }))}
          className="p-1.5 hover:bg-white/10 text-slate-200 hover:text-white rounded-lg transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="btn-zoom-out"
          title="Zoom Out"
          onClick={() => setViewTransform(v => ({ ...v, scale: Math.max(0.4, v.scale / 1.2) }))}
          className="p-1.5 hover:bg-white/10 text-slate-200 hover:text-white rounded-lg transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          id="btn-fit-bounds"
          title="Fit Full Sector Extents"
          onClick={fitToBounds}
          className="p-1.5 hover:bg-white/10 text-slate-200 hover:text-white rounded-lg transition"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-indigo-400/30 my-0.5" />
        <div title="North Orientated (Grid North)" className="p-1 text-cyan-400">
          <Compass className="w-4 h-4" />
        </div>
      </div>

      {/* Bottom Scale Bar & CRS Info */}
      <div className="absolute bottom-5 left-5 z-10 flex items-center gap-3 bg-gradient-to-r from-[#0a1628]/95 via-[#10223e]/95 to-[#0a1628]/95 backdrop-blur-md border border-indigo-400/40 px-3.5 py-1.5 rounded-xl text-[11px] text-slate-300 font-mono shadow-xl">
        <div className="flex items-center gap-1.5">
          <div
            className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400 border border-slate-300 rounded-xs shadow-xs"
            style={{ width: `${Math.max(20, Math.round(50 * viewTransform.scale))}px` }}
          />
          <span className="font-bold text-white">50m</span>
        </div>
        <span className="text-indigo-400/40">|</span>
        <span className="text-cyan-200">EPSG:32643 (UTM 43N)</span>
        <span className="text-indigo-400/40">|</span>
        <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> CORS RTK Fix (±1.4cm)
        </span>
      </div>
    </div>
  );
};
