// generators/algebra/systemsLinearEq/easy.js

window.SystemsLinearEqEasy = {

    // =========================================================
    // TEMPLATE 1: Word Problem - Two Items with Total & Revenue
    // =========================================================

    twoItemsPurchase() {
        const scenarios = [
            { item1: "notebook", item2: "pen", var1: "n", var2: "p" },
            { item1: "apple", item2: "banana", var1: "a", var2: "b" },
            { item1: "shirt", item2: "hat", var1: "s", var2: "h" },
            { item1: "adult ticket", item2: "child ticket", var1: "a", var2: "c" },
            { item1: "small pizza", item2: "large pizza", var1: "s", var2: "l" }
        ];

        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

        const price1 = [3, 4, 5, 6, 7, 8][Math.floor(Math.random() * 6)];
        const price2 = [2, 3, 4, 5][Math.floor(Math.random() * 4)];

        // Ensure price1 > price2
        const [highPrice, lowPrice] = price1 > price2 ? [price1, price2] : [price2, price1];

        const total = [20, 25, 30, 35, 40, 45, 50][Math.floor(Math.random() * 7)];

        // Generate valid quantities
        const qty1 = Math.floor(Math.random() * (total / 2)) + 5;
        const qty2 = total - qty1;
        const revenue = highPrice * qty1 + lowPrice * qty2;

        const question = `A store sells ${scenario.item1}s for $${highPrice} each and ${scenario.item2}s for $${lowPrice} each. Yesterday, the store sold a total of ${total} items for $${revenue}. If ${scenario.var1} represents the number of ${scenario.item1}s sold and ${scenario.var2} represents the number of ${scenario.item2}s sold, which system of equations represents this situation?`;

        const correctEq1 = `${scenario.var1} + ${scenario.var2} = ${total}`;
        const correctEq2 = `${highPrice}${scenario.var1} + ${lowPrice}${scenario.var2} = ${revenue}`;

        // Wrong answer variations
        const wrongA = `${scenario.var1} + ${scenario.var2} = ${revenue}\n   ${highPrice}${scenario.var1} + ${lowPrice}${scenario.var2} = ${total}`;
        const wrongB = `${highPrice}${scenario.var1} + ${lowPrice}${scenario.var2} = ${total}\n   ${scenario.var1} + ${scenario.var2} = ${revenue}`;
        const wrongC = `${scenario.var1} + ${scenario.var2} = ${total}\n   ${lowPrice}${scenario.var1} + ${highPrice}${scenario.var2} = ${revenue}`;

        const correct = `${correctEq1}\n   ${correctEq2}`;

        const choices = [correct, wrongA, wrongB, wrongC];
        const shuffled = choices.sort(() => Math.random() - 0.5);
        const answer = String.fromCharCode(65 + shuffled.indexOf(correct));

        return {
            topic: "algebra",
            subskill: "systems-linear-equations",
            difficulty: "easy",
            question: question,
            choices: shuffled.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`),
            answer: answer,
            explanation: `The total items is ${correctEq1}. The total revenue is ${correctEq2}.`
        };
    },

    // =========================================================
    // TEMPLATE 2: Substitution - One Variable Given
    // =========================================================

    substitutionGiven() {
        const xVal = [1, 2, 3, 4, 5][Math.floor(Math.random() * 5)];
        const coef = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
        const yCoef = [2, 3, 4][Math.floor(Math.random() * 3)];
        const constant = coef * xVal + yCoef * [2, 3, 4, 5][Math.floor(Math.random() * 4)];

        const yVal = Math.floor((constant - coef * xVal) / yCoef);

        const question = `What is the solution (x, y) to the given system of equations?\n\n${coef}x + ${yCoef}y = ${constant}\nx = ${xVal}`;

        const correct = `(${xVal}, ${yVal})`;
        const wrong1 = `(${yVal}, ${xVal})`;
        const wrong2 = `(${xVal}, ${yVal + 1})`;
        const wrong3 = `(${xVal + 1}, ${yVal})`;

        const choices = [correct, wrong1, wrong2, wrong3];
        const shuffled = choices.sort(() => Math.random() - 0.5);
        const answer = String.fromCharCode(65 + shuffled.indexOf(correct));

        return {
            topic: "algebra",
            subskill: "systems-linear-equations",
            difficulty: "easy",
            question: question,
            choices: shuffled.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`),
            answer: answer,
            explanation: `Substitute x = ${xVal} into the first equation: ${coef}(${xVal}) + ${yCoef}y = ${constant}, which gives ${coef * xVal} + ${yCoef}y = ${constant}, so ${yCoef}y = ${constant - coef * xVal} and y = ${yVal}.`
        };
    },

    // =========================================================
    // TEMPLATE 3: Solve System with Elimination (Addition)
    // =========================================================

    eliminationAddition() {
        const x = [1, 2, 3, 4, 5][Math.floor(Math.random() * 5)];
        const y = [1, 2, 3, 4][Math.floor(Math.random() * 4)];

        const a1 = [1, 2, 3][Math.floor(Math.random() * 3)];
        const b1 = [1, 2, 3][Math.floor(Math.random() * 3)];
        const c1 = a1 * x + b1 * y;

        const a2 = [1, 2][Math.floor(Math.random() * 2)];
        const b2 = -b1; // Make y coefficients opposites for easy elimination
        const c2 = a2 * x + b2 * y;

        const question = `What is the solution (x, y) to the given system of equations?\n\n${a1}x + ${b1}y = ${c1}\n${a2}x ${b2 >= 0 ? '+' : ''}${b2}y = ${c2}`;

        const correct = `(${x}, ${y})`;
        const wrong1 = `(${y}, ${x})`;
        const wrong2 = `(${x + 1}, ${y})`;
        const wrong3 = `(${x}, ${y + 1})`;

        const choices = [correct, wrong1, wrong2, wrong3];
        const shuffled = choices.sort(() => Math.random() - 0.5);
        const answer = String.fromCharCode(65 + shuffled.indexOf(correct));

        return {
            topic: "algebra",
            subskill: "systems-linear-equations",
            difficulty: "easy",
            question: question,
            choices: shuffled.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`),
            answer: answer,
            explanation: `Add the equations to eliminate y: (${a1}x + ${b1}y) + (${a2}x ${b2 >= 0 ? '+' : ''}${b2}y) = ${c1} + ${c2}, giving ${a1 + a2}x = ${c1 + c2}, so x = ${x}. Substitute to find y = ${y}.`
        };
    },

    // =========================================================
    // TEMPLATE 4: Find x + y (Linear Combination)
    // =========================================================

    findLinearCombination() {
        const x = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
        const y = [1, 2, 3, 4][Math.floor(Math.random() * 4)];

        const eq1 = `x + y = ${x + y}`;
        const eq2 = `x - y = ${x - y}`;

        const combos = [
            { expr: "x + y", val: x + y },
            { expr: "2x + y", val: 2 * x + y },
            { expr: "x - y", val: x - y },
            { expr: "2x", val: 2 * x }
        ];

        const combo = combos[Math.floor(Math.random() * combos.length)];

        const question = `The solution to the given system of equations is (x, y). What is the value of ${combo.expr}?\n\n${eq1}\n${eq2}`;

        const correct = combo.val;
        const wrong1 = combo.val + 1;
        const wrong2 = combo.val - 1;
        const wrong3 = combo.val + 2;

        const choices = [correct, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5);
        const answer = String.fromCharCode(65 + choices.indexOf(correct));

        return {
            topic: "algebra",
            subskill: "systems-linear-equations",
            difficulty: "easy",
            question: question,
            choices: choices.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`),
            answer: answer,
            explanation: `Adding the equations: 2x = ${2 * x}, so x = ${x}. From ${eq1}: y = ${y}. Therefore ${combo.expr} = ${combo.val}.`
        };
    },

    // =========================================================
    // TEMPLATE 5: Tickets/Admission Problem
    // =========================================================

    ticketsProblem() {
        const contexts = [
            { place: "concert", type1: "general admission", type2: "VIP" },
            { place: "museum", type1: "adult", type2: "student" },
            { place: "zoo", type1: "adult", type2: "child" },
            { place: "amusement park", type1: "regular", type2: "fast pass" }
        ];

        const context = contexts[Math.floor(Math.random() * contexts.length)];

        const price1 = [15, 18, 20, 22, 25][Math.floor(Math.random() * 5)];
        const price2 = [8, 10, 12][Math.floor(Math.random() * 3)];
        const total = [50, 60, 75, 80, 100][Math.floor(Math.random() * 5)];

        const qty1 = Math.floor(total * 0.4) + Math.floor(Math.random() * 10);
        const qty2 = total - qty1;
        const revenue = price1 * qty1 + price2 * qty2;

        const question = `A ${context.place} sells ${context.type1} tickets for $${price1} and ${context.type2} tickets for $${price2}. Yesterday, they sold ${total} total tickets for $${revenue}. If a represents ${context.type1} tickets and b represents ${context.type2} tickets, which system can be used to find a and b?`;

        const correct = `a + b = ${total}\n   ${price1}a + ${price2}b = ${revenue}`;
        const wrong1 = `a + b = ${revenue}\n   ${price1}a + ${price2}b = ${total}`;
        const wrong2 = `${price1}a + ${price2}b = ${total}\n   a + b = ${revenue}`;
        const wrong3 = `a + b = ${total}\n   ${price2}a + ${price1}b = ${revenue}`;

        const choices = [correct, wrong1, wrong2, wrong3];
        const shuffled = choices.sort(() => Math.random() - 0.5);
        const answer = String.fromCharCode(65 + shuffled.indexOf(correct));

        return {
            topic: "algebra",
            subskill: "systems-linear-equations",
            difficulty: "easy",
            question: question,
            choices: shuffled.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`),
            answer: answer,
            explanation: `Total tickets: a + b = ${total}. Total revenue: ${price1}a + ${price2}b = ${revenue}.`
        };
    },

    // =========================================================
    // TEMPLATE 6: Simple Substitution with y = constant
    // =========================================================

    yEqualsConstant() {
        const yVal = [1, 2, 3, 4, 5][Math.floor(Math.random() * 5)];
        const xCoef = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
        const yCoef = [1, 2, 3][Math.floor(Math.random() * 3)];
        const xVal = [1, 2, 3, 4][Math.floor(Math.random() * 4)];
        const constant = xCoef * xVal + yCoef * yVal;

        const question = `What is the solution (x, y) to the given system of equations?\n\n${xCoef}x + ${yCoef}y = ${constant}\ny = ${yVal}`;

        const correct = `(${xVal}, ${yVal})`;
        const wrong1 = `(${yVal}, ${xVal})`;
        const wrong2 = `(${xVal + 1}, ${yVal})`;
        const wrong3 = `(${xVal}, ${yVal + 1})`;

        const choices = [correct, wrong1, wrong2, wrong3];
        const shuffled = choices.sort(() => Math.random() - 0.5);
        const answer = String.fromCharCode(65 + shuffled.indexOf(correct));

        return {
            topic: "algebra",
            subskill: "systems-linear-equations",
            difficulty: "easy",
            question: question,
            choices: shuffled.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`),
            answer: answer,
            explanation: `Substitute y = ${yVal}: ${xCoef}x + ${yCoef * yVal} = ${constant}, so ${xCoef}x = ${constant - yCoef * yVal} and x = ${xVal}.`
        };
    },

    // =========================================================
    // TEMPLATE 7: Bills/Money Problem (with decimals)
    // =========================================================

    moneyProblem() {
        const bill1 = [5, 10, 20][Math.floor(Math.random() * 3)];
        const bill2 = bill1 === 5 ? 1 : (bill1 === 10 ? 5 : 10);

        const total = [10, 12, 15, 18, 20][Math.floor(Math.random() * 5)];
        const qty1 = Math.floor(total * 0.3) + 2;
        const qty2 = total - qty1;
        const value = bill1 * qty1 + bill2 * qty2;

        const question = `A wallet contains $${bill1} bills and $${bill2} bills. There are ${total} bills total worth $${value}. If x represents the number of $${bill1} bills and y represents the number of $${bill2} bills, which system represents this?`;

        const correct = `x + y = ${total}\n   ${bill1}x + ${bill2}y = ${value}`;
        const wrong1 = `x + y = ${value}\n   ${bill1}x + ${bill2}y = ${total}`;
        const wrong2 = `${bill1}x + ${bill2}y = ${total}\n   x + y = ${value}`;
        const wrong3 = `x + y = ${total}\n   ${bill2}x + ${bill1}y = ${value}`;

        const choices = [correct, wrong1, wrong2, wrong3];
        const shuffled = choices.sort(() => Math.random() - 0.5);
        const answer = String.fromCharCode(65 + shuffled.indexOf(correct));

        return {
            topic: "algebra",
            subskill: "systems-linear-equations",
            difficulty: "easy",
            question: question,
            choices: shuffled.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`),
            answer: answer,
            explanation: `Total bills: x + y = ${total}. Total value: ${bill1}x + ${bill2}y = ${value}.`
        };
    },

    // =========================================================
    // TEMPLATE 8: Infinitely Many Solutions
    // =========================================================

    infinitelySolutions() {
        const a = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
        const b = [3, 4, 5, 6][Math.floor(Math.random() * 4)];
        const c = [6, 8, 9, 12][Math.floor(Math.random() * 4)];

        const multiplier = [2, 3, 4][Math.floor(Math.random() * 3)];
        const k = c / multiplier;

        const question = `In the given system of equations, k is a constant. If the system has infinitely many solutions, what is the value of k?\n\n${a * multiplier}x + ${b * multiplier}y = ${c}\n${a}x + ${b}y = k`;

        const correct = k;
        const wrong1 = k + 1;
        const wrong2 = k * 2;
        const wrong3 = c;

        const choices = [correct, wrong1, wrong2, wrong3].sort((a, b) => a - b);
        const answer = String.fromCharCode(65 + choices.indexOf(correct));

        return {
            topic: "algebra",
            subskill: "systems-linear-equations",
            difficulty: "easy",
            question: question,
            choices: choices.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`),
            answer: answer,
            explanation: `For infinitely many solutions, the second equation must be a multiple of the first. Dividing the first equation by ${multiplier}: ${a}x + ${b}y = ${k}. So k = ${k}.`
        };
    },

    // =========================================================
    // TEMPLATE 9: Find Single Variable from System
    // =========================================================

    findSingleVariable() {
        const x = [1, 2, 3, 4, 5][Math.floor(Math.random() * 5)];
        const y = [1, 2, 3, 4, 5][Math.floor(Math.random() * 5)];

        const eq1 = `x + y = ${x + y}`;
        const eq2 = `x = ${x}`;

        const askFor = Math.random() < 0.5 ? 'x' : 'y';
        const correctVal = askFor === 'x' ? x : y;

        const question = `The solution to the given system of equations is (x, y). What is the value of ${askFor}?\n\n${eq1}\n${eq2}`;

        const correct = correctVal;
        const wrong1 = correctVal + 1;
        const wrong2 = correctVal - 1;
        const wrong3 = askFor === 'x' ? y : x;

        const choices = [correct, wrong1, wrong2, wrong3].sort((a, b) => a - b);
        const answer = String.fromCharCode(65 + choices.indexOf(correct));

        return {
            topic: "algebra",
            subskill: "systems-linear-equations",
            difficulty: "easy",
            question: question,
            choices: choices.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`),
            answer: answer,
            explanation: `Substitute x = ${x} into ${eq1}: ${x} + y = ${x + y}, so y = ${y}. Therefore ${askFor} = ${correctVal}.`
        };
    },

    // =========================================================
    // TEMPLATE 10: Solve with Negative Solution
    // =========================================================

    negativeSolution() {
        const x = [2, 3, 4][Math.floor(Math.random() * 3)];
        const y = -1 * [1, 2][Math.floor(Math.random() * 2)]; // Negative y

        const a1 = [2, 3][Math.floor(Math.random() * 2)];
        const b1 = [1, 2][Math.floor(Math.random() * 2)];
        const c1 = a1 * x + b1 * y;

        const a2 = 1;
        const b2 = 1;
        const c2 = a2 * x + b2 * y;

        const question = `What is the solution (x, y) to the given system of equations?\n\n${a1}x + ${b1}y = ${c1}\nx + y = ${c2}`;

        const correct = `(${x}, ${y})`;
        const wrong1 = `(${Math.abs(y)}, ${x})`;
        const wrong2 = `(${x}, ${Math.abs(y)})`;
        const wrong3 = `(${x + 1}, ${y})`;

        const choices = [correct, wrong1, wrong2, wrong3];
        const shuffled = choices.sort(() => Math.random() - 0.5);
        const answer = String.fromCharCode(65 + shuffled.indexOf(correct));

        return {
            topic: "algebra",
            subskill: "systems-linear-equations",
            difficulty: "easy",
            question: question,
            choices: shuffled.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`),
            answer: answer,
            explanation: `From the second equation, y = ${c2} - x. Substitute into the first: ${a1}x + ${b1}(${c2} - x) = ${c1}. Solving gives x = ${x}, so y = ${y}. Note: This includes a negative solution.`
        };
    },

    // =========================================================
    // TEMPLATE 11: Decimal Coefficients Word Problem
    // =========================================================

    decimalWordProblem() {
        const item1 = ["sandwich", "salad", "burger", "wrap"][Math.floor(Math.random() * 4)];
        const item2 = ["drink", "side", "dessert", "soup"][Math.floor(Math.random() * 4)];

        const price1 = [6.50, 7.25, 8.50, 9.75][Math.floor(Math.random() * 4)];
        const price2 = [2.50, 3.25, 3.75, 4.50][Math.floor(Math.random() * 4)];

        const total = [15, 20, 25, 30][Math.floor(Math.random() * 4)];
        const qty1 = Math.floor(total * 0.4) + 3;
        const qty2 = total - qty1;
        const revenue = (price1 * qty1 + price2 * qty2).toFixed(2);

        const question = `A café sells ${item1}s for $${price1.toFixed(2)} and ${item2}s for $${price2.toFixed(2)}. Today they sold ${total} items for $${revenue}. If s represents ${item1}s and d represents ${item2}s, which system represents this?`;

        const correct = `s + d = ${total}\n   ${price1.toFixed(2)}s + ${price2.toFixed(2)}d = ${revenue}`;
        const wrong1 = `s + d = ${revenue}\n   ${price1.toFixed(2)}s + ${price2.toFixed(2)}d = ${total}`;
        const wrong2 = `s + d = ${total}\n   ${price2.toFixed(2)}s + ${price1.toFixed(2)}d = ${revenue}`;
        const wrong3 = `${price1.toFixed(2)}s + ${price2.toFixed(2)}d = ${total}\n   s + d = ${revenue}`;

        const choices = [correct, wrong1, wrong2, wrong3];
        const shuffled = choices.sort(() => Math.random() - 0.5);
        const answer = String.fromCharCode(65 + shuffled.indexOf(correct));

        return {
            topic: "algebra",
            subskill: "systems-linear-equations",
            difficulty: "easy",
            question: question,
            choices: shuffled.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`),
            answer: answer,
            explanation: `Total items: s + d = ${total}. Total revenue with decimal prices: ${price1.toFixed(2)}s + ${price2.toFixed(2)}d = ${revenue}.`
        };
    },

    // =========================================================
    // TEMPLATE 12: Ratio/Times-as-Many Problem
    // =========================================================

    ratioTimesProblem() {
        const multiplier = [2, 3, 4][Math.floor(Math.random() * 3)];
        const total = [24, 30, 36, 42, 48][Math.floor(Math.random() * 5)];

        const names = [
            ["Alex", "Jordan"],
            ["Maria", "Carlos"],
            ["Sam", "Taylor"],
            ["Riley", "Casey"]
        ];

        const pair = names[Math.floor(Math.random() * names.length)];
        const item = ["dollar", "point", "coin"][Math.floor(Math.random() * 3)];

        const question = `${pair[0]} has x ${item}s and ${pair[1]} has y ${item}s. ${pair[0]} has ${multiplier} times as many ${item}s as ${pair[1]}, and together they have a total of ${total} ${item}s. Which system of equations represents this situation?`;

        const correct = `x = ${multiplier}y\n   x + y = ${total}`;
        const wrong1 = `y = ${multiplier}x\n   x + y = ${total}`;
        const wrong2 = `x = ${multiplier}y\n   x + y = ${total * multiplier}`;
        const wrong3 = `y = ${multiplier}x\n   x + y = ${total * multiplier}`;

        const choices = [correct, wrong1, wrong2, wrong3];
        const shuffled = choices.sort(() => Math.random() - 0.5);
        const answer = String.fromCharCode(65 + shuffled.indexOf(correct));

        return {
            topic: "algebra",
            subskill: "systems-linear-equations",
            difficulty: "easy",
            question: question,
            choices: shuffled.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`),
            answer: answer,
            explanation: `${pair[0]} has ${multiplier} times as many as ${pair[1]}: x = ${multiplier}y. Together they have ${total}: x + y = ${total}.`
        };
    }
};