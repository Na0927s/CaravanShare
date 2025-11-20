import React, { useEffect, useState } from 'react';
import { Form, Button, Alert, Container, ListGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { User } from '../models/User';
import { Review } from '../models/Review';

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [role, setRole] = useState<'host' | 'guest'>('guest');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch user reviews using the custom hook
  const { data: userReviews, loading: loadingReviews, error: reviewsError } = useFetch<Review[]>(
    userInfo ? `/reviews/user/${userInfo.id}` : null
  );

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const parsedUserInfo: User = JSON.parse(storedUserInfo);
      setUserInfo(parsedUserInfo);
      setName(parsedUserInfo.name);
      setEmail(parsedUserInfo.email);
      setContact(parsedUserInfo.contact || '');
      setRole(parsedUserInfo.role);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!userInfo) {
      setError('User not logged in.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/users/${userInfo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, contact }), // Only send fields that can be updated
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to update profile');
        return;
      }

      const updatedUserInfo = { ...userInfo, name, contact };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      setUserInfo(updatedUserInfo);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Network error');
    }
  };

  if (!userInfo) {
    return <Container className="mt-5"><Spinner animation="border" /></Container>;
  }

  return (
    <Container className="mt-5">
      <h1>My Profile</h1>
      <Alert variant="info">
        Your Trust Score: {userInfo.trustScore}
      </Alert>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleUpdateProfile}>
        <Form.Group className="mb-3" controlId="formName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            value={email}
            readOnly
            disabled
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formContact">
          <Form.Label>Contact Information</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter contact info (e.g., phone number)"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formRole">
          <Form.Label>Role</Form.Label>
          <Form.Control
            as="select"
            value={role}
            readOnly
            disabled
          >
            <option value="guest">Guest</option>
            <option value="host">Host</option>
          </Form.Control>
        </Form.Group>

        <Button variant="primary" type="submit">
          Update Profile
        </Button>
      </Form>

      <h2 className="mt-5">My Reviews</h2>
      {loadingReviews ? (
        <Spinner animation="border" />
      ) : reviewsError ? (
        <Alert variant="danger">{reviewsError.message}</Alert>
      ) : userReviews && userReviews.length === 0 ? (
        <Alert variant="info">You haven't written any reviews yet.</Alert>
      ) : (
        <ListGroup className="mt-3">
          {userReviews?.map(review => (
            <ListGroup.Item key={review.id}>
              <h5>Rating: {review.rating}/5</h5>
              <p>{review.comment}</p>
              <small className="text-muted">Reviewed on: {new Date(review.createdAt).toLocaleDateString()}</small>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
};

export default ProfilePage;
