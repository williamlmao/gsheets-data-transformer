const onOpen = () => {
  ui.createMenu("Data Transformer")
    .addItem("Transform Data", "transformData")
    .addItem("Set up", "setUp")
    .addToUi();
};

/**
 *
 * @param {string} tabName
 * @param {Array} data
 * @param {boolean} clearTab
 * Writes data to the bottom of a specified tab
 */
const writeDataToBottomOfTab = (tabName, data, clearTab) => {
  if (data.length === 0) {
    console.log("No data to write");
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.setActiveSheet(ss.getSheetByName(tabName));

  if (clearTab) {
    sheet.clear();
  }
  const lastRow = sheet.getLastRow() + 1;
  const lastColumn = sheet.getLastColumn() + 1;
  const rows = data.length;
  const cols = data[1].length;
  const writeResult = sheet.getRange(lastRow, 1, rows, cols).setValues(data);
  SpreadsheetApp.flush();
  return writeResult;
};

const getJsonArrayFromData = (data) => {
  var obj = {};
  var result = [];
  var headers = data[0];
  var cols = headers.length;
  var row = [];

  for (var i = 1, l = data.length; i < l; i++) {
    // get a row to fill the object
    row = data[i];
    // clear object
    obj = {};
    for (var col = 0; col < cols; col++) {
      // fill object with new values
      obj[headers[col]] = row[col];
    }
    // add object in a final result
    result.push(obj);
  }

  return result;
};

/**
 * Adds all necessary sheets with the correct sheet names and data.
 */
const setUp = () => {
  let rulesHeaders = [
    [
      "Column 1",
      "Operator 1",
      "Value 1",
      "Column 2\n(Optional)",
      "Operator 2\n(Optional)",
      "Value 2\n(Optional)",
      "Column 3\n(Optional)",
      "Operator 3\n(Optional)",
      "Value 3\n(Optional)",
      "AND/OR",
      "Transform Column 1",
      "New Value 1",
      "Transform Column 2\n(Optional)",
      "New Value 2\n(Optional)",
      "Transform Column 3\n(Optional)",
      "New Value 3\n(Optional)",
    ],
  ];

  if (!ss.getSheetByName("Data")) {
    ss.insertSheet("Data");
    ss.getSheetByName("Data")
      .getRange("A1")
      .setValue(
        "Paste any data you'd like here. Just make sure it contains a header row (which should be in row 1), because that's what the data validations in the rules sheet use. You should delete this note before pasting your data in."
      );
  }

  if (!ss.getSheetByName("Transformed Data")) {
    ss.insertSheet("Transformed Data");
  }

  if (!ss.getSheetByName("Rules")) {
    ss.insertSheet("Rules");
    // Write the headers to the rules sheet
    ss.getSheetByName("Rules")
      .getRange(1, 1, 1, rulesHeaders[0].length)
      .setValues(rulesHeaders);

    // Set data validations for columns who reference data headers
    const dataSheet = ss.getSheetByName("Data");
    const destinationRanges = ["A2:A", "D2:D", "G2:G", "K2:K", "M2:M", "O2:O"];
    let range = dataSheet.getRange("1:1");
    let headerRule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(range)
      .setAllowInvalid(false)
      .build();
    destinationRanges.forEach((range) => {
      let destinationRange = SpreadsheetApp.getActive().getRange(range);
      destinationRange.setDataValidation(headerRule);
    });

    // Set data validations for operators
    const operatorRanges = ["B2:B", "E2:E", "H2:H"];
    const operatorsList = [
      "equals",
      "contains",
      "startsWith",
      "endsWith",
      "greaterThan",
      "lessThan",
      "greaterThanOrEqual",
      "lessThanOrEqual",
      "notEqual",
      "notContains",
      "notStartsWith",
      "notEndsWith",
      "notGreaterThan",
      "notLessThan",
      "notGreaterThanOrEqual",
      "regexMatch",
    ];
    operatorRanges.forEach((range) => {
      let destinationRange = SpreadsheetApp.getActive().getRange(range);
      let operatorRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(operatorsList)
        .setAllowInvalid(false)
        .build();
      destinationRange.setDataValidation(operatorRule);
    });
    let andOrRange = SpreadsheetApp.getActive().getRange("J2:J");
    let andOrRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["AND", "OR"])
      .setAllowInvalid(false)
      .build();
    andOrRange.setDataValidation(andOrRule);
  }
  formatRulesHeaders();
};

const formatRulesHeaders = () => {
  const rulesSheet = ss.getSheetByName("Rules");
  rulesSheet.getRange("A1:C1").activate();
  rulesSheet.getActiveRangeList().setBackground("#666666");
  rulesSheet.getRange("D1:F1").activate();
  rulesSheet.getActiveRangeList().setBackground("#999999");
  rulesSheet.getRange("G1:I1").activate();
  rulesSheet.getActiveRangeList().setBackground("#666666");
  rulesSheet.getRange("J1").activate();
  rulesSheet.getActiveRangeList().setBackground("#f1c232");
  rulesSheet.getRange("K1:L1").activate();
  rulesSheet.getActiveRangeList().setBackground("#3d85c6");
  rulesSheet.getRange("M1:N1").activate();
  rulesSheet.getActiveRangeList().setBackground("#6fa8dc");
  rulesSheet.getRange("O1:P1").activate();
  rulesSheet.getActiveRangeList().setBackground("#3d85c6");
  rulesSheet.getRange("P1").activate();
  var currentCell = rulesSheet.getCurrentCell();
  rulesSheet
    .getSelection()
    .getNextDataRange(SpreadsheetApp.Direction.PREVIOUS)
    .activate();
  currentCell.activateAsCurrentCell();
  rulesSheet
    .getActiveRangeList()
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setFontColor("BACKGROUND")
    .setVerticalAlignment("middle")
    .setBorder(
      null,
      null,
      true,
      null,
      null,
      null,
      "#000000",
      SpreadsheetApp.BorderStyle.SOLID
    );
};
