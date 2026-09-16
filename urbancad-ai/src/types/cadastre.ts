export type LandUseCategory =
  | "Residential"
  | "Commercial"
  | "Mixed-Use"
  | "Institutional"
  | "Industrial"
  | "Road Corridor"
  | "Open Space / Park"
  | "Water Body"
  | "Encroached / Disputed";

export interface Coordinate {
  x: number; // canvas/projected coordinate (meters from origin)
  y: number;
  lat?: number;
  lng?: number;
  elevation?: number; // meters from DSM
}

export type WorkflowStage =
  | "AI_SUGGESTION"
  | "SURVEYOR_REVIEW"
  | "SUPERVISOR_APPROVAL"
  | "GIS_EXPORT_READY";

export interface ParcelEvidenceCard {
  edgeSources: string[]; // e.g. ["Compound Wall (ORI)", "Road Curbstone (DSM)", "Drainage Trench"]
  drainageContext: string;
  terrainBreakDetected: boolean;
  wallConfidence: number; // e.g. 0.96
  sourceVsAdjustedDeltaM: number; // e.g. 0.08m
}

export interface ParcelAuditRecord {
  action: string;
  user: string;
  timestamp: string;
  reasonCode: string;
}

export interface Parcel {
  id: string;
  ulpin: string; // Unique Land Parcel Identification Number
  surveyNumber: string; // e.g. "Ward-4/Plot-142"
  ownerName: string;
  tenureType: "Freehold" | "Leasehold" | "Municipal" | "Disputed";
  landUse: LandUseCategory;
  coordinates: Coordinate[]; // outer boundary ring
  sourceCoordinates?: Coordinate[]; // Retained source geometry for auditability
  areaSqMeters: number;
  recordedAreaSqMeters: number; // from legacy revenue records
  perimeterMeters: number;
  buildingCount: number;
  hasBuildingEncroachment: boolean;
  topologyStatus: "Clean" | "Overlap" | "Sliver Gap" | "Irregular Boundary";
  groundTruthStatus: "Verified" | "Pending Field GT" | "Discrepancy Flagged";
  confidenceScore: number; // AI extraction confidence
  workflowStage?: WorkflowStage; // AI -> VERIFY -> APPROVE -> EXPORT
  evidenceCard?: ParcelEvidenceCard;
  auditTrail?: ParcelAuditRecord[];
  notes?: string;
  extractedDate: string;
}

export interface BuildingFootprint {
  id: string;
  parcelId: string;
  type: "Residential" | "Commercial" | "Outbuilding" | "Temporary Shed" | "Multi-Storey";
  floors: number;
  heightMeters: number; // from DSM - DTM
  areaSqMeters: number;
  coordinates: Coordinate[];
  isEncroaching: boolean;
  encroachmentTarget?: string;
  confidenceScore: number;
}

export interface RoadCorridor {
  id: string;
  name: string;
  category: "Arterial Road" | "Collector Road" | "Local Street" | "Narrow Access Lane / Pathway";
  widthMeters: number;
  centerline: Coordinate[];
  polygon: Coordinate[];
  surfaceType: "Paved Asphalt" | "Concrete Paver" | "Unpaved / Earthen";
}

export interface GroundTruthPoint {
  id: string;
  surveyorId: string;
  timestamp: string;
  coordinate: Coordinate;
  accuracyCm: number; // RTK accuracy e.g. 1.8 cm
  elevationMeters: number;
  featureObserved: "Cadastral Boundary Stone" | "Building Corner" | "Road Edge" | "Compound Wall" | "Disputed Boundary";
  verificationStatus: "Matches AI" | "Offset Detected" | "New Feature";
  offsetMeters: number;
  notes: string;
  photoUrl?: string;
}

export interface CorsStation {
  id: string;
  stationCode: string; // e.g. "CORS-URBAN-01"
  name: string;
  coordinate: Coordinate;
  status: "Active Tracking" | "Calibrated";
  frequency: "L1/L2/L5 Multi-Band";
  baseElevationMeters: number;
}

export interface TopologyError {
  id: string;
  type: "OVERLAPPING_PARCELS" | "SLIVER_GAP" | "BUILDING_ENCROACHMENT" | "SELF_INTERSECTION" | "CORRIDOR_ENCROACHMENT";
  severity: "high" | "medium" | "low";
  description: string;
  affectedIds: string[];
  coordinate: Coordinate;
  detectedAreaSqM?: number;
  autoFixAvailable: boolean;
  fixActionName: string;
}

export interface LayerVisibility {
  orthoImagery: boolean; // ORI drone imagery
  dsmElevation: boolean; // Digital Surface Model elevation raster
  legacyCadastre: boolean; // Existing revenue survey map
  aiParcels: boolean; // AI Extracted preliminary parcel polygons
  buildingFootprints: boolean; // Extracted building polygons
  roadCorridors: boolean; // Road corridors & pathways
  groundTruthPoints: boolean; // Field GT survey points
  corsStations: boolean; // CORS GNSS base stations
  topologyErrors: boolean; // Red highlights of topology violations
  labels: boolean; // Parcel ID & survey numbers
  grid: boolean; // Cadastral survey coordinate grid
}

export interface LayerOpacity {
  orthoImagery: number;
  dsmElevation: number;
  legacyCadastre: number;
  aiParcels: number;
  buildingFootprints: number;
}

export type GisToolMode =
  | "pan"
  | "select"
  | "edit_vertex"
  | "split_parcel"
  | "merge_parcel"
  | "add_gt_point"
  | "measure_distance"
  | "swipe_compare";

export interface AiExtractionMetrics {
  totalParcelsExtracted: number;
  totalBuildingsExtracted: number;
  roadNetworkKm: number;
  meanBoundaryPrecision: number; // e.g. 96.4%
  iouScore: number; // e.g. 0.89
  topologyComplianceRate: number; // e.g. 94.2%
  processingTimeSeconds: number;
  droneGsdCm: number; // Ground Sample Distance e.g. 2.5 cm/pixel
  elevationResolutionM: number;
}
