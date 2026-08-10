const express = require("express");
const router = express.Router();
const db = require("../database/database");

// ===============================
// GET ALL TEACHERS
// ===============================
router.get("/", (req, res) => {
    db.all(
        "SELECT * FROM teachers ORDER BY id DESC",
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                data: rows
            });
        }
    );
});


// ===============================
// GET TEACHER BY ID
// ===============================
router.get("/:id", (req, res) => {
    const { id } = req.params;

    db.get(
        "SELECT * FROM teachers WHERE id = ?",
        [id],
        (err, row) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (!row) {
                return res.status(404).json({
                    success: false,
                    message: "Teacher not found"
                });
            }

            res.json({
                success: true,
                data: row
            });
        }
    );
});


// ===============================
// ADD TEACHER
// ===============================
router.post("/", (req, res) => {
    const {
        employee_id,
        name,
        email,
        phone,
        subject
    } = req.body;

    const sql = `
        INSERT INTO teachers
        (employee_id, name, email, phone, subject)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [employee_id, name, email, phone, subject],
        function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                message: "Teacher added successfully",
                id: this.lastID
            });
        }
    );
});


// ===============================
// UPDATE TEACHER
// ===============================
router.put("/:id", (req, res) => {
    const { id } = req.params;

    const {
        employee_id,
        name,
        email,
        phone,
        subject
    } = req.body;

    const sql = `
        UPDATE teachers
        SET employee_id = ?,
            name = ?,
            email = ?,
            phone = ?,
            subject = ?
        WHERE id = ?
    `;

    db.run(
        sql,
        [employee_id, name, email, phone, subject, id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Teacher not found"
                });
            }

            res.json({
                success: true,
                message: "Teacher updated successfully"
            });
        }
    );
});


// ===============================
// DELETE TEACHER
// ===============================
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    db.run(
        "DELETE FROM teachers WHERE id = ?",
        [id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Teacher not found"
                });
            }

            res.json({
                success: true,
                message: "Teacher deleted successfully"
            });
        }
    );
});


module.exports = router;