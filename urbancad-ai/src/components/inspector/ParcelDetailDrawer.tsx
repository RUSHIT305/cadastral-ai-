import React, { useState } from "react";
import { Parcel, BuildingFootprint, GroundTruthPoint, LandUseCategory, WorkflowStage } from "../../types/cadastre";
import {
  FileText,
  MapPin,
  Home,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  Edit3,
  Check,
  Building2,
  Maximize,
  TrendingUp,
  TrendingDown,
  Info,
  ShieldCheck,
  FileCheck2,
  Clock,
  Layers,
  CheckCircle2,
  FileSignature
} from "lucide-react";

interface ParcelDetailDrawerProps {
  parcel: Parcel | null;
  buildings: BuildingFootprint[];
  groundTruthPoints: GroundTruthPoint[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateParcel: (updated: Parcel) => void;
  onTriggerAiAudit: (parcel: Parcel) => void;
  aiAuditResult: any | null;
  isAiAuditing: boolean;
}

export const ParcelDetailDrawer: React.FC<ParcelDetailDrawerProps> = ({
  parcel,
  buildings,
  groundTruthPoints,
  isOpen,
  onClose,
  onUpdateParcel,
  onTriggerAiAudit,
  aiAuditResult,
  isAiAuditing
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editLandUse, setEditLandUse] = useState<LandUseCategory>("Residential");
  const [editOwner, setEditOwner] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [showSourceGeometry, setShowSourceGeometry] = useState(false);

  if (!isOpen || !parcel) return null;

  const parcelBuildings = buildings.filter(b => b.parcelId === parcel.id);
  const totalBuildingFootprint = parcelBuildings.reduce((sum, b) => sum + b.areaSqMeters, 0);
  const bcr = parcel.areaSqMeters > 0 ? ((totalBuildingFootprint / parcel.areaSqMeters) * 100).toFixed(1) : "0";
  const areaDelta = parcel.areaSqMeters - parcel.recordedAreaSqMeters;
  const areaDeltaPct = parcel.recordedAreaSqMeters > 0 ? ((areaDelta / parcel.recordedAreaSqMeters) * 100).toFixed(1) : "0";

  const workflowStage: WorkflowStage = parcel.workflowStage || (
    parcel.groundTruthStatus === "Verified" ? "SUPERVISOR_APPROVAL" : "AI_SUGGESTION"
  );

  const handleStartEdit = () => {
    setEditLandUse(parcel.landUse);
    setEditOwner(parcel.ownerName);
    setEditNotes(parcel.notes || "");
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const updatedAudit = [
      ...(parcel.auditTrail || []),
      {
        action: "Attribute Edit",
        user: "Surveyor-Auth-2026",
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        reasonCode: "REVENUE_RECORD_RECONCILIATION"
      }
    ];

    onUpdateParcel({
      ...parcel,
      landUse: editLandUse,
      ownerName: editOwner,
      notes: editNotes,
      auditTrail: updatedAudit
    });
    setIsEditing(false);
  };

  const handleAdvanceWorkflow = (targetStage: WorkflowStage, reason: string) => {
    const updatedAudit = [
      ...(parcel.auditTrail || []),
      {
        action: `Transition to ${targetStage}`,
        user: targetStage === "GIS_EXPORT_READY" ? "Supervisor-Lead-DLRS" : "Surveyor-Field-07",
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        reasonCode: reason
      }
    ];

    onUpdateParcel({
      ...parcel,
      workflowStage: targetStage,
      groundTruthStatus: targetStage === "AI_SUGGESTION" ? "Pending Field GT" : "Verified",
      auditTrail: updatedAudit
    });
  };

  return (
    <div
      id="parcel-detail-drawer"
      className="absolute top-14 right-4 z-20 w-96 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-80px)] text-xs select-none"
    >
      {/* Header */}
      <div className="p-4 border-b border-indigo-500/30 bg-gradient-to-r from-[#0a1628] via-[#112443] to-[#0d1d36] text-white flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/40 font-bold shadow-2xs">
              {parcel.ulpin}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                parcel.groundTruthStatus === "Verified"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                  : parcel.groundTruthStatus === "Pending Field GT"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                  : "bg-rose-500/20 text-rose-300 border border-rose-400/40"
              }`}
            >
              {parcel.groundTruthStatus}
            </span>
          </div>
          <h2 className="text-base font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2">
            <span>Plot {parcel.surveyNumber}</span>
            <span className="text-[10.5px] font-normal text-slate-300">({parcel.landUse})</span>
          </h2>
          <p className="text-slate-300 text-[11px]">Official Land Record • Tenure: <span className="text-cyan-200 font-semibold">{parcel.tenureType}</span></p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-300 hover:text-white text-sm p-1 rounded-lg hover:bg-white/10 transition"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3.5 overflow-y-auto">
        {/* Slide 2: Workflow Lifecycle Progress (AI -> VERIFY -> APPROVE -> EXPORT) */}
        <div className="p-3 bg-gradient-to-r from-slate-900 to-[#10223e] text-white rounded-xl border border-indigo-400/30 space-y-2">
          <div className="flex items-center justify-between text-[10.5px]">
            <span className="text-cyan-300 font-bold uppercase tracking-wider">
              Cadastral Approval Workflow
            </span>
            <span className="font-mono text-amber-300 text-[10px]">
              {workflowStage.replace(/_/g, " ")}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1 text-[9.5px] text-center font-bold">
            <div className={`p-1 rounded ${workflowStage === "AI_SUGGESTION" ? "bg-blue-500 text-white" : "bg-white/10 text-slate-300"}`}>
              1. AI
            </div>
            <div className={`p-1 rounded ${workflowStage === "SURVEYOR_REVIEW" ? "bg-amber-500 text-white" : "bg-white/10 text-slate-300"}`}>
              2. Verify
            </div>
            <div className={`p-1 rounded ${workflowStage === "SUPERVISOR_APPROVAL" ? "bg-indigo-500 text-white" : "bg-white/10 text-slate-300"}`}>
              3. Approve
            </div>
            <div className={`p-1 rounded ${workflowStage === "GIS_EXPORT_READY" ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-300"}`}>
              4. Export
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-700 text-[10.5px]">
            {workflowStage === "AI_SUGGESTION" && (
              <button
                onClick={() => handleAdvanceWorkflow("SURVEYOR_REVIEW", "SURVEYOR_GEOMETRY_INSPECTION_STARTED")}
                className="w-full py-1 bg-blue-600 hover:bg-blue-500 rounded text-white font-bold flex items-center justify-center gap-1"
              >
                <FileCheck2 className="w-3.5 h-3.5" /> Start Surveyor Verification
              </button>
            )}
            {workflowStage === "SURVEYOR_REVIEW" && (
              <button
                onClick={() => handleAdvanceWorkflow("SUPERVISOR_APPROVAL", "SURVEYOR_VERIFIED_GROUND_EVIDENCE")}
                className="w-full py-1 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded font-bold flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Surveyor Verified
              </button>
            )}
            {workflowStage === "SUPERVISOR_APPROVAL" && (
              <button
                onClick={() => handleAdvanceWorkflow("GIS_EXPORT_READY", "SUPERVISOR_STATUTORY_AUTHORIZATION")}
                className="w-full py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-bold flex items-center justify-center gap-1"
              >
                <FileSignature className="w-3.5 h-3.5" /> Sign-Off & Approve for RoR
              </button>
            )}
            {workflowStage === "GIS_EXPORT_READY" && (
              <div className="text-emerald-400 font-bold flex items-center gap-1.5 w-full justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Legally Approved & Ready for GIS Delivery
              </div>
            )}
          </div>
        </div>

        {/* Slide 2: 01 ParcelVision Evidence Card & Retained Source Geometry */}
        <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-blue-950 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-600" /> ParcelVision Evidence Card
            </span>
            <span className="text-[10px] text-blue-700 bg-blue-100 font-mono px-2 py-0.5 rounded font-bold">
              Conf: {Math.round(parcel.confidenceScore * 100)}%
            </span>
          </div>

          <div className="space-y-1 text-slate-700 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Physical Edge Evidence:</span>
              <span className="font-semibold text-slate-800">Masonry Wall + Road Curb (ORI)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">DSM Terrain Break:</span>
              <span className="font-semibold text-emerald-700">Clear Step (Δh = 2.4m)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Drainage Alignment:</span>
              <span className="font-semibold text-slate-800">North-Facing Municipal Drain</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-blue-200 flex items-center justify-between text-[10.5px]">
            <span className="text-slate-600">Auditability:</span>
            <button
              onClick={() => setShowSourceGeometry(!showSourceGeometry)}
              className="text-blue-700 hover:text-blue-900 font-bold underline"
            >
              {showSourceGeometry ? "Hide Source Geometry" : "Compare Source vs Adjusted Geometry"}
            </button>
          </div>

          {showSourceGeometry && (
            <div className="p-2 bg-white rounded border border-blue-300 text-[10.5px] space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Source Vertices:</span>
                <span className="font-mono">{parcel.coordinates.length} points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Orthogonal Regularization:</span>
                <span className="text-emerald-700 font-semibold">Applied (±2.1cm shift)</span>
              </div>
              <div className="text-[9.5px] text-slate-500 italic">
                Source raw segmentation geometry is permanently retained in PostGIS/GeoPackage attributes.
              </div>
            </div>
          )}
        </div>

        {/* Ownership & Land Use */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Land Record Attributes
            </span>
            {!isEditing ? (
              <button
                onClick={handleStartEdit}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            ) : (
              <button
                onClick={handleSaveEdit}
                className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-bold"
              >
                <Check className="w-3 h-3" /> Save
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Registered Owner:</span>
                <span className="font-semibold text-slate-800">{parcel.ownerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Land-Use Zoning:</span>
                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {parcel.landUse}
                </span>
              </div>
              {parcel.notes && (
                <div className="pt-1 text-[11px] text-slate-500 border-t border-slate-200">
                  {parcel.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <div>
                <label className="text-[10px] text-slate-600 font-semibold block mb-1">Owner / Title Holder</label>
                <input
                  type="text"
                  value={editOwner}
                  onChange={e => setEditOwner(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 font-semibold block mb-1">Classified Land Use</label>
                <select
                  value={editLandUse}
                  onChange={e => setEditLandUse(e.target.value as LandUseCategory)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Mixed-Use">Mixed-Use</option>
                  <option value="Institutional">Institutional</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Open Space / Park">Open Space / Park</option>
                  <option value="Encroached / Disputed">Encroached / Disputed</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-600 font-semibold block mb-1">Surveyor Field Notes</label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* Spatial Measurement & Area Reconciliation */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Area Reconciliation (AI vs RoR Record)
          </span>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block">AI Delineated Area</span>
              <div className="text-sm font-bold text-blue-700 font-mono mt-0.5">
                {parcel.areaSqMeters.toLocaleString()} m²
              </div>
              <span className="text-[9.5px] text-slate-500">
                {(parcel.areaSqMeters * 10.7639).toLocaleString(undefined, { maximumFractionDigits: 0 })} sq.ft
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block">Recorded Revenue Area</span>
              <div className="text-sm font-bold text-slate-700 font-mono mt-0.5">
                {parcel.recordedAreaSqMeters.toLocaleString()} m²
              </div>
              <span className="text-[9.5px] text-slate-500">From historical RoR</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
            <span className="text-slate-600">Survey Area Variance (Δ):</span>
            <div className="flex items-center gap-1 font-mono font-bold">
              {areaDelta >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span className={areaDelta > 0 ? "text-amber-700" : "text-emerald-700"}>
                {areaDelta > 0 ? `+${areaDelta}` : areaDelta} m² ({areaDeltaPct}%)
              </span>
            </div>
          </div>

          <div className="flex justify-between text-slate-600 pt-1 text-[11px]">
            <span>Perimeter: <strong className="text-slate-800 font-mono">{parcel.perimeterMeters} m</strong></span>
            <span>AI Confidence: <strong className="text-blue-700 font-mono">{Math.round(parcel.confidenceScore * 100)}%</strong></span>
          </div>
        </div>

        {/* Building Structures & Built-up Ratio */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Detected Structures ({parcelBuildings.length})
            </span>
            <span className="text-indigo-700 font-mono font-semibold">BCR: {bcr}%</span>
          </div>

          {parcelBuildings.length === 0 ? (
            <div className="text-slate-500 py-1 italic">No building footprints detected on this parcel (Open Land).</div>
          ) : (
            <div className="space-y-1.5">
              {parcelBuildings.map(b => (
                <div
                  key={b.id}
                  className={`p-2 rounded-lg border flex items-center justify-between ${
                    b.isEncroaching
                      ? "bg-rose-50 border-rose-300 text-rose-800"
                      : "bg-white border-slate-200 text-slate-700"
                  }`}
                >
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      <span>{b.id} ({b.type})</span>
                      {b.isEncroaching && (
                        <span className="text-[9px] bg-rose-200 text-rose-800 px-1.5 py-0.2 rounded font-bold">
                          ENCROACHMENT
                        </span>
                      )}
                    </div>
                    <div className="text-[10.5px] text-slate-500">
                      Height: {b.heightMeters}m (DSM) | {b.floors} Floors | Footprint: {b.areaSqMeters} m²
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Slide 5: Traceability & Audit Trail Log */}
        {parcel.auditTrail && parcel.auditTrail.length > 0 && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> Statutory Audit Log
              </span>
              <span className="text-[9.5px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold border border-purple-200">
                100% Traceable
              </span>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {parcel.auditTrail.map((log, idx) => (
                <div key={idx} className="p-1.5 bg-white rounded border border-slate-200 text-[10px] space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{log.action}</span>
                    <span className="text-slate-400 font-mono text-[9px]">{log.timestamp.slice(11)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>By: <strong className="text-slate-700">{log.user}</strong></span>
                    <span className="font-mono text-[9px] text-indigo-600">{log.reasonCode}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gemini GeoAI Cadastral Audit Section */}
        <div className="p-3 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 rounded-xl border border-indigo-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-blue-950 font-bold">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>GeoAI Cadastral Discrepancy Audit</span>
            </div>
            <button
              id="btn-run-ai-audit"
              disabled={isAiAuditing}
              onClick={() => onTriggerAiAudit(parcel)}
              className="px-3 py-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-[11px] rounded-lg shadow-sm shadow-orange-500/25 transition disabled:opacity-50 flex items-center gap-1"
            >
              {isAiAuditing ? "Auditing..." : "Run AI Audit"}
            </button>
          </div>

          {aiAuditResult ? (
            <div className="space-y-2 pt-1 text-[11px]">
              <div className="p-2.5 bg-white rounded border border-blue-200 text-slate-700 shadow-2xs">
                <span className="text-blue-700 font-bold block mb-0.5">Executive Summary</span>
                {aiAuditResult.summary}
              </div>

              {aiAuditResult.findings && aiAuditResult.findings.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-slate-600 font-bold">Audit Findings:</span>
                  {aiAuditResult.findings.map((f: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-2 rounded border ${
                        f.severity === "high"
                          ? "bg-rose-50 border-rose-200 text-rose-800"
                          : "bg-white border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="font-bold text-[10px] uppercase tracking-wider text-amber-700">
                        {f.type.replace(/_/g, " ")} - {f.severity} severity
                      </div>
                      <div className="mt-0.5">{f.description}</div>
                      <div className="text-[10px] text-blue-700 font-semibold mt-1">Action: {f.recommendedAction}</div>
                    </div>
                  ))}
                </div>
              )}

              {aiAuditResult.groundTruthRecommendations && (
                <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-emerald-900 text-[10.5px]">
                  <span className="font-bold block mb-1">Survey Rover Field Guidance:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {aiAuditResult.groundTruthRecommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[10.5px] text-slate-600">
              Run Gemini deep multi-modal analysis on drone imagery offsets, right-of-way setbacks, and ground truthing rover alignment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
