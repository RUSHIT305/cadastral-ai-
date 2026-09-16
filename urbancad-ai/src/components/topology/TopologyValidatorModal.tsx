import React, { useState } from "react";
import { TopologyError, Parcel, BuildingFootprint } from "../../types/cadastre";
import {
  ShieldCheck,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Maximize2,
  RefreshCw,
  ExternalLink
} from "lucide-react";

interface TopologyValidatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  topologyErrors: TopologyError[];
  setTopologyErrors: React.Dispatch<React.SetStateAction<TopologyError[]>>;
  parcels: Parcel[];
  setParcels: React.Dispatch<React.SetStateAction<Parcel[]>>;
  buildings: BuildingFootprint[];
  setBuildings: React.Dispatch<React.SetStateAction<BuildingFootprint[]>>;
  onFocusError: (err: TopologyError) => void;
}

export const TopologyValidatorModal: React.FC<TopologyValidatorModalProps> = ({
  isOpen,
  onClose,
  topologyErrors,
  setTopologyErrors,
  parcels,
  setParcels,
  buildings,
  setBuildings,
  onFocusError
}) => {
  const [filterSeverity, setFilterSeverity] = useState<"all" | "high" | "medium" | "low">("all");
  const [activeTab, setActiveTab] = useState<"errors" | "rules">("errors");

  if (!isOpen) return null;

  const filteredErrors = topologyErrors.filter(err => {
    if (filterSeverity === "all") return true;
    return err.severity === filterSeverity;
  });

  // Automated Topology Auto-Fix
  const handleAutoFix = (errorId: string) => {
    const err = topologyErrors.find(e => e.id === errorId);
    if (!err) return;

    if (err.type === "overlap") {
      // Bisect overlapping polygon boundary
      setParcels(prev =>
        prev.map(p => {
          if (p.id === "P-104") {
            return {
              ...p,
              coordinates: [
                { x: 300, y: 150 },
                { x: 440, y: 150 },
                { x: 440, y: 280 },
                { x: 300, y: 280 }
              ],
              areaSqMeters: 18200,
              topologyStatus: "Clean",
              notes: `${p.notes || ""} [Auto-repaired boundary overlap with P-105]`
            };
          }
          if (p.id === "P-105") {
            return {
              ...p,
              coordinates: [
                { x: 440, y: 150 },
                { x: 580, y: 150 },
                { x: 580, y: 280 },
                { x: 440, y: 280 }
              ],
              areaSqMeters: 18200,
              topologyStatus: "Clean",
              notes: `${p.notes || ""} [Auto-repaired boundary overlap with P-104]`
            };
          }
          return p;
        })
      );
    } else if (err.type === "building_encroachment") {
      // Clip building footprint to lawful parcel boundaries
      setBuildings(prev =>
        prev.map(b => {
          if (b.id === "B-103-A") {
            return {
              ...b,
              isEncroaching: false,
              coordinates: [
                { x: 485, y: 345 },
                { x: 565, y: 345 },
                { x: 565, y: 440 },
                { x: 485, y: 440 }
              ],
              areaSqMeters: 7600
            };
          }
          return b;
        })
      );
    } else if (err.type === "sliver") {
      // Dissolve sliver into adjacent parcel
      setParcels(prev =>
        prev.map(p => {
          if (p.id === "P-102") {
            return {
              ...p,
              areaSqMeters: p.areaSqMeters + 12,
              notes: `${p.notes || ""} [Dissolved adjacent sliver polygon]`
            };
          }
          return p;
        })
      );
    }

    // Remove fixed error
    setTopologyErrors(prev => prev.filter(e => e.id !== errorId));
  };

  const handleFixAll = () => {
    topologyErrors.forEach(err => handleAutoFix(err.id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div
        id="topology-validator-modal"
        className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-500/30 bg-gradient-to-r from-[#0a1628] via-[#112443] to-[#0d1d36] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-cyan-200 border border-indigo-400/40 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  TopoGuard: Automated Cadastral Quality Control
                </h2>
                <span className="text-[10px] bg-indigo-500/30 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold border border-cyan-400/30">
                  Slide 2: 03 TopoGuard
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold shadow-xs ${
                    topologyErrors.length === 0
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                      : "bg-rose-500/25 text-rose-300 border border-rose-400/50"
                  }`}
                >
                  {topologyErrors.length === 0 ? "Topology Clean" : `${topologyErrors.length} Violations Found`}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Planar graph validation: self-intersections, slivers, duplicates, gaps, overlaps & parcel-building-road connectivity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white text-lg px-2 py-1 rounded-lg hover:bg-white/10 transition"
          >
            ✕
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("errors")}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
                activeTab === "errors"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              Violations Queue ({topologyErrors.length})
            </button>
            <button
              onClick={() => setActiveTab("rules")}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
                activeTab === "rules"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              Active Topology Rules (5)
            </button>
          </div>

          {topologyErrors.length > 0 && (
            <button
              id="btn-fix-all-topology"
              onClick={handleFixAll}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:brightness-110 text-white font-bold rounded-lg shadow-md shadow-emerald-600/20 transition"
            >
              <Wrench className="w-3.5 h-3.5 text-yellow-200" />
              <span>Auto-Repair All Violations</span>
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === "errors" ? (
            topologyErrors.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Topology Errors Detected</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  All cadastral parcels, building footprints, and road corridors strictly obey planar topology. No overlapping polygons, zero sliver gaps, and no road encroachments.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredErrors.map(err => (
                  <div
                    key={err.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4 transition hover:border-slate-300"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            err.severity === "high"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {err.severity} severity
                        </span>
                        <span className="font-bold text-slate-800 text-xs capitalize">
                          {err.type.replace(/_/g, " ")} Violation
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">{err.id}</span>
                      </div>

                      <p className="text-slate-700 text-xs font-medium">{err.description}</p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500">
                        <span>Affected: <strong className="text-slate-700">{err.affectedIds.join(", ")}</strong></span>
                        <span>Location: <strong className="text-slate-700 font-mono">E:{err.coordinate.x}m, N:{err.coordinate.y}m</strong></span>
                        <span>Rule: <strong className="text-slate-700">{err.rule}</strong></span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onFocusError(err);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        <Maximize2 className="w-3 h-3" /> Inspect on Map
                      </button>

                      {err.suggestedAction && (
                        <button
                          onClick={() => handleAutoFix(err.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>Auto-Fix</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-1">Rule 1: Must Not Overlap (Planar Partition)</h4>
                <p className="text-slate-600 text-xs">
                  No two parcel polygons can share interior area. Adjacent parcels must share identical boundary node coordinates.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-1">Rule 2: Must Not Have Slivers / Gaps</h4>
                <p className="text-slate-600 text-xs">
                  Adjacent property boundaries cannot have unallocated micro-sliver gaps (&lt; 0.5m width).
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-1">Rule 3: Building Setback & Right-of-Way Clearance</h4>
                <p className="text-slate-600 text-xs">
                  Building footprint polygons must not penetrate designated public road corridors or encroach across parcel boundaries.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/80">
          <div className="text-xs text-slate-500">
            Cadastral Rules Standard: <strong>ISO 19152 Land Administration Domain Model (LADM)</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
