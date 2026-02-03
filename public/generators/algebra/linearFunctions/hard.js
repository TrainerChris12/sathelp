// ============================================================
// linearFunctions / hardGenerators.js
// 9 generators — one per hard-problem category from the SAT
// reference PDF. Each randomizes parameters, builds correct
// answer + 3 structurally plausible wrong answers, and writes
// a plain-English step-by-step explanation.
// ============================================================

if (!window.ProblemGenerator) {
    console.error("❌ ProblemGenerator not loaded before linearFunctions/hardGenerators.js");
} else {

// ─── tiny helpers ─────────────────────────────────────────────
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// ─── 1. TIERED PRICING  (first-N-then-rate) ─────────────────
// Pattern: C = rate*(t - threshold) + baseCost
// Wrong answers swap base/rate or forget to subtract threshold.
    window.ProblemGenerator.registerTemplate("tplTieredPricingHard", () => {
        const services = [
            { name: "equipment rental", unit: "days", threshold: 1, threshWord: "first day" },
            { name: "repair service",   unit: "hours", threshold: 2, threshWord: "first 2 hours" },
            { name: "tent rental",      unit: "days", threshold: 1, threshWord: "first day" },
            { name: "cleaner rental",   unit: "days", threshold: 1, threshWord: "first day" },
            { name: "van rental",       unit: "days", threshold: 3, threshWord: "first 3 days" },
            { name: "tool hire",        unit: "hours", threshold: 1, threshWord: "first hour" }
        ];
        const svc     = pick(services);
        const base    = randInt(40, 200);           // cost for the threshold block
        const rate    = randInt(15, 80);            // cost per unit after threshold
        const thr     = svc.threshold;
        // correct simplified: C = rate*t + (base - rate*thr)
        const constant = base - rate * thr;         // can be negative — that's fine
        // wrong answer traps:
        // W1: treat base as per-unit for ALL units  → rate*t + base  (ignores threshold logic)
        // W2: swap base and rate                    → base*t + rate
        // W3: use base as add-on, rate for all      → rate*t + base  … same as W1, so use base*(t-thr)+rate instead
        const W1 = `${rate}t + ${base}`;
        const W2 = `${base}t + ${rate}`;
        const W3 = `${base}(t − ${thr}) + ${rate}`;
        const correct = constant >= 0
            ? `${rate}t + ${constant}`
            : `${rate}t − ${Math.abs(constant)}`;

        const varName = "t";
        const choices = shuffle([
            { label: correct,  isCorrect: true },
            { label: W1,       isCorrect: false },
            { label: W2,       isCorrect: false },
            { label: W3,       isCorrect: false }
        ]);
        const letters = ["A", "B", "C", "D"];
        const correctLetter = letters[choices.findIndex(c => c.isCorrect)];

        return {
            id: `MATH-ALG-LF-H-GEN-TIERED-${Date.now()}`,
            topic: "algebra",
            subskill: "linear-functions",
            difficulty: "hard",
            question: `A company charges $${base} for the ${svc.threshWord} of ${svc.name}, then $${rate} for each additional ${svc.unit.replace(/s$/, "")}. Which function gives the total cost C, in dollars, for ${varName} ${svc.unit} of ${svc.name}, where ${varName} > ${thr}?`,
            choices: choices.map((c, i) => `${letters[i]}) C = ${c.label}`),
            answer: correctLetter,
            explanation: `The ${svc.threshWord} cost $${base} total. After that, each extra ${svc.unit.replace(/s$/, "")} costs $${rate}. For ${varName} ${svc.unit} total, there are (${varName} − ${thr}) additional ${svc.unit}. Extra cost: ${rate}(${varName} − ${thr}) = ${rate}${varName} − ${rate * thr}. Add the base: ${base} + ${rate}${varName} − ${rate * thr} = ${rate}${varName} + ${constant >= 0 ? constant : '(' + constant + ')'}. The trap is treating $${base} as a simple add-on without subtracting the threshold units.`,
            type: "practice"
        };
    });

// ─── 2. TWO-POINT MODEL → EVALUATE ──────────────────────────
// Given two (x, y) pairs, find y at a third x.
    window.ProblemGenerator.registerTemplate("tplTwoPointModelHard", () => {
        const contexts = [
            { dep: "population", indep: "year", depUnit: "people", indepUnit: "years after 2010" },
            { dep: "demand",     indep: "price", depUnit: "units",  indepUnit: "dollars" },
            { dep: "inventory",  indep: "month", depUnit: "items",  indepUnit: "months" },
            { dep: "altitude",   indep: "time",  depUnit: "feet",   indepUnit: "minutes" },
            { dep: "revenue",    indep: "week",  depUnit: "dollars", indepUnit: "weeks" }
        ];
        const ctx = pick(contexts);

        // pick x1, x2 with clean slope
        const x1 = randInt(1, 5);
        const x2 = x1 + pick([2, 3, 4, 5]);
        const slope = pick([-800, -500, -300, -250, 200, 300, 500, 750]);
        const y1   = randInt(5, 20) * 1000;
        const y2   = y1 + slope * (x2 - x1);
        // target x is between or near x1/x2
        let xTarget = x1 + randInt(1, x2 - x1 - 1 || 1);
        if (xTarget === x1 || xTarget === x2) xTarget = x2 - 1;
        const yCorrect = y1 + slope * (xTarget - x1);

        // wrong answers: common arithmetic errors
        const W1 = yCorrect + slope;                 // off by one unit
        const W2 = y1 + slope * (xTarget);           // forgot to subtract x1
        const W3 = yCorrect - slope;                 // sign error on slope

        const opts = shuffle([
            { val: yCorrect, isCorrect: true },
            { val: W1,       isCorrect: false },
            { val: W2,       isCorrect: false },
            { val: W3,       isCorrect: false }
        ]);
        const letters = ["A", "B", "C", "D"];
        const correctLetter = letters[opts.findIndex(c => c.isCorrect)];
        const fmt = (n) => n.toLocaleString();

        return {
            id: `MATH-ALG-LF-H-GEN-2PT-${Date.now()}`,
            topic: "algebra",
            subskill: "linear-functions",
            difficulty: "hard",
            question: `The ${ctx.dep} was ${fmt(y1)} ${ctx.depUnit} at ${ctx.indepUnit.replace(/s$/, "")} ${x1}, and ${fmt(y2)} ${ctx.depUnit} at ${ctx.indepUnit.replace(/s$/, "")} ${x2}. Assuming the relationship is linear, what is the ${ctx.dep} at ${ctx.indepUnit.replace(/s$/, "")} ${xTarget}?`,
            choices: opts.map((o, i) => `${letters[i]}) ${fmt(o.val)}`),
            answer: correctLetter,
            explanation: `Step 1 — find the slope: (${fmt(y2)} − ${fmt(y1)}) ÷ (${x2} − ${x1}) = ${fmt(y2 - y1)} ÷ ${x2 - x1} = ${slope} per unit. Step 2 — use point (${x1}, ${fmt(y1)}) to write the equation: ${ctx.dep} = ${slope}(t − ${x1}) + ${fmt(y1)}. Step 3 — plug in t = ${xTarget}: ${slope}(${xTarget} − ${x1}) + ${fmt(y1)} = ${slope * (xTarget - x1)} + ${fmt(y1)} = ${fmt(yCorrect)}.`,
            type: "practice"
        };
    });

// ─── 3. INTERPRET A CONSTANT (non-obvious) ──────────────────
// Equation in point-slope form: F(x) = V − r(x − h).
// V is the value at x = h, NOT at x = 0. That's the trap.
    window.ProblemGenerator.registerTemplate("tplInterpretConstantHard", () => {
        const scenarios = [
            { fn: "temperature", unit: "°C", indep: "minutes", context: "a drink on a counter", rate: -0.25, hLabel: "minutes after being set down" },
            { fn: "water level", unit: "gallons", indep: "hours", context: "a draining tank", rate: -12, hLabel: "hours after the drain opens" },
            { fn: "battery level", unit: "%", indep: "minutes", context: "a laptop running", rate: -1.5, hLabel: "minutes of use" },
            { fn: "altitude", unit: "feet", indep: "seconds", context: "a descending balloon", rate: -8, hLabel: "seconds after release" }
        ];
        const s = pick(scenarios);
        const h = randInt(2, 8);           // the x where V is the value
        const V = pick([18.5, 75, 42, 60, 85, 33.5, 91]);  // the constant to interpret
        const r = Math.abs(s.rate);

        // value at x=0: V + r*h  (since rate is negative: F(0) = V − (−r)(0 − h) = V + r*h… wait)
        // F(x) = V − r*(x − h)  where r > 0 and function is decreasing
        // F(0) = V − r*(0 − h) = V + r*h
        const valAt0 = V + r * h;

        return {
            id: `MATH-ALG-LF-H-GEN-CONST-${Date.now()}`,
            topic: "algebra",
            subskill: "linear-functions",
            difficulty: "hard",
            question: `The function F(x) = ${V} − ${r}(x − ${h}) gives the ${s.fn}, in ${s.unit}, of ${s.context} x ${s.indep} after it begins. The constant ${V} in this function best estimates which of the following?`,
            choices: [
                `A) The ${s.fn} at the very start (x = 0)`,
                `B) The ${s.fn} exactly ${h} ${s.indep} in`,
                `C) The rate of change of ${s.fn} per ${s.indep.replace(/s$/, "")}`,
                `D) The ${s.fn} after ${V} ${s.indep}`
            ],
            answer: "B",
            explanation: `${V} is NOT the starting value — that's the most common mistake here. The equation is in point-slope form. The term −${r}(x − ${h}) equals zero when x = ${h}. So at x = ${h}, F(${h}) = ${V} − ${r}(0) = ${V}. That means ${V} is the ${s.fn} exactly ${h} ${s.indep} in. For reference, the actual starting value at x = 0 is F(0) = ${V} − ${r}(0 − ${h}) = ${V} + ${r * h} = ${valAt0}.`,
            type: "practice"
        };
    });

// ─── 4. RATE-OF-CHANGE ONLY (constant cancels out) ──────────
// L = slope*k + intercept. "If k increases by Δ, L increases by ?"
// Answer = slope × Δ. Traps: add intercept, or use Δ wrong.
    window.ProblemGenerator.registerTemplate("tplRateOfChangeOnlyHard", () => {
        const contexts = [
            { output: "fuel output", outputUnit: "liters",  input: "raw material", inputUnit: "kiloliters" },
            { output: "earnings",    outputUnit: "dollars", input: "hours worked", inputUnit: "hours" },
            { output: "water flow",  outputUnit: "gallons", input: "pump time",    inputUnit: "minutes" },
            { output: "distance",    outputUnit: "miles",   input: "travel time",  inputUnit: "hours" },
            { output: "heat output", outputUnit: "BTU",     input: "fuel burned",  inputUnit: "gallons" }
        ];
        const ctx     = pick(contexts);
        const slope   = randInt(50, 500) * pick([1, 1, 1, 2, 5]);   // keep it clean
        const intercept = randInt(10, 200);
        const delta   = randInt(2, 6);
        const correct = slope * delta;

        const W1 = correct + intercept;   // added intercept
        const W2 = slope;                 // forgot to multiply by delta
        const W3 = (slope + intercept) * delta;  // included intercept in rate

        const opts = shuffle([
            { val: correct, isCorrect: true },
            { val: W1,      isCorrect: false },
            { val: W2,      isCorrect: false },
            { val: W3,      isCorrect: false }
        ]);
        const letters = ["A", "B", "C", "D"];
        const correctLetter = letters[opts.findIndex(c => c.isCorrect)];
        const fmt = (n) => n.toLocaleString();

        return {
            id: `MATH-ALG-LF-H-GEN-RATE-${Date.now()}`,
            topic: "algebra",
            subskill: "linear-functions",
            difficulty: "hard",
            question: `The ${ctx.output} is given by the function L = ${slope}k + ${intercept}, where k is the ${ctx.input} in ${ctx.inputUnit} and L is the ${ctx.output} in ${ctx.outputUnit}. If the ${ctx.input} increases by ${delta} ${ctx.inputUnit}, by how much does the ${ctx.output} increase?`,
            choices: opts.map((o, i) => `${letters[i]}) ${fmt(o.val)} ${ctx.outputUnit}`),
            answer: correctLetter,
            explanation: `When the input changes, only the slope part of the equation affects the output — the constant ${intercept} stays the same and cancels out. The slope is ${slope}, which means each additional ${ctx.inputUnit.replace(/s$/, "")} adds ${slope} ${ctx.outputUnit}. For ${delta} extra ${ctx.inputUnit}: ${slope} × ${delta} = ${fmt(correct)}. Don't add the ${intercept} — that's a fixed amount already in the output regardless of input.`,
            type: "practice"
        };
    });

// ─── 5. FUNCTION COMPOSITION — find x-intercept of h = f(g(x)) ─
// f(x) = ax + b,  g(x) = x + c.  h(x) = a(x+c) + b = ax + ac + b
// x-intercept: x = −(ac + b) / a  — choose a, b, c so this is integer.
// Force: ac + b = a * (integer).  Let target = randInt(−10, 10).
// Then ac + b = −a * target → b = −a*(target + c)
    window.ProblemGenerator.registerTemplate("tplCompositionHard", () => {
        const a = pick([2, 3, 4, 5, 6]);
        const c = pick([-4, -3, -2, 2, 3, 4]);
        const target = pick([-6, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8]);
        const b = -a * (target + c);   // ensures h(target) = 0
        // verify: h(x) = a(x+c)+b = ax + ac + b. h(target) = a*target + ac + b = a*target − a*(target+c) + ac
        //        = a*target − a*target − ac + ac = 0 ✓

        // Wrong answers:
        // W1: x-intercept of f alone:  ax + b = 0 → x = −b/a = target + c
        // W2: x-intercept of g alone:  x + c = 0 → x = −c
        // W3: confused sign:           x = target but with wrong sign... use −target if target ≠ 0
        const W1 = target + c;
        const W2 = -c;
        const W3 = -target || (target + 1);  // avoid 0 = correct

        const opts = shuffle([
            { val: target, isCorrect: true },
            { val: W1,     isCorrect: false },
            { val: W2,     isCorrect: false },
            { val: W3,     isCorrect: false }
        ]);
        const letters = ["A", "B", "C", "D"];
        const correctLetter = letters[opts.findIndex(c => c.isCorrect)];
        const bSign = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
        const cSign = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;

        return {
            id: `MATH-ALG-LF-H-GEN-COMP-${Date.now()}`,
            topic: "algebra",
            subskill: "linear-functions",
            difficulty: "hard",
            question: `The functions f and g are defined by f(x) = ${a}x ${bSign} and g(x) = x ${cSign}. The function h is defined by h(x) = f(g(x)). What is the x-coordinate of the x-intercept of the graph of h?`,
            choices: opts.map((o, i) => `${letters[i]}) ${o.val}`),
            answer: correctLetter,
            explanation: `Build h(x) by putting g(x) into f. Replace every x in f with (x ${cSign}): h(x) = ${a}(x ${cSign}) ${bSign} = ${a}x ${a*c >= 0 ? '+ ' + (a*c) : '− ' + Math.abs(a*c)} ${bSign} = ${a}x ${(a*c + b) >= 0 ? '+ ' + (a*c + b) : '− ' + Math.abs(a*c + b)}. Set h(x) = 0: ${a}x ${(a*c + b) >= 0 ? '+ ' + (a*c + b) : '− ' + Math.abs(a*c + b)} = 0. Solve: x = ${target}. Common traps: finding the x-intercept of just f (that gives ${W1}), or of just g (that gives ${W2}).`,
            type: "practice"
        };
    });

// ─── 6. INDIRECT EVAL — f(kx) = expr, find f(n) ─────────────
// f(kx) = mx + p.  Given target n, solve kx = n → x = n/k.
// Choose k, n so n/k is integer.  Answer = m*(n/k) + p.
// Trap: plug n directly into mx + p.
    window.ProblemGenerator.registerTemplate("tplIndirectEvalHard", () => {
        const k = pick([2, 3, 4, 5]);
        const xVal = randInt(1, 8);       // the x we'll actually use
        const n = k * xVal;               // the input to f we want
        const m = randInt(1, 10);
        const p = randInt(-15, 20);
        const correct = m * xVal + p;
        const trap    = m * n + p;        // plug n in directly — wrong

        const W1 = correct + m;           // off-by-one in x
        const W2 = m * xVal - p;          // sign error on constant

        const opts = shuffle([
            { val: correct, isCorrect: true },
            { val: trap,    isCorrect: false },
            { val: W1,      isCorrect: false },
            { val: W2,      isCorrect: false }
        ]);
        const letters = ["A", "B", "C", "D"];
        const correctLetter = letters[opts.findIndex(c => c.isCorrect)];
        const pSign = p >= 0 ? `+ ${p}` : `− ${Math.abs(p)}`;

        return {
            id: `MATH-ALG-LF-H-GEN-INDIRECT-${Date.now()}`,
            topic: "algebra",
            subskill: "linear-functions",
            difficulty: "hard",
            question: `For the function f, if f(${k}x) = ${m}x ${pSign} for all values of x, what is the value of f(${n})?`,
            choices: opts.map((o, i) => `${letters[i]}) ${o.val}`),
            answer: correctLetter,
            explanation: `The equation tells you what f does to the input ${k}x, not x by itself. To find f(${n}), figure out what x makes ${k}x equal ${n}. Solve: ${k}x = ${n} → x = ${xVal}. Now plug x = ${xVal} into the right side: ${m}(${xVal}) ${pSign} = ${m * xVal} ${pSign} = ${correct}. The big trap is plugging ${n} straight into ${m}x ${pSign}, which gives ${trap} — that's wrong because the input to f is ${k}x, not x.`,
            type: "practice"
        };
    });

// ─── 7. REAL-WORLD RATE MODEL — choose correct equation ─────
// Two data points → slope + intercept. Pick which of 4 equations is right.
// Traps: wrong sign on slope, wrong intercept, misplaced values.
    window.ProblemGenerator.registerTemplate("tplRealWorldModelHard", () => {
        const scenarios = [
            { noun: "production", unit: "units", timeWord: "months after launch", startLabel: "at launch" },
            { noun: "inventory",  unit: "items", timeWord: "weeks after restocking", startLabel: "after restocking" },
            { noun: "viewership", unit: "viewers", timeWord: "days after premiere", startLabel: "on premiere day" },
            { noun: "stock price", unit: "dollars", timeWord: "trading days after listing", startLabel: "on listing day" }
        ];
        const s = pick(scenarios);

        // make slope clean and negative or positive with 50/50
        const slope = pick([-500, -300, -250, -200, 200, 250, 300, 500]);
        const y0    = randInt(3, 15) * 1000;  // value at t = 0
        const tEnd  = pick([6, 8, 10, 12, 13]);
        const yEnd  = y0 + slope * tEnd;

        // The four choices:
        // A) correct:       slope*t + y0
        // B) wrong sign:    −slope*t + y0
        // C) wrong intercept (use yEnd): slope*t + yEnd
        // D) both wrong:    −slope*t + yEnd
        const sAbs = Math.abs(slope);
        const sSign = slope < 0 ? '-' : '';
        const choices_raw = [
            { label: `p = ${sSign}${sAbs}t + ${y0.toLocaleString()}`, isCorrect: true },
            { label: `p = ${slope < 0 ? '' : '-'}${sAbs}t + ${y0.toLocaleString()}`, isCorrect: false },
            { label: `p = ${sSign}${sAbs}t + ${yEnd.toLocaleString()}`, isCorrect: false },
            { label: `p = ${slope < 0 ? '' : '-'}${sAbs}t + ${yEnd.toLocaleString()}`, isCorrect: false }
        ];
        const choices = shuffle(choices_raw);
        const letters = ["A", "B", "C", "D"];
        const correctLetter = letters[choices.findIndex(c => c.isCorrect)];

        return {
            id: `MATH-ALG-LF-H-GEN-MODEL-${Date.now()}`,
            topic: "algebra",
            subskill: "linear-functions",
            difficulty: "hard",
            question: `The ${s.noun} was ${y0.toLocaleString()} ${s.unit} ${s.startLabel}. After ${tEnd} ${s.timeWord.split(' ')[0]}s, it was ${yEnd.toLocaleString()} ${s.unit}. Assuming the ${s.noun} changed at a constant rate, which linear function best models the ${s.noun} p, in ${s.unit}, t ${s.timeWord}?`,
            choices: choices.map((c, i) => `${letters[i]}) ${c.label}`),
            answer: correctLetter,
            explanation: `At t = 0, the ${s.noun} is ${y0.toLocaleString()} — that's the y-intercept, so eliminate any choice with a different starting value. The rate of change (slope): (${yEnd.toLocaleString()} − ${y0.toLocaleString()}) ÷ ${tEnd} = ${(yEnd - y0).toLocaleString()} ÷ ${tEnd} = ${slope} per unit of time. ${slope < 0 ? 'The slope is negative because the value is dropping.' : 'The slope is positive because the value is rising.'} The model is p = ${sSign}${sAbs}t + ${y0.toLocaleString()}.`,
            type: "practice"
        };
    });

// ─── 8. COVERAGE / PROPORTION ────────────────────────────────
// 1 gal covers X sqft. Surface area = A sqft. Paint N coats.
// S = N*A / X.   Traps: forget multiplier, invert fraction.
    window.ProblemGenerator.registerTemplate("tplCoverageProportionHard", () => {
        const surfaces = [
            { thing: "a deck", surfaces: "top and bottom", N: 2 },
            { thing: "a fence", surfaces: "both sides",    N: 2 },
            { thing: "a wall",  surfaces: "two coats",     N: 2 },
            { thing: "a barn",  surfaces: "inside and outside", N: 2 },
            { thing: "a roof",  surfaces: "two layers",    N: 2 }
        ];
        const surf = pick(surfaces);
        const coverage = pick([50, 60, 75, 80, 100]);  // sqft per gallon
        const coats    = surf.N;
        // variable A = area

        // correct: S = coats*A / coverage
        // Traps:
        // W1: S = A / coverage          (forgot multiplier)
        // W2: S = coverage / (coats*A)  (inverted)
        // W3: S = A / (coverage*coats)  (put coats in denominator)

        return {
            id: `MATH-ALG-LF-H-GEN-COVER-${Date.now()}`,
            topic: "algebra",
            subskill: "linear-functions",
            difficulty: "hard",
            question: `One gallon of sealant covers ${coverage} square feet. ${surf.thing.charAt(0).toUpperCase() + surf.thing.slice(1)} has a total area of A square feet and needs to be sealed on ${surf.surfaces}. Which equation gives the total amount of sealant S, in gallons, needed?`,
            choices: [
                `A) S = ${coats}A ÷ ${coverage}`,
                `B) S = A ÷ ${coverage}`,
                `C) S = ${coverage} ÷ (${coats}A)`,
                `D) S = A ÷ ${coverage * coats}`
            ],
            answer: "A",
            explanation: `The total area to cover is ${coats} × A = ${coats}A square feet (because of ${surf.surfaces}). Each gallon covers ${coverage} square feet. Gallons needed = total area ÷ coverage per gallon = ${coats}A ÷ ${coverage}. Choice B only accounts for one surface. Choice D puts ${coats} in the denominator as if each gallon covered ${coverage * coats} sqft, which isn't what's given. Choice C inverts the fraction entirely.`,
            type: "practice"
        };
    });

// ─── 9. INVERSE SOLVE — given output, find input ─────────────
// Conversion-style: Output = (a/b)*Input + c.  Given Output = V, find Input.
// Choose a/b, c, V so Input is a clean integer.
    window.ProblemGenerator.registerTemplate("tplInverseSolveHard", () => {
        const conversions = [
            { outName: "Fahrenheit", inName: "Celsius",    a: 9, b: 5, c: 32,  symbol: "°F", inSymbol: "°C" },
            { outName: "kilometers", inName: "miles",      a: 8, b: 5, c: 0,   symbol: " km", inSymbol: " mi" },
            { outName: "total cost", inName: "quantity",   a: 7, b: 1, c: 25,  symbol: " dollars", inSymbol: " items" }
        ];
        const conv = pick(conversions);
        // pick input (integer), compute output
        const inputVal  = randInt(10, 200);
        const outputVal = (conv.a / conv.b) * inputVal + conv.c;
        // only use if output is reasonable (not too big)
        // For display, round output to 1 decimal if needed
        const outDisplay = Number.isInteger(outputVal) ? outputVal : outputVal.toFixed(1);

        // Traps:
        // W1: plug output straight into the formula as if it were input → (a/b)*outputVal + c
        // W2: subtract c but forget to invert the fraction → (outputVal − c) * (a/b)
        // W3: off-by-sign: (outputVal + c) * (b/a)
        const correct = inputVal;
        const W1 = Math.round((conv.a / conv.b) * outputVal + conv.c);
        const W2 = Math.round((outputVal - conv.c) * (conv.a / conv.b));
        const W3 = Math.round((outputVal + conv.c) * (conv.b / conv.a));

        const opts = shuffle([
            { val: correct, isCorrect: true },
            { val: W1,      isCorrect: false },
            { val: W2,      isCorrect: false },
            { val: W3,      isCorrect: false }
        ]);
        const letters = ["A", "B", "C", "D"];
        const correctLetter = letters[opts.findIndex(c => c.isCorrect)];

        const fracDisplay = conv.b === 1 ? `${conv.a}` : `(${conv.a}/${conv.b})`;

        return {
            id: `MATH-ALG-LF-H-GEN-INV-${Date.now()}`,
            topic: "algebra",
            subskill: "linear-functions",
            difficulty: "hard",
            question: `The equation O = ${fracDisplay} × I + ${conv.c} converts ${conv.inName} (I) to ${conv.outName} (O). If something measures ${outDisplay}${conv.symbol}, what is it in ${conv.inName}?`,
            choices: opts.map((o, i) => `${letters[i]}) ${o.val}${conv.inSymbol}`),
            answer: correctLetter,
            explanation: `Plug in O = ${outDisplay} and solve for I. Start: ${outDisplay} = ${fracDisplay} × I + ${conv.c}. Subtract ${conv.c}: ${outDisplay} − ${conv.c} = ${outDisplay - conv.c} = ${fracDisplay} × I. ${conv.b === 1 ? `Divide by ${conv.a}` : `Multiply by ${conv.b}/${conv.a}`}: I = ${outDisplay - conv.c} × ${conv.b === 1 ? `(1/${conv.a})` : `(${conv.b}/${conv.a})`} = ${correct}. The most common mistake is plugging the output back into the formula as an input, or forgetting to flip the fraction when isolating I.`,
            type: "practice"
        };
    });

    console.log("✅ 9 hard linear-functions generators loaded.");
}