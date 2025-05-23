var currentFY, contractFY, maximumMonthlyProdRate, firstDeliveryDate, deliveryMonth,
    deliveryYear, totalMonths, totalDeliveryQty, profile, useAI;
var contractFYField, maximumMonthlyProductionRateField, firstDeliveryDateField,
    deliveryMonthsTotalField, totalDeliveriesField, profileField, useAIField;  //USE_AI ADDITION

var arrayOfEntryFields = [];
var arrayOfEntryFieldNames = [
    "contractFY", "maximumMonthlyProductionRate", "firstDeliveryDate",
    "deliveryMonthsTotal", "totalDeliveries", "profile", "use_AI"                //USE_AI ADDITION
];
var arrayOfMessageHeaders = ["Contract FY:", "Max Monthly Prod Rate:",
    "First Item Delivery:", "Delivery Period:", "Total Deliveries:",
    "Distribution Profile:", "Use AI: "];                                       //USE_AI ADDITION

var errorMessage;
var errorPresent = false;

const numberOfEntryFieldsToValidate = 7;

const totalNumberOfMessages = 16;              //This is the total number of messages
const numberOfExternalMessagesToDisplay = 4;   //This number represents the number of external validations

//This calculated number is the number of local validations 
//(total messages - # of external msgs  = # of local msgs)
const numberOfLocalMessagesToDisplay = totalNumberOfMessages - numberOfExternalMessagesToDisplay;

//Below is an array of arrays with boolean values (stored as 0 and 1's instead of 'true'/'false') that
//indicate which local/fault intolerant validations apply to each field.
//One array (or row) is loaded for each local validation message, with 11 local meesages there are 11 arrays.
//Each array has a position (or column) for each entry field that requires validating  - there are 6 entry 
//fields, so there are 6 columns.  When this array is properly filled out, there should only one "1" in each 
//row as a message applies exclusively to one field , however every column can have more then one "1" since a
//field can have more than one validation. When a change is registered in a particular field (in this case, 
//when a user enters a new character in that field) the code uses this array to find whcih validations 
//need to be run on the new entry. First, the affected field is located in the array - this is represented 
//by a column, i.e. the second of the six fields would be column [1]. The code then checks each row at 
//position [row num][1] to see if the validation which generates that message needs to be run. A "1" means
//that validation needs to be run, a "0" means that validation doesn't apply to that field. 
//The validation code is run by accessing a reference to that function in another array at
//the same row index as the value "1" (e.g. a "1" at position [4][1] of the array tells the code to run the
//function at index 4 of the array storing the references to these functions). 

const localValidationMsgXwalk = [

    [1, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1]
];

//Below is the equivalent array for external/fault tolerant validations as that described above for 
//local/fault intolerant arrays. In this case there are 4 external validations so there are four rows,
//one for each external validation, plus the local validation flags (which is stored in row 0) for a
//total of 5 rows. 
//IMPORTANT NOTE: When initializing this array, set the first row (i.e. position[0][0...n]) to 

const externalValidationMsgXwalk = [

    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 0],
    [1, 0, 1, 0, 0, 0, 0],
    [0, 1, 0, 1, 1, 0, 0]

];

console.log("Here is the boolean value of cell [2][1]!");
if (localValidationMsgXwalk[1][1]) console.log(localValidationMsgXwalk[2][1]);
console.log("And oh yeah, this is the latest version as of 20 May 2024, 12:42 PM");
var dt = new Date();
var currentYear = dt.getFullYear();
var currentMonth = dt.getMonth() + 1;
if (currentMonth > 9) {
    currentFY = currentYear + 1;
} else {
    currentFY = currentYear;
}
//var input = 0;

const messages = [                             //Array storing all validation messages
    //Local validations grouped by order of fields on entry screen
    "Contract Fiscal Year(FY) must be entered in the YYYY format.  ",    //Contract FY
    "Fiscal years cannot be more than 10 years earlier or 50 years later than the current fiscal year. ", //Contract FY
    "Maximum Monthly Production quantity must be a positive integer. ", //Max Monthly Prod Rate
    "Delivery date must be entered in the MM / YYYY format.  ",          //First Item Delivery Date
    "Valid months are 01 - 12. ",                                       //First Item Delivery Date
    "Delivery year must be entered in the YYYY format. ",               //First Item Delivery Date
    "Delivery year cannot be more than 50 years from now.  ",            //First Item Delivery Date
    "Delivery cannot be earlier than the current prior fiscal year.  ",  //First Item Delivery Date
    "Delivery period must be a positive integer. ",                     //Delivery Period
    "Delivery quantity must be a positive integer. ",                   //Delivery Qty
    "Select a delivery distribution profile. ",                         //Distribution Profile
    "This option is currently not available. Uncheck this to proceed.", //USE_AI checkbox
    //External validations ordered by first affected field on entry screen - local validations need to be listed first
    //and cannot be intermixed with external validations
    "Delivery period cannot be greater than 12 months for fiscal years later than the current one. ",   //Contract FY, Delivery Period
    "Delivery period cannot be greater than 120 months for fiscal years equal to or earlier than the current one.  ", //Contract FY, Delivery Period
    "Delivery year cannot be earlier than the contract fiscal year.  ",  //Contract FY, First Item Delivery Date
    "Delivery quantity cannot exceed the Maximum Monthly Production quantity multiplied by the number of months in the delivery period.  " //Max Monthly Prod Rate, Delivery Period, Delivery Qty 
    //If a message is added or deleted, update the numberOfMessages variable declared above and add or delete
];  //entries in the array of functions accordingly so that the indexes remain in synch


var messagesToDisplay =

    [[0, 0, 0, 0, 0, 0, 0],   //This array contains an array (the rows) for each message
    [0, 0, 0, 0, 0, 0, 0],   //Each message array contains an entry (the columns) for each field
    [0, 0, 0, 0, 0, 0, 0],   //A "1" in position [4][3] indicates that message [4]
    [0, 0, 0, 0, 0, 0, 0],   //should be displayed on field [3]
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],   //IMPORTANT NOTE: the order in which the entry fields
    [0, 0, 0, 0, 0, 0, 0],   //are entered in this array must match the order in the
    [0, 0, 0, 0, 0, 0, 0],   //fieldNames array above. Any array that has size parameter
    [0, 0, 0, 0, 0, 0, 0],   //using the variable "numberOfEntryFieldsToValidate" when
    [0, 0, 0, 0, 0, 0, 0],   //declared must preserve this order, in other words,
    [0, 0, 0, 0, 0, 0, 0],   //this order must be preserved across all arrays that
    [0, 0, 0, 0, 0, 0, 0],   //reference an entry field!
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
    ];


const toolTipMessages = [];


const minCharEntered = [0, 0, 0, 0, 0, 0, 1];    // This array is used to track if the minimum number of characters
                                                 // have been entered for each field. Set any field with no miminium
                                                 // character requirement to 1 (e.g. an optional entry field).


const trimmedEntryFields = [];


const localArrayOfValidations = [

    localContractFY_One,
    localContractFY_Two,
    localMaxMonthlyProdRate_One,
    localFirstItemDeliveryDate_One,
    localFirstItemDeliveryDate_Two,
    localFirstItemDeliveryDate_Three,
    localFirstItemDeliveryDate_Four,
    localFirstItemDeliveryDate_Five,
    localDeliveryPeriod_One,
    localDeliveryQty_One,
    localDistributionProfile_One,
    localUseAI_One

];

const externalArrayOfValidations = [

    externalContractFYPlus_One,
    externalContractFYPlus_Two,
    externalContractFYPlus_Three,
    externalMaxMonthlyProdRatePlus_One

];


