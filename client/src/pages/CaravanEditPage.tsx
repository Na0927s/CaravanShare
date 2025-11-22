import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Caravan } from '../models/Caravan';
import useFetch from '../hooks/useFetch';

const CaravanEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: fetchedCaravan, loading, error: fetchError } = useFetch<Caravan>(`/caravans/${id}`);
  
  const [caravan, setCaravan] = useState<Partial<Caravan>>({});
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (fetchedCaravan) {
      setCaravan(fetchedCaravan);
    }
  }, [fetchedCaravan]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCaravan(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError(null);
    setSuccess(null);

    try {
      const response = await fetch(`http://localhost:3001/api/caravans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caravan),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '카라반 정보 업데이트에 실패했습니다.');
      }

      setSuccess('카라반 정보가 성공적으로 업데이트되었습니다! 목록으로 돌아갑니다...');
      setTimeout(() => {
        navigate('/caravans');
      }, 2000);
    } catch (err: any) {
      setUpdateError(err.message);
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (fetchError) return <Alert variant="danger">데이터 로딩 오류: {fetchError.message}</Alert>;

  return (
    <div className="container mt-4">
      <h1>카라반 정보 수정</h1>
      {updateError && <Alert variant="danger">{updateError}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>카라반 이름</Form.Label>
          <Form.Control type="text" name="name" value={caravan.name || ''} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>설명</Form.Label>
          <Form.Control as="textarea" name="description" rows={3} value={caravan.description || ''} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>수용 인원 (명)</Form.Label>
          <Form.Control type="number" name="capacity" value={caravan.capacity || 0} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>위치</Form.Label>
          <Form.Control type="text" name="location" value={caravan.location || ''} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>일일 요금 (원)</Form.Label>
          <Form.Control type="number" name="price_per_day" value={caravan.price_per_day || 0} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>이미지 URL</Form.Label>
          <Form.Control type="text" name="image_url" value={caravan.image_url || ''} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>상태</Form.Label>
          <Form.Control as="select" name="status" value={caravan.status || 'available'} onChange={handleChange}>
            <option value="available">예약 가능</option>
            <option value="maintenance">정비 중</option>
            <option value="reserved">예약됨</option>
          </Form.Control>
        </Form.Group>
        <Button variant="primary" type="submit">
          변경 내용 저장
        </Button>
      </Form>
    </div>
  );
};

export default CaravanEditPage;
