
const express = require("express");
const router = express.Router();
const db = require("../database/database");


router.get("/", (req, res) => {
    const sql = `
        SELECT
            subjects.id,
            subjects.name,
            subjects.code,
            subjects.class_id,
            classes.name AS class_name,
            subjects.created_at
        FROM subjects
        LEFT JOIN classes
            ON subjects.class_id = classes.id
        ORDER BY subjects.id DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error fetching subjects:", err.message);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch subjects",
                error: err.message
            });
        }

        res.json({
            success: true,
            data: rows
        });
    });
});

// ===============================
// GET SUBJECT BY ID
// ===============================
router.get("/:id", (req, res) => {
    const sql = `
        SELECT
            id,
            name,
            code,
            class_id,
            created_at
        FROM subjects
        WHERE id = ?
    `;

    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            console.error("Error fetching subject:", err.message);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch subject",
                error: err.message
            });
        }

        if (!row) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        res.json({
            success: true,
            data: row
        });
    });
});

// ===============================
// ADD SUBJECT
// ===============================
router.post("/", (req, res) => {
    const { name, code, class_id } = req.body;

    if (!name || !code || !class_id) {
        return res.status(400).json({
            success: false,
            message: "Name, code and class are required"
        });
    }

    const sql = `
        INSERT INTO subjects (name, code, class_id)
        VALUES (?, ?, ?)
    `;

    db.run(
        sql,
        [name, code, Number(class_id)],
        function (err) {
            if (err) {
                console.error("Error creating subject:", err.message);

                return res.status(500).json({
                    success: false,
                    message: "Failed to create subject",
                    error: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Subject created successfully",
                data: {
                    id: this.lastID,
                    name,
                    code,
                    class_id: Number(class_id)
                }
            });
        }
    );
});

// ===============================
// UPDATE SUBJECT
// ===============================
router.put("/:id", (req, res) => {
    const { name, code, class_id } = req.body;
    const id = Number(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Invalid subject ID"
        });
    }

    if (!name || !code || !class_id) {
        return res.status(400).json({
            success: false,
            message: "Name, code and class are required"
        });
    }

    const sql = `
        UPDATE subjects
        SET name = ?, code = ?, class_id = ?
        WHERE id = ?
    `;

    db.run(
        sql,
        [name, code, Number(class_id), id],
        function (err) {
            if (err) {
                console.error("Error updating subject:", err.message);

                return res.status(500).json({
                    success: false,
                    message: "Failed to update subject",
                    error: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Subject not found"
                });
            }

            res.json({
                success: true,
                message: "Subject updated successfully"
            });
        }
    );
});

// ===============================
// DELETE SUBJECT
// ===============================
router.delete("/:id", (req, res) => {
    const id = Number(req.params.id);

    const sql = `
        DELETE FROM subjects
        WHERE id = ?
    `;

    db.run(sql, [id], function (err) {
        if (err) {
            console.error("Error deleting subject:", err.message);

            return res.status(500).json({
                success: false,
                message: "Failed to delete subject",
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        res.json({
            success: true,
            message: "Subject deleted successfully"
        });
    });
});

module.exports = router;