window.onload = function () {

    errorMessage = document.getElementById("errorMessage");

    contractFYField = document.getElementById("contractFY");
    maximumMonthlyProductionRateField =
        document.getElementById("maximumMonthlyProductionRate");
    firstDeliveryDateField = document.getElementById("firstDeliveryDate");
    deliveryMonthsTotalField =
        document.getElementById("deliveryMonthsTotal");
    totalDeliveriesField = document.getElementById("totalDeliveries");
    profileField = document.getElementById("profile");
    submit = document.getElementById("submit");
    useAIField = document.getElementById('use_AI');              //USE_AI ADDITION, COMMENTED OUT FOR NOW
    submit.disabled = true;

    arrayOfEntryFields = [contractFYField, maximumMonthlyProductionRateField,
        firstDeliveryDateField, deliveryMonthsTotalField,
        totalDeliveriesField, profileField];

    contractFYField.addEventListener("input", event => {          //REPLACED BY PROPOSED SHOWN ABOVE
        getFieldValue(0);
    });
    contractFYField.addEventListener("click", event => {          //REPLACED BY PROPOSED SHOWN ABOVE
        getFieldValue(0);
    }); 


    maximumMonthlyProductionRateField.addEventListener("input", event => {          //REPLACED BY PROPOSED SHOWN ABOVE
        getFieldValue(1);
    });
    maximumMonthlyProductionRateField.addEventListener("click", event => {          //REPLACED BY PROPOSED SHOWN ABOVE
        getFieldValue(1);
    }); 


    firstDeliveryDateField.addEventListener("input", event => {          //REPLACED BY PROPOSED SHOWN ABOVE
        getFieldValue(2);
    });
    firstDeliveryDateField.addEventListener("click", event => {          //REPLACED BY PROPOSED SHOWN ABOVE
        getFieldValue(2);
    }); 


    deliveryMonthsTotalField.addEventListener("input", event => {          //REPLACED BY PROPOSED SHOWN ABOVE
        getFieldValue(3);
    });
    deliveryMonthsTotalField.addEventListener("click", event => {          //REPLACED BY PROPOSED SHOWN ABOVE
        getFieldValue(3);
    }); 


    totalDeliveriesField.addEventListener("input", event => {          //REPLACED BY PROPOSED SHOWN ABOVE
        getFieldValue(4);
    });
    totalDeliveriesField.addEventListener("click", event => {          //REPLACED BY PROPOSED SHOWN ABOVE
        getFieldValue(4);
    }); 


    profileField.onchange = function () {

        preProcessEntry(5);
   
    };

    useAIField.addEventListener("click", event => {          //REPLACED BY PROPOSED SHOWN ABOVE
        preProcessEntry(6);
    });
};

document.getElementById('submit').addEventListener('click', function () {
    
    useAI = 0; 

    if (!document.getElementById('use_AI').checked) {
        localStorage.setItem('useAI', useAI);
    } else {

        useAI = 1;


        event.preventDefault(); // Prevent the default form submission behavior  //May not need - test later, but not important
        // Get the form element
        //var form = document.getElementById('TestHTML_JS');  //Optional: use this to get elements of form, but need to
        // Create an array to store the form values           //add id to form declaration at top of this page (currently
                                                              //using document.getElementByID). See line not far below
                                                              //marked by "**************"
        var formValues = [];
        var schedule = [];
        //useAI = 0;

        // Get the values from the input fields and push them into the array
        var numberOfMonths = document.getElementById("deliveryMonthsTotal").value;
        var totalDeliverables = document.getElementById("totalDeliveries").value;
        //var totalDeliverables = form.elements['totalDeliveries'].value;     //EXAMPLE OF USING FORM ELEMENT ***********************
        var profileNumber;
        var profile = document.getElementById("profile").value;           //OLD WORKING LINE REPLACED BY ABOVE

        switch (profile) {

            case "flatline":
                profileNumber = '1';
                break;

            case "rampup":
                profileNumber = '2';
                break;

            case "rampdown":
                profileNumber = '3';
                break;

            case "bellcurve":
                profileNumber = '4';
                break;

        }

        formValues.push(numberOfMonths, totalDeliverables, profileNumber);
        // Log the array to the console
       
        formValuesJSON = JSON.stringify(formValues);
        console.log('Form Values as a JSON:', formValuesJSON);

        axios.post('http://192.168.12.221:3000/use_ai', { content: formValuesJSON })    //DEN T-MOBILE
        //axios.post('http://192.168.0.6:3000/use_ai', { content: formValuesJSON })    //DEN CENTURYFINK
        //axios.post('http://192.168.1.166:3000/use_ai', { content: formValuesJSON })  //DC OLD, WORKING LINE THAT BUILDS A STRING
        //axios.post('http://192.168.1.166:3000/use_ai', { content: formValuesJSON })                              //DC NEW LINE THAT BUILDS AN ARRAY OF NUMBERS
                                                                                          //NOTE THAT ALL LINES SHOULD MOST LIKELY INCORPORATE THE ARRAY
                                                                                          //BUT THIS HAS NOT BEEN TESTED, SO TEST IN EACH LOCATION
        //axios.post('http://localhost:3000/use_ai', { content: formValues[0] + ' ' + formValues[1] })      //Offline


            .then(response => {
                //alert('File saved successfully!');
                console.log('Here is what is returned from the Python script! ' + response.data);
                console.log('And here is the sum of the first two return values! ' + (Number(response.data[0]) + Number(response.data[1])));

                var iniSchedule = [];
                var AI_Schedule = [];
                var sum = 0;
                const iteratorNumber = Number(numberOfMonths) + 3;
                for (let i = 0; i < iteratorNumber; i++) {

                    iniSchedule.push(Number(response.data[i]));
                    if (i > 2) sum = sum + iniSchedule[i];
                }

                console.log("Here is the number of months: " + numberOfMonths);
                console.log("Here is the initial schedule converted to numbers: " + iniSchedule);


                AI_Schedule = iniSchedule.slice(3);
                difference = sum - Number(totalDeliverables);
                AI_Schedule.push(sum, difference);


                //console.log("Here is the AI_Schedule from page 1 html script: " + AI_Schedule);

                localStorage.setItem('JSON_AI_Schedule', JSON.stringify(AI_Schedule));
                localStorage.setItem('useAI', useAI);

                //window.location.href = "DQD_HTML5_JS_CSS_Node_Page2.html";     //Open page 2 in same tab
                window.open('DQD_HTML5_JS_CSS_Node_Page2.html', '_blank');     //Open page 2 in new tab

            })
            .catch(error => {
                console.error('There was an error saving the file!', error);
            });
    }

});

function getFieldValue(fieldNum) {

    var iniValue = arrayOfEntryFields[fieldNum].value;
    //var iniValue = arrayOfEntryFields[0].value; 
    //var iniContractFY = contractFYField.value; 
    //console.log("Here's the raw value of iniContractFY: " + iniValue);
    trimmedEntryFields[fieldNum] = iniValue.trim();
    console.log("Here's the trimmed value: " + trimmedEntryFields[fieldNum]);
    console.log("Here's the ID of the field: " + fieldNum);
    preProcessEntry(fieldNum);

}


