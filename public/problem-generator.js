// public/problem-generator.js

class ProblemGenerator {
    constructor() {
        this.generatedCount = 0;
    }

    generate(originalProblem) {
        const generator = this.getGenerator(originalProblem.subskill);

        if (!generator) {
            console.warn(`No generator for subskill: ${originalProblem.subskill}`);
            return null;
        }

        const newProblem = generator(originalProblem);
        this.generatedCount++;

        return newProblem;
    }

    getGenerator(subskill) {
        const generators = {
            'linear-equations-one-variable': this.generateLinearEquation.bind(this)
        };

        return generators[subskill] || null;
    }

    // Pick templates based on difficulty level
    generateLinearEquation(original) {
        let templates;

        if (original.difficulty === 'easy') {
            templates = [
                this.templateSimpleAddition,
                this.templateSimpleSubtraction,
                this.templateDistributive,
                this.templatePlantGrowth,
                this.templateBookPages,
                this.templatePizzaSlices,
                this.templateSavingsAccount
            ];
        } else if (original.difficulty === 'medium') {
            // MEDIUM: College Board style - diverse skills
            templates = [
                // Coefficient interpretation (what does variable represent?)
                this.templateCoefficientMeaning,
                this.templateRateInterpretation,

                // Solve for expression (not just x)
                this.templateSolveExpression,
                this.templateExpressionValue,

                // Infinite/No solutions
                this.templateInfiniteSolutions,
                this.templateNoSolution,

                // Multi-step with distribution
                this.templateDistributionBothSides,
                this.templateNestedDistribution,

                // Fractions
                this.templateFractionBothSides,
                this.templateMultipleFractions,

                // Word problems - context-based
                this.templateSubscriptionService,
                this.templateRentalComparison,
                this.templateGrowthDecay,
                this.templateMeasurementConversion,

                // Mixed operations
                this.templateCombineAndSolve,
                this.templateIsolateExpression
            ];
        } else {
            templates = [
                this.templateTwoSided,
                this.templateWithFractions,
                this.templateNestedParentheses,
                this.templateMultipleTerms,
                this.templateDecimalCoefficients,
                this.templateNegativeCoefficients,
                this.templateMixedFractions
            ];
        }

        const template = templates[Math.floor(Math.random() * templates.length)];
        return template.call(this, original);
    }

    // ========== BASIC TEMPLATES ==========

