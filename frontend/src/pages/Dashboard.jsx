import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ProgressBar,
  Dropdown,
  Navbar,
  Nav,
} from "react-bootstrap";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { OverlayTrigger, Popover } from "react-bootstrap";
import "./Dashboard.css";

function Dashboard() {
  const [user, setUser] = useState({ name: "", email: "", dob: "" }); // Default user state to prevent null
  const [stats, setStats] = useState({
    streak: 0,
    xp: 0,
    level: "Beginner",
    overallProgress: 0,
    avgScore: 0,
    timeSpent: "0 hrs",
    adaptiveLevel: "Beginner",
    chapterStats: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController(); // Create a controller for aborting the request
    const signal = controller.signal;

    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dashboard", {
          withCredentials: true,
          signal, // Attach the signal to the request
        });
        setStats({
          ...res.data,
          chapterStats: res.data.chapterStats || [],
        });
        setUser(res.data.user);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Failed to fetch stats:", err);
        }
      }
    };

    fetchStats();

    // Cleanup function to abort the request when the component unmounts
    return () => controller.abort();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/logout",
        {},
        { withCredentials: true }
      );
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="dashboard-container">
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
                    trigger={['hover', 'focus', 'click']}
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

      <Container className="main-content">
        <h2 className="welcome-text">
          Hi, {user?.name || "there"}! Ready to level up today?
        </h2>

        <Row className="mb-4 stats-row">
          <Col md={6} className="mb-4">
            <Card body className="stat-card">
              <span className="stat-icon">🔥</span> Streak: {stats.streak} days
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card body className="stat-card">
              <span className="stat-icon">⭐</span> XP: {stats.xp}
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card body className="stat-card">
              <span className="stat-icon">🎯</span> Skill Level: {stats.level}
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card body className="stat-card">
              <span className="stat-icon">🧠</span> Adaptive Level:{" "}
              {stats.adaptiveLevel}
            </Card>
          </Col>
        </Row>

        <Row className="mb-4 progress-row">
          <Col md={6} className="mb-4">
            <Card className="progress-card">
              <Card.Body>
                <Card.Title className="card-title">
                  📈 Overall Progress
                </Card.Title>
                <ProgressBar
                  now={stats.overallProgress}
                  label={`${stats.overallProgress}%`}
                  className="custom-progress"
                />
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="progress-card">
              <Card.Body>
                <Card.Title className="card-title">📊 Performance</Card.Title>
                <p className="card-text">Avg. Score: {stats.avgScore}%</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="progress-card">
              <Card.Body>
                <Card.Title>⏱ Time Spent</Card.Title>
                <p className="card-text">{stats.timeSpent} this week</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {stats.chapterStats.length > 0 && (
          <>
            <h3 className="section-title">Your Chapters</h3>
            <Row className="mb-4 subject-row">
              {stats.chapterStats.map((chapter, index) => (
                <Col md={6} key={index} className="mb-4">
                  <Card className="subject-card">
                    <Card.Body>
                      <Card.Title className="subject-title">
                        📘 {chapter.name}
                      </Card.Title>
                      <p className="subject-progress">
                        Completion: {chapter.completion}%
                      </p>
                      <Button
                        variant="primary"
                        className="subject-button"
                        as={Link}
                        to={`/quiz/${chapter.name.toLowerCase()}`}
                      >
                        {chapter.buttonText}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Container>
    </div>
  );
}

export default Dashboard;
