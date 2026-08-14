/**
 * Generator: GeoJSON Sumatera Utara (level kab/kota) -> data SVG ringkas.
 *
 * Sumber: https://github.com/mahendrayudha/indonesia-geojson
 *   Sumatera Utara/Kabupaten-Kota (Provinsi Sumatera Utara)/...
 *   Aceh/Kabupaten-Kota (Provinsi Aceh)/...
 *   Riau/Kabupaten-Kota (Provinsi Riau)/...
 *
 * Jalankan: node scripts/generate-sumut-map.js
 * Output:  src/data/sumut-map.ts
 */
const fs = require('fs');
const path = require('path');

const INPUT_SUMUT = path.join(__dirname, '..', 'sumut.geojson');
const INPUT_ACEH = path.join(__dirname, '..', 'aceh.geojson');
const INPUT_RIAU = path.join(__dirname, '..', 'riau.geojson');
const OUTPUT = path.join(__dirname, '..', 'src', 'data', 'sumut-map.ts');

const sumut = JSON.parse(fs.readFileSync(INPUT_SUMUT, 'utf8'));
const aceh = JSON.parse(fs.readFileSync(INPUT_ACEH, 'utf8'));
const riau = JSON.parse(fs.readFileSync(INPUT_RIAU, 'utf8'));

// ---- Nama GeoJSON -> nilai dropdown di form (AspirasiForm kabupatenList) ----
const NAME_MAP = {
  Asahan: 'Asahan',
  'Batu Bara': 'Batu Bara',
  Dairi: 'Dairi',
  'Deli Serdang': 'Deli Serdang',
  Gunungsitoli: 'Kota Gunungsitoli',
  'Humbang Hasundutan': 'Humbang Hasundutan',
  Karo: 'Karo',
  'Kota Binjai': 'Kota Binjai',
  'Kota Medan': 'Kota Medan',
  'Kota Tanjungbalai': 'Kota Tanjungbalai',
  Labuhanbatu: 'Labuhanbatu',
  'Labuhanbatu Selatan': 'Labuhanbatu Selatan',
  'Labuhanbatu Utara': 'Labuhanbatu Utara',
  Langkat: 'Langkat',
  'Mandailing Natal': 'Mandailing Natal',
  Nias: 'Nias',
  'Nias Barat': 'Nias Barat',
  'Nias Selatan': 'Nias Selatan',
  'Nias Utara': 'Nias Utara',
  'Padang Lawas': 'Padang Lawas',
  'Padang Lawas Utara': 'Padang Lawas Utara',
  Padangsidimpuan: 'Kota Padangsidimpuan',
  'Pakpak Barat': 'Pakpak Bharat',
  Pematangsiantar: 'Kota Pematangsiantar',
  Samosir: 'Samosir',
  'Serdang Bedagai': 'Serdang Bedagai',
  Sibolga: 'Kota Sibolga',
  Simalungun: 'Simalungun',
  'Tapanuli Selatan': 'Tapanuli Selatan',
  'Tapanuli Tengah': 'Tapanuli Tengah',
  'Tapanuli Utara': 'Tapanuli Utara',
  Tebingtinggi: 'Kota Tebing Tinggi',
  'Toba Samosir': 'Toba',
};

// Danau Toba dirender sebagai elemen dekoratif (bukan wilayah yang bisa diklik)
const LAKE_NAMES = new Set(['Lake Toba']);

// Provinsi tetangga: path non-klik, abu-abu pucat
const NEIGHBORS = [
  { file: INPUT_ACEH, name: 'Aceh' },
  { file: INPUT_RIAU, name: 'Riau' },
];

// ---- Kumpulkan semua koordinat untuk menghitung bounds (termasuk tetangga) ----
const allFeatures = [
  ...sumut.features,
  ...aceh.features,
  ...riau.features,
];

let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
for (const f of allFeatures) {
  const coords = f.geometry.coordinates; // MultiPolygon
  for (const poly of coords) {
    for (const ring of poly) {
      for (const [lo, la] of ring) {
        if (lo < minLon) minLon = lo;
        if (lo > maxLon) maxLon = lo;
        if (la < minLat) minLat = la;
        if (la > maxLat) maxLat = la;
      }
    }
  }
}

// ---- Proyeksi equirectangular sederhana (aspek diperbaiki cos lat tengah) ----
const midLat = ((minLat + maxLat) / 2) * (Math.PI / 180);
const WIDTH = 1000;
const scale = WIDTH / (maxLon - minLon);
const cosMid = Math.cos(midLat);

function proj(lon, lat) {
  return [(lon - minLon) * scale, (maxLat - lat) * scale * cosMid];
}

// ---- Douglas-Peucker ----
function sqDist(p, q) {
  const dx = p[0] - q[0];
  const dy = p[1] - q[1];
  return dx * dx + dy * dy;
}
function segDist(p, a, b) {
  const x = p[0], y = p[1];
  const ax = a[0], ay = a[1], bx = b[0], by = b[1];
  const dx = bx - ax, dy = by - ay;
  if (dx === 0 && dy === 0) return Math.hypot(x - ax, y - ay);
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - (ax + t * dx), y - (ay + t * dy));
}
function douglasPeucker(points, eps) {
  if (points.length < 3) return points;
  let maxDist = 0, idx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = segDist(points[i], points[0], points[points.length - 1]);
    if (d > maxDist) { maxDist = d; idx = i; }
  }
  if (maxDist > eps) {
    const left = douglasPeucker(points.slice(0, idx + 1), eps);
    const right = douglasPeucker(points.slice(idx), eps);
    return left.slice(0, -1).concat(right);
  }
  return [points[0], points[points.length - 1]];
}

