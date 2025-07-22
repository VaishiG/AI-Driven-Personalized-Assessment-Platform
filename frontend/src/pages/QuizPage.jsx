import React, { useState, useEffect } from "react";
import { Container, Card, Button, Form, Spinner, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";
import bgImg from "/bgimg3.jpg";

function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [duration, setDuration] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/quiz/${id}`)
      .then((res) => {
        const dur = res.data.duration;
        setQuestions(res.data.questions);
        setDuration(dur);
        setTimeLeft(dur);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load quiz. Please try again.");
        setLoading(false);
      });
  }, [id]);


  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);


  const formatTime = (seconds) => {
    if (seconds === null || isNaN(seconds)) return "00:00"; // Return "00:00" if invalid value
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOptionChange = (qId, option) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [qId]: option }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleFlag = (qId) => {
    setFlagged((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSubmit = () => {
    if (submitting) return;

    const allAnswered = Object.keys(answers).length === questions.length;
    if (!allAnswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);

    const payload = {
      answers,
      time_taken: duration - timeLeft,
    };

    axios
      .post(`/api/quiz/${id}/submit`, payload)
      .then((res) => {
        alert("Quiz submitted successfully!");
        navigate("/quiz-history");
      })
      .catch((err) => {
        console.error("Submission error:", err.response?.data || err.message);
        setError("Failed to submit quiz. Please try again.");
        setSubmitting(false);
      });
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const question = questions[currentIndex];

  return (
    <div
      className="dashboard-container py-5"
      style={{
        backgroundImage: `url(${bgImg})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <Container>
        {/* Timer at top right */}
        <div className="d-flex justify-content-end mb-3">
          <Card style={{ minWidth: "160px", textAlign: "center" }}>
            <Card.Body>
              <h6 className="mb-1">Time Left</h6>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: timeLeft < 60 ? "red" : "#5e60ce",
                }}
              >
                {formatTime(timeLeft)}
              </div>
            </Card.Body>
          </Card>
        </div>
        
        <div className="text-center mb-3">
          <h5 className="fw-semibold text-white bg-light-lilac d-inline-block px-3 py-2 rounded">
            <span className="text-dark-lilac">{question.chapter}</span> —  
            <span className="text-primary-lilac">
              {question.difficulty?.charAt(0).toUpperCase() + question.difficulty?.slice(1)}
            </span>
          </h5>
        </div>

        {/* Horizontal Question Nav Bar */}
        <div className="mb-4 text-center">
          {questions.map((q, index) => {
            const isAnswered = answers[q.id];
            const isFlagged = flagged[q.id];
            let bgColor = "white";
            let textColor = "black";

            if (currentIndex === index) {
              bgColor = "#343a40"; // dark
              textColor = "white";
            } else if (isFlagged) {
              bgColor = "#ffc107"; // warning
            } else if (isAnswered) {
              bgColor = "#198754"; // success
              textColor = "white";
            }

            return (
              <Button
                key={q.id}
                size="sm"
                style={{
                  backgroundColor: bgColor,
                  color: textColor,
                  border: "1px solid #ccc",
                  fontWeight: "bold",
                }}
                className="me-2 mb-2"
                onClick={() => setCurrentIndex(index)}
              >
                {index + 1}
              </Button>
            );
          })}
        </div>

        {/* Main Question Card */}
        <Card className="mx-auto p-4" style={{ maxWidth: "700px", backgroundColor: "#fff9fc" }}>
          <Card.Body>
            <h5 className="mb-3 text-center">
              Question {currentIndex + 1} of {questions.length}
            </h5>
            <p className="fw-bold">{question.question}</p>
            <Form className="mt-3">
              {["a", "b", "c", "d"].map((opt) => (
                <Form.Check
                  key={opt}
                  type="radio"
                  label={question["option_" + opt]}
                  name={`q${question.id}`}
                  id={`${question.id}-${opt}`}
                  className="mb-2"
                  checked={answers[question.id] === question["option_" + opt]}
                  onChange={() => handleOptionChange(question.id, question["option_" + opt])}
                />
              ))}
            </Form>

            {/* Flag Button */}
            <div className="text-center mt-3">
              <Button
                variant={flagged[question.id] ? "warning" : "outline-warning"}
                onClick={() => toggleFlag(question.id)}
              >
                {flagged[question.id] ? "Unflag Question" : "Flag for Review"}
              </Button>
            </div>

            {/* Prev / Next / Submit Buttons */}
            <div className="d-flex justify-content-between mt-4">
              <Button variant="secondary" disabled={currentIndex === 0} onClick={handlePrev}>
                Previous
              </Button>
              {currentIndex < questions.length - 1 ? (
                <Button variant="primary" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button variant="success" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Quiz"}
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default QuizPage;
