import {
  Parcel,
  BuildingFootprint,
  RoadCorridor,
  GroundTruthPoint,
  CorsStation,
  TopologyError,
  AiExtractionMetrics
} from "../types/cadastre";

// Initial Parcels in an urban sector (coordinates in local meters grid: 0 to 1000m)
export const initialParcels: Parcel[] = [
  {
    id: "P-101",
    ulpin: "ULPIN-2806-004-0101",
    surveyNumber: "Sec-7/Plot-101",
    ownerName: "Devendra Verma & Brothers",
    tenureType: "Freehold",
    landUse: "Residential",
    coordinates: [
      { x: 120, y: 140 },
      { x: 260, y: 135 },
      { x: 265, y: 260 },
      { x: 125, y: 265 }
    ],
    areaSqMeters: 17350,
    recordedAreaSqMeters: 17200,
    perimeterMeters: 532,
    buildingCount: 2,
    hasBuildingEncroachment: false,
    topologyStatus: "Clean",
    groundTruthStatus: "Verified",
    confidenceScore: 0.98,
    notes: "Boundary confirmed with CORS base BM-01. Compound wall coincides with parcel edge.",
    extractedDate: "2026-09-12"
  },
  {
    id: "P-102",
    ulpin: "ULPIN-2806-004-0102",
    surveyNumber: "Sec-7/Plot-102",
    ownerName: "Aarav Infrastructure Ltd",
    tenureType: "Leasehold",
    landUse: "Commercial",
    coordinates: [
      { x: 280, y: 135 },
      { x: 440, y: 130 },
      { x: 445, y: 270 },
      { x: 285, y: 265 }
    ],
    areaSqMeters: 21900,
    recordedAreaSqMeters: 22400,
    perimeterMeters: 596,
    buildingCount: 1,
    hasBuildingEncroachment: false,
    topologyStatus: "Clean",
    groundTruthStatus: "Verified",
    confidenceScore: 0.96,
    notes: "Multi-storey commercial complex. Clear setbacks on North and West.",
    extractedDate: "2026-09-12"
  },
  {
    id: "P-103",
    ulpin: "ULPIN-2806-004-0103",
    surveyNumber: "Sec-7/Plot-103",
    ownerName: "Sunita & Manoj Aggarwal",
    tenureType: "Freehold",
    landUse: "Mixed-Use",
    coordinates: [
      { x: 460, y: 125 },
      { x: 620, y: 120 },
      { x: 615, y: 275 },
      { x: 465, y: 270 }
    ],
    areaSqMeters: 23600,
    recordedAreaSqMeters: 23800,
    perimeterMeters: 622,
    buildingCount: 3,
    hasBuildingEncroachment: false,
    topologyStatus: "Clean",
    groundTruthStatus: "Verified",
    confidenceScore: 0.95,
    notes: "Ground floor retail with residential apartments above.",
    extractedDate: "2026-09-12"
  },
  {
    id: "P-104",
    ulpin: "ULPIN-2806-004-0104",
    surveyNumber: "Sec-7/Plot-104",
    ownerName: "Rajesh Kumar Sharma",
    tenureType: "Freehold",
    landUse: "Residential",
    coordinates: [
      { x: 125, y: 295 },
      { x: 268, y: 290 },
      { x: 274, y: 445 },
      { x: 130, y: 450 }
    ],
    areaSqMeters: 22510,
    recordedAreaSqMeters: 21950,
    perimeterMeters: 602,
    buildingCount: 2,
    hasBuildingEncroachment: true,
    topologyStatus: "Overlap",
    groundTruthStatus: "Discrepancy Flagged",
    confidenceScore: 0.89,
    notes: "Building B-104-A extends beyond eastern cadastral boundary into access corridor.",
    extractedDate: "2026-09-13"
  },
  {
    id: "P-105",
    ulpin: "ULPIN-2806-004-0105",
    surveyNumber: "Sec-7/Plot-105",
    ownerName: "Kailash Chand & Sons",
    tenureType: "Freehold",
    landUse: "Residential",
    // Creates a minor overlap with P-106 to demonstrate topology error detection
    coordinates: [
      { x: 285, y: 290 },
      { x: 450, y: 288 },
      { x: 452, y: 440 },
      { x: 290, y: 445 }
    ],
    areaSqMeters: 25480,
    recordedAreaSqMeters: 25100,
    perimeterMeters: 638,
    buildingCount: 2,
    hasBuildingEncroachment: false,
    topologyStatus: "Overlap",
    groundTruthStatus: "Pending Field GT",
    confidenceScore: 0.92,
    notes: "Eastern fence overlaps by 1.8m into adjacent parcel P-106.",
    extractedDate: "2026-09-13"
  },
  {
    id: "P-106",
    ulpin: "ULPIN-2806-004-0106",
    surveyNumber: "Sec-7/Plot-106",
    ownerName: "Pooja Mehta",
    tenureType: "Freehold",
    landUse: "Residential",
    // Intentionally overlapping slightly with P-105 western edge (x=442 vs x=450)
    coordinates: [
      { x: 442, y: 288 },
      { x: 610, y: 285 },
      { x: 605, y: 435 },
      { x: 445, y: 440 }
    ],
    areaSqMeters: 25200,
    recordedAreaSqMeters: 25600,
    perimeterMeters: 636,
    buildingCount: 1,
    hasBuildingEncroachment: false,
    topologyStatus: "Overlap",
    groundTruthStatus: "Pending Field GT",
    confidenceScore: 0.91,
    notes: "Western boundary conflicting with Plot-105.",
    extractedDate: "2026-09-13"
  },
  {
    id: "P-107",
    ulpin: "ULPIN-2806-004-0107",
    surveyNumber: "Sec-7/Plot-107",
    ownerName: "Municipal Corporation Urban Parks",
    tenureType: "Municipal",
    landUse: "Open Space / Park",
    coordinates: [
      { x: 640, y: 120 },
      { x: 820, y: 115 },
      { x: 810, y: 280 },
      { x: 635, y: 285 }
    ],
    areaSqMeters: 29400,
    recordedAreaSqMeters: 29500,
    perimeterMeters: 694,
    buildingCount: 1,
    hasBuildingEncroachment: false,
    topologyStatus: "Clean",
    groundTruthStatus: "Verified",
    confidenceScore: 0.99,
    notes: "Public recreational garden and rainwater harvesting reservoir.",
    extractedDate: "2026-09-12"
  },
  {
    id: "P-108",
    ulpin: "ULPIN-2806-004-0108",
    surveyNumber: "Sec-7/Plot-108",
    ownerName: "Govt. Senior Secondary School",
    tenureType: "Municipal",
    landUse: "Institutional",
    coordinates: [
      { x: 635, y: 310 },
      { x: 815, y: 305 },
      { x: 805, y: 480 },
      { x: 630, y: 485 }
    ],
    areaSqMeters: 31100,
    recordedAreaSqMeters: 31100,
    perimeterMeters: 712,
    buildingCount: 3,
    hasBuildingEncroachment: false,
    topologyStatus: "Clean",
    groundTruthStatus: "Verified",
    confidenceScore: 0.97,
    notes: "Public school campus. Boundary defined by masonry perimeter wall.",
    extractedDate: "2026-09-12"
  },
  {
    id: "P-109",
    ulpin: "ULPIN-2806-004-0109",
    surveyNumber: "Sec-7/Plot-109",
    ownerName: "Apex Logistics & Warehousing",
    tenureType: "Leasehold",
    landUse: "Industrial",
    coordinates: [
      { x: 130, y: 485 },
      { x: 275, y: 480 },
      { x: 270, y: 640 },
      { x: 135, y: 645 }
    ],
    areaSqMeters: 22800,
    recordedAreaSqMeters: 23000,
    perimeterMeters: 610,
    buildingCount: 2,
    hasBuildingEncroachment: false,
    topologyStatus: "Clean",
    groundTruthStatus: "Verified",
    confidenceScore: 0.94,
    notes: "Industrial shed and delivery yard. Front setback compliant with 8m road.",
    extractedDate: "2026-09-14"
  },
  {
    id: "P-110",
    ulpin: "ULPIN-2806-004-0110",
    surveyNumber: "Sec-7/Plot-110",
    ownerName: "Bhavna Patel & Co-owners",
    tenureType: "Freehold",
    landUse: "Mixed-Use",
    // Has a sliver gap with P-111
    coordinates: [
      { x: 305, y: 480 },
      { x: 440, y: 475 },
      { x: 435, y: 635 },
      { x: 300, y: 640 }
    ],
    areaSqMeters: 21900,
    recordedAreaSqMeters: 22100,
    perimeterMeters: 595,
    buildingCount: 2,
    hasBuildingEncroachment: false,
    topologyStatus: "Sliver Gap",
    groundTruthStatus: "Pending Field GT",
    confidenceScore: 0.91,
    notes: "Unallocated 3m sliver gap between P-110 and P-111.",
    extractedDate: "2026-09-14"
  },
  {
    id: "P-111",
    ulpin: "ULPIN-2806-004-0111",
    surveyNumber: "Sec-7/Plot-111",
    ownerName: "Vikramaditya Housing Trust",
    tenureType: "Freehold",
    landUse: "Residential",
    coordinates: [
      { x: 450, y: 475 },
      { x: 605, y: 470 },
      { x: 600, y: 630 },
      { x: 445, y: 635 }
    ],
    areaSqMeters: 24700,
    recordedAreaSqMeters: 24900,
    perimeterMeters: 632,
    buildingCount: 3,
    hasBuildingEncroachment: false,
    topologyStatus: "Sliver Gap",
    groundTruthStatus: "Pending Field GT",
    confidenceScore: 0.93,
    notes: "Residential block with internal courtyard.",
    extractedDate: "2026-09-14"
  }
];