const EPS = 0.6; // ~0,6px pada lebar 1000

function ringToPath(ring) {
  const pts = ring.map(([lo, la]) => proj(lo, la));
  const simp = douglasPeucker(pts, EPS);
  const clean = [];
  for (const p of simp) {
    const last = clean[clean.length - 1];
    if (last && sqDist(p, last) < 0.09) continue;
    clean.push(p);
  }
  if (clean.length < 3) return null;
  if (sqDist(clean[0], clean[clean.length - 1]) > 0.09) clean.push(clean[0]);
  let d = `M${clean[0][0].toFixed(1)} ${clean[0][1].toFixed(1)}`;
  for (let i = 1; i < clean.length; i++) {
    d += `L${clean[i][0].toFixed(1)} ${clean[i][1].toFixed(1)}`;
  }
  return d + 'Z';
}

function geometryToPath(coords) {
  return coords.map((poly) => poly.map(ringToPath).filter(Boolean).join('')).join('');
}

// ---- Bangun output ----
const regions = [];
let lakePath = '';

for (const f of sumut.features) {
  const geoName = f.properties.NAME_2;
  const name = NAME_MAP[geoName];
  const coords = f.geometry.coordinates;

  if (LAKE_NAMES.has(geoName)) {
    lakePath = geometryToPath(coords);
    continue;
  }
  if (!name) continue;

  const d = geometryToPath(coords);
  if (!d) continue;

  // Titik label: centroid poligon terluas
  let bestArea = -1, bestRing = null;
  for (const poly of coords) {
    for (const ring of poly) {
      const pts = ring.map(([lo, la]) => proj(lo, la));
      const simp = douglasPeucker(pts, EPS);
      let area = 0;
      for (let i = 0; i < simp.length - 1; i++) {
        area += simp[i][0] * simp[i + 1][1] - simp[i + 1][0] * simp[i][1];
      }
      area = Math.abs(area) / 2;
      if (area > bestArea) { bestArea = area; bestRing = simp; }
    }
  }
  let cx = 0, cy = 0;
  if (bestRing && bestRing.length) {
    for (const p of bestRing) { cx += p[0]; cy += p[1]; }
    cx /= bestRing.length; cy /= bestRing.length;
  }

  regions.push({ name, d, cx: +cx.toFixed(1), cy: +cy.toFixed(1) });
}

regions.sort((a, b) => a.name.localeCompare(b.name, 'id'));

// Provinsi tetangga (path gabungan per provinsi, non-klik)
const neighbors = [];
for (const nb of NEIGHBORS) {
  const data = JSON.parse(fs.readFileSync(nb.file, 'utf8'));
  const d = data.features.map((f) => geometryToPath(f.geometry.coordinates)).join('');
  if (!d) continue;
  neighbors.push({ name: nb.name, d });
}

// Label geografis (air/arah mata angin) — posisi manual dalam koordinat proyeksi
const width = +((maxLon - minLon) * scale).toFixed(1);
const height = +((maxLat - minLat) * scale * cosMid).toFixed(1);

// Titik koordinat label (lon, lat) -> proyeksi
function label(lon, lat) {
  const [x, y] = proj(lon, lat);
  return { x: +x.toFixed(1), y: +y.toFixed(1) };
}

const labels = [
  // Selat Malaka di timur laut (antara Sumut dan Semenanjung Malaysia)
  { ...label(98.6, 4.7), text: 'Selat Malaka' },
  // Samudra Hindia di barat
  { ...label(95.2, 0.0), text: 'Samudra Hindia' },
  // Provinsi tetangga (keterangan arah)
  { ...label(97.0, 5.6), text: 'Aceh', ref: 'Aceh' },
  { ...label(100.6, 1.2), text: 'Riau', ref: 'Riau' },
];

const out = `// AUTO-GENERATED oleh scripts/generate-sumut-map.js — jangan edit manual.
// Sumber: GeoJSON batas administrasi (mahendrayudha/indonesia-geojson).

export interface SumutRegion {
  name: string;
  d: string;
  cx: number;
  cy: number;
}

export interface SumutNeighbor {
  name: string;
  d: string;
}

export interface SumutLabel {
  x: number;
  y: number;
  text: string;
  ref?: string;
}

export const SUMUT_MAP = {
  width: ${width},
  height: ${height},
  lakePath: ${JSON.stringify(lakePath)},
  neighbors: ${JSON.stringify(neighbors, null, 2)},
  labels: ${JSON.stringify(labels, null, 2)},
  regions: ${JSON.stringify(regions, null, 2)},
} as const;

export type SumutRegionName = (typeof SUMUT_MAP.regions)[number]['name'];
`;

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, out, 'utf8');

let total = 0;
for (const r of regions) total += r.d.length;
let nbTotal = 0;
for (const n of neighbors) nbTotal += n.d.length;
console.log(`Regions: ${regions.length}`);
console.log(`Neighbors: ${neighbors.map((n) => n.name).join(', ')}`);
console.log(`viewBox: 0 0 ${width} ${height}`);
console.log(`Sumut path chars: ${total.toLocaleString()}, neighbors: ${nbTotal.toLocaleString()}`);
console.log(`Output: ${OUTPUT} (${(fs.statSync(OUTPUT).size / 1024).toFixed(1)} KB)`);
