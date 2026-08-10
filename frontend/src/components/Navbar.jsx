
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      style={{
        background: "#1e3a8a",
        color: "white",
        padding: "18px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "15px",
      }}
    >
      <h2>Smart School Management</h2>

      <div
        style={{
          display: "flex",
          gap: "18px",
          flexWrap: "wrap",
        }}
      >
        <Link to="/">Dashboard</Link>
        <Link to="/students">Students</Link>
        <Link to="/classes">Classes</Link>
        <Link to="/teachers">Teachers</Link>
        <Link to="/subjects">Subjects</Link>
        <Link to="/attendance">Attendance</Link>
        <Link to="/exams">Exams</Link>
        <Link to="/marks">Marks</Link>
      </div>
    </nav>
  );
}

export default Navbar;

