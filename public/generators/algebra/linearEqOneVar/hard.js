// public/generators/algebra/linearEqOneVar/hard.js

if (!window.ProblemGenerator) {
    console.error("❌ ProblemGenerator not loaded before hard.js");
} else {
    const P = window.ProblemGenerator.prototype;

    // =========================================================
    // ✅ FIXED RENTAL TEMPLATE (NO NEGATIVE MILES)
    // =========================================================
    P.tplRentalMilesEqualHard = function (original) {
        const m = "m";

        // pick a clean miles answer FIRST
        const miles = this.randomInt(25, 200);

        // pick two different per-mile rates
        let rate1 = this.randomChoice([0.2, 0.25, 0.3, 0.35, 0.4]);
        let rate2 = this.randomChoice([0.2, 0.25, 0.3, 0.35, 0.4]);
        while (rate2 === rate1) rate2 = this.randomChoice([0.2, 0.25, 0.3, 0.35, 0.4]);

        // pick a base flat fee for company B
        const flat2 = this.randomInt(20, 60);

        // compute flat1 so that costs are equal at "miles"
        // flat1 + rate1*miles = flat2 + rate2*miles
        // flat1 = flat2 + (rate2-rate1)*miles
        const flat1 = Math.round(flat2 + (rate2 - rate1) * miles);

        // safeguard: flat1 must be positive and reasonable
        if (flat1 < 10 || flat1 > 100) return this.tplRentalMilesEqualHard(original);

        const correct = miles;

        const vals = this.generateChoicesNumber(correct, 4, 35);
        const { choices, answer } = this.labelChoices(vals, correct);

        const question =
            `A rental company charges a flat fee of $${flat1} plus $${rate1.toFixed(2)} per mile. ` +
            `Another company charges $${flat2} plus $${rate2.toFixed(2)} per mile. ` +
            `For how many miles will the total cost be the same?`;

        const explanation = this.makeSteps([
            `Set the costs equal: ${this.math(`${flat1} + ${rate1.toFixed(2)}${this.ital(m)} = ${flat2} + ${rate2.toFixed(2)}${this.ital(m)}`)}`,
            `Subtract ${this.math(`${rate1.toFixed(2)}${this.ital(m)}`)} and subtract ${this.math(flat2)}.`,
            `Solve: ${this.math(`${flat1 - flat2} = ${(rate2 - rate1).toFixed(2)}${this.ital(m)}`)}`,
            `Divide: ${this.math(`${this.ital(m)} = ${flat1 - flat2} ÷ ${(rate2 - rate1).toFixed(2)} = ${correct}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // =========================================================
    // ✅ 10 NEW HARD VARIETY TEMPLATES
    // =========================================================

    // 1) Consecutive Integers
    P.tplConsecutiveIntegersHard = function (original) {
        const x = "x";
        const start = this.randomInt(-10, 12);
        const a = start;
        const b = start + 1;
        const sum = a + b;

        const vals = this.generateChoicesNumber(a, 4, 8);
        const { choices, answer } = this.labelChoices(vals, a);

        const question = `Two consecutive integers have a sum of ${sum}. What is the smaller integer?`;

        const explanation = this.makeSteps([
            `Let the smaller integer be ${this.math(this.ital(x))}.`,
            `Then the next integer is ${this.math(`${this.ital(x)} + 1`)}.`,
            `Write the equation: ${this.math(`${this.ital(x)} + (${this.ital(x)} + 1) = ${sum}`)}`,
            `Solve: ${this.math(`2${this.ital(x)} + 1 = ${sum}`)} → ${this.math(`2${this.ital(x)} = ${sum - 1}`)} → ${this.math(`${this.ital(x)} = ${a}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // 2) Perimeter Expression
    P.tplPerimeterExpressionHard = function (original) {
        const x = "x";
        const w = this.randomInt(4, 15);
        const L = 3 * w + 2;
        const Pval = 2 * (w + L);

        const vals = this.generateChoicesNumber(w, 4, 8);
        const { choices, answer } = this.labelChoices(vals, w);

        const question =
            `A rectangle has perimeter ${Pval}. Its length is ${this.math(`3${this.ital(x)} + 2`)} and its width is ${this.ital(x)}. ` +
            `What is the value of ${this.ital(x)}?`;

        const explanation = this.makeSteps([
            `Perimeter formula: ${this.math(`P = 2(w + L)`)}`,
            `Substitute: ${this.math(`${Pval} = 2(${this.ital(x)} + (3${this.ital(x)} + 2))`)}`,
            `Simplify: ${this.math(`${Pval} = 2(4${this.ital(x)} + 2) = 8${this.ital(x)} + 4`)}`,
            `Solve: ${this.math(`8${this.ital(x)} = ${Pval - 4}`)} → ${this.math(`${this.ital(x)} = ${w}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // 3) Discount + Tax
    P.tplDiscountAndTaxHard = function (original) {
        const x = "x";
        const originalPrice = this.randomInt(40, 120);
        const discount = this.randomChoice([10, 15, 20, 25]);
        const tax = this.randomChoice([5, 8, 10]);

        const afterDiscount = originalPrice * (1 - discount / 100);
        const finalPrice = Math.round(afterDiscount * (1 + tax / 100));

        const vals = this.generateChoicesNumber(originalPrice, 4, 15);
        const { choices, answer } = this.labelChoices(vals, originalPrice);

        const question =
            `An item is discounted by ${discount}% and then taxed by ${tax}%. The final price is $${finalPrice}. ` +
            `What was the original price, ${this.ital(x)}, in dollars?`;

        const explanation = this.makeSteps([
            `After discount: ${this.math(`final = ${this.ital(x)}(1 - ${discount}/100)`)}`,
            `Then tax: ${this.math(`${finalPrice} = ${this.ital(x)}(1 - ${discount}/100)(1 + ${tax}/100)`)}`,
            `Divide by the multiplier to solve for ${this.ital(x)}.`,
            `That gives ${this.math(`${this.ital(x)} = ${originalPrice}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // 4) Work Rate (single variable)
    P.tplWorkRateHard = function (original) {
        const x = "x";
        const total = this.randomInt(60, 180);
        const rate = this.randomInt(4, 12);
        const time = total / rate;

        if (Math.abs(time - Math.round(time)) > 1e-6) return this.tplWorkRateHard(original);

        const correct = Math.round(time);

        const vals = this.generateChoicesNumber(correct, 4, 6);
        const { choices, answer } = this.labelChoices(vals, correct);

        const question =
            `A machine processes ${total} parts at a constant rate of ${rate} parts per minute. ` +
            `How many minutes will it take to process all the parts?`;

        const explanation = this.makeSteps([
            `Use ${this.math(`time = total ÷ rate`)}`,
            `${this.math(`time = ${total} ÷ ${rate} = ${correct}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // 5) Age Difference
    P.tplAgeDifferenceHard = function (original) {
        const x = "x";
        const olderNow = this.randomInt(25, 60);
        const diff = this.randomInt(5, 20);
        const youngerNow = olderNow - diff;

        const vals = this.generateChoicesNumber(youngerNow, 4, 10);
        const { choices, answer } = this.labelChoices(vals, youngerNow);

        const question =
            `A person is ${olderNow} years old, which is ${diff} years older than their sibling. ` +
            `How old is the sibling?`;

        const explanation = this.makeSteps([
            `Younger age = older age − difference`,
            `${this.math(`${olderNow} - ${diff} = ${youngerNow}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // 6) Temperature Conversion
    P.tplTemperatureConversionHard = function (original) {
        const x = "x";
        const C = this.randomInt(-10, 35);
        const F = Math.round((9 / 5) * C + 32);

        const vals = this.generateChoicesNumber(C, 4, 10);
        const { choices, answer } = this.labelChoices(vals, C);

        const question =
            `The formula ${this.math(`F = (9/5)C + 32`)} converts Celsius to Fahrenheit. ` +
            `If the temperature is ${F}°F, what is the temperature in Celsius?`;

        const explanation = this.makeSteps([
            `Substitute: ${this.math(`${F} = (9/5)${this.ital(x)} + 32`)}`,
            `Subtract 32: ${this.math(`${F - 32} = (9/5)${this.ital(x)}`)}`,
            `Multiply by 5/9: ${this.math(`${this.ital(x)} = ${C}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // 7) Phone Plan (linear model)
    P.tplPhonePlanHard = function (original) {
        const x = "x";
        const base = this.randomInt(25, 60);
        const perGB = this.randomInt(5, 15);
        const gb = this.randomInt(2, 10);
        const total = base + perGB * gb;

        const vals = this.generateChoicesNumber(gb, 4, 4);
        const { choices, answer } = this.labelChoices(vals, gb);

        const question =
            `A phone plan costs $${base} plus $${perGB} per GB of data. ` +
            `If the total bill is $${total}, how many GB of data were used?`;

        const explanation = this.makeSteps([
            `Write equation: ${this.math(`${base} + ${perGB}${this.ital(x)} = ${total}`)}`,
            `Subtract ${base}: ${this.math(`${perGB}${this.ital(x)} = ${total - base}`)}`,
            `Divide: ${this.math(`${this.ital(x)} = ${gb}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // 8) Shipping Weight
    P.tplShippingWeightHard = function (original) {
        const x = "x";
        const base = this.randomInt(4, 10);
        const perLb = this.randomChoice([1.25, 1.5, 2.0, 2.5]);
        const lbs = this.randomInt(2, 12);
        const total = Number((base + perLb * lbs).toFixed(2));

        const vals = this.generateChoicesNumber(lbs, 4, 4);
        const { choices, answer } = this.labelChoices(vals, lbs);

        const question =
            `Shipping costs $${base} plus $${perLb.toFixed(2)} per pound. ` +
            `If the total shipping cost is $${total.toFixed(2)}, what is the package weight in pounds?`;

        const explanation = this.makeSteps([
            `Equation: ${this.math(`${base} + ${perLb.toFixed(2)}${this.ital(x)} = ${total.toFixed(2)}`)}`,
            `Subtract ${base}: ${this.math(`${perLb.toFixed(2)}${this.ital(x)} = ${(total - base).toFixed(2)}`)}`,
            `Divide: ${this.math(`${this.ital(x)} = ${lbs}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // 9) Distribute Both Sides
    P.tplDistributeBothSidesHard = function (original) {
        const x = "x";
        const a = this.randomInt(2, 6);
        const b = this.randomInt(2, 8);
        const c = this.randomInt(2, 6);
        const d = this.randomInt(2, 8);

        const solution = this.randomInt(-8, 10);

        const left = a * (solution + b);
        const right = c * (solution + d);

        const vals = this.generateChoicesNumber(solution, 4, 8);
        const { choices, answer } = this.labelChoices(vals, solution);

        const question =
            `What is the solution to the equation ${this.math(`${a}(${this.ital(x)} + ${b}) = ${c}(${this.ital(x)} + ${d})`)} ?`;

        const explanation = this.makeSteps([
            `Distribute: ${this.math(`${a}${this.ital(x)} + ${a * b} = ${c}${this.ital(x)} + ${c * d}`)}`,
            `Move variables: ${this.math(`${a}${this.ital(x)} - ${c}${this.ital(x)} = ${c * d - a * b}`)}`,
            `Factor: ${this.math(`${(a - c)}${this.ital(x)} = ${c * d - a * b}`)}`,
            `Solve: ${this.math(`${this.ital(x)} = ${solution}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };

    // 10) Unit Rate Conversion
    P.tplUnitRateConversionHard = function (original) {
        const x = "x";
        const miles = this.randomInt(60, 240);
        const hours = this.randomInt(2, 6);

        const speed = miles / hours;
        if (Math.abs(speed - Math.round(speed)) > 1e-6) return this.tplUnitRateConversionHard(original);

        const correct = Math.round(speed);

        const vals = this.generateChoicesNumber(correct, 4, 10);
        const { choices, answer } = this.labelChoices(vals, correct);

        const question =
            `A car travels ${miles} miles in ${hours} hours at a constant speed. What is its speed in miles per hour?`;

        const explanation = this.makeSteps([
            `Speed = distance ÷ time`,
            `${this.math(`speed = ${miles} ÷ ${hours} = ${correct}`)}`
        ]);

        return this.buildProblem(original, question, choices, answer, explanation);
    };
}
