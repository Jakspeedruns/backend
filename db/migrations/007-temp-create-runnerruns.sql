CREATE TABLE IF NOT EXISTS RunnerRuns(
    RunnerRunId         INTEGER PRIMARY KEY autoincrement,
    RunnerId            INTEGER REFERENCES Runner(id),
    RunId               INTEGER REFERENCES Runs(id),

    RunnerSRId          TEXT,
    RunSRId             TEXT
    );
