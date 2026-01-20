// public/problem-generator.js

class ProblemGenerator {
    constructor() {
        this.generatedCount = 0;
        this.sessionCounter = 1; // for clean readable IDs
    }

    // =========================================================
    // MAIN GENERATE ENTRY
    // =========================================================
    generate(originalProblem) {
        try {
            if (!originalProblem || !originalProblem.subskill) {
                console.warn("ProblemGenerator: invalid originalProblem", originalProblem);
                return null;
            }

            const generator = this.getGenerator(originalProblem.subskill);

            if (!generator) {
                console.warn(`No generator for subskill: ${originalProblem.subskill}`);
                return null;
            }

            const newProblem = generator(originalProblem);
            if (!newProblem) return null;

            this.generatedCount++;
            return newProblem;
        } catch (err) {
            console.error("❌ ProblemGenerator.generate() crashed:", err);
            return null;
        }
    }

    getGenerator(subskill) {
        const generators = {
            "linear-equations-one-variable": this.generateLinearEquationOneVar.bind(this),
        };

        return generators[subskill] || null;
    }

    // =========================================================
    // HELPERS
    // =========================================================
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    randomVarSymbol() {
        const vars = ["x", "y", "t", "n", "m", "p", "q", "r", "k"];
        return this.randomChoice(vars);
    }

    difficultyCode(difficulty) {
        const d = (difficulty || "medium").toLowerCase();
        if (d === "easy") return "E";
        if (d === "hard") return "H";
        return "M";
    }

    makeGenId(difficulty) {
        const num = String(this.sessionCounter++).padStart(4, "0");
        const diff = this.difficultyCode(difficulty);
        return `GEN-ALG1-${diff}-${num}`;
    }

    makeSteps(stepsArray) {
        // ✅ HTML-friendly steps for your explanation section
        return stepsArray.map((s, i) => `${i + 1}) ${s}`).join("<br>");
    }

    /**
     * ✅ SAFE CHOICE GENERATOR (prevents infinite loops / freezes)
     * - handles decimals
     * - handles small spreads safely
     * - always returns count answers
     */
    generateChoicesNumber(correctAnswer, count = 4, spread = 6) {
        const base = Number(correctAnswer);

        // if base isn't a real number, fallback
        if (!Number.isFinite(base)) {
            const fallback = [0, 1, 2, 3].slice(0, count);
            return this.shuffle(fallback);
        }

        const choices = new Set();
        choices.add(base);

        let tries = 0;
        const MAX_TRIES = 200;

        while (choices.size < count && tries < MAX_TRIES) {
            tries++;

            // make sure we have enough space to produce unique values
            const effectiveSpread = Math.max(2, Math.abs(spread));

            // create candidate
            const offset = this.randomInt(-effectiveSpread, effectiveSpread);

            // decimals -> allow mild decimal offsets too (prevents duplicates)
            const decimalBump = (Math.random() < 0.25) ? Number((Math.random() * 0.8 - 0.4).toFixed(2)) : 0;

            let candidate = base + offset + decimalBump;

            // SAT-style: reduce crazy decimals sometimes
            if (Math.abs(candidate) < 200 && Math.random() < 0.7) {
                candidate = Number(candidate.toFixed(2));
            }

            if (candidate !== base) choices.add(candidate);
        }

        // ✅ Absolute fallback: force-fill with wider offsets
        while (choices.size < count) {
            const forced = base + this.randomInt(-50, 50);
            choices.add(forced);
        }

        return this.shuffle(Array.from(choices));
    }

    labelChoices(values, correctValue, formatter = (v) => `${v}`) {
        const labeled = values.map((val, idx) => {
            const letter = String.fromCharCode(65 + idx);
            return `${letter}) ${formatter(val)}`;
        });

        let correctIndex = values.findIndex((v) => v === correctValue);

        // backup compare as strings
        if (correctIndex === -1) {
            correctIndex = values.findIndex((v) => `${v}` === `${correctValue}`);
        }

        // last-resort safety so answer letter never breaks
        if (correctIndex === -1) correctIndex = 0;

        return {
            choices: labeled,
            answer: String.fromCharCode(65 + correctIndex),
        };
    }

    buildProblem(original, question, choices, answer, explanation) {
        return {
            id: this.makeGenId(original.difficulty),
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question,
            imageUrl: null,
            choices,
            answer,
            explanation,
            type: "generated",
            baseTemplate: original.id,
        };
    }

