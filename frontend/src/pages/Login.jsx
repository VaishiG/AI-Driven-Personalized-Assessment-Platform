import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api';
import './Login.css'; // Ensure this CSS file is imported
import { Form, Button, Alert, Spinner, InputGroup, Container } from 'react-bootstrap'; // Adjusted imports
// Optional: Import an icon library
// import { EyeSlashFill, EyeFill } from 'react-bootstrap-icons';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // Placeholder state
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/login', { email, password });
            if (res.data.success) {
                if (res.data.is_admin) {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/dashboard');
                }                
            } else {
                setError(res.data.message || 'Login failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login error.');
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Placeholder function
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    return (
        // Outer container for background color and centering
        <div className="login-page-background d-flex align-items-center justify-content-center min-vh-100">
            <Container>
                <div className="login-card-minimal shadow">
                    <div className="card-body p-4 p-md-5"> {/* Padding inside the card */}

                        {/* No main title in this version */}

                        {error && <Alert variant="danger" className="small py-2 mb-3">{error}</Alert>}

                        <Form onSubmit={handleLogin}>
                            <Form.Group className="mb-3 text-start" controlId="emailInputMinimal">
                                <Form.Label className="login-label-minimal">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    className="login-input-minimal" // Custom class
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    placeholder="Enter your email" // Placeholder text like reference
                                />
                            </Form.Group>

                            <Form.Group className="mb-2 text-start" controlId="passwordInputMinimal">
                                <Form.Label className="login-label-minimal">Password</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        className="login-input-minimal password-input-minimal" // Custom class
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        placeholder="Enter your password" // Placeholder text like reference
                                    />
                                    {/* Password visibility toggle button */}
                                    <Button variant="link" className="password-toggle-btn-minimal" onClick={togglePasswordVisibility} disabled={loading}>
                                        {/* {showPassword ? <EyeSlashFill /> : <EyeFill />} */}
                                        👁 {/* Simple Placeholder */}
                                    </Button>
                                </InputGroup>
                            </Form.Group>

                            {/* Forgot Password Link - Centered */}
                            <div className="text-center mb-4">
                                <Link to="/forgot-password" tabIndex="-1" className="forgot-password-link-minimal small">Forgot your password?</Link>
                            </div>

                            {/* Login Button */}
                            <Button
                                variant="primary" // Will be styled by CSS
                                type="submit"
                                className="w-100 btn-login-submit-minimal" // Custom class
                                disabled={loading}
                            >
                                {loading ? (
                                    <> <Spinner animation="border" size="sm" className="me-2" /> Logging In... </>
                                ) : ( 'Log In' )}
                            </Button>

                            {/* Sign Up Section - Centered */}
                             <div className="text-center mt-4">
                                <p className="register-prompt-minimal small mb-2">
                                    Don't have an account?
                                </p>
                                <Button
                                    variant="outline-primary" // Will be styled by CSS
                                    className="w-100 btn-signup-outline-minimal" // Custom class
                                    onClick={() => navigate('/register')}
                                    disabled={loading}
                                >
                                    Sign up
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </Container>
        </div>
    );
}

export default Login
