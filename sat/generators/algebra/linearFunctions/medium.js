// sat/generators/algebra/linearFunctions/medium.js
// Linear Functions - Medium - HUMAN-READABLE EXPLANATIONS + MORE VARIETY
// Easy = basic graphs + simple interpretation
// Medium = tables, analysis, graph interpretation, multi-step reasoning

if (!window.ProblemGenerator) {
    console.error("❌ ProblemGenerator not loaded before linearFunctions/medium.js");
} else {
    const P = window.ProblemGenerator.prototype;

    // =========================================================
    // TABLE TEMPLATES
    // =========================================================

    // TEMPLATE 1: Is this a function?
    P.tplTableIsFunctionMedium = function(original) {
        const isFunction = this.randomChoice([true, false]);

        if (isFunction) {
            const m = this.randomInt(2, 5);
            const b = this.randomInt(-8, 8);
            const xValues = this.shuffle([1, 2, 3, 4, 5]).slice(0, 4).sort((a, b) => a - b);
            const rows = xValues.map(x => [x, m * x + b]);

            const table = this.makeTable(['x', 'y'], rows);

            const question = `Does this table represent ${this.ital('y')} as a function of ${this.ital('x')}?<br><br>${table}`;

            const choices = this.labelChoices([
                'Yes, because each input has exactly one output.',
                'No, because the outputs are not all different.',
                'No, because some inputs have multiple outputs.',
                'Yes, because the values increase.'
            ], 'Yes, because each input has exactly one output.');

            const explanation = `This is a function. Each x-value appears exactly once, and each one has a single corresponding y-value. That's what makes it a function - every input has exactly one output.`;

            return this.buildProblem(original, question, choices.choices, choices.answer, explanation);
        } else {
            const xValues = [2, 3, 4, 2];
            const yValues = [5, 8, 11, 7];
            const rows = xValues.map((x, i) => [x, yValues[i]]);

            const table = this.makeTable(['x', 'y'], rows);

            const question = `Does this table represent ${this.ital('y')} as a function of ${this.ital('x')}?<br><br>${table}`;

            const choices = this.labelChoices([
                'Yes, because all values are positive.',
                'No, because one input has two different outputs.',
                'Yes, because each row is different.',
                'No, because the pattern is not consistent.'
            ], 'No, because one input has two different outputs.');

            const explanation = `This is NOT a function. Notice that x = 2 appears twice with different y-values (5 and 7). A function can't have one input produce two different outputs.`;

            return this.buildProblem(original, question, choices.choices, choices.answer, explanation);
        }
    };

    // TEMPLATE 2: Find rate of change from table - FIXED for randomization
    P.tplTableRateOfChangeMedium = function(original) {
        const rate = this.randomInt(3, 8);
        const b = this.randomInt(5, 20);

        // Randomize starting x value
        const x1 = this.randomInt(1, 5);
        const x2 = x1 + this.randomInt(2, 3);
        const x3 = x2 + this.randomInt(2, 3);

        const xValues = [x1, x2, x3];
        const yValues = xValues.map(x => rate * x + b);

        const rows = xValues.map((x, i) => [x, yValues[i]]);
        const table = this.makeTable([this.ital('x'), this.ital('y')], rows);

        const question = `The table shows a linear relationship. What is the rate of change of ${this.ital('y')} with respect to ${this.ital('x')}?<br><br>${table}`;

        // Generate sensible whole number choices around the correct rate
        const wrongChoices = [
            rate - 1,
            rate + 1,
            rate + 2
        ].filter(v => v > 0);

        const allChoices = this.shuffle([rate, ...wrongChoices.slice(0, 3)]);
        const { choices: labeled, answer } = this.labelChoices(allChoices, rate);

        const explanation = `Pick any two points to find the rate of change. From x = ${x1} to x = ${x2}, y changes from ${yValues[0]} to ${yValues[1]}. That's a change of ${yValues[1] - yValues[0]} over ${x2 - x1} units, which gives us ${yValues[1] - yValues[0]}/${x2 - x1} = ${rate}.`;

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // TEMPLATE 3: Complete the table pattern
    P.tplCompleteTablePatternMedium = function(original) {
        const m = this.randomInt(4, 9);
        const b = this.randomInt(-6, 6);

        // ✅ Randomize starting x and which value is hidden
        const xStart = this.randomInt(0, 3);
        const xValues = [xStart, xStart + 1, xStart + 2, xStart + 3];
        const yValues = xValues.map(x => m * x + b);

        const hiddenIndex = this.randomChoice([1, 2]);
        const correctAnswer = yValues[hiddenIndex];

        const rows = xValues.map((x, i) => {
            if (i === hiddenIndex) {
                return [x, '?'];
            }
            return [x, yValues[i]];
        });

        const table = this.makeTable([this.ital('x'), this.ital('y')], rows);

        const question = `What is the missing value in this table?<br><br>${table}`;

        // ✅ Better answer choices - off by slope value or calculation errors
        const wrongChoices = [
            correctAnswer + m,
            correctAnswer - m,
            correctAnswer + 1
        ].filter(v => v !== correctAnswer);

        const allChoices = this.shuffle([correctAnswer, ...wrongChoices.slice(0, 3)]);
        const { choices: labeled, answer } = this.labelChoices(allChoices, correctAnswer);

        const explanation = `Look at the pattern: every time x increases by 1, y increases by ${m}. When x = ${xValues[0]}, y = ${yValues[0]}. So when x = ${xValues[hiddenIndex]}, we go up ${m} × ${hiddenIndex} = ${m * hiddenIndex}, giving us ${yValues[0]} + ${m * hiddenIndex} = ${correctAnswer}.`;

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // TEMPLATE 4: Which point satisfies the relationship?
    P.tplWhichPointSatisfiesMedium = function(original) {
        const m = this.randomInt(2, 6);
        const b = this.randomInt(-5, 10);

        const x1 = this.randomInt(1, 3);
        const x2 = x1 + this.randomInt(2, 3);

        const y1 = m * x1 + b;
        const y2 = m * x2 + b;

        const rows = [[x1, y1], [x2, y2]];
        const table = this.makeTable([this.ital('x'), this.ital('y')], rows);

        const xTest = x2 + this.randomInt(2, 3);
        const yCorrect = m * xTest + b;

        const correctPoint = `(${xTest}, ${yCorrect})`;
        const wrongPoints = [
            `(${xTest}, ${yCorrect + m})`,
            `(${xTest}, ${yCorrect - m})`,
            `(${xTest + 1}, ${yCorrect})`
        ];

        const allChoices = this.shuffle([correctPoint, ...wrongPoints]);
        const { choices, answer } = this.labelChoices(allChoices, correctPoint);

        const question = `Which point also fits the linear relationship shown in this table?<br><br>${table}`;

        const explanation = `The pattern increases by ${m} every time x increases by 1. From the table, we can figure out the equation is y = ${m}x + ${b}. Testing (${xTest}, ${yCorrect}): does ${yCorrect} = ${m}(${xTest}) + ${b}? Yes, it equals ${m * xTest + b}, so this point works.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // TEMPLATE 5: Find equation from table
    P.tplTableToEquationMedium = function(original) {
        const m = this.randomInt(2, 6);
        const b = this.randomInt(-10, 10);

        const xValues = [0, 1, 2];
        const yValues = xValues.map(x => m * x + b);

        const table = this.makeTable([this.ital('x'), this.ital('y')],
            xValues.map((x, i) => [x, yValues[i]]));

        const signB = b >= 0 ? '+' : '';
        const correctEq = `y = ${m}x ${signB} ${b}`;

        const wrongEqs = [
            `y = ${m + 1}x ${signB} ${b}`,
            `y = ${m}x ${b >= 0 ? '+' : ''} ${b + 2}`,
            `y = ${m - 1}x ${signB} ${b - 1}`
        ];

        const allChoices = this.shuffle([correctEq, ...wrongEqs]);
        const { choices, answer } = this.labelChoices(allChoices, correctEq);

        const question = `Which equation represents the relationship in this table?<br><br>${table}`;

        const explanation = `When x = 0, y = ${b}, so that's our y-intercept. Every time x increases by 1, y increases by ${m}, so that's our slope. Put them together: ${correctEq}.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // TEMPLATE 6: Context - fixed cost from table
    P.tplTableFixedCostMedium = function(original) {
        // ✅ More variety in pricing
        const fixed = this.randomChoice([20, 25, 30, 35, 40, 50, 60, 75]);
        const perUnit = this.randomChoice([5, 10, 15, 20, 25, 30]);

        // ✅ Randomize number of items shown
        const numItems = this.randomChoice([3, 4]);
        const units = Array.from({length: numItems}, (_, i) => i + 1);
        const costs = units.map(u => fixed + perUnit * u);

        const table = this.makeTable(['Items', 'Total Cost ($)'],
            units.map((u, i) => [u, costs[i]]));

        const question = `A company charges a fixed setup fee plus a per-item cost. What is the setup fee in dollars?<br><br>${table}`;

        // ✅ Better wrong answers based on common errors
        const wrongChoices = [
            costs[0],              // Mistaking first total for setup fee
            perUnit,               // Confusing per-unit with fixed
            fixed + perUnit        // Adding one extra unit
        ].filter(v => v !== fixed);

        const allChoices = this.shuffle([fixed, ...wrongChoices.slice(0, 3)]);
        const { choices: labeled, answer } = this.labelChoices(allChoices, fixed);

        const explanation = `The cost increases by $${perUnit} each time we add an item. For 1 item, the total is $${costs[0]}. That's the setup fee ($${fixed}) plus one item ($${perUnit}), so the setup fee is $${costs[0]} - $${perUnit} = $${fixed}.`;

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // TEMPLATE 7: Given table, find f(k) for new k
    P.tplTableEvaluateNewMedium = function(original) {
        const m = this.randomInt(3, 7);
        const b = this.randomInt(-8, 12);

        // ✅ Add variety to x values shown
        const startX = this.randomChoice([1, 2, 3]);
        const spacing = this.randomChoice([1, 2]);
        const xValues = [startX, startX + spacing, startX + 2 * spacing];
        const yValues = xValues.map(x => m * x + b);

        const table = this.makeTable([this.ital('x'), this.ital('f(x)')],
            xValues.map((x, i) => [x, yValues[i]]));

        const xNew = this.randomInt(8, 12);
        const correctAnswer = m * xNew + b;

        const question = `The table shows values for the linear function ${this.ital('f')}. What is ${this.math(`f(${xNew})`)}?<br><br>${table}`;

        // ✅ Better wrong answers based on common calculation errors
        const wrongChoices = [
            correctAnswer + m,     // Off by one slope unit
            correctAnswer - m,     // Off by one slope unit (opposite direction)
            m * (xNew - 1) + b     // Used wrong x value
        ].filter(v => v !== correctAnswer);

        const allChoices = this.shuffle([correctAnswer, ...wrongChoices.slice(0, 3)]);
        const { choices: labeled, answer } = this.labelChoices(allChoices, correctAnswer);

        const explanation = `From the table, when x increases by ${spacing}, f(x) increases by ${yValues[1] - yValues[0]}. That means the rate is ${m} per unit. The pattern is f(x) = ${m}x + ${b}. So f(${xNew}) = ${m}(${xNew}) + ${b} = ${correctAnswer}.`;

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // TEMPLATE 8: Unit conversion table - FIXED for randomization and clean choices
    P.tplTableUnitConversionMedium = function(original) {
        const perHour = this.randomChoice([2, 3, 4, 5, 6]); // Whole numbers only

        // Randomize starting time (5, 10, or 15 minutes)
        const startTime = this.randomChoice([5, 10, 15]);
        const times = [startTime, startTime * 2, startTime * 3];
        const distances = times.map(t => perHour * (t / 60));

        const table = this.makeTable(['Time (min)', 'Distance (mi)'],
            times.map((t, i) => [t, distances[i].toFixed(2)]));

        const question = `A car travels at constant speed. What is the speed in miles per hour?<br><br>${table}`;

        // Generate sensible whole number choices
        const wrongChoices = [
            perHour - 1,
            perHour + 1,
            perHour + 2
        ].filter(v => v > 0);

        const allChoices = this.shuffle([perHour, ...wrongChoices.slice(0, 3)]);
        const { choices: labeled, answer } = this.labelChoices(allChoices, perHour);

        const explanation = `In ${startTime} minutes, the car goes ${distances[0].toFixed(2)} miles. There are ${60/startTime} periods of ${startTime} minutes in an hour, so multiply by ${60/startTime}: ${distances[0].toFixed(2)} × ${60/startTime} = ${perHour} miles per hour.`;

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // =========================================================
    // GRAPH INTERPRETATION TEMPLATES (MEDIUM LEVEL)
    // =========================================================

    // TEMPLATE 9: Positive or negative slope?
    P.tplGraphSlopeSignMedium = function(original) {
        const isPositive = this.randomChoice([true, false]);
        const m = isPositive ? this.randomInt(2, 5) : -this.randomInt(2, 5);
        const b = this.randomInt(-10, 10);

        const xMax = 8;
        const yMax = Math.max(Math.abs(m * xMax + b), Math.abs(b)) + 10;
        const yMin = Math.min(-10, m * xMax + b - 10);

        // ✅ Calculate appropriate y-tick value based on range
        const yRange = yMax - yMin;
        let yTick;
        if (yRange > 80) {
            yTick = 20;  // Large range: tick every 20
        } else if (yRange > 40) {
            yTick = 10;  // Medium range: tick every 10
        } else {
            yTick = 5;   // Small range: tick every 5
        }

        const graph = this._generateLinearGraphSVG({
            slope: m,
            yIntercept: b,
            xMin: -2,
            xMax: xMax,
            yMin: yMin,
            yMax: yMax,
            xTick: 1,
            yTick: yTick,  // ✅ Now uses calculated tick value
            xLabel: 'x',
            yLabel: 'y'
        });

        const question = `Look at the graph of this linear function. Is the slope positive or negative?<br><br>${graph}`;

        const correct = isPositive ?
            'Positive, because the line goes up from left to right.' :
            'Negative, because the line goes down from left to right.';

        const wrong = isPositive ? [
            'Negative, because the line crosses the x-axis.',
            'Negative, because some y-values are negative.',
            'Positive, because the y-intercept is positive.'
        ] : [
            'Positive, because the line crosses both axes.',
            'Positive, because some x-values are positive.',
            'Negative, because the y-intercept is negative.'
        ];

        const allChoices = this.shuffle([correct, ...wrong]);
        const { choices, answer } = this.labelChoices(allChoices, correct);

        const explanation = isPositive ?
            `The slope is positive. As you move from left to right along the line, it rises upward. That always means a positive slope.` :
            `The slope is negative. As you move from left to right along the line, it falls downward. That always means a negative slope.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // TEMPLATE 10: Compare steepness of two slopes
    P.tplGraphCompareSteepnessMedium = function(original) {
        const m1 = this.randomInt(2, 4);
        const m2 = this.randomInt(5, 8);

        const b1 = this.randomInt(-5, 5);
        const b2 = this.randomInt(-5, 5);

        const xMax = 6;
        const yMax = Math.max(m1 * xMax + b1, m2 * xMax + b2) + 5;

        // ✅ Calculate appropriate y-tick value
        const yRange = yMax;  // yMin is 0
        let yTick;
        if (yRange > 60) {
            yTick = 10;
        } else {
            yTick = 5;
        }

        const graph1 = this._generateLinearGraphSVG({
            slope: m1, yIntercept: b1,
            xMin: 0, xMax, yMin: 0, yMax,
            xTick: 1, yTick: yTick,  // ✅ Dynamic tick value
            xLabel: 'x', yLabel: 'y',
            title: 'Line A'
        });

        const graph2 = this._generateLinearGraphSVG({
            slope: m2, yIntercept: b2,
            xMin: 0, xMax, yMin: 0, yMax,
            xTick: 1, yTick: yTick,  // ✅ Dynamic tick value
            xLabel: 'x', yLabel: 'y',
            title: 'Line B'
        });

        const question = `Which line has the steeper slope?<br><br>${graph1}<br><br>${graph2}`;

        const choices = this.labelChoices([
            'Line A is steeper.',
            'Line B is steeper.',
            'They have the same steepness.',
            'Cannot be determined from the graphs.'
        ], 'Line B is steeper.');

        const explanation = `Line B is steeper. It rises faster - for every 1 unit to the right, Line B goes up ${m2} units while Line A only goes up ${m1} units. The bigger the slope number, the steeper the line.`;

        return this.buildProblem(original, question, choices.choices, choices.answer, explanation);
    };

    // TEMPLATE 11: Interpret negative slope in context - FIXED for clarity
    P.tplGraphNegativeSlopeContextMedium = function(original) {
        const rate = this.randomInt(4, 10);

        // ✅ Use clean multiples for initial value
        const yTick = rate * 2; // Make tick a multiple of rate for clean reading
        const initial = rate * this.randomInt(8, 12); // Clean initial value

        const xMax = Math.ceil(initial / rate) + 1;
        const yMax = initial + yTick;

        const graph = this._generateLinearGraphSVG({
            slope: -rate,
            yIntercept: initial,
            xMin: 0,
            xMax: xMax,
            yMin: 0,
            yMax: yMax,
            xTick: 1,
            yTick: yTick,
            xLabel: 'Hours',
            yLabel: 'Gallons remaining',
            title: 'Water Tank'
        });

        const question = `This graph shows the amount of water remaining in a tank over time. What does the negative slope tell us?<br><br>${graph}`;

        const choices = this.labelChoices([
            `Water is draining out at ${rate} gallons per hour.`,
            `The tank started with ${rate} gallons.`,
            `Water is being added at ${rate} gallons per hour.`,
            `The tank will be empty in ${rate} hours.`
        ], `Water is draining out at ${rate} gallons per hour.`);

        const explanation = `The negative slope means the water level is decreasing over time - it's going down by ${rate} gallons every hour. A negative slope in a real-world problem usually means something is decreasing, emptying, or slowing down.`;

        return this.buildProblem(original, question, choices.choices, choices.answer, explanation);
    };

    // TEMPLATE 12: Where does the line cross zero? - FIXED for graph clarity
    P.tplGraphCrossZeroMedium = function(original) {
        // ✅ Make x-intercept land on a whole number
        const xIntercept = this.randomInt(4, 9);
        const rate = this.randomInt(3, 7);
        const initial = rate * xIntercept; // Ensures clean crossing point

        const xMax = xIntercept + 3;
        const yTick = Math.max(5, Math.floor(initial / 5)); // Clean y-tick values
        const yMax = initial + yTick;

        const graph = this._generateLinearGraphSVG({
            slope: -rate,
            yIntercept: initial,
            xMin: 0,
            xMax: xMax,
            yMin: 0,
            yMax: yMax,
            xTick: 1,
            yTick: yTick,
            xLabel: 'Minutes',
            yLabel: 'Temperature (°C)',
            title: 'Cooling Process'
        });

        const question = `This graph shows temperature decreasing over time. After how many minutes will the temperature reach 0°C?<br><br>${graph}`;

        // ✅ Answer choices clearly separated
        const wrongAnswers = [
            xIntercept + 1,
            xIntercept - 1,
            xIntercept + 2
        ].filter(v => v > 0 && v !== xIntercept);

        const allChoices = this.shuffle([xIntercept, ...wrongAnswers.slice(0, 3)]);
        const { choices, answer } = this.labelChoices(allChoices, xIntercept);

        const explanation = `The line crosses the x-axis (reaches 0°C) at exactly ${xIntercept} minutes. You can see this is where the line meets the horizontal axis on a clean gridline.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // TEMPLATE 13: Initial value interpretation - FIXED for graph clarity
    P.tplGraphInitialValueMedium = function(original) {
        // ✅ Use clean tick values for easy reading
        const yTick = this.randomChoice([10, 20, 25, 50]);

        // ✅ Make initial value land exactly on a grid line
        const tickMultiplier = this.randomInt(2, 5);
        const initial = yTick * tickMultiplier; // Always lands on a grid line

        const rate = this.randomInt(3, 12);

        const xMax = 10;
        const yMax = initial + rate * xMax + yTick;

        const graph = this._generateLinearGraphSVG({
            slope: rate,
            yIntercept: initial,
            xMin: 0,
            xMax: xMax,
            yMin: 0,
            yMax: yMax,
            xTick: 1,
            yTick: yTick,
            xLabel: 'Days',
            yLabel: 'Account Balance ($)',
            title: 'Savings Account'
        });

        // ✅ Answer choices differ by full tick marks - clearly distinguishable
        const wrongAnswers = [
            initial + yTick,      // One tick above
            initial - yTick,      // One tick below  
            initial + yTick * 2   // Two ticks above
        ].filter(v => v > 0);

        const allChoices = this.shuffle([initial, ...wrongAnswers.slice(0, 3)]);
        const { choices, answer } = this.labelChoices(allChoices, initial);

        const question = `This graph shows a savings account balance over time. What was the initial deposit?<br><br>${graph}`;

        const explanation = `The initial deposit is where the line crosses the y-axis at day 0. The y-intercept lands exactly on the $${initial} gridline. That's how much was in the account at the start.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // =========================================================
    // MULTI-STEP REASONING TEMPLATES
    // =========================================================

    // TEMPLATE 14: Perpendicular slope (convert form first)
    P.tplPerpSlopeConvertMedium = function(original) {
        const a = this.randomInt(2, 6);
        const b = this.randomInt(2, 7);
        const c = this.randomInt(5, 20);

        if (a === b) return null;

        const correctAnswer = b / a;

        // ✅ Format as HTML fraction, not LaTeX
        const formatAnswer = (numerator, denominator) => {
            if (numerator === denominator) return `1`;
            if (numerator % denominator === 0) return `${numerator / denominator}`;
            // Use HTML sup/sub for fractions
            return `<sup>${numerator}</sup>&frasl;<sub>${denominator}</sub>`;
        };

        const question = `Line ${this.ital('ℓ')} is defined by ${this.math(`${a}x + ${b}y = ${c}`)}. Line ${this.ital('k')} is perpendicular to line ${this.ital('ℓ')}. What is the slope of line ${this.ital('k')}?`;

        // Generate wrong answers with proper fractions
        const wrongAnswers = [
            { num: -a, den: b, display: formatAnswer(-a, b) },
            { num: a, den: b, display: formatAnswer(a, b) },
            { num: -b, den: a, display: formatAnswer(-b, a) }
        ];

        const correctChoice = { num: b, den: a, value: correctAnswer, display: formatAnswer(b, a) };

        // Remove duplicates and filter out the correct answer
        const uniqueWrong = wrongAnswers.filter(w =>
            w.num / w.den !== correctAnswer
        ).slice(0, 3);

        const allChoices = this.shuffle([correctChoice, ...uniqueWrong]);
        const correctIndex = allChoices.findIndex(c => c === correctChoice);

        const labeled = allChoices.map((choice, idx) => {
            const letter = String.fromCharCode(65 + idx);
            return `${letter}) ${choice.display}`;
        });

        const answerLetter = String.fromCharCode(65 + correctIndex);

        const explanation = `First, rewrite the equation in y = mx + b form. Solving for y: ${b}y = -${a}x + ${c}, so y = ${formatAnswer(-a, b)}x + ${formatAnswer(c, b)}. The slope of line ℓ is ${formatAnswer(-a, b)}. Perpendicular lines have slopes that are negative reciprocals, so flip it and change the sign: ${formatAnswer(b, a)}.`;

        return this.buildProblem(original, question, labeled, answerLetter, explanation);
    };

    // TEMPLATE 15: Given two points, find f(k)
    P.tplTwoPointsEvaluateMedium = function(original) {
        const m = this.randomInt(2, 5);
        const b = this.randomInt(-5, 10);

        const x1 = this.randomInt(1, 4);
        const x2 = x1 + this.randomInt(2, 4);
        const xNew = x2 + this.randomInt(3, 5);

        const y1 = m * x1 + b;
        const y2 = m * x2 + b;
        const correctAnswer = m * xNew + b;

        const funcName = this.randomChoice(['f', 'g', 'h']);

        const question = `For the linear function ${this.ital(funcName)}, ${this.math(`${funcName}(${x1}) = ${y1}`)} and ${this.math(`${funcName}(${x2}) = ${y2}`)}. What is ${this.math(`${funcName}(${xNew})`)}?`;

        // ✅ Better wrong answers based on common errors
        const wrongChoices = [
            m * xNew,              // Forgot to add b
            correctAnswer + m,     // Off by slope
            correctAnswer - m      // Off by slope (other direction)
        ].filter(v => v !== correctAnswer);

        const allChoices = this.shuffle([correctAnswer, ...wrongChoices.slice(0, 3)]);
        const { choices: labeled, answer } = this.labelChoices(allChoices, correctAnswer);

        const explanation = `First find the slope: going from x = ${x1} to x = ${x2} (up by ${x2-x1}), y goes from ${y1} to ${y2} (up by ${y2-y1}). So the slope is ${m}. Using the point (${x1}, ${y1}): ${y1} = ${m}(${x1}) + b, so b = ${b}. Now we know ${funcName}(x) = ${m}x + ${b}. Therefore ${funcName}(${xNew}) = ${m}(${xNew}) + ${b} = ${correctAnswer}.`;

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // TEMPLATE 16: Find parameter from condition
    P.tplFindParameterMedium = function(original) {
        const m = this.randomInt(2, 6);
        const xGiven = this.randomInt(2, 5);
        const yGiven = this.randomInt(10, 25);

        const b = yGiven - m * xGiven;

        const funcName = this.randomChoice(['f', 'g', 'h']);

        const question = `The function ${this.ital(funcName)} is defined by ${this.math(`${funcName}(x) = mx + ${b}`)}, where ${this.ital('m')} is a constant. If ${this.math(`${funcName}(${xGiven}) = ${yGiven}`)}, what is ${this.ital('m')}?`;

        // ✅ Better wrong answers - common algebraic mistakes
        const wrongChoices = [
            m + 1,                          // Off by one
            m - 1,                          // Off by one
            Math.floor(yGiven / xGiven)     // Forgot to account for b
        ].filter(v => v > 0 && v !== m);

        const allChoices = this.shuffle([m, ...wrongChoices.slice(0, 3)]);
        const { choices: labeled, answer } = this.labelChoices(allChoices, m);

        const explanation = `Plug in what we know: ${yGiven} = m(${xGiven}) + ${b}. Simplify: ${yGiven} = ${xGiven}m + ${b}. Solve for m: ${xGiven}m = ${yGiven - b}, so m = ${m}.`;

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // TEMPLATE 17: Real-world rate interpretation
    P.tplRealWorldRateMedium = function(original) {
        const rate = this.randomInt(40, 80);
        const initial = this.randomInt(20, 50);
        const time = this.randomInt(3, 6);
        const distance = initial + rate * time;

        const question = `A train is ${initial} miles from its destination. It travels toward the destination at ${rate} miles per hour. After ${time} hours, how far has the train traveled in total?`;

        const correctAnswer = rate * time;

        // ✅ Better wrong answers - common misunderstandings
        const wrongChoices = [
            distance,                      // Added initial distance (wrong interpretation)
            initial - correctAnswer,       // Distance from destination (misread question)
            rate * (time + 1)             // Off by one hour
        ].filter(v => v > 0 && v !== correctAnswer);

        const allChoices = this.shuffle([correctAnswer, ...wrongChoices.slice(0, 3)]);
        const { choices: labeled, answer } = this.labelChoices(allChoices, correctAnswer);

        const explanation = `In ${time} hours at ${rate} mph, the train covers ${rate} × ${time} = ${correctAnswer} miles. Watch out - the question asks how far it traveled, not how far from the destination (which would be ${initial} - ${correctAnswer} = ${initial - correctAnswer} miles).`;

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // TEMPLATE 18: Decreasing linear pattern
    P.tplDecreasingPatternMedium = function(original) {
        const decrease = this.randomInt(5, 12);
        const start = this.randomInt(80, 120);
        const steps = this.randomInt(4, 7);

        const final = start - decrease * steps;

        const question = `A water tank starts with ${start} gallons. Every hour, ${decrease} gallons drain out. How many gallons remain after ${steps} hours?`;

        // ✅ Better wrong answers - common calculation errors
        const wrongChoices = [
            start - decrease,              // Only subtracted once
            final + decrease,              // Off by one step
            final - decrease,              // Off by one step (other direction)
            decrease * steps               // Gave amount lost instead of remaining
        ].filter(v => v > 0 && v !== final);

        const allChoices = this.shuffle([final, ...wrongChoices.slice(0, 3)]);
        const { choices: labeled, answer } = this.labelChoices(allChoices, final);

        const explanation = `Start with ${start} gallons. After ${steps} hours, we've lost ${decrease} × ${steps} = ${decrease * steps} gallons. Remaining: ${start} - ${decrease * steps} = ${final} gallons.`;

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    console.log("✅ Linear Functions Medium templates loaded:");
    console.log("   • 9 table-based templates");
    console.log("   • 5 graph interpretation templates");
    console.log("   • 4 multi-step reasoning templates");
    console.log("   • Total: 18 templates with human-readable explanations");
}