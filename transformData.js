const ss = SpreadsheetApp.getActiveSpreadsheet();
const ui = SpreadsheetApp.getUi();
const originalDataArray = ss.getSheetByName("Data").getDataRange().getValues();
// Bring headers from originalData into transformedData, because getJsonArrayFromData removes them
const originalDataHeaders = originalDataArray[0];

const operators = {
  equals: (a, b) => a === b,
  contains: (a, b) => a.indexOf(b) > -1,
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
  const elseTransformColumn1 = rule["Else\nTransform Column 1\n(Optional)"];
  let elseTransformValue1 = rule["Else\nNew Value 1\n(Optional)"];
  const elseTransformColumn2 = rule["Else\nTransform Column 2\n(Optional)"];
  let elseTransformValue2 = rule["Else\nNew Value 2\n(Optional)"];

  const ruleFunction = (row) => {
    if (!operator1) {
      // ui alert if no operator is selected
      if (operator1 === "") {
        ui.alert("Please select an operator for column 1");
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

  /**
   * Users may want to pull in the value from another column in the original data. They can indicate a column reference with this syntax: #Column Name#
   * @param {*} string
   * @returns
   */
  const checkColumnReference = (string) => {
    const regex = new RegExp("#(.*?)#");
    console.log(string, regex.test(string));
    return regex.test(string);
  };

  /**
   * Gets the column from the column reference, and then returns the corresponding value from the original data
   * @param {string} string
   * @param {Array} row
   * @returns
   */
  const getColumnReferenceValue = (string, row) => {
    const column = string.slice(1, -1);
    return row[column];
  };

  const updateTransformValues = (row) => {
    if (transformValue1) {
      if (checkColumnReference(transformValue1)) {
        console.log("row", row);
        console.log(getColumnReferenceValue(transformValue1, row));
        console.log("it;s a column reference");
        transformValue1 = getColumnReferenceValue(transformValue1, row);
        console.log("new transform value", transformValue1);
      }
    }

    if (transformValue2) {
      if (checkColumnReference(transformValue2)) {
        transformValue2 = getColumnReferenceValue(transformValue2, row);
      }
    }

    if (elseTransformValue1) {
      if (checkColumnReference(elseTransformValue1)) {
        elseTransformValue1 = getColumnReferenceValue(elseTransformValue1, row);
        console.log("elseTransformValue1", elseTransformValue1);
      }
    }
    if (elseTransformValue2) {
      if (checkColumnReference(elseTransformValue2)) {
        elseTransformValue2 = getColumnReferenceValue(elseTransformValue2, row);
      }
    }
  };

  // Transform the row if ruleFunction is true
  const transformTransaction = (row) => {
    updateTransformValues(row);
    if (ruleFunction(row)) {
      if (transformColumn1) {
        row[transformColumn1] = transformValue1;
      }
      if (transformColumn2) {
        row[transformColumn2] = transformValue2;
      }
    } else {
      if (elseTransformColumn1) {
        console.log("elseTransformColumn1", elseTransformColumn1);
        console.log("elseTransformValue1", elseTransformValue1);
        row[elseTransformColumn1] = elseTransformValue1;
        console.log("elseTransformValue1", elseTransformValue1);
      }
      if (elseTransformColumn2) {
        row[elseTransformColumn2] = elseTransformValue2;
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
