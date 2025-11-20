import React, { useEffect, useState } from 'react';
import { Container, Alert, ListGroup, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { Reservation } from '../models/Reservation';
import { Caravan } from '../models/Caravan';
import { User } from '../models/User';

const PaymentHistoryPage = () => {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const navigate = useNavigate();

  const { data: paymentHistory, loading: loadingHistory, error: errorHistory } = useFetch<Reservation[]>(
    userInfo ? `/reservations/payment-history/${userInfo.id}` : null
  );
  const { data: caravans, loading: loadingCaravans, error: errorCaravans } = useFetch<Caravan[]>('/caravans');

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const getCaravanDetails = (caravanId: string) => {
    return caravans?.find(c => c.id === caravanId);
  };

  if (loadingHistory || loadingCaravans) {
    return <Container className="mt-5"><Spinner animation="border" /></Container>;
  }

  const pageError = errorHistory || errorCaravans;

  return (
    <Container className="mt-5">
      <h1>결제 내역</h1>
      {pageError && <Alert variant="danger">{pageError.message}</Alert>}

      {paymentHistory && paymentHistory.length === 0 ? (
        <Alert variant="info">결제 내역이 없습니다.</Alert>
      ) : paymentHistory ? (
        <ListGroup>
          {paymentHistory.map((reservation) => {
            const caravan = getCaravanDetails(reservation.caravanId);
            return (
              <ListGroup.Item key={reservation.id} className="mb-3 border-0">
                <Card>
                  <Card.Body className="d-flex">
                    {caravan?.imageUrl && (
                      <img src={caravan.imageUrl} alt={caravan.name} style={{ width: '150px', height: '100px', objectFit: 'cover', marginRight: '20px' }} />
                    )}
                    <div>
                      <Card.Title>{caravan ? caravan.name : '알 수 없는 카라반'}</Card.Title>
                      <Card.Text as="div">
                        <small className="text-muted">
                          <strong>예약 ID:</strong> {reservation.id.substring(0,8)}...
                          <br />
                          <strong>날짜:</strong> {new Date(reservation.startDate).toLocaleDateString()} ~ {new Date(reservation.endDate).toLocaleDateString()}
                          <br />
                          <strong>총 결제 금액:</strong> {reservation.totalPrice.toLocaleString()} 원
                        </small>
                      </Card.Text>
                    </div>
                  </Card.Body>
                </Card>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      ) : null}
    </Container>
  );
};

export default PaymentHistoryPage;
