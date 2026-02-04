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
    static templates = {};

    static registerTemplate(templateName, generatorFn) {
        if (!templateName || typeof generatorFn !== "function") {
            console.warn("❌ registerTemplate called with invalid args", templateName);
            return;
        }
        ProblemGenerator.templates[templateName] = generatorFn;
    }

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
            // ✅ CHECK BOTH: static templates registry AND instance methods
            const templateFn = ProblemGenerator.templates[methodName] || this[methodName];

            if (typeof templateFn !== "function") {
                console.warn(`❌ Template "${methodName}" not found`);
                continue;
            }

            // ✅ Call with proper context
            const result = templateFn.call(this, original);
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

    // =========================================================
    // TABLE GENERATION
    // =========================================================
    makeTable(headers, rows) {
        let html = `<table style="border-collapse: collapse; margin: 15px auto; max-width: 400px;">`;

        // Headers
        html += `<tr>`;
        headers.forEach(h => {
            html += `<th style="border: 2px solid var(--border); padding: 10px; background: var(--secondary); font-weight: 600;">${h}</th>`;
        });
        html += `</tr>`;

        // Rows
        rows.forEach(row => {
            html += `<tr>`;
            row.forEach(cell => {
                html += `<td style="border: 2px solid var(--border); padding: 10px; text-align: center;">${cell}</td>`;
            });
            html += `</tr>`;
        });

        html += `</table>`;
        return html;
    }

    // =========================================================
    // LINEAR FUNCTION GRAPH GENERATION
    // =========================================================
    makeLinearGraph(m, b, options = {}) {
        const {
            width = 400,
            height = 300,
            xMin = -5,
            xMax = 5,
            yMin = -5,
            yMax = 5,
            showGrid = true,
            showAxes = true,
            showLine = true,
            highlightPoints = []
        } = options;

        const padding = 40;
        const graphWidth = width - 2 * padding;
        const graphHeight = height - 2 * padding;

        // Scale functions
        const scaleX = (x) => padding + ((x - xMin) / (xMax - xMin)) * graphWidth;
        const scaleY = (y) => height - padding - ((y - yMin) / (yMax - yMin)) * graphHeight;

        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="border: 2px solid var(--border); border-radius: 8px; background: var(--bg-card); margin: 15px auto; display: block;">`;

        // Grid
        if (showGrid) {
            svg += `<g stroke="var(--border)" stroke-width="1" opacity="0.3">`;
            for (let x = xMin; x <= xMax; x++) {
                const xPos = scaleX(x);
                svg += `<line x1="${xPos}" y1="${padding}" x2="${xPos}" y2="${height - padding}"/>`;
            }
            for (let y = yMin; y <= yMax; y++) {
                const yPos = scaleY(y);
                svg += `<line x1="${padding}" y1="${yPos}" x2="${width - padding}" y2="${yPos}"/>`;
            }
            svg += `</g>`;
        }

        // Axes
        if (showAxes) {
            const xAxisY = scaleY(0);
            const yAxisX = scaleX(0);

            svg += `<g stroke="var(--text)" stroke-width="2">`;
            svg += `<line x1="${padding}" y1="${xAxisY}" x2="${width - padding}" y2="${xAxisY}"/>`;
            svg += `<line x1="${yAxisX}" y1="${padding}" x2="${yAxisX}" y2="${height - padding}"/>`;

            // Arrows
            svg += `<polygon points="${width - padding},${xAxisY} ${width - padding - 8},${xAxisY - 4} ${width - padding - 8},${xAxisY + 4}" fill="var(--text)"/>`;
            svg += `<polygon points="${yAxisX},${padding} ${yAxisX - 4},${padding + 8} ${yAxisX + 4},${padding + 8}" fill="var(--text)"/>`;
            svg += `</g>`;

            // Axis labels
            svg += `<text x="${width - padding + 15}" y="${xAxisY + 5}" fill="var(--text)" font-size="14" font-weight="600">x</text>`;
            svg += `<text x="${yAxisX + 5}" y="${padding - 10}" fill="var(--text)" font-size="14" font-weight="600">y</text>`;
        }

        // Line
        if (showLine) {
            const y1 = m * xMin + b;
            const y2 = m * xMax + b;

            svg += `<line x1="${scaleX(xMin)}" y1="${scaleY(y1)}" x2="${scaleX(xMax)}" y2="${scaleY(y2)}" stroke="#0066b3" stroke-width="3"/>`;
        }

        // Highlight points
        highlightPoints.forEach(([x, y, label]) => {
            const cx = scaleX(x);
            const cy = scaleY(y);

            svg += `<circle cx="${cx}" cy="${cy}" r="5" fill="#ef4444" stroke="#fff" stroke-width="2"/>`;
            if (label) {
                svg += `<text x="${cx + 10}" y="${cy - 10}" fill="var(--text)" font-size="12" font-weight="600">(${x}, ${y})</text>`;
            }
        });

        svg += `</svg>`;
        return svg;
    }

    // =========================================================
    // SCATTER PLOT FOR DATA
    // =========================================================
    makeScatterPlot(points, options = {}) {
        const {
            width = 400,
            height = 300,
            xLabel = 'x',
            yLabel = 'y',
            showLine = false,
            m = null,
            b = null
        } = options;

        // Find ranges from data
        const xValues = points.map(p => p[0]);
        const yValues = points.map(p => p[1]);
        const xMin = Math.min(...xValues) - 1;
        const xMax = Math.max(...xValues) + 1;
        const yMin = Math.min(...yValues) - 1;
        const yMax = Math.max(...yValues) + 1;

        const padding = 50;
        const graphWidth = width - 2 * padding;
        const graphHeight = height - 2 * padding;

        const scaleX = (x) => padding + ((x - xMin) / (xMax - xMin)) * graphWidth;
        const scaleY = (y) => height - padding - ((y - yMin) / (yMax - yMin)) * graphHeight;

        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="border: 2px solid var(--border); border-radius: 8px; background: var(--bg-card); margin: 15px auto; display: block;">`;

        // Axes
        const xAxisY = scaleY(0);
        const yAxisX = scaleX(0);

        svg += `<g stroke="var(--text)" stroke-width="2">`;
        svg += `<line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}"/>`;
        svg += `<line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}"/>`;
        svg += `</g>`;

        // Axis labels
        svg += `<text x="${width / 2}" y="${height - 10}" fill="var(--text)" font-size="14" font-weight="600" text-anchor="middle">${xLabel}</text>`;
        svg += `<text x="${15}" y="${height / 2}" fill="var(--text)" font-size="14" font-weight="600" text-anchor="middle" transform="rotate(-90, 15, ${height / 2})">${yLabel}</text>`;

        // Line of best fit
        if (showLine && m !== null && b !== null) {
            const y1 = m * xMin + b;
            const y2 = m * xMax + b;
            svg += `<line x1="${scaleX(xMin)}" y1="${scaleY(y1)}" x2="${scaleX(xMax)}" y2="${scaleY(y2)}" stroke="#0066b3" stroke-width="2" opacity="0.7"/>`;
        }

        // Points
        points.forEach(([x, y]) => {
            const cx = scaleX(x);
            const cy = scaleY(y);
            svg += `<circle cx="${cx}" cy="${cy}" r="6" fill="#ef4444" stroke="#fff" stroke-width="2"/>`;
        });

        svg += `</svg>`;
        return svg;
    }
}

// ✅ Expose class to other generator files
window.ProblemGenerator = ProblemGenerator;

// ✅ Single global instance
window.problemGenerator = new ProblemGenerator();
