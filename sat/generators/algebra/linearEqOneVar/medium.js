// sat/generators/algebra/linearEqOneVar/medium.js

if (!window.ProblemGenerator) {
    console.error("❌ ProblemGenerator not loaded before medium.js");
} else {
    const P = window.ProblemGenerator.prototype;

    P.tplWithFractions = function (original) {
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
    };

    P.tplNegativeCoefficient = function (original) {
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
    };

    P.tplSolveForExpression = function (original) {
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
    };

    P.tplPerimeterWord = function (original) {
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
    };

    P.tplPercentChangeWord = function (original) {
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
    };
}
