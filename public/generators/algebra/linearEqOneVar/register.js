// /public/generators/algebra/linearEqOneVar/register.js

if (!window.ProblemGenerator) {
    console.error("❌ ProblemGenerator not loaded before linearEqOneVar/register.js");
} else {
    // ✅ NEW STYLE: register pools by subskill key
    window.ProblemGenerator.registerPools("linear-equations-one-variable", {
        easy: [
            "tplSimpleAddition",
            "tplSimpleSubtraction",
            "tplDistributiveOneSide",
            "tplTwoSidedBasic",
        ],
        medium: [
            "tplWithFractions",
            "tplNegativeCoefficient",
            "tplSolveForExpression",
            "tplPerimeterWord",
            "tplPercentChangeWord",
        ],
        hard: [
            // existing hard
            "tplInfiniteSolutionsSolveConstant",
            "tplNoSolutionsSolveConstant",
            "tplHowManySolutions",
            "tplCostPerMileChooseEquation",
            "tplStationsExpression",
            "tplConstantRateWordHard",
            "tplDecimalCoefficientsSolve",
            "tplParameterNoSolutionB",
            "tplComplexMultiStep",
            "tplTicketSalesWord",

            // NEW hard (from your practice set)
            "tplInfiniteSolutionsSolveKDistributiveHard",
            "tplConstantRateMinutesDrainHard",
            "tplNoSolutionSolveKHard",
            "tplInfiniteSolutionsAPlusBHard",
            "tplRentalMilesEqualHard",
            "tplExpandToAxPlusBHard",
            "tplInfiniteSolutionsCExpandHard",
            "tplNetRatePoolHard",
            "tplBasketEquationModelHard",
            "tplConsecutiveIntegersHard",
            "tplPerimeterExpressionHard",
            "tplDiscountAndTaxHard",
            "tplWorkRateHard",
            "tplAgeDifferenceHard",
            "tplTemperatureConversionHard",
            "tplPhonePlanHard",
            "tplShippingWeightHard",
            "tplDistributeBothSidesHard",
            "tplUnitRateConversionHard",

        ],
    });

    console.log("✅ linear-equations-one-variable pools registered");
}
