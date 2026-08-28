/**
 * FITINY moissanite-tools — MCP over HTTP (Streamable HTTP transport).
 *
 * Same six tools as the stdio server in ../mcp/server.js, reachable without
 * installing anything: POST JSON-RPC to /mcp.
 *
 * Data is inlined at build time from ../data/*.json so the Worker has no
 * filesystem dependency. Regenerate with the script in the repo root.
 */
const GRADING = {"$comment": "Moissanite grading reference. Colour and clarity scales follow the GIA diamond grading system, which the moissanite trade has adopted. Values are descriptive only and are not a GIA certification.", "version": "1.0.0", "updated": "2026-08-28", "colour": {"scale": "GIA D-Z (moissanite is commonly sold in the D-K range)", "grades": [{"grade": "D", "band": "Colourless", "hex": "#ffffff", "tint": "none", "note": "Highest grade. No detectable colour under 10x magnification against a white background."}, {"grade": "E", "band": "Colourless", "hex": "#fefefc", "tint": "none", "note": "Minute traces of colour, detectable only by a trained grader."}, {"grade": "F", "band": "Colourless", "hex": "#fdfdf9", "tint": "none", "note": "Slight colour detectable by an expert; still classed as colourless."}, {"grade": "G", "band": "Near colourless", "hex": "#fdfcf3", "tint": "very faint warm", "note": "Colour noticeable only when compared side by side with D-F."}, {"grade": "H", "band": "Near colourless", "hex": "#fcfaec", "tint": "faint warm", "note": "Appears colourless face-up in most settings."}, {"grade": "I", "band": "Near colourless", "hex": "#fbf7e2", "tint": "faint warm", "note": "Slight warmth visible face-up to a careful eye."}, {"grade": "J", "band": "Near colourless", "hex": "#f9f3d6", "tint": "noticeable warm", "note": "Warmth visible face-up, more so in larger stones."}, {"grade": "K", "band": "Faint colour", "hex": "#f6eec6", "tint": "visible warm", "note": "Faint yellow visible to the unaided eye; often paired with yellow gold."}]}, "clarity": {"scale": "GIA FL-I3 (most moissanite sold is VVS or better)", "grades": [{"grade": "FL", "name": "Flawless", "visible_10x": "No inclusions or blemishes", "eye_clean": true, "typical_for_moissanite": false}, {"grade": "IF", "name": "Internally Flawless", "visible_10x": "No inclusions; minor surface blemishes only", "eye_clean": true, "typical_for_moissanite": false}, {"grade": "VVS1", "name": "Very Very Slightly Included 1", "visible_10x": "Inclusions extremely difficult to see at 10x", "eye_clean": true, "typical_for_moissanite": true}, {"grade": "VVS2", "name": "Very Very Slightly Included 2", "visible_10x": "Inclusions very difficult to see at 10x", "eye_clean": true, "typical_for_moissanite": true}, {"grade": "VS1", "name": "Very Slightly Included 1", "visible_10x": "Inclusions difficult to see at 10x", "eye_clean": true, "typical_for_moissanite": false}, {"grade": "VS2", "name": "Very Slightly Included 2", "visible_10x": "Inclusions somewhat easy to see at 10x", "eye_clean": true, "typical_for_moissanite": false}, {"grade": "SI1", "name": "Slightly Included 1", "visible_10x": "Inclusions noticeable at 10x", "eye_clean": "usually", "typical_for_moissanite": false}, {"grade": "SI2", "name": "Slightly Included 2", "visible_10x": "Inclusions easily noticeable at 10x", "eye_clean": "sometimes", "typical_for_moissanite": false}]}, "optical": {"$comment": "Published gemmological constants. These are what actually separate moissanite from diamond.", "moissanite": {"refractive_index": [2.65, 2.69], "dispersion": 0.104, "mohs_hardness": 9.25, "density_g_cm3": 3.21, "birefringent": true}, "diamond": {"refractive_index": [2.417, 2.419], "dispersion": 0.044, "mohs_hardness": 10, "density_g_cm3": 3.52, "birefringent": false}, "cubic_zirconia": {"refractive_index": [2.15, 2.18], "dispersion": 0.06, "mohs_hardness": 8.25, "density_g_cm3": 5.7, "birefringent": false}}};
const SIZING = {"$comment": "Ring and chain sizing references. Ring sizes follow ISO 8653: the numeric size in the ISO/EU system IS the inner circumference in millimetres. US/UK conversions are the standard trade equivalents.", "version": "1.0.0", "ring_sizes": {"basis": "ISO 8653 — EU size = inner circumference in mm", "rows": [{"us": 3, "uk": "F", "eu": 44.2, "diameter_mm": 14.1}, {"us": 3.5, "uk": "G", "eu": 45.5, "diameter_mm": 14.5}, {"us": 4, "uk": "H", "eu": 46.8, "diameter_mm": 14.9}, {"us": 4.5, "uk": "I", "eu": 48.0, "diameter_mm": 15.3}, {"us": 5, "uk": "J", "eu": 49.3, "diameter_mm": 15.7}, {"us": 5.5, "uk": "L", "eu": 50.6, "diameter_mm": 16.1}, {"us": 6, "uk": "M", "eu": 51.9, "diameter_mm": 16.5}, {"us": 6.5, "uk": "N", "eu": 53.1, "diameter_mm": 16.9}, {"us": 7, "uk": "O", "eu": 54.4, "diameter_mm": 17.3}, {"us": 7.5, "uk": "P", "eu": 55.7, "diameter_mm": 17.7}, {"us": 8, "uk": "Q", "eu": 57.0, "diameter_mm": 18.1}, {"us": 8.5, "uk": "Q½", "eu": 58.3, "diameter_mm": 18.5}, {"us": 9, "uk": "R½", "eu": 59.5, "diameter_mm": 18.9}, {"us": 9.5, "uk": "S½", "eu": 60.8, "diameter_mm": 19.4}, {"us": 10, "uk": "T½", "eu": 62.1, "diameter_mm": 19.8}, {"us": 11, "uk": "V½", "eu": 64.6, "diameter_mm": 20.6}, {"us": 12, "uk": "X½", "eu": 67.2, "diameter_mm": 21.4}], "notes": ["Measure at the end of the day — fingers swell and can differ by half a size.", "Wide bands (over 6mm) sit tighter; go up a half size.", "Cold hands measure smaller. Do not size a ring in winter for summer wear."]}, "necklace_lengths": {"rows": [{"inches": 14, "cm": 35.6, "name": "Collar", "sits": "Tight around the base of the neck"}, {"inches": 16, "cm": 40.6, "name": "Choker", "sits": "At the base of the neck"}, {"inches": 18, "cm": 45.7, "name": "Princess", "sits": "On the collarbone — the most common length"}, {"inches": 20, "cm": 50.8, "name": "Matinee", "sits": "A few cm below the collarbone"}, {"inches": 24, "cm": 61.0, "name": "Matinee", "sits": "At the top of the bust"}, {"inches": 30, "cm": 76.2, "name": "Opera", "sits": "At or below the bust"}, {"inches": 36, "cm": 91.4, "name": "Rope", "sits": "Below the bust; can be doubled"}]}, "stud_sizes": {"$comment": "How a round stud reads on the ear. Diameter is the stone, not the setting.", "rows": [{"diameter_mm": 3, "reads_as": "Barely there — a point of light, reads as a tiny accent"}, {"diameter_mm": 4, "reads_as": "Subtle everyday sparkle, disappears at conversational distance"}, {"diameter_mm": 5, "reads_as": "Clearly visible but understated"}, {"diameter_mm": 6, "reads_as": "The most popular size — visible without being a statement"}, {"diameter_mm": 6.5, "reads_as": "Reads as a classic one-carat look in diamond terms"}, {"diameter_mm": 8, "reads_as": "Statement size; needs a secure back on a heavier stone"}, {"diameter_mm": 10, "reads_as": "Bold. Best in lightweight settings or magnetic backs"}]}};