function preProcessEntry(fieldIn) {   //This is used to check if minimum number of characters have been entered before
                                      //validation begins for certain fields (e.g. Fiscal Year does not get validated until
    switch (fieldIn) {                //at least four characters are entered to avoid generating unecessary error messages)
        case 0: {                         //It also sets the flag for each field to indicate the minimum number of characters 
                                          //have been entered (must be at least one): this allows the system
            if (trimmedEntryFields[fieldIn].length >= 4) minCharEntered[fieldIn] = 1; //to determine the state of all entries: if all 
            if (minCharEntered[fieldIn]) {                                       //have the minimum number of characters entered
                                                                               //and there are no errors (true if no message flags
                runLocalValidations(fieldIn);                             //are set) then the application state can advance                
                runExternalValidations(fieldIn);                        //(for example a "Submit" button can now be enabled). 
                createToolTipMessages();
            }

            break;
        }
        case 2: {

            if (trimmedEntryFields[fieldIn].length >= 7) minCharEntered[fieldIn] = 1;
            if (minCharEntered[fieldIn]) {

                runLocalValidations(fieldIn);
                runExternalValidations(fieldIn);
                createToolTipMessages();
            }

            break;
        }
        case 5: {

            minCharEntered[fieldIn] = 1;
            runLocalValidations(fieldIn);
            runExternalValidations(fieldIn);
            createToolTipMessages();
            break;

        }

        case 6: {

            minCharEntered[fieldIn] = 1;
            runLocalValidations(fieldIn);
            runExternalValidations(fieldIn);
            createToolTipMessages();
            break;


        }
        default:

            if (trimmedEntryFields[fieldIn].length >= 1) minCharEntered[fieldIn] = 1; //Test for minimum characters entered
            if (minCharEntered[fieldIn]) {

                runLocalValidations(fieldIn);
                runExternalValidations(fieldIn);
                createToolTipMessages();
            }
            break;
    }
}

function resetDisplayMessageFlagLocal(msgIndex, fieldIndex) {  //This resets all relevant local validation message display flags

    for (i = msgIndex; i < numberOfLocalMessagesToDisplay; i++) {
        if (localValidationMsgXwalk[i][fieldIndex]) messagesToDisplay[i][fieldIndex] = false;
    }

}


function resetDisplayMessageFlagExternal(fieldIndex) {             //This resets all relevant external validation message display flags

    for (i = 1; i <= numberOfExternalMessagesToDisplay; i++) {

        if (externalValidationMsgXwalk[i][fieldIndex]) {               //Test to see if the message applies to this field
            //using the Xwalk
            for (j = 0; j < numberOfEntryFieldsToValidate; j++) {  //If test is true, reset message display flags on all 
                //fields that might display this message
                messagesToDisplay[numberOfLocalMessagesToDisplay + i - 1][j] = false;
            }
        }
    }
}



function runLocalValidations(fieldIndex) {                         //Run all required validations for this field

    externalValidationMsgXwalk[0][fieldIndex] = false;

    for (i = 0; i < numberOfLocalMessagesToDisplay; i++) {  //Check all validations for those that apply to this field

        if (localValidationMsgXwalk[i][fieldIndex]) {              //If true, this validation applies to this field

            messagesToDisplay[i][fieldIndex] = localArrayOfValidations[i]();  //Run validation and set messagesToDisplay flag
            if (messagesToDisplay[i][fieldIndex]) {                           //If true, reset all higher-order messagesToDisplay 
                                                                               //flags in the validation chain. See note below

                resetDisplayMessageFlagLocal(i + 1, fieldIndex); //This ensures that if latest user entry breaks the first                 
                                                         //validation in the chain, any messages for validations occuring later                    
                                                         //in the validation chain that have been displayed earlier are                                                     
                                                         //now reset because the earlier result no longer applies

                externalValidationMsgXwalk[0][fieldIndex] = true; //Set the externalValidationXwalk to true for this field
                //which means that no external validations involving this field can be run

                break;                                 //Break out of loop
            }
        }
    }
}

//This works for any language allowing functions or pointers-to-functions to be stored in an array
function runExternalValidations(fieldIndex) {                            //Run all external validations that use this field

    resetDisplayMessageFlagExternal(fieldIndex);    //Reset all external message flags for validations using this field 

    if (!externalValidationMsgXwalk[0][fieldIndex]) {                    //Check if all local validations passed for this field. 

        for (i = 1; i <= numberOfExternalMessagesToDisplay; i++) { //Loop through all external validations to see which apply

            if (externalValidationMsgXwalk[i][fieldIndex]) {          //If this validation applies, check that all other fields
                var canRunValidation = true;                      //used for this validation have passed their local validations
                for (j = 0; j < numberOfEntryFieldsToValidate; j++) {
                    if (externalValidationMsgXwalk[i][j] && externalValidationMsgXwalk[0][j]) { //This stops at the first field  
                        canRunValidation = false;                 //(if any) used by this validation that has failed its local 
                                                                  //validation so that the external validation can't be run 

                        break;                                    //If only one field in a validation using several fields
                    }                                             //has failed, the loop can stop
                }
                if (canRunValidation) {                           //Validation can be run, set relevant message flag to result

                    messagesToDisplay[numberOfLocalMessagesToDisplay + i - 1][fieldIndex] = externalArrayOfValidations[i - 1]();
                }                                                        //See note below about this statement
            }
        }
    }
}
function localContractFY_One() {
    
    var fieldNum = 0;
    var result = false;
    contractFY = Number(trimmedEntryFields[fieldNum]);
    //if (Number.isNaN(contractFY)) result = true;    //THIS WORKS BECAUSE A NEGATIVE, NULL OR ZERO ENTRY IS CONSIDERED MORE THAN
                                                    //TEN YEARS FROM TODAY'S DATE, HOWEVER MORE COMPLETE TEST BELOW IS BETTER

    if (!Number.isInteger(contractFY)) result = true; //THESE TWO LINES REPLACE THE ONE TEST ABOVE FOR 
    if (contractFY <= 0) result = true;

    return result;
}

function localContractFY_Two() {

    return (contractFY < currentFY - 10 || contractFY > currentFY + 50);
}

function localMaxMonthlyProdRate_One() {

    var fieldNum = 1;
    var result = false;
    maximumMonthlyProdRate = Number(trimmedEntryFields[fieldNum]);
    //if (Number.isNaN(maximumMonthlyProdRate)) result = true;   //OLD TEST THAT WASN"T SUFFICIENT
                                                                 //(ALLOWED NULLS, NEGATIVE NUMBERS AND FLOATS)"

    if (!Number.isInteger(maximumMonthlyProdRate)) result = true; //THESE TWO LINES REPLACE THE ONE TEST ABOVE FOR 
    if (maximumMonthlyProdRate <= 0) result = true;               //THIS, TOTAL MONTHS AND TOTAL DELIVERIES FIELDS

    return result;
}

function localFirstItemDeliveryDate_One() {
    
    var fieldNum = 2;
    
    var result = (trimmedEntryFields[fieldNum].length !== 7);

    if (!result) {

        result = (trimmedEntryFields[fieldNum].charAt(2) !== "/");           //This tests if the third character is a slash ('/')

        if (!result) {

            var iniDeliveryDateMonth = trimmedEntryFields[fieldNum].substring(0, 2);
            deliveryMonth = Number(iniDeliveryDateMonth);

            var iniDeliveryDateYear = trimmedEntryFields[fieldNum].substring(3, 7);
            deliveryYear = Number(iniDeliveryDateYear);
        }
    }
    return result;
}

function localFirstItemDeliveryDate_Two() {

    var result = false;
    if (Number.isNaN(deliveryMonth)) result = true;

    if (!result) result = (deliveryMonth < 1 || deliveryMonth > 12);

    return result;
}

function localFirstItemDeliveryDate_Three() {

    var result = false;
    //if (Number.isNaN(deliveryYear)) result = true;  //THIS WORKS BECAUSE A NEGATIVE, NULL OR ZERO ENTRY IS CONSIDERED MORE THAN
                                                      //TEN YEARS FROM TODAY'S DATE, HOWEVER MORE COMPLETE TEST BELOW IS BETTER

    if (!Number.isInteger(deliveryYear)) result = true;      //THESE TWO LINES REPLACE THE ONE TEST ABOVE  
    if (deliveryYear <= 0) result = true;
   
    return result;
}

