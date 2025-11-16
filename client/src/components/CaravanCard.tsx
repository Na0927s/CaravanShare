import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

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

interface CaravanCardProps {
  caravan: Caravan;
  currentUserId: string | null;
  onDelete: (id: string) => void;
  onReserve: (id: string) => void;
}

const CaravanCard: React.FC<CaravanCardProps> = ({ caravan, currentUserId, onDelete, onReserve }) => {
  const isOwner = caravan.hostId === currentUserId;

  return (
    <Card style={{ width: '18rem', margin: '1rem' }}>
      <Card.Img variant="top" src={caravan.imageUrl} alt={caravan.name} />
      <Card.Body>
        <Card.Title>{caravan.name}</Card.Title>
        <Card.Text>
          {caravan.description}
          <br />
          수용 인원: {caravan.capacity}명
          <br />
          위치: {caravan.location}
          <br />
          가격: {caravan.pricePerDay.toLocaleString()}원/1일
        </Card.Text>
        <div className="d-flex justify-content-between">
          <Button variant="primary">자세히 보기</Button>
          {!isOwner && currentUserId && (
            <Button variant="success" onClick={() => onReserve(caravan.id)}>예약하기</Button>
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
