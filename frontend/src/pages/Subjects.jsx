
import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/subjects";
const CLASSES_API = "http://localhost:5000/api/classes";

function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [form, setForm] = useState({
        name: "",
        code: "",
        class_id: "",
    });

    const [editingId, setEditingId] = useState(null);

    // ===============================
    // FETCH SUBJECTS
    // ===============================
    const fetchSubjects = async () => {
        try {
            const response = await fetch(API);
            const result = await response.json();

            setSubjects(result.data || []);
        } catch (error) {
            console.error("Subjects error:", error);
            setMessage("Unable to load subjects.");
        } finally {
            setLoading(false);
        }
    };

    // ===============================
    // FETCH CLASSES
    // ===============================
    const fetchClasses = async () => {
        try {
            const response = await fetch(CLASSES_API);
            const result = await response.json();

            setClasses(result.data || []);
        } catch (error) {
            console.error("Classes error:", error);
        }
    };

    useEffect(() => {
        fetchSubjects();
        fetchClasses();
    }, []);

    // ===============================
    // HANDLE INPUT
    // ===============================
    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    };

    // ===============================
    // ADD / UPDATE SUBJECT
    // ===============================
    const saveSubject = async (event) => {
        event.preventDefault();

        if (!form.name || !form.code || !form.class_id) {
            setMessage(
                "Please enter subject name, code and class."
            );
            return;
        }

        try {
            const url = editingId
                ? `${API}/${editingId}`
                : API;

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: form.name,
                    code: form.code,
                    class_id: Number(form.class_id),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setMessage(
                    result.message ||
                    "Failed to save subject."
                );
                return;
            }

            setMessage(
                editingId
                    ? "Subject updated successfully."
                    : "Subject added successfully."
            );

            setForm({
                name: "",
                code: "",
                class_id: "",
            });

            setEditingId(null);

            fetchSubjects();
        } catch (error) {
            console.error("Subject save error:", error);
            setMessage("Server error.");
        }
    };

    // ===============================
    // EDIT SUBJECT
    // ===============================
    const editSubject = (subject) => {
        setEditingId(subject.id);

        setForm({
            name: subject.name,
            code: subject.code,
            class_id: String(subject.class_id),
        });

        setMessage("");
    };

    // ===============================
    // CANCEL EDIT
    // ===============================
    const cancelEdit = () => {
        setEditingId(null);

        setForm({
            name: "",
            code: "",
            class_id: "",
        });

        setMessage("");
    };

    // ===============================
    // DELETE SUBJECT
    // ===============================
    const deleteSubject = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this subject?"
        );

        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${API}/${id}`,
                {
                    method: "DELETE",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setMessage(
                    result.message ||
                    "Failed to delete subject."
                );
                return;
            }

            setMessage(
                "Subject deleted successfully."
            );

            fetchSubjects();
        } catch (error) {
            console.error("Delete error:", error);
            setMessage("Server error.");
        }
    };

    return (
        <div
            style={{
                padding: "35px",
                maxWidth: "1200px",
                margin: "auto",
            }}
        >
            <h1>Subjects</h1>

            <p
                style={{
                    color: "#6b7280",
                    marginBottom: "25px",
                }}
            >
                Manage school subjects.
            </p>

            {/* ADD / EDIT SUBJECT */}
            <div style={cardStyle}>
                <h2>
                    {editingId
                        ? "Edit Subject"
                        : "Add Subject"}
                </h2>

                <form
                    onSubmit={saveSubject}
                    style={formStyle}
                >
                    <input
                        type="text"
                        name="name"
                        placeholder="Subject name"
                        value={form.name}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <input
                        type="text"
                        name="code"
                        placeholder="Subject code"
                        value={form.code}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <select
                        name="class_id"
                        value={form.class_id}
                        onChange={handleChange}
                        style={inputStyle}
                    >
                        <option value="">
                            Select Class
                        </option>

                        {classes.map((item) => (
                            <option
                                key={item.id}
                                value={item.id}
                            >
                                {item.name}
                                {item.section
                                    ? ` - Section ${item.section}`
                                    : ""}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        style={buttonStyle}
                    >
                        {editingId
                            ? "Update Subject"
                            : "+ Add Subject"}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            onClick={cancelEdit}
                            style={cancelButtonStyle}
                        >
                            Cancel
                        </button>
                    )}
                </form>

                {message && (
                    <p
                        style={{
                            marginTop: "15px",
                            color: "#1e3a8a",
                            fontWeight: "500",
                        }}
                    >
                        {message}
                    </p>
                )}
            </div>

            {/* SUBJECT LIST */}
            <div style={cardStyle}>
                <h2>Subject List</h2>

                {loading ? (
                    <p>Loading subjects...</p>
                ) : subjects.length === 0 ? (
                    <p>No subjects found.</p>
                ) : (
                    <table
                        style={{
                            width: "100%",
                            borderCollapse:
                                "collapse",
                            marginTop: "20px",
                        }}
                    >
                        <thead>
                            <tr
                                style={{
                                    background:
                                        "#f3f4f6",
                                }}
                            >
                                <th style={cellStyle}>
                                    ID
                                </th>

                                <th style={cellStyle}>
                                    Subject Name
                                </th>

                                <th style={cellStyle}>
                                    Code
                                </th>

                                <th style={cellStyle}>
                                    Class
                                </th>

                                <th style={cellStyle}>
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {subjects.map(
                                (subject) => (
                                    <tr
                                        key={
                                            subject.id
                                        }
                                    >
                                        <td
                                            style={
                                                cellStyle
                                            }
                                        >
                                            {
                                                subject.id
                                            }
                                        </td>

                                        <td
                                            style={
                                                cellStyle
                                            }
                                        >
                                            {
                                                subject.name
                                            }
                                        </td>

                                        <td
                                            style={
                                                cellStyle
                                            }
                                        >
                                            {
                                                subject.code
                                            }
                                        </td>

                                        <td
                                            style={
                                                cellStyle
                                            }
                                        >
                                            {subject.class_name ||
                                                subject.class_id ||
                                                "-"}
                                        </td>

                                        <td
                                            style={
                                                cellStyle
                                            }
                                        >
                                            <button
                                                onClick={() =>
                                                    editSubject(
                                                        subject
                                                    )
                                                }
                                                style={
                                                    editButtonStyle
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() =>
                                                    deleteSubject(
                                                        subject.id
                                                    )
                                                }
                                                style={
                                                    deleteButtonStyle
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

// ===============================
// STYLES
// ===============================

const cardStyle = {
    background: "white",
    padding: "25px",
    borderRadius: "14px",
    boxShadow:
        "0 4px 15px rgba(0,0,0,0.08)",
    marginBottom: "25px",
    overflowX: "auto",
};

const formStyle = {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    marginTop: "20px",
};

const inputStyle = {
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    minWidth: "220px",
    fontSize: "14px",
    background: "white",
};

const buttonStyle = {
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    background: "#1e3a8a",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
};

const editButtonStyle = {
    padding: "8px 14px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    marginRight: "8px",
};

const deleteButtonStyle = {
    padding: "8px 14px",
    border: "none",
    borderRadius: "6px",
    background: "#dc2626",
    color: "white",
    cursor: "pointer",
};

const cancelButtonStyle = {
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    background: "#6b7280",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
};

const cellStyle = {
    padding: "14px",
    borderBottom: "1px solid #e5e7eb",
    textAlign: "left",
};

export default Subjects;
