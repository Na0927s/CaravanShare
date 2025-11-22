import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';

const ReviewPage = () => {
  const { id: caravan_id } = useParams<{ id: string }>(); // Renamed to caravan_id
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [guest_id, setGuestId] = useState<string | null>(null); // State for guest_id

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const parsedInfo = JSON.parse(storedUserInfo);
      setGuestId(parsedInfo.id);
    } else {
      setError('리뷰를 작성하려면 로그인해야 합니다.');
    }
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!guest_id) { // Check for guest_id
      setError('리뷰를 작성하려면 로그인해야 합니다.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caravan_id, // Changed from caravanId to caravan_id
          guest_id,   // Changed from guestId to guest_id
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '리뷰 제출에 실패했습니다.');
      }

      alert('리뷰가 성공적으로 제출되었습니다!');
      navigate(`/caravans/${caravan_id}`); // Use caravan_id for navigation
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1>리뷰 작성</h1>
      <p>카라반 ID: {caravan_id}</p> {/* Display caravan_id */}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>평점 (1-5)</Form.Label>
          <Form.Control
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>댓글</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </Form.Group>
        <Button type="submit" disabled={submitting}>
          {submitting ? '제출 중...' : '리뷰 제출'}
        </Button>
      </Form>
    </div>
  );
};

export default ReviewPage;
