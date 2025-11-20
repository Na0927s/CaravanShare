import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Store token and user info in localStorage
      localStorage.setItem('userToken', 'some-jwt-token'); // Placeholder token
      localStorage.setItem('userInfo', JSON.stringify(data.user)); // Store user object

      setSuccess(data.message || 'Login successful! Redirecting to home...');
      
      window.dispatchEvent(new Event('loginSuccess'));

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Network error');
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Login
        </Button>
      </Form>

      <div className="social-login">
        <div className="divider">
          <span>OR</span>
        </div>
        <Button variant="light" className="social-login-button naver-login" onClick={() => alert('Naver login is not implemented yet.')}>
          <img src="/images/naver-logo.png" alt="Naver" />
          Login with Naver
        </Button>
        <Button variant="light" className="social-login-button kakao-login" onClick={() => alert('Kakao login is not implemented yet.')}>
          <img src="/images/kakao-logo.png" alt="Kakao" />
          Login with Kakao
        </Button>
        <Button variant="light" className="social-login-button google-login" onClick={() => alert('Google login is not implemented yet.')}>
          <img src="/images/google-logo.png" alt="Google" />
          Login with Google
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
