import React, { useEffect, useState } from 'react';
import { Col, Row, Button, Alert, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CaravanCard from '../components/CaravanCard';
import useFetch from '../hooks/useFetch';
import { Caravan } from '../models/Caravan';
import { User } from '../models/User';

const CaravansPage = () => {
  const { data: caravans, loading, error, refetch } = useFetch<Caravan[]>('/caravans');
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCaravanId, setSelectedCaravanId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말로 이 카라반을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/caravans/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '카라반 삭제에 실패했습니다.');
      }

      refetch(); // Refetch the caravan list after deletion
    } catch (err: any) {
      setGeneralError(err.message);
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
      setReservationError('시작일과 종료일을 모두 선택해주세요.');
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
        setReservationError(data.message || '예약 생성에 실패했습니다.');
        return;
      }

      handleCloseModal();
      alert('예약이 성공적으로 생성되었습니다!');
      refetch(); // Refetch to update caravan status if it changes
    } catch (err: any) {
      setReservationError(err.message || '네트워크 오류');
    }
  };

  // Filter caravans based on user role
  const filteredCaravans = caravans?.filter(caravan => {
    if (userInfo?.role === 'guest') {
      return caravan.status === 'available';
    }
    // Hosts will see all their caravans, guests only see available ones.
    return true;
  }) || [];


  if (loading) {
    return <div>카라반 목록을 불러오는 중...</div>;
  }

  return (
    <div className="container mt-4">
      {error && <Alert variant="danger">데이터를 불러오는 중 오류가 발생했습니다: {error.message}</Alert>}
      {generalError && <Alert variant="danger" onClose={() => setGeneralError(null)} dismissible>{generalError}</Alert>}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>예약 가능한 카라반</h1>
        {userInfo && userInfo.role === 'host' && (
          <Link to="/caravans/new">
            <Button variant="primary">
            새 카라반 등록
            </Button>
          </Link>
        )}
      </div>
      {filteredCaravans.length === 0 ? (
        <p>현재 예약 가능한 카라반이 없습니다.</p>
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
          <Modal.Title>예약하기</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reservationError && <Alert variant="danger">{reservationError}</Alert>}
          <Form onSubmit={handleReservationSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>시작일</Form.Label>
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
              <Form.Label>종료일</Form.Label>
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
            예약 제출
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CaravansPage;
