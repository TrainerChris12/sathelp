// public/generators/algebra/linearEqOneVar/medium.js
// BALANCED EXPLANATIONS: Clear reasoning + clean formatting

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

        const explanation = `To clear the fraction, multiply both sides by ${B}:<br>` +
            `${v} + ${A} = ${B * C}<br><br>` +
            `Subtract ${A} from both sides:<br>` +
            `${v} = ${solution}`;

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

        const question = `What value of ${v} is the solution to -${a}(${v} + ${b}) = ${result}?`;

        const explanation = `Divide both sides by -${a}:<br>` +
            `${v} + ${b} = ${result / -a}<br><br>` +
            `Subtract ${b} from both sides:<br>` +
            `${v} = ${solution}`;

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

        const explanation = `Multiply both sides by ${B * C} to clear fractions:<br>` +
            `${C}(${v} + ${A}) = ${B}(${v} + ${A})<br><br>` +
            `Subtract ${B}(${v} + ${A}) from both sides:<br>` +
            `${C - B}(${v} + ${A}) = 0<br><br>` +
            `Since ${C - B} ≠ 0, the only solution is:<br>` +
            `${v} + ${A} = 0`;

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

        const explanation = `The length is ${mult}${v} + ${k}. Using the perimeter formula:<br>` +
            `${perimeter} = 2(${v} + ${mult}${v} + ${k})<br>` +
            `${perimeter} = 2(${mult + 1}${v} + ${k})<br>` +
            `${perimeter} = ${2 * (mult + 1)}${v} + ${2 * k}<br><br>` +
            `Subtract ${2 * k} from both sides:<br>` +
            `${perimeter - 2 * k} = ${2 * (mult + 1)}${v}<br><br>` +
            `Divide both sides by ${2 * (mult + 1)}:<br>` +
            `${v} = ${width}`;

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

        const multiplier = increase ? (1 + percent / 100) : (1 - percent / 100);
        const changeWord = increase ? 'increase' : 'decrease';

        const question = `An item's price changed by ${percent}%. After the change, the price is $${newPrice}. If the change was a ${changeWord}, what was the original price, ${v}, in dollars?`;

        const explanation = `A ${percent}% ${changeWord} means the new price is ${(multiplier * 100).toFixed(0)}% of the original:<br>` +
            `${newPrice} = ${v} × ${multiplier.toFixed(2)}<br><br>` +
            `Divide both sides by ${multiplier.toFixed(2)}:<br>` +
            `${v} = ${originalPrice}`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    console.log("✅ Linear Equations Medium loaded (5 templates)");
}