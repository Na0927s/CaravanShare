import React, { useEffect, useState } from 'react';
import { Form, Button, Alert, Container, ListGroup, Spinner, Badge, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { User } from '../models/User';
import { Review } from '../models/Review';
import axios from 'axios';

const ProfilePage = () => {
  const [localUserInfo, setLocalUserInfo] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setLocalUserInfo(JSON.parse(storedUserInfo));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const { data: user, loading: loadingUser, error: userError, refetch: refetchUser } = useFetch<User>(
    localUserInfo ? `http://localhost:3001/api/users/${localUserInfo.id}` : null
  );

  const { data: userReviews, loading: loadingReviews, error: reviewsError } = useFetch<Review[]>(
    localUserInfo ? `/reviews/user/${localUserInfo.id}` : null
  );

  useEffect(() => {
    if (user) {
      setName(user.name);
      setContact(user.contact || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(null);

    if (!localUserInfo) {
      setUpdateError('사용자가 로그인되어 있지 않습니다.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/users/${localUserInfo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, contact }),
      });

      const data = await response.json();

      if (!response.ok) {
        setUpdateError(data.message || '프로필 업데이트에 실패했습니다.');
        return;
      }

      const updatedUserInfo = { ...localUserInfo, name, contact };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      refetchUser();
      setUpdateSuccess('프로필이 성공적으로 업데이트되었습니다!');
    } catch (err: any) {
      setUpdateError(err.message || '네트워크 오류');
    }
  };

  const handleRequestVerification = async () => {
    setUpdateError(null);
    setUpdateSuccess(null);
    if (!user) return;

    try {
      const response = await axios.post('http://localhost:3001/api/users/request-verification', {
        userId: user.id,
      });

      if (response.status === 200) {
        setUpdateSuccess('신원 확인 요청을 보냈습니다. 관리자 승인을 기다려주세요.');
        refetchUser(); // Refetch user data to get the 'pending' status
      }
    } catch (err: any) {
      setUpdateError(err.response?.data?.message || '신원 확인 요청에 실패했습니다.');
    }
  };

  const handleDeleteAccount = async () => {
    setUpdateError(null);
    setUpdateSuccess(null);

    if (!localUserInfo) {
      setUpdateError('사용자가 로그인되어 있지 않습니다.');
      return;
    }

    const confirmDelete = window.confirm(
      '정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 카라반 및 리뷰 정보가 영구적으로 삭제됩니다.'
    );

    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:3001/api/users/${localUserInfo.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || '계정 삭제에 실패했습니다.');
        }

        // Clear user info and log out
        localStorage.removeItem('userInfo');
        // Optionally, you might want to clear other stored data
        // localStorage.clear(); 
        
        alert('계정이 성공적으로 삭제되었습니다.');
        navigate('/'); // Redirect to homepage
      } catch (err: any) {
        setUpdateError(err.message || '네트워크 오류가 발생했습니다.');
      }
    }
  };

  const renderVerificationStatus = () => {
    if (!user) return null;

    switch (user.identity_verification_status) {
      case 'verified':
        return <Badge bg="success">확인 완료</Badge>;
      case 'pending':
        return <Badge bg="warning">확인 대기중</Badge>;
      case 'not_verified':
        return (
          <Button variant="outline-primary" size="sm" onClick={handleRequestVerification}>
            신원 확인 요청
          </Button>
        );
      default:
        return <Badge bg="secondary">알 수 없음</Badge>;
    }
  };

  if (loadingUser || !user) {
    return <Container className="mt-5"><Spinner animation="border" /></Container>;
  }
  
  if (userError) {
    return <Container className="mt-5"><Alert variant="danger">프로필 정보를 불러오는 데 실패했습니다: {userError.message}</Alert></Container>;
  }

  return (
    <Container className="mt-5">
      <h1>내 프로필</h1>
      {updateError && <Alert variant="danger">{updateError}</Alert>}
      {updateSuccess && <Alert variant="success">{updateSuccess}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>계정 정보</Card.Title>
          <ListGroup variant="flush">
            <ListGroup.Item><strong>이메일:</strong> {user.email}</ListGroup.Item>
            <ListGroup.Item><strong>역할:</strong> {user.role === 'host' ? '호스트' : '게스트'}</ListGroup.Item>
            <ListGroup.Item><strong>신뢰도 점수:</strong> {user.trust_score}</ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between align-items-center">
              <strong>신원 확인 상태:</strong>
              {renderVerificationStatus()}
            </ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>
      
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

        <Form.Group className="mb-3" controlId="formContact">
          <Form.Label>연락처 정보</Form.Label>
          <Form.Control
            type="text"
            placeholder="연락처를 입력하세요 (예: 전화번호)"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
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
              <small className="text-muted">작성일: {new Date(review.created_at).toLocaleDateString()}</small>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      <Card className="mt-5 border-danger">
        <Card.Body>
          <Card.Title className="text-danger">계정 관리</Card.Title>
          <Card.Text>
            계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
          </Card.Text>
          <Button variant="danger" onClick={handleDeleteAccount}>
            회원 탈퇴
          </Button>
        </Card.Body>
      </Card>

    </Container>
  );
};

export default ProfilePage;
