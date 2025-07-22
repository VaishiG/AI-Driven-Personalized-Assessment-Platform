import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Navbar,
  Nav,
  Dropdown,
  Table
} from "react-bootstrap";
import axios from "axios";
import "./Dashboard.css";

const UserPerformance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await axios.get(`/api/user/${id}/performance`);
        setUser(res.data.user);
        setQuizzes(res.data.quizzes);
      } catch (err) {
        console.error("Error fetching performance:", err);
      }
    };
    fetchPerformance();
  }, [id]);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/logout", {}, { withCredentials: true });
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <Navbar bg="white" expand="lg" className="mb-4 shadow-sm">
        <Container>
          <Navbar.Brand href="/admin">
            <img src="/logo.png" width="30" height="30" className="d-inline-block align-top" alt="Logo" />{" "}
            Zenius Admin
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav>
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" id="dropdown-basic" className="user-dropdown">
                  Admin
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="#">Profile</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container className="main-content">
        <h2 className="welcome-text">Performance Report: {user?.fullname || "User"}</h2>
        <p className="mb-4">Here's a detailed summary of this user's quiz performance and learning progress.</p>

        {quizzes.length > 0 ? (
          quizzes.map((quiz, idx) => (
            <Card key={idx} className="mb-4 shadow-sm">
              <Card.Body>
                <Card.Title>📝 Quiz #{quiz.quiz_id}</Card.Title>
                <p><strong>Score:</strong> {quiz.score.toFixed(2)}%</p>
                <p><strong>Duration:</strong> {quiz.duration} minutes</p>
                <p><strong>Remarks:</strong> {quiz.remarks}</p>
                <Table bordered responsive hover className="mt-3 text-center">
                  <thead>
                    <tr>
                      <th>Chapter</th>
                      <th>Easy</th>
                      <th>Medium</th>
                      <th>Hard</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quiz.chapter_stats.map((stat, idx2) => (
                      <tr key={idx2}>
                        <td>{stat.chapter}</td>
                        <td>{stat.easy}</td>
                        <td>{stat.medium}</td>
                        <td>{stat.hard}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          ))
        ) : (
          <p>No quizzes found for this user.</p>
        )}

        {/* Back Button */}
        <div className="text-center mt-4">
          <Button variant="secondary" as={Link} to="/admin-dashboard">
            ⬅ Back to Admin Dashboard
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default UserPerformance;
