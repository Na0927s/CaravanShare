import React, { useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

interface Caravan {
  id: string;
  hostId: string;
  name: string;
  description: string;
  location: string;
  pricePerDay: number;
  capacity: number;
  amenities: string[];
  photos: string[];
  status: 'available' | 'booked' | 'maintenance';
  createdAt: string;
}

const CaravansPage = () => {
  const [caravans, setCaravans] = useState<Caravan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaravans = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/caravans');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Caravan[] = await response.json();
        setCaravans(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCaravans();
  }, []);

  if (loading) {
    return <div>Loading caravans...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Available Caravans</h1>
      {caravans.length === 0 ? (
        <p>No caravans available at the moment.</p>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {caravans.map((caravan) => (
            <Col key={caravan.id}>
              <Card>
                <Card.Img variant="top" src={caravan.photos[0] || 'https://via.placeholder.com/150'} alt={caravan.name} />
                <Card.Body>
                  <Card.Title>{caravan.name}</Card.Title>
                  <Card.Text>{caravan.description}</Card.Text>
                  <Card.Text>
                    <strong>Location:</strong> {caravan.location}
                  </Card.Text>
                  <Card.Text>
                    <strong>Price per day:</strong> ${caravan.pricePerDay}
                  </Card.Text>
                  <Card.Text>
                    <strong>Capacity:</strong> {caravan.capacity} people
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default CaravansPage;