// Building Footprints detected by Deep Learning (Mask R-CNN / YOLOv8-OBB)
export const initialBuildings: BuildingFootprint[] = [
  {
    id: "B-101-A",
    parcelId: "P-101",
    type: "Residential",
    floors: 2,
    heightMeters: 7.2,
    areaSqMeters: 3600,
    coordinates: [
      { x: 145, y: 160 },
      { x: 225, y: 158 },
      { x: 222, y: 225 },
      { x: 142, y: 227 }
    ],
    isEncroaching: false,
    confidenceScore: 0.97
  },
  {
    id: "B-101-B",
    parcelId: "P-101",
    type: "Outbuilding",
    floors: 1,
    heightMeters: 3.4,
    areaSqMeters: 780,
    coordinates: [
      { x: 232, y: 165 },
      { x: 255, y: 164 },
      { x: 254, y: 198 },
      { x: 231, y: 199 }
    ],
    isEncroaching: false,
    confidenceScore: 0.93
  },
  {
    id: "B-102-A",
    parcelId: "P-102",
    type: "Commercial",
    floors: 5,
    heightMeters: 18.5,
    areaSqMeters: 8400,
    coordinates: [
      { x: 310, y: 155 },
      { x: 415, y: 152 },
      { x: 410, y: 245 },
      { x: 305, y: 248 }
    ],
    isEncroaching: false,
    confidenceScore: 0.99
  },
  {
    id: "B-103-A",
    parcelId: "P-103",
    type: "Multi-Storey",
    floors: 4,
    heightMeters: 14.8,
    areaSqMeters: 7200,
    coordinates: [
      { x: 485, y: 145 },
      { x: 590, y: 142 },
      { x: 585, y: 230 },
      { x: 480, y: 233 }
    ],
    isEncroaching: false,
    confidenceScore: 0.96
  },
  {
    id: "B-104-A",
    parcelId: "P-104",
    type: "Residential",
    floors: 3,
    heightMeters: 10.4,
    areaSqMeters: 6200,
    // Note: Extends past parcel boundary eastern coordinate (x=268), reaches x=276 into access road!
    coordinates: [
      { x: 195, y: 310 },
      { x: 278, y: 308 },
      { x: 275, y: 395 },
      { x: 192, y: 397 }
    ],
    isEncroaching: true,
    encroachmentTarget: "East Access Corridor / Right-of-Way",
    confidenceScore: 0.94
  },
  {
    id: "B-105-A",
    parcelId: "P-105",
    type: "Residential",
    floors: 2,
    heightMeters: 7.5,
    areaSqMeters: 4600,
    coordinates: [
      { x: 315, y: 315 },
      { x: 420, y: 312 },
      { x: 416, y: 385 },
      { x: 311, y: 388 }
    ],
    isEncroaching: false,
    confidenceScore: 0.95
  },
  {
    id: "B-106-A",
    parcelId: "P-106",
    type: "Residential",
    floors: 2,
    heightMeters: 7.6,
    areaSqMeters: 4800,
    coordinates: [
      { x: 470, y: 310 },
      { x: 575, y: 307 },
      { x: 571, y: 390 },
      { x: 466, y: 393 }
    ],
    isEncroaching: false,
    confidenceScore: 0.95
  },
  {
    id: "B-108-A",
    parcelId: "P-108",
    type: "Multi-Storey",
    floors: 3,
    heightMeters: 11.2,
    areaSqMeters: 9200,
    coordinates: [
      { x: 660, y: 330 },
      { x: 785, y: 326 },
      { x: 780, y: 440 },
      { x: 655, y: 444 }
    ],
    isEncroaching: false,
    confidenceScore: 0.98
  },
  {
    id: "B-109-A",
    parcelId: "P-109",
    type: "Temporary Shed",
    floors: 1,
    heightMeters: 5.8,
    areaSqMeters: 6500,
    coordinates: [
      { x: 155, y: 505 },
      { x: 250, y: 502 },
      { x: 247, y: 615 },
      { x: 152, y: 618 }
    ],
    isEncroaching: false,
    confidenceScore: 0.96
  },
  {
    id: "B-110-A",
    parcelId: "P-110",
    type: "Commercial",
    floors: 3,
    heightMeters: 10.8,
    areaSqMeters: 5100,
    coordinates: [
      { x: 320, y: 500 },
      { x: 415, y: 497 },
      { x: 412, y: 590 },
      { x: 317, y: 593 }
    ],
    isEncroaching: false,
    confidenceScore: 0.94
  },
  {
    id: "B-111-A",
    parcelId: "P-111",
    type: "Residential",
    floors: 3,
    heightMeters: 9.8,
    areaSqMeters: 6200,
    coordinates: [
      { x: 470, y: 495 },
      { x: 575, y: 492 },
      { x: 571, y: 595 },
      { x: 466, y: 598 }
    ],
    isEncroaching: false,
    confidenceScore: 0.96
  }
];