function localFirstItemDeliveryDate_Four() {

    return (deliveryYear > currentYear + 50);
}

function localFirstItemDeliveryDate_Five() {
    
    return (((deliveryMonth < 10) && (deliveryYear < currentFY - 1)) ||
        ((deliveryMonth >= 10) && (deliveryYear < currentFY - 2)));
}
function localDeliveryPeriod_One() {

    var fieldNum = 3;
    var result = false;
    totalMonths = Number(trimmedEntryFields[fieldNum]);
    
    if (!Number.isInteger(totalMonths)) result = true; 
    if (totalMonths <= 0) result = true;

    return result;
}

function localDeliveryQty_One() {

    var fieldNum = 4;
    var result = false;
    totalDeliveryQty = Number(trimmedEntryFields[fieldNum]);
    
    if (!Number.isInteger(totalDeliveryQty)) result = true;
    if (totalDeliveryQty <= 0) result = true;

    return result;
}

function localDistributionProfile_One() {

    var result = false;
    profile = document.getElementById("profile").value;
    if (profile === "select") result = true;

    return result;

}

function localUseAI_One() {

    var result = document.getElementById("use_AI").checked;  //comment this out and comment in line below  
    //var result = false;                                     //if useAI is enabled and no validation is needed
    return result;
}

//External Validation Functions

function externalContractFYPlus_One() {

    return (contractFY > currentFY && totalMonths > 12);
}

function externalContractFYPlus_Two() {

    return (contractFY <= currentFY && totalMonths > 120);
}

function externalContractFYPlus_Three() {

    return (deliveryMonth < 10 && deliveryYear < contractFY) ||
        (deliveryMonth >= 10 && deliveryYear < contractFY - 1);
}

function externalMaxMonthlyProdRatePlus_One() {

    return (totalDeliveryQty > maximumMonthlyProdRate * totalMonths);
}

function createToolTipMessages() {          //This aggregates messages by input field
                                            //This an be used for tooltips or to display messages in common control
                                            //Tailor as needed to suit the situation at hand 

    errorPresent = false;
    var onlyWarningsPresent = true;         //This variable is currently not used but could be converted
                                            //to a global variable (or returned by this function) and used 
                                            //if warnings are included in the validations. All warnings would 
                                            //be loaded in messages[][] after the last message which should 
                                            //disable the Submit button. This variable would be set to true 
                                            //and changed to false only if any messages display for non-warnings
                                            //i.e. any messages are present in messagesToDisplay below the 
                                            //boundary between warnings and non-warnings. It also requires the 
                                            //commented change below in the loop. Changes also need to be made
                                            //to upDateToolTipsAndAsterisks - these changes are included there
                                            //but are currently commented out.   
    for (j = 0; j < numberOfEntryFieldsToValidate; j++) {

        var message = "";
        var fieldName = "";
        for (i = 0; i < totalNumberOfMessages; i++) {

            if (messagesToDisplay[i][j]) {
                message = message + " " + messages[i];
                errorPresent = true;
                //Include this line if warnings are present and see comments
                //at beginning of this function
                //if (j < index_after_which_only_warnings_are_included) onlyWarningsPresent = false;
            }

        }
        toolTipMessages[j] = message;

    }

    displayErrorMessages();
}

function isMobile() {
    // Check if the user agent string contains any of these mobile indicators
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Regular expressions for common mobile platforms
    const mobileRegex = /android|iphone|ipad|ipod|windows phone|iemobile|opera mini/i;

    return mobileRegex.test(userAgent);
}


function displayErrorMessages() {
    //This was originally designed to concatenate all error messages and display 
    //them in a text box. Messages are now being displayed as tooltips, so this
    //design is not optimized because a concatenated string is built that is not
    //displayed anywhere. A better approach would be to use a boolean set
    //initially to "false" that would then change to "true" if a non-null
    //message is present, however, building the concatenated string and using 
    //that as the test to see if any errors are present (by determining if it 
    //is non-null) allows for a  quick conversion between the earlier design and 
    //the tooltip design (Three changes below denoted by the line of **** are
    //all that is needed to switch between the two designs). 
    //Note that the tooltips have not been styled - the default is used.

    var mobileBrowser = isMobile();
    var text = "";
    for (i = 0; i < numberOfEntryFieldsToValidate; i++) {

        if (toolTipMessages[i] !== "") {
            text = text + arrayOfMessageHeaders[i] + toolTipMessages[i] + "<br>";
            //highlightCell(arrayOfEntryFields[i]);                      //See comment below with the line of "****"
            if (i !== 6) highlightCell(arrayOfEntryFields[i]);           //relating to these two lines of code

                                                                         //***************************
            //} else clearHighlightedCell(arrayOfEntryFields[i]);        //This is the default - the else code below was added
                                                                         //to handle the special case of the checkbox:
                                                                         //these form elements currently don't have a 
                                                                         //simple means to change the background color
        } else {

            if (i !== 6) clearHighlightedCell(arrayOfEntryFields[i]);    //The test "i !== 6" excludes the useAI checkbox
        }
            
    }

    if (errorPresent) {
        //****************************************
        //Comment out mobileBrowser if test lines below to switch between tooltip and textbox design for desktop
        if (mobileBrowser) {
            errorMessage2.innerHTML = text;
            errorMessage2.style.background = "violet";
        } else {
            errorMessage.innerHTML = "Float pointer over a highlighted cell to view the error message.";
            errorMessage.style.background = "violet";
            updateTooltips();
        }

    } else {
        if (mobileBrowser) {

            errorMessage2.style.background = "transparent";
            //text = "";
            errorMessage2.innerHTML = text;
            //errorPresent = false;

        } else { 
            errorMessage.style.background = "transparent";
            //text = "";
            errorMessage.innerHTML = text;
            updateTooltips();
            //errorPresent = false;      

        }
    }
    //****************************************
    //Comment out first line below to switch to textbox design
    //if (!mobileBrowser) {

    //    updateTooltips();
    //}
    enableDisableSubmit();
}

function updateTooltips() {
    for (i = 0; i < numberOfEntryFieldsToValidate; i++) {

        document.getElementById(arrayOfEntryFieldNames[i]).setAttribute('title', toolTipMessages[i]);

    }
};

function enableDisableSubmit() {


    if (errorPresent === false && checkMinCharState()) {
        submit.disabled = false;
        localStorage.setItem("maximumMonthlyProductionRate", maximumMonthlyProdRate);
        localStorage.setItem("deliveryMonth", deliveryMonth);
        localStorage.setItem("deliveryYear", deliveryYear);
        localStorage.setItem("totalMonths", totalMonths);
        localStorage.setItem("totalDeliveryQty", totalDeliveryQty);
        localStorage.setItem("profile", profile);


    } else {
        submit.disabled = true;
    }
    

}

function checkMinCharState() {        //This checks to see if the minimum number of characters have been entered
                                      //for all fields. If this is true and no messages are present the application
    var result = true;                //state can be allowed to advance (for example a "Submit" button could be enabled)
    i = 0;                            //The minCharEntered[] value is set by preProcessEntry() - see additional comments there.
    while (result && i < numberOfEntryFieldsToValidate) {

        result = minCharEntered[i];
        i++;
    }

    return result;
}

function clearHighlightedCell(p1) {
    p1.style.background = "white";
}

function highlightCell(p1) {
    p1.style.background = "violet";
}

