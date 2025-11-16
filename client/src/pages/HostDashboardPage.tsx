import React, { useEffect, useState } from 'react';
import { Alert, Table, Button } from 'react-bootstrap';

interface Reservation {
  id: string;
  caravanId: string;
  guestId: string;
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

const HostDashboardPage = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const parsedInfo = JSON.parse(storedUserInfo);
      if (parsedInfo.role === 'host') {
        setUserInfo(parsedInfo);
        fetchHostReservations(parsedInfo.id);
      } else {
        setError("You must be a host to view this page.");
        setLoading(false);
      }
    } else {
      setError("You must be logged in to view this page.");
      setLoading(false);
    }
  }, []);

  const fetchHostReservations = async (hostId: string) => {
    try {
      // This endpoint needs to be created on the backend
      const response = await fetch(`http://localhost:3001/api/reservations/host-reservations?hostId=${hostId}`);
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

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`http://localhost:3001/api/reservations/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update reservation status');
      }

      const updatedReservation = await response.json();
      setReservations(reservations.map(r => r.id === id ? updatedReservation : r));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div>Loading host dashboard...</div>;
  }

  return (
    <div className="container mt-4">
      <h1>Host Dashboard</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {userInfo && reservations.length === 0 && !error ? (
        <p>You have no pending reservations for your caravans.</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Caravan ID</th>
              <th>Guest ID</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation, index) => (
              <tr key={reservation.id}>
                <td>{index + 1}</td>
                <td>{reservation.caravanId}</td>
                <td>{reservation.guestId}</td>
                <td>{new Date(reservation.startDate).toLocaleDateString()}</td>
                <td>{new Date(reservation.endDate).toLocaleDateString()}</td>
                <td>{reservation.totalPrice.toLocaleString()} KRW</td>
                <td>{reservation.status}</td>
                <td>
                  {reservation.status === 'pending' && (
                    <>
                      <Button variant="success" size="sm" onClick={() => handleStatusUpdate(reservation.id, 'approved')}>
                        Approve
                      </Button>{' '}
                      <Button variant="danger" size="sm" onClick={() => handleStatusUpdate(reservation.id, 'rejected')}>
                        Reject
                      </Button>
                    </>
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

export default HostDashboardPage;
