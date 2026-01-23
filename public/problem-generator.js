// public/problem-generator.js

class ProblemGenerator {
    constructor() {
        this.generatedCount = 0;
        this.sessionCounter = 1;
    }

    // =========================================================
    // ✅ STATIC POOL REGISTRATION SYSTEM
    // =========================================================
    static poolsBySubskill = {};

    static registerPools(subskillKey, pools) {
        if (!subskillKey || !pools) {
            console.warn("❌ registerPools called with invalid args", subskillKey, pools);
            return;
        }
        ProblemGenerator.poolsBySubskill[subskillKey] = pools;
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
                console.warn(`No generator registered for subskill: ${originalProblem.subskill}`);
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

    // =========================================================
    // ✅ AUTO GENERATOR: uses registered pools
    // =========================================================
    getGenerator(subskill) {
        const pools = ProblemGenerator.poolsBySubskill[subskill];

        if (!pools) {
            // This is what causes "Coming soon"
            return null;
        }

        return (original) => this.generateFromPools(subskill, original);
    }

    generateFromPools(subskillKey, original) {
        const pools = ProblemGenerator.poolsBySubskill[subskillKey];
        if (!pools) {
            console.warn(`❌ Pools missing for subskill "${subskillKey}"`);
            return null;
        }

        const difficulty = (original.difficulty || "medium").toLowerCase();

        let pool = [];
        if (difficulty === "easy") pool = pools.easy || [];
        else if (difficulty === "hard") pool = pools.hard || [];
        else pool = (pools.medium || []).concat(pools.easy || []);

        if (!pool.length) {
            console.warn(`❌ Pool empty for subskill "${subskillKey}" difficulty "${difficulty}"`);
            return null;
        }

        // ✅ KEY FIX: try ALL templates, not just one
        const shuffled = this.shuffle(pool);

        for (const methodName of shuffled) {
            if (typeof this[methodName] !== "function") {
                console.warn(`❌ Template "${methodName}" not found`);
                continue;
            }

            const result = this[methodName](original);
            if (result) return result;
        }

        console.warn(`❌ No valid templates succeeded for "${subskillKey}" (${difficulty})`);
        return null;
    }

    // =========================================================
    // ✅ READABILITY HELPERS
    // =========================================================
    ital(v) {
        return `<i>${v}</i>`;
    }

    math(s) {
        return `<span class="math">${s}</span>`;
    }

    makeSteps(stepsArray) {
        return stepsArray
            .map((s, i) => `<b>Step ${i + 1}:</b> ${s}`)
            .join("<br><br>");
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
        return `GEN-SAT-${diff}-${num}`;
    }

    // =========================================================
    // RANDOM HELPERS
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

    // =========================================================
    // CHOICES + BUILD
    // =========================================================
    generateChoicesNumber(correctAnswer, count = 4, spread = 6) {
        const base = Number(correctAnswer);

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

            const effectiveSpread = Math.max(2, Math.abs(spread));
            const offset = this.randomInt(-effectiveSpread, effectiveSpread);

            const decimalBump =
                Math.random() < 0.25
                    ? Number((Math.random() * 0.8 - 0.4).toFixed(2))
                    : 0;

            let candidate = base + offset + decimalBump;

            if (Math.abs(candidate) < 200 && Math.random() < 0.7) {
                candidate = Number(candidate.toFixed(2));
            }

            if (candidate !== base) choices.add(candidate);
        }

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
        if (correctIndex === -1) correctIndex = values.findIndex((v) => `${v}` === `${correctValue}`);
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
}

// ✅ Expose class to other generator files
window.ProblemGenerator = ProblemGenerator;

// ✅ Single global instance
window.problemGenerator = new ProblemGenerator();
