import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: 'host' | 'guest';
}

const CaravanRegistrationPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(2);
  const [location, setLocation] = useState('');
  const [pricePerDay, setPricePerDay] = useState(50000);
  const [imageUrl, setImageUrl] = useState('');
  const [amenities, setAmenities] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const parsedInfo = JSON.parse(storedUserInfo);
      if (parsedInfo.role === 'host') {
        setUserInfo(parsedInfo);
      } else {
        setError('You must be a host to register a caravan.');
        setTimeout(() => navigate('/caravans'), 2000);
      }
    } else {
      setError('You must be logged in to register a caravan.');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!userInfo) {
      setError('User information is not available.');
      return;
    }

    const hostId = userInfo.id;

    try {
      const response = await fetch('http://localhost:3001/api/caravans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          description, 
          capacity, 
          location, 
          pricePerDay, 
          imageUrl, 
          hostId,
          amenities: amenities.split(',').map(item => item.trim()),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to register caravan');
        return;
      }

      setSuccess('Caravan registered successfully! Redirecting to caravans list...');
      setTimeout(() => {
        navigate('/caravans');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Network error');
    }
  };

  if (!userInfo && !error) {
    return <div>Loading...</div>;
  }

  return (
    <div className="registration-container">
      <h1>Register Your Caravan</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {userInfo && (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Caravan Name</Form.Label>
            <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Capacity (people)</Form.Label>
            <Form.Control type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Location</Form.Label>
            <Form.Control type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Price per Day (KRW)</Form.Label>
            <Form.Control type="number" value={pricePerDay} onChange={(e) => setPricePerDay(Number(e.target.value))} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Image URL</Form.Label>
            <Form.Control type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <Form.Text className="text-muted">If left blank, a placeholder image will be used.</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Amenities (comma-separated)</Form.Label>
            <Form.Control type="text" value={amenities} onChange={(e) => setAmenities(e.target.value)} />
            <Form.Text className="text-muted">e.g., Wi-Fi, Kitchen, Bathroom</Form.Text>
          </Form.Group>
          <Button variant="primary" type="submit">
            Register Caravan
          </Button>
        </Form>
      )}
    </div>
  );
};

export default CaravanRegistrationPage;
