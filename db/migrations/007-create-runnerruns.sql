CREATE TABLE IF NOT EXISTS RunnerRuns(
    RunnerRunId INTEGER PRIMARY KEY,
    RunnerId INTEGER REFERENCES Runner(id),
    RunId INTEGER REFERENCES Runs(id),
    RunnerSRId TEXT,
    RunSRId TEXT
);
