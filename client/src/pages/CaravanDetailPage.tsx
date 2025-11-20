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
    : '아직 리뷰가 없습니다.';

  if (loadingCaravan || loadingReviews) {
    return <Spinner animation="border" />;
  }

  const pageError = errorCaravan || errorReviews || errorHost;
  if (pageError) {
    return <Alert variant="danger">{pageError.message}</Alert>;
  }

  if (!caravan) {
    return <Alert variant="warning">카라반을 찾을 수 없습니다.</Alert>;
  }

  return (
    <div className="container mt-4">
      <Card>
        <Card.Img variant="top" src={caravan.imageUrl} alt={caravan.name} style={{ maxHeight: '400px', objectFit: 'cover' }} />
        <Card.Body>
          <Card.Title as="h2">{caravan.name}</Card.Title>
          <Card.Text>{caravan.description}</Card.Text>
          <ListGroup variant="flush">
            <ListGroup.Item>수용 인원: {caravan.capacity}명</ListGroup.Item>
            <ListGroup.Item>위치: {caravan.location}</ListGroup.Item>
            <ListGroup.Item>편의시설: {caravan.amenities.join(', ')}</ListGroup.Item>
            <ListGroup.Item>가격: {caravan.pricePerDay.toLocaleString()}원 / 1일</ListGroup.Item>
            <ListGroup.Item>
              호스트: {loadingHost ? '로딩 중...' : (host ? `${host.name} (신뢰도 점수: ${host.trustScore})` : '정보 없음')}
            </ListGroup.Item>
            <ListGroup.Item><strong>평균 평점: {averageRating}</strong></ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>

      <div className="mt-4">
        <h3>리뷰</h3>
        {reviews && reviews.length > 0 ? (
          <ListGroup>
            {reviews.map(review => (
              <ListGroup.Item key={review.id}>
                <h5>평점: {review.rating}/5</h5>
                <p>{review.comment}</p>
                <small className="text-muted">작성자: 게스트 {review.guestId.substring(0, 8)}... | 작성일: {new Date(review.createdAt).toLocaleDateString()}</small>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p>이 카라반에 대한 리뷰가 아직 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default CaravanDetailPage;
