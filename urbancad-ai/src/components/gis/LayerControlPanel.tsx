import React from "react";
import { LayerVisibility, LayerOpacity } from "../../types/cadastre";
import {
  Layers,
  Eye,
  EyeOff,
  Sliders,
  Camera,
  Mountain,
  FileSpreadsheet,
  Building2,
  Route,
  MapPin,
  Radio,
  AlertTriangle,
  Tag,
  Grid
} from "lucide-react";

interface LayerControlPanelProps {
  layerVisibility: LayerVisibility;
  setLayerVisibility: React.Dispatch<React.SetStateAction<LayerVisibility>>;
  layerOpacity: LayerOpacity;
  setLayerOpacity: React.Dispatch<React.SetStateAction<LayerOpacity>>;
  isOpen: boolean;
  onClose: () => void;
}

export const LayerControlPanel: React.FC<LayerControlPanelProps> = ({
  layerVisibility,
  setLayerVisibility,
  layerOpacity,
  setLayerOpacity,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const toggleLayer = (layerKey: keyof LayerVisibility) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  const handleOpacityChange = (layerKey: keyof LayerOpacity, value: number) => {
    setLayerOpacity(prev => ({
      ...prev,
      [layerKey]: value
    }));
  };

  const layersConfig: {
    key: keyof LayerVisibility;
    opacityKey?: keyof LayerOpacity;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
  }[] = [
    {
      key: "orthoImagery",
      opacityKey: "orthoImagery",
      label: "Drone Orthophoto (ORI)",
      description: "High-res GSD 2.5cm aerial orthomosaic",
      icon: Camera,
      color: "text-blue-600"
    },
    {
      key: "dsmElevation",
      opacityKey: "dsmElevation",
      label: "LiDAR DSM Elevation",
      description: "Surface model heatmap & rooftop contours",
      icon: Mountain,
      color: "text-amber-600"
    },
    {
      key: "aiParcels",
      opacityKey: "aiParcels",
      label: "AI Delineated Parcels",
      description: "Preliminary boundary polygons & ULPINs",
      icon: Layers,
      color: "text-indigo-600"
    },
    {
      key: "buildingFootprints",
      opacityKey: "buildingFootprints",
      label: "Building Footprints",
      description: "Extracted structures with heights & floors",
      icon: Building2,
      color: "text-rose-600"
    },
    {
      key: "roadCorridors",
      label: "Roads & Access Corridors",
      description: "Delineated pathways & ROW centerlines",
      icon: Route,
      color: "text-slate-600"
    },
    {
      key: "legacyCadastre",
      opacityKey: "legacyCadastre",
      label: "Legacy Revenue Map (1982)",
      description: "Historical cadastral boundary overlay",
      icon: FileSpreadsheet,
      color: "text-amber-700"
    },
    {
      key: "groundTruthPoints",
      label: "Ground Truthing (GT) Rovers",
      description: "Field verified RTK survey points",
      icon: MapPin,
      color: "text-emerald-600"
    },
    {
      key: "corsStations",
      label: "CORS GNSS Network",
      description: "Continuous reference stations",
      icon: Radio,
      color: "text-cyan-600"
    },
    {
      key: "topologyErrors",
      label: "Topology Violations",
      description: "Overlaps, slivers, and encroachments",
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      key: "labels",
      label: "Cadastral Labels & Dimensions",
      description: "Survey numbers, areas & building heights",
      icon: Tag,
      color: "text-purple-600"
    },
    {
      key: "grid",
      label: "Survey Coordinate Grid",
      description: "50m UTM Easting / Northing ticks",
      icon: Grid,
      color: "text-slate-500"
    }
  ];

  return (
    <div
      id="layer-control-panel"
      className="absolute top-14 right-4 z-20 w-84 bg-white/95 backdrop-blur-md border border-slate-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-80px)] text-xs select-none"
    >
      {/* Header */}
      <div className="p-4 border-b border-indigo-500/30 bg-gradient-to-r from-[#0a1628] via-[#112443] to-[#0d1d36] text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white border border-indigo-400/40 shadow-xs">
            <Layers className="w-4 h-4 text-cyan-200" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white">GIS Layers & Overlays</h2>
            <p className="text-[10.5px] text-cyan-200/80">Multi-modal survey data stack</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-300 hover:text-white text-sm p-1 rounded-lg hover:bg-white/10 transition"
        >
          ✕
        </button>
      </div>

      {/* Layer List */}
      <div className="p-3 space-y-2 overflow-y-auto">
        {layersConfig.map(layer => {
          const Icon = layer.icon;
          const isVisible = layerVisibility[layer.key];
          const opacity = layer.opacityKey ? layerOpacity[layer.opacityKey] : null;

          return (
            <div
              key={layer.key}
              className={`p-2.5 rounded-xl border transition-all ${
                isVisible
                  ? "bg-white border-slate-200 shadow-xs"
                  : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleLayer(layer.key)}
                    className={`p-1.5 rounded-lg transition ${
                      isVisible
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-slate-200 text-slate-400 hover:bg-slate-300"
                    }`}
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-[11.5px]">
                      <Icon className={`w-3.5 h-3.5 ${layer.color}`} />
                      <span>{layer.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{layer.description}</p>
                  </div>
                </div>
              </div>

              {/* Opacity Slider for raster & overlay layers */}
              {layer.opacityKey && isVisible && opacity !== null && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2">
                  <Sliders className="w-3 h-3 text-slate-400" />
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={opacity}
                    onChange={e => handleOpacityChange(layer.opacityKey!, parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="font-mono text-[10px] text-slate-500 w-8 text-right">
                    {Math.round(opacity * 100)}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Legend Summary */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[10.5px] text-slate-600">
        <span className="font-semibold text-slate-700 block mb-1">Land Use Legend:</span>
        <div className="grid grid-cols-2 gap-1 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-blue-500" />
            <span>Residential</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-orange-500" />
            <span>Commercial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-purple-500" />
            <span>Mixed-Use</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-green-500" />
            <span>Open Space / Park</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-red-500" />
            <span>Disputed / Encroached</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-slate-500" />
            <span>Road Right-of-Way</span>
          </div>
        </div>
      </div>
    </div>
  );
};
