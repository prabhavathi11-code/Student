
import { useEffect, useState } from "react";

const API = "https://student-backend-hxpt.onrender.com/api/exams";
const CLASSES_API = "https://student-backend-hxpt.onrender.com/api/classes";
const SUBJECTS_API = "https://student-backend-hxpt.onrender.com/api/subjects";

function Exams() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    class_id: "",
    subject_id: "",
    exam_date: "",
    max_marks: 100,
    semester: "",
  });

  const fetchExams = async () => {
    try {
      setLoading(true);

      const response = await fetch(API);
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Unable to load exams.");
        return;
      }

      setExams(result.data || []);
    } catch (error) {
      console.error("Exams error:", error);
      setMessage("Unable to load exams.");
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
      setMessage("Unable to load classes.");
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(SUBJECTS_API);
      const result = await response.json();

      setSubjects(result.data || []);
    } catch (error) {
      console.error("Subjects error:", error);
      setMessage("Unable to load subjects.");
    }
  };

  useEffect(() => {
    fetchExams();
    fetchClasses();
    fetchSubjects();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const addExam = async (event) => {
    event.preventDefault();

    if (
      !form.name ||
      !form.class_id ||
      !form.subject_id ||
      !form.exam_date ||
      !form.max_marks ||
      !form.semester
    ) {
      setMessage("Please fill all exam fields.");
      return;
    }

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          class_id: Number(form.class_id),
          subject_id: Number(form.subject_id),
          exam_date: form.exam_date,
          max_marks: Number(form.max_marks),
          semester: form.semester,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Failed to create exam.");
        return;
      }

      setMessage("Exam created successfully.");

      setForm({
        name: "",
        class_id: "",
        subject_id: "",
        exam_date: "",
        max_marks: 100,
        semester: "",
      });

      fetchExams();
    } catch (error) {
      console.error("Error:", error);
      setMessage("Server error.");
    }
  };

  const deleteExam = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this exam?"
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
        setMessage(result.message || "Failed to delete exam.");
        return;
      }

      setMessage("Exam deleted successfully.");

      fetchExams();
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
      <h1>Exams</h1>

      <p
        style={{
          color: "#6b7280",
          marginBottom: "25px",
        }}
      >
        Manage school examinations.
      </p>

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
          Create Exam
        </h2>

        <form
          onSubmit={addExam}
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
          }}
        >
          <input
            type="text"
            name="name"
            placeholder="Exam name"
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
          />

          <select
            name="class_id"
            value={form.class_id}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Select Class</option>

            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <select
            name="subject_id"
            value={form.subject_id}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Select Subject</option>

            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="exam_date"
            value={form.exam_date}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="number"
            name="max_marks"
            placeholder="Maximum marks"
            value={form.max_marks}
            onChange={handleChange}
            min="1"
            style={inputStyle}
          />

          <input
            type="text"
            name="semester"
            placeholder="Semester"
            value={form.semester}
            onChange={handleChange}
            style={inputStyle}
          />

          <button
            type="submit"
            style={{
              ...buttonStyle,
              gridColumn: "1 / -1",
            }}
          >
            + Create Exam
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
          Examination List
        </h2>

        {loading ? (
          <p>Loading exams...</p>
        ) : exams.length === 0 ? (
          <p>No exams found.</p>
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
                <th style={cellStyle}>Class</th>
                <th style={cellStyle}>Subject</th>
                <th style={cellStyle}>Date</th>
                <th style={cellStyle}>Max Marks</th>
                <th style={cellStyle}>Semester</th>
                <th style={cellStyle}>Action</th>
              </tr>
            </thead>

            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td style={cellStyle}>
                    {exam.id}
                  </td>

                  <td style={cellStyle}>
                    {exam.name}
                  </td>

                  <td style={cellStyle}>
                    {exam.class_name || exam.class_id}
                  </td>

                  <td style={cellStyle}>
                    {exam.subject_name || exam.subject_id}
                  </td>

                  <td style={cellStyle}>
                    {exam.exam_date}
                  </td>

                  <td style={cellStyle}>
                    {exam.max_marks}
                  </td>

                  <td style={cellStyle}>
                    {exam.semester}
                  </td>

                  <td style={cellStyle}>
                    <button
                      onClick={() => deleteExam(exam.id)}
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
  fontSize: "14px",
  background: "white",
  width: "100%",
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

export default Exams;

