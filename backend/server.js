
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

const db = require("./database/database");

const studentRoutes = require("./routes/studentRoutes");
const classRoutes = require("./routes/classRoutes");
const teachersRoutes = require("./routes/teachersRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const examRoutes = require("./routes/examRoutes");
const marksRoutes = require("./routes/marksRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/teachers", teachersRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/marks", marksRoutes);

// Database schema
const schemaPath = path.join(
  __dirname,
  "database",
  "schema.sql"
);

if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, "utf8");

  db.exec(schema, (err) => {
    if (err) {
      console.error(
        "Database tables creation failed:",
        err.message
      );
    } else {
      console.log(
        "Database tables created successfully."
      );
    }
  });
} else {
  console.error(
    "schema.sql file not found:",
    schemaPath
  );
}

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart School Management API is running",
  });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});

