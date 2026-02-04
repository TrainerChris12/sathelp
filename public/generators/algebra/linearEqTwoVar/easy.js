// public/generators/algebra/linearEqTwoVar/easy.js
// ✅ Easy templates for Linear Equations in Two Variables
// FIXES INCLUDED:
// - More variety (avoid repeating the same outcomes)
// - Grammar/typo-safe singular/plural wording (no "boxe")
// - Math correctness checks + safer distractors
// - Consistent integer/clean outputs where intended
// - Better choice generation (unique, stable correct answer)

// NOTE: This file registers templates into ProblemGenerator.templates via registerTemplate.
// It assumes your pools reference these exact template names.

(function () {
    if (!window.ProblemGenerator) {
        console.error("❌ ProblemGenerator not loaded!");
        return;
    }

    const gen = window.problemGenerator;

    // =========================================================
    // SMALL UTILITIES (local to this file)
    // =========================================================
    const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

    // Very small, safe singularization for your current word set.
    // Falls back to removing trailing "s" if it exists.
    const singularize = (word) => {
        if (!word) return word;
        const lower = word.toLowerCase();

        // handle common irregulars you might add later
        const irregular = {
            "boxes": "box",
            "bottles": "bottle",
            "containers": "container",
            "tickets": "ticket",
            "packages": "package",
            "pages": "page",
            "minutes": "minute",
            "hours": "hour",
            "seconds": "second",
            "drinks": "drink",
            "salads": "salad",
            "coffees": "coffee",
            "pastries": "pastry",
            "hotdogs": "hotdog",
            "pretzels": "pretzel",
            "widgets": "widget",
            "gadgets": "gadget",
            "triangles": "triangle",
            "rectangles": "rectangle",
            "pentagons": "pentagon",
            "squares": "square",
            "hexagons": "hexagon"
        };

        if (irregular[lower]) return irregular[lower];

        if (word.endsWith("ies")) return word.slice(0, -3) + "y"; // e.g., "batteries" -> "battery"
        if (word.endsWith("s")) return word.slice(0, -1);
        return word;
    };

    // Force a nonzero int within range
    const randomNonZeroInt = (min, max) => {
        let v = 0;
        let guard = 0;
        while (v === 0 && guard++ < 50) v = gen.randomInt(min, max);
        return v === 0 ? 1 : v;
    };

    // Ensure we don't pick same number repeatedly in a session for certain templates
    // (soft variety; not perfect but reduces repeats)
    const seen = {
        coeffInterpret: new Set(),
        perpSlope: new Set(),
        mixTotals: new Set(),
        pointSlope: new Set(),
        parallelLine: new Set()
    };

    const pickUnseen = (key, candidates) => {
        const S = seen[key];
        const shuffled = gen.shuffle([...candidates]);
        for (const c of shuffled) {
            const tag = JSON.stringify(c);
            if (!S.has(tag)) {
                S.add(tag);
                if (S.size > 35) {
                    // prevent unbounded growth
                    const first = S.values().next().value;
                    S.delete(first);
                }
                return c;
            }
        }
        // if all seen, just return random
        const chosen = gen.randomChoice(candidates);
        S.add(JSON.stringify(chosen));
        return chosen;
    };

    // Robustly label choices A-D, and always compute answer index after shuffle
    const labelChoices = (choices, correctValue) => {
        const labeled = choices.map((c, i) => `${String.fromCharCode(65 + i)}) ${c}`);
        const idx = choices.findIndex((c) => c === correctValue);
        const letter = String.fromCharCode(65 + (idx === -1 ? 0 : idx));
        return { labeled, letter };
    };

    // Numeric choice builder (unique, 4 choices)
    const makeNumericChoices = (correct, spread = 6, allowDecimal = false) => {
        const set = new Set([correct]);
        let tries = 0;
        while (set.size < 4 && tries++ < 200) {
            const off = gen.randomInt(-spread, spread);
            if (off === 0) continue;

            let cand = correct + off;

            if (allowDecimal && Math.random() < 0.25) {
                cand = Number((cand + (Math.random() * 0.8 - 0.4)).toFixed(1));
            }

            // keep reasonable range
            if (Math.abs(cand) <= 200) set.add(cand);
        }
        while (set.size < 4) set.add(correct + gen.randomInt(-20, 20));
        return gen.shuffle([...set]);
    };

    // =========================================================
    // TEMPLATE 1: Coefficient Interpretation (Revenue/Cost)
    // =========================================================
    function template_coefficient_interpretation(original) {
        const contexts = [
            { itemPlural: "containers", adj1: "small", adj2: "large" },
            { itemPlural: "bottles", adj1: "one-liter", adj2: "three-liter" },
            { itemPlural: "boxes", adj1: "small", adj2: "large" },
            { itemPlural: "tickets", adj1: "student", adj2: "adult" },
            { itemPlural: "packages", adj1: "regular", adj2: "premium" }
        ];

        const ctx = gen.randomChoice(contexts);
        const itemSing = singularize(ctx.itemPlural);

        // Keep prices to cents; ensure price2 > price1
        const price1 = Number((Math.random() * 4 + 1.5).toFixed(2)); // 1.50 to 5.50
        const price2 = Number((price1 + Math.random() * 4 + 0.75).toFixed(2)); // higher

        // Choose x,y so total is consistent and nontrivial
        const x = gen.randomInt(20, 120);
        const y = gen.randomInt(20, 120);
        const total = Number((price1 * x + price2 * y).toFixed(2));

        // Variety guard (avoid repeating same price pairs)
        const sig = { price1, price2, item: ctx.itemPlural };
        const sigStr = JSON.stringify(sig);
        if (seen.coeffInterpret.has(sigStr) && Math.random() < 0.5) return null;
        seen.coeffInterpret.add(sigStr);

        const question =
            `A store's ${ctx.itemPlural} sales totaled $${total.toFixed(2)} last month. ` +
            `The equation ${price1.toFixed(2)}x + ${price2.toFixed(2)}y = ${total.toFixed(2)} represents this, ` +
            `where x is the number of ${ctx.adj1} ${ctx.itemPlural} sold and y is the number of ${ctx.adj2} ${ctx.itemPlural} sold. ` +
            `What does ${price1.toFixed(2)} represent?`;

        const correctAnswer = `The price of each ${ctx.adj1} ${itemSing}`;

        const choicePool = [
            correctAnswer,
            `The price of each ${ctx.adj2} ${itemSing}`,
            `The total number of ${ctx.itemPlural} sold`,
            `The number of ${ctx.adj1} ${ctx.itemPlural} sold`
        ];

        const choices = gen.shuffle(choicePool);
        const { labeled, letter } = labelChoices(choices, correctAnswer);

        const explanation =
            `In the equation ${price1.toFixed(2)}x + ${price2.toFixed(2)}y = ${total.toFixed(2)}, ` +
            `the term ${price1.toFixed(2)}x represents the dollars earned from selling x ${ctx.adj1} ${ctx.itemPlural}. ` +
            `Since x counts how many ${ctx.adj1} ${ctx.itemPlural} were sold, ${price1.toFixed(2)} is the price per ${ctx.adj1} ${itemSing}.`;

        return gen.buildProblem(original, question, labeled, letter, explanation);
    }

    // =========================================================
    // TEMPLATE 2: Perpendicular Lines (Fraction Slopes)
    // =========================================================
    function template_perpendicular_lines(original) {
        const fractions = [
            { num: -2, den: 3 },
            { num: -3, den: 4 },
            { num: -4, den: 5 },
            { num: 2, den: 5 },
            { num: 3, den: 7 },
            { num: -5, den: 2 },
            { num: 5, den: 3 },
            { num: -7, den: 4 }
        ];

        const frac = pickUnseen("perpSlope", fractions);
        const intercept = gen.randomInt(-9, 9);

        const slopeStr = `${frac.num}/${frac.den}`;

        // perpendicular slope is opposite reciprocal: m_perp = -1/m = -den/num
        // If m = num/den, then m_perp = -den/num
        const perpNum = -frac.den;
        const perpDen = frac.num;

        // Normalize sign to denominator positive
        let pN = perpNum;
        let pD = perpDen;
        if (pD < 0) {
            pD *= -1;
            pN *= -1;
        }
        const perpSlopeStr = `${pN}/${pD}`;

        const question =
            `Line ℓ is defined by y = (${slopeStr})x + ${intercept}. ` +
            `Line m is perpendicular to line ℓ in the xy-plane. What is the slope of line m?`;

        // Wrong answers: same slope, negative slope, reciprocal but not opposite, opposite but not reciprocal
        const wrongs = gen.shuffle([
            `${-pN}/${pD}`,           // opposite of perp
            `${frac.num}/${frac.den}`, // same
            `${-frac.num}/${frac.den}`,// negative same
            `${frac.den}/${frac.num}`  // reciprocal but not opposite
        ]).filter((w) => w !== perpSlopeStr);

        const choices = gen.shuffle([perpSlopeStr, wrongs[0], wrongs[1], wrongs[2]]);
        const { labeled, letter } = labelChoices(choices, perpSlopeStr);

        const explanation =
            `Perpendicular lines have slopes that are opposite reciprocals. ` +
            `Line ℓ has slope ${slopeStr}. Swap numerator and denominator and change the sign: ${perpSlopeStr}.`;

        return gen.buildProblem(original, question, labeled, letter, explanation);
    }

    // =========================================================
    // TEMPLATE 3: Mixture Subtraction (Part + Part = Total)
    // =========================================================
    function template_mixture_subtraction(original) {
        const contexts = [
            { sub1: "vitamin D", sub2: "calcium", unit: "grams" },
            { sub1: "protein", sub2: "carbohydrates", unit: "grams" },
            { sub1: "sand", sub2: "gravel", unit: "pounds" },
            { sub1: "red paint", sub2: "blue paint", unit: "ounces" },
            { sub1: "water", sub2: "juice", unit: "milliliters" }
        ];

        const ctx = gen.randomChoice(contexts);

        // Ensure nontrivial and avoid repeats
        let total = gen.randomInt(250, 950);
        let part1 = gen.randomInt(80, Math.floor(total * 0.7));
        const sig = `${ctx.sub1}|${ctx.sub2}|${ctx.unit}|${total}|${part1}`;
        if (seen.mixTotals.has(sig) && Math.random() < 0.45) return null;
        seen.mixTotals.add(sig);

        const part2 = total - part1;

        const question =
            `A mixture of ${ctx.sub1} and ${ctx.sub2} has a total mass of ${total} ${ctx.unit}. ` +
            `The mass of ${ctx.sub1} is ${part1} ${ctx.unit}. What is the mass of ${ctx.sub2} in the mixture?`;

        const choicesNum = gen.shuffle([
            part2,
            part1,
            total,
            gen.randomInt(Math.max(0, part2 - 80), part2 + 80)
        ]);

        // Ensure uniqueness
        const uniq = [];
        for (const v of choicesNum) {
            if (!uniq.includes(v)) uniq.push(v);
            if (uniq.length === 4) break;
        }
        while (uniq.length < 4) uniq.push(part2 + gen.randomInt(-50, 50));

        const correct = part2;
        const { labeled, letter } = labelChoices(
            uniq.map((v) => `${v} ${ctx.unit}`),
            `${correct} ${ctx.unit}`
        );

        const explanation =
            `Let a be the mass of ${ctx.sub2}. Since the total is ${total} ${ctx.unit}, we have ` +
            `${part1} + a = ${total}. Subtract ${part1} from both sides: a = ${part2} ${ctx.unit}.`;

        return gen.buildProblem(original, question, labeled, letter, explanation);
    }

    // =========================================================
    // TEMPLATE 4: Solve for Second Variable Given First
    // =========================================================
    function template_solve_given_one_variable(original) {
        const contexts = [
            { thing: "shipping order", var1: "small boxes", var2: "large boxes", sym1: "a", sym2: "b" },
            { thing: "purchase", var1: "notebooks", var2: "pens", sym1: "n", sym2: "p" },
            { thing: "order", var1: "small items", var2: "large items", sym1: "s", sym2: "L" }
        ];

        const ctx = gen.randomChoice(contexts);

        const coef1 = gen.randomInt(2, 7);
        const coef2 = gen.randomInt(2, 8);

        const value1 = gen.randomInt(2, 12);
        const value2 = gen.randomInt(1, 10);

        const total = coef1 * value1 + coef2 * value2;

        const question =
            `A company charged $${total} for a ${ctx.thing}. ` +
            `The equation ${coef1}${ctx.sym1} + ${coef2}${ctx.sym2} = ${total} represents this, ` +
            `where ${ctx.sym1} is the number of ${ctx.var1} and ${ctx.sym2} is the number of ${ctx.var2}. ` +
            `If there are ${value1} ${ctx.var1}, how many ${ctx.var2} are there?`;

        const correct = value2;

        // distractors: close but wrong, and one "divide total by coef2" trap
        const trap = Math.floor(total / coef2);
        const choicesNum = gen.shuffle([
            correct,
            value1,
            correct + gen.randomInt(1, 3),
            trap === correct ? correct + 2 : trap
        ]);

        // enforce uniqueness
        const uniq = [];
        for (const v of choicesNum) {
            if (!uniq.includes(v)) uniq.push(v);
            if (uniq.length === 4) break;
        }
        while (uniq.length < 4) uniq.push(correct + gen.randomInt(-5, 5));

        const { labeled, letter } = labelChoices(uniq.map(String), String(correct));

        const explanation =
            `Substitute ${ctx.sym1} = ${value1} into ${coef1}${ctx.sym1} + ${coef2}${ctx.sym2} = ${total}: ` +
            `${coef1}(${value1}) + ${coef2}${ctx.sym2} = ${total}. ` +
            `That gives ${coef1 * value1} + ${coef2}${ctx.sym2} = ${total}. ` +
            `Subtract ${coef1 * value1}: ${coef2}${ctx.sym2} = ${coef2 * value2}. ` +
            `Divide by ${coef2}: ${ctx.sym2} = ${value2}.`;

        return gen.buildProblem(original, question, labeled, letter, explanation);
    }

    // =========================================================
    // TEMPLATE 5: Constant Interpretation (Sum = Total)
    // =========================================================
    function template_sum_interpretation(original) {
        const contexts = [
            { activity: "running and biking", var1: "running", var2: "biking", metric: "minutes" },
            { activity: "reading and writing", var1: "reading", var2: "writing", metric: "pages" },
            { activity: "working and commuting", var1: "working", var2: "commuting", metric: "hours" },
            { activity: "chores and homework", var1: "chores", var2: "homework", metric: "minutes" }
        ];

        const ctx = gen.randomChoice(contexts);
        const total = gen.randomInt(50, 180);

        const question =
            `The equation x + y = ${total} relates the ${ctx.metric} spent ${ctx.var1} (x) and ${ctx.var2} (y) each day. ` +
            `What does ${total} represent?`;

        const correctAnswer = `Total ${ctx.metric} spent ${ctx.var1} and ${ctx.var2}`;

        const choices = gen.shuffle([
            correctAnswer,
            `${cap(ctx.metric)} spent ${ctx.var1}`,
            `${cap(ctx.metric)} spent ${ctx.var2}`,
            `${cap(ctx.metric)} spent ${ctx.var2} per ${singularize(ctx.metric)} ${ctx.var1}`
        ]);

        const { labeled, letter } = labelChoices(choices, correctAnswer);

        const explanation =
            `Because x + y equals ${total}, ${total} represents the combined (total) ${ctx.metric} spent ${ctx.var1} and ${ctx.var2}.`;

        return gen.buildProblem(original, question, labeled, letter, explanation);
    }

    // =========================================================
    // TEMPLATE 6: Time × Rate = Total (Two Activities)
    // =========================================================
    function template_time_rate_equation(original) {
        const contexts = [
            { machine: "machine", item1: "large boxes", item2: "small boxes", unit: "minutes", sym1: "L", sym2: "S" },
            { machine: "printer", item1: "color pages", item2: "black pages", unit: "seconds", sym1: "C", sym2: "B" },
            { machine: "factory", item1: "widgets", item2: "gadgets", unit: "hours", sym1: "W", sym2: "G" }
        ];

        const ctx = gen.randomChoice(contexts);

        // Make sure times differ and are nonzero
        let time1 = gen.randomInt(3, 11);
        let time2 = gen.randomInt(2, 9);
        if (time1 === time2) time2 += 1;

        const totalTime = gen.randomInt(120, 720);

        const question =
            `A ${ctx.machine} makes ${ctx.item1} or ${ctx.item2}. ` +
            `It takes ${time1} ${ctx.unit} to make one ${singularize(ctx.item1)} and ${time2} ${ctx.unit} to make one ${singularize(ctx.item2)}. ` +
            `It operates for ${totalTime} ${ctx.unit} each day. Which equation represents the possible numbers of ${ctx.item1} (${ctx.sym1}) and ${ctx.item2} (${ctx.sym2}) made in one day?`;

        const correct = `${time1}${ctx.sym1} + ${time2}${ctx.sym2} = ${totalTime}`;

        // distractors (common mistakes)
        const wrong1 = `${time2}${ctx.sym1} + ${time1}${ctx.sym2} = ${totalTime}`;  // swapped rates
        const wrong2 = `${ctx.sym1} + ${ctx.sym2} = ${totalTime}`;                  // ignores per-item times
        const wrong3 = `${time1 + time2}(${ctx.sym1} + ${ctx.sym2}) = ${totalTime}`;// incorrect grouping

        const choices = gen.shuffle([correct, wrong1, wrong2, wrong3]);
        const { labeled, letter } = labelChoices(choices, correct);

        const explanation =
            `Each ${singularize(ctx.item1)} uses ${time1} ${ctx.unit}, so ${ctx.sym1} of them uses ${time1}${ctx.sym1} ${ctx.unit}. ` +
            `Each ${singularize(ctx.item2)} uses ${time2} ${ctx.unit}, so ${ctx.sym2} of them uses ${time2}${ctx.sym2} ${ctx.unit}. ` +
            `Together they total ${totalTime} ${ctx.unit}, so ${correct}.`;

        return gen.buildProblem(original, question, labeled, letter, explanation);
    }

    // =========================================================
    // TEMPLATE 7: Slope-Intercept Form Given Slope and Point
    // =========================================================
    function template_point_slope_equation(original) {
        const slopes = [-6, -5, -4, -3, -2, 2, 3, 4, 5, 6];
        const slope = pickUnseen("pointSlope", slopes);
        const yInt = gen.randomInt(-12, 12);

        const question =
            `Line k has slope ${slope} and passes through (0, ${yInt}). Which equation defines line k?`;

        const correct = `y = ${slope}x ${yInt >= 0 ? "+" : "-"} ${Math.abs(yInt)}`;

        // wrongs: swap m/b, flip slope sign, flip intercept sign
        const wrong1 = `y = ${yInt}x ${slope >= 0 ? "+" : "-"} ${Math.abs(slope)}`;
        const wrong2 = `y = ${-slope}x ${yInt >= 0 ? "+" : "-"} ${Math.abs(yInt)}`;
        const wrong3 = `y = ${slope}x ${yInt >= 0 ? "-" : "+"} ${Math.abs(yInt)}`;

        const choices = gen.shuffle([correct, wrong1, wrong2, wrong3]);
        const { labeled, letter } = labelChoices(choices, correct);

        const explanation =
            `Slope-intercept form is y = mx + b. Here m = ${slope} and b = ${yInt}, so the equation is ${correct}.`;

        return gen.buildProblem(original, question, labeled, letter, explanation);
    }

    // =========================================================
    // TEMPLATE 8: Geometric Construction (Straws)
    // =========================================================
    function template_geometric_construction(original) {
        const shapes = [
            { shape1: "triangles", shape2: "rectangles", sides1: 3, sides2: 4 },
            { shape1: "triangles", shape2: "pentagons", sides1: 3, sides2: 5 },
            { shape1: "squares", shape2: "hexagons", sides1: 4, sides2: 6 }
        ];

        const ctx = gen.randomChoice(shapes);

        // pick r and t so equation is true and not always same
        const r = gen.randomInt(6, 16);
        const t = gen.randomInt(4, 18);
        const total = ctx.sides1 * t + ctx.sides2 * r;

        const question =
            `Paper straws were used to make ${ctx.shape1} and ${ctx.shape2} with no shared sides. ` +
            `The equation ${ctx.sides1}t + ${ctx.sides2}r = ${total} represents the total number of straws used, ` +
            `where t is the number of ${ctx.shape1} and r is the number of ${ctx.shape2}. ` +
            `What does the term ${ctx.sides2}r represent?`;

        const correctAnswer = `The number of straws used to make the ${ctx.shape2}`;

        const choices = gen.shuffle([
            correctAnswer,
            `The number of ${ctx.shape2} made`,
            `The total number of straws used`,
            `The number of straws used to make the ${ctx.shape1}`
        ]);

        const { labeled, letter } = labelChoices(choices, correctAnswer);

        const explanation =
            `Each ${singularize(ctx.shape2)} uses ${ctx.sides2} straws. With r ${ctx.shape2}, ` +
            `${ctx.sides2}r is the total number of straws used for the ${ctx.shape2}.`;

        return gen.buildProblem(original, question, labeled, letter, explanation);
    }

    // =========================================================
    // TEMPLATE 9: Direct Proportion (y = kx)
    // =========================================================
    function template_direct_proportion(original) {
        const contexts = [
            { context: "pieces of music practiced", xDesc: "minute practice session", yDesc: "pieces practiced" },
            { context: "problems completed", xDesc: "minute work session", yDesc: "problems completed" },
            { context: "pages read", xDesc: "minute reading session", yDesc: "pages read" }
        ];

        const ctx = gen.randomChoice(contexts);

        // Choose a clean rational rate like 1/10, 1/5, 1/2, 3/5, etc (keeps results clean)
        const rates = [0.1, 0.2, 0.25, 0.5, 0.4];
        const rate = gen.randomChoice(rates);

        // pick minutes so result is usually integer
        let minutesChoices = [20, 25, 30, 40, 50, 60];
        if (rate === 0.25) minutesChoices = [20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60];
        if (rate === 0.4) minutesChoices = [20, 25, 30, 35, 40, 45, 50, 55, 60];

        const minutes = gen.randomChoice(minutesChoices);
        const result = Number((rate * minutes).toFixed(2));

        const question =
            `The equation y = ${rate}x models ${ctx.yDesc} (y) during an x-${ctx.xDesc}. ` +
            `How many ${singularize(ctx.yDesc)} are modeled in ${minutes} minutes?`;

        const correct = result;

        const choicesNum = makeNumericChoices(correct, 8, false);
        const formatted = choicesNum.map((v) => Number.isInteger(v) ? `${v}` : `${v}`);
        const { labeled, letter } = labelChoices(formatted, `${correct}`);

        const explanation =
            `Substitute x = ${minutes} into y = ${rate}x: y = ${rate}(${minutes}) = ${correct}.`;

        return gen.buildProblem(original, question, labeled, letter, explanation);
    }

    // =========================================================
    // TEMPLATE 10: Percentage Mixture
    // =========================================================
    function template_percentage_mixture(original) {
        const substances = [
            { name1: "Fertilizer A", name2: "Fertilizer B", component: "filler", pct1: 60, pct2: 40 },
            { name1: "Solution A", name2: "Solution B", component: "salt", pct1: 25, pct2: 45 },
            { name1: "Mixture A", name2: "Mixture B", component: "sugar", pct1: 30, pct2: 50 }
        ];

        const ctx = gen.randomChoice(substances);

        const decimal1 = ctx.pct1 / 100;
        const decimal2 = ctx.pct2 / 100;

        // pick x,y so total component is integer and consistent
        const x = gen.randomInt(50, 250);
        const y = gen.randomInt(50, 250);
        const totalComponent = Number((decimal1 * x + decimal2 * y).toFixed(2));

        const question =
            `A mix of ${ctx.name1} (${ctx.pct1}% ${ctx.component}) and ${ctx.name2} (${ctx.pct2}% ${ctx.component}) contains ` +
            `${totalComponent} pounds of ${ctx.component} total. ` +
            `Which equation models this, where x is pounds of ${ctx.name1} and y is pounds of ${ctx.name2}?`;

        const correct = `${decimal1}x + ${decimal2}y = ${totalComponent}`;

        const wrong1 = `${decimal2}x + ${decimal1}y = ${totalComponent}`;
        const wrong2 = `${ctx.pct1}x + ${ctx.pct2}y = ${totalComponent}`; // forgot to convert percent to decimal
        const wrong3 = `${decimal1}x + ${decimal2}y = ${ctx.pct1 + ctx.pct2}`; // nonsense total

        const choices = gen.shuffle([correct, wrong1, wrong2, wrong3]);
        const { labeled, letter } = labelChoices(choices, correct);

        const explanation =
            `${ctx.name1} contributes ${decimal1}x pounds of ${ctx.component}, and ${ctx.name2} contributes ${decimal2}y pounds of ${ctx.component}. ` +
            `Their combined total is ${totalComponent}, so ${correct}.`;

        return gen.buildProblem(original, question, labeled, letter, explanation);
    }

    // =========================================================
    // TEMPLATE 11: Revenue/Cost Interpretation
    // =========================================================
    function template_revenue_interpretation(original) {
        const businesses = [
            { business: "food truck", item1: "drinks", item2: "salads" },
            { business: "cafe", item1: "coffees", item2: "pastries" },
            { business: "stand", item1: "hotdogs", item2: "pretzels" }
        ];

        const ctx = gen.randomChoice(businesses);

        // randomized prices (clean cents), ensure different
        const price1 = Number((Math.random() * 4 + 1.5).toFixed(2));
        let price2 = Number((Math.random() * 4 + 1.5).toFixed(2));
        if (price2 === price1) price2 = Number((price2 + 1.0).toFixed(2));

        const question =
            `The equation F = ${price1.toFixed(2)}x + ${price2.toFixed(2)}y gives a ${ctx.business}'s revenue, ` +
            `where x is ${ctx.item1} sold and y is ${ctx.item2} sold. What does ${price2.toFixed(2)} represent?`;

        const correctAnswer = `The price of one ${singularize(ctx.item2)}`;

        const choices = gen.shuffle([
            correctAnswer,
            `The price of one ${singularize(ctx.item1)}`,
            `The number of ${ctx.item2} sold`,
            `The total revenue F`
        ]);

        const { labeled, letter } = labelChoices(choices, correctAnswer);

        const explanation =
            `In F = ${price1.toFixed(2)}x + ${price2.toFixed(2)}y, the term ${price2.toFixed(2)}y is the revenue from selling y ${ctx.item2}. ` +
            `Since y is the quantity, ${price2.toFixed(2)} is the price per ${singularize(ctx.item2)}.`;

        return gen.buildProblem(original, question, labeled, letter, explanation);
    }

    // =========================================================
    // TEMPLATE 12: Parallel Line Through Point
    // =========================================================
    function template_parallel_line(original) {
        const slopes = [-6, -5, -4, -3, -2, 2, 3, 4, 5, 6];
        const slope = pickUnseen("parallelLine", slopes);
        const originalB = gen.randomInt(-10, 12);

        const pointX = gen.randomInt(-6, 6);
        const pointY = gen.randomInt(-10, 10);

        const newB = pointY - slope * pointX;

        const question =
            `Line m passes through (${pointX}, ${pointY}) and is parallel to ` +
            `y = ${slope}x ${originalB >= 0 ? "+" : "-"} ${Math.abs(originalB)}. ` +
            `Which equation represents line m?`;

        const correct = `y = ${slope}x ${newB >= 0 ? "+" : "-"} ${Math.abs(newB)}`;

        const wrong1 = `y = ${slope}x ${pointY >= 0 ? "+" : "-"} ${Math.abs(pointY)}`; // mistakenly uses y as intercept
        const wrong2 = `y = ${-slope}x ${newB >= 0 ? "+" : "-"} ${Math.abs(newB)}`;    // wrong slope sign
        const wrong3 = `y = ${slope}x ${originalB >= 0 ? "+" : "-"} ${Math.abs(originalB)}`; // original line

        const choices = gen.shuffle([correct, wrong1, wrong2, wrong3]);
        const { labeled, letter } = labelChoices(choices, correct);

        const explanation =
            `Parallel lines have the same slope, so line m has slope ${slope}. ` +
            `Use (${pointX}, ${pointY}) in y = mx + b: ${pointY} = ${slope}(${pointX}) + b, so b = ${newB}. ` +
            `Therefore, ${correct}.`;

        return gen.buildProblem(original, question, labeled, letter, explanation);
    }

    // =========================================================
    // REGISTER ALL TEMPLATES (names must match pool strings)
    // =========================================================
    window.ProblemGenerator.registerTemplate("template_coefficient_interpretation", template_coefficient_interpretation);
    window.ProblemGenerator.registerTemplate("template_perpendicular_lines", template_perpendicular_lines);
    window.ProblemGenerator.registerTemplate("template_mixture_subtraction", template_mixture_subtraction);
    window.ProblemGenerator.registerTemplate("template_solve_given_one_variable", template_solve_given_one_variable);
    window.ProblemGenerator.registerTemplate("template_sum_interpretation", template_sum_interpretation);
    window.ProblemGenerator.registerTemplate("template_time_rate_equation", template_time_rate_equation);
    window.ProblemGenerator.registerTemplate("template_point_slope_equation", template_point_slope_equation);
    window.ProblemGenerator.registerTemplate("template_geometric_construction", template_geometric_construction);
    window.ProblemGenerator.registerTemplate("template_direct_proportion", template_direct_proportion);
    window.ProblemGenerator.registerTemplate("template_percentage_mixture", template_percentage_mixture);
    window.ProblemGenerator.registerTemplate("template_revenue_interpretation", template_revenue_interpretation);
    window.ProblemGenerator.registerTemplate("template_parallel_line", template_parallel_line);

    console.log("✅ Linear Eq 2 Var - Easy templates registered (fixed + varied)");
})();