/*
  
 THESE NEED MORE WORK to RUN PROPERLY 
 See these links:
 https://www.tutorialspoint.com/how-to-add-a-tooltip-to-a-div-using-javascript#:~:text=To%20add%20a%20tooltip%20to%20a%20div%20using%20JavaScript%2C%20first,tooltip%20and%20position%20it%20appropriately.
 https://stackoverflow.com/questions/33476143/loading-tooltip-message-dynamically-from-javascript
 */
/*
function showTooltip() {
    //const tooltip = document.querySelector(".tooltip");
    //const tooltip = document.querySelector(".errorMessage");
    const tooltip = document.getElementById("contractFY");
    //const tooltip = document.getElementById(("errorMessage").innerHTML = toolTipMessages[0]);
    tooltip.style.display = "block";
}

function hideTooltip() {
    //const tooltip = document.querySelector(".tooltip");
    const tooltip = document.getElementById("contractFY");
    tooltip.style.display = "none";
}

function openWin() {

    //pageTwo = window.open("DQD_HTML5_JS_CSS_Node_Page2.html");

    //const pageTwo = window.open('DQD_HTML5_JS_CSS_Node_Page2.html');
    //addCloseListener();


    location.replace("DQD_HTML5_JS_CSS_Node_Page2.html");



}

function closeWin() {

    //pageTwo = window.open("DQD_HTML5_JS_CSS_Node_Page2.html");

    //const pageTwo = window.open('DQD_HTML5_JS_CSS_Node_Page2.html');
    //addCloseListener();


    location.replace("DQD_HTML5_JS_CSS_Node_Page2.html");

}
*/
//OLD CODE BELOW
//*******************************************************************************************************************
//var errorPresent = new Boolean(false);
//var submitContractFYErrorStatus = new Boolean(true);
//var submitMaximumMonthlyProductionRateErrorStatus = new Boolean(true);
//var submitDeliveryQuantityTotalErrorStatus = new Boolean(true);
//var submitDeliveryMonthsTotalErrorStatus = new Boolean(true);
//var submitDeliveryDateErrorStatus = new Boolean(true);
//var submitProfileErrorStatus = new Boolean(true);
//var submit;

//var inputLength = 0;    //Global variable for length of input field with the most recent user entry

/*
var errorMessages = [
    "NOT USED ",
    "Select a delivery distribution profile. ", 
    "Delivery date must be entered in the MM/YYYY format. ", 
    "Delivery period must be a positive integer. ",
    "Delivery period cannot be greater than 12 months for contract" + 
                        " fiscal years later than the current fiscal year. ", 
    "Delivery period cannot be greater than 120 months for contract fiscal" + 
                " years equal to, or earlier than, the current fiscal year. ",
    "Delivery quantity must be a positive integer. ", 
    "NOT USED ",
    "Valid months are 01 - 12. ", 
    "Delivery year cannot be more than 50 years from now. ",
    "Delivery cannot be earlier than the current prior fiscal year. ", 
    "Delivery year cannot be earlier than the contract fiscal year. ",
    "Delivery year must be entered in the YYYY format. ", 
    "NOT USED ",
    "Fiscal years cannot be more than 10 years earlier or 50 years later" + 
                                            " than the current fiscal year. ", 
    "Contract Fiscal Year (FY) must be entered in the YYYY format. ", 
    "Maximum Monthly Production quantity must be a positive integer ", 
    "Maximum Monthly Production quantity multiplied by the number of months" + 
        "  in the delivery period cannot exceed the total delivery quantity. "
];
*/

//var errorMessagesToDisplay = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

//    "MessageFieldOne", "MessageFieldTwo", "MessageFieldThree",
//   "MessageFieldTFour", "MessageFieldFive", "MessageFieldSix"
//];

//const entryFields = [contractFY, maximumMonthlyProdRate, deliveryMonth,
//                        deliveryYear, totalMonths, totalDeliveryQty, profile];
//trimmedEntryFields[0] = "23";

/*
trimmedEntryFields[0] = "Yo ";
trimmedEntryFields[1] = "dude, ";
trimmedEntryFields[2] = "what ";
trimmedEntryFields[3] = "up?";

for (i=0; i < 4; i++) {
   console.log(trimmedEntryFields[i]); 
}


var testNum = Number(trimmedEntryFields[0]);
    if (Number.isNaN(testNum)) {
        result = true;
        console.log("NaN!");
    } else console.log("It's a number!!");
*/
/*
for (i = 0; 0 < localArrayOfValidations.length; i++) {
    
    //localArrayOfValidations[i]();
    
};

*/

/*
    THESE NEED MORE WORK to RUN PROPERLY
    See these links:
    https://www.tutorialspoint.com/how-to-add-a-tooltip-to-a-div-using-javascript#:~:text=To%20add%20a%20tooltip%20to%20a%20div%20using%20JavaScript%2C%20first,tooltip%20and%20position%20it%20appropriately.
    https://stackoverflow.com/questions/33476143/loading-tooltip-message-dynamically-from-javascript
    Also see functions towards end of file called:
    function showTooltip() and function hideTooltip()
       contractFYField.addEventListener("mouseover", showTooltip);
       contractFYField.addEventListener("mouseout", hideTooltip);
    */
//contractFYField.addEventListener("mouseover", showTooltip);
//contractFYField.addEventListener("mouseout", hideTooltip);

//MOST OF REST SHOULD BE DELETED *********************************************************
//inputLength = iniContractFYEdited.length;
//contractFY = Number(iniContractFYEdited);
//entryFields[0] = Number(iniContractFYEdited);

//clearHighlightedCell(contractFYField);
//clearErrorMessageArray(4);
//clearErrorMessageArray(5);
//clearErrorMessageArray(11);
//clearErrorMessageArray(14);
//clearErrorMessageArray(15);

