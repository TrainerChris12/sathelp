// sat/generators/algebra/systemsOfTwoLinEq/easy.js
// Systems of Linear Equations in Two Variables - Easy Templates

if (!window.ProblemGenerator) {
    console.error("❌ ProblemGenerator not loaded before systemsOfTwoLinEq/easy.js");
} else {
    const P = window.ProblemGenerator.prototype;

    // =========================================================
    // TEMPLATE 1: Word Problem - Two Items with Total & Revenue
    // =========================================================

    P.twoItemsPurchase = function(original) {
        const scenarios = [
            { item1: "notebook", item2: "pen", var1: "n", var2: "p" },
            { item1: "apple", item2: "banana", var1: "a", var2: "b" },
            { item1: "shirt", item2: "hat", var1: "s", var2: "h" },
            { item1: "adult ticket", item2: "child ticket", var1: "a", var2: "c" },
            { item1: "small pizza", item2: "large pizza", var1: "s", var2: "l" },
            { item1: "muffin", item2: "cookie", var1: "m", var2: "c" },
            { item1: "rose", item2: "lily", var1: "r", var2: "l" }
        ];

        const scenario = this.randomChoice(scenarios);
        const price1 = this.randomChoice([3, 4, 5, 6, 7, 8, 9]);
        const price2 = this.randomChoice([2, 3, 4, 5]);
        const [highPrice, lowPrice] = price1 > price2 ? [price1, price2] : [price2, price1];
        const total = this.randomChoice([18, 22, 23, 27, 31, 33, 37, 41, 43, 47]);

        // More varied quantities - not just multiples of 5
        const qty1 = this.randomInt(3, Math.floor(total * 0.65));
        const qty2 = total - qty1;
        const revenue = highPrice * qty1 + lowPrice * qty2;

        const question = `A store sells ${scenario.item1}s for $${highPrice} each and ${scenario.item2}s for $${lowPrice} each. Yesterday, the store sold a total of ${total} items for $${revenue}. If ${scenario.var1} represents the number of ${scenario.item1}s sold and ${scenario.var2} represents the number of ${scenario.item2}s sold, which system of equations represents this situation?`;

        const correctEq1 = `${scenario.var1} + ${scenario.var2} = ${total}`;
        const correctEq2 = `${highPrice}${scenario.var1} + ${lowPrice}${scenario.var2} = ${revenue}`;
        const correct = `${correctEq1}\n${correctEq2}`;
        const wrong = [
            `${scenario.var1} + ${scenario.var2} = ${revenue}\n${highPrice}${scenario.var1} + ${lowPrice}${scenario.var2} = ${total}`,
            `${highPrice}${scenario.var1} + ${lowPrice}${scenario.var2} = ${total}\n${scenario.var1} + ${scenario.var2} = ${revenue}`,
            `${scenario.var1} + ${scenario.var2} = ${total}\n${lowPrice}${scenario.var1} + ${highPrice}${scenario.var2} = ${revenue}`
        ];

        const allChoices = this.shuffle([correct, ...wrong]);
        const { choices, answer } = this.labelChoices(allChoices, correct);
        const explanation = `The total items is ${correctEq1}. The total revenue is ${correctEq2}.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // =========================================================
    // TEMPLATE 2: Substitution - One Variable Given (x OR y)
    // =========================================================

    P.substitutionGiven = function(original) {
        const giveX = Math.random() < 0.5; // 50% chance to give x or y

        if (giveX) {
            const xVal = this.randomChoice([1, 2, 3, 4, 5, 6]);
            const coef = this.randomChoice([2, 3, 4, 5]);
            const yCoef = this.randomChoice([2, 3, 4]);
            const yValPossible = this.randomChoice([2, 3, 4, 5, 6]);
            const constant = coef * xVal + yCoef * yValPossible;
            const yVal = Math.floor((constant - coef * xVal) / yCoef);

            const question = `What is the solution (x, y) to the given system of equations?\n\n${coef}x + ${yCoef}y = ${constant}\nx = ${xVal}`;

            const correct = `(${xVal}, ${yVal})`;
            const wrong = [`(${yVal}, ${xVal})`, `(${xVal}, ${yVal + 1})`, `(${xVal + 1}, ${yVal})`];
            const allChoices = this.shuffle([correct, ...wrong]);
            const { choices, answer } = this.labelChoices(allChoices, correct);

            const explanation = `Substitute x = ${xVal} into the first equation: ${coef}(${xVal}) + ${yCoef}y = ${constant}, which gives ${coef * xVal} + ${yCoef}y = ${constant}, so ${yCoef}y = ${constant - coef * xVal} and y = ${yVal}.`;

            return this.buildProblem(original, question, choices, answer, explanation);
        } else {
            const yVal = this.randomChoice([1, 2, 3, 4, 5, 6]);
            const xCoef = this.randomChoice([2, 3, 4, 5]);
            const yCoef = this.randomChoice([2, 3, 4]);
            const xValPossible = this.randomChoice([2, 3, 4, 5, 6]);
            const constant = xCoef * xValPossible + yCoef * yVal;
            const xVal = Math.floor((constant - yCoef * yVal) / xCoef);

            const question = `What is the solution (x, y) to the given system of equations?\n\n${xCoef}x + ${yCoef}y = ${constant}\ny = ${yVal}`;

            const correct = `(${xVal}, ${yVal})`;
            const wrong = [`(${yVal}, ${xVal})`, `(${xVal + 1}, ${yVal})`, `(${xVal}, ${yVal + 1})`];
            const allChoices = this.shuffle([correct, ...wrong]);
            const { choices, answer } = this.labelChoices(allChoices, correct);

            const explanation = `Substitute y = ${yVal} into the first equation: ${xCoef}x + ${yCoef}(${yVal}) = ${constant}, which gives ${xCoef}x + ${yCoef * yVal} = ${constant}, so ${xCoef}x = ${constant - yCoef * yVal} and x = ${xVal}.`;

            return this.buildProblem(original, question, choices, answer, explanation);
        }
    };

    // =========================================================
    // TEMPLATE 3: Elimination Addition (More Interesting Numbers)
    // =========================================================

    P.eliminationAddition = function(original) {
        const x = this.randomChoice([2, 3, 4, 5, 6, 7, 8]);
        const y = this.randomChoice([2, 3, 4, 5, 6, 7]);
        const a1 = this.randomChoice([1, 2, 3, 4]);
        const b1 = this.randomChoice([2, 3, 4, 5]);
        const c1 = a1 * x + b1 * y;
        const a2 = this.randomChoice([1, 2, 3]);
        const b2 = -b1;
        const c2 = a2 * x + b2 * y;

        const question = `What is the solution (x, y) to the given system of equations?\n\n${a1}x + ${b1}y = ${c1}\n${a2}x ${b2 >= 0 ? '+' : ''}${b2}y = ${c2}`;

        const correct = `(${x}, ${y})`;
        const wrong = [`(${y}, ${x})`, `(${x + 1}, ${y})`, `(${x}, ${y + 1})`];
        const allChoices = this.shuffle([correct, ...wrong]);
        const { choices, answer } = this.labelChoices(allChoices, correct);

        const explanation = `Add the equations to eliminate y: (${a1}x + ${b1}y) + (${a2}x ${b2 >= 0 ? '+' : ''}${b2}y) = ${c1} + ${c2}, giving ${a1 + a2}x = ${c1 + c2}, so x = ${x}. Substitute to find y = ${y}.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // =========================================================
    // TEMPLATE 4: Find Linear Combination (Reformed - Can Eliminate x OR y)
    // =========================================================

    P.findLinearCombination = function(original) {
        const x = this.randomChoice([3, 4, 5, 6, 7]);
        const y = this.randomChoice([2, 3, 4, 5, 6]);

        // 50% chance to eliminate x or y
        const eliminateX = Math.random() < 0.5;

        let eq1, eq2, combos;

        if (eliminateX) {
            // Set up to eliminate x when added
            const coef = this.randomChoice([2, 3]);
            eq1 = `${coef}x + y = ${coef * x + y}`;
            eq2 = `${-coef}x + ${this.randomChoice([2, 3])}y = ${-coef * x + this.randomChoice([2, 3]) * y}`;

            combos = [
                { expr: "y", val: y },
                { expr: "2y", val: 2 * y },
                { expr: "x + y", val: x + y },
                { expr: "3y", val: 3 * y }
            ];
        } else {
            // Set up to eliminate y when added (original behavior but different values)
            eq1 = `x + y = ${x + y}`;
            eq2 = `x - y = ${x - y}`;

            combos = [
                { expr: "x", val: x },
                { expr: "2x", val: 2 * x },
                { expr: "x + y", val: x + y },
                { expr: "x - y", val: x - y }
            ];
        }

        const combo = this.randomChoice(combos);
        const question = `The solution to the given system of equations is (x, y). What is the value of ${combo.expr}?\n\n${eq1}\n${eq2}`;

        const allVals = [combo.val, combo.val + 1, combo.val - 1, combo.val + 2];
        const { choices, answer } = this.labelChoices(allVals, combo.val);

        const explanation = eliminateX
            ? `Adding the equations eliminates x. Solving gives y = ${y}. Then substitute to find x = ${x}. Therefore ${combo.expr} = ${combo.val}.`
            : `Adding the equations: 2x = ${2 * x}, so x = ${x}. From ${eq1}: y = ${y}. Therefore ${combo.expr} = ${combo.val}.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // =========================================================
    // TEMPLATE 5: Tickets Problem
    // =========================================================

    P.ticketsProblem = function(original) {
        const contexts = [
            { place: "concert", type1: "general admission", type2: "VIP" },
            { place: "museum", type1: "adult", type2: "student" },
            { place: "zoo", type1: "adult", type2: "child" },
            { place: "amusement park", type1: "regular", type2: "fast pass" },
            { place: "theater", type1: "orchestra", type2: "balcony" },
            { place: "carnival", type1: "all-day pass", type2: "ride ticket" }
        ];

        const context = this.randomChoice(contexts);
        const price1 = this.randomChoice([15, 18, 20, 22, 25, 28]);
        const price2 = this.randomChoice([8, 10, 12, 14]);
        const total = this.randomChoice([50, 60, 75, 80, 100, 120]);
        const qty1 = Math.floor(total * 0.4) + this.randomInt(1, 15);
        const qty2 = total - qty1;
        const revenue = price1 * qty1 + price2 * qty2;

        const question = `A ${context.place} sells ${context.type1} tickets for $${price1} and ${context.type2} tickets for $${price2}. Yesterday, they sold ${total} total tickets for $${revenue}. If a represents ${context.type1} tickets and b represents ${context.type2} tickets, which system can be used to find a and b?`;

        const correct = `a + b = ${total}\n${price1}a + ${price2}b = ${revenue}`;
        const wrong = [
            `a + b = ${revenue}\n${price1}a + ${price2}b = ${total}`,
            `${price1}a + ${price2}b = ${total}\na + b = ${revenue}`,
            `a + b = ${total}\n${price2}a + ${price1}b = ${revenue}`
        ];

        const allChoices = this.shuffle([correct, ...wrong]);
        const { choices, answer } = this.labelChoices(allChoices, correct);

        const explanation = `Total tickets: a + b = ${total}. Total revenue: ${price1}a + ${price2}b = ${revenue}.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // =========================================================
    // TEMPLATE 6: Money Problem (Varied Bill Combinations)
    // =========================================================

    P.moneyProblem = function(original) {
        const billPairs = [
            [20, 10], [20, 5], [20, 1],
            [10, 5], [10, 1],
            [5, 1],
            [50, 20], [50, 10],
            [100, 20], [100, 50]
        ];

        const [bill1, bill2] = this.randomChoice(billPairs);
        const total = this.randomChoice([8, 10, 12, 15, 18, 20, 25]);
        const qty1 = this.randomInt(2, Math.floor(total * 0.4));
        const qty2 = total - qty1;
        const value = bill1 * qty1 + bill2 * qty2;

        const question = `A wallet contains $${bill1} bills and $${bill2} bills. There are ${total} bills total worth $${value}. If x represents the number of $${bill1} bills and y represents the number of $${bill2} bills, which system represents this?`;

        const correct = `x + y = ${total}\n${bill1}x + ${bill2}y = ${value}`;
        const wrong = [
            `x + y = ${value}\n${bill1}x + ${bill2}y = ${total}`,
            `${bill1}x + ${bill2}y = ${total}\nx + y = ${value}`,
            `x + y = ${total}\n${bill2}x + ${bill1}y = ${value}`
        ];

        const allChoices = this.shuffle([correct, ...wrong]);
        const { choices, answer } = this.labelChoices(allChoices, correct);

        const explanation = `Total bills: x + y = ${total}. Total value: ${bill1}x + ${bill2}y = ${value}.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // =========================================================
    // TEMPLATE 7: Infinitely Many Solutions (No Decimals)
    // =========================================================

    P.infinitelySolutions = function(original) {
        const multiplier = this.randomChoice([2, 3, 4, 5]);
        const a = this.randomChoice([2, 3, 4, 5]);
        const b = this.randomChoice([3, 4, 5, 6]);
        const k = this.randomChoice([6, 8, 9, 10, 12, 15, 18, 20]); // Ensures k is integer
        const c = k * multiplier;

        const question = `In the given system of equations, k is a constant. If the system has infinitely many solutions, what is the value of k?\n\n${a * multiplier}x + ${b * multiplier}y = ${c}\n${a}x + ${b}y = k`;

        const allVals = [k, k + 1, k - 1, c].filter((v, i, arr) => arr.indexOf(v) === i).sort((a, b) => a - b);
        const { choices, answer } = this.labelChoices(allVals, k);

        const explanation = `For infinitely many solutions, the second equation must be a multiple of the first. Dividing the first equation by ${multiplier}: ${a}x + ${b}y = ${k}. So k = ${k}.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // =========================================================
    // TEMPLATE 8: Negative Solution (More Interesting Equations)
    // =========================================================

    P.negativeSolution = function(original) {
        const x = this.randomChoice([3, 4, 5, 6]);
        const y = -1 * this.randomChoice([2, 3, 4]);
        const a1 = this.randomChoice([2, 3, 4]);
        const b1 = this.randomChoice([1, 2, 3]);
        const c1 = a1 * x + b1 * y;

        // More varied second equation formats
        const formats = [
            { a: 1, b: 1 },
            { a: -1, b: 1 },
            { a: 1, b: -1 },
            { a: 2, b: 1 },
            { a: 1, b: 2 }
        ];
        const format = this.randomChoice(formats);
        const c2 = format.a * x + format.b * y;

        const eq2 = `${format.a === 1 ? '' : format.a === -1 ? '-' : format.a}x ${format.b >= 0 ? '+' : ''}${format.b === 1 ? '' : format.b === -1 ? '-' : format.b}y = ${c2}`;

        const question = `What is the solution (x, y) to the given system of equations?\n\n${a1}x + ${b1}y = ${c1}\n${eq2}`;

        const correct = `(${x}, ${y})`;
        const wrong = [`(${Math.abs(y)}, ${x})`, `(${x}, ${Math.abs(y)})`, `(${x + 1}, ${y})`];
        const allChoices = this.shuffle([correct, ...wrong]);
        const { choices, answer } = this.labelChoices(allChoices, correct);

        const explanation = `Solve using substitution or elimination. The solution is x = ${x}, y = ${y}. Note: This includes a negative solution.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // =========================================================
    // TEMPLATE 9: Decimal Word Problem
    // =========================================================

    P.decimalWordProblem = function(original) {
        const item1 = this.randomChoice(["sandwich", "salad", "burger", "wrap", "burrito", "bowl"]);
        const item2 = this.randomChoice(["drink", "side", "dessert", "soup", "chips", "fruit cup"]);
        const price1 = this.randomChoice([6.50, 7.25, 8.50, 9.75, 10.50, 11.25]);
        const price2 = this.randomChoice([2.50, 3.25, 3.75, 4.50, 5.25]);
        const total = this.randomChoice([15, 20, 25, 30, 35]);
        const qty1 = Math.floor(total * 0.4) + this.randomInt(1, 8);
        const qty2 = total - qty1;
        const revenue = (price1 * qty1 + price2 * qty2).toFixed(2);

        const question = `A café sells ${item1}s for $${price1.toFixed(2)} and ${item2}s for $${price2.toFixed(2)}. Today they sold ${total} items for $${revenue}. If s represents ${item1}s and d represents ${item2}s, which system represents this?`;

        const correct = `s + d = ${total}\n${price1.toFixed(2)}s + ${price2.toFixed(2)}d = ${revenue}`;
        const wrong = [
            `s + d = ${revenue}\n${price1.toFixed(2)}s + ${price2.toFixed(2)}d = ${total}`,
            `s + d = ${total}\n${price2.toFixed(2)}s + ${price1.toFixed(2)}d = ${revenue}`,
            `${price1.toFixed(2)}s + ${price2.toFixed(2)}d = ${total}\ns + d = ${revenue}`
        ];

        const allChoices = this.shuffle([correct, ...wrong]);
        const { choices, answer } = this.labelChoices(allChoices, correct);

        const explanation = `Total items: s + d = ${total}. Total revenue with decimal prices: ${price1.toFixed(2)}s + ${price2.toFixed(2)}d = ${revenue}.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // =========================================================
    // TEMPLATE 10: Ratio/Times Problem (Fixed Formatting)
    // =========================================================

    P.ratioTimesProblem = function(original) {
        const multiplier = this.randomChoice([2, 3, 4, 5]);
        const total = this.randomChoice([24, 30, 36, 42, 48, 60]);
        const names = [
            ["Alex", "Jordan"],
            ["Maria", "Carlos"],
            ["Sam", "Taylor"],
            ["Riley", "Casey"],
            ["Jamie", "Morgan"]
        ];
        const pair = this.randomChoice(names);
        const item = this.randomChoice(["dollar", "point", "coin", "marble", "sticker"]);

        const question = `${pair[0]} has x ${item}s and ${pair[1]} has y ${item}s. ${pair[0]} has ${multiplier} times as many ${item}s as ${pair[1]}, and together they have a total of ${total} ${item}s. Which system of equations represents this situation?`;

        const correct = `x = ${multiplier}y\nx + y = ${total}`;
        const wrong = [
            `y = ${multiplier}x\nx + y = ${total}`,
            `x = ${multiplier}y\nx + y = ${total * multiplier}`,
            `y = ${multiplier}x\nx + y = ${total * multiplier}`
        ];

        const allChoices = this.shuffle([correct, ...wrong]);
        const { choices, answer } = this.labelChoices(allChoices, correct);

        const explanation = `${pair[0]} has ${multiplier} times as many as ${pair[1]}: x = ${multiplier}y. Together they have ${total}: x + y = ${total}.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // =========================================================
    // TEMPLATE 11: Graph Interpretation with Actual Graph
    // =========================================================

    P.graphInterpretation = function(original) {
        const xSol = this.randomChoice([2, 3, 4]);
        const ySol = this.randomChoice([2, 3, 4]);

        // Create two lines that intersect at (xSol, ySol)
        const m1 = this.randomChoice([1, 2, -1]);
        const b1 = ySol - m1 * xSol;

        const m2 = this.randomChoice([1, -1, -2]);
        const b2 = ySol - m2 * xSol;

        // Generate the graph WITHOUT highlighting solution (since question asks for it)
        const graphSVG = this.makeLinearGraph(m1, b1, {
            width: 400,
            height: 300,
            xMin: -1,
            xMax: 6,
            yMin: -1,
            yMax: 7,
            showGrid: true,
            showAxes: true,
            showAxisLabels: true,
            xLabel: 'x',
            yLabel: 'y',
            highlightPoints: [] // Don't show solution since question asks for it
        });

        // Draw second line on top
        const y1_line2 = m2 * (-1) + b2;
        const y2_line2 = m2 * 6 + b2;

        const graphWithBothLines = graphSVG.replace('</svg>',
            `<line x1="40" y1="${300 - 40 - ((y1_line2 - (-1)) / 8) * 220}" x2="${400 - 40}" y2="${300 - 40 - ((y2_line2 - (-1)) / 8) * 220}" stroke="#e74c3c" stroke-width="3"/></svg>`);

        const question = `The graph shows a system of two linear equations. What is the solution (x, y) to the system?\n\n${graphWithBothLines}`;

        // Generate wrong answers - points NOT on both lines
        const wrong = [
            `(${xSol + 1}, ${ySol})`,
            `(${xSol}, ${ySol + 1})`,
            `(${xSol - 1}, ${ySol})`
        ];

        const correct = `(${xSol}, ${ySol})`;
        const allChoices = this.shuffle([correct, ...wrong]);
        const { choices, answer } = this.labelChoices(allChoices, correct);

        const explanation = `The solution to a system of linear equations is the point where the two lines intersect. The lines intersect at (${xSol}, ${ySol}).`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // =========================================================
    // TEMPLATE 12: Solve for Combined Expression
    // =========================================================

    P.solveForCombined = function(original) {
        const x = this.randomChoice([4, 6, 8, 10, 12]);
        const y = this.randomChoice([6, 8, 10, 12, 15]);
        const sum = x + y;

        const coef = this.randomChoice([2, 3]);
        const yCoef = this.randomChoice([2, 3, 4, 5]);
        const rhs = coef * sum + yCoef * y;

        const question = `If (x, y) is the solution to the given system of equations, what is the value of y?\n\nx + y = ${sum}\n${coef}(x + y) + ${yCoef}y = ${rhs}`;

        const correct = y;
        const wrong = [
            sum,
            x,
            y + 2
        ];

        const allChoices = this.shuffle([correct, ...wrong]);
        const { choices, answer } = this.labelChoices(allChoices, correct);

        const explanation = `Substitute (x + y) = ${sum} into the second equation: ${coef}(${sum}) + ${yCoef}y = ${rhs}. This gives ${coef * sum} + ${yCoef}y = ${rhs}, so ${yCoef}y = ${rhs - coef * sum} and y = ${y}.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // =========================================================
    // TEMPLATE 13: Solve for Actual Quantity (More Variety)
    // =========================================================

    P.solveForActualQuantity = function(original) {
        const contexts = [
            { item1: "novel", item2: "magazine", price1: 4, price2: 1 },
            { item1: "adult ticket", item2: "child ticket", price1: 12, price2: 5 },
            { item1: "large coffee", item2: "small coffee", price1: 5, price2: 3 },
            { item1: "hardcover book", item2: "paperback", price1: 15, price2: 8 },
            { item1: "premium seat", item2: "regular seat", price1: 25, price2: 10 },
            { item1: "deluxe burger", item2: "regular burger", price1: 9, price2: 6 },
            { item1: "large popcorn", item2: "small popcorn", price1: 8, price2: 5 }
        ];

        const context = this.randomChoice(contexts);
        const total = this.randomChoice([10, 12, 15, 18, 20, 24, 30]);

        const qty1 = this.randomInt(2, Math.floor(total * 0.5));
        const qty2 = total - qty1;
        const revenue = context.price1 * qty1 + context.price2 * qty2;

        const question = `A store sells ${context.item1}s for $${context.price1} each and ${context.item2}s for $${context.price2} each. If the store sold a total of ${total} items for $${revenue}, how many ${context.item1}s did the store sell?`;

        const correct = qty1;
        const wrong = [
            qty2,
            total,
            qty1 + 1
        ].filter(v => v !== correct && v > 0 && v !== total);

        const allChoices = this.shuffle([correct, ...wrong.slice(0, 3)]);
        const { choices, answer } = this.labelChoices(allChoices, correct);

        const explanation = `Let n = ${context.item1}s. Then ${context.item2}s = ${total} - n. System: ${context.price1}n + ${context.price2}(${total} - n) = ${revenue}. Solving gives n = ${qty1}.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    console.log("✅ Systems of Linear Equations Easy templates loaded (13 templates)");
}