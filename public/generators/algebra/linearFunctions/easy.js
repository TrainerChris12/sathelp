// public/generators/algebra/linearFunctions/easy.js
// Linear Functions - Easy - WITH DYNAMIC GRAPH SUPPORT
// Clean grid-aligned values, no answer giveaways

if (!window.ProblemGenerator) {
    console.error("❌ ProblemGenerator not loaded before linearFunctions/easy.js");
} else {
    const P = window.ProblemGenerator.prototype;

    // =========================================================
    // GRAPH GENERATION UTILITIES
    // =========================================================

    /**
     * Generates SVG markup for a linear graph
     * Key design: All values land exactly on grid lines
     * Supports both single-quadrant (positive only) and 4-quadrant graphs
     */
    P._generateLinearGraphSVG = function (config) {
        const {
            width = 400,
            height = 320,
            padding = 50,
            xMin = 0,
            xMax = 10,
            yMin = 0,
            yMax = 50,
            xLabel = "x",
            yLabel = "y",
            title = "",
            slope,
            yIntercept,
            points = [],
            xTick = 1,
            yTick = 5
        } = config;

        const graphWidth = width - 2 * padding;
        const graphHeight = height - 2 * padding;

        const toSvgX = (x) => padding + ((x - xMin) / (xMax - xMin)) * graphWidth;
        const toSvgY = (y) => height - padding - ((y - yMin) / (yMax - yMin)) * graphHeight;

        // Check if this is a 4-quadrant graph (has negative values)
        const is4Quadrant = xMin < 0 && yMin < 0;

        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="font-family: Arial, sans-serif;">`;

        // White background with border
        svg += `<rect width="${width}" height="${height}" fill="white" stroke="#ccc" stroke-width="1"/>`;

        // Grid lines (lighter)
        svg += `<g stroke="#e0e0e0" stroke-width="1">`;
        for (let x = xMin; x <= xMax; x += xTick) {
            svg += `<line x1="${toSvgX(x)}" y1="${padding}" x2="${toSvgX(x)}" y2="${height - padding}"/>`;
        }
        for (let y = yMin; y <= yMax; y += yTick) {
            svg += `<line x1="${padding}" y1="${toSvgY(y)}" x2="${width - padding}" y2="${toSvgY(y)}"/>`;
        }
        svg += `</g>`;

        // Axes - position depends on whether 4-quadrant or single quadrant
        svg += `<g stroke="#333" stroke-width="2">`;

        if (is4Quadrant) {
            // 4-QUADRANT: Draw axes at x=0 and y=0
            const xAxisY = toSvgY(0);  // y-position where y=0
            const yAxisX = toSvgX(0);  // x-position where x=0

            // X-axis (horizontal line at y=0)
            svg += `<line x1="${padding}" y1="${xAxisY}" x2="${width - padding + 8}" y2="${xAxisY}"/>`;
            // Y-axis (vertical line at x=0)
            svg += `<line x1="${yAxisX}" y1="${padding - 8}" x2="${yAxisX}" y2="${height - padding}"/>`;

            // Arrows
            svg += `<polygon points="${width - padding + 8},${xAxisY} ${width - padding},${xAxisY - 4} ${width - padding},${xAxisY + 4}" fill="#333"/>`;
            svg += `<polygon points="${yAxisX},${padding - 8} ${yAxisX - 4},${padding} ${yAxisX + 4},${padding}" fill="#333"/>`;
        } else {
            // SINGLE QUADRANT: Draw axes at edges
            svg += `<line x1="${padding}" y1="${height - padding}" x2="${width - padding + 8}" y2="${height - padding}"/>`;
            svg += `<line x1="${padding}" y1="${padding - 8}" x2="${padding}" y2="${height - padding}"/>`;
            // Arrows
            svg += `<polygon points="${width - padding + 8},${height - padding} ${width - padding},${height - padding - 4} ${width - padding},${height - padding + 4}" fill="#333"/>`;
            svg += `<polygon points="${padding},${padding - 8} ${padding - 4},${padding} ${padding + 4},${padding}" fill="#333"/>`;
        }
        svg += `</g>`;

        // Tick marks and labels
        svg += `<g font-size="11" fill="#333">`;

        if (is4Quadrant) {
            const xAxisY = toSvgY(0);
            const yAxisX = toSvgX(0);

            // X-axis ticks (below axis at y=0)
            for (let x = xMin; x <= xMax; x += xTick) {
                if (x === 0) continue; // Skip origin
                const svgX = toSvgX(x);
                svg += `<line x1="${svgX}" y1="${xAxisY}" x2="${svgX}" y2="${xAxisY + 5}" stroke="#333" stroke-width="1"/>`;
                svg += `<text x="${svgX}" y="${xAxisY + 17}" text-anchor="middle">${x}</text>`;
            }
            // Y-axis ticks (left of axis at x=0)
            for (let y = yMin; y <= yMax; y += yTick) {
                if (y === 0) continue; // Skip origin
                const svgY = toSvgY(y);
                svg += `<line x1="${yAxisX}" y1="${svgY}" x2="${yAxisX - 5}" y2="${svgY}" stroke="#333" stroke-width="1"/>`;
                svg += `<text x="${yAxisX - 8}" y="${svgY + 4}" text-anchor="end">${y}</text>`;
            }
            // Origin label
            svg += `<text x="${yAxisX - 8}" y="${xAxisY + 15}" text-anchor="end">0</text>`;
        } else {
            // Single quadrant ticks at edges
            for (let x = xMin; x <= xMax; x += xTick) {
                const svgX = toSvgX(x);
                svg += `<line x1="${svgX}" y1="${height - padding}" x2="${svgX}" y2="${height - padding + 5}" stroke="#333" stroke-width="1"/>`;
                svg += `<text x="${svgX}" y="${height - padding + 17}" text-anchor="middle">${x}</text>`;
            }
            for (let y = yMin; y <= yMax; y += yTick) {
                const svgY = toSvgY(y);
                svg += `<line x1="${padding}" y1="${svgY}" x2="${padding - 5}" y2="${svgY}" stroke="#333" stroke-width="1"/>`;
                svg += `<text x="${padding - 8}" y="${svgY + 4}" text-anchor="end">${y}</text>`;
            }
        }
        svg += `</g>`;

        // Axis labels
        svg += `<text x="${width / 2}" y="${height - 8}" font-size="13" text-anchor="middle" fill="#333">${xLabel}</text>`;
        svg += `<text x="12" y="${height / 2}" font-size="13" text-anchor="middle" fill="#333" transform="rotate(-90, 12, ${height / 2})">${yLabel}</text>`;

        // Title
        if (title) {
            svg += `<text x="${width / 2}" y="18" font-size="14" font-weight="bold" text-anchor="middle" fill="#333">${title}</text>`;
        }

        // The line
        const linePoints = this._getVisibleLineSegment(slope, yIntercept, xMin, xMax, yMin, yMax);
        if (linePoints) {
            svg += `<line x1="${toSvgX(linePoints.x1)}" y1="${toSvgY(linePoints.y1)}" x2="${toSvgX(linePoints.x2)}" y2="${toSvgY(linePoints.y2)}" stroke="#2563eb" stroke-width="3"/>`;
        }

        // Points (no labels that give away answers)
        for (const pt of points) {
            const svgX = toSvgX(pt.x);
            const svgY = toSvgY(pt.y);
            const color = pt.color || "#2563eb";
            const radius = pt.radius || 5;
            svg += `<circle cx="${svgX}" cy="${svgY}" r="${radius}" fill="${color}" stroke="white" stroke-width="2"/>`;
            // Only show label if explicitly provided and not the answer
            if (pt.label) {
                svg += `<text x="${svgX + 10}" y="${svgY - 8}" font-size="12" fill="${color}" font-weight="bold">${pt.label}</text>`;
            }
        }

        svg += `</svg>`;
        return svg;
    };

    /**
     * Calculate visible portion of line within graph bounds
     */
    P._getVisibleLineSegment = function (slope, yIntercept, xMin, xMax, yMin, yMax) {
        const points = [];

        const yAtXMin = slope * xMin + yIntercept;
        const yAtXMax = slope * xMax + yIntercept;

        if (yAtXMin >= yMin && yAtXMin <= yMax) {
            points.push({ x: xMin, y: yAtXMin });
        }
        if (yAtXMax >= yMin && yAtXMax <= yMax) {
            points.push({ x: xMax, y: yAtXMax });
        }

        if (slope !== 0) {
            const xAtYMin = (yMin - yIntercept) / slope;
            const xAtYMax = (yMax - yIntercept) / slope;

            if (xAtYMin > xMin && xAtYMin < xMax && !points.some(p => Math.abs(p.y - yMin) < 0.01)) {
                points.push({ x: xAtYMin, y: yMin });
            }
            if (xAtYMax > xMin && xAtYMax < xMax && !points.some(p => Math.abs(p.y - yMax) < 0.01)) {
                points.push({ x: xAtYMax, y: yMax });
            }
        }

        if (points.length >= 2) {
            points.sort((a, b) => a.x - b.x);
            return { x1: points[0].x, y1: points[0].y, x2: points[1].x, y2: points[1].y };
        }
        return null;
    };

    /**
     * Generate grid-aligned choices (all multiples of the grid interval)
     */
    P._gridChoices = function (correct, gridInterval, count = 4) {
        const choices = new Set([correct]);
        const offsets = this.shuffle([1, -1, 2, -2, 3, -3, 4, -4]);
        let i = 0;
        while (choices.size < count && i < offsets.length) {
            const wrong = correct + offsets[i] * gridInterval;
            choices.add(wrong);
            i++;
        }
        return this.shuffle(Array.from(choices));
    };

    // =========================================================
    // GRAPH-BASED TEMPLATES - ALL GRID-ALIGNED
    // =========================================================

    /**
     * Type 1: Read a y-value from the graph given an x-value
     * "According to the graph, what is the distance when time = 4?"
     */
    P.tplGraphReadYValueEasy = function (original) {
        // CONTROLLED SCALING: Keep yMax reasonable (≤60) for readability
        const yTick = this.randomChoice([5, 10]);
        const xTick = 1;
        const xMax = this.randomChoice([6, 8]);

        // Pick query x first
        const xQuery = this.randomInt(2, xMax - 1);

        // Choose slope as multiple of yTick to ensure grid alignment
        const slopeMultiplier = this.randomInt(1, 2);
        const slope = yTick * slopeMultiplier;

        // yIntercept also on grid
        const yIntercept = yTick * this.randomInt(0, 2);

        // Calculate answer (guaranteed on grid)
        const yAnswer = slope * xQuery + yIntercept;

        // Cap yMax to prevent squishing
        const yMax = Math.min(60, Math.ceil((slope * xMax + yIntercept) / yTick) * yTick + yTick);

        const contexts = [
            { xLabel: "Time (hours)", yLabel: "Distance (miles)", title: "Distance Traveled", thing: "distance, in miles" },
            { xLabel: "Hours", yLabel: "Pay (dollars)", title: "Total Pay", thing: "pay, in dollars" },
            { xLabel: "Days", yLabel: "Height (cm)", title: "Plant Growth", thing: "height, in cm" },
            { xLabel: "Weeks", yLabel: "Savings (dollars)", title: "Savings Account", thing: "savings, in dollars" }
        ];
        const ctx = this.randomChoice(contexts);

        const graph = this._generateLinearGraphSVG({
            slope, yIntercept, xMax, yMax, xTick, yTick,
            xLabel: ctx.xLabel, yLabel: ctx.yLabel, title: ctx.title,
            points: [] // No points marked - student must read the graph
        });

        const vals = this._gridChoices(yAnswer, yTick);
        const { choices, answer } = this.labelChoices(vals, yAnswer);

        const xWord = ctx.xLabel.split(" ")[0].toLowerCase();
        const question =
            `The graph shows ${ctx.thing} over ${xWord}.<br><br>` +
            `${graph}<br><br>` +
            `According to the graph, what is the ${ctx.thing.split(",")[0]} when ${xWord} = ${xQuery}?`;

        const explanation = this.makeSteps([
            `Find x = ${xQuery} on the horizontal axis.`,
            `Go straight up to where it meets the line.`,
            `Then go straight left to read the y-value.`,
            `The value is ${yAnswer}.`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    /**
     * Type 2: Find the y-intercept from a graph
     * Uses 4-quadrant graph so student can clearly see line crossing y-axis
     */
    P.tplGraphFindYInterceptEasy = function (original) {
        const yTick = this.randomChoice([2, 5]);
        const xTick = this.randomChoice([1, 2]);

        // y-intercept on grid, not zero, can be positive or negative
        const yIntercept = yTick * this.randomInt(1, 3) * this.randomChoice([1, -1]);

        // Slope that creates a clear line through all quadrants
        const slope = this.randomChoice([1, -1]) * yTick / 2;

        // Symmetric 4-quadrant bounds
        const xMin = -6;
        const xMax = 6;
        const yMin = -yTick * 4;
        const yMax = yTick * 4;

        const graph = this._generateLinearGraphSVG({
            slope, yIntercept, xMin, xMax, yMin, yMax, xTick, yTick,
            xLabel: "x", yLabel: "y",
            points: [] // No points marked - student finds where line crosses y-axis
        });

        const vals = this._gridChoices(yIntercept, yTick);
        const { choices, answer } = this.labelChoices(vals, yIntercept);

        const question =
            `The graph of a linear function ${this.ital("f")} is shown.<br><br>` +
            `${graph}<br><br>` +
            `What is the y-intercept of the graph?`;

        const explanation = this.makeSteps([
            `The y-intercept is where the line crosses the y-axis.`,
            `Look at where x = 0 (the vertical axis).`,
            `The line crosses the y-axis at y = ${yIntercept}.`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    /**
     * Type 3: Find the x-intercept from a graph
     * Uses 4-quadrant graph so student can clearly see line crossing x-axis
     */
    P.tplGraphFindXInterceptEasy = function (original) {
        const xTick = this.randomChoice([1, 2]);
        const yTick = this.randomChoice([2, 5]);

        // x-intercept on grid, not zero, can be positive or negative
        const xIntercept = xTick * this.randomInt(1, 3) * this.randomChoice([1, -1]);

        // Calculate slope and yIntercept so line passes through (xIntercept, 0)
        // Use a slope that creates clear crossing through quadrants
        const slope = this.randomChoice([1, -1]) * yTick / 2;
        const yIntercept = -slope * xIntercept; // Ensures line passes through (xIntercept, 0)

        // Symmetric 4-quadrant bounds
        const xMin = -6;
        const xMax = 6;
        const yMin = -yTick * 4;
        const yMax = yTick * 4;

        const graph = this._generateLinearGraphSVG({
            slope, yIntercept, xMin, xMax, yMin, yMax, xTick, yTick,
            xLabel: "x", yLabel: "y",
            points: [] // No points marked - student finds where line crosses x-axis
        });

        const vals = this._gridChoices(xIntercept, xTick);
        const { choices, answer } = this.labelChoices(vals, xIntercept);

        const question =
            `The graph of a linear function ${this.ital("g")} is shown.<br><br>` +
            `${graph}<br><br>` +
            `What is the x-intercept of the graph?`;

        const explanation = this.makeSteps([
            `The x-intercept is where the line crosses the x-axis.`,
            `Look at where y = 0 (the horizontal axis).`,
            `The line crosses the x-axis at x = ${xIntercept}.`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    /**
     * Type 4: Find the slope from a graph (rate of change)
     * Uses two clearly marked points for calculation
     */
    P.tplGraphFindSlopeEasy = function (original) {
        const yTick = this.randomChoice([5, 10]);
        const xTick = 1;

        // Choose two x-values with nice separation
        const x1 = this.randomInt(1, 2);
        const x2 = x1 + this.randomInt(2, 3);
        const run = x2 - x1;

        // Slope is a clean integer
        const slope = this.randomInt(2, 5) * (yTick / run);
        // Ensure slope comes out to a nice number
        const actualSlope = Math.round(slope);
        const rise = actualSlope * run;

        const yIntercept = yTick * this.randomInt(0, 1);

        const y1 = actualSlope * x1 + yIntercept;
        const y2 = actualSlope * x2 + yIntercept;

        const xMax = 6;
        const yMax = Math.min(50, Math.ceil((actualSlope * xMax + yIntercept + yTick) / yTick) * yTick);

        const contexts = [
            { xLabel: "Miles", yLabel: "Cost (dollars)", title: "Delivery Cost", q: "cost per mile", unit: "dollars per mile" },
            { xLabel: "Hours", yLabel: "Distance (miles)", title: "Road Trip", q: "speed in miles per hour", unit: "mph" },
            { xLabel: "Items", yLabel: "Total Cost ($)", title: "Bulk Purchase", q: "cost per item", unit: "dollars per item" }
        ];
        const ctx = this.randomChoice(contexts);

        const graph = this._generateLinearGraphSVG({
            slope: actualSlope, yIntercept, xMax, yMax, xTick, yTick,
            xLabel: ctx.xLabel, yLabel: ctx.yLabel, title: ctx.title,
            points: [
                { x: x1, y: y1, label: `(${x1}, ${y1})` },
                { x: x2, y: y2, label: `(${x2}, ${y2})` }
            ]
        });

        // Wrong answers are nearby integers
        const wrongSlopes = this.shuffle([actualSlope + 1, actualSlope - 1, actualSlope + 2, actualSlope * 2])
            .filter(s => s !== actualSlope && s > 0)
            .slice(0, 3);

        const allVals = this.shuffle([actualSlope, ...wrongSlopes]);
        const { choices, answer } = this.labelChoices(allVals.slice(0, 4), actualSlope);

        const question =
            `The graph shows ${ctx.title.toLowerCase()}. Two points are labeled.<br><br>` +
            `${graph}<br><br>` +
            `What is the ${ctx.q}?`;

        const explanation = this.makeSteps([
            `Use the two labeled points: (${x1}, ${y1}) and (${x2}, ${y2}).`,
            `Slope = rise ÷ run = (${y2} − ${y1}) ÷ (${x2} − ${x1})`,
            `= ${rise} ÷ ${run} = ${actualSlope} ${ctx.unit}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    /**
     * Type 5: Read coordinates of a labeled point
     */
    P.tplGraphReadPointEasy = function (original) {
        const xTick = 1;
        const yTick = this.randomChoice([5, 10]);

        // Point on grid
        const xPoint = this.randomInt(2, 5);
        const yPoint = yTick * this.randomInt(1, 4);

        const slope = this.randomChoice([1, 2, -1]) * (yTick / 2);
        const yIntercept = yPoint - slope * xPoint;

        const xMax = 7;
        const yMax = Math.max(yTick * 5, yPoint + yTick * 2);

        const graph = this._generateLinearGraphSVG({
            slope, yIntercept, xMin: 0, xMax, yMin: 0, yMax, xTick, yTick,
            xLabel: "x", yLabel: "y",
            points: [{ x: xPoint, y: yPoint, color: "#dc2626", radius: 6, label: "P" }]
        });

        const correct = `(${xPoint}, ${yPoint})`;
        const wrong = [
            `(${yPoint}, ${xPoint})`,           // Swapped
            `(${xPoint}, ${yPoint + yTick})`,   // y off by one grid
            `(${xPoint + 1}, ${yPoint})`        // x off by one
        ];
        const allChoices = this.shuffle([correct, ...wrong]);
        const { choices, answer } = this.labelChoices(allChoices, correct);

        const question =
            `Point P is marked on the graph of a linear function.<br><br>` +
            `${graph}<br><br>` +
            `What are the coordinates of point P?`;

        const explanation = this.makeSteps([
            `Read the x-coordinate: x = ${xPoint}`,
            `Read the y-coordinate: y = ${yPoint}`,
            `The coordinates are (${xPoint}, ${yPoint}).`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // =========================================================
    // NON-GRAPH TEMPLATES (College Board style)
    // =========================================================

    /**
     * Evaluate f(x) at a given value
     */
    P.tplEvaluateFunctionEasy = function (original) {
        const a = this.randomInt(2, 9);
        const b = this.randomInt(-12, 12);
        const x = this.randomInt(2, 8);
        const result = a * x + b;

        const vals = this._gridChoices(result, a, 4);
        const { choices, answer } = this.labelChoices(vals, result);

        const funcName = this.randomChoice(["f", "g", "h", "p"]);
        const bDisplay = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;

        const question =
            `The function ${this.ital(funcName)} is defined by ${this.math(`${funcName}(x) = ${a}x ${bDisplay}`)}. ` +
            `What is the value of ${this.math(`${funcName}(${x})`)}?`;

        const explanation = this.makeSteps([
            `Substitute ${x} for x:`,
            `${this.math(`${funcName}(${x}) = ${a}(${x}) ${bDisplay} = ${a * x} ${bDisplay} = ${result}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    /**
     * Solve for x given f(x) = value
     */
    P.tplSolveForInputEasy = function (original) {
        const a = this.randomInt(2, 8);
        const b = this.randomInt(-10, 10);
        const x = this.randomInt(2, 10);
        const fOfX = a * x + b;

        const vals = this._gridChoices(x, 1, 4);
        const { choices, answer } = this.labelChoices(vals, x);

        const funcName = this.randomChoice(["f", "g", "h"]);
        const bDisplay = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;

        const question =
            `The function ${this.ital(funcName)} is defined by ${this.math(`${funcName}(x) = ${a}x ${bDisplay}`)}. ` +
            `For what value of ${this.ital("x")} does ${this.math(`${funcName}(x) = ${fOfX}`)}?`;

        const explanation = this.makeSteps([
            `Set ${this.math(`${a}x ${bDisplay} = ${fOfX}`)}`,
            `${b >= 0 ? `Subtract ${b}` : `Add ${Math.abs(b)}`}: ${this.math(`${a}x = ${fOfX - b}`)}`,
            `Divide by ${a}: ${this.math(`x = ${x}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    /**
     * Write equation from context
     */
    P.tplWriteEquationFromContextEasy = function (original) {
        const rate = this.randomInt(3, 12);
        const initial = this.randomInt(15, 75);

        const contexts = [
            {
                setup: `A gym charges $${initial} for a membership fee plus $${rate} per class`,
                question: "total cost C for attending n classes",
                varName: "n"
            },
            {
                setup: `A plumber charges a $${initial} service fee plus $${rate} per hour`,
                question: "total charge T for h hours of work",
                varName: "h"
            },
            {
                setup: `A taxi charges a base fare of $${initial} plus $${rate} per mile`,
                question: "total fare F for m miles",
                varName: "m"
            }
        ];
        const ctx = this.randomChoice(contexts);
        const v = ctx.varName;
        const resultVar = ctx.question.split(" ")[2];

        const correct = `${resultVar} = ${rate}${v} + ${initial}`;
        const wrong = [
            `${resultVar} = ${initial}${v} + ${rate}`,
            `${resultVar} = ${rate + initial}${v}`,
            `${resultVar} = ${rate}${v} - ${initial}`
        ];

        const allChoices = this.shuffle([correct, ...wrong]);
        const { choices, answer } = this.labelChoices(allChoices, correct);

        const question = `${ctx.setup}. Which equation represents the ${ctx.question}?`;

        const explanation = this.makeSteps([
            `The rate is $${rate} per unit, multiplied by the variable ${v}.`,
            `The initial/fixed cost is $${initial}, added as a constant.`,
            `Equation: ${correct}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    /**
     * Interpret slope in context
     */
    P.tplInterpretSlopeEasy = function (original) {
        const slope = this.randomInt(3, 15);
        const intercept = this.randomInt(10, 50);

        const contexts = [
            {
                equation: `d = ${slope}t`,
                description: "distance d, in miles, after t hours",
                correct: `The speed is ${slope} miles per hour.`,
                wrong: [
                    `The trip takes ${slope} hours.`,
                    `The total distance is ${slope} miles.`,
                    `The starting point is ${slope} miles from home.`
                ]
            },
            {
                equation: `h = ${intercept} + ${slope}t`,
                description: "height h, in feet, of a balloon after t minutes",
                correct: `The balloon rises ${slope} feet per minute.`,
                wrong: [
                    `The balloon is ${slope} minutes old.`,
                    `The balloon reaches ${slope} feet maximum.`,
                    `The balloon started at ${slope} feet.`
                ]
            }
        ];
        const ctx = this.randomChoice(contexts);

        const allChoices = this.shuffle([ctx.correct, ...ctx.wrong]);
        const { choices, answer } = this.labelChoices(allChoices, ctx.correct);

        const question =
            `The equation ${this.math(ctx.equation)} gives the ${ctx.description}. ` +
            `What does ${slope} represent?`;

        const explanation = this.makeSteps([
            `In a linear equation, the coefficient of the variable is the rate of change.`,
            `Here, ${slope} is multiplied by the time variable.`,
            `So ${slope} represents the rate: ${ctx.correct}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    /**
     * Interpret y-intercept in context
     */
    P.tplInterpretYInterceptEasy = function (original) {
        const slope = this.randomInt(2, 8);
        const intercept = this.randomInt(20, 80);

        const contexts = [
            {
                equation: `f(x) = ${intercept} + ${slope}x`,
                description: "estimated height, in cm, of a plant x weeks after planting",
                correct: `The plant was ${intercept} cm tall when planted.`,
                wrong: [
                    `The plant will be measured for ${intercept} weeks.`,
                    `The plant grows ${intercept} cm per week.`,
                    `The plant will reach ${intercept} cm maximum.`
                ]
            },
            {
                equation: `C(t) = ${intercept} + ${slope}t`,
                description: "total cost, in dollars, for t months of a subscription",
                correct: `There is an initial fee of $${intercept}.`,
                wrong: [
                    `The subscription lasts ${intercept} months.`,
                    `Each month costs $${intercept}.`,
                    `The maximum cost is $${intercept}.`
                ]
            }
        ];
        const ctx = this.randomChoice(contexts);

        const allChoices = this.shuffle([ctx.correct, ...ctx.wrong]);
        const { choices, answer } = this.labelChoices(allChoices, ctx.correct);

        const question =
            `The function ${this.math(ctx.equation)} gives the ${ctx.description}. ` +
            `What does ${intercept} represent?`;

        const explanation = this.makeSteps([
            `In f(x) = b + mx, the constant b is the y-intercept.`,
            `It represents the initial value when x = 0.`,
            `${ctx.correct}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    /**
     * Find equation from slope and y-intercept
     */
    P.tplEquationFromSlopeInterceptEasy = function (original) {
        const slope = this.randomInt(1, 6) * this.randomChoice([1, -1]);
        const yInt = this.randomInt(1, 8) * this.randomChoice([1, -1]);

        const slopeSign = slope >= 0 ? "" : "-";
        const yIntSign = yInt >= 0 ? "+" : "-";

        const correct = `f(x) = ${slope}x ${yIntSign} ${Math.abs(yInt)}`;
        const wrong = [
            `f(x) = ${yInt}x ${slope >= 0 ? '+' : '-'} ${Math.abs(slope)}`,  // Swapped
            `f(x) = ${-slope}x ${yIntSign} ${Math.abs(yInt)}`,  // Wrong slope sign
            `f(x) = ${slope}x ${yInt >= 0 ? '-' : '+'} ${Math.abs(yInt)}`   // Wrong intercept sign
        ];

        const allChoices = this.shuffle([correct, ...wrong]);
        const { choices, answer } = this.labelChoices(allChoices, correct);

        const question =
            `For the linear function ${this.ital("f")}, the graph has a slope of ${slope} ` +
            `and a y-intercept at ${this.math(`(0, ${yInt})`)}. Which equation defines ${this.ital("f")}?`;

        const explanation = this.makeSteps([
            `A linear function with slope m and y-intercept b has the form f(x) = mx + b.`,
            `With slope = ${slope} and y-intercept = ${yInt}:`,
            `${correct}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    /**
     * Word problem: savings/deposits over time
     */
    P.tplSavingsOverTimeEasy = function (original) {
        const initial = this.randomInt(100, 500);
        const deposit = this.randomInt(15, 50);
        const weeks = this.randomInt(3, 8);
        const total = initial + deposit * weeks;

        const vals = this._gridChoices(total, deposit, 4);
        const { choices, answer } = this.labelChoices(vals, total);

        const question =
            `${this.randomChoice(["Maria", "James", "Aisha", "David"])} has $${initial} in a savings account. ` +
            `At the end of each week, $${deposit} is deposited into the account. ` +
            `How much money will be in the account at the end of week ${weeks}?`;

        const explanation = this.makeSteps([
            `Initial amount: $${initial}`,
            `Deposits over ${weeks} weeks: ${weeks} × $${deposit} = $${deposit * weeks}`,
            `Total: $${initial} + $${deposit * weeks} = $${total}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    /**
     * Word problem: linear model interpretation
     */
    P.tplLinearModelEasy = function (original) {
        const rate = this.randomInt(5, 15);
        const initial = this.randomInt(20, 60);
        const xValue = this.randomInt(3, 8);
        const result = initial + rate * xValue;

        const vals = this._gridChoices(result, rate, 4);
        const { choices, answer } = this.labelChoices(vals, result);

        const contexts = [
            {
                setup: `The equation ${this.math(`d = ${initial} + ${rate}t`)} gives the distance d, in miles, that a hiker has traveled after t hours.`,
                question: `What is the distance after ${xValue} hours?`
            },
            {
                setup: `The equation ${this.math(`h = ${initial} + ${rate}w`)} gives the height h, in inches, of a plant after w weeks.`,
                question: `What is the height after ${xValue} weeks?`
            }
        ];
        const ctx = this.randomChoice(contexts);

        const question = `${ctx.setup} ${ctx.question}`;

        const explanation = this.makeSteps([
            `Substitute ${xValue} for the variable:`,
            `${initial} + ${rate}(${xValue}) = ${initial} + ${rate * xValue} = ${result}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    console.log("✅ Linear Functions Easy templates loaded (with clean graph support)");
}