/*
        if (inputLength == 4) {
            submitContractFYErrorStatus = false;
            
           
            console.log("We've reached a length of 4!");
            console.log("Is this an integer? " + (Number.isInteger(contractFY)));
           
 
            if (Number.isInteger(contractFY)) {
                
                if (contractFY < currentFY - 10 || contractFY >
                                                            currentFY + 50) {
 
                    //"Fiscal years cannot be more than 10 years earlier or 
                    //       50 years later than the current fiscal year." 
                    //                                     error message.
                    errorMessagesToDisplay[14] = 14; 
                    errorPresent = true;
                    //submitContractFYErrorStatus = true;
                    //****contractFYField.style.background = "violet";
                    //****errorMessage.innerHTML = errorMessages[14];
                    //****errorMessage.style.background = "violet";
            //    } else if (submitDeliveryMonthsTotalErrorStatus == false & 
            //                                    errorMessagesToDisplay[3] == 0){
                                            
                } else {             //REPLACE TWO LINES ABOVE WITH THESE
                   if (submitDeliveryMonthsTotalErrorStatus == false & 
                                                errorMessagesToDisplay[3] == 0){
            
            
 
                        if (contractFY > currentFY & totalMonths > 12) {
                            //"Delivery period cannot be greater than 12 months 
                            //     for fiscal years later than the current one."
                            //                                    error message.
                            errorMessagesToDisplay[4] = 4;
                            errorPresent = true;
                            //submitContractFYErrorStatus = true;
                        } else if (contractFY <= currentFY & 
                                                            totalMonths > 120) {               
                            //"Delivery period cannot be greater than 120 months 
                            //  for fiscal years equal to or earlier than the
                            //                      current one." error message.
                            errorMessagesToDisplay[5] = 5;
                            errorPresent = true;
                            //submitContractFYErrorStatus = true;
                        }
                    }
 //THIS LINE IS THE PROBLEM - EITHER THE "}" NEEDS TO BE REMOVED OR THE 
 //ELSE SHOULD BE CONVERTED TO A STANDARD "IF". AS CURRENTLY CONSTRUCTED, THIS
 //CONDITION IS SKIPPED THE SECOND TIME THROUGH
 
                    if (submitDeliveryDateErrorStatus == false && 
                          errorMessagesToDisplay[2] == 0 && 
                              errorMessagesToDisplay[8] == 0 && 
                                  errorMessagesToDisplay[9] == 0 &&
                                      errorMessagesToDisplay[10] == 0 &&
                                          errorMessagesToDisplay[12] == 0) { 
 
 // REPLACE ELSE IF LINES BELOW WITH THOSE ABOVE
 
               // } else if (submitDeliveryDateErrorStatus == false && 
               //             errorMessagesToDisplay[2] == 0 && 
               //                  errorMessagesToDisplay[8] == 0 && 
               //                      errorMessagesToDisplay[9] == 0 &&
               //                          errorMessagesToDisplay[10] == 0 &&
               //                              errorMessagesToDisplay[12] == 0) {                     
 
                        if (deliveryMonth < 10 && deliveryYear < contractFY ) {
                            //"Delivery year cannot be earlier than the 
                            //          contract fiscal year." error message.
                            errorMessagesToDisplay[11] = 11;
                            errorPresent = true;
                            //submitContractFYErrorStatus = true;
 
                        } else if (deliveryMonth >= 10 & deliveryYear < 
                                                            contractFY - 1) {                            
                            //" Delivery year cannot be earlier than the 
                            //          contract fiscal year." error message.
                            errorMessagesToDisplay[11] = 11;
                            errorPresent = true;
                            //submitContractFYErrorStatus = true;
                        }
                    }
                }
            } else {
                //Contract Fiscal Year (FY) must be entered in the  
                //                 YYYY format. " error message.                        
                errorMessagesToDisplay[15] = 15;
                errorPresent = true;
                //submitContractFYErrorStatus = true;
            }
            
        } else if (inputLength != 4 && submitContractFYErrorStatus == false) {
            //Contract Fiscal Year (FY) must be entered in the  
            //                 YYYY format. " error message.
            
            if (Number.isInteger(contractFY)) {
                errorMessagesToDisplay[14] = 14;
                errorPresent = true;
                //submitContractFYErrorStatus = true;
            } else {
                errorMessagesToDisplay[15] = 15;
                errorPresent = true;
                //submitContractFYErrorStatus = true;
            }          
        }
        //displayErrorMessages(deliveryMonthsTotalErrorStatus,
        //                                    errorDeliveryMonthsTotal, 
        //                                        deliveryMonthsTotalAsterisk);
        //displayErrorMessages (deliveryDateErrorStatus, errorDeliveryDate, 
        //                                                deliveryDateAsterisk);
        //Reset background color on deliveryMonthsTotal and deliveryDate if
        //conditions shown in lines 140 - 145 are met 
        
        //console.log("I got here!");
        
        if (errorPresent)
            highlightCell(contractFYField);
        if (submitDeliveryDateErrorStatus == false && 
                            errorMessagesToDisplay[2] == 0 && 
                                 errorMessagesToDisplay[8] == 0 && 
                                     errorMessagesToDisplay[9] == 0 &&
                                         errorMessagesToDisplay[10] == 0 &&
                                             errorMessagesToDisplay[12] == 0)
            clearHighlightedCell(firstDeliveryDateField);
 
       
       if (submitDeliveryMonthsTotalErrorStatus == false && 
                                                errorMessagesToDisplay[3] == 0)
            clearHighlightedCell(deliveryMonthsTotalField);  
       displayErrorMessages 
                   (errorMessagesToDisplay, contractFYField); 
    */
//MOST OF REST SHOULD BE DELETED *********************************************************
//errorPresent = false;
//submitMaximumMonthlyProductionRateErrorStatus = false;
//console.log("We had an event in the MMPR!");
//maximumMonthlyProdRate =
//        Number(inimaximumMonthlyProductionRateEdited);

//clearHighlightedCell(maximumMonthlyProductionRateField);
//clearHighlightedCell(deliveryMonthsTotalField);
//clearHighlightedCell(totalDeliveriesField);

//clearErrorMessageArray(16);
//clearErrorMessageArray(17);
/*
      if (Number.isInteger(maximumMonthlyProdRate)) {
                                                             
         
          if (maximumMonthlyProdRate <= 0) {    
              //"Maximum Monthly Production quantity must be a  
              //      positive integer." error message.
                
              errorMessagesToDisplay[16] = 16;
              errorPresent = true;
              //submitMaximumMonthlyProductionRateErrorStatus = true;
              
          } else if (submitDeliveryQuantityTotalErrorStatus == false  && 
                              submitDeliveryMonthsTotalErrorStatus == false) {
              if (errorMessagesToDisplay[6] == 0 && 
                                          errorMessagesToDisplay[3] == 0) {
                 
                  if (totalDeliveryQty > maximumMonthlyProdRate * 
                                                      totalMonths) {
                      //"Maximum Monthly Production quantity 
                      //multiplied by the number of months in the 
                      //delivery period cannot exceed the total  
                      //delivery quantity." error message.
                      errorMessagesToDisplay[17] = 17;
                      errorPresent = true;
                      //submitMaximumMonthlyProductionRateErrorStatus = true;
                  }
              }     
          }
      } else {
          console.log("...or did I get here? " + maximumMonthlyProdRate);    
          errorMessagesToDisplay[16] = 16;
          errorPresent = true;
          //submitMaximumMonthlyProductionRateErrorStatus = true;
          }
     
      if (errorPresent)
          highlightCell(maximumMonthlyProductionRateField);
      if (submitDeliveryQuantityTotalErrorStatus == false && 
                                              errorMessagesToDisplay[6] == 0)
          clearHighlightedCell(totalDeliveriesField);
      if (submitDeliveryMonthsTotalErrorStatus == false && 
                           errorMessagesToDisplay[3] == 0 && 
                                errorMessagesToDisplay[4] == 0 && 
                                    errorMessagesToDisplay[5] == 0)
         clearHighlightedCell(deliveryMonthsTotalField); 
       displayErrorMessages 
                 (errorMessagesToDisplay, maximumMonthlyProductionRateField);
      */
//var inputLength = iniFirstDeliveryDateEdited.length;

//clearHighlightedCell(firstDeliveryDateField);
//clearHighlightedCell(contractFYField);
//console.log("We had an event!");
//clearErrorMessageArray(2);
//clearErrorMessageArray(8);
//clearErrorMessageArray(9);
//clearErrorMessageArray(10);
//clearErrorMessageArray(11);
//clearErrorMessageArray(12);
//MOST OF REST SHOULD BE DELETED *********************************************************
/*
        if (inputLength === 7) {
            submitDeliveryDateErrorStatus = false;
            checkDeliveryDate(iniFirstDeliveryDateEdited);
        } else if (inputLength !== 7
                                        & submitDeliveryDateErrorStatus === false){               
            //Need to add crosschecks to CY here                
            //"Delivery date must be entered in the MM/YYYY 
            //                                      format." error message.
            errorMessagesToDisplay[2] = 2;
            console.log("Looks like we don't have a length of 7!");
             console.log("Here is the errorMessagesToDisplay array " + errorMessagesToDisplay);
            highlightCell(firstDeliveryDateField);
            errorPresent = true;
            //submitDeliveryDateErrorStatus = true;
            if (submitContractFYErrorStatus == false &&
                                errorMessagesToDisplay[4] == 0 &&
                                    errorMessagesToDisplay[5] == 0 &&
                                        errorMessagesToDisplay[14] == 0 &&
                                                errorMessagesToDisplay[15] == 0)
            clearHighlightedCell(contractFYField);
            displayErrorMessages(errorMessagesToDisplay,
                                            firstDeliveryDateField); 
        } 
        */