const DENSITY = { moissanite: 3.21, diamond: 3.52, cz: 5.70 };
const REF = 3.52, DEPTH = 0.612;

const caratFromMm = (mm, s) => mm * mm * (mm * DEPTH) * 0.0061 * (DENSITY[s] / REF);
const mmFromCarat = (ct, s) => Math.cbrt(ct / (0.0061 * DEPTH * (DENSITY[s] / REF)));
const r2 = n => +n.toFixed(2), r3 = n => +n.toFixed(3);

const compareAtWeight = ct => ({ carat: ct,
  moissanite_mm: r2(mmFromCarat(ct, 'moissanite')),
  diamond_mm: r2(mmFromCarat(ct, 'diamond')),
  cz_mm: r2(mmFromCarat(ct, 'cz')) });
const compareAtSize = mm => ({ diameter_mm: mm,
  moissanite_ct: r3(caratFromMm(mm, 'moissanite')),
  diamond_ct: r3(caratFromMm(mm, 'diamond')),
  cz_ct: r3(caratFromMm(mm, 'cz')) });

function convertRingSize(value, from = 'us') {
  const key = from === 'mm' ? 'diameter_mm' : from;
  const rows = SIZING.ring_sizes.rows;
  if (key === 'uk') {
    const want = String(value).toUpperCase();
    const hit = rows.find(r => String(r.uk).toUpperCase() === want);
    return hit ? { ...hit, exact: true }
               : { error: `no UK size matching "${value}"`, available: rows.map(r => r.uk) };
  }
  const num = Number(value);
  if (!Number.isFinite(num)) return { error: 'value must be numeric for us/eu/mm' };
  const exact = rows.find(r => Math.abs(r[key] - num) < 1e-9);
  if (exact) return { ...exact, exact: true };
  let best = rows[0];
  for (const r of rows) if (Math.abs(r[key] - num) < Math.abs(best[key] - num)) best = r;
  return { ...best, exact: false, note: `${value} is between listed sizes; closest is shown` };
}
function nearest(rows, key, value) {
  const num = Number(value);
  let best = rows[0];
  for (const r of rows) if (Math.abs(r[key] - num) < Math.abs(best[key] - num)) best = r;
  return best;
}

