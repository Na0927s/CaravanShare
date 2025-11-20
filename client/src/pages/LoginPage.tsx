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
      const response = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || '로그인에 실패했습니다.');
        return;
      }

      // Store token and user info in localStorage
      localStorage.setItem('userToken', 'some-jwt-token'); // Placeholder token
      localStorage.setItem('userInfo', JSON.stringify(data.user)); // Store user object

      setSuccess(data.message || '로그인 성공! 홈으로 이동합니다...');
      
      window.dispatchEvent(new Event('loginSuccess'));

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      setError(err.message || '네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h1 className="text-center mb-4">로그인</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>이메일 주소</Form.Label>
          <Form.Control
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>비밀번호</Form.Label>
          <Form.Control
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <div className="d-grid">
          <Button variant="primary" type="submit">
            로그인
          </Button>
        </div>
      </Form>

      <div className="divider my-4">
        <span className="divider-text">또는</span>
      </div>

      <div className="d-grid gap-2">
        <Button variant="light" className="border" onClick={() => alert('네이버 로그인은 아직 구현되지 않았습니다.')}>
          <img src="/images/naver-logo.png" alt="네이버" style={{ height: '20px', marginRight: '10px' }} />
          네이버로 로그인
        </Button>
        <Button variant="light" className="border" onClick={() => alert('카카오 로그인은 아직 구현되지 않았습니다.')}>
          <img src="/images/kakao-logo.png" alt="카카오" style={{ height: '20px', marginRight: '10px' }} />
          카카오로 로그인
        </Button>
        <Button variant="light" className="border" onClick={() => alert('구글 로그인은 아직 구현되지 않았습니다.')}>
          <img src="/images/google-logo.png" alt="구글" style={{ height: '20px', marginRight: '10px' }} />
          구글로 로그인
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
