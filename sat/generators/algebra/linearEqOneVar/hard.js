// sat/generators/algebra/linearEqOneVar/hard.js

if (!window.ProblemGenerator) {
    console.error("❌ ProblemGenerator not loaded before hard.js");
} else {
    const P = window.ProblemGenerator.prototype;

    // =========================================================
    // HELPER: Generate integer-only choices (no decimals)
    // Use for: ages, counts, miles, minutes, integers, etc.
    // =========================================================
    P._integerChoices = function (correct, count = 4, spread = 5) {
        const choices = new Set([correct]);
        const offsets = this.shuffle([-3, -2, -1, 1, 2, 3, 4, 5, -4, -5, 6, -6]);
        let i = 0;
        while (choices.size < count && i < offsets.length) {
            const candidate = correct + offsets[i] * Math.ceil(spread / 3);
            // Avoid duplicates and ensure variety
            if (!choices.has(candidate)) {
                choices.add(candidate);
            }
            i++;
        }
        // Fallback if still not enough
        while (choices.size < count) {
            const rand = correct + this.randomChoice([-1, 1]) * this.randomInt(1, spread * 2);
            choices.add(rand);
        }
        return this.shuffle(Array.from(choices));
    };

    // =========================================================
    // ✅ FULLY VARIED HARD LINEAR EQUATIONS
    // =========================================================

    // 1) Infinitely Many Solutions - MUCH MORE VARIED
    P.tplInfiniteSolutionsFractionHard = function (original) {
        const a = this.randomInt(2, 6);
        const b = this.randomInt(3, 25);
        const denominator = this.randomChoice([5, 7, 9, 11, 13, 15, 17, 19]);
        let rightCoeff = this.randomInt(-15, 15);
        if (rightCoeff === 0) rightCoeff = -10;

        const s = denominator * (b - a * rightCoeff);

        const choices = new Set([s]);
        const jumps = this.shuffle([1, 2, 3, 4, 5, 6, 7]).slice(0, 3).map(j => j * denominator);
        choices.add(s + this.randomChoice([-1, 1]) * jumps[0]);
        choices.add(s + this.randomChoice([-1, 1]) * jumps[1]);
        choices.add(s + this.randomChoice([-1, 1]) * jumps[2]);

        while (choices.size < 4) {
            choices.add(s + this.randomChoice([-1, 1]) * this.randomInt(1, 9) * denominator);
        }

        const choiceArray = this.shuffle(Array.from(choices));
        const { choices: labeled, answer } = this.labelChoices(choiceArray, s);

        const question =
            `In the equation ${this.math(`${a}x + ${b} - s/${denominator} = ${a}(x ${rightCoeff >= 0 ? '+' : ''} ${rightCoeff})`)}, ${this.ital("s")} is a constant. ` +
            `If the equation has infinitely many solutions, what is the value of ${this.ital("s")}?`;

        const explanation = this.makeSteps([
            `Distribute right side: ${this.math(`${a}x + ${b} - s/${denominator} = ${a}x ${rightCoeff >= 0 ? '+' : ''} ${a * rightCoeff}`)}`,
            `For infinitely many solutions, both sides must match for every ${this.ital("x")}. The ${this.math(`${a}x`)} terms already match.`,
            `Match the constants: ${this.math(`${b} - s/${denominator} = ${a * rightCoeff}`)}`,
            `Solve: ${this.math(`s = ${denominator}(${b} - ${a * rightCoeff}) = ${s}`)}`
        ]);

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // 2) No Solution k - Decimals appropriate here (abstract constant k)
    P.tplNoSolutionCleanKHard = function (original) {
        const a = this.randomInt(2, 7);
        const numerator = this.randomInt(8, 45);
        const denom = this.randomInt(8, 30);

        const k = Number((numerator / (a * denom)).toFixed(3));

        const decimalChoices = [
            Number((k - 0.15).toFixed(3)),
            Number((k - 0.05).toFixed(3)),
            k,
            Number((k + 0.1).toFixed(3))
        ];
        const shuffled = this.shuffle(decimalChoices);
        const { choices, answer } = this.labelChoices(shuffled, k, v => v.toFixed(3));

        let const1 = this.randomInt(8, 35);
        let const2 = this.randomInt(40, 80);
        if (const1 === const2) const2 += 1;

        const question =
            `In the equation ${this.math(`${a}kx + ${const1} = (${numerator}/${denom})x + ${const2}`)}, ${this.ital("k")} is a constant. ` +
            `The equation has no solution. What is the value of ${this.ital("k")}?`;

        const explanation = this.makeSteps([
            `For no solution, the ${this.ital("x")}-coefficients must match but the constants must be different.`,
            `${this.math(`${a}k = ${numerator}/${denom}`)}`,
            `${this.math(`k ≈ ${k.toFixed(3)}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // 3) Negative coefficient - INTEGER solution (abstract variable t)
    P.tplNegativeCoefficientSolveHard = function (original) {
        const a = this.randomInt(2, 6);
        const b = this.randomInt(1, 12);
        const solution = this.randomInt(-35, -10);
        const result = -a * (solution + b);

        const vals = this._integerChoices(solution, 4, 6);
        const { choices, answer } = this.labelChoices(vals, solution);

        const question =
            `What value of ${this.ital("t")} is the solution to ${this.math(`-${a}(t + ${b}) = ${result}`)}?`;

        const explanation = this.makeSteps([
            `Divide by -${a}: ${this.math(`t + ${b} = ${-result / a}`)}`,
            `Subtract ${b}: ${this.math(`t = ${solution}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // =========================================================
    // ✅ HOW MANY SOLUTIONS — VARIED OUTCOMES (ONE / ZERO / INFINITE)
    // =========================================================
    P.tplHowManySolutionsMixedHard = function (original) {
        const choicesText = [
            "A) Zero",
            "B) Exactly one",
            "C) Exactly two",
            "D) Infinitely many"
        ];

        const outcome = this.randomChoice(["one", "one", "one", "zero", "infinite"]);

        const pm = (n) => (n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`);

        let question = "";
        let explanation = [];
        let correct = "";

        if (outcome === "one") {
            let a = this.randomInt(2, 18);
            let b = this.randomInt(2, 18);
            while (b === a) b = this.randomInt(2, 18);

            let xSol = this.randomInt(-12, 12);
            while (xSol === 0) xSol = this.randomInt(-12, 12);

            const c = this.randomInt(-40, 40);
            const d = (a - b) * xSol + c;

            if (c === d) return this.tplHowManySolutionsMixedHard(original);

            question = `How many solutions does the equation ${this.math(`${a}x ${pm(c)} = ${b}x ${pm(d)}`)} have?`;

            explanation = [
                `Move ${this.ital("x")}-terms to one side and constants to the other.`,
                `Because the ${this.ital("x")}-coefficients are different (${a} and ${b}), the equation solves to one value of ${this.ital("x")}.`,
                `Exactly one solution.`
            ];

            correct = "B";
        }

        if (outcome === "zero") {
            const a = this.randomInt(2, 18);
            const c = this.randomInt(-40, 40);
            let d = this.randomInt(-40, 40);
            while (d === c) d = this.randomInt(-40, 40);

            question = `How many solutions does the equation ${this.math(`${a}x ${pm(c)} = ${a}x ${pm(d)}`)} have?`;

            explanation = [
                `Subtract ${this.math(`${a}x`)} from both sides.`,
                `You get a false statement (the constants are different).`,
                `So there are zero solutions.`
            ];

            correct = "A";
        }

        if (outcome === "infinite") {
            const a = this.randomInt(2, 18);
            const m = this.randomInt(-10, 10);
            const n = this.randomInt(-25, 25);
            const rightConst = a * m + n;

            question = `How many solutions does the equation ${this.math(`${a}(x ${pm(m)}) ${pm(n)} = ${a}x ${pm(rightConst)}`)} have?`;

            explanation = [
                `Distribute the left side.`,
                `It simplifies to the same expression as the right side.`,
                `So the equation is true for every ${this.ital("x")}.`,
                `Infinitely many solutions.`
            ];

            correct = "D";
        }

        return this.buildProblem(original, question, choicesText, correct, this.makeSteps(explanation));
    };

    P.tplHowManySolutionsZeroHard = function (original) {
        return this.tplHowManySolutionsMixedHard(original);
    };

    // 6) Solve for expression - INTEGER values
    P.tplSolveExpressionNegativeHard = function (original) {
        const a = this.randomInt(4, 12);
        const b = this.randomInt(1, 8);
        const c = this.randomInt(6, 18);
        const d = this.randomInt(3, 20);

        if (c === a) return this.tplSolveExpressionNegativeHard(original);

        const raw = (d - b) / (c - a);
        const expressionValue = Math.round(raw);

        if (!Number.isFinite(raw) || Math.abs(raw - expressionValue) > 0.01) {
            return this.tplSolveExpressionNegativeHard(original);
        }

        const vals = this._integerChoices(expressionValue, 4, 4);
        const { choices, answer } = this.labelChoices(vals, expressionValue);

        const question =
            `If ${this.math(`-${a}(${b} - 4x) + ${b} = ${d} - ${c}(${b} - 4x)`)}, what is the value of ${this.math(`${b} - 4x`)}?`;

        const explanation = this.makeSteps([
            `Let ${this.math(`u = ${b} - 4x`)}.`,
            `Rewrite: ${this.math(`-${a}u + ${b} = ${d} - ${c}u`)}`,
            `Add ${this.math(`${c}u`)} to both sides and subtract ${this.math(`${b}`)} from both sides.`,
            `${this.math(`(${c - a})u = ${d - b}`)}`,
            `${this.math(`u = ${expressionValue}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // 7) Parameter conditions - NOW WITH VARIED ANSWERS
    P.tplParameterConditionsHard = function (original) {
        const scenario = this.randomChoice(["D", "C", "B", "A"]);

        let a, const1;
        let question, explanation, correct;

        const choicesText = [
            "A) None",
            "B) I only",
            "C) I and II only",
            "D) I and III only"
        ];

        if (scenario === "D") {
            a = this.randomInt(5, 15);
            const1 = this.randomInt(2, 12);

            question =
                `The equation ${this.math(`${a}x + ${const1} = a(x + b)`)}, where ${this.ital("a")} and ${this.ital("b")} ` +
                `are constants, has no solutions. Which must be true?<br><br>` +
                `I. ${this.math(`a = ${a}`)}<br>` +
                `II. ${this.math(`b = ${const1}`)}<br>` +
                `III. ${this.math(`b ≠ ${const1}/${a}`)}`;

            explanation = this.makeSteps([
                `Expand the right side: ${this.math(`${a}x + ${const1} = ax + ab`)}`,
                `For no solution, the ${this.ital("x")}-coefficients must match (so ${this.math(`a = ${a}`)}), but constants must differ.`,
                `So ${this.math(`${const1} ≠ ab`)} ⇒ ${this.math(`b ≠ ${const1}/${a}`)} (III TRUE).`,
                `I is TRUE, II is FALSE, III is TRUE.`
            ]);
            correct = "D";
        }
        else if (scenario === "C") {
            a = this.randomInt(3, 10);
            const bVal = this.randomInt(2, 8);
            const1 = a * bVal;

            question =
                `The equation ${this.math(`${a}x + ${const1} = a(x + b)`)}, where ${this.ital("a")} and ${this.ital("b")} ` +
                `are constants, has infinitely many solutions. Which must be true?<br><br>` +
                `I. ${this.math(`a = ${a}`)}<br>` +
                `II. ${this.math(`b = ${bVal}`)}<br>` +
                `III. ${this.math(`b ≠ ${bVal}`)}`;

            explanation = this.makeSteps([
                `Expand the right side: ${this.math(`${a}x + ${const1} = ax + ab`)}`,
                `For infinitely many solutions, both coefficients AND constants must match.`,
                `So ${this.math(`a = ${a}`)} (I TRUE) and ${this.math(`${const1} = ab`)} ⇒ ${this.math(`b = ${bVal}`)} (II TRUE).`,
                `III is FALSE since b must equal ${bVal}.`
            ]);
            correct = "C";
        }
        else if (scenario === "B") {
            a = this.randomInt(4, 12);
            const c = this.randomInt(5, 20);
            const d = this.randomInt(25, 50);

            question =
                `The equation ${this.math(`${a}x + ${c} = ax + ${d}`)}, where ${this.ital("a")} is a constant, ` +
                `has no solutions. Which must be true?<br><br>` +
                `I. ${this.math(`a = ${a}`)}<br>` +
                `II. ${this.math(`a = ${c}`)}<br>` +
                `III. ${this.math(`a ≠ ${a}`)}`;

            explanation = this.makeSteps([
                `For no solution, the ${this.ital("x")}-coefficients must be equal so they cancel, leaving unequal constants.`,
                `Here ${this.math(`${a} = a`)} means ${this.math(`a = ${a}`)} (I TRUE).`,
                `II is FALSE, III is FALSE.`
            ]);
            correct = "B";
        }
        else {
            let a1 = this.randomInt(3, 10);
            let a2 = this.randomInt(3, 10);
            while (a2 === a1) a2 = this.randomInt(3, 10);
            const c = this.randomInt(5, 25);
            const d = this.randomInt(5, 25);

            question =
                `The equation ${this.math(`${a1}x + ${c} = ${a2}x + ${d}`)} has exactly one solution. ` +
                `Which must be true?<br><br>` +
                `I. ${this.math(`x = ${c}`)}<br>` +
                `II. ${this.math(`x = ${d}`)}<br>` +
                `III. ${this.math(`x = 0`)}`;

            const actualSolution = (d - c) / (a1 - a2);
            explanation = this.makeSteps([
                `Solve: ${this.math(`${a1}x - ${a2}x = ${d} - ${c}`)}`,
                `${this.math(`${a1 - a2}x = ${d - c}`)}`,
                `${this.math(`x = ${actualSolution}`)}`,
                `None of the given statements (I, II, III) match this solution.`
            ]);
            correct = "A";
        }

        return this.buildProblem(original, question, choicesText, correct, explanation);
    };

    // 8) Decimal solve - Decimals appropriate here (abstract variable t with decimal coefficients)
    P.tplDecimalCleanSolveHard = function (original) {
        const a = this.randomChoice([0.5, 0.6, 0.7, 0.8, 0.9, 1.2, 1.5]);
        const b = Number((this.randomInt(2, 12) / 10).toFixed(1));
        const c = this.randomInt(4, 15);
        const d = Number((this.randomInt(1, 8) / 100).toFixed(2));
        const e = Number((this.randomInt(10, 35) / 10).toFixed(1));

        if (Math.abs(a - c) < 1e-9) return this.tplDecimalCleanSolveHard(original);

        const solution = Number((((a * b) - (c * d) + e) / (a - c)).toFixed(3));

        const decimalChoices = [
            Number((solution - 0.2).toFixed(3)),
            Number((solution - 0.08).toFixed(3)),
            solution,
            Number((solution + 0.15).toFixed(3))
        ];
        const shuffled = this.shuffle(decimalChoices);
        const { choices, answer } = this.labelChoices(shuffled, solution, v => v.toFixed(3));

        const question =
            `What value of ${this.ital("t")} is the solution to ` +
            `${this.math(`${a}(t - ${b}) = ${c}(t - ${d}) + ${e}`)}?`;

        const explanation = this.makeSteps([
            `Distribute both sides.`,
            `Collect the ${this.ital("t")} terms on one side and constants on the other.`,
            `${this.math(`t ≈ ${solution.toFixed(3)}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // 9) Between which values - NOW WITH VARIED ANSWERS
    P.tplBetweenValuesHard = function (original) {
        const targetRange = this.randomChoice(["A", "B", "C", "D"]);

        let solution, coeff1, coeff2, const1, const2;

        const ranges = {
            "A": { min: -10, max: -6, label: "-10 and -6" },
            "B": { min: -3, max: 3, label: "-3 and 3" },
            "C": { min: 6, max: 10, label: "6 and 10" },
            "D": { min: 11, max: 15, label: "11 and 15" }
        };

        const choicesText = [
            `A) -10 and -6`,
            `B) -3 and 3`,
            `C) 6 and 10`,
            `D) 11 and 15`
        ];

        const range = ranges[targetRange];
        solution = this.randomInt(range.min, range.max);

        coeff1 = this.randomInt(2, 8);
        coeff2 = this.randomInt(2, 8);
        while (coeff2 === coeff1) coeff2 = this.randomInt(2, 8);

        const1 = this.randomInt(-20, 20);
        const2 = (coeff1 - coeff2) * solution + const1;

        const pm = (n) => (n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`);

        const question =
            `If ${this.math(`${coeff1}x ${pm(const1)} = ${coeff2}x ${pm(const2)}`)}, the value of ${this.ital("x")} ` +
            `is between which of the following?`;

        const explanation = this.makeSteps([
            `Move ${this.ital("x")}-terms to one side: ${this.math(`${coeff1}x - ${coeff2}x = ${const2} - ${const1 >= 0 ? const1 : `(${const1})`}`)}`,
            `Simplify: ${this.math(`${coeff1 - coeff2}x = ${const2 - const1}`)}`,
            `Solve: ${this.math(`x = ${solution}`)}`,
            `${solution} is between ${range.label}.`
        ]);

        return this.buildProblem(original, question, choicesText, targetRange, explanation);
    };

    // 11) Infinitely many a+b - INTEGER sum
    P.tplInfiniteSolutionsABFormHard = function (original) {
        const variant = this.randomChoice(["fraction", "distribute", "combined"]);

        let question, explanation, sum, vals;

        if (variant === "fraction") {
            const a = this.randomInt(2, 12);
            const leftConstant = this.randomInt(5, 35);
            sum = a + leftConstant;
            const denom = this.randomChoice([2, 3, 4, 5, 6]);

            vals = this._integerChoices(sum, 4, 5);
            const { choices, answer } = this.labelChoices(vals, sum);

            question =
                `The equation ${this.math(`(ax + ${leftConstant})/${denom} = (${a}x + b)/${denom}`)} has infinitely many solutions. ` +
                `What is ${this.math(`a + b`)}?`;

            explanation = this.makeSteps([
                `Since the denominators are the same, the numerators must be equal for infinitely many solutions.`,
                `${this.math(`ax + ${leftConstant} = ${a}x + b`)}`,
                `So ${this.math(`a = ${a}`)} and ${this.math(`b = ${leftConstant}`)}.`,
                `${this.math(`a + b = ${a} + ${leftConstant} = ${sum}`)}`
            ]);

            return this.buildProblem(original, question, choices, answer, explanation);
        }
        else if (variant === "distribute") {
            const a = this.randomInt(2, 10);
            const c = this.randomInt(1, 8);
            const d = this.randomInt(-10, 10);
            const rightConst = a * c + d;
            sum = a + rightConst;

            vals = this._integerChoices(sum, 4, 6);
            const { choices, answer } = this.labelChoices(vals, sum);

            question =
                `The equation ${this.math(`${a}(x + ${c}) + ${d >= 0 ? d : `(${d})`} = ax + b`)} has infinitely many solutions. ` +
                `What is ${this.math(`a + b`)}?`;

            explanation = this.makeSteps([
                `Distribute left side: ${this.math(`${a}x + ${a * c} + ${d >= 0 ? d : `(${d})`} = ax + b`)}`,
                `Simplify: ${this.math(`${a}x + ${rightConst} = ax + b`)}`,
                `For infinitely many solutions: ${this.math(`a = ${a}`)} and ${this.math(`b = ${rightConst}`)}.`,
                `${this.math(`a + b = ${sum}`)}`
            ]);

            return this.buildProblem(original, question, choices, answer, explanation);
        }
        else {
            const c = this.randomInt(2, 5);
            const a = this.randomInt(2, 8);
            const b = this.randomInt(1, 10);
            const d = this.randomChoice([2, 3, 4, 6]);
            const e = (c * a) / d;
            const f = (c * b) / d;

            if (!Number.isInteger(e) || !Number.isInteger(f) || e < 1 || f < 1) {
                return this.tplInfiniteSolutionsABFormHard(original);
            }

            sum = a + b;

            vals = this._integerChoices(sum, 4, 5);
            const { choices, answer } = this.labelChoices(vals, sum);

            question =
                `The equation ${this.math(`${c}(ax + b) = ${d}(${e}x + ${f})`)} has infinitely many solutions. ` +
                `What is ${this.math(`a + b`)}?`;

            explanation = this.makeSteps([
                `Distribute both sides: ${this.math(`${c}ax + ${c}b = ${d * e}x + ${d * f}`)}`,
                `For infinitely many solutions, coefficients must match: ${this.math(`${c}a = ${d * e}`)} so ${this.math(`a = ${a}`)}.`,
                `Constants must match: ${this.math(`${c}b = ${d * f}`)} so ${this.math(`b = ${b}`)}.`,
                `${this.math(`a + b = ${sum}`)}`
            ]);

            return this.buildProblem(original, question, choices, answer, explanation);
        }
    };

    // 12) Polygon - NOW WITH VARIED ANSWERS
    P.tplPolygonSidesEquationHard = function (original) {
        const total = this.randomInt(20, 45);
        const multiplier = this.randomInt(3, 9);
        const fixed = this.randomInt(3, 12);

        const correctCoeff = multiplier + 1;

        const correctPos = this.randomChoice(["A", "B", "C", "D"]);

        let choicesText;
        if (correctPos === "A") {
            choicesText = [
                `A) ${correctCoeff}n + ${fixed} = ${total}`,
                `B) ${correctCoeff + 1}n + ${fixed} = ${total}`,
                `C) n + ${multiplier} = ${total}`,
                `D) ${correctCoeff + 2}n + ${fixed} = ${total}`
            ];
        } else if (correctPos === "B") {
            choicesText = [
                `A) ${correctCoeff - 1}n + ${fixed} = ${total}`,
                `B) ${correctCoeff}n + ${fixed} = ${total}`,
                `C) n + ${multiplier} = ${total}`,
                `D) ${correctCoeff + 1}n + ${fixed} = ${total}`
            ];
        } else if (correctPos === "C") {
            choicesText = [
                `A) ${correctCoeff - 2}n + ${fixed} = ${total}`,
                `B) ${correctCoeff - 1}n + ${fixed} = ${total}`,
                `C) ${correctCoeff}n + ${fixed} = ${total}`,
                `D) ${correctCoeff + 1}n + ${fixed} = ${total}`
            ];
        } else {
            choicesText = [
                `A) ${correctCoeff - 2}n + ${fixed} = ${total}`,
                `B) ${correctCoeff - 1}n + ${fixed} = ${total}`,
                `C) n + ${multiplier} = ${total}`,
                `D) ${correctCoeff}n + ${fixed} = ${total}`
            ];
        }

        const question =
            `Each side of a ${total}-sided polygon has one of three lengths. ` +
            `The number of sides with length 8 cm is ${multiplier} times the number of sides ${this.ital("n")} with length 3 cm. ` +
            `There are ${fixed} sides with length 4 cm. Which equation must be true for the value of ${this.ital("n")}?`;

        const explanation = this.makeSteps([
            `3 cm sides: ${this.ital("n")}`,
            `8 cm sides: ${this.math(`${multiplier}n`)}`,
            `4 cm sides: ${fixed}`,
            `Total sides: ${this.math(`n + ${multiplier}n + ${fixed} = ${total}`)}`,
            `Combine like terms: ${this.math(`${correctCoeff}n + ${fixed} = ${total}`)}`
        ]);

        return this.buildProblem(original, question, choicesText, correctPos, explanation);
    };

    // 13) Parameter no solution - NOW WITH VARIED ANSWERS (fractions appropriate)
    P.tplParameterNoSolutionCleanHard = function (original) {
        const variant = this.randomChoice(["positive", "negative", "larger", "fraction"]);

        let question, explanation, choicesText, correct;

        if (variant === "positive") {
            const a = this.randomInt(2, 6);
            const multiplier = this.randomInt(4, 12);
            const result = this.randomInt(50, 150);

            choicesText = [
                `A) -1/${multiplier}`,
                `B) 1/${multiplier}`,
                `C) ${multiplier}`,
                `D) -${multiplier}`
            ];

            question =
                `In ${this.math(`-${a}x + ${a * multiplier}px = ${result}`)}, ${this.ital("p")} is a constant. ` +
                `The equation has no solution. What is ${this.ital("p")}?`;

            explanation = this.makeSteps([
                `For no solution, the ${this.ital("x")}-coefficient must become 0.`,
                `${this.math(`-${a} + ${a * multiplier}p = 0`)}`,
                `${this.math(`p = 1/${multiplier}`)}`
            ]);
            correct = "B";
        }
        else if (variant === "negative") {
            const a = this.randomInt(2, 6);
            const multiplier = this.randomInt(4, 12);
            const result = this.randomInt(50, 150);

            choicesText = [
                `A) -1/${multiplier}`,
                `B) -${multiplier}`,
                `C) ${multiplier}`,
                `D) 1/${multiplier}`
            ];

            question =
                `In ${this.math(`${a}x - ${a * multiplier}px = ${result}`)}, ${this.ital("p")} is a constant. ` +
                `The equation has no solution. What is ${this.ital("p")}?`;

            explanation = this.makeSteps([
                `For no solution, the ${this.ital("x")}-coefficient must become 0.`,
                `${this.math(`${a} - ${a * multiplier}p = 0`)}`,
                `${this.math(`p = 1/${multiplier}`)}`
            ]);
            correct = "D";
        }
        else if (variant === "larger") {
            const a = this.randomInt(2, 5);
            const b = this.randomInt(2, 4);
            const result = this.randomInt(30, 100);

            const pVal = -a / b;
            const pDisplay = Number.isInteger(pVal) ? `${pVal}` : `-${a}/${b}`;

            choicesText = [
                `A) ${a}/${b}`,
                `B) -${b}/${a}`,
                `C) ${pDisplay}`,
                `D) ${b}/${a}`
            ];

            question =
                `In ${this.math(`${a}x + ${b}px = ${result}`)}, ${this.ital("p")} is a constant. ` +
                `The equation has no solution. What is ${this.ital("p")}?`;

            explanation = this.makeSteps([
                `For no solution, the ${this.ital("x")}-coefficient must become 0.`,
                `${this.math(`${a} + ${b}p = 0`)}`,
                `${this.math(`p = ${pDisplay}`)}`
            ]);
            correct = "C";
        }
        else {
            const a = this.randomInt(3, 8);
            const b = this.randomInt(2, 6);
            const result = this.randomInt(40, 120);

            choicesText = [
                `A) -${a}/${b}`,
                `B) ${a}/${b}`,
                `C) -${b}/${a}`,
                `D) ${b}/${a}`
            ];

            question =
                `In ${this.math(`(${a}/${b})x + px = ${result}`)}, ${this.ital("p")} is a constant. ` +
                `The equation has no solution. What is ${this.ital("p")}?`;

            explanation = this.makeSteps([
                `For no solution, the ${this.ital("x")}-coefficient must become 0.`,
                `${this.math(`${a}/${b} + p = 0`)}`,
                `${this.math(`p = -${a}/${b}`)}`
            ]);
            correct = "A";
        }

        return this.buildProblem(original, question, choicesText, correct, explanation);
    };

    // 14) Bidirectional rate - INTEGER minutes
    P.tplBidirectionalRateCleanHard = function (original) {
        const initial = this.randomInt(12, 28) * 1000;
        const fillRate = this.randomInt(50, 120);
        const drainRate = this.randomInt(20, 80);
        const netRate = fillRate - drainRate;
        const increase = this.randomInt(1500, 5000);
        const target = initial + increase;
        const time = Math.round(increase / netRate);

        if (netRate <= 0) return this.tplBidirectionalRateCleanHard(original);
        if (Math.abs(increase / netRate - time) > 0.5) return this.tplBidirectionalRateCleanHard(original);

        const vals = this._integerChoices(time, 4, 12);
        const { choices, answer } = this.labelChoices(vals, time);

        const question =
            `A swimming pool contains ${initial.toLocaleString()} gallons of water. Water is being added at ${fillRate} gallons per minute ` +
            `while simultaneously being drained at ${drainRate} gallons per minute. ` +
            `How many minutes will it take for the pool to contain ${target.toLocaleString()} gallons?`;

        const explanation = this.makeSteps([
            `Net rate: ${this.math(`${fillRate} - ${drainRate} = ${netRate}`)} gallons per minute`,
            `Amount needed: ${this.math(`${target.toLocaleString()} - ${initial.toLocaleString()} = ${increase.toLocaleString()}`)} gallons`,
            `Time: ${this.math(`${increase.toLocaleString()} ÷ ${netRate} = ${time}`)} minutes`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // 15) Constant rate drain - INTEGER minutes
    P.tplConstantRateDrainCleanHard = function (original) {
        const initial = this.randomInt(600, 1200);
        const time1 = this.randomInt(8, 20);
        const rate = this.randomInt(15, 45);
        const removed1 = rate * time1;
        const remaining1 = initial - removed1;

        if (remaining1 < 100) {
            return this.tplConstantRateDrainCleanHard(original);
        }

        const targetRemoved = rate * this.randomInt(15, 35);
        const target = initial - targetRemoved;
        const totalTime = targetRemoved / rate;

        if (target < 50 || !Number.isInteger(totalTime)) {
            return this.tplConstantRateDrainCleanHard(original);
        }

        const vals = this._integerChoices(totalTime, 4, 5);
        const { choices, answer } = this.labelChoices(vals, totalTime);

        const question =
            `A water tank initially contains ${initial} gallons. Water is being drained at a constant rate. ` +
            `After ${time1} minutes, ${remaining1} gallons remain. At this rate, how many minutes after draining ` +
            `began will the tank contain exactly ${target} gallons?`;

        const explanation = this.makeSteps([
            `Water drained in ${time1} minutes: ${this.math(`${initial} - ${remaining1} = ${removed1}`)} gallons`,
            `Rate: ${this.math(`${removed1} ÷ ${time1} = ${rate}`)} gallons per minute`,
            `Total to drain: ${this.math(`${initial} - ${target} = ${targetRemoved}`)} gallons`,
            `Time: ${this.math(`${targetRemoved} ÷ ${rate} = ${totalTime}`)} minutes`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // ===== VARIETY TEMPLATES - ALL WITH INTEGER CHOICES WHERE APPROPRIATE =====

    // Miles should be integers
    P.tplRentalMilesEqualHard = function (original) {
        const miles = this.randomInt(40, 250);
        let rate1 = this.randomChoice([0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50]);
        let rate2 = this.randomChoice([0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50]);
        while (rate2 === rate1) {
            rate2 = this.randomChoice([0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50]);
        }
        const flat2 = this.randomInt(20, 80);
        const flat1 = Math.round(flat2 + (rate2 - rate1) * miles);

        if (flat1 < 10 || flat1 > 150) return this.tplRentalMilesEqualHard(original);

        const vals = this._integerChoices(miles, 4, 25);
        const { choices, answer } = this.labelChoices(vals, miles);

        const question =
            `A rental company charges a flat fee of $${flat1} plus $${rate1.toFixed(2)} per mile. ` +
            `Another company charges $${flat2} plus $${rate2.toFixed(2)} per mile. ` +
            `For how many miles will the total cost be the same at both companies?`;

        const explanation = this.makeSteps([
            `Set costs equal: ${this.math(`${flat1} + ${rate1.toFixed(2)}m = ${flat2} + ${rate2.toFixed(2)}m`)}`,
            `Move the ${this.ital("m")} terms together: ${this.math(`${flat1 - flat2} = ${(rate2 - rate1).toFixed(2)}m`)}`,
            `Divide: ${this.math(`m = ${miles}`)} miles`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // Consecutive integers - must be integers
    P.tplConsecutiveIntegersHard = function (original) {
        const start = this.randomInt(-25, 25);
        const sum = start + (start + 1);

        const vals = this._integerChoices(start, 4, 6);
        const { choices, answer } = this.labelChoices(vals, start);

        const question =
            `Two consecutive integers have a sum of ${sum}. What is the smaller integer?`;

        const explanation = this.makeSteps([
            `Let the smaller integer be ${this.math(this.ital("x"))}.`,
            `Then the next integer is ${this.math(`x + 1`)}.`,
            `Equation: ${this.math(`x + (x + 1) = ${sum}`)}`,
            `Solve: ${this.math(`2x + 1 = ${sum}`)} → ${this.math(`x = ${start}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // Perimeter/dimension - should be integers
    P.tplPerimeterExpressionHard = function (original) {
        const w = this.randomInt(3, 25);
        const mult = this.randomInt(2, 6);
        const add = this.randomInt(1, 12);
        const L = mult * w + add;
        const Pval = 2 * (w + L);

        const vals = this._integerChoices(w, 4, 6);
        const { choices, answer } = this.labelChoices(vals, w);

        const question =
            `A rectangle has a perimeter of ${Pval}. Its length is ${this.math(`${mult}x + ${add}`)} and its width is ${this.ital("x")}. ` +
            `What is the value of ${this.ital("x")}?`;

        const explanation = this.makeSteps([
            `Perimeter formula: ${this.math(`P = 2(w + L)`)}`,
            `Substitute: ${this.math(`${Pval} = 2(x + (${mult}x + ${add}))`)}`,
            `Simplify: ${this.math(`${Pval} = 2(${mult + 1}x + ${add})`)}`,
            `Solve: ${this.math(`x = ${w}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // Price - should be integers (dollars)
    P.tplDiscountAndTaxHard = function (original) {
        const originalPrice = this.randomInt(40, 200);
        const discount = this.randomChoice([10, 12, 15, 18, 20, 25, 30]);
        const tax = this.randomChoice([5, 6, 7, 8, 9, 10, 11]);

        const finalPrice = Math.round(originalPrice * (1 - discount / 100) * (1 + tax / 100));

        const vals = this._integerChoices(originalPrice, 4, 20);
        const { choices, answer } = this.labelChoices(vals, originalPrice);

        // Randomly choose item type for variety
        const item = this.randomChoice([
            "a jacket", "a pair of shoes", "a backpack", "a watch",
            "a laptop bag", "a pair of headphones", "a sweater", "a calculator"
        ]);

        const question =
            `A store sells ${item} at a ${discount}% discount. After applying a ${tax}% sales tax to the discounted price, ` +
            `the final cost is $${finalPrice}. What was the original price of ${item.replace("a ", "the ")}?`;

        const explanation = this.makeSteps([
            `Let ${this.ital("p")} be the original price.`,
            `After ${discount}% discount: ${this.math(`p × ${(1 - discount / 100).toFixed(2)}`)}`,
            `After ${tax}% tax: ${this.math(`p × ${(1 - discount / 100).toFixed(2)} × ${(1 + tax / 100).toFixed(2)} = ${finalPrice}`)}`,
            `Solving for ${this.ital("p")}: ${this.math(`p = ${finalPrice} ÷ ${((1 - discount / 100) * (1 + tax / 100)).toFixed(4)} = ${originalPrice}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // Time - should be integers (minutes)
    P.tplWorkRateHard = function (original) {
        const rate = this.randomInt(4, 20);
        const time = this.randomInt(8, 30);
        const total = rate * time;

        const vals = this._integerChoices(time, 4, 6);
        const { choices, answer } = this.labelChoices(vals, time);

        const question =
            `Machine processes ${total} parts at ${rate} parts/min. How many minutes total?`;

        const explanation = this.makeSteps([
            `Time = ${this.math(`${total} ÷ ${rate} = ${time}`)} min`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // Age - MUST be integers
    P.tplAgeDifferenceHard = function (original) {
        const olderNow = this.randomInt(15, 75);
        const diff = this.randomInt(2, 30);
        const youngerNow = olderNow - diff;

        if (youngerNow < 1) return this.tplAgeDifferenceHard(original);

        const vals = this._integerChoices(youngerNow, 4, 8);
        const { choices, answer } = this.labelChoices(vals, youngerNow);

        const question =
            `A person is ${olderNow} years old, which is ${diff} years older than their sibling. ` +
            `How old is the sibling?`;

        const explanation = this.makeSteps([
            `Younger age = older age − difference`,
            `${this.math(`${olderNow} - ${diff} = ${youngerNow}`)} years old`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // Temperature - should be integers (degrees)
    P.tplTemperatureConversionHard = function (original) {
        const C = this.randomInt(-20, 45);
        const F = Math.round((9 / 5) * C + 32);

        const vals = this._integerChoices(C, 4, 10);
        const { choices, answer } = this.labelChoices(vals, C);

        const question =
            `The formula ${this.math(`F = (9/5)C + 32`)} converts Celsius to Fahrenheit. ` +
            `If the temperature is ${F}°F, what is the temperature in Celsius?`;

        const explanation = this.makeSteps([
            `Substitute: ${this.math(`${F} = (9/5)C + 32`)}`,
            `Subtract 32: ${this.math(`${F - 32} = (9/5)C`)}`,
            `Multiply by 5/9: ${this.math(`C = ${C}°C`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // GB - should be integers
    P.tplPhonePlanHard = function (original) {
        const base = this.randomInt(15, 80);
        const perGB = this.randomInt(4, 25);
        const gb = this.randomInt(1, 18);
        const total = base + perGB * gb;

        const vals = this._integerChoices(gb, 4, 4);
        const { choices, answer } = this.labelChoices(vals, gb);

        const question =
            `A phone plan costs $${base} plus $${perGB} per GB of data. ` +
            `If the total bill is $${total}, how many GB of data were used?`;

        const explanation = this.makeSteps([
            `Write equation: ${this.math(`${base} + ${perGB}x = ${total}`)}`,
            `Subtract ${base}: ${this.math(`${perGB}x = ${total - base}`)}`,
            `Divide: ${this.math(`x = ${gb}`)} GB`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // Pounds - should be integers
    P.tplShippingWeightHard = function (original) {
        const base = this.randomInt(4, 15);
        const perLb = this.randomChoice([1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75]);
        const lbs = this.randomInt(2, 20);
        const total = Number((base + perLb * lbs).toFixed(2));

        const vals = this._integerChoices(lbs, 4, 4);
        const { choices, answer } = this.labelChoices(vals, lbs);

        const question =
            `A shipping company charges a flat fee of $${base} plus $${perLb.toFixed(2)} per pound. ` +
            `The total cost to ship a package was $${total.toFixed(2)}. ` +
            `What was the weight of the package, in pounds?`;

        const explanation = this.makeSteps([
            `Write an equation: ${this.math(`${base} + ${perLb.toFixed(2)}x = ${total.toFixed(2)}`)}`,
            `Subtract ${base}: ${this.math(`${perLb.toFixed(2)}x = ${(total - base).toFixed(2)}`)}`,
            `Divide by ${perLb.toFixed(2)}: ${this.math(`x = ${lbs}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // Abstract variable x - integers
    P.tplDistributeBothSidesHard = function (original) {
        let a = this.randomInt(2, 12);
        const b = this.randomInt(1, 12);
        let c = this.randomInt(2, 12);
        while (c === a) c = this.randomInt(2, 12);

        const solution = this.randomInt(-20, 15);
        const cd = a * b + (a - c) * solution;
        const d = Math.round(cd / c);

        if (Math.abs((c * d - a * b) / (a - c) - solution) > 0.1) {
            return this.tplDistributeBothSidesHard(original);
        }

        const vals = this._integerChoices(solution, 4, 6);
        const { choices, answer } = this.labelChoices(vals, solution);

        const question =
            `What is the solution to the equation ${this.math(`${a}(x + ${b}) = ${c}(x + ${d})`)}?`;

        const explanation = this.makeSteps([
            `Distribute: ${this.math(`${a}x + ${a * b} = ${c}x + ${c * d}`)}`,
            `Move variables: ${this.math(`${a}x - ${c}x = ${c * d - a * b}`)}`,
            `Factor: ${this.math(`${a - c}x = ${c * d - a * b}`)}`,
            `Solve: ${this.math(`x = ${solution}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // Speed - should be integers (mph)
    P.tplUnitRateConversionHard = function (original) {
        const speed = this.randomInt(20, 85);
        const hours = this.randomInt(2, 10);
        const miles = speed * hours;

        const vals = this._integerChoices(speed, 4, 10);
        const { choices, answer } = this.labelChoices(vals, speed);

        const question =
            `A car travels ${miles} miles in ${hours} hours at a constant speed. ` +
            `What is its speed in miles per hour?`;

        const explanation = this.makeSteps([
            `Speed = distance ÷ time`,
            `${this.math(`speed = ${miles} ÷ ${hours} = ${speed}`)} miles per hour`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };
}