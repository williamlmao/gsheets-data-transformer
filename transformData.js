const ss = SpreadsheetApp.getActiveSpreadsheet();
const ui = SpreadsheetApp.getUi();
const originalDataArray = ss.getSheetByName("Data").getDataRange().getValues();
// Bring headers from originalData into transformedData, because getJsonArrayFromData removes them
const originalDataHeaders = originalDataArray[0];

const operators = {
  equals: (a, b) => a === b,
  contains: (a, b) => a.toLowerCase().indexOf(b.toLowerCase()) > -1,
  startsWith: (a, b) => a.indexOf(b) === 0,
  endsWith: (a, b) => a.indexOf(b) === a.length - b.length,
  greaterThan: (a, b) => a > b,
  lessThan: (a, b) => a < b,
  greaterThanOrEqual: (a, b) => a >= b,
  lessThanOrEqual: (a, b) => a <= b,
  notEqual: (a, b) => a !== b,
  notContains: (a, b) => a.indexOf(b) === -1,
  notStartsWith: (a, b) => a.indexOf(b) !== 0,
  notEndsWith: (a, b) => a.indexOf(b) !== a.length - b.length,
  notGreaterThan: (a, b) => a <= b,
  notLessThan: (a, b) => a >= b,
  notGreaterThanOrEqual: (a, b) => a < b,
  //regex match
  regexMatch: (a, b) => {
    const regex = new RegExp(b);
    return regex.test(a);
  },
};

// Function that takes an array of rules and returns a function
const buildRule = (rule) => {
  const column1 = rule["Column 1"];
  const operator1 = rule["Operator 1"];
  const value1 = rule["Value 1"];
  const column2 = rule["Column 2\n(Optional)"];
  const operator2 = rule["Operator 2\n(Optional)"];
  const value2 = rule["Value 2\n(Optional)"];
  const andOr = rule["AND/OR"];
  const transformColumn1 = rule["Transform Column 1"];
  let transformValue1 = rule["New Value 1"];
  const transformColumn2 = rule["Transform Column 2\n(Optional)"];
  let transformValue2 = rule["New Value 2\n(Optional)"];

  const ruleFunction = (row) => {
    if (!operator1) {
      // ui alert if no operator is selected
      if (operator1 === "") {
        ui.alert(
          "You have a row with no operator selected. Please select an operator in column D"
        );
      } else {
        ui.alert(`${operator1} is not a valid operator`);
      }
    }

    const test = operators[operator1](row[column1], value1);
    if (operator2) {
      const test2 = operators[operator2](row[column2], value2);
      if (andOr === "AND") {
        return test && test2;
      } else {
        return test || test2;
      }
    } else {
      return test;
    }
  };

  // Transform the row if ruleFunction is true
  const transformTransaction = (row) => {
    if (ruleFunction(row)) {
      if (transformColumn1) {
        row[transformColumn1] = transformValue1;
      }
      if (transformColumn2) {
        row[transformColumn2] = transformValue2;
      }
    }
    return row;
  };
  return transformTransaction;
};

// Create a function that takes an array of rules and returns a function that takes a row and returns true or false
const buildRuleApplicationAlgo = (rules) => {
  const ruleFunctions = rules.map(buildRule);
  const transformingAlgorithm = (row) => {
    let result = true;
    ruleFunctions.forEach((ruleFunction) => {
      result = result && ruleFunction(row);
    });
    return result;
  };
  return transformingAlgorithm;
};

/**
 *
 * @returns An new version of transactions object with the rules applied
 */
const applyRulesToData = (rulesData, originalData) => {
  const ruleApplicationAlgorithm = buildRuleApplicationAlgo(rulesData);
  const ruledData = (originalData) => {
    return originalData.map(ruleApplicationAlgorithm);
  };
  return ruledData(originalData);
};

const transformData = () => {
  const originalData = getJsonArrayFromData(originalDataArray);
  const rulesData = getJsonArrayFromData(
    ss.getSheetByName("Rules").getDataRange().getValues()
  );

  const ruledData = applyRulesToData(rulesData, originalData);

  const transformedData = ruledData.map((row) =>
    Object.keys(row).map((key) => row[key])
  );

  transformedData.unshift(originalDataHeaders);

  writeDataToBottomOfTab("Transformed Data", transformedData, true);
};
