import React from "react";
import { GroundTruthPoint, Parcel } from "../../types/cadastre";
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Camera,
  Check,
  Wrench,
  Navigation,
  ShieldCheck
} from "lucide-react";

interface GroundTruthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  groundTruthPoints: GroundTruthPoint[];
  setGroundTruthPoints: React.Dispatch<React.SetStateAction<GroundTruthPoint[]>>;
  selectedGtPointId: string | null;
  setSelectedGtPointId: (id: string | null) => void;
  parcels: Parcel[];
  setParcels: React.Dispatch<React.SetStateAction<Parcel[]>>;
  onFocusGtPoint: (pt: GroundTruthPoint) => void;
}

export const GroundTruthDrawer: React.FC<GroundTruthDrawerProps> = ({
  isOpen,
  onClose,
  groundTruthPoints,
  setGroundTruthPoints,
  selectedGtPointId,
  setSelectedGtPointId,
  parcels,
  setParcels,
  onFocusGtPoint
}) => {
  if (!isOpen) return null;

  // Snap the nearest parcel boundary node to the surveyor's verified GT point
  const handleSnapParcelToGt = (gt: GroundTruthPoint) => {
    setParcels(prev =>
      prev.map(parcel => {
        let didModify = false;
        const updatedCoords = parcel.coordinates.map(coord => {
          const dist = Math.hypot(coord.x - gt.coordinate.x, coord.y - gt.coordinate.y);
          if (dist < 5.0) {
            didModify = true;
            return { ...gt.coordinate };
          }
          return coord;
        });

        if (didModify) {
          return {
            ...parcel,
            coordinates: updatedCoords,
            groundTruthStatus: "Verified",
            notes: `${parcel.notes || ""} [Snapped to field GT stone ${gt.id}]`
          };
        }
        return parcel;
      })
    );

    setGroundTruthPoints(prev =>
      prev.map(p => (p.id === gt.id ? { ...p, verificationStatus: "Matches AI", offsetMeters: 0.02 } : p))
    );
  };

  return (
    <div
      id="gt-drawer"
      className="absolute top-14 left-4 z-20 w-96 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-80px)] text-xs select-none"
    >
      {/* Header */}
      <div className="p-4 border-b border-indigo-500/30 bg-gradient-to-r from-[#0a1628] via-[#112443] to-[#0d1d36] text-white flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 border border-emerald-400/40 text-emerald-200 shadow-sm">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                FieldLink: Targeted Ground Truthing
              </h2>
              <span className="text-[9.5px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold border border-emerald-400/30">
                04 FieldLink
              </span>
            </div>
            <p className="text-[11px] text-emerald-300">
              Risk-based task selection & CORS-RTK GNSS field points ({groundTruthPoints.length} active)
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-300 hover:text-white text-sm p-1 rounded-lg hover:bg-white/10 transition"
        >
          ✕
        </button>
      </div>

      {/* GT Point List */}
      <div className="p-4 space-y-3 overflow-y-auto">
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Active Base: <strong>CORS-ND-01 (Fixed)</strong></span>
          </div>
          <span className="text-emerald-700 font-mono font-bold">± 1.4 cm</span>
        </div>

        <div className="space-y-2">
          {groundTruthPoints.map(gt => {
            const isSelected = gt.id === selectedGtPointId;
            const isMatch = gt.verificationStatus === "Matches AI";

            return (
              <div
                key={gt.id}
                onClick={() => {
                  setSelectedGtPointId(gt.id);
                  onFocusGtPoint(gt);
                }}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? "bg-blue-50/60 border-blue-400 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <MapPin className={`w-3.5 h-3.5 ${isMatch ? "text-emerald-600" : "text-amber-600"}`} />
                      <span>{gt.id} - {gt.featureObserved}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {gt.surveyorId} | {gt.timestamp}
                    </div>
                  </div>

                  <span
                    className={`text-[9.5px] px-2 py-0.5 rounded font-semibold ${
                      isMatch
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {gt.verificationStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mt-2 text-[10.5px] font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <div className="text-slate-700">E: {gt.coordinate.x.toFixed(2)}m</div>
                  <div className="text-slate-700">N: {gt.coordinate.y.toFixed(2)}m</div>
                  <div className="text-slate-500">Elev: {gt.elevationMeters}m</div>
                  <div className={isMatch ? "text-emerald-700" : "text-amber-700 font-bold"}>
                    Δ Offset: {gt.offsetMeters}m
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 mt-2 italic">"{gt.notes}"</p>

                {/* Photo & Snap Action */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200">
                  {gt.photoUrl ? (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Camera className="w-3 h-3 text-blue-600" />
                      <span>Field Photo Attached</span>
                    </div>
                  ) : (
                    <span />
                  )}

                  {!isMatch && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleSnapParcelToGt(gt);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[10px] shadow-xs transition"
                    >
                      <Wrench className="w-3 h-3" />
                      Snap Cadastre to GT Point
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
