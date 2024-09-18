CREATE TABLE IF NOT EXISTS VarVal(
        id                 INTEGER PRIMARY KEY autoincrement,
        VariableId         TEXT,
        VariableName       TEXT,
        GameId             INTEGER,
        CategorySrcId      TEXT,
        ValueId            TEXT,
        ValueName          TEXT,
        IsSubcategory      INTEGER
        );
