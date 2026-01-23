// public/problem-generator-bootstrap.js

if (!window.ProblemGenerator) {
    console.error("❌ ProblemGenerator class missing. Load problem-generator.js first.");
} else {
    const problemGenerator = new window.ProblemGenerator();
    window.problemGenerator = problemGenerator;
}
