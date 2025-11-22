import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Caravan } from '../models/Caravan';

interface CaravanCardProps {
  caravan: Caravan;
  currentUserId: string | null;
  onDelete: (id: string) => void;
  onReserve: (id: string) => void;
}

const CaravanCard: React.FC<CaravanCardProps> = ({ caravan, currentUserId, onDelete, onReserve }) => {
  const isOwner = caravan.host_id === currentUserId; // Changed from hostId to host_id

  const getStatusText = (status: 'available' | 'reserved' | 'maintenance') => {
    switch (status) {
      case 'available':
        return '이용 가능';
      case 'reserved':
        return '예약됨';
      case 'maintenance':
        return '정비 중';
      default:
        return status;
    }
  };

  return (
    <Card className="h-100">
      <Card.Img variant="top" src={caravan.image_url} alt={caravan.name} style={{ height: '200px', objectFit: 'cover' }} /> {/* Changed from imageUrl to image_url */}
      <Card.Body className="d-flex flex-column">
        <Card.Title>{caravan.name}</Card.Title>
        <Card.Text as="div">
          <small className="text-muted">{caravan.location}</small>
          <div>
            <strong>수용 인원:</strong> {caravan.capacity}명
          </div>
          <div>
            <strong>가격:</strong> {caravan.price_per_day.toLocaleString()}원/1일 {/* Changed from pricePerDay to price_per_day */}
          </div>
          <div>
            <strong>상태:</strong> {getStatusText(caravan.status)}
          </div>
        </Card.Text>
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <Link to={`/caravans/${caravan.id}`}>
            <Button variant="primary" size="sm">자세히 보기</Button>
          </Link>
          {!isOwner && currentUserId && caravan.status === 'available' && (
            <Button variant="success" size="sm" onClick={() => onReserve(caravan.id)}>예약하기</Button>
          )}
          {isOwner && (
            <div className="d-flex gap-2">
              <Link to={`/caravans/${caravan.id}/edit`}>
                <Button variant="secondary" size="sm">수정</Button>
              </Link>
              <Button variant="danger" size="sm" onClick={() => onDelete(caravan.id)}>삭제</Button>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default CaravanCard;
