// public/generators/algebra/linearEqOneVar/easy.js
// BALANCED EXPLANATIONS: Clear reasoning + clean formatting

if (!window.ProblemGenerator) {
    console.error("❌ ProblemGenerator not loaded before easy.js");
} else {
    const P = window.ProblemGenerator.prototype;

    P.tplSimpleAddition = function (original) {
        const v = this.randomVarSymbol();
        const a = this.randomInt(2, 9);
        const solution = this.randomInt(2, 15);
        const b = this.randomInt(1, 20);
        const c = a * solution + b;

        const vals = this.generateChoicesNumber(solution, 4, 5);
        const { choices, answer } = this.labelChoices(vals, solution);

        const question = `If ${a}${v} + ${b} = ${c}, what is the value of ${v}?`;

        const explanation = `To isolate ${v}, subtract ${b} from both sides:<br>` +
            `${a}${v} = ${c - b}<br><br>` +
            `Then divide both sides by ${a}:<br>` +
            `${v} = ${solution}`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    P.tplSimpleSubtraction = function (original) {
        const v = this.randomVarSymbol();
        const a = this.randomInt(2, 9);
        const solution = this.randomInt(3, 20);
        const b = this.randomInt(1, 15);
        const c = a * solution - b;

        const vals = this.generateChoicesNumber(solution, 4, 6);
        const { choices, answer } = this.labelChoices(vals, solution);

        const question = `If ${a}${v} - ${b} = ${c}, what is the value of ${v}?`;

        const explanation = `To isolate ${v}, add ${b} to both sides:<br>` +
            `${a}${v} = ${c + b}<br><br>` +
            `Then divide both sides by ${a}:<br>` +
            `${v} = ${solution}`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    P.tplDistributiveOneSide = function (original) {
        const v = this.randomVarSymbol();
        const a = this.randomInt(2, 7);
        const shift = this.randomInt(2, 10);
        const solution = this.randomInt(4, 18);
        const c = a * (solution - shift);

        const vals = this.generateChoicesNumber(solution, 4, 6);
        const { choices, answer } = this.labelChoices(vals, solution);

        const question = `If ${a}(${v} - ${shift}) = ${c}, what is the value of ${v}?`;

        const explanation = `First, divide both sides by ${a} to remove it:<br>` +
            `${v} - ${shift} = ${c / a}<br><br>` +
            `Then add ${shift} to both sides:<br>` +
            `${v} = ${solution}`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    P.tplTwoSidedBasic = function (original) {
        const v = this.randomVarSymbol();
        const a = this.randomInt(4, 10);
        const c = this.randomInt(1, a - 1);
        const solution = this.randomInt(2, 12);
        const b = this.randomInt(5, 25);
        const d = a * solution + b - c * solution;

        const vals = this.generateChoicesNumber(solution, 4, 6);
        const { choices, answer } = this.labelChoices(vals, solution);

        const question = `If ${a}${v} + ${b} = ${c}${v} + ${d}, what is the value of ${v}?`;

        const explanation = `Move all ${v} terms to the left by subtracting ${c}${v} from both sides:<br>` +
            `${a - c}${v} + ${b} = ${d}<br><br>` +
            `Subtract ${b} from both sides:<br>` +
            `${a - c}${v} = ${d - b}<br><br>` +
            `Divide both sides by ${a - c}:<br>` +
            `${v} = ${solution}`;

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    console.log("✅ Linear Equations Easy loaded (4 templates)");
}