const TOOLS = [
  { name: 'carat_to_mm',
    description: "Diameter in millimetres for a given carat weight. Round brilliant cut. Density-corrected per stone - a diamond chart is wrong for moissanite by ~9%.",
    inputSchema: { type: 'object', required: ['carat'], properties: {
      carat: { type: 'number', description: 'Carat weight, e.g. 1.0' },
      stone: { type: 'string', enum: ['moissanite', 'diamond', 'cz'], default: 'moissanite' } } } },
  { name: 'mm_to_carat',
    description: 'Carat weight for a given diameter in millimetres. Round brilliant cut.',
    inputSchema: { type: 'object', required: ['mm'], properties: {
      mm: { type: 'number', description: 'Diameter in mm, e.g. 6.5' },
      stone: { type: 'string', enum: ['moissanite', 'diamond', 'cz'], default: 'moissanite' } } } },
  { name: 'grading_scale',
    description: 'GIA colour (D-K) or clarity (FL-SI) scale as used for moissanite, or published optical constants for moissanite / diamond / cubic zirconia.',
    inputSchema: { type: 'object', required: ['scale'], properties: {
      scale: { type: 'string', enum: ['colour', 'clarity', 'optical'] },
      grade: { type: 'string', description: 'Optional single grade, e.g. "D" or "VVS1"' } } } },
  { name: 'ring_size_convert',
    description: 'Convert a ring size between US, UK, EU (ISO 8653) and inner diameter in mm. A US 6 is a UK M, not a UK 6.',
    inputSchema: { type: 'object', required: ['value'], properties: {
      value: { description: 'Size in the source system, e.g. 7 or "M"' },
      from: { type: 'string', enum: ['us', 'uk', 'eu', 'mm'], default: 'us' } } } },
  { name: 'necklace_length',
    description: 'Where a necklace of a given length sits, with the trade name (choker, princess, matinee...).',
    inputSchema: { type: 'object', required: ['value'], properties: {
      value: { type: 'number' }, unit: { type: 'string', enum: ['inches', 'cm'], default: 'inches' } } } },
  { name: 'stud_appearance',
    description: 'How a round stud of a given stone diameter reads on the ear.',
    inputSchema: { type: 'object', required: ['diameter_mm'], properties: {
      diameter_mm: { type: 'number' } } } },
];

