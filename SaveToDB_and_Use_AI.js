/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var fs = require('fs');
var mysql = require('mysql2');


const { spawn } = require('child_process');
const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');


const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost");
    res.header("Access-Control-Allow-Methods", "PUT, PATCH, GET, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Api-Key, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

//VERY IMPORTANT NOTE:
//The app.use (cors) and app.get(...) functions below were key to resolving the CORS preflight error that needed a an HTTP status of OK

app.use(cors());

app.get('/save_to_DB', function (req, res, next) {          //UNDO IF ERROR: "/save" instead of "save_to_DB"
    res.json({ msg: 'This is CORS-enabled for all origins!' });
});


content = [0, 0];                                   //Global variable to allow content to be used for runPythonScript

app.post('/use_ai', (req, res) => {

    //content = JSON.stringify(req.body.content);
    entries = req.body.content;
    console.log('Form Values on Server as a JSON:', entries);
    runPythonScript()
        .then((result) => {
            console.log('Python script output is as follows:', result);
            res.send(result);

        })
        .catch((error) => {
            console.error('Error:', error);
            return res.status(500).send('Error writing to file');
        });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});



function runPythonScript() {

    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', ['AI_Caller.py', entries]);

        let data = '';
        pythonProcess.stdout.on('data', (chunk) => {
            data += chunk.toString();

        });



        pythonProcess.stderr.on('data', (error) => {
            reject(error.toString());
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(`Python script exited with code ${code}`);
            } else {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                    console.log(`Yay - Python gave me the above!` + jsonData);
                } catch (error) {
                    reject(`Error parsing JSON: ${error}`);
                }
            }
        });
    });
}



app.post('/save_to_DB', (req, res) => {
    const content = req.body.content;                //UNDO IF ERROR: Line replaced: content = req.body.content;

    (async () => {


        saveGETStringToDB(content)
            .then(result => {

                if (result == 2) res.status(200).send('User data saved successfully');
                if (result == 1) res.status(400).send('There was a problem saving the data - please try again later.');

            })
            .catch(error => {
                console.error('Error inserting data:', error);
                res.status(400).send('There was a problem saving the data - please try again later.');
            });
        //.finally(() => {
        //connection.end();
        //});

    })();


});

function saveGETStringToDB(schedule) {

    return new Promise((resolve, reject) => {
        try {
            var con = mysql.createConnection({
                host: "localhost",
                user: "nodejs",
                password: "************",
                ssl: false
            });

            var dateTime = (new Date((new Date((new Date(new Date())).toISOString()
            )).getTime() - ((new Date()).getTimezoneOffset() * 60000)))
                .toISOString().slice(0, 19).replace('T', ' ');

            var data = schedule;
            var error = 0;
            var counter = 0;
            console.log("Here is the massive string: " + schedule);

            var dataToSaveToDB = schedule.split("z");
            var totalMonthsX2 = dataToSaveToDB.length;

            for (k = (totalMonthsX2 / 2); k < totalMonthsX2; k++) {

                var month = dataToSaveToDB[k].substr(0, 3);
                var year = dataToSaveToDB[k].substr(3);
                dataToSaveToDB[k] = month + " " + year;

            }
            console.log("Here is the dataToSaveToDB array " + dataToSaveToDB);

            con.connect(function (err) {
                if (err) {
                    console.log("First SQL error encountered on connection" + err);

                    error = 1;
                    return reject(1);


                }
                console.log("Connected!");


                for (i = 0; i < (totalMonthsX2 / 2); i++) {
                    var year = dataToSaveToDB[i + (totalMonthsX2 / 2)].substr(3);
                    var month = dataToSaveToDB[i + (totalMonthsX2 / 2)].substr(0, 3);
                    var quantity = dataToSaveToDB[i];

                    console.log("Here is the month, year and qty: "
                        + month + " " + year + " " + quantity);


                    var sql = "insert into contract_data.contract_deliveries (contract_name, "
                        + "contract_year, contract_month, monthly_deliveries) "
                        + "values (?)";
                    var values = [dateTime, year, month, quantity];

                    //NOTE: CON.QUERY BELOW COULD BE MOVED TO A SEPARATE PROMISE OR AT LEAST RESTRUCTURED AS A
                    //TRY/CATCH LOOP - THIS WOULD BE CLEANER. CURRENTLY, THE TEST IN THE ELSE BRANCH SETS THE VARIABLE
                    //RESOLVE VALUE TO 1 (INDICATING TO A USER A SAVE ERROR OCCURRED) IF ANY OF MULTIPLE RECORD
                    //INSERTS FAILS, BUT IT DOES NOT STOP THE LOOP FROM CONTINUING (I.E. SOME RECORDS COULD BE
                    //INSERTED EVEN IF SOME FAIL). THIS IS OK, BUT THE SUGGESTIONS ABOVE MIGHT BE BETTER.

                    con.query(sql, [values], function (err, result) {

                        if (err) {
                            console.log("Second SQL error on first insert attempt!" + err);

                            error = 1;
                            return reject(1);


                        } else {
                            console.log("Number of records inserted: " + result.affectedRows);
                            counter++;

                            if (error > 0) return resolve(1);
                            if ((error == 0) && (counter == (totalMonthsX2 / 2))) return resolve(2);

                        }
                    });

                }
                con.end();
                console.log("Here is the error value outside the con.query: " + error);

            })

        } catch (err) {
            return reject(1);

        }
    });
}



