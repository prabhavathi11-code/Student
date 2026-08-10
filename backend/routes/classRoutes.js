const express = require("express");
const router = express.Router();
const db = require("../database/database");

// ==========================================
// GET ALL CLASSES
// ==========================================
router.get("/", (req, res) => {
  const sql = `
    SELECT *
    FROM classes
    ORDER BY id DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Get classes error:", err.message);

      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json({
      success: true,
      data: rows,
    });
  });
});

// ==========================================
// CREATE CLASS
// ==========================================
router.post("/", (req, res) => {
  const { name, section, academic_year } = req.body;

  if (!name || !section || !academic_year) {
    return res.status(400).json({
      success: false,
      message:
        "Class name, section and academic year are required",
    });
  }

  const sql = `
    INSERT INTO classes
    (name, section, academic_year)
    VALUES (?, ?, ?)
  `;

  db.run(
    sql,
    [name, section, academic_year],
    function (err) {
      if (err) {
        console.error("Create class error:", err.message);

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Class created successfully",
        data: {
          id: this.lastID,
          name,
          section,
          academic_year,
        },
      });
    }
  );
});

// ==========================================
// UPDATE CLASS
// ==========================================
router.put("/:id", (req, res) => {
  const classId = Number(req.params.id);

  const {
    name,
    section,
    academic_year,
  } = req.body;

  if (!classId) {
    return res.status(400).json({
      success: false,
      message: "Invalid class ID",
    });
  }

  if (!name || !section || !academic_year) {
    return res.status(400).json({
      success: false,
      message:
        "Class name, section and academic year are required",
    });
  }

  const sql = `
    UPDATE classes
    SET
      name = ?,
      section = ?,
      academic_year = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [
      name,
      section,
      academic_year,
      classId,
    ],
    function (err) {
      if (err) {
        console.error("Update class error:", err.message);

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      res.json({
        success: true,
        message: "Class updated successfully",
      });
    }
  );
});

// ==========================================
// DELETE CLASS
// ==========================================
router.delete("/:id", (req, res) => {
  const classId = Number(req.params.id);

  if (!classId) {
    return res.status(400).json({
      success: false,
      message: "Invalid class ID",
    });
  }

  // Check whether students are using this class
  const checkStudentsSql = `
    SELECT COUNT(*) AS count
    FROM students
    WHERE class_id = ?
  `;

  db.get(
    checkStudentsSql,
    [classId],
    (checkErr, result) => {
      if (checkErr) {
        console.error(
          "Check students error:",
          checkErr.message
        );

        return res.status(500).json({
          success: false,
          message: "Database error",
        });
      }

      // Students are using this class
      if (result.count > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot delete this class because students are assigned to it.",
        });
      }

      // Delete class
      const deleteSql = `
        DELETE FROM classes
        WHERE id = ?
      `;

      db.run(
        deleteSql,
        [classId],
        function (deleteErr) {
          if (deleteErr) {
            console.error(
              "Delete class error:",
              deleteErr.message
            );

            return res.status(500).json({
              success: false,
              message: deleteErr.message,
            });
          }

          if (this.changes === 0) {
            return res.status(404).json({
              success: false,
              message: "Class not found",
            });
          }

          res.json({
            success: true,
            message: "Class deleted successfully",
          });
        }
      );
    }
  );
});

module.exports = router;