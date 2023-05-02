const fs = require("fs");
const db = require("better-sqlite3")("./.wrangler/state/d1/DB.sqlite3");

//create temprun table, prepare insert template
createTempRuns();
const stmt = db.prepare(`INSERT INTO TempRuns(  
    [SRId],
    [GameId],
    [CatId],
    
    [TimeSecs],
    [PlatformId],
    [Emulated],
    [RegionId],
    [VideoLink],

    [SubmitDate],
    [Status],
    [Examiner],
    [VerifyDate],
    
    
    [Variables])
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

//strings for paths/filename
const folderpath = "./test/jsonblob/";
let filename = "2023425-jak1.json"; //filename hardcoded for testing

//a list we will append with values from a run's json
let fields = [];

fs.readFile(folderpath + filename, (err, data) => {
  if (err) throw err;

  //parse the json data, access the .data field, not .pagination
  let blob = JSON.parse(data).data; // fix after doing pagination

  //loop through each run of the json data
  //for (let i=0; i < blob.length; i++) {
  //console.log(blob[i])        //each run object

  fields.push(blob[1].id);
  fields.push(blob[1].game);
  fields.push(blob[1].category);
  fields.push(blob[1].times.realtime_t); //time to string logic eventually
  fields.push(blob[1].system.platform);
  fields.push(blob[1].system.emulated.toString()); //need to convert to int
  fields.push(blob[1].system.region);
  fields.push(blob[1].videos.links[0].uri);
  //fields.push(blob[1].comment.toString())                //need to handle javascript nulls
  fields.push(blob[1].date);
  fields.push(blob[1].status.status);
  fields.push(blob[1].status.examiner);
  fields.push(blob[1].status["verify-date"]); //make date formats consistent
  fields.push(JSON.stringify(blob[1].values));

  console.log(fields);
  stmt.run(fields);
  //}
});

function createTempRuns() {
  const createStmt = `CREATE TABLE IF NOT EXISTS TempRuns(
    RunId          INTEGER PRIMARY KEY,
    SRId           TEXT,
    GameId         TEXT,
    CatId          TEXT,
    Time           TEXT,
    TimeSecs       REAL,
    PlatformId     TEXT,
    Emulated       TEXT,
    RegionId       TEXT,
    VideoLink      TEXT,
    Comment        TEXT,
    SubmitDate     TEXT,
    Status         TEXT,
    Examiner       TEXT,
    VerifyDate     TEXT,
    RowCreatedDate TEXT,
    AlgPoint       INTEGER,
    Variables      TEXT
    );`;

  db.exec(createStmt);
}
