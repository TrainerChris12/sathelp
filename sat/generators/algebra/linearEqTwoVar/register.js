// generators/algebra/systemsLinearEq/register.js


// ... rest of your register.js code
(function() {
    if (!window.problemGenerator) {
        console.error('Problem generator not initialized!');
        return;
    }

    if (!window.SystemsLinearEqEasy) {
        console.error('SystemsLinearEqEasy templates not loaded!');
        return;
    }

    // Register all templates for systems-linear-equations easy
    const templates = [
        window.SystemsLinearEqEasy.twoItemsPurchase,
        window.SystemsLinearEqEasy.substitutionGiven,
        window.SystemsLinearEqEasy.eliminationAddition,
        window.SystemsLinearEqEasy.findLinearCombination,
        window.SystemsLinearEqEasy.ticketsProblem,
        window.SystemsLinearEqEasy.yEqualsConstant,
        window.SystemsLinearEqEasy.moneyProblem,
        window.SystemsLinearEqEasy.infinitelySolutions,
        window.SystemsLinearEqEasy.findSingleVariable,
        window.SystemsLinearEqEasy.negativeSolution,
        window.SystemsLinearEqEasy.decimalWordProblem,
        window.SystemsLinearEqEasy.ratioTimesProblem
    ];

    templates.forEach(template => {
        problemGenerator.registerTemplate('systems-linear-equations', 'easy', template);
    });

    console.log(`✅ Registered ${templates.length} templates for systems-linear-equations (easy)`);
})();