function runTool(name, a = {}) {
  switch (name) {
    case 'carat_to_mm': {
      const stone = a.stone || 'moissanite';
      if (!(a.carat > 0)) return { error: 'carat must be > 0' };
      return { carat: a.carat, stone, diameter_mm: r2(mmFromCarat(a.carat, stone)),
               all_stones: compareAtWeight(a.carat), cut: 'round brilliant' };
    }
    case 'mm_to_carat': {
      const stone = a.stone || 'moissanite';
      if (!(a.mm > 0)) return { error: 'mm must be > 0' };
      return { diameter_mm: a.mm, stone, carat: r3(caratFromMm(a.mm, stone)),
               all_stones: compareAtSize(a.mm), cut: 'round brilliant' };
    }
    case 'grading_scale': {
      if (a.scale === 'optical') return GRADING.optical;
      const key = a.scale === 'clarity' ? 'clarity' : 'colour';
      const grades = GRADING[key].grades;
      if (a.grade) {
        const g = grades.find(x => x.grade.toLowerCase() === String(a.grade).toLowerCase());
        return g || { error: `unknown grade: ${a.grade}`, available: grades.map(x => x.grade) };
      }
      return { scale: GRADING[key].scale, grades };
    }
    case 'ring_size_convert':
      return { ...convertRingSize(a.value, a.from || 'us'),
               basis: 'ISO 8653 - EU size is the inner circumference in mm',
               notes: SIZING.ring_sizes.notes };
    case 'necklace_length': {
      const key = a.unit === 'cm' ? 'cm' : 'inches';
      const hit = nearest(SIZING.necklace_lengths.rows, key, a.value);
      return { ...hit, exact: Math.abs(hit[key] - Number(a.value)) < 0.6 };
    }
    case 'stud_appearance': {
      const hit = nearest(SIZING.stud_sizes.rows, 'diameter_mm', a.diameter_mm);
      return { ...hit, requested_mm: Number(a.diameter_mm),
               exact: Math.abs(hit.diameter_mm - Number(a.diameter_mm)) < 0.25 };
    }
    default: return { error: `unknown tool: ${name}` };
  }
}

const CORS = { 'Access-Control-Allow-Origin': '*',
               'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
               'Access-Control-Allow-Headers': 'Content-Type, Mcp-Session-Id' };
const rpc = (id, result) => new Response(JSON.stringify({ jsonrpc: '2.0', id, result }),
  { headers: { 'content-type': 'application/json', ...CORS } });

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(JSON.stringify({
        name: 'com.fitiny/moissanite-tools',
        description: 'Jewellery sizing and gemstone grading over MCP',
        endpoint: url.origin + '/mcp',
        transport: 'streamable-http',
        tools: TOOLS.map(t => t.name),
        source: 'https://github.com/FITINY/moissanite-tools',
        website: 'https://fitiny.com/pages/moissanite-grading',
      }, null, 2), { headers: { 'content-type': 'application/json', ...CORS } });
    }

    if (url.pathname !== '/mcp') return new Response('not found', { status: 404, headers: CORS });
    if (request.method !== 'POST')
      return new Response('POST JSON-RPC to this endpoint', { status: 405, headers: CORS });

    let msg;
    try { msg = await request.json(); } catch {
      return new Response(JSON.stringify({ jsonrpc: '2.0', id: null,
        error: { code: -32700, message: 'parse error' } }),
        { status: 400, headers: { 'content-type': 'application/json', ...CORS } });
    }
    if (msg.method === 'initialize')
      return rpc(msg.id, { protocolVersion: '2024-11-05', capabilities: { tools: {} },
        serverInfo: { name: 'moissanite-tools', version: '1.0.0' } });
    if (msg.method === 'tools/list') return rpc(msg.id, { tools: TOOLS });
    if (msg.method === 'tools/call') {
      const out = runTool(msg.params?.name, msg.params?.arguments);
      return rpc(msg.id, { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] });
    }
    if (msg.method === 'ping') return rpc(msg.id, {});
    if (msg.id === undefined) return new Response(null, { status: 202, headers: CORS });
    return new Response(JSON.stringify({ jsonrpc: '2.0', id: msg.id,
      error: { code: -32601, message: `method not found: ${msg.method}` } }),
      { headers: { 'content-type': 'application/json', ...CORS } });
  },
};
