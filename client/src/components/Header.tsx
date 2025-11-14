import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('userToken');
      setIsLoggedIn(!!token);
    };

    checkLoginStatus(); // Check on initial mount

    // Add event listeners for custom login/logout events
    window.addEventListener('loginSuccess', checkLoginStatus);
    window.addEventListener('logoutSuccess', checkLoginStatus);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('loginSuccess', checkLoginStatus);
      window.removeEventListener('logoutSuccess', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken'); // Clear the simulated token
    localStorage.removeItem('userInfo'); // Clear user info
    window.dispatchEvent(new Event('logoutSuccess')); // Dispatch logout event
    navigate('/'); // Redirect to home after logout
  };

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">CaravanShare</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/caravans">Caravans</Nav.Link>
          </Nav>
          <Nav>
            {isLoggedIn ? (
              <Button variant="outline-secondary" onClick={handleLogout}>Logout</Button>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
