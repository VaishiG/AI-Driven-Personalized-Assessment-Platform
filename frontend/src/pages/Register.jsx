import React, { useState } from 'react';
import axios from '../api'; // Use configured axios instance
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // ***** IMPORT THE SAME CSS FILE AS LOGIN *****
import { Form, Button, Alert, Spinner, Container } from 'react-bootstrap';

const Register = () => {
    // State for form fields
    const [form, setForm] = useState({
        fullname: '',
        email: '',
        password: '',
        dob: ''
    });
    // State for error messages
    const [error, setError] = useState('');
    // State for loading indicator on button
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    // Handle changes in form inputs
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setLoading(true);   // Show loading indicator
        setError('');       // Clear previous errors

        // Basic frontend validation (optional but recommended)
        if (!form.fullname || !form.email || !form.password || !form.dob) {
            setError("Please fill out all fields.");
            setLoading(false);
            return;
        }

        console.log('Registering with:', form); // Debug: Log form data

        try {
            // Make API call to backend registration endpoint
            const res = await axios.post('/register', { ...form, is_admin: isAdmin });
            console.log('Registration Response:', res.data); // Debug: Log response

            if (res.data.success) {
                navigate("/login"); // Redirect to login on success
            } else {
                // Show error message from backend or a default one
                setError(res.data.message || 'Registration failed.');
            }
        } catch (err) {
            // Show error from backend response or a generic error
            setError(err.response?.data?.message || 'An error occurred during registration.');
            console.error("Registration error:", err); // Log detailed error
        } finally {
            setLoading(false); // Hide loading indicator
        }
    };

    return (
        // Use the same outer wrapper and card structure as the Login page
        <div className="login-page-background d-flex align-items-center justify-content-center min-vh-100">
            <Container>
                <div className="login-card-minimal shadow">
                    <div className="card-body p-4 p-md-5">

                        {/* Title for the registration page */}
                        <h2 className="text-center mb-4 register-title">Create Your Account</h2>

                        {/* Display error messages */}
                        {error && <Alert variant="danger" className="small py-2 mb-3">{error}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            {/* Full Name Input */}
                            <Form.Group className="mb-3 text-start" controlId="regFullname">
                                <Form.Label className="login-label-minimal">Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="fullname" // Connect to state
                                    className="login-input-minimal" // Reuse login input style
                                    value={form.fullname}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Enter your full name"
                                />
                            </Form.Group>

                            {/* Email Input */}
                            <Form.Group className="mb-3 text-start" controlId="regEmail">
                                <Form.Label className="login-label-minimal">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email" // Connect to state
                                    className="login-input-minimal" // Reuse login input style
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Enter your email"
                                />
                            </Form.Group>

                            {/* Password Input */}
                            <Form.Group className="mb-3 text-start" controlId="regPassword">
                                <Form.Label className="login-label-minimal">Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password" // Connect to state
                                    className="login-input-minimal" // Reuse login input style
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Create a password"
                                />
                                {/* Add password requirements/strength meter if desired */}
                            </Form.Group>

                            {/* Date of Birth Input */}
                            <Form.Group className="mb-4 text-start" controlId="regDob">
                                <Form.Label className="login-label-minimal">Date of Birth</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="dob" // Connect to state
                                    className="login-input-minimal" // Reuse login input style
                                    value={form.dob}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="YYYY-MM-DD" // Placeholder might not show for type=date
                                />
                            </Form.Group>

                            <Form.Group controlId="adminCheckbox" className="mb-3 text-start">
                                <Form.Check
                                    type="checkbox"
                                    label="Register as Admin"
                                    checked={isAdmin}
                                    onChange={(e) => setIsAdmin(e.target.checked)}
                                    disabled={loading}
                                />
                            </Form.Group>


                            {/* Register Button */}
                            <Button
                                variant="primary" // Styled by CSS below
                                type="submit"
                                className="w-100 btn-login-submit-minimal" // Reuse the same purple button style
                                disabled={loading}
                            >
                                {loading ? (
                                    <> <Spinner animation="border" size="sm" className="me-2" /> Creating Account... </>
                                ) : ( 'Register' )}
                            </Button>

                            {/* Link back to Login */}
                            <p className="text-center mt-4 register-link-section small">
                                Already have an account? <Link to="/login" className="fw-bold">Log In</Link>
                            </p>
                        </Form>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Register;