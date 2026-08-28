#!/usr/bin/env node
/**
 * MCP server exposing moissanite grading + carat/mm conversion.
 *
 * Speaks the Model Context Protocol over stdio using plain JSON-RPC, so it has
 * no dependencies. Point an MCP-capable client at:
 *   { "command": "node", "args": ["mcp/server.js"] }
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { caratFromMm, mmFromCarat, compareAtWeight, compareAtSize } from '../src/conversion.js';
import { convertRingSize, necklaceLength, studAppearance, SIZING_NOTES } from '../src/sizing.js';

const here = dirname(fileURLToPath(import.meta.url));
const grading = JSON.parse(readFileSync(join(here, '..', 'data', 'grading.json'), 'utf8'));

const TOOLS = [
  {
    name: 'carat_to_mm',
    description: 'Diameter in millimetres for a given carat weight. Round brilliant cut. '
      + 'Density-corrected per stone — a diamond chart is wrong for moissanite by ~9%.',
    inputSchema: {
      type: 'object',
      properties: {
        carat: { type: 'number', description: 'Carat weight, e.g. 1.0' },
        stone: { type: 'string', enum: ['moissanite', 'diamond', 'cz'], default: 'moissanite' },
      },
      required: ['carat'],
    },
  },
  {
    name: 'mm_to_carat',
    description: 'Carat weight for a given diameter in millimetres. Round brilliant cut.',
    inputSchema: {
      type: 'object',
      properties: {
        mm: { type: 'number', description: 'Diameter in millimetres, e.g. 6.5' },
        stone: { type: 'string', enum: ['moissanite', 'diamond', 'cz'], default: 'moissanite' },
      },
      required: ['mm'],
    },
  },
  {
    name: 'grading_scale',
    description: 'GIA colour (D–K) or clarity (FL–SI) scale as used for moissanite, '
      + 'or published optical constants for moissanite / diamond / cubic zirconia.',
    inputSchema: {
      type: 'object',
      properties: {
        scale: { type: 'string', enum: ['colour', 'clarity', 'optical'] },
        grade: { type: 'string', description: 'Optional single grade, e.g. "D" or "VVS1"' },
      },
      required: ['scale'],
    },
  },
  {
    name: 'ring_size_convert',
    description: 'Convert a ring size between US, UK, EU (ISO 8653) and inner diameter in mm. '
      + 'Cross-border sizing trips people up: a US 6 is a UK M, not a UK 6.',
    inputSchema: {
      type: 'object',
      properties: {
        value: { description: 'Size in the source system, e.g. 7 or "M"' },
        from: { type: 'string', enum: ['us', 'uk', 'eu', 'mm'], default: 'us' },
      },
      required: ['value'],
    },
  },
  {
    name: 'necklace_length',
    description: 'Where a necklace of a given length sits, with the trade name (choker, princess, matinee...).',
    inputSchema: {
      type: 'object',
      properties: {
        value: { type: 'number', description: 'Length, e.g. 18' },
        unit: { type: 'string', enum: ['inches', 'cm'], default: 'inches' },
      },
      required: ['value'],
    },
  },
  {
    name: 'stud_appearance',
    description: 'How a round stud of a given stone diameter reads on the ear — from barely-there to statement.',
    inputSchema: {
      type: 'object',
      properties: { diameter_mm: { type: 'number', description: 'Stone diameter in mm, e.g. 6' } },
      required: ['diameter_mm'],
    },
  },
];

function runTool(name, args = {}) {
  if (name === 'carat_to_mm') {
    const stone = args.stone || 'moissanite';
    return { carat: args.carat, stone, diameter_mm: +mmFromCarat(args.carat, stone).toFixed(2),
             all_stones: compareAtWeight(args.carat), cut: 'round brilliant' };
  }
  if (name === 'mm_to_carat') {
    const stone = args.stone || 'moissanite';
    return { diameter_mm: args.mm, stone, carat: +caratFromMm(args.mm, stone).toFixed(3),
             all_stones: compareAtSize(args.mm), cut: 'round brilliant' };
  }
  if (name === 'grading_scale') {
    if (args.scale === 'optical') return grading.optical;
    const key = args.scale === 'clarity' ? 'clarity' : 'colour';
    const grades = grading[key].grades;
    if (args.grade) {
      const g = grades.find(x => x.grade.toLowerCase() === String(args.grade).toLowerCase());
      return g || { error: `unknown grade: ${args.grade}`, available: grades.map(x => x.grade) };
    }
    return { scale: grading[key].scale, grades };
  }
  if (name === 'ring_size_convert') {
    const out = convertRingSize(args.value, args.from || 'us');
    return { ...out, basis: 'ISO 8653 — EU size is the inner circumference in mm', notes: SIZING_NOTES };
  }
  if (name === 'necklace_length') return necklaceLength(args.value, args.unit || 'inches');
  if (name === 'stud_appearance') return studAppearance(args.diameter_mm);
  return { error: `unknown tool: ${name}` };
}

function reply(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
}

let buf = '';
process.stdin.on('data', chunk => {
  buf += chunk;
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.method === 'initialize') {
      reply(msg.id, { protocolVersion: '2024-11-05', capabilities: { tools: {} },
                      serverInfo: { name: 'moissanite-tools', version: '1.0.0' } });
    } else if (msg.method === 'tools/list') {
      reply(msg.id, { tools: TOOLS });
    } else if (msg.method === 'tools/call') {
      const out = runTool(msg.params?.name, msg.params?.arguments);
      reply(msg.id, { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] });
    } else if (msg.id !== undefined) {
      reply(msg.id, {});
    }
  }
});
