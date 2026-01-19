// public/problem-generator.js

class ProblemGenerator {
    constructor() {
        this.generatedCount = 0;
    }

    // Generate a similar problem based on a template
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

    // Get the appropriate generator function for each subskill
    getGenerator(subskill) {
        const generators = {
            'linear-equations-one-variable': this.generateLinearEquation.bind(this)
        };

        return generators[subskill] || null;
    }

    // Generator for linear equations in one variable
    generateLinearEquation(original) {
        const templates = [
            this.templateSimpleAddition,
            this.templateSimpleSubtraction,
            this.templateDistributive,
            this.templateTwoSided,
            this.templateWithFractions
        ];

        // Pick random template
        const template = templates[Math.floor(Math.random() * templates.length)];
        return template.call(this, original);
    }

    // Template 1: ax + b = c
    templateSimpleAddition(original) {
        const a = this.randomInt(2, 8);
        const x = this.randomInt(2, 15);
        const b = this.randomInt(1, 20);
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
            type: 'generated',
            baseTemplate: original.id
        };
    }

    // Template 2: ax - b = c
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
            type: 'generated',
            baseTemplate: original.id
        };
    }

    // Template 3: a(x - b) = c
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
            type: 'generated',
            baseTemplate: original.id
        };
    }

    // Template 4: ax + b = cx + d
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
            type: 'generated',
            baseTemplate: original.id
        };
    }

    // Template 5: (x + a)/b = c
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
            type: 'generated',
            baseTemplate: original.id
        };
    }

    // Helper: Random integer between min and max (inclusive)
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Helper: Generate multiple choice options
    generateChoices(correctAnswer, count = 4) {
        const choices = new Set([correctAnswer]);

        while (choices.size < count) {
            const offset = this.randomInt(-5, 5);
            const newChoice = correctAnswer + offset;
            if (newChoice !== correctAnswer && newChoice > 0) {
                choices.add(newChoice);
            }
        }

        // Convert to array and shuffle
        const choicesArray = Array.from(choices);
        return this.shuffle(choicesArray);
    }

    // Helper: Shuffle array
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Create single instance
const problemGenerator = new ProblemGenerator();
window.problemGenerator = problemGenerator;