import React, { useEffect, useState } from 'react';
import { Alert, Table, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { Reservation } from '../models/Reservation';
import { User } from '../models/User';

const MyReservationsPage = () => {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const { data: reservations, loading, error } = useFetch<Reservation[]>(
    userInfo ? `/reservations/my-reservations?guestId=${userInfo.id}` : null
  );

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    } else {
      setAuthError("You must be logged in to view your reservations.");
    }
  }, []);

  if (loading) {
    return <Spinner animation="border" />;
  }

  const pageError = authError || error?.message;

  return (
    <div className="container mt-4">
      <h1>My Reservations</h1>
      {pageError && <Alert variant="danger">{pageError}</Alert>}
      {!pageError && reservations && reservations.length === 0 ? (
        <p>You have no reservations.</p>
      ) : !pageError && reservations ? (
        <Table striped bordered hover responsive>
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
                <td>{reservation.caravanId.substring(0, 8)}...</td>
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
      ) : null}
    </div>
  );
};

export default MyReservationsPage;
