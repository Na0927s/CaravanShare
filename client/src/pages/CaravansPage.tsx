import React, { useEffect, useState } from 'react';
import { Col, Row, Button, Alert, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CaravanCard from '../components/CaravanCard';

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
  status: 'available' | 'reserved' | 'maintenance'; // Add status field
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: 'host' | 'guest';
}

const CaravansPage = () => {
  const [caravans, setCaravans] = useState<Caravan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCaravanId, setSelectedCaravanId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reservationError, setReservationError] = useState<string | null>(null);

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

    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }

    fetchCaravans();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this caravan?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/caravans/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete caravan');
      }

      setCaravans(caravans.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReserve = (id: string) => {
    setSelectedCaravanId(id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCaravanId(null);
    setStartDate(null);
    setEndDate(null);
    setReservationError(null);
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReservationError(null);

    if (!selectedCaravanId || !userInfo || !startDate || !endDate) {
      setReservationError('Please select both start and end dates.');
      return;
    }

    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];

    try {
      const response = await fetch('http://localhost:3001/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caravanId: selectedCaravanId,
          guestId: userInfo.id,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setReservationError(data.message || 'Failed to create reservation.');
        return;
      }

      handleCloseModal();
      alert('Reservation created successfully!');
    } catch (err: any) {
      setReservationError(err.message || 'Network error');
    }
  };

  // Filter caravans based on user role
  const filteredCaravans = caravans.filter(caravan => {
    if (userInfo?.role === 'guest') {
      return caravan.status === 'available';
    }
    // Hosts will see all caravans, regardless of status
    return true;
  });


  if (loading) {
    return <div>Loading caravans...</div>;
  }

  return (
    <div className="container mt-4">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Available Caravans</h1>
        {userInfo && userInfo.role === 'host' && (
          <Link to="/caravans/new">
            <Button variant="primary">
              Register New Caravan
            </Button>
          </Link>
        )}
      </div>
      {filteredCaravans.length === 0 ? (
        <p>No caravans available at the moment.</p>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredCaravans.map((caravan) => (
            <Col key={caravan.id}>
              <CaravanCard
                caravan={caravan}
                currentUserId={userInfo ? userInfo.id : null}
                onDelete={handleDelete}
                onReserve={handleReserve}
              />
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Make a Reservation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reservationError && <Alert variant="danger">{reservationError}</Alert>}
          <Form onSubmit={handleReservationSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                minDate={new Date()} // Cannot select past dates
                dateFormat="yyyy-MM-dd"
                className="form-control" // Apply Bootstrap styling
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate || new Date()} // End date cannot be before start date
                dateFormat="yyyy-MM-dd"
                className="form-control" // Apply Bootstrap styling
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit Reservation
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CaravansPage;