// Road Networks & Corridors detected by Deep Learning RoadSeg
export const initialRoads: RoadCorridor[] = [
  {
    id: "R-01",
    name: "Mahatma Gandhi Marg (Main Arterial)",
    category: "Arterial Road",
    widthMeters: 14.0,
    surfaceType: "Paved Asphalt",
    centerline: [
      { x: 60, y: 80 },
      { x: 900, y: 60 }
    ],
    polygon: [
      { x: 60, y: 73 },
      { x: 900, y: 53 },
      { x: 900, y: 67 },
      { x: 60, y: 87 }
    ]
  },
  {
    id: "R-02",
    name: "Sector Internal Cross Road 1",
    category: "Collector Road",
    widthMeters: 8.0,
    surfaceType: "Paved Asphalt",
    centerline: [
      { x: 70, y: 280 },
      { x: 890, y: 275 }
    ],
    polygon: [
      { x: 70, y: 276 },
      { x: 890, y: 271 },
      { x: 890, y: 279 },
      { x: 70, y: 284 }
    ]
  },
  {
    id: "R-03",
    name: "Community Pathway 2 (East Corridor)",
    category: "Narrow Access Lane / Pathway",
    widthMeters: 4.5,
    surfaceType: "Concrete Paver",
    centerline: [
      { x: 272, y: 90 },
      { x: 282, y: 670 }
    ],
    polygon: [
      { x: 270, y: 90 },
      { x: 280, y: 670 },
      { x: 284, y: 670 },
      { x: 274, y: 90 }
    ]
  },
  {
    id: "R-04",
    name: "Access Alley 3 (Central North-South)",
    category: "Narrow Access Lane / Pathway",
    widthMeters: 3.5,
    surfaceType: "Concrete Paver",
    centerline: [
      { x: 450, y: 90 },
      { x: 455, y: 670 }
    ],
    polygon: [
      { x: 448, y: 90 },
      { x: 453, y: 670 },
      { x: 457, y: 670 },
      { x: 452, y: 90 }
    ]
  },
  {
    id: "R-05",
    name: "Green Park Perimeter Corridor",
    category: "Local Street",
    widthMeters: 6.0,
    surfaceType: "Paved Asphalt",
    centerline: [
      { x: 625, y: 90 },
      { x: 630, y: 670 }
    ],
    polygon: [
      { x: 622, y: 90 },
      { x: 627, y: 670 },
      { x: 633, y: 670 },
      { x: 628, y: 90 }
    ]
  }
];

