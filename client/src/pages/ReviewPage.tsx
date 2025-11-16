import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';

const ReviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const storedUserInfo = localStorage.getItem('userInfo');
    if (!storedUserInfo) {
      setError('You must be logged in to write a review.');
      setSubmitting(false);
      return;
    }
    const guestId = JSON.parse(storedUserInfo).id;

    try {
      const response = await fetch('http://localhost:3001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caravanId: id,
          guestId,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit review');
      }

      alert('Review submitted successfully!');
      navigate(`/caravans/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Write a Review</h1>
      <p>For Caravan ID: {id}</p>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Rating (1-5)</Form.Label>
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
          <Form.Label>Comment</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </Form.Group>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </Form>
    </div>
  );
};

export default ReviewPage;
