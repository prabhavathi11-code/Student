
const express = require("express");
const router = express.Router();
const db = require("../database/database");

router.get("/", (req, res) => {
    const sql = `
        SELECT
            marks.id,
            marks.exam_id,
            exams.name AS exam_name,
            exams.max_marks,
            marks.student_id,
            students.name AS student_name,
            students.roll_number,
            marks.marks_obtained
        FROM marks
        JOIN exams ON marks.exam_id = exams.id
        JOIN students ON marks.student_id = students.id
        ORDER BY marks.id DESC
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
            marks.id,
            marks.exam_id,
            exams.name AS exam_name,
            exams.max_marks,
            marks.student_id,
            students.name AS student_name,
            students.roll_number,
            marks.marks_obtained
        FROM marks
        JOIN exams ON marks.exam_id = exams.id
        JOIN students ON marks.student_id = students.id
        WHERE marks.id = ?
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
                message: "Mark record not found"
            });
        }

        res.json({
            success: true,
            data: row
        });
    });
});

router.post("/", (req, res) => {
    const { exam_id, student_id, marks_obtained } = req.body;

    if (!exam_id || !student_id || marks_obtained === undefined) {
        return res.status(400).json({
            success: false,
            message: "Exam, student and marks are required"
        });
    }

    const sql = `
        INSERT INTO marks
        (exam_id, student_id, marks_obtained)
        VALUES (?, ?, ?)
    `;

    db.run(
        sql,
        [exam_id, student_id, marks_obtained],
        function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Marks created successfully",
                data: {
                    id: this.lastID,
                    exam_id,
                    student_id,
                    marks_obtained
                }
            });
        }
    );
});

router.put("/:id", (req, res) => {
    const { exam_id, student_id, marks_obtained } = req.body;

    if (!exam_id || !student_id || marks_obtained === undefined) {
        return res.status(400).json({
            success: false,
            message: "Exam, student and marks are required"
        });
    }

    const sql = `
        UPDATE marks
        SET exam_id = ?,
            student_id = ?,
            marks_obtained = ?
        WHERE id = ?
    `;

    db.run(
        sql,
        [exam_id, student_id, marks_obtained, req.params.id],
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
                    message: "Mark record not found"
                });
            }

            res.json({
                success: true,
                message: "Marks updated successfully"
            });
        }
    );
});

router.delete("/:id", (req, res) => {
    db.run(
        "DELETE FROM marks WHERE id = ?",
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
                    message: "Mark record not found"
                });
            }

            res.json({
                success: true,
                message: "Marks deleted successfully"
            });
        }
    );
});

module.exports = router;

