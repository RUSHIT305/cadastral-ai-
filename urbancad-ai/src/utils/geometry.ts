import { Coordinate, Parcel, TopologyError } from "../types/cadastre";

/**
 * Calculates the 2D polygon area using Shoelace formula
 */
export function calculatePolygonArea(coords: Coordinate[]): number {
  if (!coords || coords.length < 3) return 0;
  let area = 0;
  const n = coords.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coords[i].x * coords[j].y;
    area -= coords[j].x * coords[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Calculates polygon perimeter in meters
 */
export function calculatePerimeter(coords: Coordinate[]): number {
  if (!coords || coords.length < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < coords.length; i++) {
    const next = coords[(i + 1) % coords.length];
    perimeter += calculateDistance(coords[i], next);
  }
  return perimeter;
}

/**
 * Euclidean distance in meters
 */
export function calculateDistance(a: Coordinate, b: Coordinate): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the centroid of a polygon
 */
export function calculateCentroid(coords: Coordinate[]): Coordinate {
  if (!coords || coords.length === 0) return { x: 0, y: 0 };
  let cx = 0;
  let cy = 0;
  for (const pt of coords) {
    cx += pt.x;
    cy += pt.y;
  }
  return {
    x: Math.round((cx / coords.length) * 10) / 10,
    y: Math.round((cy / coords.length) * 10) / 10
  };
}

/**
 * Point in polygon test (Ray casting)
 */
export function isPointInPolygon(point: Coordinate, polygon: Coordinate[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Converts local survey meters coordinate to simulated WGS84 Lat/Lng
 * Centered around typical urban drone survey region
 */
export function metersToLatLng(x: number, y: number, baseLat = 28.6139, baseLng = 77.2090) {
  // Approximate: 1 deg lat ~ 111,320m; 1 deg lng ~ 111,320m * cos(lat)
  const lat = baseLat + (y / 111320);
  const lng = baseLng + (x / (111320 * Math.cos((baseLat * Math.PI) / 180)));
  return {
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6))
  };
}

/**
 * Snaps a vertex to a target if within snapTolerance meters
 */
export function snapVertex(vertex: Coordinate, targets: Coordinate[], snapTolerance = 1.5): { snapped: Coordinate; didSnap: boolean } {
  let closestDist = Infinity;
  let closestTarget: Coordinate | null = null;

  for (const t of targets) {
    const dist = calculateDistance(vertex, t);
    if (dist < closestDist && dist <= snapTolerance) {
      closestDist = dist;
      closestTarget = t;
    }
  }

  if (closestTarget) {
    return { snapped: { ...closestTarget }, didSnap: true };
  }
  return { snapped: vertex, didSnap: false };
}

/**
 * Detects topological overlaps between two simple polygons
 */
export function checkPolygonOverlap(polyA: Coordinate[], polyB: Coordinate[]): boolean {
  // Quick AABB check
  const bboxA = getBoundingBox(polyA);
  const bboxB = getBoundingBox(polyB);

  if (
    bboxA.maxX < bboxB.minX ||
    bboxA.minX > bboxB.maxX ||
    bboxA.maxY < bboxB.minY ||
    bboxA.minY > bboxB.maxY
  ) {
    return false;
  }

  // Check if any point of A is inside B
  for (const p of polyA) {
    if (isPointInPolygon(p, polyB)) return true;
  }
  // Check if any point of B is inside A
  for (const p of polyB) {
    if (isPointInPolygon(p, polyA)) return true;
  }

  // Check edge intersections
  for (let i = 0; i < polyA.length; i++) {
    const a1 = polyA[i];
    const a2 = polyA[(i + 1) % polyA.length];
    for (let j = 0; j < polyB.length; j++) {
      const b1 = polyB[j];
      const b2 = polyB[(j + 1) % polyB.length];
      if (doLineSegmentsIntersect(a1, a2, b1, b2)) return true;
    }
  }

  return false;
}

export function getBoundingBox(coords: Coordinate[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const c of coords) {
    if (c.x < minX) minX = c.x;
    if (c.x > maxX) maxX = c.x;
    if (c.y < minY) minY = c.y;
    if (c.y > maxY) maxY = c.y;
  }
  return { minX, minY, maxX, maxY };
}

function doLineSegmentsIntersect(p1: Coordinate, p2: Coordinate, p3: Coordinate, p4: Coordinate): boolean {
  function ccw(A: Coordinate, B: Coordinate, C: Coordinate) {
    return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
  }
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}
