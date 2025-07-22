import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';

const API = axios.create({
  baseURL: "http://localhost:5000", // For local development
  withCredentials: true, // Ensures cookies (if any) are included with requests
});

export default API;

export const login = async (email, password) => {
  const response = await fetch(`${API.baseURL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Handles credentials/cookies
    body: JSON.stringify({ email, password }),
  });

  return response.json();
};

export const register = async (formData) => {
  try {
    const response = await axios.post('http://localhost:5000/register', formData, {
      withCredentials: true,  // for handling cookies (if needed)
    });
    console.log('Response:', response.data); // Log the response data here
    return response.data;
  } catch (error) {
    console.error('Error during registration:', error);
    return { success: false, message: 'Registration failed' };
  }
};

