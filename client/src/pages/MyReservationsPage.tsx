import React, { useEffect, useState } from 'react';
import { Alert, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface Reservation {
  id: string;
  caravanId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'awaiting_payment' | 'confirmed';
  totalPrice: number;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: 'host' | 'guest';
}

const MyReservationsPage = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const parsedInfo = JSON.parse(storedUserInfo);
      setUserInfo(parsedInfo);
      fetchReservations(parsedInfo.id);
    } else {
      setError("You must be logged in to view your reservations.");
      setLoading(false);
    }
  }, []);

  const fetchReservations = async (guestId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/reservations/my-reservations?guestId=${guestId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Reservation[] = await response.json();
      setReservations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading your reservations...</div>;
  }

  return (
    <div className="container mt-4">
      <h1>My Reservations</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {reservations.length === 0 && !error ? (
        <p>You have no reservations.</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Caravan ID</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation, index) => (
              <tr key={reservation.id}>
                <td>{index + 1}</td>
                <td>{reservation.caravanId}</td>
                <td>{new Date(reservation.startDate).toLocaleDateString()}</td>
                <td>{new Date(reservation.endDate).toLocaleDateString()}</td>
                <td>{reservation.totalPrice.toLocaleString()} KRW</td>
                <td>{reservation.status}</td>
                <td>
                  {reservation.status === 'awaiting_payment' && (
                    <Link to={`/payment/${reservation.id}`}>
                      <Button variant="success" size="sm">Pay Now</Button>
                    </Link>
                  )}
                  {reservation.status === 'confirmed' && (
                    <Link to={`/review/${reservation.caravanId}`}>
                      <Button variant="info" size="sm">Write Review</Button>
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default MyReservationsPage;
