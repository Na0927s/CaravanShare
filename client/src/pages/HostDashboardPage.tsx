import React, { useEffect, useState } from 'react';
import { Alert, Table, Button, Spinner } from 'react-bootstrap';
import useFetch from '../hooks/useFetch';
import { Reservation } from '../models/Reservation';
import { User } from '../models/User';

const HostDashboardPage = () => {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Conditionally fetch data only if the user is a host
  const { data: reservations, loading, error, refetch } = useFetch<Reservation[]>(
    (userInfo && userInfo.role === 'host') ? `/reservations/host-reservations?hostId=${userInfo.id}` : null
  );

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const parsedInfo: User = JSON.parse(storedUserInfo);
      if (parsedInfo.role === 'host') {
        setUserInfo(parsedInfo);
      } else {
        setAuthError("You must be a host to view this page.");
      }
    } else {
      setAuthError("You must be logged in to view this page.");
    }
  }, []);

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
      
      refetch(); // Refetch data after successful update
    } catch (err: any) {
      // Displaying the error from the status update action
      setAuthError(err.message);
    }
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  const pageError = authError || error?.message;

  return (
    <div className="container mt-4">
      <h1>Host Dashboard</h1>
      {pageError && <Alert variant="danger">{pageError}</Alert>}
      {!pageError && reservations && reservations.length === 0 ? (
        <p>You have no pending reservations for your caravans.</p>
      ) : !pageError && reservations ? (
        <Table striped bordered hover responsive>
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
                <td>{reservation.caravanId.substring(0, 8)}...</td>
                <td>{reservation.guestId.substring(0, 8)}...</td>
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
      ) : null}
    </div>
  );
};

export default HostDashboardPage;
