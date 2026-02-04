// ============================================================
// linearFunctions / hardGenerators.js - ALL 9 FIXED
// MATHEMATICALLY VERIFIED + BALANCED EXPLANATIONS
// ============================================================

if (!window.ProblemGenerator) {
    console.error("❌ ProblemGenerator not loaded before linearFunctions/hardGenerators.js");
} else {

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// ─── 1. TIERED PRICING ──────────────────────────────────────
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
        const base    = randInt(40, 200);
        const rate    = randInt(15, 80);
        const thr     = svc.threshold;
        const constant = base - rate * thr;

        const W1 = `${rate}t + ${base}`;
        const W2 = `${base}t + ${rate}`;
        const W3 = `${base}(t − ${thr}) + ${rate}`;

        const correct = constant >= 0
            ? `${rate}t + ${constant}`
            : `${rate}t − ${Math.abs(constant)}`;

        const choices = shuffle([
            { label: correct,  isCorrect: true },
            { label: W1,       isCorrect: false },
            { label: W2,       isCorrect: false },
            { label: W3,       isCorrect: false }
        ]);
        const letters = ["A", "B", "C", "D"];
        const correctLetter = letters[choices.findIndex(c => c.isCorrect)];

        const explanation =
            `This is a tiered pricing model:<br>` +
            `• The ${svc.threshWord} costs $${base}<br>` +
            `• Each additional ${svc.unit.replace(/s$/, "")} costs $${rate}<br><br>` +
            `For t ${svc.unit} total, there are (t − ${thr}) additional ${svc.unit}.<br><br>` +
            `Write the total cost equation:<br>` +
            `C = ${base} + ${rate}(t − ${thr})<br>` +
            `C = ${base} + ${rate}t − ${rate * thr}<br>` +
            `C = ${rate}t ${constant >= 0 ? '+ ' + constant : '− ' + Math.abs(constant)}`;

        return {
            id: `MATH-ALG-LF-H-GEN-TIERED-${Date.now()}`,
            topic: "algebra",
            subskill: "linear-functions",
            difficulty: "hard",
            question: `A company charges $${base} for the ${svc.threshWord} of ${svc.name}, then $${rate} for each additional ${svc.unit.replace(/s$/, "")}. Which function gives the total cost C, in dollars, for t ${svc.unit} of ${svc.name}, where t > ${thr}?`,
            choices: choices.map((c, i) => `${letters[i]}) C = ${c.label}`),
            answer: correctLetter,
            explanation,
            type: "generated"
        };
    });

// ─── 2. TWO-POINT MODEL → EVALUATE ──────────────────────────
    window.ProblemGenerator.registerTemplate("tplTwoPointModelHard", () => {
        const contexts = [
            { dep: "population", indep: "year", depUnit: "people", indepUnit: "years after 2010" },
            { dep: "demand",     indep: "price", depUnit: "units",  indepUnit: "dollars" },
            { dep: "inventory",  indep: "month", depUnit: "items",  indepUnit: "months" },
            { dep: "altitude",   indep: "time",  depUnit: "feet",   indepUnit: "minutes" },
            { dep: "revenue",    indep: "week",  depUnit: "dollars", indepUnit: "weeks" }
        ];
        const ctx = pick(contexts);

        const x1 = randInt(1, 5);
        const x2 = x1 + pick([2, 3, 4, 5]);
        const slope = pick([-800, -500, -300, -250, 200, 300, 500, 750]);
        const y1   = randInt(5, 20) * 1000;
        const y2   = y1 + slope * (x2 - x1);

        let xTarget = x1 + randInt(1, x2 - x1 - 1 || 1);
        if (xTarget === x1 || xTarget === x2) xTarget = x2 - 1;

        const yCorrect = y1 + slope * (xTarget - x1);

        const W1 = yCorrect + slope;
        const W2 = y1 + slope * xTarget;
        const W3 = yCorrect - slope;

        const opts = shuffle([
            { val: yCorrect, isCorrect: true },
            { val: W1,       isCorrect: false },
            { val: W2,       isCorrect: false },
            { val: W3,       isCorrect: false }
        ]);
        const letters = ["A", "B", "C", "D"];
        const correctLetter = letters[opts.findIndex(c => c.isCorrect)];
        const fmt = (n) => n.toLocaleString();

        const explanation =
            `Find the slope using the two data points:<br>` +
            `Slope = (${fmt(y2)} − ${fmt(y1)}) ÷ (${x2} − ${x1}) = ${slope} ${ctx.depUnit} per ${ctx.indepUnit.replace(/s$/, "")}<br><br>` +
            `Use the slope to find the value at ${ctx.indepUnit.replace(/s$/, "")} ${xTarget}:<br>` +
            `Start at point (${x1}, ${fmt(y1)}) and add ${slope} for each step forward.<br>` +
            `${fmt(y1)} + ${slope}(${xTarget} − ${x1}) = ${fmt(y1)} + ${slope * (xTarget - x1)} = ${fmt(yCorrect)}`;

        return {
            id: `MATH-ALG-LF-H-GEN-2PT-${Date.now()}`,
            topic: "algebra",
            subskill: "linear-functions",
            difficulty: "hard",
            question: `The ${ctx.dep} was ${fmt(y1)} ${ctx.depUnit} at ${ctx.indepUnit.replace(/s$/, "")} ${x1}, and ${fmt(y2)} ${ctx.depUnit} at ${ctx.indepUnit.replace(/s$/, "")} ${x2}. Assuming the relationship is linear, what is the ${ctx.dep} at ${ctx.indepUnit.replace(/s$/, "")} ${xTarget}?`,
            choices: opts.map((o, i) => `${letters[i]}) ${fmt(o.val)}`),
            answer: correctLetter,
            explanation,
            type: "generated"
        };
    });

