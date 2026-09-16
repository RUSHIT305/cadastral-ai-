import React, { useState } from "react";
import { AiExtractionMetrics } from "../../types/cadastre";
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Cpu,
  Layers,
  Building2,
  Route,
  Activity
} from "lucide-react";

interface AiExtractionEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: AiExtractionMetrics;
  onRunPipeline: (config: any) => void;
}

export const AiExtractionEngineModal: React.FC<AiExtractionEngineModalProps> = ({
  isOpen,
  onClose,
  metrics,
  onRunPipeline
}) => {
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85);
  const [orthogonalization, setOrthogonalization] = useState<"low" | "medium" | "high">("high");
  const [minBuildingFootprint, setMinBuildingFootprint] = useState(15);
  const [enableDsmSeparation, setEnableDsmSeparation] = useState(true);
  const [enableRoadGraph, setEnableRoadGraph] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const pipelineSteps = [
    { name: "Stage 1: Data Ingestion (ORI, DSM/DTM, GIS parcels, CORS stations)", icon: Activity },
    { name: "Stage 2: Georeferencing & QA (EPSG:32643 CRS, residual checks)", icon: Layers },
    { name: "Stage 3: ParcelVision Boundary Segmentation (U-Net & SAM)", icon: Cpu },
    { name: "Stage 4: UrbanFeature AI (Buildings, access corridors, DSM heights)", icon: Building2 },
    { name: "Stage 5: Geometry Generation & Orthogonal Regularization", icon: Route },
    { name: "Stage 6: TopoGuard Integrity Audit & Slivers Clearance", icon: Sparkles },
    { name: "Stage 7: Evidence Card & Preliminary Vector Layer Assembly", icon: CheckCircle2 }
  ];

  const handleStartExtraction = () => {
    setIsRunning(true);
    setActiveStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < pipelineSteps.length) {
        setActiveStep(step);
      } else {
        clearInterval(interval);
        setIsRunning(false);
        setActiveStep(null);
        onRunPipeline({
          confidenceThreshold,
          orthogonalization,
          minBuildingFootprint,
          enableDsmSeparation,
          enableRoadGraph
        });
      }
    }, 550);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div
        id="ai-extraction-modal"
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-500/30 bg-gradient-to-r from-[#0a1628] via-[#112443] to-[#0d1d36] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-white shadow-md shadow-orange-500/20">
              <Sparkles className="w-5 h-5 text-yellow-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  ParcelVision & UrbanFeature AI Engine
                </h2>
                <span className="text-[10px] bg-blue-500/30 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold border border-cyan-400/30">
                  SIH 26012
                </span>
              </div>
              <p className="text-xs text-slate-300">
                01 ParcelVision Boundary Proposal & 02 UrbanFeature Extraction Pipeline
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

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs">
          {/* Real-Time Quantitative AI Model Metrics */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-slate-500 text-[11px] block">Boundary Precision</span>
              <span className="text-lg font-bold text-blue-700 font-mono">
                {metrics.meanBoundaryPrecision}%
              </span>
              <span className="text-[10px] text-emerald-700 block mt-0.5">± 0.05m tolerance</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-slate-500 text-[11px] block">IoU Overlap Score</span>
              <span className="text-lg font-bold text-blue-700 font-mono">
                {metrics.iouScore}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Intersection / Union</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-slate-500 text-[11px] block">Topology Compliance</span>
              <span className="text-lg font-bold text-emerald-700 font-mono">
                {metrics.topologyComplianceRate}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Zero planar gaps</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-slate-500 text-[11px] block">Drone Ortho GSD</span>
              <span className="text-lg font-bold text-purple-700 font-mono">
                {metrics.droneGsdCm} cm
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Sub-decimeter</span>
            </div>
          </div>

          {/* Pipeline Execution Stages */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                Pipeline Stages Execution
              </span>
              {isRunning && (
                <span className="text-blue-700 text-[11px] font-semibold animate-pulse">
                  Processing sector tensor...
                </span>
              )}
            </div>

            <div className="space-y-2">
              {pipelineSteps.map((step, idx) => {
                const Icon = step.icon;
                const isCurrent = activeStep === idx;
                const isFinished = activeStep !== null && activeStep > idx;

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition ${
                      isCurrent
                        ? "bg-blue-50 border-blue-400 text-blue-900 font-bold"
                        : isFinished
                        ? "bg-white border-slate-200 text-slate-700"
                        : "bg-white/60 border-slate-200 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isCurrent ? "text-blue-600 animate-spin" : isFinished ? "text-emerald-600" : "text-slate-400"}`} />
                      <span>{step.name}</span>
                    </div>
                    {isFinished && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {isCurrent && <span className="text-[11px] text-blue-600 font-mono">Running</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Extraction Hyperparameters */}
          <div className="space-y-4">
            <span className="font-bold text-slate-700 text-xs uppercase tracking-wider block">
              Segmentation & Regularization Parameters
            </span>

            <div className="grid grid-cols-2 gap-4">
              {/* Confidence Slider */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Confidence Threshold:</span>
                  <span className="font-mono text-blue-700 font-bold">
                    {Math.round(confidenceThreshold * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.65"
                  max="0.98"
                  step="0.01"
                  value={confidenceThreshold}
                  onChange={e => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-[10px] text-slate-500">
                  Higher thresholds minimize false positives in dense shanties and mixed plots.
                </p>
              </div>

              {/* Orthogonalization Regularization */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-slate-600 font-medium block text-xs">
                  Polygon Boundary Regularization:
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {(["low", "medium", "high"] as const).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setOrthogonalization(lvl)}
                      className={`py-1 rounded text-[11px] font-semibold capitalize border transition ${
                        orthogonalization === lvl
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500">
                  Squaring 90° corners on planned urban plots while preserving organic curves.
                </p>
              </div>
            </div>

            {/* Feature Extractors Toggles */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableDsmSeparation}
                  onChange={e => setEnableDsmSeparation(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <span className="font-semibold text-slate-800 block text-xs">
                    DSM Building Height Delineation
                  </span>
                  <span className="text-[10.5px] text-slate-500">
                    Use LiDAR DSM - DTM differences to isolate roof structures
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableRoadGraph}
                  onChange={e => setEnableRoadGraph(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <span className="font-semibold text-slate-800 block text-xs">
                    Road & Access Corridor Isolation
                  </span>
                  <span className="text-[10.5px] text-slate-500">
                    Clip parcel bounds against public right-of-way networks
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Cancel
          </button>
          <button
            id="btn-execute-ai-pipeline"
            disabled={isRunning}
            onClick={handleStartExtraction}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-bold rounded-lg shadow-md shadow-orange-500/25 transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white text-white" />
            <span>{isRunning ? "Extracting Cadastre..." : "Execute AI Extraction"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
