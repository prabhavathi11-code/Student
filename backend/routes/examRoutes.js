
const express = require("express");
const router = express.Router();
const db = require("../database/database");

router.get("/", (req, res) => {
    const sql = `
        SELECT
            exams.id,
            exams.name,
            exams.class_id,
            classes.name AS class_name,
            exams.subject_id,
            subjects.name AS subject_name,
            subjects.code AS subject_code,
            exams.exam_date,
            exams.max_marks,
            exams.semester
        FROM exams
        JOIN classes ON exams.class_id = classes.id
        JOIN subjects ON exams.subject_id = subjects.id
        ORDER BY exams.exam_date DESC, exams.id DESC
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
            exams.id,
            exams.name,
            exams.class_id,
            classes.name AS class_name,
            exams.subject_id,
            subjects.name AS subject_name,
            subjects.code AS subject_code,
            exams.exam_date,
            exams.max_marks,
            exams.semester
        FROM exams
        JOIN classes ON exams.class_id = classes.id
        JOIN subjects ON exams.subject_id = subjects.id
        WHERE exams.id = ?
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
                message: "Exam not found"
            });
        }

        res.json({
            success: true,
            data: row
        });
    });
});

router.post("/", (req, res) => {
    const {
        name,
        class_id,
        subject_id,
        exam_date,
        max_marks,
        semester
    } = req.body;

    if (!name || !class_id || !subject_id || !exam_date || !semester) {
        return res.status(400).json({
            success: false,
            message: "Name, class, subject, exam date and semester are required"
        });
    }

    const marks = max_marks || 100;

    const sql = `
        INSERT INTO exams
        (name, class_id, subject_id, exam_date, max_marks, semester)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [name, class_id, subject_id, exam_date, marks, semester],
        function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Exam created successfully",
                data: {
                    id: this.lastID,
                    name,
                    class_id,
                    subject_id,
                    exam_date,
                    max_marks: marks,
                    semester
                }
            });
        }
    );
});

router.put("/:id", (req, res) => {
    const {
        name,
        class_id,
        subject_id,
        exam_date,
        max_marks,
        semester
    } = req.body;

    if (!name || !class_id || !subject_id || !exam_date || !semester) {
        return res.status(400).json({
            success: false,
            message: "Name, class, subject, exam date and semester are required"
        });
    }

    const marks = max_marks || 100;

    const sql = `
        UPDATE exams
        SET name = ?,
            class_id = ?,
            subject_id = ?,
            exam_date = ?,
            max_marks = ?,
            semester = ?
        WHERE id = ?
    `;

    db.run(
        sql,
        [
            name,
            class_id,
            subject_id,
            exam_date,
            marks,
            semester,
            req.params.id
        ],
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
                    message: "Exam not found"
                });
            }

            res.json({
                success: true,
                message: "Exam updated successfully"
            });
        }
    );
});

router.delete("/:id", (req, res) => {
    db.run(
        "DELETE FROM exams WHERE id = ?",
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
                    message: "Exam not found"
                });
            }

            res.json({
                success: true,
                message: "Exam deleted successfully"
            });
        }
    );
});

module.exports = router;

