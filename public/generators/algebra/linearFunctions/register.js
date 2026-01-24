// /public/generators/algebra/linearFunctions/register.js

if (!window.ProblemGenerator) {
    console.error("❌ ProblemGenerator not loaded before linearFunctions/register.js");
} else {
    // Register pools by subskill key
    window.ProblemGenerator.registerPools("linear-functions", {
        easy: [
            // Graph-based templates
            "tplGraphReadYValueEasy",
            "tplGraphFindYInterceptEasy",
            "tplGraphFindXInterceptEasy",
            "tplGraphFindSlopeEasy",
            "tplGraphReadPointEasy",

            // Non-graph templates
            "tplEvaluateFunctionEasy",
            "tplSolveForInputEasy",
            "tplWriteEquationFromContextEasy",
            "tplInterpretSlopeEasy",
            "tplInterpretYInterceptEasy",
            "tplEquationFromSlopeInterceptEasy",
            "tplSavingsOverTimeEasy",
            "tplLinearModelEasy",
        ],
        medium: [
            // Placeholder for future medium templates
        ],
        hard: [
            // Placeholder for future hard templates
        ],
    });

    console.log("✅ linear-functions pools registered");
}