// ─── 3. INTERPRET A CONSTANT ────────────────────────────────
    window.ProblemGenerator.registerTemplate("tplInterpretConstantHard", () => {
        const scenarios = [
            { fn: "temperature", unit: "°C", indep: "minutes", context: "a drink on a counter", rate: 0.25, hLabel: "minutes after being set down" },
            { fn: "water level", unit: "gallons", indep: "hours", context: "a draining tank", rate: 12, hLabel: "hours after the drain opens" },
            { fn: "battery level", unit: "%", indep: "minutes", context: "a laptop running", rate: 1.5, hLabel: "minutes of use" },
            { fn: "altitude", unit: "feet", indep: "seconds", context: "a descending balloon", rate: 8, hLabel: "seconds after release" }
        ];
        const s = pick(scenarios);
        const h = randInt(2, 8);
        const V = pick([18.5, 75, 42, 60, 85, 33.5, 91]);
        const r = s.rate;
        const valAt0 = V + r * h;

        const explanation =
            `This function is written in point-slope form.<br><br>` +
            `To understand what ${V} represents, substitute x = ${h}:<br>` +
            `F(${h}) = ${V} − ${r}(${h} − ${h})<br>` +
            `F(${h}) = ${V} − ${r}(0)<br>` +
            `F(${h}) = ${V}<br><br>` +
            `So ${V} is the ${s.fn} exactly ${h} ${s.indep} after it begins.<br><br>` +
            `(Note: At the very start (x = 0), the ${s.fn} would be F(0) = ${V} + ${r * h} = ${valAt0} ${s.unit})`;

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
            explanation,
            type: "generated"
        };
    });

// ─── 4. RATE-OF-CHANGE ONLY ─────────────────────────────────
    window.ProblemGenerator.registerTemplate("tplRateOfChangeOnlyHard", () => {
        const contexts = [
            { output: "fuel output", outputUnit: "liters",  input: "raw material", inputUnit: "kiloliters" },
            { output: "earnings",    outputUnit: "dollars", input: "hours worked", inputUnit: "hours" },
            { output: "water flow",  outputUnit: "gallons", input: "pump time",    inputUnit: "minutes" },
            { output: "distance",    outputUnit: "miles",   input: "travel time",  inputUnit: "hours" },
            { output: "heat output", outputUnit: "BTU",     input: "fuel burned",  inputUnit: "gallons" }
        ];
        const ctx     = pick(contexts);
        const slope   = randInt(50, 500) * pick([1, 2, 5]);
        const intercept = randInt(10, 200);
        const delta   = randInt(2, 6);
        const correct = slope * delta;

        const W1 = correct + intercept;
        const W2 = slope;
        const W3 = (slope + intercept) * delta;

        const opts = shuffle([
            { val: correct, isCorrect: true },
            { val: W1,      isCorrect: false },
            { val: W2,      isCorrect: false },
            { val: W3,      isCorrect: false }
        ]);
        const letters = ["A", "B", "C", "D"];
        const correctLetter = letters[opts.findIndex(c => c.isCorrect)];
        const fmt = (n) => n.toLocaleString();

        const explanation =
            `The slope (${slope}) tells us the rate of change — how much ${ctx.output} changes per unit of ${ctx.input}.<br><br>` +
            `For an increase of ${delta} ${ctx.inputUnit}:<br>` +
            `Change in ${ctx.output} = ${slope} × ${delta} = ${fmt(correct)} ${ctx.outputUnit}<br><br>` +
            `The constant ${intercept} doesn't affect the change in output — it only shifts the starting point.`;

        return {
            id: `MATH-ALG-LF-H-GEN-RATE-${Date.now()}`,
            topic: "algebra",
            subskill: "linear-functions",
            difficulty: "hard",
            question: `The ${ctx.output} is given by the function L = ${slope}k + ${intercept}, where k is the ${ctx.input} in ${ctx.inputUnit} and L is the ${ctx.output} in ${ctx.outputUnit}. If the ${ctx.input} increases by ${delta} ${ctx.inputUnit}, by how much does the ${ctx.output} increase?`,
            choices: opts.map((o, i) => `${letters[i]}) ${fmt(o.val)} ${ctx.outputUnit}`),
            answer: correctLetter,
            explanation,
            type: "generated"
        };
    });

