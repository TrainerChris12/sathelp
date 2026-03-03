// sat/generators/algebra/systemsOfTwoLinEq/register.js
(function () {
    console.log("🔵 Systems register.js loading (prototype mode)...");

    if (!window.ProblemGenerator) {
        console.error("❌ ProblemGenerator not available in systems register.js!");
        return;
    }

    window.ProblemGenerator.registerPools("systems-linear-equations", {
        easy: [
            "twoItemsPurchase",
            "substitutionGiven",
            "eliminationAddition",
            "findLinearCombination",
            "ticketsProblem",
            "moneyProblem",
            "infinitelySolutions",
            "negativeSolution",
            "decimalWordProblem",
            "ratioTimesProblem",
            "graphInterpretation",
            "solveForCombined",
            "solveForActualQuantity"
        ],
        medium: [],
        hard: [],
    });

    console.log("✅ Systems pools registered: 13 easy templates");
})();