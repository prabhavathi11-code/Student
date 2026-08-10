
import { useEffect, useState } from "react";

const ATTENDANCE_API = "http://localhost:5000/api/attendance";
const STUDENTS_API = "http://localhost:5000/api/students";

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    student_id: "",
    class_id: "",
    date: new Date().toISOString().split("T")[0],
    status: "present",
  });

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const response = await fetch(ATTENDANCE_API);
      const result = await response.json();

      setAttendance(result.data || []);
    } catch (error) {
      console.error("Attendance error:", error);
      setMessage("Unable to load attendance.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(STUDENTS_API);
      const result = await response.json();

      setStudents(result.data || []);
    } catch (error) {
      console.error("Students error:", error);
      setMessage("Unable to load students.");
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchStudents();
  }, []);

  const handleStudentChange = (event) => {
    const studentId = event.target.value;

    const selectedStudent = students.find(
      (student) => String(student.id) === String(studentId)
    );

    setForm({
      ...form,
      student_id: studentId,
      class_id: selectedStudent?.class_id || "",
    });
  };

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const addAttendance = async (event) => {
    event.preventDefault();

    if (
      !form.student_id ||
      !form.class_id ||
      !form.date ||
      !form.status
    ) {
      setMessage("Please select a student and fill all fields.");
      return;
    }

    try {
      const response = await fetch(ATTENDANCE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: Number(form.student_id),
          class_id: Number(form.class_id),
          date: form.date,
          status: form.status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (
          result.message &&
          result.message.toLowerCase().includes("unique")
        ) {
          setMessage(
            "Attendance already exists for this student on this date."
          );
        } else {
          setMessage(
            result.message || "Failed to create attendance."
          );
        }

        return;
      }

      setMessage("Attendance created successfully.");

      setForm({
        student_id: "",
        class_id: "",
        date: new Date().toISOString().split("T")[0],
        status: "present",
      });

      fetchAttendance();
    } catch (error) {
      console.error("Error:", error);
      setMessage("Server error.");
    }
  };

  const deleteAttendance = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this attendance record?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${ATTENDANCE_API}/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.message ||
            "Failed to delete attendance."
        );
        return;
      }

      setMessage("Attendance deleted successfully.");

      fetchAttendance();
    } catch (error) {
      console.error("Error:", error);
      setMessage("Server error.");
    }
  };

  const selectedStudent = students.find(
    (student) =>
      String(student.id) === String(form.student_id)
  );

  return (
    <div
      style={{
        padding: "35px",
        maxWidth: "1200px",
        margin: "auto",
      }}
    >
      <h1>Attendance</h1>

      <p
        style={{
          color: "#6b7280",
          marginBottom: "25px",
        }}
      >
        Manage student attendance records.
      </p>

      {/* Mark Attendance */}
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
        <h2 style={{ marginBottom: "20px" }}>
          Mark Attendance
        </h2>

        <form
          onSubmit={addAttendance}
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          {/* Student */}
          <select
            name="student_id"
            value={form.student_id}
            onChange={handleStudentChange}
            style={inputStyle}
          >
            <option value="">
              Select Student
            </option>

            {students.map((student) => (
              <option
                key={student.id}
                value={student.id}
              >
                {student.name} - {student.roll_number}
              </option>
            ))}
          </select>

          {/* Automatically selected class */}
          <input
            type="text"
            value={
              selectedStudent?.class_name ||
              selectedStudent?.class_id ||
              ""
            }
            placeholder="Student class"
            readOnly
            style={{
              ...inputStyle,
              background: "#f3f4f6",
            }}
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            style={inputStyle}
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="present">
              Present
            </option>

            <option value="absent">
              Absent
            </option>
          </select>

          <button
            type="submit"
            style={buttonStyle}
          >
            + Mark Attendance
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

      {/* Attendance Records */}
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
        <h2 style={{ marginBottom: "20px" }}>
          Attendance Records
        </h2>

        {loading ? (
          <p>Loading attendance...</p>
        ) : attendance.length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f3f4f6",
                }}
              >
                <th style={cellStyle}>ID</th>
                <th style={cellStyle}>
                  Student
                </th>
                <th style={cellStyle}>
                  Roll Number
                </th>
                <th style={cellStyle}>
                  Class
                </th>
                <th style={cellStyle}>
                  Date
                </th>
                <th style={cellStyle}>
                  Status
                </th>
                <th style={cellStyle}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {attendance.map((item) => (
                <tr key={item.id}>
                  <td style={cellStyle}>
                    {item.id}
                  </td>

                  <td style={cellStyle}>
                    {item.student_name}
                  </td>

                  <td style={cellStyle}>
                    {item.roll_number}
                  </td>

                  <td style={cellStyle}>
                    {item.class_name ||
                      item.class_id ||
                      "-"}
                  </td>

                  <td style={cellStyle}>
                    {item.date}
                  </td>

                  <td style={cellStyle}>
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: "20px",
                        background:
                          item.status === "present"
                            ? "#dcfce7"
                            : "#fee2e2",
                        color:
                          item.status === "present"
                            ? "#166534"
                            : "#991b1b",
                        fontWeight: "bold",
                      }}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td style={cellStyle}>
                    <button
                      onClick={() =>
                        deleteAttendance(
                          item.id
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
  minWidth: "190px",
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

export default Attendance;

