CREATE TABLE IF NOT EXISTS RunnerRuns(
    RunnerRunId         INTEGER PRIMARY KEY,
    RunnerId            INTEGER REFERENCES Runner(RunnerId),
    RunId               INTEGER REFERENCES Runs(RunId)
    );