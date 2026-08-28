/** Plain assertions — no test framework needed. */
import assert from 'assert';
import { caratFromMm, mmFromCarat, compareAtWeight } from '../src/conversion.js';

// Published diamond reference points; tolerance covers cut variation.
const DIAMOND = [[0.1, 3.0], [0.5, 5.2], [1, 6.5], [2, 8.0], [5, 11.0]];
for (const [ct, mm] of DIAMOND) {
  const got = mmFromCarat(ct, 'diamond');
  assert.ok(Math.abs(got - mm) / mm < 0.04, `${ct}ct diamond: expected ~${mm}mm, got ${got.toFixed(2)}mm`);
}

// Round-trip must be exact.
for (const mm of [3, 6.5, 12]) {
  for (const stone of ['moissanite', 'diamond', 'cz']) {
    const back = mmFromCarat(caratFromMm(mm, stone), stone);
    assert.ok(Math.abs(back - mm) < 1e-6, `round-trip failed for ${mm}mm ${stone}`);
  }
}

// The whole point: moissanite is larger than diamond at equal weight.
const one = compareAtWeight(1);
assert.ok(one.moissanite_mm > one.diamond_mm, 'moissanite should be larger than diamond at 1ct');
assert.ok(one.diamond_mm > one.cz_mm, 'diamond should be larger than CZ at 1ct');

// Bad input is rejected rather than returning NaN.
assert.throws(() => mmFromCarat(0, 'moissanite'));
assert.throws(() => caratFromMm(-1, 'moissanite'));
assert.throws(() => mmFromCarat(1, 'ruby'));

console.log('all conversion tests passed');

// --- sizing ---
import { convertRingSize, necklaceLength, studAppearance } from '../src/sizing.js';

// The classic cross-border trap.
assert.strictEqual(convertRingSize(6, 'us').uk, 'M', 'US 6 must map to UK M');
assert.strictEqual(convertRingSize('M', 'uk').us, 6, 'UK M must map to US 6');

// ISO 8653: EU size is the circumference, so diameter = circumference / pi.
for (const r of [convertRingSize(7, 'us'), convertRingSize(9, 'us')]) {
  assert.ok(Math.abs(r.eu / Math.PI - r.diameter_mm) < 0.15, `ISO mismatch at US ${r.us}`);
}

// Off-chart input must be flagged, not silently rounded into a claim.
assert.strictEqual(convertRingSize(6.2, 'us').exact, false);

assert.strictEqual(necklaceLength(18).name, 'Princess');
assert.ok(studAppearance(6).reads_as.length > 10);

console.log('all sizing tests passed');
