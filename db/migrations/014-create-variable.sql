CREATE TABLE IF NOT EXISTS VarVal(
        id                 INTEGER PRIMARY KEY autoincrement,
        VariableId         TEXT,
        VariableName       TEXT,
        Category           TEXT,
        ValueId            TEXT,
        ValueName          TEXT,
        IsSubcategory      INTEGER
        );
