import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, ListGroup, Spinner, Alert } from 'react-bootstrap';

interface Caravan {
  id: string;
  name: string;
  description: string;
  capacity: number;
  amenities: string[];
  location: string;
  pricePerDay: number;
  imageUrl: string;
  hostId: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  guestId: string;
  createdAt: string;
}

const CaravanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [caravan, setCaravan] = useState<Caravan | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaravanDetails = async () => {
      try {
        const caravanRes = await fetch(`http://localhost:3001/api/caravans/${id}`);
        if (!caravanRes.ok) throw new Error('Caravan not found');
        const caravanData = await caravanRes.json();
        setCaravan(caravanData);

        const reviewsRes = await fetch(`http://localhost:3001/api/caravans/${id}/reviews`);
        if (!reviewsRes.ok) throw new Error('Could not fetch reviews');
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCaravanDetails();
  }, [id]);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 'No reviews yet';

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!caravan) {
    return <Alert variant="warning">Caravan not found.</Alert>;
  }

  return (
    <div className="container mt-4">
      <Card>
        <Card.Img variant="top" src={caravan.imageUrl} alt={caravan.name} style={{ maxHeight: '400px', objectFit: 'cover' }} />
        <Card.Body>
          <Card.Title as="h2">{caravan.name}</Card.Title>
          <Card.Text>{caravan.description}</Card.Text>
          <ListGroup variant="flush">
            <ListGroup.Item>Capacity: {caravan.capacity} people</ListGroup.Item>
            <ListGroup.Item>Location: {caravan.location}</ListGroup.Item>
            <ListGroup.Item>Amenities: {caravan.amenities.join(', ')}</ListGroup.Item>
            <ListGroup.Item>Price: {caravan.pricePerDay.toLocaleString()} KRW / day</ListGroup.Item>
            <ListGroup.Item><strong>Average Rating: {averageRating}</strong></ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>

      <div className="mt-4">
        <h3>Reviews</h3>
        {reviews.length > 0 ? (
          <ListGroup>
            {reviews.map(review => (
              <ListGroup.Item key={review.id}>
                <h5>Rating: {review.rating}/5</h5>
                <p>{review.comment}</p>
                <small className="text-muted">By Guest {review.guestId.substring(0, 8)}... on {new Date(review.createdAt).toLocaleDateString()}</small>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p>No reviews for this caravan yet.</p>
        )}
      </div>
    </div>
  );
};

export default CaravanDetailPage;
