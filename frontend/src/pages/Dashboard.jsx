
import { useEffect, useState } from "react";

const API = "https://student-backend-hxpt.onrender.com/api";

function Dashboard() {
    const [counts, setCounts] = useState({
        students: 0,
        teachers: 0,
        classes: 0,
        subjects: 0,
        attendance: 0,
        exams: 0,
        marks: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                const endpoints = [
                    "students",
                    "teachers",
                    "classes",
                    "subjects",
                    "attendance",
                    "exams",
                    "marks",
                ];

                const responses = await Promise.all(
                    endpoints.map((endpoint) =>
                        fetch(`${API}/${endpoint}`)
                    )
                );

                const results = await Promise.all(
                    responses.map(async (response) => {
                        if (!response.ok) {
                            throw new Error(
                                `Failed to load API data`
                            );
                        }

                        return response.json();
                    })
                );

                setCounts({
                    students:
                        results[0].data?.length || 0,
                    teachers:
                        results[1].data?.length || 0,
                    classes:
                        results[2].data?.length || 0,
                    subjects:
                        results[3].data?.length || 0,
                    attendance:
                        results[4].data?.length || 0,
                    exams:
                        results[5].data?.length || 0,
                    marks:
                        results[6].data?.length || 0,
                });
            } catch (error) {
                console.error(
                    "Dashboard error:",
                    error
                );

                setError(
                    "Unable to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const cards = [
        {
            title: "Students",
            value: counts.students,
            text: "Registered students",
            icon: "👨‍🎓",
        },
        {
            title: "Teachers",
            value: counts.teachers,
            text: "Registered teachers",
            icon: "👨‍🏫",
        },
        {
            title: "Classes",
            value: counts.classes,
            text: "Available classes",
            icon: "🏫",
        },
        {
            title: "Subjects",
            value: counts.subjects,
            text: "Available subjects",
            icon: "📚",
        },
        {
            title: "Attendance",
            value: counts.attendance,
            text: "Attendance records",
            icon: "📅",
        },
        {
            title: "Exams",
            value: counts.exams,
            text: "Scheduled exams",
            icon: "📝",
        },
        {
            title: "Marks",
            value: counts.marks,
            text: "Marks records",
            icon: "📊",
        },
    ];

    return (
        <div
            style={{
                padding: "35px",
                maxWidth: "1200px",
                margin: "auto",
            }}
        >
            <div style={{ marginBottom: "30px" }}>
                <h1
                    style={{
                        fontSize: "32px",
                        marginBottom: "8px",
                    }}
                >
                    Smart School Management System
                </h1>

                <p
                    style={{
                        color: "#6b7280",
                        fontSize: "16px",
                    }}
                >
                    Welcome to your school management
                    dashboard.
                </p>
            </div>

            {loading ? (
                <div
                    style={{
                        background: "white",
                        padding: "30px",
                        borderRadius: "14px",
                        textAlign: "center",
                    }}
                >
                    Loading dashboard...
                </div>
            ) : error ? (
                <div
                    style={{
                        background: "white",
                        padding: "30px",
                        borderRadius: "14px",
                        textAlign: "center",
                        color: "#dc2626",
                    }}
                >
                    {error}
                </div>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "22px",
                    }}
                >
                    {cards.map((card) => (
                        <div
                            key={card.title}
                            style={{
                                background: "white",
                                padding: "25px",
                                borderRadius: "14px",
                                boxShadow:
                                    "0 4px 15px rgba(0,0,0,0.08)",
                                border:
                                    "1px solid #e5e7eb",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "32px",
                                    marginBottom: "15px",
                                }}
                            >
                                {card.icon}
                            </div>

                            <h3
                                style={{
                                    color: "#6b7280",
                                    fontSize: "15px",
                                    marginBottom: "8px",
                                }}
                            >
                                {card.title}
                            </h3>

                            <h2
                                style={{
                                    fontSize: "30px",
                                    color: "#1e3a8a",
                                    marginBottom: "6px",
                                }}
                            >
                                {card.value}
                            </h2>

                            <p
                                style={{
                                    color: "#9ca3af",
                                    fontSize: "14px",
                                }}
                            >
                                {card.text}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <div
                style={{
                    background: "white",
                    marginTop: "30px",
                    padding: "25px",
                    borderRadius: "14px",
                    boxShadow:
                        "0 4px 15px rgba(0,0,0,0.08)",
                    border: "1px solid #e5e7eb",
                }}
            >
                <h2 style={{ marginBottom: "10px" }}>
                    System Overview
                </h2>

                <p
                    style={{
                        color: "#6b7280",
                        lineHeight: "1.7",
                    }}
                >
                    This dashboard provides a quick
                    overview of students, teachers,
                    classes, subjects, attendance,
                    examinations, and student marks.
                </p>
            </div>
        </div>
    );
}

export default Dashboard;

