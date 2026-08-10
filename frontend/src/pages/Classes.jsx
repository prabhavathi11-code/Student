
import { useEffect, useState } from "react";

const API =
  "https://student-backend-hxpt.onrender.com/api/classes";

function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    section: "",
    academic_year: "",
  });

  const fetchClasses = async () => {
    try {
      setLoading(true);

      const response = await fetch(API);
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Failed to load classes.");
        return;
      }

      setClasses(result.data || []);
    } catch (error) {
      console.error("Fetch classes error:", error);
      setMessage("Unable to load classes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });

    setMessage("");
  };

  const addClass = async (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.section.trim() ||
      !form.academic_year.trim()
    ) {
      setMessage(
        "Class name, section and academic year are required."
      );
      return;
    }

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          section: form.section.trim(),
          academic_year: form.academic_year.trim(),
        }),
      });

      const result = await response.json();

      console.log("Add class response:", result);

      if (!response.ok) {
        setMessage(
          result.message || "Failed to add class."
        );
        return;
      }

      setMessage("Class added successfully.");

      setForm({
        name: "",
        section: "",
        academic_year: "",
      });

      await fetchClasses();
    } catch (error) {
      console.error("Add class error:", error);
      setMessage(
        "Server error. Please check the backend."
      );
    }
  };

  const deleteClass = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this class?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.message || "Failed to delete class."
        );
        return;
      }

      setMessage("Class deleted successfully.");

      await fetchClasses();
    } catch (error) {
      console.error("Delete class error:", error);
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
      <h1>Classes</h1>

      <p
        style={{
          color: "#6b7280",
          marginBottom: "25px",
        }}
      >
        Manage school classes.
      </p>

      {/* Add Class */}
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
        <h2>Add Class</h2>

        <form
          onSubmit={addClass}
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
            placeholder="Class name"
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="text"
            name="section"
            placeholder="Section"
            value={form.section}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="text"
            name="academic_year"
            placeholder="Academic year (e.g. 2026-2027)"
            value={form.academic_year}
            onChange={handleChange}
            style={inputStyle}
          />

          <button
            type="submit"
            style={buttonStyle}
          >
            + Add Class
          </button>
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

      {/* Class List */}
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
        <h2>Class List</h2>

        {loading ? (
          <p>Loading classes...</p>
        ) : classes.length === 0 ? (
          <p>No classes found.</p>
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
                  Class Name
                </th>

                <th style={cellStyle}>
                  Section
                </th>

                <th style={cellStyle}>
                  Academic Year
                </th>

                <th style={cellStyle}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {classes.map((item) => (
                <tr key={item.id}>
                  <td style={cellStyle}>
                    {item.id}
                  </td>

                  <td style={cellStyle}>
                    {item.name}
                  </td>

                  <td style={cellStyle}>
                    {item.section || "-"}
                  </td>

                  <td style={cellStyle}>
                    {item.academic_year || "-"}
                  </td>

                  <td style={cellStyle}>
                    <button
                      onClick={() =>
                        deleteClass(item.id)
                      }
                      style={deleteButtonStyle}
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

const deleteButtonStyle = {
  padding: "8px 14px",
  border: "none",
  borderRadius: "6px",
  background: "#dc2626",
  color: "white",
  cursor: "pointer",
};

const cellStyle = {
  padding: "14px",
  borderBottom: "1px solid #e5e7eb",
  textAlign: "left",
};

export default Classes;

