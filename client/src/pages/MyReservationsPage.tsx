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
      setAuthError("예약 내역을 보려면 로그인해야 합니다.");
    }
  }, []);

  const getStatusText = (status: Reservation['status']) => {
    switch (status) {
      case 'pending':
        return '승인 대기 중';
      case 'approved':
        return '승인';
      case 'rejected':
        return '거절';
      case 'awaiting_payment':
        return '결제 대기 중';
      case 'confirmed':
        return '확정';
      case 'cancelled':
        return '취소';
      default:
        return status;
    }
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  const pageError = authError || error?.message;

  return (
    <div className="container mt-4">
      <h1>내 예약</h1>
      {pageError && <Alert variant="danger">{pageError}</Alert>}
      {!pageError && reservations && reservations.length === 0 ? (
        <p>예약 내역이 없습니다.</p>
      ) : !pageError && reservations ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>카라반 ID</th>
              <th>시작일</th>
              <th>종료일</th>
              <th>총 금액</th>
              <th>상태</th>
              <th>조치</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation, index) => (
              <tr key={reservation.id}>
                <td>{index + 1}</td>
                <td>{reservation.caravanId.substring(0, 8)}...</td>
                <td>{new Date(reservation.startDate).toLocaleDateString()}</td>
                <td>{new Date(reservation.endDate).toLocaleDateString()}</td>
                <td>{reservation.totalPrice.toLocaleString()} 원</td>
                <td>{getStatusText(reservation.status)}</td>
                <td>
                  {reservation.status === 'awaiting_payment' && (
                    <Link to={`/payment/${reservation.id}`}>
                      <Button variant="success" size="sm">지금 결제</Button>
                    </Link>
                  )}
                  {reservation.status === 'confirmed' && (
                    <Link to={`/review/${reservation.caravanId}`}>
                      <Button variant="info" size="sm">리뷰 작성</Button>
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