// Ground Truthing (GT) survey points captured by field survey rovers
export const initialGroundTruthPoints: GroundTruthPoint[] = [
  {
    id: "GT-01",
    surveyorId: "SURV-RAMESH-89",
    timestamp: "2026-09-14 09:42",
    coordinate: { x: 120, y: 140 },
    accuracyCm: 1.4,
    elevationMeters: 218.42,
    featureObserved: "Cadastral Boundary Stone",
    verificationStatus: "Matches AI",
    offsetMeters: 0.04,
    notes: "Survey benchmark stone BM-01 intact. Exact match with AI extracted node.",
    photoUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "GT-02",
    surveyorId: "SURV-RAMESH-89",
    timestamp: "2026-09-14 10:15",
    coordinate: { x: 260, y: 135 },
    accuracyCm: 1.8,
    elevationMeters: 218.15,
    featureObserved: "Compound Wall",
    verificationStatus: "Matches AI",
    offsetMeters: 0.08,
    notes: "Boundary pillar between Plot 101 and 102 verified.",
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "GT-03",
    surveyorId: "SURV-PRIYA-44",
    timestamp: "2026-09-14 11:30",
    coordinate: { x: 278, y: 350 },
    accuracyCm: 2.1,
    elevationMeters: 217.90,
    featureObserved: "Building Corner",
    verificationStatus: "Offset Detected",
    offsetMeters: 1.45,
    notes: "Building B-104-A protruding into eastern alley. Owner alerted on encroachment.",
    photoUrl: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "GT-04",
    surveyorId: "SURV-PRIYA-44",
    timestamp: "2026-09-14 12:45",
    coordinate: { x: 446, y: 360 },
    accuracyCm: 1.9,
    elevationMeters: 218.05,
    featureObserved: "Disputed Boundary",
    verificationStatus: "Offset Detected",
    offsetMeters: 1.82,
    notes: "Disputed boundary fence between P-105 and P-106. Ground truthing pins recorded.",
    photoUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "GT-05",
    surveyorId: "SURV-ANIL-12",
    timestamp: "2026-09-14 14:10",
    coordinate: { x: 635, y: 310 },
    accuracyCm: 1.2,
    elevationMeters: 219.10,
    featureObserved: "Cadastral Boundary Stone",
    verificationStatus: "Matches AI",
    offsetMeters: 0.03,
    notes: "North-West corner of Municipal School Plot 108. Verified with CORS-URBAN-01.",
    photoUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=300&auto=format&fit=crop&q=80"
  }
];

