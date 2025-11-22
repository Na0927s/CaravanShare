import React, { useEffect, useState } from 'react';
import { Form, Button, Alert, Container, ListGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { User } from '../models/User';
import { Review } from '../models/Review';

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [role, setRole] = useState<'host' | 'guest'>('guest');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch user reviews using the custom hook
  const { data: userReviews, loading: loadingReviews, error: reviewsError } = useFetch<Review[]>(
    userInfo ? `/reviews/user/${userInfo.id}` : null
  );

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const parsedUserInfo: User = JSON.parse(storedUserInfo);
      setUserInfo(parsedUserInfo);
      setName(parsedUserInfo.name);
      setEmail(parsedUserInfo.email);
      setContact(parsedUserInfo.contact || '');
      setRole(parsedUserInfo.role);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!userInfo) {
      setError('사용자가 로그인되어 있지 않습니다.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/users/${userInfo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, contact }), // Only send fields that can be updated
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || '프로필 업데이트에 실패했습니다.');
        return;
      }

      const updatedUserInfo = { ...userInfo, name, contact };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      setUserInfo(updatedUserInfo);
      setSuccess('프로필이 성공적으로 업데이트되었습니다!');
    } catch (err: any) {
      setError(err.message || '네트워크 오류');
    }
  };

  if (!userInfo) {
    return <Container className="mt-5"><Spinner animation="border" /></Container>;
  }

  return (
    <Container className="mt-5">
      <h1>내 프로필</h1>
      <Alert variant="info">
        신뢰도 점수: {userInfo.trustScore}
      </Alert>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleUpdateProfile}>
        <Form.Group className="mb-3" controlId="formName">
          <Form.Label>이름</Form.Label>
          <Form.Control
            type="text"
            placeholder="이름을 입력하세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>이메일 주소</Form.Label>
          <Form.Control
            type="email"
            value={email}
            readOnly
            disabled
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formContact">
          <Form.Label>연락처 정보</Form.Label>
          <Form.Control
            type="text"
            placeholder="연락처를 입력하세요 (예: 전화번호)"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formRole">
          <Form.Label>역할</Form.Label>
          <Form.Control
            as="select"
            value={role}
            readOnly
            disabled
          >
            <option value="guest">게스트</option>
            <option value="host">호스트</option>
          </Form.Control>
        </Form.Group>

        <Button variant="primary" type="submit">
          프로필 업데이트
        </Button>
      </Form>

      <h2 className="mt-5">내 리뷰</h2>
      {loadingReviews ? (
        <Spinner animation="border" />
      ) : reviewsError ? (
        <Alert variant="danger">{reviewsError.message}</Alert>
      ) : userReviews && userReviews.length === 0 ? (
        <Alert variant="info">아직 작성한 리뷰가 없습니다.</Alert>
      ) : (
        <ListGroup className="mt-3">
          {userReviews?.map(review => (
            <ListGroup.Item key={review.id}>
              <h5>평점: {review.rating}/5</h5>
              <p>{review.comment}</p>
              <small className="text-muted">작성일: {new Date(review.created_at).toLocaleDateString()}</small> {/* Changed createdAt to created_at */}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
};

export default ProfilePage;
