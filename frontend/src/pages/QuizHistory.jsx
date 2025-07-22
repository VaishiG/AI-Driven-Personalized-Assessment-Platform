import React, { useEffect, useState } from "react";
import {Container, Row, Col, Card, Button, Navbar, Nav, Dropdown, Modal,} from "react-bootstrap";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend,} from "chart.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
import { OverlayTrigger, Popover } from "react-bootstrap";
import "./Dashboard.css";

function QuizHistory() {
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/quiz-history", { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
        setQuizHistory(res.data.quizzes);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load quiz history.", err);
        setLoading(false);
        alert("An error occurred while fetching quiz history. Please try again.");
      });
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/logout", {}, { withCredentials: true });
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
    }
  };

  const handleShowModal = (quiz) => {
    setSelectedQuiz(quiz);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedQuiz(null);
  };

  const getAccuracyChartData = (quiz) => ({
    labels: ["Correct", "Incorrect"],
    datasets: [
      {
        data: [quiz.correctAnswers, quiz.incorrectAnswers],
        backgroundColor: ["#28a745", "#dc3545"],
      },
    ],
  });

  const getChapterDifficultyChartData = (quiz) => {
    const chapterData = quiz.chapters.reduce((acc, entry) => {
      const key = `${entry.chapter} (${entry.difficulty})`;
      if (!acc[key]) {
        acc[key] = { correct: 0, incorrect: 0 };
      }
      acc[key].correct += entry.correct;
      acc[key].incorrect += entry.incorrect;
      return acc;
    }, {});

    const labels = Object.keys(chapterData);
    const correctData = labels.map((key) => chapterData[key].correct);
    const incorrectData = labels.map((key) => chapterData[key].incorrect);

    return {
      labels,
      datasets: [
        {
          label: "Correct",
          data: correctData,
          backgroundColor: "#28a745",
        },
        {
          label: "Incorrect",
          data: incorrectData,
          backgroundColor: "#dc3545",
        },
      ],
    };
  };

  return (
    <div className="quizhistory-container">
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

      <Container className="main-content">
        <h2 className="welcome-text">📜 Quiz History</h2>
        {loading ? (
          <div>Loading...</div>
        ) : quizHistory.length === 0 ? (
          <p>No quizzes attempted yet.</p>
        ) : (
          <div className="quiz-history-list">
            {quizHistory.map((quiz) => (
              <Card className="quiz-history-card-horizontal mb-4 shadow-sm">
                <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-start flex-wrap">
                  <div className="quiz-info-section mb-3 mb-md-0">
                    <Card.Title className="subject-title">
                      {quiz.remarks || "📘 Untitled Quiz"}
                    </Card.Title>
                    <Card.Text className="mb-1">
                      <strong>📝 Score:</strong> {quiz.score}%
                    </Card.Text>
                    <Card.Text className="mb-1">
                      <strong>⏱️ Time Taken:</strong> {quiz.timeTaken} minutes
                    </Card.Text>
                    <Card.Text className="mb-3">
                      <strong>📅 Date:</strong> {new Date(quiz.timestamp).toLocaleString()}
                    </Card.Text>
                    <Button
                      size="sm"
                      variant="primary"
                      className="subject-button"
                      onClick={() => handleShowModal(quiz)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Container>

      {selectedQuiz && (
        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>📊 Quiz Details - {selectedQuiz.remarks}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-3">
              <Col md={6}><strong>Score:</strong> {selectedQuiz.score}%</Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}><strong>Time Taken:</strong> {selectedQuiz.timeTaken} minutes</Col>
              <Col md={6}><strong>Date:</strong> {new Date(selectedQuiz.timestamp).toLocaleString()}</Col>
            </Row>
            <Row className="mb-4">
              <Col xs={12}>
                <div className="chart-wrapper mb-5">
                  <div className="chart-title">Accuracy Breakdown</div>
                  <div style={{ height: "300px" }}>
                    <Pie data={getAccuracyChartData(selectedQuiz)} />
                  </div>
                </div>
              </Col>

              <Col xs={12}>
                <div className="chart-wrapper">
                  <div className="chart-title">Chapter & Difficulty Breakdown</div>
                  <div style={{ overflowX: "auto", width: "100%" }}>
                    <div style={{ width: `${selectedQuiz.chapters.length * 60}px`, height: "450px" }}>
                      <Bar
                        data={getChapterDifficultyChartData(selectedQuiz)}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: "top" },
                          },
                          scales: {
                            x: {
                              ticks: {
                                font: { size: 10 }, // reduce font size
                                callback: function (label) {
                                  return label.length > 20 ? label.slice(0, 20) + "…" : label;
                                },
                                autoSkip: false,
                                maxRotation: 45,
                                minRotation: 30,
                                padding: 10,
                              },
                              grid: {
                                display: false,
                              },
                            },
                            y: {
                              beginAtZero: true,
                              grid: { display: true },
                            },
                          },
                          barThickness: 25,
                          categoryPercentage: 0.6,
                          barPercentage: 0.6,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Col>

            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

export default QuizHistory;