    templateSimpleAddition(original) {
        let a, x, b, c;

        if (original.difficulty === 'easy') {
            a = this.randomInt(2, 5);
            x = this.randomInt(2, 10);
            b = this.randomInt(1, 10);
        } else if (original.difficulty === 'medium') {
            a = this.randomInt(3, 8);
            x = this.randomInt(5, 15);
            b = this.randomInt(5, 20);
        } else {
            a = this.randomInt(5, 12);
            x = this.randomInt(10, 25);
            b = this.randomInt(10, 40);
        }

        c = a * x + b;
        const choices = this.generateChoices(x, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `If ${a}x + ${b} = ${c}, what is the value of x?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val}`),
            answer: String.fromCharCode(65 + choices.indexOf(x)),
            explanation: `Subtract ${b} from both sides: ${a}x = ${c - b}. Then divide by ${a}: x = ${x}.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    templateSimpleSubtraction(original) {
        const a = this.randomInt(2, 8);
        const x = this.randomInt(5, 20);
        const b = this.randomInt(1, 15);
        const c = a * x - b;

        const choices = this.generateChoices(x, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `If ${a}x - ${b} = ${c}, what is the value of x?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val}`),
            answer: String.fromCharCode(65 + choices.indexOf(x)),
            explanation: `Add ${b} to both sides: ${a}x = ${c + b}. Then divide by ${a}: x = ${x}.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    templateDistributive(original) {
        const a = this.randomInt(2, 6);
        const b = this.randomInt(2, 8);
        const x = this.randomInt(5, 20);
        const c = a * (x - b);

        const choices = this.generateChoices(x, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `If ${a}(x - ${b}) = ${c}, what is the value of x?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val}`),
            answer: String.fromCharCode(65 + choices.indexOf(x)),
            explanation: `Divide both sides by ${a}: x - ${b} = ${c / a}. Then add ${b}: x = ${x}.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    templateTwoSided(original) {
        const a = this.randomInt(3, 8);
        const c = this.randomInt(2, a - 1);
        const x = this.randomInt(3, 15);
        const b = this.randomInt(5, 20);
        const d = a * x + b - c * x;

        const choices = this.generateChoices(x, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `If ${a}x + ${b} = ${c}x + ${d}, what is the value of x?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val}`),
            answer: String.fromCharCode(65 + choices.indexOf(x)),
            explanation: `Subtract ${c}x from both sides: ${a - c}x + ${b} = ${d}. Subtract ${b}: ${a - c}x = ${d - b}. Divide by ${a - c}: x = ${x}.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    templateWithFractions(original) {
        const b = this.randomInt(2, 5);
        const c = this.randomInt(3, 10);
        const a = this.randomInt(2, 8);
        const x = b * c - a;

        const choices = this.generateChoices(x, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `If (x + ${a})/${b} = ${c}, what is the value of x?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val}`),
            answer: String.fromCharCode(65 + choices.indexOf(x)),
            explanation: `Multiply both sides by ${b}: x + ${a} = ${b * c}. Subtract ${a}: x = ${x}.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    // ========== WORD PROBLEM TEMPLATES ==========

    templatePlantGrowth(original) {
        let growthRate, days, initialHeight;

        if (original.difficulty === 'easy') {
            growthRate = this.randomChoice([1, 2, 5]);
            days = this.randomInt(5, 10);
            initialHeight = this.randomInt(5, 15);
        } else if (original.difficulty === 'medium') {
            growthRate = this.randomChoice([0.5, 0.8, 1.2, 1.5, 2.0]);
            days = this.randomInt(10, 30);
            initialHeight = this.randomInt(5, 20);
        } else {
            growthRate = this.randomChoice([0.3, 0.7, 1.3, 1.8, 2.5]);
            days = this.randomInt(15, 40);
            initialHeight = this.randomInt(10, 30);
        }

        const finalHeight = initialHeight + growthRate * days;
        const choices = this.generateChoices(initialHeight, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `A plant grows ${growthRate} cm per day. After ${days} days, it is ${finalHeight} cm tall. How tall was the plant initially?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val} cm`),
            answer: String.fromCharCode(65 + choices.indexOf(initialHeight)),
            explanation: `The plant grew ${growthRate} × ${days} = ${growthRate * days} cm over ${days} days. Starting height = ${finalHeight} - ${growthRate * days} = ${initialHeight} cm.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    templateMoneyEarnings(original) {
        const hourlyWage = this.randomInt(12, 25);
        const hours = this.randomInt(15, 40);
        const bonus = this.randomInt(50, 200);
        const total = hourlyWage * hours + bonus;

        const choices = this.generateChoices(hours, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `Sarah earns $${hourlyWage} per hour and received a $${bonus} bonus. If she earned $${total} total, how many hours did she work?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val} hours`),
            answer: String.fromCharCode(65 + choices.indexOf(hours)),
            explanation: `After the bonus, she earned $${total - bonus} from hourly work. Hours = ${total - bonus} ÷ ${hourlyWage} = ${hours} hours.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    templateTemperature(original) {
        const ratePerHour = this.randomInt(2, 5);
        const hours = this.randomInt(3, 8);
        const startTemp = this.randomInt(60, 80);
        const endTemp = startTemp - ratePerHour * hours;

        const choices = this.generateChoices(startTemp, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `The temperature drops ${ratePerHour}°F per hour. After ${hours} hours, it is ${endTemp}°F. What was the starting temperature?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val}°F`),
            answer: String.fromCharCode(65 + choices.indexOf(startTemp)),
            explanation: `Temperature dropped ${ratePerHour} × ${hours} = ${ratePerHour * hours}°F total. Starting temp = ${endTemp} + ${ratePerHour * hours} = ${startTemp}°F.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    templateDistance(original) {
        const speed = this.randomInt(40, 70);
        const time = this.randomInt(2, 6);
        const extraDistance = this.randomInt(10, 50);
        const totalDistance = speed * time + extraDistance;

        const choices = this.generateChoices(time, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `A car travels at ${speed} mph and goes ${extraDistance} extra miles. If the total distance is ${totalDistance} miles, how many hours did it travel?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val} hours`),
            answer: String.fromCharCode(65 + choices.indexOf(time)),
            explanation: `Subtract extra miles: ${totalDistance} - ${extraDistance} = ${totalDistance - extraDistance}. Time = ${totalDistance - extraDistance} ÷ ${speed} = ${time} hours.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    templatePopulation(original) {
        const increasePerYear = this.randomInt(500, 2000);
        const years = this.randomInt(5, 15);
        const currentPop = this.randomInt(10000, 30000);
        const initialPop = currentPop - increasePerYear * years;

        const choices = this.generateChoices(initialPop, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `A town's population increases by ${increasePerYear} people per year. After ${years} years, the population is ${currentPop}. What was the initial population?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val} people`),
            answer: String.fromCharCode(65 + choices.indexOf(initialPop)),
            explanation: `Population grew ${increasePerYear} × ${years} = ${increasePerYear * years} people. Initial = ${currentPop} - ${increasePerYear * years} = ${initialPop}.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    templateBookPages(original) {
        const pagesPerDay = this.randomInt(20, 50);
        const days = this.randomInt(8, 20);
        const pagesLeft = this.randomInt(50, 150);
        const totalPages = pagesPerDay * days + pagesLeft;

        const choices = this.generateChoices(totalPages, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `Marcus reads ${pagesPerDay} pages per day for ${days} days and has ${pagesLeft} pages left. How many pages is the book?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val} pages`),
            answer: String.fromCharCode(65 + choices.indexOf(totalPages)),
            explanation: `Pages read = ${pagesPerDay} × ${days} = ${pagesPerDay * days}. Total pages = ${pagesPerDay * days} + ${pagesLeft} = ${totalPages}.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    templateWaterTank(original) {
        const leakRate = this.randomInt(5, 15);
        const hours = this.randomInt(4, 12);
        const currentLevel = this.randomInt(100, 300);
        const initialLevel = currentLevel + leakRate * hours;

        const choices = this.generateChoices(initialLevel, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `A water tank leaks ${leakRate} gallons per hour. After ${hours} hours, it has ${currentLevel} gallons. How many gallons did it start with?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val} gallons`),
            answer: String.fromCharCode(65 + choices.indexOf(initialLevel)),
            explanation: `Water lost = ${leakRate} × ${hours} = ${leakRate * hours} gallons. Initial = ${currentLevel} + ${leakRate * hours} = ${initialLevel} gallons.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    templateSavingsAccount(original) {
        const monthlyDeposit = this.randomInt(50, 200);
        const months = this.randomInt(6, 18);
        const initialAmount = this.randomInt(500, 1500);
        const finalAmount = initialAmount + monthlyDeposit * months;

        const choices = this.generateChoices(finalAmount, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `Lisa started with $${initialAmount} and saved $${monthlyDeposit} per month for ${months} months. How much does she have now?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) $${val}`),
            answer: String.fromCharCode(65 + choices.indexOf(finalAmount)),
            explanation: `Saved amount = ${monthlyDeposit} × ${months} = $${monthlyDeposit * months}. Total = $${initialAmount} + $${monthlyDeposit * months} = $${finalAmount}.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    templateMovieTickets(original) {
        const adultPrice = this.randomInt(12, 18);
        const childPrice = this.randomInt(6, 10);
        const adults = this.randomInt(2, 5);
        const children = this.randomInt(3, 6);
        const total = adultPrice * adults + childPrice * children;

        const choices = this.generateChoices(total, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `Movie tickets cost $${adultPrice} for adults and $${childPrice} for children. If ${adults} adults and ${children} children go, what is the total cost?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) $${val}`),
            answer: String.fromCharCode(65 + choices.indexOf(total)),
            explanation: `Adults: ${adults} × $${adultPrice} = $${adults * adultPrice}. Children: ${children} × $${childPrice} = $${children * childPrice}. Total = $${total}.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    templatePizzaSlices(original) {
        const slicesPerPizza = this.randomInt(6, 10);
        const totalSlices = this.randomInt(40, 80);
        const pizzas = Math.floor(totalSlices / slicesPerPizza);
        const actualTotal = pizzas * slicesPerPizza;

        const choices = this.generateChoices(pizzas, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `Each pizza has ${slicesPerPizza} slices. If you need ${actualTotal} slices, how many pizzas do you need?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val} pizzas`),
            answer: String.fromCharCode(65 + choices.indexOf(pizzas)),
            explanation: `Pizzas needed = ${actualTotal} ÷ ${slicesPerPizza} = ${pizzas} pizzas.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    // ========== ADVANCED ALGEBRA TEMPLATES ==========