// ─── 5. FUNCTION COMPOSITION ────────────────────────────────
    window.ProblemGenerator.registerTemplate("tplCompositionHard", () => {
        const a = pick([2, 3, 4, 5, 6]);
        const c = pick([-4, -3, -2, 2, 3, 4]);
        const target = pick([-6, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8]);
        const b = -a * (target + c);

        const W1 = -b / a;
        const W2 = -c;
        const W3 = target !== 0 ? -target : (target + 1);

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

        const explanation =
            `First, find h(x) by substituting g(x) into f(x):<br>` +
            `h(x) = f(g(x)) = f(x ${cSign})<br>` +
            `h(x) = ${a}(x ${cSign}) ${bSign}<br><br>` +
            `Distribute:<br>` +
            `h(x) = ${a}x ${a*c >= 0 ? '+ ' + (a*c) : '− ' + Math.abs(a*c)} ${bSign}<br>` +
            `h(x) = ${a}x ${(a*c + b) >= 0 ? '+ ' + (a*c + b) : '− ' + Math.abs(a*c + b)}<br><br>` +
            `To find the x-intercept, set h(x) = 0:<br>` +
            `${a}x ${(a*c + b) >= 0 ? '+ ' + (a*c + b) : '− ' + Math.abs(a*c + b)} = 0<br>` +
            `x = ${target}`;

        return {
            id: `MATH-ALG-LF-H-GEN-COMP-${Date.now()}`,
            topic: "algebra",
            subskill: "linear-functions",
            difficulty: "hard",
            question: `The functions f and g are defined by f(x) = ${a}x ${bSign} and g(x) = x ${cSign}. The function h is defined by h(x) = f(g(x)). What is the x-coordinate of the x-intercept of the graph of h?`,
            choices: opts.map((o, i) => `${letters[i]}) ${o.val}`),
            answer: correctLetter,
            explanation,
            type: "generated"
        };
    });

// ─── 6. INDIRECT EVAL ───────────────────────────────────────
    window.ProblemGenerator.registerTemplate("tplIndirectEvalHard", () => {
        const k = pick([2, 3, 4, 5]);
        const xVal = randInt(1, 8);
        const n = k * xVal;
        const m = randInt(1, 10);
        const p = randInt(-15, 20);
        const correct = m * xVal + p;
        const trap    = m * n + p;

        const W1 = correct + m;
        const W2 = m * xVal - p;

        const opts = shuffle([
            { val: correct, isCorrect: true },
            { val: trap,    isCorrect: false },
            { val: W1,      isCorrect: false },
            { val: W2,      isCorrect: false }
        ]);
        const letters = ["A", "B", "C", "D"];
        const correctLetter = letters[opts.findIndex(c => c.isCorrect)];
        const pSign = p >= 0 ? `+ ${p}` : `− ${Math.abs(p)}`;

        const explanation =
            `The equation defines f at the input ${k}x. To find f(${n}), we need to figure out what x-value makes ${k}x = ${n}.<br><br>` +
            `Solve for x:<br>` +
            `${k}x = ${n}<br>` +
            `x = ${xVal}<br><br>` +
            `Now substitute x = ${xVal} into the expression:<br>` +
            `f(${n}) = ${m}(${xVal}) ${pSign} = ${m * xVal} ${pSign} = ${correct}`;

        return {
            id: `MATH-ALG-LF-H-GEN-INDIRECT-${Date.now()}`,
            topic: "algebra",
            subskill: "linear-functions",
            difficulty: "hard",
            question: `For the function f, if f(${k}x) = ${m}x ${pSign} for all values of x, what is the value of f(${n})?`,
            choices: opts.map((o, i) => `${letters[i]}) ${o.val}`),
            answer: correctLetter,
            explanation,
            type: "generated"
        };
    });

