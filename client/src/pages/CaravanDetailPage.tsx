import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, ListGroup, Spinner, Alert } from 'react-bootstrap';
import useFetch from '../hooks/useFetch';
import { Caravan } from '../models/Caravan';
import { Review } from '../models/Review';
import { User } from '../models/User';

const CaravanDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: caravan, loading: loadingCaravan, error: errorCaravan } = useFetch<Caravan>(`/caravans/${id}`);
  const { data: reviews, loading: loadingReviews, error: errorReviews } = useFetch<Review[]>(`/caravans/${id}/reviews`);
  
  // Fetch host only when caravan data is available
  const { data: host, loading: loadingHost, error: errorHost } = useFetch<User>(
    caravan ? `/users/${caravan.hostId}` : null
  );

  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 'No reviews yet';

  if (loadingCaravan || loadingReviews) {
    return <Spinner animation="border" />;
  }

  const pageError = errorCaravan || errorReviews || errorHost;
  if (pageError) {
    return <Alert variant="danger">{pageError.message}</Alert>;
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
            <ListGroup.Item>
              Host: {loadingHost ? 'Loading...' : (host ? `${host.name} (Trust Score: ${host.trustScore})` : 'N/A')}
            </ListGroup.Item>
            <ListGroup.Item><strong>Average Rating: {averageRating}</strong></ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>

      <div className="mt-4">
        <h3>Reviews</h3>
        {reviews && reviews.length > 0 ? (
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
