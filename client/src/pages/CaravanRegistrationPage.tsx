import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: 'host' | 'guest';
}

const CaravanRegistrationPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(2);
  const [location, setLocation] = useState('');
  const [pricePerDay, setPricePerDay] = useState(50000);
  const [imageUrl, setImageUrl] = useState('');
  const [amenities, setAmenities] = useState('');
  const [status, setStatus] = useState<'available' | 'maintenance'>('available'); // Add status state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const parsedInfo = JSON.parse(storedUserInfo);
      if (parsedInfo.role === 'host') {
        setUserInfo(parsedInfo);
      } else {
        setError('카라반을 등록하려면 호스트여야 합니다.');
        setTimeout(() => navigate('/caravans'), 2000);
      }
    } else {
      setError('카라반을 등록하려면 먼저 로그인해야 합니다.');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!userInfo) {
      setError('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    const host_id = userInfo.id; // Changed to snake_case

    try {
      const response = await fetch('http://localhost:3001/api/caravans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          capacity,
          location,
          price_per_day: pricePerDay, // Changed to snake_case
          image_url: imageUrl,     // Changed to snake_case
          host_id,                 // Changed to snake_case
          amenities: amenities.split(',').map(item => item.trim()),
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || '카라반 등록에 실패했습니다.');
        return;
      }

      setSuccess('카라반이 성공적으로 등록되었습니다! 카라반 목록으로 이동합니다...');
      setTimeout(() => {
        navigate('/caravans');
      }, 2000);
    } catch (err: any) {
      setError(err.message || '네트워크 오류');
    }
  };

  if (!userInfo && !error) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="registration-container">
      <h1>카라반 등록</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {userInfo && (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>카라반 이름</Form.Label>
            <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>설명</Form.Label>
            <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>수용 인원 (명)</Form.Label>
            <Form.Control type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>위치</Form.Label>
            <Form.Control type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>일일 요금 (원)</Form.Label>
            <Form.Control type="number" value={pricePerDay} onChange={(e) => setPricePerDay(Number(e.target.value))} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>이미지 URL</Form.Label>
            <Form.Control type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <Form.Text className="text-muted">비워두시면 기본 이미지로 대체됩니다.</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>편의시설 (쉼표로 구분)</Form.Label>
            <Form.Control type="text" value={amenities} onChange={(e) => setAmenities(e.target.value)} />
            <Form.Text className="text-muted">예: 와이파이, 주방, 화장실</Form.Text>
          </Form.Group>
          {/* New Status Field */}
          <Form.Group className="mb-3">
            <Form.Label>상태</Form.Label>
            <Form.Control as="select" value={status} onChange={(e) => setStatus(e.target.value as 'available' | 'maintenance')}>
              <option value="available">예약 가능</option>
              <option value="maintenance">정비 중</option>
            </Form.Control>
          </Form.Group>
          <Button variant="primary" type="submit">
            카라반 등록
          </Button>
        </Form>
      )}
    </div>
  );
};

export default CaravanRegistrationPage;