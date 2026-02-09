// sat/generators/algebra/linearEqOneVar/easy.js

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
        const explanation = this.makeSteps([
            `Subtract ${b} from both sides: ${a}${v} = ${c - b}.`,
            `Divide both sides by ${a}.`,
            `So ${v} = ${solution}.`,
        ]);

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
        const explanation = this.makeSteps([
            `Add ${b} to both sides: ${a}${v} = ${c + b}.`,
            `Divide both sides by ${a}.`,
            `So ${v} = ${solution}.`,
        ]);

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
        const explanation = this.makeSteps([
            `Divide both sides by ${a}: ${v} - ${shift} = ${c / a}.`,
            `Add ${shift} to both sides.`,
            `So ${v} = ${solution}.`,
        ]);

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
        const explanation = this.makeSteps([
            `Subtract ${c}${v} from both sides: (${a - c})${v} + ${b} = ${d}.`,
            `Subtract ${b}: (${a - c})${v} = ${d - b}.`,
            `Divide by ${a - c}: ${v} = ${solution}.`,
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };
}
