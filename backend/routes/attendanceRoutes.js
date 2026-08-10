
const express = require("express");
const router = express.Router();
const db = require("../database/database");

router.get("/", (req, res) => {
    const sql = `
        SELECT
            attendance.id,
            attendance.student_id,
            students.name AS student_name,
            students.roll_number,
            attendance.class_id,
            classes.name AS class_name,
            attendance.date,
            attendance.status
        FROM attendance
        JOIN students ON attendance.student_id = students.id
        JOIN classes ON attendance.class_id = classes.id
        ORDER BY attendance.date DESC, attendance.id DESC
    `;

    db.all(sql, [], (err, rows) => {
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
    });
});

router.get("/:id", (req, res) => {
    const sql = `
        SELECT
            attendance.id,
            attendance.student_id,
            students.name AS student_name,
            students.roll_number,
            attendance.class_id,
            classes.name AS class_name,
            attendance.date,
            attendance.status
        FROM attendance
        JOIN students ON attendance.student_id = students.id
        JOIN classes ON attendance.class_id = classes.id
        WHERE attendance.id = ?
    `;

    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!row) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found"
            });
        }

        res.json({
            success: true,
            data: row
        });
    });
});

router.post("/", (req, res) => {
    const { student_id, class_id, date, status } = req.body;

    if (!student_id || !class_id || !date || !status) {
        return res.status(400).json({
            success: false,
            message: "Student, class, date and status are required"
        });
    }

    const normalizedStatus = status.toLowerCase();

    if (!["present", "absent"].includes(normalizedStatus)) {
        return res.status(400).json({
            success: false,
            message: "Status must be present or absent"
        });
    }

    const sql = `
        INSERT INTO attendance
        (student_id, class_id, date, status)
        VALUES (?, ?, ?, ?)
    `;

    db.run(
        sql,
        [student_id, class_id, date, normalizedStatus],
        function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Attendance created successfully",
                data: {
                    id: this.lastID,
                    student_id,
                    class_id,
                    date,
                    status: normalizedStatus
                }
            });
        }
    );
});

router.put("/:id", (req, res) => {
    const { student_id, class_id, date, status } = req.body;

    if (!student_id || !class_id || !date || !status) {
        return res.status(400).json({
            success: false,
            message: "Student, class, date and status are required"
        });
    }

    const normalizedStatus = status.toLowerCase();

    if (!["present", "absent"].includes(normalizedStatus)) {
        return res.status(400).json({
            success: false,
            message: "Status must be present or absent"
        });
    }

    const sql = `
        UPDATE attendance
        SET student_id = ?, class_id = ?, date = ?, status = ?
        WHERE id = ?
    `;

    db.run(
        sql,
        [student_id, class_id, date, normalizedStatus, req.params.id],
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
                    message: "Attendance record not found"
                });
            }

            res.json({
                success: true,
                message: "Attendance updated successfully"
            });
        }
    );
});

router.delete("/:id", (req, res) => {
    db.run(
        "DELETE FROM attendance WHERE id = ?",
        [req.params.id],
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
                    message: "Attendance record not found"
                });
            }

            res.json({
                success: true,
                message: "Attendance deleted successfully"
            });
        }
    );
});

module.exports = router;

