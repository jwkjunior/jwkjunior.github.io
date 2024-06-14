/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var http = require('http');
var fs = require('fs');
var mysql = require('mysql2');
var successful = 0;





//404 reponse
function send404Response(response) {
	
        
        response.writeHead(404, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': 'http://localhost:8080' });
        //COMMENT OUT LINE ABOVE AND UNCOMMENT LINE BELOW THIS PARAGRAPH TO RETURN TO WORKING VERSION RUN LOCALLY
        /*Line below this paragraph is bad - an Access-Control-Allow-Origin of "*" allows ANYONE access and should be avoided, BUT with this setting, this web app can be run
        by clicking on the page1 HTML in NetBeans and clicking "run" (data is saved to database with no errors) AND by running/starting the SaveToDatabaseNodeJS
        server in Netbeans 8.2. Alternatively, this can be run by following the directions below after uncommenting the line above this paragraph and the other two lines 
        denoted with the comment "UNCOMMENT THIS LINE TO RETURN TO WORKING VERSION". Next comment out the three lines that show an Access-Control-Allow-Origin of "*", 
        one is immediately below this paragraph, the others are lower in the file. This info is also contained in the text file called "How_To_Run_NodeJS_Version_of_DQD_Web"
        in the directory C:\Users\wkennedy\Desktop\New Files From 26 Apr 2017\Java Files\Projects\Delivery Quantity Distributor Web Version.
        
            1) Start SaveToDatabaseNode.JS server file in Netbeans 8.2 (this applies above as well)

            2) Load Page 1 HTML file into a browser by copy/pasting link below:

            URL for DQD Web HTML/CSS/JAvascript/Node version files on Glassfish server (copy/paste this into a browser - 
            currently only works with Chrome and Edge, some HTML issues on page 1 with Firefox):
            localhost:8080/Web_Test_Bed_HTML5_JS_CSS_Node/DQD_HTML5_JS_CSS_Node_Page1.html 
            
            File location in Glassfish directory:

            C:\Users\wkennedy\Documents\NetBeansProjects\Web_Test_Bed_HTML5_JS_CSS_Node


            File location in Netbeans Projects directory (if any files are updated in Netbeans, NOTE that 
            they UST BE COPIED from this location to the Glassfish location shown above):

            C:\Program Files\glassfish5\glassfish\domains\domain1\docroot\Web_Test_Bed_HTML5_JS_CSS_Node
            
            
        */
        //response.writeHead(404, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'  });        
	response.write("Error 404: Page not found.");
	response.end();
}

function sendSaveResponse(response) {
    if (successful = 2) {
       
        response.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': 'http://localhost:8080' });
        //COMMENT OUT LINE ABOVE AND UNCOMMENT LINE BELOW THIS LINE TO RETURN TO WORKING VERSION RUN LOCALLY
        //response.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
	response.write("It worked.");
	response.end();
    } else if (successful = 1) {
       
        response.writeHead(404, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': 'http://localhost:8080' });
        //COMMENT OUT LINE ABOVE AND UNCOMMENT LINE BELOW THIS LINE TO RETURN TO WORKING VERSION RUN LOCALLY
        //response.writeHead(404, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'  });
        
        response.write("Bummer.");
    }
}


//Handle user request
function onRequest(request, response) {
	
        if (request.method == 'GET') {
                //&& request.url == '/HTTPServerFile.js*'
                //response.writeHead(200, { 'Content-Type': 'text/js', 'Access-Control-Allow-Origin': 'http://localhost:8787/' });
                //response.writeHead(200, { 'Content-Type': 'text/js', 'Access-Control-Allow-Origin': '' });
                //response.writeHead(200, { 'Content-Type': 'text/js', 'Access-Control-Allow-Origin': 'http://localhost:8787/' });
                //fs.createReadStream("HTTPServerFile.js").pipe(response);
                //var data = request.body;
                console.log("Here sre the results at an incredibly long last! " + request.url);
                
		saveGETStringToDB(request.url);
                sendSaveResponse(response);
        }        
    
        else {
                    send404Response(response);
        }

}

function saveGETStringToDB(url){
    var con = mysql.createConnection({
      host: "localhost",
      user: "nodejs",
      password: "###########",    //Replace with valid password if save to DB enabled at a later date.
      ssl: false
    });
    /*
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    */
    //var dateTime = new Date().toISOString().slice(0, 19).replace('T', ' ') - Date.getTimezoneOffset() * 60 * 1000;
    var dateTime = (new Date ((new Date((new Date(new Date())).toISOString() 
                )).getTime() - ((new Date()).getTimezoneOffset()*60000)))
                                .toISOString().slice(0, 19).replace('T', ' ');
    //var dateTime = "2019-07-27 19:56:50.743";
    var data = url.split("=");
    console.log("Here is the massive string: " + data[1]);
    
    var dataToSaveToDB = data[1].split("z");
    var totalMonthsX2 = dataToSaveToDB.length;
    
    for (k = (totalMonthsX2 / 2); k < totalMonthsX2; k++) {
                
        var month = dataToSaveToDB[k].substr(0, 3);
        var year =  dataToSaveToDB[k].substr(3);
        dataToSaveToDB[k] = month + " " + year;
                
    }
    console.log("Here is the dataToSaveToDB array " + dataToSaveToDB);

    con.connect(function(err) {
        if (err) {
            throw err;
            successful = 1;
        }
        console.log("Connected!");
        //console.log("Here is the data:" + data);
        for (i = 0; i < (totalMonthsX2 / 2); i++) {
            var year = dataToSaveToDB[i + (totalMonthsX2 / 2)].substr(3);
            var month = dataToSaveToDB[i + (totalMonthsX2 / 2)].substr(0, 3);
            var quantity = dataToSaveToDB[i];

            console.log("Here is the month, year and qty: "
                            + month + " " + year + " " + quantity);
                    
            //var sql = "select * from  contract_data.contract_deliveries";
           //console.log(sql);
        
          
            var sql = "insert into contract_data.contract_deliveries (contract_name, "
                            + "contract_year, contract_month, monthly_deliveries) "
                            + "values (?)";
            var values =  [dateTime, year, month, quantity];      
                 
                    
            con.query(sql, [values], function (err, result) {
                if (err) throw err;
                console.log("Number of records inserted: " + result.affectedRows);

            });
        
        }
        con.end();
        successful = 2;
        console.log("Here is the successful variable: " + successful);
        
    });
    
    
    
}
//create server

http.createServer(onRequest).listen(8787);

console.log("Server is now running...");
