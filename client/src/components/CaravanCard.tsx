import React from 'react';
import { Card, Button } from 'react-bootstrap';

interface CaravanCardProps {
  caravan: {
    id: string;
    name: string;
    description: string;
    capacity: number;
    amenities: string[];
    location: string;
    pricePerDay: number;
    imageUrl: string;
  };
}

const CaravanCard: React.FC<CaravanCardProps> = ({ caravan }) => {
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
        <Button variant="primary">자세히 보기</Button>
      </Card.Body>
    </Card>
  );
};

export default CaravanCard;