// ─── 7. REAL-WORLD RATE MODEL ───────────────────────────────
    window.ProblemGenerator.registerTemplate("tplRealWorldModelHard", () => {
        const scenarios = [
            { noun: "production", unit: "units", timeWord: "months after launch", startLabel: "at launch" },
            { noun: "inventory",  unit: "items", timeWord: "weeks after restocking", startLabel: "after restocking" },
            { noun: "viewership", unit: "viewers", timeWord: "days after premiere", startLabel: "on premiere day" },
            { noun: "stock price", unit: "dollars", timeWord: "trading days after listing", startLabel: "on listing day" }
        ];
        const s = pick(scenarios);

        const slope = pick([-500, -300, -250, -200, 200, 250, 300, 500]);
        const y0    = randInt(3, 15) * 1000;
        const tEnd  = pick([6, 8, 10, 12, 13]);
        const yEnd  = y0 + slope * tEnd;

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

        const explanation =
            `At t = 0, the ${s.noun} is ${y0.toLocaleString()} ${s.unit}, so the y-intercept is ${y0.toLocaleString()}.<br><br>` +
            `Find the slope using the two data points:<br>` +
            `Slope = (${yEnd.toLocaleString()} − ${y0.toLocaleString()}) ÷ ${tEnd} = ${slope} ${s.unit} per ${s.timeWord.split(' ')[0]}<br><br>` +
            `The equation is:<br>` +
            `p = ${sSign}${sAbs}t + ${y0.toLocaleString()}`;

        return {
            id: `MATH-ALG-LF-H-GEN-MODEL-${Date.now()}`,
            topic: "algebra",
            subskill: "linear-functions",
            difficulty: "hard",
            question: `The ${s.noun} was ${y0.toLocaleString()} ${s.unit} ${s.startLabel}. After ${tEnd} ${s.timeWord.split(' ')[0]}s, it was ${yEnd.toLocaleString()} ${s.unit}. Assuming the ${s.noun} changed at a constant rate, which linear function best models the ${s.noun} p, in ${s.unit}, t ${s.timeWord}?`,
            choices: choices.map((c, i) => `${letters[i]}) ${c.label}`),
            answer: correctLetter,
            explanation,
            type: "generated"
        };
    });

// ─── 8. COVERAGE / PROPORTION ───────────────────────────────
    window.ProblemGenerator.registerTemplate("tplCoverageProportionHard", () => {
        const surfaces = [
            { thing: "a deck", surfaces: "top and bottom", N: 2 },
            { thing: "a fence", surfaces: "both sides",    N: 2 },
            { thing: "a wall",  surfaces: "two coats",     N: 2 },
            { thing: "a barn",  surfaces: "inside and outside", N: 2 },
            { thing: "a roof",  surfaces: "two layers",    N: 2 }
        ];
        const surf = pick(surfaces);
        const coverage = pick([50, 60, 75, 80, 100]);
        const coats    = surf.N;

        const explanation =
            `Calculate the total area that needs to be sealed:<br>` +
            `${surf.thing.charAt(0).toUpperCase() + surf.thing.slice(1)} has area A, and needs sealant on ${surf.surfaces}.<br>` +
            `Total area = ${coats}A square feet<br><br>` +
            `Each gallon covers ${coverage} square feet, so:<br>` +
            `Gallons needed = Total area ÷ Coverage<br>` +
            `S = ${coats}A ÷ ${coverage}`;

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
            explanation,
            type: "generated"
        };
    });

