/* Generates placeholder spin-frame SVGs for the hero can lineup.
   These are PREVIEW STAND-INS — replace assets/cans/<id>/NN.png with real renders.
   Each can gets N frames; a sweeping highlight + label squash fakes a 360 spin. */
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "assets", "cans");
const N = 8; // frames per can

const ALL = [
  { id: "spicy-pineapple", label: "SPICY\nPINEAPPLE", accent: "#FFE819", ink: "#161616" },
  { id: "berry-lemonade",  label: "BERRY\nLEMONADE",  accent: "#C2185B", ink: "#ffffff" },
  { id: "cbd-energy",      label: "ENERGY\n+ CBD",     accent: "#E53935", ink: "#ffffff" },
  { id: "lemon-lime",      label: "LEMON\nLIME",       accent: "#8BC34A", ink: "#161616" },
  { id: "orange-kush",     label: "ORANGE\nKUSH",      accent: "#FB8C00", ink: "#161616" },
];
// optional CLI filter: `node gen-can-frames.js berry-lemonade` regenerates just one
const only = process.argv.slice(2);
const CANS = only.length ? ALL.filter((c) => only.includes(c.id)) : ALL;

// slim can proportions, matched to the real video frames (267x760, can fills ~75%)
const W = 267, H = 760;
const BX = 34, BW = 200;          // body x + width
const BY = 30, BH = 700;          // body y + height

function frame(can, f) {
  const t = f / N;                       // 0..1 around the can
  const ang = t * Math.PI * 2;
  const cx = BX + BW / 2;
  // highlight sweeps across the cylinder width
  const hx = BX + BW * (0.5 + 0.42 * Math.sin(ang));
  // label squashes toward edges to fake the curve wrapping away
  const squash = Math.max(0.08, Math.abs(Math.cos(ang)));
  const labelX = cx + 14 * Math.sin(ang);
  const labelOpacity = 0.35 + 0.65 * Math.max(0, Math.cos(ang));
  const lines = can.label.split("\n");
  const labelSvg = lines
    .map((ln, i) =>
      `<tspan x="${labelX.toFixed(1)}" dy="${i === 0 ? 0 : 26}">${ln}</tspan>`
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="body" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${shade(can.accent,-38)}"/>
      <stop offset="0.5" stop-color="${can.accent}"/>
      <stop offset="1" stop-color="${shade(can.accent,-50)}"/>
    </linearGradient>
    <radialGradient id="sheen" cx="${((hx-BX)/BW).toFixed(3)}" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="0.4" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- can body -->
  <rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="22" fill="url(#body)"/>
  <!-- top + bottom rims -->
  <ellipse cx="${cx}" cy="${BY+6}" rx="${BW/2}" ry="10" fill="${shade(can.accent,30)}"/>
  <ellipse cx="${cx}" cy="${BY+BH-6}" rx="${BW/2}" ry="10" fill="${shade(can.accent,-58)}"/>
  <!-- moving sheen -->
  <rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="22" fill="url(#sheen)"/>
  <!-- label band -->
  <g transform="translate(${cx} ${H/2}) scale(${squash.toFixed(3)} 1) translate(${-cx} ${-H/2})">
    <text x="${labelX.toFixed(1)}" y="${H/2 - 6}" text-anchor="middle"
      font-family="Oswald, Arial Narrow, sans-serif" font-weight="700"
      font-size="22" letter-spacing="1" fill="${can.ink}" opacity="${labelOpacity.toFixed(2)}"
      style="text-transform:uppercase">${labelSvg}</text>
  </g>
  <!-- KILL CLIFF wordmark -->
  <text x="${cx}" y="${H/2 + 80}" text-anchor="middle"
    font-family="Oswald, Arial Narrow, sans-serif" font-weight="700" font-size="13"
    letter-spacing="2" fill="${can.ink}" opacity="${(labelOpacity*0.8).toFixed(2)}">KILL CLIFF</text>
</svg>`;
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp(((n >> 16) & 255) + amt);
  const g = clamp(((n >> 8) & 255) + amt);
  const b = clamp((n & 255) + amt);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

CANS.forEach((can) => {
  const dir = path.join(OUT, can.id);
  fs.mkdirSync(dir, { recursive: true });
  for (let f = 0; f < N; f++) {
    const name = String(f + 1).padStart(2, "0") + ".svg";
    fs.writeFileSync(path.join(dir, name), frame(can, f));
  }
  console.log("wrote", can.id, "×", N);
});
console.log("done →", OUT);