// CORS Base Stations (Continuously Operating Reference Stations)
export const initialCorsStations: CorsStation[] = [
  {
    id: "CORS-01",
    stationCode: "CORS-ND-01",
    name: "Survey of India CORS Node Alpha",
    coordinate: { x: 80, y: 50 },
    status: "Active Tracking",
    frequency: "L1/L2/L5 Multi-Band",
    baseElevationMeters: 224.50
  },
  {
    id: "CORS-02",
    stationCode: "CORS-ND-02",
    name: "Smart City GNSS Rover Station Beta",
    coordinate: { x: 860, y: 620 },
    status: "Calibrated",
    frequency: "L1/L2/L5 Multi-Band",
    baseElevationMeters: 221.80
  }
];

// Topology Errors detected automatically by the platform
export const initialTopologyErrors: TopologyError[] = [
  {
    id: "ERR-TOP-01",
    type: "OVERLAPPING_PARCELS",
    severity: "high",
    description: "Cadastral boundary overlap between Plot P-105 and Plot P-106 along western fence.",
    affectedIds: ["P-105", "P-106"],
    coordinate: { x: 446, y: 360 },
    detectedAreaSqM: 324.5,
    autoFixAvailable: true,
    fixActionName: "Snap & Bisect Overlapping Boundary"
  },
  {
    id: "ERR-TOP-02",
    type: "BUILDING_ENCROACHMENT",
    severity: "high",
    description: "Building B-104-A footprint extends 1.45m beyond legal parcel boundary into Road Corridor R-03.",
    affectedIds: ["B-104-A", "P-104", "R-03"],
    coordinate: { x: 276, y: 350 },
    detectedAreaSqM: 42.8,
    autoFixAvailable: true,
    fixActionName: "Flag Legal Encroachment & Clip Setback"
  },
  {
    id: "ERR-TOP-03",
    type: "SLIVER_GAP",
    severity: "medium",
    description: "Unclaimed 3.2m sliver gap between residential parcels P-110 and P-111.",
    affectedIds: ["P-110", "P-111"],
    coordinate: { x: 445, y: 550 },
    detectedAreaSqM: 198.0,
    autoFixAvailable: true,
    fixActionName: "Dissolve Sliver to Nearest Registered Parcel"
  }
];

// Legacy cadastral boundaries (shows distortion from manual historical surveys)
export const legacyParcels: Parcel[] = initialParcels.map(p => ({
  ...p,
  id: `LEGACY-${p.id}`,
  coordinates: p.coordinates.map(c => ({
    x: c.x + (Math.sin(c.y / 80) * 8 - 4),
    y: c.y + (Math.cos(c.x / 80) * 7 - 3)
  }))
}));

// AI Extraction Metrics for display in the engine
export const defaultAiMetrics: AiExtractionMetrics = {
  totalParcelsExtracted: 11,
  totalBuildingsExtracted: 11,
  roadNetworkKm: 3.42,
  meanBoundaryPrecision: 96.8,
  iouScore: 0.912,
  topologyComplianceRate: 94.6,
  processingTimeSeconds: 4.8,
  droneGsdCm: 2.5,
  elevationResolutionM: 0.05
};
