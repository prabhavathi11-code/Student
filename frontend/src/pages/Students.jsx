
import { useEffect, useState } from "react";

const STUDENTS_API = "http://localhost:5000/api/students";
const CLASSES_API = "http://localhost:5000/api/classes";

function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    roll_number: "",
    class_id: "",
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await fetch(STUDENTS_API);
      const result = await response.json();

      setStudents(result.data || []);
    } catch (error) {
      console.error("Students error:", error);
      setMessage("Unable to load students.");
    } finally {
      setLoading(false);
    }
  };

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
    fetchStudents();
    fetchClasses();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });

    setMessage("");
  };

  const saveStudent = async (event) => {
    event.preventDefault();

    if (
      !form.name ||
      !form.roll_number ||
      !form.class_id
    ) {
      setMessage(
        "Name, roll number and class are required."
      );
      return;
    }

    try {
      const url = editingId
        ? `${STUDENTS_API}/${editingId}`
        : STUDENTS_API;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          roll_number: form.roll_number,
          class_id: Number(form.class_id),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.message ||
            "Failed to save student."
        );
        return;
      }

      setMessage(
        editingId
          ? "Student updated successfully."
          : "Student added successfully."
      );

      setForm({
        name: "",
        roll_number: "",
        class_id: "",
      });

      setEditingId(null);

      fetchStudents();
    } catch (error) {
      console.error("Save student error:", error);
      setMessage("Server error.");
    }
  };

  const editStudent = (student) => {
    setEditingId(student.id);

    setForm({
      name: student.name || "",
      roll_number: student.roll_number || "",
      class_id: String(
        student.class_id || ""
      ),
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);

    setForm({
      name: "",
      roll_number: "",
      class_id: "",
    });

    setMessage("");
  };

  const deleteStudent = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${STUDENTS_API}/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.message ||
            "Failed to delete student."
        );
        return;
      }

      setMessage(
        "Student deleted successfully."
      );

      fetchStudents();
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
      <h1>Students</h1>

      <p
        style={{
          color: "#6b7280",
          marginBottom: "25px",
        }}
      >
        Manage school students.
      </p>

      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "14px",
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.08)",
          marginBottom: "25px",
        }}
      >
        <h2>
          {editingId
            ? "Edit Student"
            : "Add Student"}
        </h2>

        <form
          onSubmit={saveStudent}
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            marginTop: "20px",
          }}
        >
          <input
            type="text"
            name="name"
            placeholder="Student name"
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="text"
            name="roll_number"
            placeholder="Roll number"
            value={form.roll_number}
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
              </option>
            ))}
          </select>

          <button
            type="submit"
            style={buttonStyle}
          >
            {editingId
              ? "Update Student"
              : "+ Add Student"}
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
              color: message.includes(
                "successfully"
              )
                ? "#166534"
                : "#991b1b",
              fontWeight: "500",
            }}
          >
            {message}
          </p>
        )}
      </div>

      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "14px",
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.08)",
          overflowX: "auto",
        }}
      >
        <h2>Student List</h2>

        {loading ? (
          <p>Loading students...</p>
        ) : students.length === 0 ? (
          <p>No students found.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f3f4f6",
                }}
              >
                <th style={cellStyle}>
                  ID
                </th>

                <th style={cellStyle}>
                  Name
                </th>

                <th style={cellStyle}>
                  Roll Number
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
              {students.map((student) => (
                <tr key={student.id}>
                  <td style={cellStyle}>
                    {student.id}
                  </td>

                  <td style={cellStyle}>
                    {student.name}
                  </td>

                  <td style={cellStyle}>
                    {student.roll_number}
                  </td>

                  <td style={cellStyle}>
                    {student.class_name ||
                      student.class_id ||
                      "-"}
                  </td>

                  <td style={cellStyle}>
                    <button
                      onClick={() =>
                        editStudent(student)
                      }
                      style={editButtonStyle}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteStudent(
                          student.id
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  minWidth: "200px",
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

export default Students;

