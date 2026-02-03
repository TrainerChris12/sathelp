if (!window.ProblemGenerator) {
    console.error("❌ ProblemGenerator not loaded before linearFunctions/register.js");
} else {
    window.ProblemGenerator.registerPools("linear-functions", {
        easy: [
            // ===== GRAPH-BASED (direct visual reading) =====
            "tplGraphReadYValueEasy",           // Read y-value from graph
            "tplGraphFindYInterceptEasy",       // Identify y-intercept on graph
            "tplGraphFindXInterceptEasy",       // Identify x-intercept on graph
            "tplGraphFindSlopeEasy",            // Calculate slope from labeled points
            "tplGraphReadPointEasy",            // Read coordinates of point

            // ===== NON-GRAPH (basic interpretation) =====
            "tplEvaluateFunctionEasy",          // f(x) = 3x + 5, find f(4)
            "tplSolveForInputEasy",             // f(x) = 3x + 5, if f(x) = 17, find x
            "tplWriteEquationFromContextEasy",  // Word problem → equation
            "tplInterpretSlopeEasy",            // "What does 3 represent?"
            "tplInterpretYInterceptEasy",       // "What does 20 represent?"
            "tplEquationFromSlopeInterceptEasy",// Given slope=3, y-int=5, write equation
            "tplSavingsOverTimeEasy",           // Simple accumulation
            "tplLinearModelEasy"                // Plug numbers into equation
        ],

        medium: [
            // ===== TABLE ANALYSIS (8 templates) =====
            "tplTableIsFunctionMedium",         // Is this table a function?
            "tplTableRateOfChangeMedium",       // Find rate of change from table
            "tplCompleteTablePatternMedium",    // Fill in missing table value
            "tplWhichPointSatisfiesMedium",     // Which point fits the pattern?
            "tplTableToEquationMedium",         // Table → equation
            "tplTableFixedCostMedium",          // Find fixed cost from table
            "tplTableEvaluateNewMedium",        // Given table, find f(k)
            "tplTableUnitConversionMedium",     // Table with unit conversion

            // ===== GRAPH INTERPRETATION (5 templates) =====
            "tplGraphSlopeSignMedium",          // Positive or negative slope?
            "tplGraphCompareSteepnessMedium",   // Which line is steeper?
            "tplGraphNegativeSlopeContextMedium", // Interpret negative slope
            "tplGraphCrossZeroMedium",          // When does it cross zero?
            "tplGraphInitialValueMedium",       // What's the initial value?

            // ===== MULTI-STEP REASONING (5 templates) =====
            "tplPerpSlopeConvertMedium",        // Convert ax+by=c, find perpendicular
            "tplTwoPointsEvaluateMedium",       // Given f(3)=11, f(5)=17, find f(10)
            "tplFindParameterMedium",           // Given f(x)=mx+b and f(3)=11, find m
            "tplRealWorldRateMedium",           // Real-world distance/rate problems
            "tplDecreasingPatternMedium"        // Decreasing linear patterns
        ],

        hard: [
            // ===== TIERED PRICING (first-N-then-rate) =====
            "tplTieredPricingHard",             // rental/service with threshold pricing

            // ===== TWO-POINT MODEL → EVALUATE =====
            "tplTwoPointModelHard",             // build model from 2 data points, evaluate at new x

            // ===== INTERPRET A CONSTANT (non-obvious) =====
            "tplInterpretConstantHard",         // point-slope form — constant is NOT y-intercept

            // ===== RATE-OF-CHANGE ONLY (constant cancels) =====
            "tplRateOfChangeOnlyHard",          // "if input ↑ by Δ, output ↑ by ?"

            // ===== FUNCTION COMPOSITION =====
            "tplCompositionHard",               // h(x) = f(g(x)), find x-intercept

            // ===== INDIRECT EVALUATION =====
            "tplIndirectEvalHard",              // f(kx) = expr, find f(n)

            // ===== REAL-WORLD RATE MODEL =====
            "tplRealWorldModelHard",            // given 2 data points, which equation models it?

            // ===== COVERAGE / PROPORTION =====
            "tplCoverageProportionHard",        // area ÷ coverage with coat multiplier

            // ===== INVERSE SOLVE =====
            "tplInverseSolveHard"               // given output, solve for input (rearrange)
        ]
    });

    console.log("✅ linear-functions pools registered:");
    console.log("   Easy   = 13 templates (graphs + basic interpretation)");
    console.log("   Medium = 18 templates (tables + graph analysis + reasoning)");
    console.log("   Hard   =  9 templates (tiered pricing, composition, inverse, interpretation, …)");
}