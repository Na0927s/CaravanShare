import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import CaravanCard from '../components/CaravanCard'; // Import CaravanCard

interface Caravan {
  id: string;
  name: string;
  description: string;
  capacity: number;
  amenities: string[];
  location: string;
  pricePerDay: number;
  imageUrl: string; // Changed from photos: string[] to imageUrl: string
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
    <div className="container mt-4">
      <h1>Available Caravans</h1>
      {caravans.length === 0 ? (
        <p>No caravans available at the moment.</p>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {caravans.map((caravan) => (
            <Col key={caravan.id}>
              <CaravanCard caravan={caravan} /> {/* Use CaravanCard component */}
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default CaravansPage;
