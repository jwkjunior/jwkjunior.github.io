/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * 
 * 
 */

var maximumMonthlyProductionRate =
    Number(localStorage.getItem("maximumMonthlyProductionRate").trim());
var firstDeliveryMonth = Number(localStorage.getItem("deliveryMonth").trim());
var firstDeliveryYear = Number(localStorage.getItem("deliveryYear").trim());
var deliveryMonthsTotal = Number(localStorage.getItem("totalMonths").trim());
var totalDeliveries = Number(localStorage.getItem("totalDeliveryQty").trim());
var profile = localStorage.getItem("profile");
var useAI = localStorage.getItem("useAI");

var deliveries = [];
var deliveriesToInteger = [];
var upOrDown;
var months = [" ", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct", "Nov", "Dec"];
var savetodb = document.getElementById("savetodb");

var headerArrayWOSpaces = [];
var columnIdsString;
var colTypeString;
var columnValidatorsString;

var data = [];
var contactsGrid;

var messagesToDisplayArray;
var messagesArray =
    [
        "Cells highlighted in red indicate a delivery quantity that has " +
        "not been entered as a positive integer (positive integers " +
        "cannot include commas, spaces or decimals). ",
        "Cells highlighted in yellow contain an entry that exceeds the " +
        "maximum monthly production rate which must be corrected " +
        "before the results can be saved to the database. ",
        "Field labeled 'Difference' must show zero before the results " +
        "can be saved to the database. ",
        "Your data has been saved to the database.",
        "There was an error saving the data - please try again."
    ];

var errorMessages;
var firstLoad;

console.log("Here is the firstDeliveryMonth " + firstDeliveryMonth);
console.log("Here is the firstDeliveryYear " + firstDeliveryYear);
console.log("Here is the deliveryMonthsTotal" + deliveryMonthsTotal);
console.log("Here is the totalDeliveries " + totalDeliveries);
console.log("Here is the profile " + profile);

dhtmlxEvent(window, "load", function () {

    var header = createColumnHeaders(firstDeliveryMonth, firstDeliveryYear);

    columnIdsString = createColumnIds(deliveryMonthsTotal);
    columnTypes = createColumnTypes(deliveryMonthsTotal);
    columnValidatorsString = createColumnValidators(deliveryMonthsTotal);

    if (useAI == 1) {
        //if (profile == "rampup") {  //THIS HAS BEEN ADDED FOR TESTING - IF RAMPUP IS SELECTED, THE PY SCRIPT IS INVOKED
        //IT SHOULD BE COMMENTED OUT AND REPLACED BY THE ONE ABOVE IT WHEN TESTING WITH AI IS READY

        let AI_Schedule = JSON.parse(localStorage.getItem('JSON_AI_Schedule'));

        console.log("Here is the raw AI_Schedule printed to console: " + AI_Schedule);

        for (let i = 0; i < AI_Schedule.length; i++) {

            console.log("Here is the raw element in AI_Schedule: " + AI_Schedule[i]);
            //deliveriesToInteger[i] = Math.floor(AI_Schedule[i]);
            deliveriesToInteger.push(Math.floor(AI_Schedule[i]));   //MAYBE CHANGE THIS TO "NUMBER(AI_Schedule[i])""
            console.log("Here is the raw element converted to an integer in deliveriesToInteger: " + deliveriesToInteger[i]);

        }

        //const data = JSON.parse(AI_Schedule);

        data = [deliveriesToInteger];           //WHY ENCASE AN ARRAY IN ANOTHER ARRAY? MAY BE ABLE TO CLEAN THIS UP
        //OTHER LINES NEED CLEANING FOR THIS TOO - SEARCH FOR "ENCASE AN ARRAY"

    } else {

        switch (profile) {

            case "flatline":
                data =
                    [flatLineDelivery(totalDeliveries,     //WHY ENCASE AN ARRAY IN ANOTHER ARRAY? MAY BE ABLE TO CLEAN THIS UP
                        deliveryMonthsTotal)];
                break;
            case "rampup":
                upOrDown = false;
                data =
                    [deliveryRampUpOrDown(totalDeliveries,   //WHY ENCASE AN ARRAY IN ANOTHER ARRAY? MAY BE ABLE TO CLEAN THIS UP
                        deliveryMonthsTotal, upOrDown)];

                break;
            case "rampdown":
                upOrDown = true;
                data =
                    [deliveryRampUpOrDown(totalDeliveries,  //WHY ENCASE AN ARRAY IN ANOTHER ARRAY? MAY BE ABLE TO CLEAN THIS UP
                        deliveryMonthsTotal, upOrDown)];

                break;
            case "bellcurve":
                data =
                    [deliveryNormalDistro(totalDeliveries,  //WHY ENCASE AN ARRAY IN ANOTHER ARRAY? MAY BE ABLE TO CLEAN THIS UP
                        deliveryMonthsTotal)];

                break;
        }
    }

    var layout = new dhtmlXLayoutObject(results, "1C");
    layout.setSkin("dhx_skyblue");
    layout.cells("a").setText("");
    layout.cells("a").setHeight(150);
    layout.cells("a").hideHeader(true);

    //Working version had one below commented out - if not commented out grid does not appear
    //contactsGrid.selection.setCell();
    //Working version had two below enabled
    layout.setOffsets({ left: 0, top: 0, right: 0, bottom: 0 });
    layout.setSizes();
    contactsGrid = layout.cells("a").attachGrid();

    contactsGrid.setHeader(header);   //sets the headers of columns

    contactsGrid.setStyle(
        "background-color:#87ceeb;color:black;font-weight:bold;",
        "background-color:white;color:black;font-weight:bold;", "vertical-align: top", ""
    );

    contactsGrid.init();

    contactsGrid.setColTypes(columnTypes);
    contactsGrid.setColValidators(columnValidatorsString);
    for (i = 0; i < deliveryMonthsTotal + 2; i++) {
        contactsGrid.setNumberFormat("0,000", i, "", ",");
        //working version had three below enabled but grid doesn't appear
        //with three below commented out, grid appears: Yay! (but data is slightly hidden)
        //contactsGrid.setColVAlign("top,top,top,top,top,top,top,top");
        //contactsGrid.setColAlign("top");
        //contactsGrid.cell(i).setHeight(150);
    }
    contactsGrid.setColumnIds(columnIdsString);
    //working version had three below enabled 
    //var row = contactsGrid.getRow(0);
    //var column = contactsGrid.getColumn("col0");
    //contactsGrid.selection.setCell(row, column);          
    contactsGrid.attachEvent("onValidationCorrect", function () {

        checkGrid();
        return false;
    });
    contactsGrid.attachEvent("onValidationError", function () {

        checkGrid();
        return false;
    });

    var myJSON = JSON.stringify(data);
    console.log("Here is JSONed array!!! " + myJSON);

    contactsGrid.parse(data, "jsarray");
    firstLoad = true;
    contactsGrid.setSizes();
    checkGrid();
});

function createColumnHeaders(month, year) {


    var headerArray = [];


    var arrayCounter = 0;
    for (i = 0; i < deliveryMonthsTotal; i++) {

        //If issues arise with output, check this against TestBedOutput
        //since that works fine (only current difference is that the
        //resulting array includes the qtys which are no longer needed).

        for (j = month; j < 13; j++) {

            //month = j;
            headerArray.push(months[j] + " " + year);
            headerArrayWOSpaces.push(months[j] + year);

            arrayCounter = arrayCounter + 1;
            if (arrayCounter == deliveryMonthsTotal) {
                j = 13;
                i = deliveryMonthsTotal;
            }
        }
        month = 1;
        year = year + 1;
    }
    headerArray.push("Total");
    headerArray.push("Difference");

    console.log("Here is the headerArray " + headerArray);
    console.log("Here is the headerArrayWOSpaces " + headerArrayWOSpaces);
    return headerArray;
}

function createColumnIds(period) {
    var idsIni = "";
    for (i = 0; i < period + 2; i++) {
        idsIni = idsIni + "col" + i + ",";
    }
    var ids = idsIni.substring(0, idsIni.length - 1);
    console.log("Here is the columnID string " + ids);
    return ids;
}

function createColumnTypes(period) {
    var typeIni = "";
    for (i = 0; i < period + 2; i++) {
        if (i >= period) {
            typeIni = typeIni + "ron" + ",";
        } else {
            typeIni = typeIni + "edn" + ",";
        }
    }
    var types = typeIni.substring(0, typeIni.length - 1);
    console.log("Here is the column types string " + types);
    return types;
}

function createColumnValidators(period) {
    var validIni = "";
    for (i = 0; i < period + 2; i++) {
        if (i >= period) {
            validIni = validIni + "null" + ",";
        } else {
            validIni = validIni + "ValidInteger" + ",";
        }
    }
    var validators = validIni.substring(0, validIni.length - 1);
    console.log("Here is the validation string " + validators);
    return validators;
}


function flatLineDelivery(qty, period) {

    var remainderMonthlyDeliveries = 0;
    var sum = 0;

    for (i = 0; i < period; i++) {

        deliveriesToInteger.push(Math.trunc((qty + remainderMonthlyDeliveries) /
            period));

        remainderMonthlyDeliveries = (qty + remainderMonthlyDeliveries) %
            period;
        sum = sum + deliveriesToInteger[i];
    }

    deliveriesToInteger[period] = sum;
    deliveriesToInteger[period + 1] = sum - totalDeliveries;
    console.log("Here is the deliveriesToInteger array " + deliveriesToInteger);

    deliveries = deliveriesToInteger;

    console.log("Here is the deliveries array " + deliveries);
    return deliveries;
}

function deliveryRampUpOrDown(qty, period, reverse) {

    perfectDeliveries = ((period + 1) * period) / 2;
    var remainderMonthlyDeliveries = 0;
    var sum = 0;

    for (i = 0; i < period; i++) {

        deliveriesToInteger.push(Math.trunc(((qty * (i + 1) +
            remainderMonthlyDeliveries)) / perfectDeliveries));
        remainderMonthlyDeliveries = ((qty * (i + 1) +
            remainderMonthlyDeliveries)) % perfectDeliveries;
        sum = sum + deliveriesToInteger[i];
    }

    if (reverse) {

        reverseDeliveries = [];

        for (k = period - 1; k >= 0; k--) {

            reverseDeliveries.push(deliveriesToInteger[k]);
        }

        deliveriesToInteger = reverseDeliveries;
    }

    deliveriesToInteger[period] = sum;
    deliveriesToInteger[period + 1] = sum - totalDeliveries;
    deliveries = deliveriesToInteger;

    return deliveries;
}



function deliveryNormalDistro(qty, period) {
    var deliveriesToDouble = [];
    var deliveriesToInteger = [];
    var increment = 6.0 / (period + 1);
    var xAxis = -3.0 + increment;
    var sum = 0.0;
    var finalSum = 0;
    var perfectDistroMultiplier;
    var remainder = 0;
    var arrayIndexCounter;
    // The curve can be easily flattened by passing in a variance greater
    //than 1: if 5 is used, the exponent would be multiplied by .1 instead of .5
    //and the expression Math.sqrt(2 * Math.PI) would become Math.sqrt(10 * Math.PI).
    //In addition the end points should be changed to 4.5 or 5 (i.e. the 
    //"double xAxis = -3;" becomes -4.5 or 5. Note that this could be handled by
    //creating variable for these changes and having users select them.
    if (period % 2 == 0) {
        arrayIndexCounter = period / 2;
    } else {
        arrayIndexCounter = (period / 2) + 1;
    }

    for (i = 0; i < arrayIndexCounter; i++) {

        var exponent = (.5 * xAxis * xAxis);
        deliveriesToDouble[i] =
            (1 / (Math.sqrt(2 * Math.PI))) * (Math.pow(Math.E, -1 *
                exponent));
        xAxis = xAxis + increment;
        deliveriesToDouble[(period - 1) - i] = deliveriesToDouble[i];

    }


    for (i = 0; i < period; i++) {
        sum = sum + deliveriesToDouble[i];
    }

    perfectDistroMultiplier = qty / sum;

    for (k = 0; k < period; k++) {
        deliveriesToDouble[k] = deliveriesToDouble[k] * perfectDistroMultiplier;
        deliveriesToInteger[k] = Math.trunc(deliveriesToDouble[k] + remainder);
        remainder = (deliveriesToDouble[k] + remainder) -
            Math.trunc(deliveriesToDouble[k] + remainder);
    }
    var arraySum = 0;
    for (l = 0; l < period; l++) {
        arraySum = arraySum + deliveriesToInteger[l];
    }
    if (arraySum !== qty) {
        deliveriesToInteger[(Math.trunc(period / 2))] =
            deliveriesToInteger[(Math.trunc(period / 2))] + 1;
    }
    for (m = 0; m < period; m++) {
        finalSum = finalSum + deliveriesToInteger[m];

    }
    deliveriesToInteger[period] = finalSum;
    deliveriesToInteger[period + 1] = finalSum - totalDeliveries;
    deliveries = deliveriesToInteger;

    return deliveries;
}


function saveToDB() {

    var data1 = data[0];
    var data2 = [];
    for (m = 0; m < deliveryMonthsTotal; m++) {

        data2.push(data1[m]);

    }

    var deliveriesToDB = data2[0];

    for (k = 1; k < deliveryMonthsTotal; k++) {

        deliveriesToDB = deliveriesToDB + "z" + data2[k];

    }

    for (k = 0; k < deliveryMonthsTotal; k++) {

        deliveriesToDB = deliveriesToDB + "z" + headerArrayWOSpaces[k];

    }

    console.log("Here is the deliveries String!!!!: " + deliveriesToDB);

    axios.post('http://192.168.12.221:3000/save_to_DB', { content: deliveriesToDB })    //DEN T-MOBILE
        //axios.post('http://192.168.0.6:3000/save_to_DB', { content: deliveriesToDB })    //DEN CENTURYFINK
        //axios.post('http://192.168.1.166:3000/save_to_DB', { content: deliveriesToDB })    //DC 
        //axios.post('http://localhost:3000/save_to_DB', { content: deliveriesToDB })      //Offline


        .then(response => {
            //alert('File saved successfully!');
            console.log("Schedule saved to database successfully - but why doesn't the message display?");
            messagesToDisplayArray.fill("");
            if (response.status == 200) {
                messagesToDisplayArray[3] = 3;
                disableSaveFlag2 = true;
                displayErrorMessages(messagesToDisplayArray, disableSaveFlag2);
                console.log("Here is the readystate 4 flag" + disableSaveFlag2);
            }

        })
        .catch(error => {
            console.error('There was an error saving the schedule to the database.', error);
            messagesToDisplayArray[4] = 4;
            disableSaveFlag2 = false;
            displayErrorMessages(messagesToDisplayArray, disableSaveFlag2);
            console.log("Here is the readystate 2 flag" + disableSaveFlag2);

        });
}

function checkGrid() {
    messagesToDisplayArray = [];
    for (k = 0; k < messagesArray.length; k++) {

        messagesToDisplayArray.push("");

    }
    clearGridBackgroundColor();
    var quantity;
    var rowID = contactsGrid.getRowId(0);
    var recalcSumAndDiffFlag = true;
    var newSum = 0;
    var disableSaveFlag1 = false;

    for (k = 0; k < deliveryMonthsTotal; k++) {


        console.log("Here's the rowID! " + rowID);

        quantity = Number(contactsGrid.cells(rowID, k).getValue());

        if (Number.isInteger(quantity)) {

            if (quantity < 0) {

                contactsGrid.cells(rowID, k).setBgColor('red');
                messagesToDisplayArray[0] = 0;
                recalcSumAndDiffFlag = false;
                disableSaveFlag1 = true;

            } else if (quantity > maximumMonthlyProductionRate) {

                contactsGrid.cells(rowID, k).setBgColor('yellow');
                messagesToDisplayArray[1] = 1;
                disableSaveFlag1 = true;
            }

        } else {

            contactsGrid.cells(rowID, k).setBgColor('red');
            messagesToDisplayArray[0] = 1;
            console.log("Here is message 0 array value " + messagesToDisplayArray[0] +
                " and here is message 0 " + messagesArray[0]);
            recalcSumAndDiffFlag = false;
            disableSaveFlag1 = true;
        }
    }

    if (firstLoad == false && recalcSumAndDiffFlag == true) {
        var newSumArray = [];
        for (k = 0; k < deliveryMonthsTotal; k++) {

            newSum = newSum + Number(contactsGrid.cells(rowID, k).getValue());
        }

        contactsGrid.cells(rowID, deliveryMonthsTotal).setValue(newSum);
        difference = newSum - totalDeliveries;
        contactsGrid.cells(rowID, deliveryMonthsTotal + 1).setValue(difference);

    }
    difference = contactsGrid.cells(rowID, deliveryMonthsTotal + 1)
        .getValue();

    if (difference != 0) {

        contactsGrid.cells(rowID, deliveryMonthsTotal + 1)
            .setBgColor('yellow');
        messagesToDisplayArray[2] = 2;
        disableSaveFlag1 = true;
    }

    displayErrorMessages(messagesToDisplayArray, disableSaveFlag1);
    firstLoad = false;

}

function displayErrorMessages(messagesIn, disableSaveFlagIn) {

    var message = "";
    document.getElementById("message").innerHTML = message;

    for (k = 0; k < messagesArray.length; k++) {

        if (messagesIn[k] !== "") {
            message = message + messagesArray[k];
        }
    }
    if (message !== "") {

        document.getElementById("message").innerHTML = message;
        document.getElementById("message").style.background = "violet";
        document.getElementById("savetodb").disabled = true;

    }
    if (message !== "" && disableSaveFlagIn == false) {

        document.getElementById("message").innerHTML = message;
        document.getElementById("message").style.background = "violet";
        document.getElementById("savetodb").disabled = false;

    }
    if (message == "") {

        document.getElementById("savetodb").disabled = false;
        updateDeliveriesWithUserEntries();

    }

}

function clearGridBackgroundColor() {
    for (k = 0; k < deliveryMonthsTotal + 2; k++) {

        var rowID = contactsGrid.getRowId(0);
        contactsGrid.cells(rowID, k).setBgColor('');

    }
}

function updateDeliveriesWithUserEntries() {
    var updatedDeliveries = [];
    for (k = 0; k < deliveryMonthsTotal + 2; k++) {

        var rowID = contactsGrid.getRowId(0);
        contactsGrid.cells(rowID, k).getValue()
        updatedDeliveries.push(contactsGrid.cells(rowID, k).getValue());

    }
    data[0] = updatedDeliveries;

}

function reopenPageOne2() {

    window.close();

}


