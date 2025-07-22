import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Navbar, Nav, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Reuse your existing CSS

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [adminName, setAdminName] = useState("Admin");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/users/not_admins")
      .then((response) => response.json())
      .then((data) => setUsers(data.users))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const deleteUser = (userId) => {
    fetch(`/api/users/${userId}`, { method: "DELETE" })
      .then((response) => {
        if (response.ok) {
          setUsers(users.filter((user) => user.id !== userId));
        } else {
          console.error("Failed to delete user");
        }
      })
      .catch((error) => console.error("Error deleting user:", error));
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include"
      });
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar bg="white" expand="lg" className="mb-4 shadow-sm">
        <Container>
          <Navbar.Brand href="/admin">
            <img src="/logo.png" width="30" height="30" alt="Logo" className="d-inline-block align-top" />{" "}
            Zenius Admin
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav>
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" id="dropdown-basic" className="user-dropdown">
                  {adminName}
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

      <Container className="main-content">
        <h2 className="welcome-text">Welcome back, Admin 👋</h2>
        <p className="mb-4">Manage users below. You can delete users or view their performance reports.</p>

        <Row>
          {users.map((user) => (
            <Col md={4} key={user.id} className="mb-4">
              <Card className="subject-card shadow-sm">
                <Card.Body>
                  <Card.Title className="subject-title">👤 {user.fullname}</Card.Title>
                  <Card.Text>
                    <strong>Email:</strong> {user.email}<br />
                    <strong>DOB:</strong> {user.dob}
                  </Card.Text>
                  <div className="d-flex justify-content-between">
                    <Button variant="danger" className="subject-button" onClick={() => deleteUser(user.id)}>Delete</Button>
                    <Button variant="primary" as={Link} to={`/user/${user.id}/performance`} className="subject-button">View Performance</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;
