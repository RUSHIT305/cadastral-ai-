import React from "react";
import { Mountain, Layers, Eye, Info } from "lucide-react";

interface ElevationProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ElevationProfileModal: React.FC<ElevationProfileModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const profilePointsAA = [
    { x: 50, dtm: 216.5, dsm: 216.5, feature: "Road R-01" },
    { x: 120, dtm: 217.0, dsm: 217.0, feature: "Parcel P-101 Boundary" },
    { x: 145, dtm: 217.2, dsm: 224.4, feature: "B-101-A (7.2m G+1)" },
    { x: 225, dtm: 217.4, dsm: 224.4, feature: "Rooftop" },
    { x: 226, dtm: 217.4, dsm: 217.4, feature: "Courtyard Setback" },
    { x: 270, dtm: 217.5, dsm: 217.5, feature: "Access Corridor R-03" },
    { x: 310, dtm: 217.8, dsm: 236.3, feature: "B-102-A (18.5m G+5 Commercial)" },
    { x: 415, dtm: 218.0, dsm: 236.3, feature: "Commercial Tower" },
    { x: 416, dtm: 218.0, dsm: 218.0, feature: "Setback" },
    { x: 450, dtm: 218.2, dsm: 218.2, feature: "Pedestrian Alley R-04" },
    { x: 485, dtm: 218.5, dsm: 233.3, feature: "B-103-A (14.8m G+4 Mixed)" },
    { x: 585, dtm: 218.7, dsm: 233.3, feature: "Residential Flats" },
    { x: 625, dtm: 218.9, dsm: 218.9, feature: "Perimeter Road R-05" },
    { x: 640, dtm: 219.0, dsm: 219.0, feature: "Green Park (P-107)" },
    { x: 720, dtm: 217.0, dsm: 217.0, feature: "Reservoir Water Level" },
    { x: 800, dtm: 219.2, dsm: 219.2, feature: "East Sector Boundary" }
  ];

  const minX = 50;
  const maxX = 800;
  const minElev = 214;
  const maxElev = 240;

  const toSvgX = (x: number) => ((x - minX) / (maxX - minX)) * 700 + 50;
  const toSvgY = (elev: number) => 260 - ((elev - minElev) / (maxElev - minElev)) * 220;

  const dtmPath = profilePointsAA.map((p, i) => `${i === 0 ? "M" : "L"} ${toSvgX(p.x)} ${toSvgY(p.dtm)}`).join(" ");
  const dsmPath = profilePointsAA.map((p, i) => `${i === 0 ? "M" : "L"} ${toSvgX(p.x)} ${toSvgY(p.dsm)}`).join(" ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div
        id="elevation-profile-modal"
        className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-500/30 bg-gradient-to-r from-[#0a1628] via-[#112443] to-[#0d1d36] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm border border-amber-400/40">
              <Mountain className="w-5 h-5 text-yellow-200" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                LiDAR DSM / DTM 3D Elevation Cross-Section
              </h2>
              <p className="text-xs text-slate-300">
                Digital Surface Model (Roofs/Structures) vs Digital Terrain Model (Ground Surface)
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
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Key Elevation Metrics */}
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500">Datum Level:</span>
              <div className="text-base font-bold text-slate-800 font-mono mt-0.5">MSL (EGM2008)</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500">Ground Elevation (DTM):</span>
              <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">216.5m – 219.2m</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500">Peak Roof Level (DSM):</span>
              <div className="text-base font-bold text-amber-700 font-mono mt-0.5">236.3m (G+5 Tower)</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500">Vertical Accuracy:</span>
              <div className="text-base font-bold text-blue-700 font-mono mt-0.5">± 0.05m (5cm)</div>
            </div>
          </div>

          {/* SVG Transect Cross-Section Graph */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-800">Transect A-A' (West to East):</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-amber-600 rounded-xs" />
                  <span className="text-amber-800 font-semibold">DSM (Surface / Roofs)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-emerald-600 rounded-xs" />
                  <span className="text-emerald-800 font-semibold">DTM (Ground Terrain)</span>
                </div>
              </div>
              <span className="text-slate-500 font-mono">Scale 1:500</span>
            </div>

            <svg viewBox="0 0 800 300" className="w-full h-64 bg-white rounded-lg border border-slate-200">
              {/* Grid Lines */}
              {[215, 220, 225, 230, 235, 240].map(elev => {
                const y = toSvgY(elev);
                return (
                  <g key={elev}>
                    <line x1="50" y1={y} x2="750" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                    <text x="35" y={y + 4} fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">
                      {elev}m
                    </text>
                  </g>
                );
              })}

              {/* DTM Terrain Fill & Line */}
              <polygon
                points={`${toSvgX(minX)},${toSvgY(214)} ${profilePointsAA.map(p => `${toSvgX(p.x)},${toSvgY(p.dtm)}`).join(" ")} ${toSvgX(maxX)},${toSvgY(214)}`}
                fill="rgba(16, 185, 129, 0.12)"
              />
              <path d={dtmPath} fill="none" stroke="#059669" strokeWidth="2.5" />

              {/* DSM Surface Line (Buildings) */}
              <path d={dsmPath} fill="none" stroke="#d97706" strokeWidth="2.5" />

              {/* Building Height Dimension Bars */}
              {profilePointsAA.filter(p => p.dsm > p.dtm).map((p, idx) => (
                <g key={idx}>
                  <circle cx={toSvgX(p.x)} cy={toSvgY(p.dsm)} r="3.5" fill="#d97706" />
                  <text
                    x={toSvgX(p.x)}
                    y={toSvgY(p.dsm) - 8}
                    fill="#92400e"
                    fontSize="9.5"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {p.feature}
                  </text>
                </g>
              ))}

              {/* Baseline Labels */}
              <text x="50" y="285" fill="#64748b" fontSize="10">0m (West)</text>
              <text x="400" y="285" fill="#64748b" fontSize="10" textAnchor="middle">Distance Along Transect (Meters)</text>
              <text x="750" y="285" fill="#64748b" fontSize="10" textAnchor="end">800m (East)</text>
            </svg>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900">
            <span className="font-bold text-blue-800 block mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> DSM - DTM Height Extraction Principle:
            </span>
            By subtracting the Digital Terrain Model (bare-earth ground elevation derived from ground-classified LiDAR/photogrammetry points) from the Digital Surface Model (first-return reflective rooftop points), the system automatically derives accurate building heights and floor count estimates without manual ground surveying.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 bg-slate-50/80">
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
