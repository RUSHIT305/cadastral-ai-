import React, { useState } from "react";
import {
  Award,
  Layers,
  Cpu,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  MapPin,
  ShieldCheck,
  Compass,
  ArrowRight,
  FileSpreadsheet,
  Globe,
  Radio,
  ExternalLink,
  Users
} from "lucide-react";

interface SihPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSlide?: number;
}

export const SihPresentationModal: React.FC<SihPresentationModalProps> = ({
  isOpen,
  onClose,
  initialSlide = 0
}) => {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);

  if (!isOpen) return null;

  const slides = [
    {
      id: "title",
      number: "01",
      title: "Smart India Hackathon 2026",
      subtitle: "Problem ID: SIH 26012 | Team NeuroSpark Astra"
    },
    {
      id: "solution",
      number: "02",
      title: "Proposed Solution: Nagar-Seema AI",
      subtitle: "The 5 Core Pillars Delivered by the System"
    },
    {
      id: "technical",
      number: "03",
      title: "Technical Approach",
      subtitle: "End-to-End 7-Stage Geospatial AI Workflow"
    },
    {
      id: "feasibility",
      number: "04",
      title: "Feasibility and Viability",
      subtitle: "Why the Proposed System Can Be Deployed Realistically"
    },
    {
      id: "impact",
      number: "05",
      title: "Impact and Benefits",
      subtitle: "Baseline First; 6 Quantitative Governance Targets"
    },
    {
      id: "research",
      number: "06",
      title: "Research and References",
      subtitle: "Authoritative Sources, Standards & Protocols"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6 select-none overflow-y-auto">
      <div
        id="sih-presentation-deck"
        className="relative w-full max-w-5xl bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-800 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Civic Presentation Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-indigo-500/30 bg-gradient-to-r from-[#0a1628] via-[#112443] to-[#0d1d36] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 p-0.5 flex items-center justify-center shadow-sm">
              <Award className="w-5 h-5 text-yellow-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold text-white tracking-tight">
                  SMART INDIA HACKATHON 2026
                </h1>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold">
                  SIH 26012
                </span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-2 py-0.5 rounded-full font-bold">
                  Team ID: CSPIT-SIH-951352
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Team NeuroSpark Astra • Space Technology & Software
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Slide Navigation Pill */}
            <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-700 px-2 py-1 rounded-lg text-xs">
              <button
                disabled={currentSlide === 0}
                onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition rounded"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-cyan-300 font-mono font-bold px-2">
                {currentSlide + 1} / {slides.length}
              </span>
              <button
                disabled={currentSlide === slides.length - 1}
                onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition rounded"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              title="Close Presentation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Thumbnails Bar */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-100 border-b border-slate-200 overflow-x-auto text-xs shrink-0 no-scrollbar">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                currentSlide === idx
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              <span className="opacity-75 font-mono text-[10px]">{s.number}</span>
              <span>{s.title.split(":")[0]}</span>
            </button>
          ))}
        </div>

        {/* Slide Body Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gradient-to-br from-slate-50 via-white to-slate-50">
          {/* SLIDE 1: Title & Team */}
          {currentSlide === 0 && (
            <div className="space-y-6 max-w-4xl mx-auto py-4">
              <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#112443] to-[#0d1d36] text-white border border-indigo-500/30 shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-amber-400 font-bold tracking-widest text-xs uppercase bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
                    Smart India Hackathon 2026
                  </span>
                  <span className="text-cyan-300 font-mono text-xs">Problem ID — SIH 26012</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-4 leading-tight">
                  AI-Based Automated Urban Parcel Mapping and Cadastral Feature Extraction System Using Drone Imagery
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-700 text-xs">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[11px]">Theme</span>
                    <strong className="text-cyan-200 text-sm">Space Tech & Software</strong>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[11px]">PS Category</span>
                    <strong className="text-white text-sm">Software</strong>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[11px]">Team ID</span>
                    <strong className="text-amber-300 text-sm font-mono">CSPIT-SIH-951352</strong>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[11px]">Team Name</span>
                    <strong className="text-emerald-300 text-sm">Team NeuroSpark Astra</strong>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-indigo-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span>Deployed Platform: <strong>Nagar-Seema AI</strong></span>
                  </div>
                  <span className="italic text-cyan-200">
                    "Extract automatically. Validate geometrically. Verify on ground. Approve responsibly."
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentSlide(1)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  <span>Explore Proposed Solution (Slide 2)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SLIDE 2: Proposed Solution (5 Modules) */}
          {currentSlide === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    PROPOSED SOLUTION: Nagar-Seema AI
                  </h2>
                  <p className="text-xs text-slate-500">
                    What the system delivers: 5 interconnected modules from preliminary AI extraction to official GIS export
                  </p>
                </div>
                <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-200">
                  AI → VERIFY → APPROVE → EXPORT
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 01 ParcelVision */}
                <div className="p-4 bg-white rounded-2xl border border-blue-200 shadow-sm hover:shadow-md transition space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono font-bold text-[11px]">
                      01
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                      Boundary Proposal
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">ParcelVision</h3>
                  <p className="text-xs font-semibold text-blue-900">
                    Automated parcel-boundary proposal
                  </p>
                  <ul className="text-[11.5px] text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>Ingest drone imagery, ORI, DSM/DTM, GIS parcels & GT samples.</li>
                    <li>Generate candidate boundaries from walls, fences, roads, drainage, buildings & terrain breaks.</li>
                    <li>Confidence score + evidence card for every proposed edge.</li>
                    <li>Retain source geometry and AI-adjusted geometry for auditability.</li>
                  </ul>
                </div>

                {/* 02 UrbanFeature AI */}
                <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-sm hover:shadow-md transition space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-mono font-bold text-[11px]">
                      02
                    </span>
                    <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">
                      Feature Extraction
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">UrbanFeature AI</h3>
                  <p className="text-xs font-semibold text-rose-900">
                    Cadastral feature extraction
                  </p>
                  <ul className="text-[11.5px] text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>Detect buildings, roads, pathways, access corridors, open spaces & water features.</li>
                    <li>Use DSM/DTM context for overlapping structures, roof forms, narrow lanes & occlusions.</li>
                    <li>Flag encroachments, gaps, overlaps & alignment issues as verification candidates.</li>
                  </ul>
                </div>

                {/* 03 TopoGuard */}
                <div className="p-4 bg-white rounded-2xl border border-indigo-200 shadow-sm hover:shadow-md transition space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-mono font-bold text-[11px]">
                      03
                    </span>
                    <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                      Quality Control
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">TopoGuard</h3>
                  <p className="text-xs font-semibold text-indigo-900">
                    Automated cadastral quality control
                  </p>
                  <ul className="text-[11.5px] text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>Validate polygons, self-intersections, slivers, duplicates, gaps, overlaps & dangling lines.</li>
                    <li>Check parcel–building–road relationships and access-corridor connectivity.</li>
                    <li>Suggest snapping/edge matching with before/after comparison.</li>
                  </ul>
                </div>

                {/* 04 FieldLink */}
                <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-sm hover:shadow-md transition space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-[11px]">
                      04
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                      Ground Truthing
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">FieldLink</h3>
                  <p className="text-xs font-semibold text-emerald-900">
                    Targeted ground truthing
                  </p>
                  <ul className="text-[11.5px] text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>Prioritise uncertain or high-impact features for field verification.</li>
                    <li>Create mobile tasks with parcel ID, map snapshot, uncertainty reason & observation.</li>
                    <li>Capture GNSS/CORS points, photos, remarks & timestamped corrections.</li>
                    <li>Push approved corrections into training/validation data.</li>
                  </ul>
                </div>

                {/* 05 WebGIS Workbench */}
                <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition space-y-2.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-mono font-bold text-[11px]">
                      05
                    </span>
                    <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                      Human Decision Layer
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">WebGIS Workbench</h3>
                  <p className="text-xs font-semibold text-amber-900">
                    Human decision layer & review workflow
                  </p>
                  <ul className="text-[11.5px] text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>Layer switcher: ORI, DSM, DTM, parcels, buildings, roads, land use, GT & changes.</li>
                    <li>Side-by-side: existing map vs AI proposal vs verified geometry.</li>
                    <li>Workflow: AI suggestion → surveyor review → supervisor approval → GIS export.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: Technical Approach */}
          {currentSlide === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-extrabold text-slate-900">
                  03 | TECHNICAL APPROACH
                </h2>
                <p className="text-xs text-slate-500">
                  End-to-end 7-stage workflow from sensor ingestion to official GIS delivery
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* 1 */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center font-mono">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">DATA INGESTION</h4>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-3">
                    <li>Drone RGB/multispectral imagery</li>
                    <li>ORI • DSM/DTM</li>
                    <li>Existing GIS parcels • GT labels • GNSS/CORS survey points</li>
                  </ul>
                </div>

                {/* 2 */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center font-mono">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">GEOREFERENCING & QA</h4>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-3">
                    <li>CRS check (EPSG:32643 / UTM)</li>
                    <li>Ground-control / residual checks</li>
                    <li>Orthomosaic seam review • resolution/metadata validation • blur/cloud flags</li>
                  </ul>
                </div>

                {/* 3 */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center font-mono">
                    3
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">AI EXTRACTION</h4>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-3">
                    <li>Semantic segmentation for parcels/land use</li>
                    <li>Instance segmentation for buildings</li>
                    <li>Line/network extraction for roads & access corridors</li>
                  </ul>
                </div>

                {/* 4 */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center font-mono">
                    4
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">GEOMETRY GENERATION</h4>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-3">
                    <li>Raster masks → vector polygons/lines</li>
                    <li>Boundary regularisation & orthogonalization</li>
                    <li>Parcel polygon assembly → attribute attachment</li>
                  </ul>
                </div>

                {/* 5 */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center font-mono">
                    5
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">TOPOLOGY & CONSISTENCY</h4>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-3">
                    <li>No self-intersections • no duplicate edges</li>
                    <li>Gap/overlap checks • shared-edge consistency</li>
                    <li>Building-within-parcel • road connectivity</li>
                  </ul>
                </div>

                {/* 6 */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center font-mono">
                    6
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">FIELD VERIFICATION</h4>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-3">
                    <li>Confidence-based task queue</li>
                    <li>WebGIS interactive edit</li>
                    <li>GNSS/CORS/photographic evidence → approval workflow</li>
                  </ul>
                </div>

                {/* 7 */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 sm:col-span-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center font-mono">
                    7
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">GIS DELIVERY</h4>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-3">
                    <li>GeoPackage / PostGIS / GeoJSON / Shapefile-compatible export</li>
                    <li>Map services (WMS/WFS) • audit report • complete change log</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: Feasibility and Viability */}
          {currentSlide === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-extrabold text-slate-900">
                  FEASIBILITY AND VIABILITY
                </h2>
                <p className="text-xs text-slate-500">
                  Why the proposed system can be deployed realistically in urban local bodies (ULBs)
                </p>
              </div>

              {/* Core Idea Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                  Core Idea
                </span>
                <p className="text-base font-extrabold text-blue-950">
                  AI assists the workflow — authorised surveyors remain the final decision-makers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">1</span>
                    AVAILABLE INPUTS
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    High-resolution drone imagery, ORI, DSM/DTM, existing parcel layers, GT data and GNSS/CORS-enabled survey data.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                    ASSISTIVE, NOT AUTONOMOUS
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    AI generates preliminary features; authorised surveyors validate, edit and approve the final result.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                    MODULAR ROLLOUT
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Start with one urban ward covering planned, dense, irregular and mixed-use areas before scaling.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px]">4</span>
                    STANDARDS-BASED DELIVERY
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Use spatial-reference metadata and interoperable vector/raster outputs that fit existing GIS workflows.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-xs sm:col-span-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">5</span>
                    TARGETED FIELD WORK
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Uncertainty maps reduce blanket ground-truthing while flagging difficult boundaries for careful field verification.
                  </p>
                </div>
              </div>

              {/* Lifecycle ribbon */}
              <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs px-6">
                <span className="text-slate-400 font-mono">DEPLOYMENT MODEL:</span>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-cyan-300">INPUTS</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-blue-300">AI ASSIST</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-emerald-300">SURVEYOR REVIEW</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-amber-300">GIS DELIVERY</span>
                </div>
                <span className="text-slate-400 italic">Pilot → Validate → Refine → Scale</span>
              </div>
            </div>
          )}

          {/* SLIDE 5: Impact and Benefits (6 Pillars) */}
          {currentSlide === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-extrabold text-slate-900">
                  IMPACT AND BENEFITS
                </h2>
                <p className="text-xs text-slate-500">
                  Baseline first; targets agreed with the authority
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* 1 SPEED */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-blue-700">1</span>
                    <span className="font-extrabold text-slate-900 text-sm tracking-wider">SPEED</span>
                  </div>
                  <p className="text-slate-600">
                    Reduction in analyst hours required to produce a review-ready preliminary parcel layer.
                  </p>
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-blue-700 font-semibold">
                    Target: <strong>70%+ time saved</strong> per urban sector
                  </div>
                </div>

                {/* 2 ACCURACY */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-emerald-700">2</span>
                    <span className="font-extrabold text-slate-900 text-sm tracking-wider">ACCURACY</span>
                  </div>
                  <p className="text-slate-600">
                    Boundary-distance and polygon-overlap performance against authoritative / field-verified reference data.
                  </p>
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold">
                    Target: <strong>Sub-5cm boundary tolerance</strong>
                  </div>
                </div>

                {/* 3 QUALITY */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-indigo-700">3</span>
                    <span className="font-extrabold text-slate-900 text-sm tracking-wider">QUALITY</span>
                  </div>
                  <p className="text-slate-600">
                    Reduction in invalid geometries, gaps, overlaps, duplicate edges and disconnected road segments.
                  </p>
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-indigo-700 font-semibold">
                    Target: <strong>Zero planar topology slivers</strong>
                  </div>
                </div>

                {/* 4 FIELD PRODUCTIVITY */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-amber-700">4</span>
                    <span className="font-extrabold text-slate-900 text-sm tracking-wider">FIELD PRODUCTIVITY</span>
                  </div>
                  <p className="text-slate-600">
                    Increase in verified parcels / features per field day through risk-based task selection.
                  </p>
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-amber-700 font-semibold">
                    Target: <strong>3x–4x daily rovers verified</strong>
                  </div>
                </div>

                {/* 5 FIRST-PASS ACCEPTANCE */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-cyan-700">5</span>
                    <span className="font-extrabold text-slate-900 text-sm tracking-wider">FIRST-PASS ACCEPTANCE</span>
                  </div>
                  <p className="text-slate-600">
                    Percentage of AI-generated features requiring no geometry correction beyond approval.
                  </p>
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-cyan-700 font-semibold">
                    Target: <strong>85%+ initial sign-off rate</strong>
                  </div>
                </div>

                {/* 6 TRACEABILITY */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-purple-700">6</span>
                    <span className="font-extrabold text-slate-900 text-sm tracking-wider">TRACEABILITY</span>
                  </div>
                  <p className="text-slate-600">
                    100% of approved edits linked to user, timestamp, source evidence and reason code within the pilot.
                  </p>
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-purple-700 font-semibold">
                    Target: <strong>100% immutable audit log</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center text-xs text-amber-900 font-semibold">
                Pilot principle: measure against a verified baseline before locking performance targets.
              </div>
            </div>
          )}

          {/* SLIDE 6: Research and References */}
          {currentSlide === 5 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-extrabold text-slate-900">
                  RESEARCH AND REFERENCES
                </h2>
                <p className="text-xs text-slate-500">
                  Authoritative sources • Research foundations • Reproducible evaluation • Responsible approval
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Government & Institutional */}
                <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-xs space-y-3">
                  <h3 className="font-extrabold text-blue-950 uppercase tracking-wider text-[11px]">
                    GOVERNMENT & INSTITUTIONAL STANDARDS
                  </h3>
                  <div className="space-y-2 text-slate-700">
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <strong>01. Department of Land Resources — NAKSHA</strong>
                      <p className="text-[11px] text-slate-500">GIS-integrated urban parcels; aerial + field survey; ORI/DEM/3D/LIDAR.</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <strong>02. Survey of India — CORS</strong>
                      <p className="text-[11px] text-slate-500">DGNSS, NRTK, post-processing and Network RTK guidance.</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <strong>03. Survey of India — Geospatial Guidelines</strong>
                      <p className="text-[11px] text-slate-500">UAV photogrammetry, AI/geospatial technology, ground truthing & governance.</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <strong>04. Survey of India — National Geospatial Policy 2022</strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <strong>05. OGC — Simple Feature Access / ISO 19125</strong>
                      <p className="text-[11px] text-slate-500">Interoperable geometry representations + spatial reference systems.</p>
                    </div>
                  </div>
                </div>

                {/* Research & Data Protocol */}
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-xl border border-purple-200 shadow-xs space-y-2.5">
                    <h3 className="font-extrabold text-purple-950 uppercase tracking-wider text-[11px]">
                      RESEARCH & IMPLEMENTATION FOUNDATIONS
                    </h3>
                    <ul className="text-slate-700 space-y-1.5 list-disc pl-4 text-[11.5px]">
                      <li><strong>Ronneberger, Fischer & Brox (2015)</strong> — U-Net segmentation.</li>
                      <li><strong>Kirillov et al. (2023)</strong> — Segment Anything (SAM); interactive segmentation reference.</li>
                      <li><strong>GDAL / OGC / PostGIS</strong> — Raster/vector, CRS, geometry validity & spatial database operations.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-xs space-y-2.5">
                    <h3 className="font-extrabold text-emerald-950 uppercase tracking-wider text-[11px]">
                      DATA & EVALUATION PROTOCOL
                    </h3>
                    <ul className="text-slate-700 space-y-1.5 list-disc pl-4 text-[11.5px]">
                      <li>Record resolution, flight date, sensor, overlap, CRS, GCP method & software.</li>
                      <li>Split training/test by spatial blocks or wards — not random pixels.</li>
                      <li>Separate labels: parcels, buildings, roads, pathways, land use & topology errors.</li>
                      <li>Report uncertainty, edge cases, rejected inputs & field corrections.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Reference Integrity & Source Index */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-amber-400 font-bold uppercase tracking-wider text-[10.5px]">
                  <span>REFERENCE INTEGRITY & LEGAL DISCLAIMER</span>
                  <span>SOURCE INDEX</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Preliminary, verification-ready cadastral map only. Legal parcel boundaries, ownership records and final cadastral certification remain with authorised land-record and surveying authorities.
                </p>
                <div className="pt-2 border-t border-slate-700 text-[10.5px] font-mono text-cyan-300 flex flex-wrap gap-x-4 gap-y-1">
                  <span>dolr.gov.in/about-naksha</span>
                  <span>surveyofindia.gov.in</span>
                  <span>ogc.org/standards/sfa</span>
                  <span>arxiv.org/abs/1505.04597</span>
                  <span>arxiv.org/abs/2304.02643</span>
                  <span>gdal.org</span>
                  <span>postgis.net</span>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl text-center">
                <h4 className="font-black text-sm text-cyan-300 tracking-wider uppercase">NAGAR-SEEMA AI</h4>
                <p className="text-xs text-slate-200 italic mt-0.5">
                  Extract automatically. Validate geometrically. Verify on ground. Approve responsibly.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">SIH 26012 Presentation</span>
            <span className="text-slate-300">•</span>
            <span className="font-semibold text-slate-700">{slides[currentSlide].title}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentSlide === 0}
              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-semibold disabled:opacity-40 transition flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              disabled={currentSlide === slides.length - 1}
              onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:opacity-40 transition flex items-center gap-1 shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