    // =========================================================
    // SUBSKILL: Linear Equations (One Variable)
    // =========================================================
    generateLinearEquationOneVar(original) {
        const difficulty = (original.difficulty || "medium").toLowerCase();

        const easyTemplates = [
            this.tplSimpleAddition,
            this.tplSimpleSubtraction,
            this.tplDistributiveOneSide,
            this.tplTwoSidedBasic,
        ];

        const mediumTemplates = [
            this.tplWithFractions,
            this.tplNegativeCoefficient,
            this.tplSolveForExpression,
            this.tplPerimeterWord,
            this.tplPercentChangeWord,
        ];

        const hardTemplates = [
            this.tplInfiniteSolutionsSolveConstant,
            this.tplNoSolutionsSolveConstant,
            this.tplHowManySolutions,
            this.tplCostPerMileChooseEquation,
            this.tplStationsExpression,
            this.tplConstantRateWordHard,
            this.tplDecimalCoefficientsSolve,
            this.tplParameterNoSolutionB,
            this.tplComplexMultiStep,
            this.tplTicketSalesWord,
        ];

        let pool = mediumTemplates.concat(easyTemplates);

        if (difficulty === "easy") pool = easyTemplates;
        if (difficulty === "hard") pool = hardTemplates;

        const template = this.randomChoice(pool);
        return template.call(this, original);
    }

    // =========================================================
    // EASY / MEDIUM TEMPLATES
    // =========================================================

