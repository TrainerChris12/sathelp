// public/generators/algebra/linearEqTwoVar/register.js
// ✅ Registration for Linear Equations in Two Variables

(function () {
    if (!window.ProblemGenerator) {
        console.error("❌ ProblemGenerator not loaded before linearEqTwoVar/register.js");
        return;
    }

    const pools = {
        easy: [
            "template_coefficient_interpretation",
            "template_perpendicular_lines",
            "template_mixture_subtraction",
            "template_solve_given_one_variable",
            "template_sum_interpretation",
            "template_time_rate_equation",
            "template_point_slope_equation",
            "template_geometric_construction",
            "template_direct_proportion",
            "template_percentage_mixture",
            "template_revenue_interpretation",
            "template_parallel_line"
        ],
        medium: [
            // add medium template names here
        ],
        hard: [
            // add hard template names here
        ]
    };

    window.ProblemGenerator.registerPools("linear-equations-two-variables", pools);

    console.log("✅ linear-equations-two-variables pools registered:", {
        easy: pools.easy.length,
        medium: pools.medium.length,
        hard: pools.hard.length
    });
})();
