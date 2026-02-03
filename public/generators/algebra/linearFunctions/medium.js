// public/generators/algebra/linearFunctions/medium.js
// Linear Functions - Medium - FULL VARIETY, NO PREDICTABILITY
// Every template: randomized outcomes, multiple contexts, distinct from easy

if (!window.ProblemGenerator) {
    console.error("❌ ProblemGenerator not loaded before linearFunctions/medium.js");
} else {
    const P = window.ProblemGenerator.prototype;

    // =========================================================
    // TABLE TEMPLATES
    // =========================================================

    // TEMPLATE 1: Is this a function?
    // FIX: Non-function case now fully randomized — duplicate x, distinct y-values
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

            const explanation = `A function requires every input to have exactly one output. Each x-value in this table appears only once, so there is no conflict — it passes the vertical line test. This is a function.`;

            return this.buildProblem(original, question, choices.choices, choices.answer, explanation);
        } else {
            // Pick a random x-value to duplicate, build distinct other x's around it
            const dupX = this.randomInt(1, 6);
            const otherXs = [];
            while (otherXs.length < 2) {
                const candidate = this.randomInt(1, 8);
                if (candidate !== dupX && !otherXs.includes(candidate)) otherXs.push(candidate);
            }
            // Two different y-values for the duplicate x
            const y1 = this.randomInt(2, 15);
            let y2 = this.randomInt(2, 15);
            while (y2 === y1) y2 = this.randomInt(2, 15);

            // Build rows: dupX appears in position 0 and 3 (shuffled feel)
            const rows = [
                [dupX, y1],
                [otherXs[0], this.randomInt(3, 18)],
                [otherXs[1], this.randomInt(3, 18)],
                [dupX, y2]
            ];

            const table = this.makeTable(['x', 'y'], rows);

            const question = `Does this table represent ${this.ital('y')} as a function of ${this.ital('x')}?<br><br>${table}`;

            const choices = this.labelChoices([
                'Yes, because all values are positive.',
                'No, because one input has two different outputs.',
                'Yes, because each row is different.',
                'No, because the pattern is not consistent.'
            ], 'No, because one input has two different outputs.');

            const explanation = `This is NOT a function. The input x = ${dupX} appears twice, but it maps to two different outputs: ${y1} and ${y2}. A function cannot send the same input to two different outputs.`;

            return this.buildProblem(original, question, choices.choices, choices.answer, explanation);
        }
    };

    // TEMPLATE 2: Find rate of change from table — with real-world context
    // FIX: Added 5 distinct contexts, wrong answers based on real calculation errors
    P.tplTableRateOfChangeMedium = function(original) {
        const contexts = [
            { xLabel: 'Hours Driven', yLabel: 'Miles Traveled', intro: 'A delivery driver logs miles over several hours.', rateName: 'rate of change in miles per hour' },
            { xLabel: 'Days',         yLabel: 'Books Read',     intro: 'A student tracks books read over several days.',   rateName: 'rate of change in books per day' },
            { xLabel: 'Minutes',      yLabel: 'Calories Burned',intro: 'A runner burns calories at a steady pace.',        rateName: 'rate of change in calories per minute' },
            { xLabel: 'Weeks',        yLabel: 'Plants Grown',   intro: 'A gardener tracks how many plants have sprouted.', rateName: 'rate of change in plants per week' },
            { xLabel: 'Hours',        yLabel: 'Tickets Sold',   intro: 'A box office sells tickets at a constant rate.',  rateName: 'rate of change in tickets per hour' }
        ];
        const ctx = this.randomChoice(contexts);

        const rate = this.randomInt(3, 12);
        const b = this.randomInt(0, 20);
        const x1 = this.randomInt(1, 5);
        const gap1 = this.randomChoice([2, 3]);
        const gap2 = this.randomChoice([2, 3]);
        const x2 = x1 + gap1;
        const x3 = x2 + gap2;

        const xValues = [x1, x2, x3];
        const yValues = xValues.map(x => rate * x + b);
        const rows = xValues.map((x, i) => [x, yValues[i]]);
        const table = this.makeTable([ctx.xLabel, ctx.yLabel], rows);

        const question = `${ctx.intro}<br><br>${table}<br><br>What is the ${ctx.rateName}?`;

        // Wrong answers: total change (not divided), reversed division, a y-value mistaken for rate
        const totalChange = yValues[1] - yValues[0];
        const wrongA = totalChange;                          // forgot to divide by gap
        const wrongB = rate + this.randomChoice([-2, -1, 1, 2]); // close but off
        const wrongC = yValues[0];                           // mistook first y for the rate

        const allChoices = this.shuffle([rate, wrongA, wrongB, wrongC].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4));
        // Ensure we have 4 distinct choices
        while (allChoices.length < 4) allChoices.push(rate + allChoices.length * 3);
        const { choices: labeled, answer } = this.labelChoices(allChoices.slice(0, 4), rate);

        const explanation = `Rate of change = (change in ${ctx.yLabel.toLowerCase()}) ÷ (change in ${ctx.xLabel.toLowerCase()}). From ${ctx.xLabel.toLowerCase()} = ${x1} to ${x2}, ${ctx.yLabel.toLowerCase()} goes from ${yValues[0]} to ${yValues[1]}. That's a change of ${yValues[1] - yValues[0]} over ${gap1}, so the rate is ${yValues[1] - yValues[0]} ÷ ${gap1} = ${rate}.`;

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // TEMPLATE 3: Complete the table pattern
    P.tplCompleteTablePatternMedium = function(original) {
        const m = this.randomInt(3, 9);
        const b = this.randomInt(-6, 10);
        const xStart = this.randomInt(0, 4);
        const xValues = [xStart, xStart + 1, xStart + 2, xStart + 3];
        const yValues = xValues.map(x => m * x + b);

        const hiddenIndex = this.randomChoice([1, 2]);
        const correctAnswer = yValues[hiddenIndex];

        const rows = xValues.map((x, i) => [x, i === hiddenIndex ? '?' : yValues[i]]);
        const table = this.makeTable([this.ital('x'), this.ital('y')], rows);

        const question = `The table below shows a linear pattern. What value belongs in place of the question mark?<br><br>${table}`;

        const wrongChoices = [
            correctAnswer + m,
            correctAnswer - m,
            correctAnswer + 1
        ].filter(v => v !== correctAnswer);

        const allChoices = this.shuffle([correctAnswer, ...wrongChoices.slice(0, 3)]);
        const { choices: labeled, answer } = this.labelChoices(allChoices, correctAnswer);

        // Explanation: use the row just before the hidden one for clarity
        const prevIndex = hiddenIndex - 1;
        const explanation = `Each time x goes up by 1, y goes up by ${m}. At x = ${xValues[prevIndex]}, y = ${yValues[prevIndex]}. So at x = ${xValues[hiddenIndex]}, y = ${yValues[prevIndex]} + ${m} = ${correctAnswer}.`;

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

        const xTest = x2 + this.randomInt(2, 4);
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

        const explanation = `First find the slope: from x = ${x1} to x = ${x2} (up ${x2 - x1}), y goes from ${y1} to ${y2} (up ${y2 - y1}). Slope = ${y2 - y1} ÷ ${x2 - x1} = ${m}. Using point (${x1}, ${y1}): b = ${y1} − ${m}(${x1}) = ${b}. So y = ${m}x + ${b}. At x = ${xTest}: y = ${m}(${xTest}) + ${b} = ${yCorrect}. The point (${xTest}, ${yCorrect}) fits.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // TEMPLATE 5: Find equation from table — with context, non-zero start x
    // FIX: Randomized starting x, wrapped in real-world context so it's distinct from easy
    P.tplTableToEquationMedium = function(original) {
        const contexts = [
            { xLabel: 'Hours', yLabel: 'Total Pay ($)', varName: 'h', resultVar: 'P', intro: 'A part-time worker earns pay based on hours worked.' },
            { xLabel: 'Months', yLabel: 'Balance ($)',   varName: 'm', resultVar: 'B', intro: 'A phone plan has a monthly charge added to a starting balance.' },
            { xLabel: 'Days',   yLabel: 'Distance (mi)', varName: 'd', resultVar: 'D', intro: 'A hiker covers a fixed distance each day starting from a base camp.' },
            { xLabel: 'Weeks',  yLabel: 'Weight (lbs)',  varName: 'w', resultVar: 'W', intro: 'A growing puppy gains a steady amount of weight each week.' }
        ];
        const ctx = this.randomChoice(contexts);

        const m = this.randomInt(2, 8);
        const b = this.randomInt(5, 30);
        // Start from a non-zero x so student can't just read b from row 1
        const xStart = this.randomInt(1, 4);
        const xValues = [xStart, xStart + 1, xStart + 2];
        const yValues = xValues.map(x => m * x + b);

        const table = this.makeTable([ctx.xLabel, ctx.yLabel],
            xValues.map((x, i) => [x, yValues[i]]));

        const bSign = b >= 0 ? '+' : '';
        const correctEq = `${ctx.resultVar} = ${m}${ctx.varName} ${bSign} ${b}`;
        const wrongEqs = [
            `${ctx.resultVar} = ${m + 1}${ctx.varName} ${bSign} ${b}`,         // slope off by 1
            `${ctx.resultVar} = ${m}${ctx.varName} ${bSign} ${b + m}`,         // intercept = first y-value (common error when x≠0)
            `${ctx.resultVar} = ${m}${ctx.varName} ${bSign} ${yValues[0]}`     // used first y as intercept
        ];

        const allChoices = this.shuffle([correctEq, ...wrongEqs]);
        const { choices, answer } = this.labelChoices(allChoices, correctEq);

        const question = `${ctx.intro}<br><br>${table}<br><br>Which equation represents this relationship?`;

        const explanation = `The slope is the change in ${ctx.yLabel.toLowerCase()} per unit of ${ctx.xLabel.toLowerCase()}. From ${ctx.xLabel.toLowerCase()} = ${xValues[0]} to ${xValues[1]}, the value changes by ${yValues[1]} − ${yValues[0]} = ${m}. To find the starting value (when ${ctx.varName} = 0), work backward: ${yValues[0]} − ${m}(${xValues[0]}) = ${yValues[0]} − ${m * xValues[0]} = ${b}. So the equation is ${correctEq}.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // TEMPLATE 6: Context - fixed cost from table
    P.tplTableFixedCostMedium = function(original) {
        const contexts = [
            { name: 'A car rental company',  itemLabel: 'Days Rented', costLabel: 'Total Cost ($)', itemWord: 'day' },
            { name: 'A gym',                 itemLabel: 'Classes',     costLabel: 'Total Cost ($)', itemWord: 'class' },
            { name: 'A tutoring service',    itemLabel: 'Sessions',    costLabel: 'Total Cost ($)', itemWord: 'session' },
            { name: 'A printing shop',       itemLabel: 'Pages',       costLabel: 'Total Cost ($)', itemWord: 'page' },
            { name: 'A catering company',    itemLabel: 'Guests',      costLabel: 'Total Cost ($)', itemWord: 'guest' }
        ];
        const ctx = this.randomChoice(contexts);

        const fixed = this.randomChoice([15, 20, 25, 30, 35, 40, 50, 60, 75]);
        const perUnit = this.randomChoice([5, 8, 10, 12, 15, 20, 25]);

        const startUnit = this.randomChoice([1, 2, 3]);
        const numRows = this.randomChoice([3, 4]);
        const units = Array.from({length: numRows}, (_, i) => startUnit + i);
        const costs = units.map(u => fixed + perUnit * u);

        const table = this.makeTable([ctx.itemLabel, ctx.costLabel],
            units.map((u, i) => [u, costs[i]]));

        const question = `${ctx.name} charges a fixed setup fee plus a per-${ctx.itemWord} cost. What is the setup fee?<br><br>${table}`;

        const wrongChoices = [
            costs[0],                   // first total cost (forgot to subtract)
            perUnit,                    // confused per-unit with fixed
            fixed + perUnit * startUnit // first total, same as costs[0] when startUnit=1
        ].filter(v => v !== fixed);

        const uniqueWrong = [...new Set(wrongChoices)].slice(0, 3);
        const allChoices = this.shuffle([fixed, ...uniqueWrong]);
        while (allChoices.length < 4) allChoices.push(fixed + (allChoices.length * 7));
        const { choices: labeled, answer } = this.labelChoices(allChoices.slice(0, 4), fixed);

        const explanation = `The cost goes up by $${perUnit} for each additional ${ctx.itemWord}. For ${units[0]} ${ctx.itemWord}${units[0] !== 1 ? 's' : ''}, the total is $${costs[0]}. That's the setup fee plus ${units[0]} × $${perUnit} = $${perUnit * units[0]}. So the setup fee is $${costs[0]} − $${perUnit * units[0]} = $${fixed}.`;

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // TEMPLATE 7: Given table, find f(k) for a new k — requires finding the equation first
    P.tplTableEvaluateNewMedium = function(original) {
        const m = this.randomInt(3, 8);
        const b = this.randomInt(-8, 15);
        const startX = this.randomChoice([1, 2, 3]);
        const spacing = this.randomChoice([1, 2]);
        const xValues = [startX, startX + spacing, startX + 2 * spacing];
        const yValues = xValues.map(x => m * x + b);

        const table = this.makeTable([this.ital('x'), this.ital('f(x)')],
            xValues.map((x, i) => [x, yValues[i]]));

        // Pick a new x well outside the table range
        const xNew = xValues[xValues.length - 1] + this.randomInt(3, 7);
        const correctAnswer = m * xNew + b;

        const question = `The table shows values for the linear function ${this.ital('f')}. What is ${this.math(`f(${xNew})`)}?<br><br>${table}`;

        const wrongChoices = [
            correctAnswer + m,
            correctAnswer - m,
            m * xNew          // forgot to add b
        ].filter(v => v !== correctAnswer);

        const allChoices = this.shuffle([correctAnswer, ...wrongChoices.slice(0, 3)]);
        const { choices: labeled, answer } = this.labelChoices(allChoices, correctAnswer);

        const explanation = `From x = ${xValues[0]} to x = ${xValues[1]}, f(x) changes from ${yValues[0]} to ${yValues[1]} — a change of ${yValues[1] - yValues[0]} over ${spacing}. So the slope is ${m}. To find b: ${yValues[0]} = ${m}(${xValues[0]}) + b, so b = ${yValues[0]} − ${m * xValues[0]} = ${b}. Now plug in: f(${xNew}) = ${m}(${xNew}) + ${b} = ${m * xNew} + ${b} = ${correctAnswer}.`;

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // TEMPLATE 8: Unit conversion table
    P.tplTableUnitConversionMedium = function(original) {
        const perHour = this.randomChoice([2, 3, 4, 5, 6, 8]);
        const startTime = this.randomChoice([5, 10, 15, 20]);
        const times = [startTime, startTime * 2, startTime * 3];
        const distances = times.map(t => perHour * (t / 60));

        const table = this.makeTable(['Time (min)', 'Distance (mi)'],
            times.map((t, i) => [t, distances[i].toFixed(2)]));

        const question = `A car travels at a constant speed. Based on the table, what is the car's speed in miles per hour?<br><br>${table}`;

        const wrongChoices = [
            perHour - 1,
            perHour + 1,
            perHour * 2
        ].filter(v => v > 0 && v !== perHour);

        const allChoices = this.shuffle([perHour, ...wrongChoices.slice(0, 3)]);
        const { choices: labeled, answer } = this.labelChoices(allChoices, perHour);

        const periodsPerHour = 60 / startTime;
        const explanation = `In ${startTime} minutes, the car travels ${distances[0].toFixed(2)} miles. There are ${periodsPerHour} blocks of ${startTime} minutes in one hour. Multiply: ${distances[0].toFixed(2)} × ${periodsPerHour} = ${perHour} miles per hour.`;

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // =========================================================
    // GRAPH INTERPRETATION TEMPLATES (MEDIUM LEVEL)
    // =========================================================

    // TEMPLATE 9: Interpret what the slope MEANS in context (not just sign)
    // FIX: Upgraded from "positive or negative?" to contextual interpretation
    P.tplGraphSlopeSignMedium = function(original) {
        const scenarios = [
            {
                rate: this.randomInt(3, 8),
                sign: -1,
                xLabel: 'Hours', yLabel: 'Gallons Remaining',
                title: 'Water Tank',
                intro: 'The graph shows the amount of water in a tank over time.',
                makeCorrect: (r) => `The tank loses ${r} gallons every hour.`,
                makeWrong: (r) => [
                    `The tank gains ${r} gallons every hour.`,
                    `The tank started with ${r} gallons.`,
                    `The tank will be empty in ${r} hours.`
                ]
            },
            {
                rate: this.randomInt(10, 40),
                sign: 1,
                xLabel: 'Hours Worked', yLabel: 'Total Pay ($)',
                title: 'Hourly Pay',
                intro: 'The graph shows a worker\'s total pay over hours worked.',
                makeCorrect: (r) => `The worker earns $${r} for each hour worked.`,
                makeWrong: (r) => [
                    `The worker started with $${r} already earned.`,
                    `The worker works ${r} hours total.`,
                    `The worker loses $${r} each hour.`
                ]
            },
            {
                rate: this.randomInt(5, 15),
                sign: -1,
                xLabel: 'Days', yLabel: 'Snow Depth (inches)',
                title: 'Snowmelt',
                intro: 'The graph shows the depth of snow on the ground over several days.',
                makeCorrect: (r) => `The snow melts ${r} inches per day.`,
                makeWrong: (r) => [
                    `It snows ${r} inches per day.`,
                    `The snow started at ${r} inches.`,
                    `The snow will be gone in ${r} days.`
                ]
            },
            {
                rate: this.randomInt(20, 60),
                sign: 1,
                xLabel: 'Weeks', yLabel: 'Followers',
                title: 'Social Media Growth',
                intro: 'The graph shows the number of followers an account gains over weeks.',
                makeCorrect: (r) => `The account gains ${r} followers each week.`,
                makeWrong: (r) => [
                    `The account loses ${r} followers each week.`,
                    `The account started with ${r} followers.`,
                    `The account reaches ${r} followers total.`
                ]
            }
        ];
        const scenario = this.randomChoice(scenarios);
        const rate = scenario.rate;
        const m = scenario.sign * rate;
        const initial = scenario.sign === -1 ? rate * this.randomInt(6, 12) : this.randomInt(0, 20);

        const xMax = 8;
        const yAtEnd = m * xMax + initial;
        const yMin = Math.min(0, yAtEnd) - 5;
        const yMax = Math.max(initial, yAtEnd) + 10;
        const yRange = yMax - yMin;
        const yTick = yRange > 60 ? 20 : yRange > 30 ? 10 : 5;

        const graph = this._generateLinearGraphSVG({
            slope: m, yIntercept: initial,
            xMin: 0, xMax, yMin: Math.max(0, yMin), yMax,
            xTick: 1, yTick,
            xLabel: scenario.xLabel, yLabel: scenario.yLabel,
            title: scenario.title
        });

        const question = `${scenario.intro}<br><br>${graph}<br><br>What does the slope of this line tell us?`;

        const correct = scenario.makeCorrect(rate);
        const wrong = scenario.makeWrong(rate);
        const allChoices = this.shuffle([correct, ...wrong]);
        const { choices, answer } = this.labelChoices(allChoices, correct);

        const explanation = `The slope is the rate of change — how much ${scenario.yLabel.toLowerCase()} changes for each unit of ${scenario.xLabel.toLowerCase()}. The line ${scenario.sign === -1 ? 'falls' : 'rises'} by ${rate} for every 1 unit across, which means: ${correct}`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // TEMPLATE 10: Compare two linear functions in context — WHO GROWS FASTER?
    // FIX: Fully randomized which is steeper, rich real-world contexts, dynamic answer/explanation
    P.tplGraphCompareSteepnessMedium = function(original) {
        const scenarios = [
            {
                nameA: 'Runner A', nameB: 'Runner B',
                intro: 'Two runners are training on a track. The graphs show their distances over time.',
                xLabel: 'Minutes', yLabel: 'Distance (meters)',
                question: 'Which runner covers more distance per minute?',
                unit: 'meters per minute'
            },
            {
                nameA: 'Store A', nameB: 'Store B',
                intro: 'Two stores are tracking their daily sales. The graphs show total sales over hours.',
                xLabel: 'Hours', yLabel: 'Sales ($)',
                question: 'Which store makes more money per hour?',
                unit: 'dollars per hour'
            },
            {
                nameA: 'Company A', nameB: 'Company B',
                intro: 'Two companies are ramping up production. The graphs show units produced over days.',
                xLabel: 'Days', yLabel: 'Units Produced',
                question: 'Which company produces more units per day?',
                unit: 'units per day'
            },
            {
                nameA: 'Pump A', nameB: 'Pump B',
                intro: 'Two water pumps are filling tanks. The graphs show water volume over time.',
                xLabel: 'Minutes', yLabel: 'Gallons',
                question: 'Which pump fills water faster?',
                unit: 'gallons per minute'
            },
            {
                nameA: 'Plant A', nameB: 'Plant B',
                intro: 'Two plants are growing side by side. The graphs show their heights over time.',
                xLabel: 'Weeks', yLabel: 'Height (cm)',
                question: 'Which plant grows faster?',
                unit: 'cm per week'
            }
        ];
        const scenario = this.randomChoice(scenarios);

        // RANDOMIZE which line is steeper — 50/50
        const aIsSteeper = this.randomChoice([true, false]);

        const steeperSlope = this.randomInt(5, 9);
        const shallowerSlope = this.randomInt(1, 4);
        // Ensure they're actually different
        const m1 = aIsSteeper ? steeperSlope : shallowerSlope;
        const m2 = aIsSteeper ? shallowerSlope : steeperSlope;

        const b1 = this.randomInt(0, 8);
        const b2 = this.randomInt(0, 8);
        const xMax = 6;
        const yMax = Math.max(m1 * xMax + b1, m2 * xMax + b2) + 5;
        const yTick = yMax > 60 ? 10 : 5;

        const graphA = this._generateLinearGraphSVG({
            slope: m1, yIntercept: b1,
            xMin: 0, xMax, yMin: 0, yMax,
            xTick: 1, yTick,
            xLabel: scenario.xLabel, yLabel: scenario.yLabel,
            title: scenario.nameA
        });

        const graphB = this._generateLinearGraphSVG({
            slope: m2, yIntercept: b2,
            xMin: 0, xMax, yMin: 0, yMax,
            xTick: 1, yTick,
            xLabel: scenario.xLabel, yLabel: scenario.yLabel,
            title: scenario.nameB
        });

        const question = `${scenario.intro}<br><br>${graphA}<br><br>${graphB}<br><br>${scenario.question}`;

        // Dynamic correct answer based on which is actually steeper
        const winnerName = aIsSteeper ? scenario.nameA : scenario.nameB;
        const loserName  = aIsSteeper ? scenario.nameB : scenario.nameA;
        const winnerSlope = aIsSteeper ? m1 : m2;
        const loserSlope  = aIsSteeper ? m2 : m1;

        const choices = this.labelChoices([
            `${scenario.nameA} — it covers more per unit of time.`,
            `${scenario.nameB} — it covers more per unit of time.`,
            'They are the same.',
            'It cannot be determined from the graphs.'
        ], `${winnerName} — it covers more per unit of time.`);

        const explanation = `Compare the slopes: ${scenario.nameA}'s slope is ${m1} ${scenario.unit}, and ${scenario.nameB}'s slope is ${m2} ${scenario.unit}. Since ${winnerSlope} > ${loserSlope}, ${winnerName} is steeper — it adds more ${scenario.yLabel.toLowerCase()} for each unit of ${scenario.xLabel.toLowerCase()}.`;

        return this.buildProblem(original, question, choices.choices, choices.answer, explanation);
    };

    // TEMPLATE 11: Interpret negative slope in context
    // FIX: 4 distinct scenarios, each with unique framing
    P.tplGraphNegativeSlopeContextMedium = function(original) {
        const scenarios = [
            {
                rate: this.randomInt(4, 10),
                initial: null, // computed below
                xLabel: 'Hours', yLabel: 'Gallons Remaining',
                title: 'Water Tank',
                intro: 'The graph shows the amount of water left in a tank as it drains.',
                makeCorrect: (r) => `Water drains at ${r} gallons per hour.`,
                makeWrong: (r, init) => [
                    `Water is added at ${r} gallons per hour.`,
                    `The tank started with ${r} gallons.`,
                    `The tank empties every ${r} hours.`
                ]
            },
            {
                rate: this.randomInt(100, 500),
                initial: null,
                xLabel: 'Hours', yLabel: 'Altitude (feet)',
                title: 'Airplane Descent',
                intro: 'The graph shows an airplane\'s altitude as it descends for landing.',
                makeCorrect: (r) => `The airplane descends at ${r} feet per hour.`,
                makeWrong: (r, init) => [
                    `The airplane climbs at ${r} feet per hour.`,
                    `The airplane started at ${r} feet.`,
                    `The airplane reaches the ground in ${r} hours.`
                ]
            },
            {
                rate: this.randomInt(2, 8),
                initial: null,
                xLabel: 'Days', yLabel: 'Snow Depth (inches)',
                title: 'Snowmelt',
                intro: 'The graph shows the depth of snow melting over several days.',
                makeCorrect: (r) => `The snow melts ${r} inches per day.`,
                makeWrong: (r, init) => [
                    `It snows ${r} inches each day.`,
                    `There were ${r} inches of snow on day 1.`,
                    `All the snow melts in ${r} days.`
                ]
            },
            {
                rate: this.randomInt(5, 20),
                initial: null,
                xLabel: 'Minutes', yLabel: 'Battery (%)',
                title: 'Battery Drain',
                intro: 'The graph shows a phone\'s battery level over time.',
                makeCorrect: (r) => `The battery loses ${r}% per minute.`,
                makeWrong: (r, init) => [
                    `The battery charges ${r}% per minute.`,
                    `The phone started at ${r}% battery.`,
                    `The battery dies in ${r} minutes.`
                ]
            }
        ];
        const scenario = this.randomChoice(scenarios);
        const rate = scenario.rate;
        const initial = rate * this.randomInt(6, 12);

        const xMax = Math.ceil(initial / rate) + 2;
        const yMax = initial + rate * 2;
        const yTick = rate >= 100 ? 200 : rate >= 10 ? rate * 2 : rate * 3;

        const graph = this._generateLinearGraphSVG({
            slope: -rate, yIntercept: initial,
            xMin: 0, xMax, yMin: 0, yMax,
            xTick: 1, yTick,
            xLabel: scenario.xLabel, yLabel: scenario.yLabel,
            title: scenario.title
        });

        const question = `${scenario.intro}<br><br>${graph}<br><br>What does the negative slope of this line represent?`;

        const correct = scenario.makeCorrect(rate);
        const wrong = scenario.makeWrong(rate, initial);
        const allChoices = this.shuffle([correct, ...wrong]);
        const { choices, answer } = this.labelChoices(allChoices, correct);

        const explanation = `A negative slope means the value is decreasing over time. For every 1 unit increase in ${scenario.xLabel.toLowerCase()}, the ${scenario.yLabel.toLowerCase()} drops by ${rate}. That tells us: ${correct}`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // TEMPLATE 12: Where does the line cross zero? — multiple contexts
    // FIX: 3 distinct scenarios
    P.tplGraphCrossZeroMedium = function(original) {
        const scenarios = [
            {
                xLabel: 'Minutes', yLabel: 'Temperature (°C)',
                title: 'Cooling Process',
                intro: 'The graph shows a substance cooling down over time.',
                zeroQuestion: 'After how many minutes will the temperature reach 0°C?',
                unit: 'minutes'
            },
            {
                xLabel: 'Hours', yLabel: 'Fuel Remaining (gal)',
                title: 'Fuel Consumption',
                intro: 'The graph shows the fuel remaining in a truck over time.',
                zeroQuestion: 'After how many hours will the truck run out of fuel?',
                unit: 'hours'
            },
            {
                xLabel: 'Days', yLabel: 'Debt Remaining ($)',
                title: 'Paying Off Debt',
                intro: 'The graph shows the remaining balance on a debt over time.',
                zeroQuestion: 'After how many days will the debt be fully paid off?',
                unit: 'days'
            }
        ];
        const scenario = this.randomChoice(scenarios);

        const xIntercept = this.randomInt(4, 10);
        const rate = this.randomInt(3, 8);
        const initial = rate * xIntercept; // guarantees clean integer crossing

        const xMax = xIntercept + 3;
        const yTick = Math.max(5, Math.round(initial / 5));
        const yMax = initial + yTick;

        const graph = this._generateLinearGraphSVG({
            slope: -rate, yIntercept: initial,
            xMin: 0, xMax, yMin: 0, yMax,
            xTick: 1, yTick,
            xLabel: scenario.xLabel, yLabel: scenario.yLabel,
            title: scenario.title
        });

        const question = `${scenario.intro}<br><br>${graph}<br><br>${scenario.zeroQuestion}`;

        const wrongAnswers = [xIntercept - 1, xIntercept + 1, xIntercept + 2]
            .filter(v => v > 0 && v !== xIntercept);
        const allChoices = this.shuffle([xIntercept, ...wrongAnswers.slice(0, 3)]);
        const { choices, answer } = this.labelChoices(allChoices, xIntercept);

        const explanation = `The line starts at ${initial} when ${scenario.xLabel.toLowerCase()} = 0 and drops by ${rate} each ${scenario.unit.replace(/s$/, '')}. To find when it hits 0: ${initial} ÷ ${rate} = ${xIntercept} ${scenario.unit}. You can also see this on the graph where the line meets the horizontal axis.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // TEMPLATE 13: Initial value interpretation — multiple contexts
    // FIX: 4 distinct scenarios
    P.tplGraphInitialValueMedium = function(original) {
        const scenarios = [
            {
                xLabel: 'Months', yLabel: 'Balance ($)',
                title: 'Savings Account',
                intro: 'The graph shows a savings account balance growing over time.',
                question: 'How much money was in the account at the start?'
            },
            {
                xLabel: 'Hours', yLabel: 'Distance from Home (mi)',
                title: 'Road Trip',
                intro: 'The graph shows how far a car is from home during a road trip.',
                question: 'How far from home did the car start?'
            },
            {
                xLabel: 'Days', yLabel: 'Height (cm)',
                title: 'Plant Growth',
                intro: 'The graph shows the height of a plant over several days.',
                question: 'How tall was the plant at the start?'
            },
            {
                xLabel: 'Weeks', yLabel: 'Inventory (items)',
                title: 'Store Inventory',
                intro: 'The graph shows the number of items a store has in stock.',
                question: 'How many items were in stock at the beginning?'
            }
        ];
        const scenario = this.randomChoice(scenarios);

        const yTick = this.randomChoice([10, 20, 25, 50]);
        const tickMultiplier = this.randomInt(2, 5);
        const initial = yTick * tickMultiplier;
        const rate = this.randomInt(3, 12);
        const xMax = 10;
        const yMax = initial + rate * xMax + yTick;

        const graph = this._generateLinearGraphSVG({
            slope: rate, yIntercept: initial,
            xMin: 0, xMax, yMin: 0, yMax,
            xTick: 1, yTick,
            xLabel: scenario.xLabel, yLabel: scenario.yLabel,
            title: scenario.title
        });

        const wrongAnswers = [initial + yTick, initial - yTick, initial + yTick * 2]
            .filter(v => v > 0);
        const allChoices = this.shuffle([initial, ...wrongAnswers.slice(0, 3)]);
        const { choices, answer } = this.labelChoices(allChoices, initial);

        const question = `${scenario.intro}<br><br>${graph}<br><br>${scenario.question}`;

        const explanation = `The initial value is the y-intercept — the point where the line crosses the vertical axis (at ${scenario.xLabel.toLowerCase()} = 0). Reading the graph, that value is ${initial}.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // =========================================================
    // MULTI-STEP REASONING TEMPLATES
    // =========================================================

    // TEMPLATE 14: Perpendicular slope (convert ax+by=c form first)
    P.tplPerpSlopeConvertMedium = function(original) {
        const a = this.randomInt(2, 6);
        let b = this.randomInt(2, 7);
        while (b === a) b = this.randomInt(2, 7);
        const c = this.randomInt(5, 20);

        const correctAnswer = b / a;

        const formatFrac = (num, den) => {
            if (num === 0) return '0';
            const sign = (num < 0) !== (den < 0) ? '-' : '';
            const absNum = Math.abs(num);
            const absDen = Math.abs(den);
            if (absDen === 1) return `${sign}${absNum}`;
            if (absNum % absDen === 0) return `${sign}${absNum / absDen}`;
            return `${sign}<sup>${absNum}</sup>&frasl;<sub>${absDen}</sub>`;
        };

        const question = `Line ${this.ital('ℓ')} has the equation ${this.math(`${a}x + ${b}y = ${c}`)}. Line ${this.ital('k')} is perpendicular to line ${this.ital('ℓ')}. What is the slope of line ${this.ital('k')}?`;

        // Slope of ℓ is -a/b. Perpendicular slope is b/a.
        // Common wrong answers: -a/b (original slope), a/b (forgot negative flip), -b/a (sign error)
        const choiceData = [
            { label: formatFrac(b, a),  value: b / a },   // correct: b/a
            { label: formatFrac(-a, b), value: -a / b },  // original slope
            { label: formatFrac(a, b),  value: a / b },   // forgot sign on original
            { label: formatFrac(-b, a), value: -b / a }   // sign error on perp
        ];

        // Remove any duplicates by value
        const seen = new Set();
        const unique = choiceData.filter(c => {
            const key = c.value.toFixed(4);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        const shuffled = this.shuffle(unique);
        const correctIndex = shuffled.findIndex(c => Math.abs(c.value - correctAnswer) < 0.0001);
        const labeled = shuffled.map((c, i) => `${String.fromCharCode(65 + i)}) ${c.label}`);
        const answerLetter = String.fromCharCode(65 + correctIndex);

        const explanation = `Step 1: Solve for y. Subtract ${a}x from both sides: ${b}y = −${a}x + ${c}. Divide by ${b}: y = ${formatFrac(-a, b)}x + ${formatFrac(c, b)}. The slope of line ℓ is ${formatFrac(-a, b)}.<br><br>Step 2: Perpendicular slopes are negative reciprocals. Flip ${formatFrac(-a, b)} and change the sign: the slope of line k is ${formatFrac(b, a)}.`;

        return this.buildProblem(original, question, labeled, answerLetter, explanation);
    };

    // TEMPLATE 15: Given two function values, find f(k) — requires deriving slope + intercept
    P.tplTwoPointsEvaluateMedium = function(original) {
        const m = this.randomInt(2, 6);
        const b = this.randomInt(-5, 10);
        const x1 = this.randomInt(1, 4);
        const x2 = x1 + this.randomInt(2, 4);
        const xNew = x2 + this.randomInt(3, 6);

        const y1 = m * x1 + b;
        const y2 = m * x2 + b;
        const correctAnswer = m * xNew + b;

        const funcName = this.randomChoice(['f', 'g', 'h']);

        const question = `The linear function ${this.ital(funcName)} satisfies ${this.math(`${funcName}(${x1}) = ${y1}`)} and ${this.math(`${funcName}(${x2}) = ${y2}`)}. What is ${this.math(`${funcName}(${xNew})`)}?`;

        const wrongChoices = [
            m * xNew,              // forgot b
            correctAnswer + m,     // off by one slope unit
            correctAnswer - m
        ].filter(v => v !== correctAnswer);

        const allChoices = this.shuffle([correctAnswer, ...wrongChoices.slice(0, 3)]);
        const { choices: labeled, answer } = this.labelChoices(allChoices, correctAnswer);

        const run = x2 - x1;
        const rise = y2 - y1;
        const explanation = `Step 1: Find the slope. slope = (${y2} − ${y1}) ÷ (${x2} − ${x1}) = ${rise} ÷ ${run} = ${m}.<br><br>Step 2: Find b using (${x1}, ${y1}): ${y1} = ${m}(${x1}) + b → b = ${y1} − ${m * x1} = ${b}.<br><br>Step 3: Evaluate. ${funcName}(${xNew}) = ${m}(${xNew}) + ${b} = ${m * xNew} + ${b} = ${correctAnswer}.`;

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // TEMPLATE 16: Find parameter m from a condition
    P.tplFindParameterMedium = function(original) {
        const m = this.randomInt(2, 8);
        const xGiven = this.randomInt(2, 6);
        const yGiven = this.randomInt(10, 30);
        const b = yGiven - m * xGiven;

        const funcName = this.randomChoice(['f', 'g', 'h']);
        const bDisplay = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;

        const question = `The function ${this.ital(funcName)} is defined by ${this.math(`${funcName}(x) = mx ${bDisplay}`)}, where ${this.ital('m')} is a constant. If ${this.math(`${funcName}(${xGiven}) = ${yGiven}`)}, what is the value of ${this.ital('m')}?`;

        const wrongChoices = [
            m + 1,
            m - 1,
            Math.round(yGiven / xGiven)   // divided y by x, ignoring b
        ].filter(v => v > 0 && v !== m);

        const uniqueWrong = [...new Set(wrongChoices)].slice(0, 3);
        const allChoices = this.shuffle([m, ...uniqueWrong]);
        while (allChoices.length < 4) allChoices.push(m + allChoices.length * 2);
        const { choices: labeled, answer } = this.labelChoices(allChoices.slice(0, 4), m);

        const yMinusB = yGiven - b;
        const explanation = `Plug in: ${yGiven} = m(${xGiven}) ${bDisplay}.<br><br>${b >= 0 ? `Subtract ${b}` : `Add ${Math.abs(b)}`}: ${yGiven} ${b >= 0 ? '−' : '+'} ${Math.abs(b)} = ${xGiven}m → ${yMinusB} = ${xGiven}m.<br><br>Divide by ${xGiven}: m = ${yMinusB} ÷ ${xGiven} = ${m}.`;

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // TEMPLATE 17: Real-world rate — COMPARE two scenarios (not just plug-and-chug)
    // FIX: Multiple contexts, question requires comparing or interpreting — distinct from easy
    P.tplRealWorldRateMedium = function(original) {
        const scenarios = [
            {
                intro: (r, i, t) => `A delivery truck starts ${i} miles from the warehouse and drives away at ${r} mph. After ${t} hours, how far is the truck from the warehouse?`,
                correct: (r, i, t) => i + r * t,
                wrongA: (r, i, t) => r * t,           // forgot initial distance
                wrongB: (r, i, t) => i + r * (t - 1), // off by one hour
                explain: (r, i, t, ans) => `The truck starts ${i} miles away and adds ${r} miles each hour. After ${t} hours: ${i} + ${r} × ${t} = ${i} + ${r * t} = ${ans} miles from the warehouse.`
            },
            {
                intro: (r, i, t) => `A streaming service starts with ${i} subscribers and gains ${r} new subscribers each day. How many subscribers will it have after ${t} days?`,
                correct: (r, i, t) => i + r * t,
                wrongA: (r, i, t) => r * t,
                wrongB: (r, i, t) => i + r * (t + 1),
                explain: (r, i, t, ans) => `Start with ${i} subscribers and add ${r} per day. After ${t} days: ${i} + ${r} × ${t} = ${i} + ${r * t} = ${ans} total subscribers.`
            },
            {
                intro: (r, i, t) => `A factory starts with ${i} units in inventory and produces ${r} additional units each hour. How many units are in inventory after ${t} hours?`,
                correct: (r, i, t) => i + r * t,
                wrongA: (r, i, t) => r * t,
                wrongB: (r, i, t) => i * t,            // multiplied instead of added
                explain: (r, i, t, ans) => `Starting inventory is ${i} units. Production adds ${r} units per hour. After ${t} hours: ${i} + ${r} × ${t} = ${i} + ${r * t} = ${ans} units.`
            }
        ];
        const scenario = this.randomChoice(scenarios);
        const rate = this.randomInt(30, 80);
        const initial = this.randomInt(50, 200);
        const time = this.randomInt(2, 6);

        const correct = scenario.correct(rate, initial, time);
        const wrongA = scenario.wrongA(rate, initial, time);
        const wrongB = scenario.wrongB(rate, initial, time);
        const wrongC = correct + rate; // off by one period

        const allChoices = this.shuffle([correct, wrongA, wrongB, wrongC].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4));
        while (allChoices.length < 4) allChoices.push(correct + allChoices.length * 10);
        const { choices: labeled, answer } = this.labelChoices(allChoices.slice(0, 4), correct);

        const question = scenario.intro(rate, initial, time);
        const explanation = scenario.explain(rate, initial, time, correct);

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // TEMPLATE 18: Decreasing pattern — requires reasoning about WHEN something runs out
    // FIX: Multiple contexts, question is "when does it reach X?" not just "what's left after Y?"
    P.tplDecreasingPatternMedium = function(original) {
        const scenarios = [
            {
                setup: (start, dec) => `A water tank has ${start} gallons. It drains ${dec} gallons every hour.`,
                question: (start, dec) => {
                    const target = dec * this.randomInt(1, 3);
                    return { q: `How many hours until only ${target} gallons remain?`, target };
                },
                unit: 'hours'
            },
            {
                setup: (start, dec) => `A phone starts at ${start}% battery. It loses ${dec}% every hour of use.`,
                question: (start, dec) => {
                    const target = dec * this.randomInt(0, 2);
                    return { q: `How many hours of use until the battery is at ${target}%?`, target };
                },
                unit: 'hours'
            },
            {
                setup: (start, dec) => `A bookshelf starts with ${start} books. Every week, ${dec} books are checked out (and not returned).`,
                question: (start, dec) => {
                    const target = dec * this.randomInt(1, 3);
                    return { q: `How many weeks until only ${target} books remain?`, target };
                },
                unit: 'weeks'
            },
            {
                setup: (start, dec) => `A parking lot starts with ${start} cars. Every hour, ${dec} cars leave.`,
                question: (start, dec) => {
                    const target = dec * this.randomInt(0, 2);
                    return { q: `How many hours until only ${target} cars remain?`, target };
                },
                unit: 'hours'
            }
        ];
        const scenario = this.randomChoice(scenarios);

        const dec = this.randomInt(5, 15);
        const minTarget = dec * 3; // ensure we have room for a meaningful target
        const start = dec * this.randomInt(8, 16); // always a clean multiple so answer is integer

        const { q, target } = scenario.question(start, dec);
        // Answer: (start - target) / dec
        const correctAnswer = (start - target) / dec;

        const question = `${scenario.setup(start, dec)}<br><br>${q}`;

        const wrongChoices = [
            correctAnswer + 1,
            correctAnswer - 1,
            Math.round(start / dec)     // computed "when empty" instead of "when target"
        ].filter(v => v > 0 && v !== correctAnswer);

        const uniqueWrong = [...new Set(wrongChoices)].slice(0, 3);
        const allChoices = this.shuffle([correctAnswer, ...uniqueWrong]);
        while (allChoices.length < 4) allChoices.push(correctAnswer + allChoices.length);
        const { choices: labeled, answer } = this.labelChoices(allChoices.slice(0, 4), correctAnswer);

        const explanation = `We need to go from ${start} down to ${target}, which is a decrease of ${start} − ${target} = ${start - target}. At ${dec} per ${scenario.unit.replace(/s$/, '')}, that takes ${start - target} ÷ ${dec} = ${correctAnswer} ${scenario.unit}.`;

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // TEMPLATE 19: Compare two linear functions — which reaches a target first?
    P.tplCompareTwoFunctionsMedium = function(original) {
        const scenarios = [
            {
                nameA: 'Plan A', nameB: 'Plan B',
                intro: 'Two phone plans charge differently.',
                setup: (mA, bA, mB, bB) => `Plan A costs $${bA} upfront plus $${mA} per month. Plan B costs $${bB} upfront plus $${mB} per month.`,
                question: 'Which plan costs less after 6 months?',
                evalAt: 6,
                unit: 'months'
            },
            {
                nameA: 'Worker A', nameB: 'Worker B',
                intro: 'Two workers are filling an order.',
                setup: (mA, bA, mB, bB) => `Worker A has already completed ${bA} items and finishes ${mA} more per hour. Worker B has completed ${bB} items and finishes ${mB} more per hour.`,
                question: 'Who has completed more items after 5 hours?',
                evalAt: 5,
                unit: 'hours'
            },
            {
                nameA: 'Tree A', nameB: 'Tree B',
                intro: 'Two trees are growing in a garden.',
                setup: (mA, bA, mB, bB) => `Tree A is ${bA} cm tall and grows ${mA} cm per week. Tree B is ${bB} cm tall and grows ${mB} cm per week.`,
                question: 'Which tree is taller after 4 weeks?',
                evalAt: 4,
                unit: 'weeks'
            }
        ];
        const scenario = this.randomChoice(scenarios);

        // Make sure the winner isn't always the same — randomize rates
        const mA = this.randomInt(2, 8);
        const mB = this.randomInt(2, 8);
        const bA = this.randomInt(5, 30);
        const bB = this.randomInt(5, 30);
        const t = scenario.evalAt;

        const valA = mA * t + bA;
        const valB = mB * t + bB;

        // If they're equal, nudge one
        let finalMA = mA, finalBB = bB;
        if (valA === valB) finalMA = mA + 1;
        const finalValA = finalMA * t + bA;
        const finalValB = mB * t + bB;

        const aWins = finalValA < finalValB; // for cost: less is better; for items/height: more is better
        // Determine context: phone plan = less is better; others = more is better
        const lessIsBetter = scenario.nameA === 'Plan A';
        const winner = lessIsBetter ? (finalValA < finalValB ? scenario.nameA : scenario.nameB)
            : (finalValA > finalValB ? scenario.nameA : scenario.nameB);

        const question = `${scenario.intro} ${scenario.setup(finalMA, bA, mB, bB)}<br><br>${scenario.question}`;

        const correct = `${winner}`;
        const loser = winner === scenario.nameA ? scenario.nameB : scenario.nameA;
        const choices = this.labelChoices([
            `${scenario.nameA}`,
            `${scenario.nameB}`,
            'They are the same.',
            'Not enough information.'
        ], correct);

        const explanation = `After ${t} ${scenario.unit}: ${scenario.nameA} = ${finalMA}(${t}) + ${bA} = ${finalMA * t} + ${bA} = ${finalValA}. ${scenario.nameB} = ${mB}(${t}) + ${bB} = ${mB * t} + ${bB} = ${finalValB}. ${lessIsBetter ? `Since ${finalValA < finalValB ? finalValA + ' < ' + finalValB : finalValB + ' < ' + finalValA}, ${winner} costs less.` : `Since ${finalValA > finalValB ? finalValA + ' > ' + finalValB : finalValB + ' > ' + finalValA}, ${winner} is greater.`}`;

        return this.buildProblem(original, question, choices.choices, choices.answer, explanation);
    };

    // TEMPLATE 20: Find the value of x where two functions are equal (intersection)
    P.tplFindIntersectionMedium = function(original) {
        const scenarios = [
            {
                intro: (mA, bA, mB, bB) => `Hiker A starts ${bA} miles into a trail and walks at ${mA} mph. Hiker B starts at the beginning (0 miles) and walks at ${mB} mph. After how many hours will they be at the same point on the trail?`,
                unit: 'hours'
            },
            {
                intro: (mA, bA, mB, bB) => `Account A has $${bA} and earns $${mA} per week. Account B has $${bB} and earns $${mB} per week. After how many weeks will the accounts have the same balance?`,
                unit: 'weeks'
            },
            {
                intro: (mA, bA, mB, bB) => `Car A is ${bA} miles from the city and drives toward it at ${mA} mph (getting closer each hour). Car B starts at the city and drives away at ${mB} mph. After how many hours are they the same distance from the city?`,
                unit: 'hours'
            }
        ];
        const scenario = this.randomChoice(scenarios);

        // Pick values so the intersection is a clean integer
        // A: y = mA*x + bA,  B: y = mB*x + bB
        // Intersection: mA*x + bA = mB*x + bB  →  x = (bB - bA) / (mA - mB)
        // We want x to be a positive integer, so pick mA, mB, then choose bA, bB accordingly
        const xIntersect = this.randomInt(2, 8);
        const mA = this.randomInt(3, 7);
        let mB = this.randomInt(1, 6);
        while (mB === mA) mB = this.randomInt(1, 6);

        // bB - bA = (mA - mB) * xIntersect
        const bA = this.randomInt(0, 15);
        const bB = bA + (mA - mB) * xIntersect;

        // Only use if bB is reasonable (non-negative for most contexts)
        if (bB < 0 || bB > 100) return null;

        const question = scenario.intro(mA, bA, mB, bB);

        const wrongChoices = [
            xIntersect + 1,
            xIntersect - 1,
            Math.abs(bB - bA)   // just the difference in intercepts (forgot to divide)
        ].filter(v => v > 0 && v !== xIntersect);

        const uniqueWrong = [...new Set(wrongChoices)].slice(0, 3);
        const allChoices = this.shuffle([xIntersect, ...uniqueWrong]);
        while (allChoices.length < 4) allChoices.push(xIntersect + allChoices.length * 2);
        const { choices: labeled, answer } = this.labelChoices(allChoices.slice(0, 4), xIntersect);

        const valAtIntersect = mA * xIntersect + bA;
        const explanation = `Set the two expressions equal: ${mA}x + ${bA} = ${mB}x + ${bB}.<br><br>Subtract ${mB}x from both sides: ${mA - mB}x + ${bA} = ${bB}.<br><br>Subtract ${bA}: ${mA - mB}x = ${bB - bA}.<br><br>Divide by ${mA - mB}: x = ${xIntersect}. (Both equal ${valAtIntersect} at that point.)`;

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // TEMPLATE 21: Calculate the change over an interval
    P.tplChangeOverIntervalMedium = function(original) {
        const scenarios = [
            {
                setup: (m, b) => `The temperature outside follows the pattern T(h) = ${m}h ${b >= 0 ? '+' : '−'} ${Math.abs(b)}, where h is the hour of the day.`,
                question: (x1, x2) => `What is the total change in temperature from hour ${x1} to hour ${x2}?`,
                unit: '°C'
            },
            {
                setup: (m, b) => `A car's position (in miles) is given by P(t) = ${m}t ${b >= 0 ? '+' : '−'} ${Math.abs(b)}, where t is time in hours.`,
                question: (x1, x2) => `How far does the car travel between hour ${x1} and hour ${x2}?`,
                unit: 'miles'
            },
            {
                setup: (m, b) => `A shop's revenue (in dollars) is modeled by R(d) = ${m}d ${b >= 0 ? '+' : '−'} ${Math.abs(b)}, where d is the number of days.`,
                question: (x1, x2) => `What is the total revenue earned between day ${x1} and day ${x2}?`,
                unit: '$'
            }
        ];
        const scenario = this.randomChoice(scenarios);

        const m = this.randomInt(3, 12);
        const b = this.randomInt(-10, 20);
        const x1 = this.randomInt(1, 4);
        const x2 = x1 + this.randomInt(2, 5);

        const y1 = m * x1 + b;
        const y2 = m * x2 + b;
        const correctAnswer = y2 - y1; // = m * (x2 - x1)

        const question = `${scenario.setup(m, b)}<br><br>${scenario.question(x1, x2)}`;

        const wrongChoices = [
            y2,                    // gave the value at x2, not the change
            y1,                    // gave the value at x1
            correctAnswer + m      // off by one period
        ].filter(v => v !== correctAnswer);

        const allChoices = this.shuffle([correctAnswer, ...wrongChoices.slice(0, 3)]);
        const { choices: labeled, answer } = this.labelChoices(allChoices, correctAnswer);

        const explanation = `The change over an interval is f(end) − f(start).<br><br>At ${x1}: ${m}(${x1}) ${b >= 0 ? '+' : '−'} ${Math.abs(b)} = ${y1}.<br><br>At ${x2}: ${m}(${x2}) ${b >= 0 ? '+' : '−'} ${Math.abs(b)} = ${y2}.<br><br>Change = ${y2} − ${y1} = ${correctAnswer} ${scenario.unit}.`;

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // TEMPLATE 22: Match a word description to its equation
    P.tplMatchEquationToContextMedium = function(original) {
        const rate = this.randomInt(3, 15);
        const initial = this.randomInt(10, 60);

        const scenarios = [
            {
                description: `A pool starts with ${initial} gallons of water. A hose adds ${rate} gallons every minute.`,
                varName: 't', resultVar: 'W',
                correct: `W = ${rate}t + ${initial}`,
                wrongSlashIntercept: `W = ${initial}t + ${rate}`,    // swapped
                wrongSign: `W = ${rate}t − ${initial}`,              // subtracted initial
                wrongRate: `W = ${rate + initial}t`                  // added them as one rate
            },
            {
                description: `A car starts with ${initial} gallons of fuel and uses ${rate} gallons per hour.`,
                varName: 'h', resultVar: 'F',
                correct: `F = −${rate}h + ${initial}`,
                wrongSlashIntercept: `F = −${initial}h + ${rate}`,
                wrongSign: `F = ${rate}h + ${initial}`,              // forgot negative
                wrongRate: `F = −${rate + initial}h`
            },
            {
                description: `A subscription costs $${initial} to sign up and then $${rate} each month.`,
                varName: 'm', resultVar: 'C',
                correct: `C = ${rate}m + ${initial}`,
                wrongSlashIntercept: `C = ${initial}m + ${rate}`,
                wrongSign: `C = ${rate}m − ${initial}`,
                wrongRate: `C = ${rate + initial}m`
            }
        ];
        const scenario = this.randomChoice(scenarios);

        const allChoices = this.shuffle([
            scenario.correct,
            scenario.wrongSlashIntercept,
            scenario.wrongSign,
            scenario.wrongRate
        ]);
        const { choices, answer } = this.labelChoices(allChoices, scenario.correct);

        const question = `${scenario.description}<br><br>Which equation models this situation? (Let ${scenario.varName} = the variable, ${scenario.resultVar} = the result.)`;

        const isDecreasing = scenario.correct.includes('−');
        const explanation = isDecreasing
            ? `The starting value is ${initial}, so that's the constant added at the end. The amount ${isDecreasing ? 'decreases' : 'increases'} by ${rate} each period, so the rate is −${rate}. Equation: ${scenario.correct}.`
            : `The starting value is $${initial} — that's the constant (y-intercept). Each period adds $${rate} — that's the rate (slope). Put them together: ${scenario.correct}.`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    console.log("✅ Linear Functions Medium templates loaded:");
    console.log("   • 8 table-based templates");
    console.log("   • 5 graph interpretation templates");
    console.log("   • 9 multi-step reasoning templates (including 4 new)");
    console.log("   • Total: 22 templates — fully randomized, no predictability");
}