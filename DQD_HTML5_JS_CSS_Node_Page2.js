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
        //var pageOne = localStorage.getItem("pageOne");
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
        //DELETE THIS SOON!!!!!var colIdsArray = [];
        
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

        dhtmlxEvent(window,"load",function(){

        //Uncomment the following lines to allow access to variables on the first page when it has been submitted
        //var firstDeliveryDate = DQDWeb_HTML_CSS_JS_JavaBean_Page_1.getElementById('firstDeliveryDate').value;
        //var deliveryMonthsTotal = DQDWeb_HTML_CSS_JS_JavaBean_Page_1.getElementById('deliveryMonthsTotal').value;
        //var totalDeliveries = DQDWeb_HTML_CSS_JS_JavaBean_Page_1.getElementById('totalDeliveries').value;
        //var profile = DQDWeb_HTML_CSS_JS_JavaBean_Page_1.getElementById('profile').value;
        
        //"Contract Total minus this Total"    
        
        
        //var header = [
        //    "Dec 2019", "Jan 2020", "Feb 2020", "Mar 2020", "Apr 2020", "May 2020", "Jun 2020", "Jul 2020", "Aug 2020", "Sep 2020", "Oct 2020", "Nov 2020", "Total", "Difference"
        //];   
        //console.log("Header array " + header); 
        //var data1 = [
        //        ["1,131", "1,131", "1,132", "1,131", "1,132", "1,131", "1,131", "1,132", "1,131", "1,132", "1,131", "1,132", "13,777", "107"]
        //];
        var header = createColumnHeaders(firstDeliveryMonth, firstDeliveryYear); 
        
        
        columnIdsString = createColumnIds(deliveryMonthsTotal);
        columnTypes = createColumnTypes(deliveryMonthsTotal);
        columnValidatorsString = createColumnValidators(deliveryMonthsTotal);
        
        
        
        
        switch (profile) {

            case "flatline":
                 data = 
                         [flatLineDelivery(totalDeliveries, 
                                                        deliveryMonthsTotal)];                
                 break;
            case "rampup":
                upOrDown = false; 
                data = 
                         [deliveryRampUpOrDown(totalDeliveries, 
                                            deliveryMonthsTotal, upOrDown)];
                
                 break;
            case "rampdown":
                upOrDown = true;  
                data = 
                         [deliveryRampUpOrDown(totalDeliveries,
                                 deliveryMonthsTotal, upOrDown)];
               
                 break;
            case "bellcurve":
                 data = 
                         [deliveryNormalDistro(totalDeliveries, 
                                                        deliveryMonthsTotal)];
                
                 break;
        }
        
        /*  
        var dataJSON = {
            
            "total_count":1, "pos":0, "data":[
                    {
                        "col1": "1,131", 
                        "col2": "1,131", 
                        "col3": "1,132", 
                        "col4": "1,131",
                        "col5": "1,132", 
                        "col6": "1,131", 
                        "col7": "1,131", 
                        "col8": "1,132", 
                        "col9": "1,131", 
                        "col10": "1,132", 
                        "col11": "1,131", 
                        "col12": "1,132"
                    }

            ]

        };

        */
           
             
            var layout = new dhtmlXLayoutObject(results, "1C");
            layout.setSkin("dhx_skyblue");
            layout.cells("a").setText("");
            layout.cells("a").setHeight(150);
            layout.cells("a").hideHeader(true);
            //layout.cells.setAttribute("style","vertical-align:top");
            //contactsGrid.setColAlign("top");
            //layout.cells("a").setVAlign("top,top,top,top,top,top,top,top");
            //contactsGrid.setColVAlign("top,top,top,top,top,top,top,top");
            //layout.cells("a").setBorder({left:0,top:0,right:0,bottom:0});
            //layout.cells(“a”).cell.childNodes[main_layout.cells(“a”).conf.idx.cont].style.padding = “0px”;
            //layout.cells(“a”).conf.cells_cont = null;
            
            //Working version had one below commented out - if not commented out grid does not appear
            //contactsGrid.selection.setCell();
            //Working version had two below enabled
            layout.setOffsets({left:0,top:0,right:0,bottom:0});
            layout.setSizes();
            contactsGrid = layout.cells("a").attachGrid();
           
            contactsGrid.setHeader(header);   //sets the headers of columns
            //contactsGrid.setColumnIds("fname,lname,email");         //sets the columns' ids
            //contactsGrid.setInitWidths("20,20,*");   //sets the initial widths of columns
            //contactsGrid.setColAlign("left,left,left");     //sets the alignment of columns
            //contactsGrid.setColTypes("ro,ro,ro");               //sets the types of columns
            //contactsGrid.setColSorting("str,str,str");  //sets the sorting types of 
            contactsGrid.setStyle(
                "background-color:#87ceeb;color:black;font-weight:bold;",
                "background-color:white;color:black;font-weight:bold;","vertical-align: top",""
            );
            //contactsGrid.setColAlign("top","top","top");
           
            contactsGrid.init();
            //contactsGrid.selectRow(1);
            
            //DELETE THIS SOON!!!!!colIdsArray = columnIdsString.split(",");
            //DELETE THIS SOON!!!!!colTypeString = 
            contactsGrid.setColTypes(columnTypes);
            contactsGrid.setColValidators(columnValidatorsString);
            for (i = 0; i < deliveryMonthsTotal + 2; i++) {
                contactsGrid.setNumberFormat("0,000",i,"",",");
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
            contactsGrid.attachEvent("onValidationCorrect",function(){
                
                checkGrid();               
                return false;
            });
            contactsGrid.attachEvent("onValidationError",function(){
                
                checkGrid();               
                return false;
            });
          
            //contactsGrid.setColumnIds("col1,col2,col3,col4,col5,col6,col7,col8,col9,col10,col11,col12,col13,col14");
            var myJSON = JSON.stringify(data);
            console.log("Here is JSONed array!!! " + myJSON);
            //contactsGrid.setColumnIds(columnIdsString);
            //contactsGrid.parse(dataJSON,"js");
            //contactsGrid.load("data/dataJSON.json", "js");
            contactsGrid.parse(data,"jsarray");
            firstLoad = true;
            contactsGrid.setSizes();
            checkGrid();
            
           
            
            //System.out.println("\"total_count\"" + ":1," + "\"pos\"" + ":0," + "\"data\"" + ":[");
            //var MyJavaClass = Java.type('DQD_Sources.Calculation_Save_to_DB_Bean');

            // var result = MyJavaClass.fun1('John Doe');
            //print(result);
             
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
        

        function flatLineDelivery(qty, period){
            
        //See AllSortsOfTests for code with possible useful comments
            //var deliveries = [];
            //var deliveriesToInteger = [];
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
            //deliveries = formatDisplay(deliveriesToInteger);
            console.log("Here is the deliveries array " + deliveries);
            return deliveries;      

        }
        
        function deliveryRampUpOrDown(qty, period, reverse){
            
            
            perfectDeliveries = ((period + 1) * period) / 2;
            var remainderMonthlyDeliveries = 0;
            var sum = 0;


            for (i = 0; i < period; i++) {

                deliveriesToInteger.push(Math.trunc(((qty * (i + 1) + 
                        remainderMonthlyDeliveries)) /  perfectDeliveries));
                remainderMonthlyDeliveries = ((qty * (i + 1) + 
                        remainderMonthlyDeliveries)) % perfectDeliveries;
                sum = sum + deliveriesToInteger[i];
                
            }

            if (reverse) {

                reverseDeliveries = [];
                //int[] reverseDeliveriesToIngteger = new int[period];
                //var counter = 0;
                for (k = period - 1; k >= 0; k--) {
                  reverseDeliveries.push(deliveriesToInteger[k]);
                  //reverseDeliveriesToIngteger[counter] = deliveriesToInteger[k];
                  //counter = counter + 1;
                }
                //deliveries = reverseDeliveries;
                deliveriesToInteger = reverseDeliveries;
            }
            
            deliveriesToInteger[period] = sum;
            deliveriesToInteger[period + 1] = sum - totalDeliveries;
            deliveries = deliveriesToInteger;
            //deliveries = formatDisplay(deliveriesToInteger);
            return deliveries;                  
        }
        
        
        
        function deliveryNormalDistro(qty, period) {
            var deliveriesToDouble = [];
            var deliveriesToInteger = [];
            //double periodDouble = (double)period;
            //double qtyDouble = (double)qty;
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
                arrayIndexCounter = period /2; 
            } else {
                arrayIndexCounter = (period /2) + 1; 
            }

            for (i = 0; i < arrayIndexCounter ; i++) {

               var exponent = (.5 * xAxis * xAxis);
               deliveriesToDouble[i] = 
                    (1 / (Math.sqrt(2 * Math.PI))) * (Math.pow(Math.E, -1 * 
                                                                        exponent));       
               xAxis =  xAxis + increment;
               deliveriesToDouble[(period - 1) - i] = deliveriesToDouble[i];

            }


            for (i = 0; i < period; i++) {
                sum = sum + deliveriesToDouble[i];
            }

            perfectDistroMultiplier =  qty / sum;

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
            //deliveries = formatDisplay(deliveriesToInteger);
            return deliveries;
        }
       
          /*
        function formatDisplay(unformatted) { 
            var tempArray = [];
            for (k = 0; k < deliveryMonthsTotal + 2; k++) {
                             
                var parts = unformatted[k].toString().split(".");
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                tempArray.push(parts[0]);
                //tempArray.push(parts.join("."));
                console.log("Here is the deliveries array entry " + parts[0]);
             
            }
            console.log("Here is the tempArray " + tempArray); 
            return tempArray;
        }
        */
        /*
        function unFormatDisplay(formatted, arrayLength) { 
            var tempArray2 = [];
            console.log("Here is the formatted array to start " + formatted);
            console.log("Here is the tempArray2 array to start " + tempArray2);
            for (j = 0; j < arrayLength; j++) {
                             
                //var parts2 = formatted[k].toString().split(",");
                var parts2 = formatted[j].toString().split(",");
                console.log("Here is the var parts2 " + parts2);
               // parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                tempArray2.push(parts2.join(""));
                console.log("Here is the tempArray2 array " + tempArray2);
                console.log("Here is the unformatted deliveries array entry " + parts2.join(""));
             
            }
            console.log("Here is the unFormattedtempArray " + tempArray2); 
            return tempArray2;
        }
         */
        
        function saveToDB() {        
           
            //var data = JSON.stringify(deliveries);
            
            var data1 = data[0];
            var data2 = [];
            for (m = 0; m < deliveryMonthsTotal; m++) {
                           
                data2.push(data1[m]);
            
            }
            
            //var data3 = unFormatDisplay(data2, deliveryMonthsTotal);                        
            var deliveriesToDB = data2[0];
            
            for (k = 1; k < deliveryMonthsTotal; k++) {
                
                deliveriesToDB = deliveriesToDB + "z" + data2[k];
                
            }
            
            for (k = 0; k < deliveryMonthsTotal; k++) {
                
                deliveriesToDB = deliveriesToDB + "z" + headerArrayWOSpaces[k];
                
            }
            
            console.log("Here is the deliveries String!!!!: " + deliveriesToDB);
           
            
            
            
           
            xhttp = new XMLHttpRequest();
            
            xhttp.onreadystatechange = function() {
                messagesToDisplayArray = [];
                for (k = 0; k < messagesArray.length; k++) {

                   messagesToDisplayArray.push("");

                }
                var disableSaveFlag2 = false;
                if (this.readyState == 4 && this.status == 200) {
                    
                    messagesToDisplayArray[3] = 3;                       
                    disableSaveFlag2 = true;
                    displayErrorMessages(messagesToDisplayArray, disableSaveFlag2); 
                    console.log("Here is the readystate 4 flag" + disableSaveFlag2);
                    
            
                }
                else {
                    
                    messagesToDisplayArray[4] = 4;                       
                    disableSaveFlag2 = false;
                    displayErrorMessages(messagesToDisplayArray, disableSaveFlag2);
                     console.log("Here is the readystate 2 flag" + disableSaveFlag2);
                    
                }
            };
            xhttp.open("GET", "http://localhost:8787/SaveToDatabaseNodeJS.js?data=" + deliveriesToDB, true);
            xhttp.send();     
            
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
                
                quantity = Number(contactsGrid.cells(rowID,k).getValue());
                //iniQty = contactsGrid.cells(rowID,k).getValue();
           
                //parsedQty = iniQty.split(",");
                //quantity = Number(parsedQty.join(""));
                
                //console.log("Here's the cell! " + quantity);
                //console.log("Here's the qty: " + quantity + ", and the MMPR: " + maximumMonthlyProductionRate);
                //var iniUserEntryEdited = iniUserEntry.trim();
                //var userEntry = Number(iniUserEntryEdited);
                

                if (Number.isInteger(quantity)) {

                    if (quantity < 0) {

                        contactsGrid.cells(rowID,k).setBgColor('red');
                        messagesToDisplayArray[0] = 0;
                        recalcSumAndDiffFlag = false;
                        disableSaveFlag1 = true;


                    } else if (quantity > maximumMonthlyProductionRate) {

                        contactsGrid.cells(rowID,k).setBgColor('yellow');
                        messagesToDisplayArray[1] = 1;
                        disableSaveFlag1 = true;
                    }

                } else {
                    
                    contactsGrid.cells(rowID,k).setBgColor('red');
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
                     
                     //newSumArray[0] = contactsGrid.cells(rowID,k).getValue();
                    newSum = newSum + Number(contactsGrid.cells(rowID,k).getValue());
                     //newSum = newSum + Number(unFormatDisplay(newSumArray, 1)[0]);
                     
                }
                
                contactsGrid.cells(rowID,deliveryMonthsTotal).setValue(newSum);
                difference = newSum - totalDeliveries;
                contactsGrid.cells(rowID,deliveryMonthsTotal + 1).setValue(difference);
                 
            }
            difference = contactsGrid.cells(rowID,deliveryMonthsTotal + 1)
                                                                .getValue();

            if (difference != 0) {

                contactsGrid.cells(rowID,deliveryMonthsTotal + 1)
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
                
                if (messagesIn[k] != "") {
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
                contactsGrid.cells(rowID,k).setBgColor('');
                
            }
        }
        
        function updateDeliveriesWithUserEntries() {
            var updatedDeliveries = [];
            for (k = 0; k < deliveryMonthsTotal + 2; k++) {
                
                var rowID = contactsGrid.getRowId(0);
                contactsGrid.cells(rowID,k).getValue()
                updatedDeliveries.push(contactsGrid.cells(rowID,k).getValue());
                
            }
            data[0] = updatedDeliveries;
           
        }
    
        
        function reopenPageOne2() {

            
            window.close();


        }

       
      
             
/*
    ERROR MESSAGES:
                    String message1 = "Cells highlighted in yellow contain an entry that " + 
            "exceeds the maximum monthly production rate which must be " + 
            "corrected before the results can be saved to the database. ";
       String message2 = "Field labeled 'Difference Between This Total and " + 
            "Contract Total' must show zero before the results can be " + 
            "saved to the database. ";
       String message3 = "Data shown in the table above has been successfully " + 
            "saved to the database. Click the button labeled 'Exit without " + 
            "saving' to exit. ";
            
             
              
               
                
                 
                  
                    const invocation = new XMLHttpRequest();
            
            const url = 'http://localhost:8787/demo_db_connection.js';
   
           
              if (invocation) {    
                invocation.open('POST', url, true);
               // invocation.writeHead(200, { 'Content-Type': 'text/js', 'Access-Control-Allow-Origin': 'http://localhost:8787/' });
                invocation.onreadystatechange = handler;
                
                console.log("Did it work???!!");
                }
            
        }
        
        function handler(evtXHR)
    {
        if (invocation.readyState == 4)
        {
                if (invocation.status == 200)
                {
                    var response = invocation.responseText;
                    //var invocationHistory = response.getElementsByTagName('invocationHistory').item(0).firstChild.data;
                    console.log("Did it work???!!" + response);
                    
                }
                else
                {
                    alert("Invocation Errors Occured " + invocation.readyState + " and the status is " + invocation.status);
                }
        }
        else
        {
            dump("currently the application is at" + invocation.readyState);
        }
    }
            
           /* 
            var xhttp = new XMLHttpRequest();
            xhttp.open("GET", "http://localhost:8787/demo_db_connection.js", true);
            
            xhttp.send(data); 
            
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    message.innerHTML = "Your data has been saved to the database.";
                    savetodb.disabled = true;
                }
                else {
                    message.innerHTML = "There was an error saving the data - please try again.";
                }
            };
                        //$.post("demo_db_connection.js",
                        
                        function status(data, status){
                          alert("Data: " + data + "\nStatus: " + status);
                          console.log("Here is the stringified JSON in the POST function! " + data);
                    };
                 
        }
        */
