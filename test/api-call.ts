const request = require("request");
const fs = require("fs");

//Requesting runs as a json and writing to file

//build strings for paths/filename
let d = new Date();
let dateYMD = "" + d.getFullYear() + (d.getMonth() + 1) + d.getDate();

const folderpath = "./test/jsonblob/";
let fn = "-jak1.json";
let filename = dateYMD + fn;

let url = "https://www.speedrun.com/api/v1/runs?game=xkdk4g1m&max=10";

//make the request
request(url, (err, res, body) => {
  if (err) {
    return console.log(err);
  }

  //write body to filestream
  let stream;
  stream = fs.createWriteStream(folderpath + filename);
  stream.write(body);
});
//todo - turn into class with methods for pagination
