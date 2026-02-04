// public/generators/algebra/linearEqOneVar/hard.js
// BALANCED EXPLANATIONS: Clear reasoning + clean formatting

if (!window.ProblemGenerator) {
    console.error("❌ ProblemGenerator not loaded before hard.js");
} else {
    const P = window.ProblemGenerator.prototype;

    // =========================================================
    // HELPER: Generate integer-only choices (no decimals)
    // =========================================================
    P._integerChoices = function (correct, count = 4, spread = 5) {
        const choices = new Set([correct]);
        const offsets = this.shuffle([-3, -2, -1, 1, 2, 3, 4, 5, -4, -5, 6, -6]);
        let i = 0;
        while (choices.size < count && i < offsets.length) {
            const candidate = correct + offsets[i] * Math.ceil(spread / 3);
            if (!choices.has(candidate)) {
                choices.add(candidate);
            }
            i++;
        }
        while (choices.size < count) {
            const rand = correct + this.randomChoice([-1, 1]) * this.randomInt(1, spread * 2);
            choices.add(rand);
        }
        return this.shuffle(Array.from(choices));
    };

    // =========================================================
    // 1) Infinitely Many Solutions
    // =========================================================
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

        const explanation =
            `For infinitely many solutions, both sides must match exactly for every x.<br><br>` +
            `Distribute the right side:<br>` +
            `${this.math(`${a}x + ${b} - s/${denominator} = ${a}x ${rightCoeff >= 0 ? '+' : ''} ${a * rightCoeff}`)}<br><br>` +
            `The ${this.math(`${a}x`)} terms already match. Now match the constants:<br>` +
            `${this.math(`${b} - s/${denominator} = ${a * rightCoeff}`)}<br><br>` +
            `Solve for s:<br>` +
            `${this.math(`s/${denominator} = ${b} - ${a * rightCoeff}`)}<br>` +
            `${this.math(`s = ${denominator}(${b - a * rightCoeff}) = ${s}`)}`;

        return this.buildProblem(original, question, labeled, answer, explanation);
    };

    // =========================================================
    // 2) No Solution k
    // =========================================================
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

        const explanation =
            `For no solution, the x-coefficients must be equal (so they cancel), but the constants must be different.<br><br>` +
            `Set the x-coefficients equal:<br>` +
            `${this.math(`${a}k = ${numerator}/${denom}`)}<br><br>` +
            `Solve for k:<br>` +
            `${this.math(`k = (${numerator}/${denom}) ÷ ${a} ≈ ${k.toFixed(3)}`)}`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // =========================================================
    // 3) Negative coefficient
    // =========================================================
    P.tplNegativeCoefficientSolveHard = function (original) {
        const a = this.randomInt(2, 6);
        const b = this.randomInt(1, 12);
        const solution = this.randomInt(-35, -10);
        const result = -a * (solution + b);

        const vals = this._integerChoices(solution, 4, 6);
        const { choices, answer } = this.labelChoices(vals, solution);

        const question =
            `What value of ${this.ital("t")} is the solution to ${this.math(`-${a}(t + ${b}) = ${result}`)}?`;

        const explanation =
            `Divide both sides by -${a}:<br>` +
            `${this.math(`t + ${b} = ${-result / a}`)}<br><br>` +
            `Subtract ${b}:<br>` +
            `${this.math(`t = ${solution}`)}`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // =========================================================
    // 4) How many solutions - MIXED
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
        let explanation = "";
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

            explanation =
                `Move all x-terms to one side and constants to the other.<br><br>` +
                `Since the x-coefficients are different (${a} and ${b}), the equation simplifies to one specific value of x.<br><br>` +
                `This means exactly one solution.`;

            correct = "B";
        }

        if (outcome === "zero") {
            const a = this.randomInt(2, 18);
            const c = this.randomInt(-40, 40);
            let d = this.randomInt(-40, 40);
            while (d === c) d = this.randomInt(-40, 40);

            question = `How many solutions does the equation ${this.math(`${a}x ${pm(c)} = ${a}x ${pm(d)}`)} have?`;

            explanation =
                `Subtract ${this.math(`${a}x`)} from both sides:<br>` +
                `${this.math(`${c} = ${d}`)}<br><br>` +
                `This is a false statement (${c} does not equal ${d}).<br><br>` +
                `Zero solutions.`;

            correct = "A";
        }

        if (outcome === "infinite") {
            const a = this.randomInt(2, 18);
            const m = this.randomInt(-10, 10);
            const n = this.randomInt(-25, 25);
            const rightConst = a * m + n;

            question = `How many solutions does the equation ${this.math(`${a}(x ${pm(m)}) ${pm(n)} = ${a}x ${pm(rightConst)}`)} have?`;

            explanation =
                `Distribute the left side:<br>` +
                `${this.math(`${a}x ${pm(a * m)} ${pm(n)} = ${a}x ${pm(rightConst)}`)}<br><br>` +
                `Simplify the left side:<br>` +
                `${this.math(`${a}x ${pm(a * m + n)} = ${a}x ${pm(rightConst)}`)}<br><br>` +
                `Both sides are identical, so this is true for every x.<br><br>` +
                `Infinitely many solutions.`;

            correct = "D";
        }

        return this.buildProblem(original, question, choicesText, correct, explanation);
    };

    P.tplHowManySolutionsZeroHard = function (original) {
        return this.tplHowManySolutionsMixedHard(original);
    };

    // =========================================================
    // 6) Solve for expression
    // =========================================================
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

        const explanation =
            `Let ${this.math(`u = ${b} - 4x`)} to simplify.<br><br>` +
            `The equation becomes:<br>` +
            `${this.math(`-${a}u + ${b} = ${d} - ${c}u`)}<br><br>` +
            `Add ${this.math(`${c}u`)} to both sides and subtract ${b}:<br>` +
            `${this.math(`${c - a}u = ${d - b}`)}<br><br>` +
            `Divide by ${c - a}:<br>` +
            `${this.math(`u = ${expressionValue}`)}`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // =========================================================
    // 7) Parameter conditions
    // =========================================================
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

            explanation =
                `Expand the right side:<br>` +
                `${this.math(`${a}x + ${const1} = ax + ab`)}<br><br>` +
                `For no solution, x-coefficients must match but constants must differ.<br><br>` +
                `The x-coefficients match when ${this.math(`a = ${a}`)} (I is TRUE).<br><br>` +
                `The constants differ when ${this.math(`${const1} ≠ ab`)}, which means ${this.math(`b ≠ ${const1}/${a}`)} (III is TRUE).<br><br>` +
                `II is FALSE because b cannot equal ${const1} if the constants differ.`;

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

            explanation =
                `Expand the right side:<br>` +
                `${this.math(`${a}x + ${const1} = ax + ab`)}<br><br>` +
                `For infinitely many solutions, both the x-coefficients AND the constants must match.<br><br>` +
                `From the x-coefficients: ${this.math(`a = ${a}`)} (I is TRUE).<br><br>` +
                `From the constants: ${this.math(`${const1} = ab`)}, so ${this.math(`b = ${const1}/${a} = ${bVal}`)} (II is TRUE).<br><br>` +
                `III is FALSE because b must equal ${bVal}.`;

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

            explanation =
                `For no solution, the x-coefficients must be equal (so they cancel) but the constants must be different.<br><br>` +
                `The x-coefficients are ${a} and a, so ${this.math(`a = ${a}`)} (I is TRUE).<br><br>` +
                `II and III are both FALSE.`;

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
            explanation =
                `Solve the equation:<br>` +
                `${this.math(`${a1}x - ${a2}x = ${d} - ${c}`)}<br>` +
                `${this.math(`${a1 - a2}x = ${d - c}`)}<br>` +
                `${this.math(`x = ${actualSolution}`)}<br><br>` +
                `None of the statements I, II, or III match this solution.`;

            correct = "A";
        }

        return this.buildProblem(original, question, choicesText, correct, explanation);
    };

    // =========================================================
    // 8) Decimal solve
    // =========================================================
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

        const explanation =
            `Distribute both sides:<br>` +
            `${this.math(`${a}t - ${(a * b).toFixed(2)} = ${c}t - ${(c * d).toFixed(2)} + ${e}`)}<br><br>` +
            `Collect t-terms on the left and constants on the right:<br>` +
            `${this.math(`${a}t - ${c}t = ${(- c * d + e + a * b).toFixed(2)}`)}<br><br>` +
            `Simplify and solve:<br>` +
            `${this.math(`t ≈ ${solution.toFixed(3)}`)}`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // Continue with remaining templates...
    // (I'll add more in the next part due to length)

    console.log("✅ Linear Equations Hard loaded (partial - first 8 templates)");
}