//errorPresent = false;
//submitDeliveryMonthsTotalErrorStatus = false;

//var iniDeliveryMonthsTotalEdited = iniDeliveryMonthsTotal.trim();
//totalMonths = Number(iniDeliveryMonthsTotalEdited);

//clearHighlightedCell(contractFYField);
//clearHighlightedCell(maximumMonthlyProductionRateField);
//clearHighlightedCell(deliveryMonthsTotalField);
//clearHighlightedCell(totalDeliveriesField);

//clearErrorMessageArray(3);
//clearErrorMessageArray(4);
//clearErrorMessageArray(5);
//clearErrorMessageArray(17);
//MOST OF REST SHOULD BE DELETED *********************************************************
/*
        if (Number.isInteger(totalMonths)) {
            if (totalMonths < 1) {                
                //"Delivery period must be a positive integer." 
                //                                        error message.
                errorMessagesToDisplay[3] = 3;                
                errorPresent = true;
                //submitDeliveryMonthsTotalErrorStatus = true;
                
            } else {
                
                if (submitContractFYErrorStatus == false) {
                    
                    if (errorMessagesToDisplay[14] == 0 || 
                                    errorMessagesToDisplay[15] == 0) {
                        
                        if (contractFY > currentFY & totalMonths > 12) {
        //Need to reset contractFY message here as is done below for MaxMonthly and deliveryQty
                            //"Delivery period cannot be greater than 12 months 
                            //        for fiscal years later than the current one."
                            //                                        error message.
                            errorMessagesToDisplay[4] = 4;
                            errorPresent = true;
                            //submitDeliveryMonthsTotalErrorStatus = true;
                        } else if (contractFY <= currentFY & totalMonths > 120) {               
                            //"Delivery period cannot be greater than 120 months for
                            //               fiscal years equal to or earlier than
                            //                    the current one." error message.
                            errorMessagesToDisplay[5] = 5;
                            errorPresent = true;
                            //submitDeliveryMonthsTotalErrorStatus = true;
                        }
                    }
                }
                if (submitDeliveryQuantityTotalErrorStatus == false &&
                        submitMaximumMonthlyProductionRateErrorStatus 
                                                                    == false) {
 
                   if (errorMessagesToDisplay[16] == 0 && 
                                    errorMessagesToDisplay[6] == 0) {                      
                       
                       //Probably do not need the code below - int variables should be fine for comparison but check during testing!!!!
                        //    int deliveryQTY = Integer.parseInt
                        //              (deliveryQuantityTotalInput.getText());
                        //    int maxMonthly = Integer.parseInt
                        //           (maximumMonthlyProductionRateInput.
                        //                                           getText());
                    // 
                       if (totalDeliveryQty > maximumMonthlyProdRate * 
                                                        totalMonths) {
                           //"Maximum Monthly Production quantity 
                           //multiplied by the number of months in the 
                           //delivery period cannot exceed the total  
                           //delivery quantiity." error message.
                           errorMessagesToDisplay[17] = 17;
                           errorPresent = true;
                           //submitDeliveryMonthsTotalErrorStatus = true;
                                                        
                       }
                    }                        
                }               
            }
        } else {           
            //"Delivery period must be a positive integer." error message. 
            errorMessagesToDisplay[3] = 3;
            errorPresent = true;
            //submitDeliveryMonthsTotalErrorStatus = true;
        }
        
        if (errorPresent)
            highlightCell(deliveryMonthsTotalField);
        //TO HERE!!!!!!
        if (submitContractFYErrorStatus == false &&
                                        errorMessagesToDisplay[14] == 0 &&
                                                errorMessagesToDisplay[15] == 0)
            clearHighlightedCell(contractFYField);
        if (submitMaximumMonthlyProductionRateErrorStatus == false &&
                                                errorMessagesToDisplay[16] == 0)
            clearHighlightedCell(maximumMonthlyProductionRateField);
        if (submitDeliveryQuantityTotalErrorStatus == false &&
                                                errorMessagesToDisplay[6] == 0)
            clearHighlightedCell(totalDeliveriesField);
        displayErrorMessages 
                    (errorMessagesToDisplay, deliveryMonthsTotalField);
      */

/*       
       //MOST OF REST SHOULD BE DELETED *********************************************************
               
               //errorPresent = false;
               //submitDeliveryQuantityTotalErrorStatus = false;
               //var iniTotalDeliveries = totalDeliveriesField.value;
               //var iniTotalDeliveriesEdited = iniTotalDeliveries.trim();
               //totalDeliveryQty = Number(iniTotalDeliveriesEdited);
               
               //clearHighlightedCell(totalDeliveriesField);
               //clearHighlightedCell(maximumMonthlyProductionRateField);
               //clearHighlightedCell(deliveryMonthsTotalField);
               
               //clearErrorMessageArray(6);
               //clearErrorMessageArray(17);
               //TO HERE - USE MMPR AS EXAMPLE IF PC SHUTS DOWN, OTHERWISE SEE NOTEPAD FOR CURRENT COPY
               
               if (Number.isInteger(totalDeliveryQty)){
                   
                   if (totalDeliveryQty <= 0) {                       
                           //Delivery quantity must be a positive integer." 
                           //                                      error message.
                           errorMessagesToDisplay[6] = 6;
                           errorPresent = true;
                           //submitDeliveryQuantityTotalErrorStatus = true;
       
                   } else if (submitMaximumMonthlyProductionRateErrorStatus
                                   == false && submitDeliveryMonthsTotalErrorStatus  
                                                                           == false) {
                       
                       if (errorMessagesToDisplay[16] == 0 && 
                                           errorMessagesToDisplay[3] == 0) {             
                           
                           if (totalDeliveryQty > maximumMonthlyProdRate * 
                                                               totalMonths) {                                                                
                               //"Maximum Monthly Production quantity 
                               //multiplied by the number of months in the 
                               //delivery period cannot exceed the total  
                               //delivery quantity." error message.
                               errorMessagesToDisplay[17] = 17;
                               errorPresent = true;
                               //submitDeliveryQuantityTotalErrorStatus = true;
                           }
                       }                                
                   }
               } else {                        
                   //"Delivery quantity must be a positive 
                   //                              integer." error message.
                   errorMessagesToDisplay[6] = 6;
                   errorPresent = true;
                   //submitDeliveryQuantityTotalErrorStatus = true;
                   
               }
               if (errorPresent)
                   highlightCell(totalDeliveriesField);
               if (submitMaximumMonthlyProductionRateErrorStatus == false && 
                                                       errorMessagesToDisplay[16] == 0)
                   clearHighlightedCell(maximumMonthlyProductionRateField);
               if (submitDeliveryMonthsTotalErrorStatus == false && 
                                           errorMessagesToDisplay[3] == 0 && 
                                               errorMessagesToDisplay[4] == 0 && 
                                                       errorMessagesToDisplay[5] == 0)
                  clearHighlightedCell(deliveryMonthsTotalField); 
               displayErrorMessages(errorMessagesToDisplay, totalDeliveriesField);
               */

//var selected = totalDeliveriesField.value;
//var profileField = document.getElementById("profile");
//trimmedEntryFields[5] = document.getElementById("profile").value;
//
//MOST OF REST SHOULD BE DELETED *********************************************************

//errorPresent = false;
//submitProfileErrorStatus = false;
//var profileField = document.getElementById("profile");
//var selected = document.getElementById("profile").value;

