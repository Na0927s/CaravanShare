import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Container, Card, Alert } from 'react-bootstrap';

const SelectRolePage = () => {
  const [kakaoId, setKakaoId] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const kid = queryParams.get('kakaoId');
    const n = queryParams.get('name');

    if (kid && n) {
      setKakaoId(kid);
      setName(decodeURIComponent(n));
    } else {
      setError('잘못된 접근입니다. 로그인 페이지로 돌아가 다시 시도해주세요.');
    }
  }, [location]);

  const handleRoleSelect = async (role: 'guest' | 'host') => {
    setError(null);
    if (!kakaoId || !name) {
      setError('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/users/social-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kakaoId, name, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || '회원가입에 실패했습니다.');
        return;
      }

      // Login the user
      localStorage.setItem('userToken', 'social-login-token-' + data.user.id);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      window.dispatchEvent(new Event('loginSuccess'));

      // Redirect to home
      navigate('/');
    } catch (err: any) {
      setError(err.message || '네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '30rem' }}>
        <Card.Body className="text-center">
          <Card.Title className="mb-4">역할을 선택해주세요</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          {name && <Card.Text className="mb-4">안녕하세요, {name}님! CaravanShare에 오신 것을 환영합니다. 어떤 역할로 서비스를 이용하시겠어요?</Card.Text>}
          <div className="d-grid gap-2">
            <Button variant="primary" size="lg" onClick={() => handleRoleSelect('guest')}>
              게스트로 계속하기 (카라반 둘러보기)
            </Button>
            <Button variant="secondary" size="lg" onClick={() => handleRoleSelect('host')}>
              호스트로 계속하기 (내 카라반 등록하기)
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SelectRolePage;
