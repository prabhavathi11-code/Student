import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/teachers";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    employee_id: "",
    name: "",
    email: "",
    phone: "",
  });

  const fetchTeachers = async () => {
    try {
      const response = await fetch(API);
      const result = await response.json();

      setTeachers(result.data || []);
    } catch (error) {
      console.error("Error:", error);
      setMessage("Unable to load teachers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const addTeacher = async (event) => {
    event.preventDefault();

    if (
      !form.employee_id ||
      !form.name ||
      !form.email ||
      !form.phone
    ) {
      setMessage(
        "Employee ID, name, email and phone are required."
      );
      return;
    }

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.message || "Failed to add teacher."
        );
        return;
      }

      setMessage("Teacher added successfully.");

      setForm({
        employee_id: "",
        name: "",
        email: "",
        phone: "",
      });

      fetchTeachers();
    } catch (error) {
      console.error("Error:", error);
      setMessage("Server error.");
    }
  };

  const deleteTeacher = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this teacher?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.message || "Failed to delete teacher."
        );
        return;
      }

      setMessage("Teacher deleted successfully.");

      fetchTeachers();
    } catch (error) {
      console.error("Error:", error);
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
      <h1>Teachers</h1>

      <p
        style={{
          color: "#6b7280",
          marginBottom: "25px",
        }}
      >
        Manage school teachers.
      </p>

      {/* Add Teacher */}
      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "14px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          marginBottom: "25px",
        }}
      >
        <h2>Add Teacher</h2>

        <form
          onSubmit={addTeacher}
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            marginTop: "20px",
          }}
        >
          <input
            type="text"
            name="employee_id"
            placeholder="Employee ID"
            value={form.employee_id}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="text"
            name="name"
            placeholder="Teacher name"
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone number"
            value={form.phone}
            onChange={handleChange}
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle}>
            + Add Teacher
          </button>
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

      {/* Teacher List */}
      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "14px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          overflowX: "auto",
        }}
      >
        <h2>Teacher List</h2>

        {loading ? (
          <p>Loading teachers...</p>
        ) : teachers.length === 0 ? (
          <p>No teachers found.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
            }}
          >
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={cellStyle}>ID</th>
                <th style={cellStyle}>Employee ID</th>
                <th style={cellStyle}>Name</th>
                <th style={cellStyle}>Email</th>
                <th style={cellStyle}>Phone</th>
                <th style={cellStyle}>Action</th>
              </tr>
            </thead>

            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td style={cellStyle}>
                    {teacher.id}
                  </td>

                  <td style={cellStyle}>
                    {teacher.employee_id}
                  </td>

                  <td style={cellStyle}>
                    {teacher.name}
                  </td>

                  <td style={cellStyle}>
                    {teacher.email}
                  </td>

                  <td style={cellStyle}>
                    {teacher.phone}
                  </td>

                  <td style={cellStyle}>
                    <button
                      onClick={() =>
                        deleteTeacher(teacher.id)
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

export default Teachers;