//console.log("Here's the selection: " + selected);

//clearHighlightedCell(profileField);

//clearErrorMessageArray(1);
/*
if (selected == "select") {                   
        //"Select a delivery distribution profile." error message.
        errorMessagesToDisplay[1] = 1;
        errorPresent = true;
        submitProfileErrorStatus = true;

} else {
   //submitProfileErrorStatus = false;
    profile = selected;
}              
if (errorPresent) {
    highlightCell(profileField);
} else {
    clearHighlightedCell(profileField);
}
displayErrorMessages(errorMessagesToDisplay, profileField);
*/
/*
function checkDeliveryDate(p1) {
   
   var deliveryDateEntry = p1;
   
      
   if  (deliveryDateEntry.charAt(2) == "/") {
 
       var iniDeliveryDateMonth = deliveryDateEntry.substring(0, 2);
       deliveryMonth = Number(iniDeliveryDateMonth);
       
       var iniDeliveryDateYear = deliveryDateEntry.substring(3, 7);
       deliveryYear = Number(iniDeliveryDateYear);
         
       if (Number.isInteger(deliveryMonth)) {
             
           if (deliveryMonth < 1 || deliveryMonth > 12) {
           //"Valid months are 01 - 12. " error message. 
               errorMessagesToDisplay[8] = 8;
               errorPresent = true;
               //submitDeliveryDateErrorStatus = true;
           }
       } else {
           //"Valid months are 01 - 12. " error message. 
           errorMessagesToDisplay[8] = 8;
           errorPresent = true;
           //submitDeliveryDateErrorStatus = true;
       }   
             
       ///////////////////
       if (Number.isInteger(deliveryYear)) {
           
           if (deliveryYear > currentYear + 50) {                           
               //"Delivery year cannot be 
               //      more than 50 years from now." error message.
               errorMessagesToDisplay[9] = 9;
               errorPresent = true;
               //submitDeliveryDateErrorStatus = true;

           } else if (errorMessagesToDisplay[8] == 0 && deliveryMonth < 10 
                                       && deliveryYear < currentFY - 1) {
               //"Delivery cannot be earlier than the current 
               //          prior fiscal year." error message.
               errorMessagesToDisplay[10] = 10;
               errorPresent = true;
               //submitDeliveryDateErrorStatus = true;

           } else if (errorMessagesToDisplay[8] == 0 & 
                       deliveryMonth >= 10 
                           && deliveryYear < currentFY - 2) {
               //"Delivery cannot be earlier than the current 
               //          prior fiscal year." error message.
               errorMessagesToDisplay[10] = 10;
               errorPresent = true;
               //submitDeliveryDateErrorStatus = true;
           }  
           if (errorMessagesToDisplay[8] == 0 && 
                   errorMessagesToDisplay[14] == 0 && 
                               errorMessagesToDisplay[15] == 0 &&
                                       deliveryMonth < 10 
                                           && deliveryYear < contractFY ) {
               //"Delivery year cannot be earlier than the 
               //          contract fiscal year." error message.
               errorMessagesToDisplay[11] = 11;
               errorPresent = true;
               //submitDeliveryDateErrorStatus = true;

           } else if (errorMessagesToDisplay[8] == 0 && 
                   errorMessagesToDisplay[14] == 0 && 
                               errorMessagesToDisplay[15] == 0 && 
                                   deliveryMonth >= 10 
                                       && deliveryYear < contractFY - 1) {                            
               //" Delivery year cannot be earlier than the 
               //          contract fiscal year." error message.
               errorMessagesToDisplay[11] = 11;
               errorPresent = true;
               //submitDeliveryDateErrorStatus = true;
           } 

       } else {
           //"Delivery year must be entered in the YYYY format. "
           //                                        error message.    
           errorMessagesToDisplay[12] = 12;
           errorPresent = true;
           //submitDeliveryDateErrorStatus = true;
       }                   
       ///////////////
       
   } else if (deliveryDateEntry.charAt(2) !== '/') {
               //"Delivery date must be entered in the MM/YYYY 
               //                             format." error message.
       errorMessagesToDisplay[2] = 2;
       errorPresent = true;
       //submitDeliveryDateErrorStatus = true;
   }
   
   
   if (errorPresent)
           highlightCell(firstDeliveryDateField);
   if (submitContractFYErrorStatus == false && errorMessagesToDisplay[14] == 0
                                           && errorMessagesToDisplay[15] == 0)
                               clearHighlightedCell(contractFYField);   

   displayErrorMessages(errorMessagesToDisplay,
                                           firstDeliveryDateField); 
}




function displayErrorMessages(p1, p2) {
       
   console.log("Here is the errorMessagesToDisplay array " + errorMessagesToDisplay);
   var p1Len, i;
   var text = "";
   p1Len = p1.length;
   
   for (i = 0; i < p1Len; i++) {
       if (p1[i] != 0) {
           text += errorMessages[i];
           console.log("Here is the p1[" + i + "] element in the errorMessagesToDisplay array plus the element " + p1[i]);
           console.log("Here is the error message so far " + text);
          
       }
   }
   
   if (text != "") {
       errorMessage.innerHTML = text;
       errorMessage.style.background = "violet";
       errorPresent = true;
      
   } else {
       errorMessage.style.background = "transparent";
       text = "";
       errorMessage.innerHTML = text;
       errorPresent = false;
       //enableDisableSubmit();
   }
   enableDisableSubmit();
}
  


function clearErrorMessageArray(p1) {    
   errorMessagesToDisplay[p1] = 0;
}
 
function  enableDisableSubmit() {
       
       
       if (errorPresent === false && submitContractFYErrorStatus === false && 
           submitMaximumMonthlyProductionRateErrorStatus === false && 
                submitDeliveryDateErrorStatus === false && 
                    submitDeliveryMonthsTotalErrorStatus === false
                       && submitDeliveryQuantityTotalErrorStatus === false && 
                                           submitProfileErrorStatus === false) { 
           submit.disabled = false;
           localStorage.setItem("maximumMonthlyProductionRate", maximumMonthlyProdRate);
           localStorage.setItem("deliveryMonth", deliveryMonth);
           localStorage.setItem("deliveryYear", deliveryYear);
           localStorage.setItem("totalMonths", totalMonths);
           localStorage.setItem("totalDeliveryQty", totalDeliveryQty);
           localStorage.setItem("profile", profile);
           
       
       } else {
           submit.disabled = true;
       }
           //Note that two lines below need a test to ensure only integers are
           //passed - for now this assumes totalMonths and totalDeliveryQty
           //fields contain integers 
           //deliveryMonth, 
           //            deliveryYear, totalMonths, totalDeliveryQty, profile
         
           
           
   }
   
   
   
   function openWin() {
       
       //pageTwo = window.open("DQD_HTML5_JS_CSS_Node_Page2.html");
       
       //const pageTwo = window.open('DQD_HTML5_JS_CSS_Node_Page2.html');
       //addCloseListener();
     
       
       location.replace("DQD_HTML5_JS_CSS_Node_Page2.html");
   
       
      
   }
   
  function closeWin() {
       
       //pageTwo = window.open("DQD_HTML5_JS_CSS_Node_Page2.html");
       
       //const pageTwo = window.open('DQD_HTML5_JS_CSS_Node_Page2.html');
       //addCloseListener();
     
       
       location.replace("DQD_HTML5_JS_CSS_Node_Page2.html");
   
       
      
}
*/
/*
* 
* To change this license header, choose License Headers in Project Properties.
* To change this template file, choose Tools | Templates
* and open the template in the editor.
*/



/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */



