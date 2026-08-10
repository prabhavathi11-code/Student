
import { useEffect, useState } from "react";

const MARKS_API = "http://localhost:5000/api/marks";
const EXAMS_API = "http://localhost:5000/api/exams";
const STUDENTS_API = "http://localhost:5000/api/students";

function Marks() {
  const [marks, setMarks] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    exam_id: "",
    student_id: "",
    marks_obtained: "",
  });

  const fetchMarks = async () => {
    try {
      setLoading(true);

      const response = await fetch(MARKS_API);
      const result = await response.json();

      setMarks(result.data || []);
    } catch (error) {
      console.error("Marks error:", error);
      setMessage("Unable to load marks.");
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await fetch(EXAMS_API);
      const result = await response.json();

      setExams(result.data || []);
    } catch (error) {
      console.error("Exams error:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(STUDENTS_API);
      const result = await response.json();

      setStudents(result.data || []);
    } catch (error) {
      console.error("Students error:", error);
    }
  };

  useEffect(() => {
    fetchMarks();
    fetchExams();
    fetchStudents();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });

    setMessage("");
  };

  const addMarks = async (event) => {
    event.preventDefault();

    if (
      !form.exam_id ||
      !form.student_id ||
      form.marks_obtained === ""
    ) {
      setMessage("Please fill all marks fields.");
      return;
    }

    const marksValue = Number(form.marks_obtained);

    if (!Number.isInteger(marksValue)) {
      setMessage("Marks must be a whole number.");
      return;
    }

    if (marksValue < 0) {
      setMessage("Marks cannot be negative.");
      return;
    }

    const selectedExam = exams.find(
      (exam) => Number(exam.id) === Number(form.exam_id)
    );

    if (!selectedExam) {
      setMessage("Please select a valid exam.");
      return;
    }

    const maxMarks = Number(selectedExam.max_marks);

    if (marksValue > maxMarks) {
      setMessage(`Marks cannot be greater than ${maxMarks}.`);
      return;
    }

    try {
      const response = await fetch(MARKS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exam_id: Number(form.exam_id),
          student_id: Number(form.student_id),
          marks_obtained: marksValue,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (
          result.message &&
          result.message.includes("UNIQUE constraint")
        ) {
          setMessage(
            "Marks already exist for this student and exam."
          );
        } else {
          setMessage(
            result.message || "Failed to add marks."
          );
        }

        return;
      }

      setMessage("Marks added successfully.");

      setForm({
        exam_id: "",
        student_id: "",
        marks_obtained: "",
      });

      fetchMarks();
    } catch (error) {
      console.error("Error:", error);
      setMessage("Server error. Please check the backend.");
    }
  };

  const deleteMarks = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete these marks?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${MARKS_API}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.message || "Failed to delete marks."
        );
        return;
      }

      setMessage("Marks deleted successfully.");

      fetchMarks();
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
      <h1>Marks</h1>

      <p
        style={{
          color: "#6b7280",
          marginBottom: "25px",
        }}
      >
        Manage student examination marks.
      </p>

      {/* Enter Marks */}
      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "14px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          marginBottom: "25px",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>
          Enter Marks
        </h2>

        <form
          onSubmit={addMarks}
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "15px",
          }}
        >
          <select
            name="exam_id"
            value={form.exam_id}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Select Exam</option>

            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name} - Max {exam.max_marks}
              </option>
            ))}
          </select>

          <select
            name="student_id"
            value={form.student_id}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Select Student</option>

            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} - {student.roll_number}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="marks_obtained"
            placeholder="Marks obtained"
            value={form.marks_obtained}
            onChange={handleChange}
            min="0"
            step="1"
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle}>
            + Add Marks
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "15px",
              color: message.includes("successfully")
                ? "#166534"
                : "#991b1b",
              fontWeight: "500",
            }}
          >
            {message}
          </p>
        )}
      </div>

      {/* Marks Records */}
      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "14px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          overflowX: "auto",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>
          Marks Records
        </h2>

        {loading ? (
          <p>Loading marks...</p>
        ) : marks.length === 0 ? (
          <p>No marks records found.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={cellStyle}>ID</th>
                <th style={cellStyle}>Exam</th>
                <th style={cellStyle}>Student</th>
                <th style={cellStyle}>Roll Number</th>
                <th style={cellStyle}>Marks</th>
                <th style={cellStyle}>Max Marks</th>
                <th style={cellStyle}>Percentage</th>
                <th style={cellStyle}>Action</th>
              </tr>
            </thead>

            <tbody>
              {marks.map((item) => {
                const percentage =
                  Number(item.max_marks) > 0
                    ? (
                        (Number(item.marks_obtained) /
                          Number(item.max_marks)) *
                        100
                      ).toFixed(1)
                    : "0";

                return (
                  <tr key={item.id}>
                    <td style={cellStyle}>
                      {item.id}
                    </td>

                    <td style={cellStyle}>
                      {item.exam_name}
                    </td>

                    <td style={cellStyle}>
                      {item.student_name}
                    </td>

                    <td style={cellStyle}>
                      {item.roll_number}
                    </td>

                    <td style={cellStyle}>
                      {item.marks_obtained}
                    </td>

                    <td style={cellStyle}>
                      {item.max_marks}
                    </td>

                    <td style={cellStyle}>
                      <span
                        style={{
                          fontWeight: "bold",
                          color:
                            Number(percentage) >= 40
                              ? "#166534"
                              : "#991b1b",
                        }}
                      >
                        {percentage}%
                      </span>
                    </td>

                    <td style={cellStyle}>
                      <button
                        onClick={() =>
                          deleteMarks(item.id)
                        }
                        style={deleteButtonStyle}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
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
  fontSize: "14px",
  background: "white",
  width: "100%",
  boxSizing: "border-box",
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

export default Marks;

