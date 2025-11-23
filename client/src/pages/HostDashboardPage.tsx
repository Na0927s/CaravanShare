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
        setAuthError("이 페이지를 보려면 호스트여야 합니다.");
      }
    } else {
      setAuthError("이 페이지를 보려면 로그인해야 합니다.");
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
        throw new Error(data.message || '예약 상태 업데이트에 실패했습니다.');
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
      <h1>호스트 대시보드</h1>
      {pageError && <Alert variant="danger">{pageError}</Alert>}
      {!pageError && reservations && reservations.length === 0 ? (
        <p>카라반에 대한 예약 요청이 없습니다.</p>
      ) : !pageError && reservations ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>카라반 ID</th>
              <th>게스트 ID</th>
              <th>시작일</th>
              <th>종료일</th>
              <th>총 금액</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation, index) => (
              <tr key={reservation.id}>
                <td>{index + 1}</td><td>{reservation.caravan_id.substring(0, 8)}...</td><td>{reservation.guest_id.substring(0, 8)}...</td><td>{new Date(reservation.start_date).toLocaleDateString()}</td><td>{new Date(reservation.end_date).toLocaleDateString()}</td><td>{reservation.total_price.toLocaleString()} 원</td><td>{getStatusText(reservation.status)}</td>
                <td>
                  {reservation.status === 'pending' && (
                    <>
                      <Button variant="success" size="sm" className="me-2" onClick={() => handleStatusUpdate(reservation.id, 'approved')}>
                        승인
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleStatusUpdate(reservation.id, 'rejected')}>
                        거절
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
