
const express = require("express");
const router = express.Router();
const db = require("../database/database");

router.get("/", (req, res) => {
  db.all(
    "SELECT * FROM teachers ORDER BY id DESC",
    [],
    (err, rows) => {
      if (err) {
        console.error("Get teachers error:", err.message);

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json({
        success: true,
        data: rows,
      });
    }
  );
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.get(
    "SELECT * FROM teachers WHERE id = ?",
    [id],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      res.json({
        success: true,
        data: row,
      });
    }
  );
});

router.post("/", (req, res) => {
  const {
    employee_id,
    name,
    email,
    phone,
  } = req.body;

  if (!employee_id || !name || !email || !phone) {
    return res.status(400).json({
      success: false,
      message:
        "Employee ID, name, email and phone are required.",
    });
  }

  const sql = `
    INSERT INTO teachers
    (employee_id, name, email, phone)
    VALUES (?, ?, ?, ?)
  `;

  db.run(
    sql,
    [employee_id, name, email, phone],
    function (err) {
      if (err) {
        console.error("Create teacher error:", err.message);

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Teacher added successfully.",
        data: {
          id: this.lastID,
          employee_id,
          name,
          email,
          phone,
        },
      });
    }
  );
});

router.put("/:id", (req, res) => {
  const { id } = req.params;

  const {
    employee_id,
    name,
    email,
    phone,
  } = req.body;

  if (!employee_id || !name || !email || !phone) {
    return res.status(400).json({
      success: false,
      message:
        "Employee ID, name, email and phone are required.",
    });
  }

  const sql = `
    UPDATE teachers
    SET
      employee_id = ?,
      name = ?,
      email = ?,
      phone = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [employee_id, name, email, phone, id],
    function (err) {
      if (err) {
        console.error("Update teacher error:", err.message);

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found.",
        });
      }

      res.json({
        success: true,
        message: "Teacher updated successfully.",
      });
    }
  );
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run(
    "DELETE FROM teachers WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        console.error("Delete teacher error:", err.message);

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found.",
        });
      }

      res.json({
        success: true,
        message: "Teacher deleted successfully.",
      });
    }
  );
});

module.exports = router;

