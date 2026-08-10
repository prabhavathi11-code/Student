const express = require("express");
const router = express.Router();

const db = require("../database/database");

// GET ALL STUDENTS
router.get("/", (req, res) => {
  const sql = `
    SELECT
      students.id,
      students.name,
      students.roll_number,
      students.class_id,
      classes.name AS class_name
    FROM students
    LEFT JOIN classes
      ON students.class_id = classes.id
    ORDER BY students.id DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Get students error:", err.message);

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

// ADD STUDENT
router.post("/", (req, res) => {
  const { name, roll_number, class_id } = req.body;

  if (!name || !roll_number || !class_id) {
    return res.status(400).json({
      success: false,
      message: "Name, roll number and class are required.",
    });
  }

  const sql = `
    INSERT INTO students
    (name, roll_number, class_id)
    VALUES (?, ?, ?)
  `;

  db.run(
    sql,
    [name, roll_number, Number(class_id)],
    function (err) {
      if (err) {
        console.error("Add student error:", err.message);

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Student added successfully.",
        data: {
          id: this.lastID,
        },
      });
    }
  );
});

// UPDATE STUDENT
router.put("/:id", (req, res) => {
  const studentId = Number(req.params.id);

  const {
    name,
    roll_number,
    class_id,
  } = req.body;

  if (
    !name ||
    !roll_number ||
    !class_id
  ) {
    return res.status(400).json({
      success: false,
      message: "Name, roll number and class are required.",
    });
  }

  const checkStudentSql = `
    SELECT id
    FROM students
    WHERE id = ?
  `;

  db.get(
    checkStudentSql,
    [studentId],
    (checkErr, student) => {
      if (checkErr) {
        console.error(
          "Check student error:",
          checkErr.message
        );

        return res.status(500).json({
          success: false,
          message: checkErr.message,
        });
      }

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found.",
        });
      }

      const checkClassSql = `
        SELECT id
        FROM classes
        WHERE id = ?
      `;

      db.get(
        checkClassSql,
        [Number(class_id)],
        (classErr, classRow) => {
          if (classErr) {
            console.error(
              "Check class error:",
              classErr.message
            );

            return res.status(500).json({
              success: false,
              message: classErr.message,
            });
          }

          if (!classRow) {
            return res.status(400).json({
              success: false,
              message: "Selected class does not exist.",
            });
          }

          const updateSql = `
            UPDATE students
            SET
              name = ?,
              roll_number = ?,
              class_id = ?
            WHERE id = ?
          `;

          db.run(
            updateSql,
            [
              name,
              roll_number,
              Number(class_id),
              studentId,
            ],
            function (updateErr) {
              if (updateErr) {
                console.error(
                  "Update student error:",
                  updateErr.message
                );

                return res.status(500).json({
                  success: false,
                  message: updateErr.message,
                });
              }

              res.json({
                success: true,
                message: "Student updated successfully.",
              });
            }
          );
        }
      );
    }
  );
});

// DELETE STUDENT
router.delete("/:id", (req, res) => {
  const studentId = Number(req.params.id);

  const sql = `
    DELETE FROM students
    WHERE id = ?
  `;

  db.run(
    sql,
    [studentId],
    function (err) {
      if (err) {
        console.error(
          "Delete student error:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: "Student not found.",
        });
      }

      res.json({
        success: true,
        message: "Student deleted successfully.",
      });
    }
  );
});

module.exports = router;