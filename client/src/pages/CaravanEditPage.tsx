import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Caravan } from '../models/Caravan';
import useFetch from '../hooks/useFetch';

const CaravanEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: fetchedCaravan, loading, error: fetchError } = useFetch<Caravan>(`/caravans/${id}`);
  
  const [caravan, setCaravan] = useState<Partial<Caravan>>({});
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (fetchedCaravan) {
      setCaravan(fetchedCaravan);
    }
  }, [fetchedCaravan]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCaravan(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError(null);
    setSuccess(null);

    try {
      const response = await fetch(`http://localhost:3001/api/caravans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caravan),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update caravan');
      }

      setSuccess('Caravan updated successfully! Redirecting...');
      setTimeout(() => {
        navigate('/caravans');
      }, 2000);
    } catch (err: any) {
      setUpdateError(err.message);
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (fetchError) return <Alert variant="danger">Error fetching data: {fetchError.message}</Alert>;

  return (
    <div className="container mt-4">
      <h1>Edit Caravan</h1>
      {updateError && <Alert variant="danger">{updateError}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Caravan Name</Form.Label>
          <Form.Control type="text" name="name" value={caravan.name || ''} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" name="description" rows={3} value={caravan.description || ''} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Capacity (people)</Form.Label>
          <Form.Control type="number" name="capacity" value={caravan.capacity || 0} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Location</Form.Label>
          <Form.Control type="text" name="location" value={caravan.location || ''} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Price per Day (KRW)</Form.Label>
          <Form.Control type="number" name="pricePerDay" value={caravan.pricePerDay || 0} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Image URL</Form.Label>
          <Form.Control type="text" name="imageUrl" value={caravan.imageUrl || ''} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Control as="select" name="status" value={caravan.status || 'available'} onChange={handleChange}>
            <option value="available">Available</option>
            <option value="maintenance">Under Maintenance</option>
            <option value="reserved">Reserved</option>
          </Form.Control>
        </Form.Group>
        <Button variant="primary" type="submit">
          Save Changes
        </Button>
      </Form>
    </div>
  );
};

export default CaravanEditPage;