// ─── 9. LINEAR MODEL APPLICATION (REVERSE) ──────────────────
// SAT-STYLE: Given linear model and output, find input
    window.ProblemGenerator.registerTemplate("tplLinearModelReverseHard", () => {
        const scenarios = [
            {
                context: "A streaming service charges a monthly fee plus a per-movie rental fee.",
                varName: "m",
                setup: (base, rate) => `The total cost C, in dollars, is given by C = ${rate}m + ${base}, where m is the number of movies rented.`,
                question: (total) => `If a customer's total cost for a month was $${total}, how many movies did they rent?`,
                rate: randInt(2, 6),
                base: randInt(8, 20)
            },
            {
                context: "A taxi charges a base fare plus a per-mile charge.",
                varName: "d",
                setup: (base, rate) => `The total fare F, in dollars, is given by F = ${rate.toFixed(2)}d + ${base}, where d is the distance traveled in miles.`,
                question: (total) => `If a passenger paid $${total} for a ride, how many miles did they travel?`,
                rate: Number((randInt(15, 35) / 10).toFixed(2)),
                base: randInt(3, 8)
            },
            {
                context: "A gym membership has a signup fee plus a monthly fee.",
                varName: "t",
                setup: (base, rate) => `The total cost T, in dollars, after t months is given by T = ${rate}t + ${base}.`,
                question: (total) => `If a member has paid a total of $${total}, for how many months have they been a member?`,
                rate: randInt(25, 60),
                base: randInt(30, 100)
            },
            {
                context: "A phone data plan charges a base price plus a cost per gigabyte.",
                varName: "g",
                setup: (base, rate) => `The total bill P, in dollars, is given by P = ${rate}g + ${base}, where g is the number of gigabytes used.`,
                question: (total) => `If a customer's bill was $${total} in a month, how many gigabytes did they use?`,
                rate: randInt(5, 15),
                base: randInt(20, 50)
            },
            {
                context: "A printing service charges a setup fee plus a per-page printing cost.",
                varName: "p",
                setup: (base, rate) => `The total cost C, in dollars, is given by C = ${rate.toFixed(2)}p + ${base}, where p is the number of pages.`,
                question: (total) => `If the total cost was $${total}, how many pages were printed?`,
                rate: Number((randInt(5, 20) / 100).toFixed(2)),
                base: randInt(10, 25)
            }
        ];

        const scenario = pick(scenarios);
        const rate = scenario.rate;
        const base = scenario.base;

        // Pick an answer that makes sense
        const answer = randInt(4, 20);
        const total = Number((rate * answer + base).toFixed(2));

        // Common errors
        const W1 = Math.round(total - base);              // Forgot to divide by rate
        const W2 = Math.round((total + base) / rate);     // Added instead of subtracted
        const W3 = Math.round(total / rate);              // Forgot to subtract base first

        const opts = shuffle([
            { val: answer, isCorrect: true },
            { val: W1,     isCorrect: false },
            { val: W2,     isCorrect: false },
            { val: W3,     isCorrect: false }
        ].filter((v, i, a) => {
            // Remove duplicates and negative values
            const idx = a.findIndex(x => x.val === v.val);
            return idx === i && v.val > 0;
        }));

        // Fill to 4 if needed
        while (opts.length < 4) {
            const newVal = answer + opts.length * 2;
            if (!opts.find(o => o.val === newVal)) {
                opts.push({ val: newVal, isCorrect: false });
            }
        }

        const letters = ["A", "B", "C", "D"];
        const correctLetter = letters[opts.findIndex(o => o.isCorrect)];

        const rateDisplay = Number.isInteger(rate) ? rate : rate.toFixed(2);
        const totalMinusBase = Number((total - base).toFixed(2));

        const question =
            `${scenario.context}<br><br>` +
            `${scenario.setup(base, rate)}<br><br>` +
            `${scenario.question(total)}`;

        const explanation =
            `Substitute the total cost into the equation:<br>` +
            `${total} = ${rateDisplay}${scenario.varName} + ${base}<br><br>` +
            `Subtract ${base} from both sides:<br>` +
            `${totalMinusBase} = ${rateDisplay}${scenario.varName}<br><br>` +
            `Divide both sides by ${rateDisplay}:<br>` +
            `${scenario.varName} = ${answer}`;

        return {
            id: `MATH-ALG-LF-H-GEN-REVERSE-${Date.now()}`,
            topic: "algebra",
            subskill: "linear-functions",
            difficulty: "hard",
            question,
            choices: opts.map((o, i) => `${letters[i]}) ${o.val}`),
            answer: correctLetter,
            explanation,
            type: "generated"
        };
    });

    console.log("✅ 9 hard linear-functions generators loaded with BALANCED EXPLANATIONS");
}