    templateNestedParentheses(original) {
        const a = this.randomInt(2, 5);
        const b = this.randomInt(2, 6);
        const c = this.randomInt(1, 8);
        const x = this.randomInt(5, 15);
        const result = a * (b * x + c);

        const choices = this.generateChoices(x, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `If ${a}(${b}x + ${c}) = ${result}, what is the value of x?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val}`),
            answer: String.fromCharCode(65 + choices.indexOf(x)),
            explanation: `Divide by ${a}: ${b}x + ${c} = ${result / a}. Subtract ${c}: ${b}x = ${result / a - c}. Divide by ${b}: x = ${x}.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    templateMultipleTerms(original) {
        const a = this.randomInt(2, 5);
        const b = this.randomInt(3, 8);
        const c = this.randomInt(2, 6);
        const x = this.randomInt(4, 12);
        const result = a * x + b * x + c;

        const choices = this.generateChoices(x, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `If ${a}x + ${b}x + ${c} = ${result}, what is the value of x?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val}`),
            answer: String.fromCharCode(65 + choices.indexOf(x)),
            explanation: `Combine like terms: ${a + b}x + ${c} = ${result}. Subtract ${c}: ${a + b}x = ${result - c}. Divide by ${a + b}: x = ${x}.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    templateDecimalCoefficients(original) {
        const a = this.randomChoice([0.5, 1.5, 2.5, 3.5]);
        const x = this.randomInt(4, 20);
        const b = this.randomInt(2, 10);
        const c = a * x + b;

        const choices = this.generateChoices(x, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `If ${a}x + ${b} = ${c}, what is the value of x?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val}`),
            answer: String.fromCharCode(65 + choices.indexOf(x)),
            explanation: `Subtract ${b}: ${a}x = ${c - b}. Divide by ${a}: x = ${x}.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    templateNegativeCoefficients(original) {
        const a = this.randomInt(2, 6);
        const x = this.randomInt(5, 15);
        const b = this.randomInt(3, 10);
        const c = -a * x + b;

        const choices = this.generateChoices(x, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `If -${a}x + ${b} = ${c}, what is the value of x?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val}`),
            answer: String.fromCharCode(65 + choices.indexOf(x)),
            explanation: `Subtract ${b}: -${a}x = ${c - b}. Divide by -${a}: x = ${x}.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    templateMixedFractions(original) {
        const a = this.randomInt(3, 7);
        const b = this.randomInt(2, 4);
        const c = this.randomInt(2, 5);
        const x = this.randomInt(6, 18);
        const result = (a * x) / b + c;

        const choices = this.generateChoices(x, 4);

        return {
            id: `GEN-${Date.now()}-${this.generatedCount}`,
            topic: original.topic,
            subskill: original.subskill,
            difficulty: original.difficulty,
            question: `If ${a}x/${b} + ${c} = ${result}, what is the value of x?`,
            imageUrl: null,
            choices: choices.map((val, idx) => `${String.fromCharCode(65 + idx)}) ${val}`),
            answer: String.fromCharCode(65 + choices.indexOf(x)),
            explanation: `Subtract ${c}: ${a}x/${b} = ${result - c}. Multiply by ${b}: ${a}x = ${(result - c) * b}. Divide by ${a}: x = ${x}.`,
            type: 'generated',
            baseTemplate: original.id
        };
    }

    // ========== HELPER FUNCTIONS ==========

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    generateChoices(correctAnswer, count = 4) {
        const choices = new Set([correctAnswer]);

        while (choices.size < count) {
            const offset = this.randomInt(-8, 8);
            const newChoice = correctAnswer + offset;
            if (newChoice !== correctAnswer && newChoice > 0) {
                choices.add(newChoice);
            }
        }

        return this.shuffle(Array.from(choices));
    }

    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

const problemGenerator = new ProblemGenerator();
window.problemGenerator = problemGenerator;