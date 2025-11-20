import React, { useEffect, useState } from 'react';
import { Form, Button, Alert, Container, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: 'host' | 'guest';
  contact?: string; // Optional contact information
  trustScore: number; // Add trustScore
}

interface Review {
  id: string;
  caravanId: string;
  guestId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [role, setRole] = useState<'host' | 'guest'>('guest');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    let parsedUserInfo: UserInfo | null = null;
    if (storedUserInfo) {
      parsedUserInfo = JSON.parse(storedUserInfo);
      setUserInfo(parsedUserInfo);
      if (parsedUserInfo) { // Add null check here
        setName(parsedUserInfo.name);
        setEmail(parsedUserInfo.email);
        setContact(parsedUserInfo.contact || '');
        setRole(parsedUserInfo.role);
      }
    } else {
      // If no user info, redirect to login
      navigate('/login');
      return;
    }

    const fetchUserReviews = async (userId: string) => {
      try {
        const response = await fetch(`http://localhost:3001/api/reviews/user/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user reviews.');
        }
        const data: Review[] = await response.json();
        setUserReviews(data);
      } catch (err: any) {
        setReviewsError(err.message || 'Error fetching user reviews.');
      }
    };

    if (parsedUserInfo?.id) {
      fetchUserReviews(parsedUserInfo.id);
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
          // In a real app, you'd send an authorization token here
        },
        body: JSON.stringify({ name, email, contact, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to update profile');
        return;
      }

      // Update local storage with new user info
      const updatedUserInfo = { ...userInfo, name, email, contact, role };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      setUserInfo(updatedUserInfo); // Update state
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Network error');
    }
  };

  if (!userInfo) {
    return <Container className="mt-5">Loading profile...</Container>;
  }

  return (
    <Container className="mt-5">
      <h1>My Profile</h1>
      {userInfo.trustScore !== undefined && (
        <Alert variant="info">
          Your Trust Score: {userInfo.trustScore}
        </Alert>
      )}
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
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled // Email is usually not editable directly
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
            onChange={(e) => setRole(e.target.value as 'host' | 'guest')}
            disabled // Role is typically not editable by user
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
      {reviewsError && <Alert variant="danger">{reviewsError}</Alert>}
      {userReviews.length === 0 ? (
        <Alert variant="info">You haven't written any reviews yet.</Alert>
      ) : (
        <ListGroup className="mt-3">
          {userReviews.map(review => (
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
