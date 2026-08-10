const db = require("./database");

const sql = `
CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    subject TEXT,
    class_id INTEGER,
    FOREIGN KEY (class_id) REFERENCES classes(id)
)
`;

db.run(sql, (err) => {
    if (err) {
        console.error("Teachers table creation failed:", err.message);
    } else {
        console.log("Teachers table created successfully.");
    }

    db.close();
});