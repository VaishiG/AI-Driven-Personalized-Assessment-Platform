import React, { useState, useEffect } from "react";
import { Container, Card, Button, Spinner, Alert, Navbar, Nav, Dropdown } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { OverlayTrigger, Popover } from "react-bootstrap";
import "./Dashboard.css"; // Reuse the same CSS as the user dashboard

function AvailableQuizzesPage() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get("/api/user/quizzes", { withCredentials: true })
      .then((res) => {
        setQuizzes(res.data.quizzes);
        setUser(res.data.user);       
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response ? err.response.data.error : "Failed to load quizzes.");
        setLoading(false);
      });
  }, []);  

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

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
      {/* Navigation Bar */}
      <Navbar bg="white" expand="lg" className="mb-4 shadow-sm">
        <Container>
          <Navbar.Brand href="/dashboard" className="brand-lilac">
            <img
              src="/logo.png"
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt="Zenius Logo"
            />{" "}
            Zenius
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav>
              <Nav.Link as={Link} to="/dashboard" className="nav-link-lilac">
                Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/quizzes" className="nav-link-lilac">
                Available Quizzes
              </Nav.Link>
              <Nav.Link as={Link} to="/quiz-history" className="nav-link-lilac">
                Quiz History
              </Nav.Link>
              <Nav.Link href="#" className="nav-link-lilac">
                <i className="bi bi-bell"></i>
              </Nav.Link>
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  id="dropdown-basic"
                  className="user-dropdown"
                >
                  {user?.name || "User"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <OverlayTrigger
                    trigger={['hover', 'focus']}
                    placement="left"
                    overlay={
                      <Popover id="popover-profile">
                        <Popover.Header as="h3">Profile Info</Popover.Header>
                        <Popover.Body>
                          <strong>Name:</strong> {user?.name || "N/A"}<br />
                          <strong>Email:</strong> {user?.email || "N/A"}<br />
                          <strong>DOB:</strong> {user?.dob || "N/A"}
                        </Popover.Body>
                      </Popover>
                    }
                    >
                    <Dropdown.Item href="#" onClick={(e) => e.preventDefault()}>
                      Profile
                    </Dropdown.Item>
                  </OverlayTrigger>
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
        <h2 className="welcome-text">📚 Your Available Quizzes</h2>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : quizzes.length === 0 ? (
          <Alert variant="info">You don't have any quizzes available yet.</Alert>
        ) : (
          <div className="row justify-content-center">
            {quizzes.map((quiz) => (
              <div className="d-flex flex-column gap-4" key={quiz.id}> {/* <= Control width */}
                <Card className="mb-3 subject-card">
                  <Card.Body>
                    <Card.Title className="subject-title">
                      {quiz.remarks || "Untitled Quiz"}
                    </Card.Title>
                    <Card.Text>
                      <strong>Duration:</strong> {quiz.duration} minutes
                    </Card.Text>
                    <Card.Text>
                      <strong>Number of Questions:</strong> {quiz.num_questions}
                    </Card.Text>
                    <Button
                      onClick={() => handleStartQuiz(quiz.id)}
                      variant="primary"
                      className="subject-button"
                    >
                      Start Quiz
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

export default AvailableQuizzesPage;
