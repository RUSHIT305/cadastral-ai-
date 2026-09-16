import React from "react";
import { GisToolMode } from "../../types/cadastre";
import {
  MousePointer,
  Hand,
  VectorSquare,
  Split,
  Ruler,
  MapPin,
  SlidersHorizontal,
  RotateCcw
} from "lucide-react";

interface ToolboxToolbarProps {
  toolMode: GisToolMode;
  setToolMode: (mode: GisToolMode) => void;
  selectedParcelId: string | null;
  onResetData: () => void;
}

export const ToolboxToolbar: React.FC<ToolboxToolbarProps> = ({
  toolMode,
  setToolMode,
  onResetData
}) => {
  const tools = [
    {
      id: "select" as GisToolMode,
      label: "Select",
      icon: MousePointer,
      description: "Click parcels, buildings or GT points to inspect attributes"
    },
    {
      id: "pan" as GisToolMode,
      label: "Pan",
      icon: Hand,
      description: "Drag to pan across the cadastral orthophoto canvas"
    },
    {
      id: "edit_vertex" as GisToolMode,
      label: "Edit Nodes",
      icon: VectorSquare,
      description: "Drag boundary corners with sub-meter node snapping"
    },
    {
      id: "split_parcel" as GisToolMode,
      label: "Split",
      icon: Split,
      description: "Draw bisecting line to subdivide selected parcel polygon"
    },
    {
      id: "measure_distance" as GisToolMode,
      label: "Measure",
      icon: Ruler,
      description: "Measure real-world distances between boundary stones"
    },
    {
      id: "add_gt_point" as GisToolMode,
      label: "Add GT Point",
      icon: MapPin,
      description: "Record RTK rover ground truthing field verification point"
    },
    {
      id: "swipe_compare" as GisToolMode,
      label: "Swipe Compare",
      icon: SlidersHorizontal,
      description: "Swipe slider between legacy revenue map and AI extracted cadastre"
    }
  ];

  return (
    <div
      id="gis-toolbox-toolbar"
      className="flex items-center gap-1.5 bg-gradient-to-r from-[#0c1b33]/95 via-[#13274c]/95 to-[#0c1b33]/95 backdrop-blur-md border border-indigo-400/40 p-1.5 rounded-xl shadow-xl text-xs select-none text-white"
    >
      {tools.map(t => {
        const Icon = t.icon;
        const isActive = toolMode === t.id;
        return (
          <button
            key={t.id}
            id={`tool-${t.id}`}
            title={`${t.label}: ${t.description}`}
            onClick={() => setToolMode(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              isActive
                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-blue-500/40 font-bold"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-200" : "text-slate-400"}`} />
            <span className="hidden sm:inline text-[11.5px]">{t.label}</span>
          </button>
        );
      })}

      <div className="w-px h-5 bg-indigo-500/30 mx-1" />

      {/* Reset to Original Survey Demo */}
      <button
        id="btn-reset-cadastre"
        title="Reset all parcels, errors, and GT rovers to initial state"
        onClick={onResetData}
        className="flex items-center gap-1 px-2.5 py-1.5 text-amber-300 hover:text-amber-100 hover:bg-amber-500/20 rounded-lg transition-all text-[11.5px] font-semibold border border-amber-400/30"
      >
        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden md:inline">Reset</span>
      </button>
    </div>
  );
};