    tplSimpleAddition(original) {
        const v = this.randomVarSymbol();
        const a = this.randomInt(2, 9);
        const solution = this.randomInt(2, 15);
        const b = this.randomInt(1, 20);
        const c = a * solution + b;

        const vals = this.generateChoicesNumber(solution, 4, 5);
        const { choices, answer } = this.labelChoices(vals, solution);

        const question = `If ${a}${v} + ${b} = ${c}, what is the value of ${v}?`;
        const explanation = this.makeSteps([
            `Subtract ${b} from both sides: ${a}${v} = ${c - b}.`,
            `Divide both sides by ${a}.`,
            `So ${v} = ${solution}.`,
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    }

    tplSimpleSubtraction(original) {
        const v = this.randomVarSymbol();
        const a = this.randomInt(2, 9);
        const solution = this.randomInt(3, 20);
        const b = this.randomInt(1, 15);
        const c = a * solution - b;

        const vals = this.generateChoicesNumber(solution, 4, 6);
        const { choices, answer } = this.labelChoices(vals, solution);

        const question = `If ${a}${v} - ${b} = ${c}, what is the value of ${v}?`;
        const explanation = this.makeSteps([
            `Add ${b} to both sides: ${a}${v} = ${c + b}.`,
            `Divide both sides by ${a}.`,
            `So ${v} = ${solution}.`,
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    }

    tplDistributiveOneSide(original) {
        const v = this.randomVarSymbol();
        const a = this.randomInt(2, 7);
        const shift = this.randomInt(2, 10);
        const solution = this.randomInt(4, 18);
        const c = a * (solution - shift);

        const vals = this.generateChoicesNumber(solution, 4, 6);
        const { choices, answer } = this.labelChoices(vals, solution);

        const question = `If ${a}(${v} - ${shift}) = ${c}, what is the value of ${v}?`;
        const explanation = this.makeSteps([
            `Divide both sides by ${a}: ${v} - ${shift} = ${c / a}.`,
            `Add ${shift} to both sides.`,
            `So ${v} = ${solution}.`,
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    }

    tplTwoSidedBasic(original) {
        const v = this.randomVarSymbol();
        const a = this.randomInt(4, 10);
        const c = this.randomInt(1, a - 1);
        const solution = this.randomInt(2, 12);
        const b = this.randomInt(5, 25);
        const d = a * solution + b - c * solution;

        const vals = this.generateChoicesNumber(solution, 4, 6);
        const { choices, answer } = this.labelChoices(vals, solution);

        const question = `If ${a}${v} + ${b} = ${c}${v} + ${d}, what is the value of ${v}?`;
        const explanation = this.makeSteps([
            `Subtract ${c}${v} from both sides: (${a - c})${v} + ${b} = ${d}.`,
            `Subtract ${b}: (${a - c})${v} = ${d - b}.`,
            `Divide by ${a - c}: ${v} = ${solution}.`,
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    }

    tplWithFractions(original) {
        const v = this.randomVarSymbol();
        const B = this.randomInt(2, 6);
        const C = this.randomInt(3, 12);
        const A = this.randomInt(2, 10);
        const solution = B * C - A;

        const vals = this.generateChoicesNumber(solution, 4, 8);
        const { choices, answer } = this.labelChoices(vals, solution);

        const question = `If (${v} + ${A})/${B} = ${C}, what is the value of ${v}?`;
        const explanation = this.makeSteps([
            `Multiply both sides by ${B}: ${v} + ${A} = ${B * C}.`,
            `Subtract ${A} from both sides.`,
            `So ${v} = ${solution}.`,
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    }

    tplNegativeCoefficient(original) {
        const v = this.randomVarSymbol();
        const a = this.randomInt(2, 7);
        const b = this.randomInt(2, 10);
        const solution = this.randomInt(-10, 10);
        const result = -a * (solution + b);

        const vals = this.generateChoicesNumber(solution, 4, 8);
        const { choices, answer } = this.labelChoices(vals, solution);

        const question = `What value of ${v} is the solution to the equation -${a}(${v} + ${b}) = ${result}?`;
        const explanation = this.makeSteps([
            `Divide both sides by -${a}: ${v} + ${b} = ${result / -a}.`,
            `Subtract ${b}.`,
            `So ${v} = ${solution}.`,
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    }

    tplSolveForExpression(original) {
        const v = this.randomVarSymbol();
        const A = this.randomInt(3, 10);
        const B = this.randomInt(2, 6);
        const C = B + this.randomInt(1, 6);

        const exprValue = 0;
        const vals = this.generateChoicesNumber(exprValue, 4, 10);
        const { choices, answer } = this.labelChoices(vals, exprValue);

        const question = `If (${v} + ${A})/${B} = (${v} + ${A})/${C}, what is the value of ${v} + ${A}?`;
        const explanation = this.makeSteps([
            `Multiply both sides by ${B * C} to clear fractions.`,
            `You get ${C}(${v}+${A}) = ${B}(${v}+${A}).`,
            `Subtract one side: (${C - B})(${v}+${A}) = 0.`,
            `Since ${C - B} ≠ 0, the only way this works is ${v}+${A} = 0.`,
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    }

    tplPerimeterWord(original) {
        const v = this.randomVarSymbol();
        const mult = this.randomInt(2, 5);
        const k = this.randomInt(3, 12);
        const width = this.randomInt(4, 16);
        const length = mult * width + k;
        const perimeter = 2 * (width + length);

        const vals = this.generateChoicesNumber(width, 4, 8);
        const { choices, answer } = this.labelChoices(vals, width);

        const question = `A rectangle has perimeter ${perimeter}. Its length is ${mult} times its width plus ${k}. If the width is ${v}, what is the value of ${v}?`;
        const explanation = this.makeSteps([
            `Perimeter formula: P = 2(width + length).`,
            `Substitute: ${perimeter} = 2(${v} + (${mult}${v} + ${k})).`,
            `Simplify and solve for ${v}.`,
            `You get ${v} = ${width}.`,
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    }

    tplPercentChangeWord(original) {
        const v = this.randomVarSymbol();
        const originalPrice = this.randomInt(40, 120);
        const percent = this.randomChoice([10, 15, 20, 25, 30]);
        const increase = this.randomChoice([true, false]);
        const newPrice = increase
            ? Math.round(originalPrice * (1 + percent / 100))
            : Math.round(originalPrice * (1 - percent / 100));

        const vals = this.generateChoicesNumber(originalPrice, 4, 20);
        const { choices, answer } = this.labelChoices(vals, originalPrice);

        const question = `An item’s price changed by ${percent}%. After the change, the price is $${newPrice}. If the change was a ${increase ? "increase" : "decrease"}, what was the original price, ${v}, in dollars?`;
        const explanation = this.makeSteps([
            `Write the equation: new price = original × (1 ± percent).`,
            `${newPrice} = ${v} × (${increase ? `1 + ${percent}/100` : `1 - ${percent}/100`}).`,
            `Divide both sides by the multiplier.`,
            `So ${v} = ${originalPrice}.`,
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    }

    // =========================================================
    // HARD TEMPLATES
    // =========================================================

    tplInfiniteSolutionsSolveConstant(original) {
        const v = this.randomVarSymbol();

        const r = this.randomInt(2, 6);
        const A = this.randomInt(3, 12);
        const B = this.randomInt(6, 16);
        const shift = this.randomInt(4, 12);

        const s = B * (A + r * shift);

        const vals = this.generateChoicesNumber(s, 4, Math.max(10, Math.floor(s * 0.15)));
        const { choices, answer } = this.labelChoices(vals, s);

        const question = `In the equation ${r}${v} + ${A} - s/${B} = ${r}(${v} - ${shift}), r and s are constants and r = ${r}. If the equation has infinitely many solutions, what is the value of s?`;
        const explanation = this.makeSteps([
            `Distribute the right side: ${r}(${v} - ${shift}) = ${r}${v} - ${r * shift}.`,
            `For infinitely many solutions, both sides must match for every ${v}.`,
            `The ${v} terms already match (${r}${v} on both sides).`,
            `So the constant parts must match too: ${A} - s/${B} = -${r * shift}.`,
            `Solve: s/${B} = ${A + r * shift} → s = ${s}.`,
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    }

    tplNoSolutionsSolveConstant(original) {
        const v = this.randomVarSymbol();

        const a = this.randomInt(2, 6);
        const pNum = this.randomInt(3, 12);
        const pDen = this.randomInt(5, 16);

        const kApprox = (-pNum / (pDen * a));
        const kRounded = Number(kApprox.toFixed(3));

        const n = this.randomInt(3, 12);
        const rhsConst = this.randomInt(6, 25);

        const raw = this.generateChoicesNumber(kRounded, 4, 1).map(x => Number(x).toFixed(3));
        if (!raw.includes(kRounded.toFixed(3))) raw[0] = kRounded.toFixed(3);
        const shuffled = this.shuffle(raw);

        const choices = shuffled.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val}`);
        const answer = String.fromCharCode(65 + shuffled.indexOf(kRounded.toFixed(3)));

        const question = `In the equation ${a}(k${v} - ${n}) = -(${pNum}/${pDen})${v} + ${rhsConst}, k is a constant. The equation has no solution. What is the value of k? (Round to 3 decimal places)`;
        const explanation = this.makeSteps([
            `No solution happens when the ${v}-coefficients match, but the constants do NOT match.`,
            `Expand left: ${a}(k${v} - ${n}) = ${a}k${v} - ${a * n}.`,
            `Match ${v} coefficients: ${a}k = -${pNum}/${pDen}.`,
            `Solve for k: k = -${pNum}/(${pDen}·${a}) ≈ ${kRounded}.`,
            `Since the constants are different, the equation has no solution.`,
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    }

    tplHowManySolutions(original) {
        const v = this.randomVarSymbol();
        const mode = this.randomChoice(["infinite", "none", "one"]);

        const choices = [
            "A) Exactly one",
            "B) Exactly two",
            "C) Infinitely many",
            "D) Zero",
        ];

        let question = "";
        let answer = "";
        let explanation = "";

        if (mode === "infinite") {
            const a = this.randomInt(6, 18);
            const b = this.randomInt(2, 8);
            const c = this.randomInt(2, 9);

            question = `How many solutions does the equation ${a}(${b}${v} - ${c}) = ${a * b}${v} - ${a * c} have?`;
            answer = "C";
            explanation = this.makeSteps([
                `Distribute the left side: ${a}(${b}${v} - ${c}) = ${a * b}${v} - ${a * c}.`,
                `That matches the right side exactly.`,
                `So the equation is true for every value of ${v}.`,
                `Answer: infinitely many solutions.`,
            ]);
        }

        if (mode === "none") {
            const m = this.randomInt(3, 10);
            const k = this.randomInt(5, 18);

            question = `How many solutions does the equation ${m}${v} + ${k} = ${m}${v} + ${k + 2} have?`;
            answer = "D";
            explanation = this.makeSteps([
                `Subtract ${m}${v} from both sides.`,
                `You get ${k} = ${k + 2}.`,
                `That is never true, so there are no solutions.`,
            ]);
        }

        if (mode === "one") {
            const a = this.randomInt(2, 7);
            const b = this.randomInt(8, 26);
            const c = this.randomInt(2, 9);

            question = `How many solutions does the equation ${a}(${v} - ${c}) = -${a}(${v} + ${c}) + ${b} have?`;
            answer = "A";
            explanation = this.makeSteps([
                `Distribute both sides.`,
                `Combine like terms.`,
                `You will still have a ${v} term left (not canceled).`,
                `That means it’s a normal linear equation → exactly one solution.`,
            ]);
        }

        return this.buildProblem(original, question, choices, answer, explanation);
    }

    tplCostPerMileChooseEquation(original) {
        const mpg = this.randomInt(18, 40);
        const cost = this.randomChoice([3, 4, 5, 6]);
        const savings = this.randomInt(4, 12);

        const choices = [
            `A) (${mpg}/${cost})m = ${savings}`,
            `B) (${cost}/${mpg})m = ${savings}`,
            `C) (${cost}/${mpg})m = ${savings * 2}`,
            `D) (${mpg}/${cost})m = ${savings + 10}`,
        ];

        const question = `A car travels an average of ${mpg} miles per gallon, and gas costs $${cost} per gallon. To reduce gas spending by $${savings}, which equation can be used to determine how many fewer miles, m, should be driven?`;
        const explanation = this.makeSteps([
            `Find cost per mile: $${cost} per gallon ÷ ${mpg} miles per gallon = ${cost}/${mpg} dollars per mile.`,
            `If you drive m fewer miles, money saved = (${cost}/${mpg})m.`,
            `Set that equal to $${savings}.`,
            `So the correct equation is (${cost}/${mpg})m = ${savings}.`,
        ]);

        return this.buildProblem(original, question, choices, "B", explanation);
    }

    tplStationsExpression(original) {
        const v = this.randomVarSymbol();
        const stations = this.randomInt(4, 9);
        const A = this.randomInt(5, 12);
        const B = this.randomInt(2, A - 1);

        const choices = [
            `A) ${A}${v} + ${B}${stations}`,
            `B) ${A}${v} + ${B}${v}`,
            `C) ${A}${v} + ${B}(${stations} - ${v})`,
            `D) (${A}+${B})(${stations} - ${v})`,
        ];

        const question = `A lab has ${stations} stations. Each station will be set up with either Setup A (needs ${A} units) or Setup B (needs ${B} units). If ${v} stations are set up with Setup A, which expression represents the total units needed?`;
        const explanation = this.makeSteps([
            `Setup A uses ${A} units each. ${v} stations get Setup A → ${A}${v} units.`,
            `The rest get Setup B: ${stations} - ${v} stations.`,
            `Setup B uses ${B} units each → ${B}(${stations} - ${v}) units.`,
            `Add them: ${A}${v} + ${B}(${stations} - ${v}).`,
        ]);

        return this.buildProblem(original, question, choices, "C", explanation);
    }

    /**
     * ✅ FIXED: constant rate word problem
     * - rate always matches the story
     * - final time is always a nice integer
     * - never rounds incorrectly
     */
    tplConstantRateWordHard(original) {
        const v = this.randomVarSymbol();

        let initial = 0;
        let hours1 = 0;
        let rate = 0;
        let remaining1 = 0;

        let totalHours = 0;
        let targetRemaining = 0;

        // generate a clean consistent scenario
        let tries = 0;
        while (tries < 50) {
            tries++;

            initial = this.randomInt(20000, 32000);
            hours1 = this.randomInt(3, 7);
            rate = this.randomInt(600, 1400);

            remaining1 = initial - rate * hours1;
            if (remaining1 < 9000) continue;

            totalHours = this.randomInt(hours1 + 2, hours1 + 12);
            targetRemaining = initial - rate * totalHours;

            if (targetRemaining > 3000 && targetRemaining < remaining1 - 1000) {
                break;
            }
        }

        const correct = totalHours;

        const vals = this.generateChoicesNumber(correct, 4, 4);
        const { choices, answer } = this.labelChoices(vals, correct, (n) => `${n} hours`);

        const question = `A machine removes grain from a storage bin at a constant rate. The bin contained ${initial} bushels when the machine started. After ${hours1} hours, ${remaining1} bushels remained. If the machine continues at this rate, how many total hours will have passed when ${targetRemaining} bushels remain?`;
        const explanation = this.makeSteps([
            `Step 1: Find the rate removed each hour.`,
            `Rate = (${initial} - ${remaining1}) ÷ ${hours1} = ${rate} bushels per hour.`,
            `Step 2: Write the equation: remaining = start - rate·time.`,
            `${targetRemaining} = ${initial} - ${rate}${v}.`,
            `Step 3: Solve for time.`,
            `${rate}${v} = ${initial - targetRemaining}.`,
            `${v} = (${initial - targetRemaining}) ÷ ${rate} = ${correct}.`,
            `So, ${correct} hours have passed.`,
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    }

    tplDecimalCoefficientsSolve(original) {
        const v = this.randomVarSymbol();

        const a = this.randomChoice([0.6, 0.8, 1.2, 1.5]);
        const b = this.randomChoice([2.5, 3.4, 4.6, 5.2]);
        const c = this.randomChoice([0.25, 0.46, 0.72, 1.08]);
        const d = this.randomChoice([1.3, 1.7, 1.9, 2.4]);

        const denom = a - b;
        const num = c + d;

        // prevent division by 0 / tiny number
        if (Math.abs(denom) < 0.05) {
            return this.tplTwoSidedBasic(original);
        }

        const correct = Number((num / denom).toFixed(3));

        const raw = this.generateChoicesNumber(correct, 4, 1).map(x => Number(x).toFixed(3));
        if (!raw.includes(correct.toFixed(3))) raw[0] = correct.toFixed(3);
        const shuffled = this.shuffle(raw);

        const choices = shuffled.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val}`);
        const answer = String.fromCharCode(65 + shuffled.indexOf(correct.toFixed(3)));

        const question = `What value of ${v} is the solution to the equation ${a}${v} - ${c} = ${b}${v} + ${d}? (Round to 3 decimals)`;
        const explanation = this.makeSteps([
            `Move the ${v} terms to one side and constants to the other.`,
            `(${a} - ${b})${v} = ${c} + ${d}.`,
            `So ${v} = (${c + d}) ÷ (${a - b}).`,
            `That gives ${v} ≈ ${correct.toFixed(3)}.`,
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    }

    tplParameterNoSolutionB(original) {
        const v = this.randomVarSymbol();

        const m = this.randomInt(5, 12);
        const c = this.randomInt(2, 18);
        const forbidden = c / m;

        let bGood = this.randomInt(1, 10);
        if (Math.abs(bGood - forbidden) < 0.001) bGood += 1;

        const choices = [
            `A) ${forbidden.toFixed(2)}`,
            `B) ${bGood}`,
            `C) ${(forbidden + 1).toFixed(2)}`,
            `D) ${(forbidden - 1).toFixed(2)}`
        ];

        const question = `The equation ${m}${v} + ${c} = ${m}(${v} + b) has no solutions. Which of the following could be a value of b?`;
        const explanation = this.makeSteps([
            `Expand the right side: ${m}(${v}+b) = ${m}${v} + ${m}b.`,
            `Then the equation becomes ${m}${v} + ${c} = ${m}${v} + ${m}b.`,
            `Subtract ${m}${v} from both sides: ${c} = ${m}b.`,
            `To have NO solutions, we need a contradiction, so ${c} ≠ ${m}b.`,
            `That means b ≠ ${forbidden.toFixed(2)}.`,
        ]);

        return this.buildProblem(original, question, choices, "B", explanation);
    }

    tplComplexMultiStep(original) {
        const v = this.randomVarSymbol();

        const A = this.randomInt(2, 6);
        const B = this.randomInt(3, 9);
        const C = this.randomInt(4, 12);
        const solution = this.randomInt(2, 14);

        const rhs = A * (B * solution - C) + C;

        const vals = this.generateChoicesNumber(solution, 4, 6);
        const { choices, answer } = this.labelChoices(vals, solution);

        const question = `What value of ${v} is the solution to the equation ${A}(${B}${v} - ${C}) + ${C} = ${rhs}?`;
        const explanation = this.makeSteps([
            `Subtract ${C} from both sides.`,
            `Divide both sides by ${A}.`,
            `Add ${C}, then divide by ${B}.`,
            `You get ${v} = ${solution}.`,
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    }

    tplTicketSalesWord(original) {
        const v = this.randomVarSymbol();

        const adultPrice = this.randomInt(8, 15);
        const studentPrice = this.randomInt(4, adultPrice - 2);

        const adultTickets = this.randomInt(10, 40);
        const studentTickets = this.randomInt(20, 80);

        const totalRevenue = adultPrice * adultTickets + studentPrice * studentTickets;

        const k = studentTickets - adultTickets;

        const vals = this.generateChoicesNumber(adultTickets, 4, 10);
        const { choices, answer } = this.labelChoices(vals, adultTickets);

        const question = `Tickets for a show cost $${adultPrice} for adults and $${studentPrice} for students. The number of student tickets sold was ${k} more than the number of adult tickets sold. If the total revenue was $${totalRevenue}, how many adult tickets were sold?`;
        const explanation = this.makeSteps([
            `Let ${v} = number of adult tickets.`,
            `Then student tickets = ${v} + ${k}.`,
            `Total revenue equation: ${adultPrice}${v} + ${studentPrice}(${v}+${k}) = ${totalRevenue}.`,
            `Solve the equation to get ${v} = ${adultTickets}.`,
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    }
}

// Create single instance
const problemGenerator = new ProblemGenerator();
window.problemGenerator = problemGenerator;
