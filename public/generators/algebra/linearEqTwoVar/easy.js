// public/generators/algebra/linearEqTwoVar/easy.js
// ✅ Easy templates for Linear Equations in Two Variables
// ✅✅ FINAL VERSION - MASSIVELY EXPANDED SCENARIO VARIETY
// Each template now has 10-15+ unique contexts for maximum variation

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

    const singularize = (word) => {
        if (!word) return word;
        const lower = word.toLowerCase();

        const irregular = {
            "boxes": "box", "bottles": "bottle", "containers": "container",
            "tickets": "ticket", "packages": "package", "pages": "page",
            "minutes": "minute", "hours": "hour", "seconds": "second",
            "drinks": "drink", "salads": "salad", "coffees": "coffee",
            "pastries": "pastry", "hotdogs": "hotdog", "pretzels": "pretzel",
            "widgets": "widget", "gadgets": "gadget", "triangles": "triangle",
            "rectangles": "rectangle", "pentagons": "pentagon", "squares": "square",
            "hexagons": "hexagon", "candles": "candle", "books": "book",
            "shirts": "shirt", "shoes": "shoe", "toys": "toy", "games": "game",
            "apples": "apple", "oranges": "orange", "pizzas": "pizza",
            "tacos": "taco", "burgers": "burger", "sandwiches": "sandwich",
            "cupcakes": "cupcake", "cookies": "cookie", "muffins": "muffin",
            "cars": "car", "bikes": "bike", "scooters": "scooter",
            "plants": "plant", "flowers": "flower", "trees": "tree",
            "stamps": "stamp", "coins": "coin", "cards": "card"
        };

        if (irregular[lower]) return irregular[lower];

        if (word.endsWith("ies")) return word.slice(0, -3) + "y";
        if (word.endsWith("s")) return word.slice(0, -1);
        return word;
    };

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
                if (S.size > 40) {
                    const first = S.values().next().value;
                    S.delete(first);
                }
                return c;
            }
        }
        const chosen = gen.randomChoice(candidates);
        S.add(JSON.stringify(chosen));
        return chosen;
    };

    const labelChoices = (choices, correctValue) => {
        const labeled = choices.map((c, i) => `${String.fromCharCode(65 + i)}) ${c}`);
        const idx = choices.findIndex((c) => c === correctValue);
        const letter = String.fromCharCode(65 + (idx === -1 ? 0 : idx));
        return { labeled, letter };
    };

    // =========================================================
    // TEMPLATE 1: Coefficient Interpretation (Revenue/Cost)
    // ✅ EXPANDED: 15+ unique selling scenarios
    // =========================================================
    function template_coefficient_interpretation(original) {
        const contexts = [
            { itemPlural: "containers", adj1: "small", adj2: "large", venue: "store" },
            { itemPlural: "bottles", adj1: "one-liter", adj2: "two-liter", venue: "shop" },
            { itemPlural: "boxes", adj1: "small", adj2: "large", venue: "warehouse" },
            { itemPlural: "tickets", adj1: "student", adj2: "adult", venue: "theater" },
            { itemPlural: "packages", adj1: "regular", adj2: "premium", venue: "store" },
            { itemPlural: "candles", adj1: "small", adj2: "large", venue: "craft fair" },
            { itemPlural: "books", adj1: "paperback", adj2: "hardcover", venue: "bookstore" },
            { itemPlural: "shirts", adj1: "basic", adj2: "designer", venue: "clothing store" },
            { itemPlural: "toys", adj1: "mini", adj2: "deluxe", venue: "toy shop" },
            { itemPlural: "pizzas", adj1: "personal", adj2: "family-size", venue: "pizzeria" },
            { itemPlural: "sandwiches", adj1: "half", adj2: "whole", venue: "deli" },
            { itemPlural: "bouquets", adj1: "small", adj2: "large", venue: "flower shop" },
            { itemPlural: "memberships", adj1: "monthly", adj2: "annual", venue: "gym" },
            { itemPlural: "plans", adj1: "basic", adj2: "unlimited", venue: "phone company" },
            { itemPlural: "subscriptions", adj1: "digital", adj2: "print", venue: "magazine" }
        ];

        const ctx = gen.randomChoice(contexts);
        const itemSing = singularize(ctx.itemPlural);

        const price1 = Number((Math.random() * 4 + 1.5).toFixed(2));
        const price2 = Number((price1 + Math.random() * 4 + 0.75).toFixed(2));

        const x = gen.randomInt(20, 120);
        const y = gen.randomInt(20, 120);
        const total = Number((price1 * x + price2 * y).toFixed(2));

        const sig = { price1, price2, item: ctx.itemPlural };
        const sigStr = JSON.stringify(sig);
        if (seen.coeffInterpret.has(sigStr) && Math.random() < 0.5) return null;
        seen.coeffInterpret.add(sigStr);

        const question =
            `A ${ctx.venue}'s ${ctx.itemPlural} sales totaled $${total.toFixed(2)} last month. ` +
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
    // No context needed - pure math
    // =========================================================
    function template_perpendicular_lines(original) {
        const fractions = [
            { num: -2, den: 3 }, { num: -3, den: 4 }, { num: -4, den: 5 },
            { num: 2, den: 5 }, { num: 3, den: 7 }, { num: -5, den: 2 },
            { num: 5, den: 3 }, { num: -7, den: 4 }, { num: 4, den: 7 },
            { num: -3, den: 5 }, { num: 5, den: 6 }, { num: -2, den: 7 }
        ];

        const frac = pickUnseen("perpSlope", fractions);
        const intercept = gen.randomInt(-9, 9);

        const slopeStr = `${frac.num}/${frac.den}`;

        const perpNum = -frac.den;
        const perpDen = frac.num;

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

        const wrongs = gen.shuffle([
            `${-pN}/${pD}`,
            `${frac.num}/${frac.den}`,
            `${-frac.num}/${frac.den}`,
            `${frac.den}/${frac.num}`
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
    // ✅ EXPANDED: 12+ unique mixture scenarios
    // =========================================================
    function template_mixture_subtraction(original) {
        const contexts = [
            { sub1: "vitamin D", sub2: "calcium", unit: "grams", container: "supplement" },
            { sub1: "protein", sub2: "carbohydrates", unit: "grams", container: "nutrition bar" },
            { sub1: "sand", sub2: "gravel", unit: "pounds", container: "concrete mix" },
            { sub1: "red paint", sub2: "blue paint", unit: "ounces", container: "paint mixture" },
            { sub1: "water", sub2: "juice", unit: "milliliters", container: "drink" },
            { sub1: "flour", sub2: "sugar", unit: "cups", container: "recipe" },
            { sub1: "copper", sub2: "zinc", unit: "grams", container: "alloy" },
            { sub1: "milk", sub2: "cream", unit: "ounces", container: "blend" },
            { sub1: "nitrogen", sub2: "oxygen", unit: "liters", container: "gas mixture" },
            { sub1: "cotton", sub2: "polyester", unit: "ounces", container: "fabric" },
            { sub1: "peanuts", sub2: "almonds", unit: "grams", container: "trail mix" },
            { sub1: "oil", sub2: "vinegar", unit: "tablespoons", container: "dressing" }
        ];

        const ctx = gen.randomChoice(contexts);

        let total = gen.randomInt(250, 950);
        let part1 = gen.randomInt(80, Math.floor(total * 0.7));
        const sig = `${ctx.sub1}|${ctx.sub2}|${ctx.unit}|${total}|${part1}`;
        if (seen.mixTotals.has(sig) && Math.random() < 0.45) return null;
        seen.mixTotals.add(sig);

        const part2 = total - part1;

        const question =
            `A ${ctx.container} of ${ctx.sub1} and ${ctx.sub2} has a total mass of ${total} ${ctx.unit}. ` +
            `The amount of ${ctx.sub1} is ${part1} ${ctx.unit}. What is the amount of ${ctx.sub2} in the ${ctx.container}?`;

        const choicesNum = gen.shuffle([
            part2,
            part1,
            total,
            gen.randomInt(Math.max(0, part2 - 80), part2 + 80)
        ]);

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
            `Let a be the amount of ${ctx.sub2}. Since the total is ${total} ${ctx.unit}, we have ` +
            `${part1} + a = ${total}. Subtract ${part1} from both sides: a = ${part2} ${ctx.unit}.`;

        return gen.buildProblem(original, question, labeled, letter, explanation);
    }

    // =========================================================
    // TEMPLATE 4: Solve for Second Variable Given First
    // ✅ EXPANDED: 15+ unique transaction scenarios
    // =========================================================
    function template_solve_given_one_variable(original) {
        const contexts = [
            { thing: "shipment", var1: "small boxes", var2: "large boxes", sym1: "s", sym2: "L", entity: "warehouse" },
            { thing: "order", var1: "notebooks", var2: "pens", sym1: "n", sym2: "p", entity: "office supplier" },
            { thing: "delivery", var1: "small packages", var2: "large packages", sym1: "a", sym2: "b", entity: "courier" },
            { thing: "rental", var1: "bikes", var2: "scooters", sym1: "b", sym2: "s", entity: "rental company" },
            { thing: "catering order", var1: "salads", var2: "sandwiches", sym1: "a", sym2: "w", entity: "caterer" },
            { thing: "repair job", var1: "small parts", var2: "large parts", sym1: "m", sym2: "L", entity: "mechanic" },
            { thing: "service", var1: "standard rooms", var2: "deluxe rooms", sym1: "r", sym2: "d", entity: "hotel" },
            { thing: "event", var1: "children", var2: "adults", sym1: "c", sym2: "a", entity: "venue" },
            { thing: "cleaning", var1: "small areas", var2: "large areas", sym1: "s", sym2: "L", entity: "cleaning service" },
            { thing: "landscaping job", var1: "shrubs", var2: "trees", sym1: "h", sym2: "t", entity: "landscaper" },
            { thing: "printing order", var1: "black-and-white", var2: "color", sym1: "b", sym2: "c", entity: "print shop" },
            { thing: "ticket sale", var1: "balcony seats", var2: "floor seats", sym1: "b", sym2: "f", entity: "theater" },
            { thing: "session", var1: "half-hour slots", var2: "hour slots", sym1: "h", sym2: "f", entity: "tutor" },
            { thing: "purchase", var1: "regular items", var2: "premium items", sym1: "r", sym2: "p", entity: "store" },
            { thing: "subscription", var1: "monthly plans", var2: "annual plans", sym1: "m", sym2: "y", entity: "service" }
        ];

        const ctx = gen.randomChoice(contexts);

        const coef1 = gen.randomInt(2, 7);
        const coef2 = gen.randomInt(2, 8);

        const value1 = gen.randomInt(2, 12);
        const value2 = gen.randomInt(1, 10);

        const total = coef1 * value1 + coef2 * value2;

        const question =
            `A ${ctx.entity} charged $${total} for a ${ctx.thing}. ` +
            `The equation ${coef1}${ctx.sym1} + ${coef2}${ctx.sym2} = ${total} represents this, ` +
            `where ${ctx.sym1} is the number of ${ctx.var1} and ${ctx.sym2} is the number of ${ctx.var2}. ` +
            `If there are ${value1} ${ctx.var1}, how many ${ctx.var2} are there?`;

        const correct = value2;

        const trap = Math.floor(total / coef2);
        const choicesNum = gen.shuffle([
            correct,
            value1,
            correct + gen.randomInt(1, 3),
            trap === correct ? correct + 2 : trap
        ]);

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
    // ✅ EXPANDED: 12+ activity combinations
    // =========================================================
    function template_sum_interpretation(original) {
        const contexts = [
            { activity: "running and biking", var1: "running", var2: "biking", metric: "minutes" },
            { activity: "reading and writing", var1: "reading", var2: "writing", metric: "pages" },
            { activity: "working and commuting", var1: "working", var2: "commuting", metric: "hours" },
            { activity: "studying and practicing", var1: "studying", var2: "practicing", metric: "minutes" },
            { activity: "cooking and cleaning", var1: "cooking", var2: "cleaning", metric: "minutes" },
            { activity: "swimming and running", var1: "swimming", var2: "running", metric: "laps" },
            { activity: "solving and reviewing", var1: "solving problems", var2: "reviewing solutions", metric: "minutes" },
            { activity: "painting and drawing", var1: "painting", var2: "drawing", metric: "hours" },
            { activity: "coding and debugging", var1: "coding", var2: "debugging", metric: "hours" },
            { activity: "watching and playing", var1: "watching videos", var2: "playing games", metric: "minutes" },
            { activity: "listening and speaking", var1: "listening", var2: "speaking", metric: "minutes" },
            { activity: "lifting and cardio", var1: "lifting weights", var2: "doing cardio", metric: "minutes" }
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
    // ✅ EXPANDED: 15+ production scenarios
    // =========================================================
    function template_time_rate_equation(original) {
        const contexts = [
            { machine: "factory", item1: "large widgets", item2: "small widgets", unit: "minutes", sym1: "L", sym2: "S" },
            { machine: "printer", item1: "color pages", item2: "black-and-white pages", unit: "seconds", sym1: "C", sym2: "B" },
            { machine: "assembly line", item1: "Type A products", item2: "Type B products", unit: "minutes", sym1: "A", sym2: "B" },
            { machine: "bakery oven", item1: "loaves", item2: "rolls", unit: "minutes", sym1: "L", sym2: "R" },
            { machine: "copy machine", item1: "double-sided copies", item2: "single-sided copies", unit: "seconds", sym1: "D", sym2: "S" },
            { machine: "3D printer", item1: "large models", item2: "small models", unit: "hours", sym1: "L", sym2: "S" },
            { machine: "packaging machine", item1: "boxes", item2: "bags", unit: "seconds", sym1: "X", sym2: "G" },
            { machine: "bottling plant", item1: "large bottles", item2: "small bottles", unit: "seconds", sym1: "L", sym2: "S" },
            { machine: "textile loom", item1: "thick fabric", item2: "thin fabric", unit: "minutes", sym1: "K", sym2: "N" },
            { machine: "car wash", item1: "SUVs", item2: "sedans", unit: "minutes", sym1: "U", sym2: "D" },
            { machine: "vending machine", item1: "hot drinks", item2: "cold drinks", unit: "seconds", sym1: "H", sym2: "C" },
            { machine: "laser cutter", item1: "metal pieces", item2: "wood pieces", unit: "seconds", sym1: "M", sym2: "W" },
            { machine: "CNC machine", item1: "complex parts", item2: "simple parts", unit: "minutes", sym1: "X", sym2: "P" }
        ];

        const ctx = gen.randomChoice(contexts);

        let time1 = gen.randomInt(3, 11);
        let time2 = gen.randomInt(2, 9);
        if (time1 === time2) time2 += 1;

        const totalTime = gen.randomInt(120, 720);

        const question =
            `A ${ctx.machine} produces ${ctx.item1} or ${ctx.item2}. ` +
            `It takes ${time1} ${ctx.unit} to make one ${singularize(ctx.item1)} and ${time2} ${ctx.unit} to make one ${singularize(ctx.item2)}. ` +
            `It operates for ${totalTime} ${ctx.unit} each day. Which equation represents the possible numbers of ${ctx.item1} (${ctx.sym1}) and ${ctx.item2} (${ctx.sym2}) made in one day?`;

        const correct = `${time1}${ctx.sym1} + ${time2}${ctx.sym2} = ${totalTime}`;

        const wrong1 = `${time2}${ctx.sym1} + ${time1}${ctx.sym2} = ${totalTime}`;
        const wrong2 = `${ctx.sym1} + ${ctx.sym2} = ${totalTime}`;
        const wrong3 = `${time1 + time2}(${ctx.sym1} + ${ctx.sym2}) = ${totalTime}`;

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
    // No context needed - pure math
    // ✅ FIXED: Generates different slopes in wrong answers
    // =========================================================
    function template_point_slope_equation(original) {
        const slopes = [-6, -5, -4, -3, -2, 2, 3, 4, 5, 6];
        const slope = pickUnseen("pointSlope", slopes);
        const yInt = gen.randomInt(-12, 12);

        const question =
            `Line k has slope ${slope} and passes through (0, ${yInt}). Which equation defines line k?`;

        const correct = `y = ${slope}x ${yInt >= 0 ? "+" : ""} ${yInt >= 0 ? yInt : `${yInt}`}`;

        const wrongSlope1 = -slope;
        const wrongSlope2 = slope + (slope > 0 ? -2 : 2);
        const wrongSlope3 = Math.abs(slope) <= 2 ? slope * 2 : Math.floor(slope / 2) || 1;

        const wrong1 = `y = ${yInt}x ${slope >= 0 ? "+" : ""} ${slope >= 0 ? slope : `${slope}`}`;
        const wrong2 = `y = ${wrongSlope1}x ${yInt >= 0 ? "+" : ""} ${yInt >= 0 ? yInt : `${yInt}`}`;
        const wrong3 = `y = ${wrongSlope2}x ${yInt >= 0 ? "+" : ""} ${yInt >= 0 ? yInt : `${yInt}`}`;

        const choices = gen.shuffle([correct, wrong1, wrong2, wrong3]);
        const { labeled, letter } = labelChoices(choices, correct);

        const explanation =
            `Slope-intercept form is y = mx + b. Here m = ${slope} and b = ${yInt}, so the equation is ${correct}.`;

        return gen.buildProblem(original, question, labeled, letter, explanation);
    }

    // =========================================================
    // TEMPLATE 8: Geometric Construction (Straws/Sticks)
    // ✅ EXPANDED: 10+ shape combinations
    // =========================================================
    function template_geometric_construction(original) {
        const shapes = [
            { shape1: "triangles", shape2: "squares", sides1: 3, sides2: 4 },
            { shape1: "triangles", shape2: "pentagons", sides1: 3, sides2: 5 },
            { shape1: "triangles", shape2: "hexagons", sides1: 3, sides2: 6 },
            { shape1: "squares", shape2: "pentagons", sides1: 4, sides2: 5 },
            { shape1: "squares", shape2: "hexagons", sides1: 4, sides2: 6 },
            { shape1: "pentagons", shape2: "hexagons", sides1: 5, sides2: 6 },
            { shape1: "rectangles", shape2: "pentagons", sides1: 4, sides2: 5 },
            { shape1: "rectangles", shape2: "hexagons", sides1: 4, sides2: 6 },
            { shape1: "triangles", shape2: "rectangles", sides1: 3, sides2: 4 },
            { shape1: "squares", shape2: "octagons", sides1: 4, sides2: 8 }
        ];

        const ctx = gen.randomChoice(shapes);

        const r = gen.randomInt(6, 16);
        const t = gen.randomInt(4, 18);
        const total = ctx.sides1 * t + ctx.sides2 * r;

        const question =
            `Toothpicks were used to make ${ctx.shape1} and ${ctx.shape2} with no shared sides. ` +
            `The equation ${ctx.sides1}t + ${ctx.sides2}r = ${total} represents the total number of toothpicks used, ` +
            `where t is the number of ${ctx.shape1} and r is the number of ${ctx.shape2}. ` +
            `What does the term ${ctx.sides2}r represent?`;

        const correctAnswer = `The number of toothpicks used to make the ${ctx.shape2}`;

        const choices = gen.shuffle([
            correctAnswer,
            `The number of ${ctx.shape2} made`,
            `The total number of toothpicks used`,
            `The number of toothpicks used to make the ${ctx.shape1}`
        ]);

        const { labeled, letter } = labelChoices(choices, correctAnswer);

        const explanation =
            `Each ${singularize(ctx.shape2)} uses ${ctx.sides2} toothpicks. With r ${ctx.shape2}, ` +
            `${ctx.sides2}r is the total number of toothpicks used for the ${ctx.shape2}.`;

        return gen.buildProblem(original, question, labeled, letter, explanation);
    }

    // =========================================================
    // TEMPLATE 9: Direct Proportion (y = kx)
    // ✅ EXPANDED: 10+ rate scenarios
    // =========================================================
    function template_direct_proportion(original) {
        const contexts = [
            { context: "songs practiced", xDesc: "minute practice session", yDesc: "songs practiced" },
            { context: "problems completed", xDesc: "minute work session", yDesc: "problems completed" },
            { context: "pages read", xDesc: "minute reading session", yDesc: "pages read" },
            { context: "laps run", xDesc: "minute running session", yDesc: "laps completed" },
            { context: "words typed", xDesc: "minute typing session", yDesc: "words typed" },
            { context: "sketches drawn", xDesc: "minute drawing session", yDesc: "sketches completed" },
            { context: "emails answered", xDesc: "minute work period", yDesc: "emails answered" },
            { context: "items assembled", xDesc: "minute assembly time", yDesc: "items assembled" },
            { context: "boxes packed", xDesc: "minute packing time", yDesc: "boxes packed" },
            { context: "calls made", xDesc: "minute calling time", yDesc: "calls completed" }
        ];

        const ctx = gen.randomChoice(contexts);

        const rates = [0.1, 0.2, 0.25, 0.5, 0.4];
        const rate = gen.randomChoice(rates);

        let minutesChoices = [20, 25, 30, 40, 50, 60];
        if (rate === 0.25) minutesChoices = [20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60];
        if (rate === 0.4) minutesChoices = [20, 25, 30, 35, 40, 45, 50, 55, 60];

        const minutes = gen.randomChoice(minutesChoices);
        const result = Number((rate * minutes).toFixed(2));

        const question =
            `The equation y = ${rate}x models ${ctx.yDesc} (y) during an x-${ctx.xDesc}. ` +
            `How many ${singularize(ctx.yDesc)} are modeled in ${minutes} minutes?`;

        const correct = result;

        const choicesNum = [correct];
        const wrongOffsets = gen.shuffle([minutes, Math.floor(result/2), result+5, result-3, correct*2]);
        for (let i = 0; i < 3; i++) {
            if (!choicesNum.includes(wrongOffsets[i])) {
                choicesNum.push(wrongOffsets[i]);
            }
        }
        while (choicesNum.length < 4) {
            choicesNum.push(correct + gen.randomInt(-8, 8));
        }

        const formatted = choicesNum.slice(0, 4).map((v) => Number.isInteger(v) ? `${v}` : `${v}`);
        const shuffled = gen.shuffle(formatted);
        const { labeled, letter } = labelChoices(shuffled, `${correct}`);

        const explanation =
            `Substitute x = ${minutes} into y = ${rate}x: y = ${rate}(${minutes}) = ${correct}.`;

        return gen.buildProblem(original, question, labeled, letter, explanation);
    }

    // =========================================================
    // TEMPLATE 10: Percentage Mixture
    // ✅ EXPANDED: 10+ mixture types
    // =========================================================
    function template_percentage_mixture(original) {
        const substances = [
            { name1: "Fertilizer A", name2: "Fertilizer B", component: "nitrogen", pct1: 60, pct2: 40 },
            { name1: "Solution A", name2: "Solution B", component: "salt", pct1: 25, pct2: 45 },
            { name1: "Mixture A", name2: "Mixture B", component: "sugar", pct1: 30, pct2: 50 },
            { name1: "Alloy X", name2: "Alloy Y", component: "copper", pct1: 35, pct2: 55 },
            { name1: "Blend A", name2: "Blend B", component: "protein", pct1: 20, pct2: 40 },
            { name1: "Fuel Type 1", name2: "Fuel Type 2", component: "ethanol", pct1: 15, pct2: 35 },
            { name1: "Paint A", name2: "Paint B", component: "pigment", pct1: 28, pct2: 42 },
            { name1: "Concrete Mix A", name2: "Concrete Mix B", component: "cement", pct1: 22, pct2: 38 },
            { name1: "Juice Blend A", name2: "Juice Blend B", component: "pulp", pct1: 18, pct2: 32 },
            { name1: "Soil Type A", name2: "Soil Type B", component: "clay", pct1: 26, pct2: 44 }
        ];

        const ctx = gen.randomChoice(substances);

        const decimal1 = ctx.pct1 / 100;
        const decimal2 = ctx.pct2 / 100;

        const x = gen.randomInt(50, 250);
        const y = gen.randomInt(50, 250);
        const totalComponent = Number((decimal1 * x + decimal2 * y).toFixed(2));

        const question =
            `A mix of ${ctx.name1} (${ctx.pct1}% ${ctx.component}) and ${ctx.name2} (${ctx.pct2}% ${ctx.component}) contains ` +
            `${totalComponent} pounds of ${ctx.component} total. ` +
            `Which equation models this, where x is pounds of ${ctx.name1} and y is pounds of ${ctx.name2}?`;

        const correct = `${decimal1}x + ${decimal2}y = ${totalComponent}`;

        const wrong1 = `${decimal2}x + ${decimal1}y = ${totalComponent}`;
        const wrong2 = `${ctx.pct1}x + ${ctx.pct2}y = ${totalComponent}`;
        const wrong3 = `${decimal1}x + ${decimal2}y = ${ctx.pct1 + ctx.pct2}`;

        const choices = gen.shuffle([correct, wrong1, wrong2, wrong3]);
        const { labeled, letter } = labelChoices(choices, correct);

        const explanation =
            `${ctx.name1} contributes ${decimal1}x pounds of ${ctx.component}, and ${ctx.name2} contributes ${decimal2}y pounds of ${ctx.component}. ` +
            `Their combined total is ${totalComponent}, so ${correct}.`;

        return gen.buildProblem(original, question, labeled, letter, explanation);
    }

    // =========================================================
    // TEMPLATE 11: Revenue/Cost Interpretation
    // ✅ EXPANDED: 15+ business types
    // =========================================================
    function template_revenue_interpretation(original) {
        const businesses = [
            { business: "food truck", item1: "tacos", item2: "burritos" },
            { business: "cafe", item1: "coffees", item2: "pastries" },
            { business: "ice cream stand", item1: "single scoops", item2: "double scoops" },
            { business: "bakery", item1: "cookies", item2: "cupcakes" },
            { business: "farmers market stall", item1: "small bags", item2: "large bags" },
            { business: "movie theater", item1: "small popcorns", item2: "large popcorns" },
            { business: "bookstore", item1: "magazines", item2: "books" },
            { business: "flower shop", item1: "single roses", item2: "bouquets" },
            { business: "juice bar", item1: "small smoothies", item2: "large smoothies" },
            { business: "gift shop", item1: "postcards", item2: "souvenirs" },
            { business: "pizza place", item1: "slices", item2: "whole pizzas" },
            { business: "pet store", item1: "small toys", item2: "large toys" },
            { business: "art gallery", item1: "prints", item2: "originals" },
            { business: "candy store", item1: "small bags", item2: "large boxes" },
            { business: "car wash", item1: "basic washes", item2: "premium washes" }
        ];

        const ctx = gen.randomChoice(businesses);

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
    // No context needed - pure math
    // ✅ FIXED: Generates different slopes in wrong answers
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
            `y = ${slope}x ${originalB >= 0 ? "+" : ""} ${originalB >= 0 ? originalB : `${originalB}`}. ` +
            `Which equation represents line m?`;

        const correct = `y = ${slope}x ${newB >= 0 ? "+" : ""} ${newB >= 0 ? newB : `${newB}`}`;

        const wrongSlope1 = -slope;
        const wrong1 = `y = ${wrongSlope1}x ${newB >= 0 ? "+" : ""} ${newB >= 0 ? newB : `${newB}`}`;

        const wrongSlope2 = slope + (slope > 0 ? -1 : 1);
        const wrongB2 = pointY - wrongSlope2 * pointX;
        const wrong2 = `y = ${wrongSlope2}x ${wrongB2 >= 0 ? "+" : ""} ${wrongB2 >= 0 ? wrongB2 : `${wrongB2}`}`;

        const wrongSlope3 = Math.abs(slope) <= 3 ? slope * 2 : Math.floor(slope / 2) || 1;
        const wrongB3 = pointY - wrongSlope3 * pointX;
        const wrong3 = `y = ${wrongSlope3}x ${wrongB3 >= 0 ? "+" : ""} ${wrongB3 >= 0 ? wrongB3 : `${wrongB3}`}`;

        const choices = gen.shuffle([correct, wrong1, wrong2, wrong3]);
        const { labeled, letter } = labelChoices(choices, correct);

        const explanation =
            `Parallel lines have the same slope, so line m has slope ${slope}. ` +
            `Use (${pointX}, ${pointY}) in y = mx + b: ${pointY} = ${slope}(${pointX}) + b, so b = ${newB}. ` +
            `Therefore, ${correct}.`;

        return gen.buildProblem(original, question, labeled, letter, explanation);
    }

    // =========================================================
    // REGISTER ALL TEMPLATES
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

    console.log("✅ Linear Eq 2 Var - Easy templates registered (FINAL VERSION with MASSIVE scenario variety)");
})();