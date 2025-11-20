import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';

interface Reservation {
  id: string;
  caravanId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'awaiting_payment' | 'confirmed';
  totalPrice: number;
}

const PaymentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState<boolean>(false);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        // This is a bit of a workaround as we don't have a getReservationById endpoint yet.
        // We fetch all reservations for the user and find the one with the matching id.
        const storedUserInfo = localStorage.getItem('userInfo');
        if (!storedUserInfo) {
          throw new Error('결제를 진행하려면 로그인해야 합니다.');
        }
        const guestId = JSON.parse(storedUserInfo).id;
        const response = await fetch(`http://localhost:3001/api/reservations/my-reservations?guestId=${guestId}`);
        if (!response.ok) {
          throw new Error(`HTTP 오류! 상태: ${response.status}`);
        }
        const data: Reservation[] = await response.json();
        const currentReservation = data.find(r => r.id === id);
        if (currentReservation) {
          setReservation(currentReservation);
        } else {
          throw new Error('예약을 찾을 수 없습니다.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [id]);

  const handleConfirmPayment = async () => {
    setPaying(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/reservations/${id}/pay`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '결제 실패');
      }

      alert('결제가 성공적으로 완료되었습니다! 예약이 확정되었습니다.');
      navigate('/my-reservations');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <Spinner as="span" animation="border" size="sm" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!reservation) {
    return <Alert variant="warning">예약을 찾을 수 없습니다.</Alert>;
  }

  return (
    <div className="container mt-4">
      <h1>결제 확인</h1>
      <Card>
        <Card.Header as="h5">예약 상세 정보</Card.Header>
        <Card.Body>
          <Card.Text>
            <strong>예약 ID:</strong> {reservation.id}
          </Card.Text>
          <Card.Text>
            <strong>카라반 ID:</strong> {reservation.caravanId}
          </Card.Text>
          <Card.Text>
            <strong>날짜:</strong> {new Date(reservation.startDate).toLocaleDateString()} - {new Date(reservation.endDate).toLocaleDateString()}
          </Card.Text>
          <Card.Title>
            총 금액: {reservation.totalPrice.toLocaleString()} 원
          </Card.Title>
          {reservation.status === 'awaiting_payment' ? (
            <Button onClick={handleConfirmPayment} disabled={paying}>
              {paying ? <Spinner as="span" animation="border" size="sm" /> : '결제 확인'}
            </Button>
          ) : (
            <Alert variant="info">이 예약은 현재 결제가 필요하지 않습니다. 현재 상태: {reservation.status}</Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PaymentPage;
