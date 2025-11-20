import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: 'host' | 'guest';
}

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('userToken');
      setIsLoggedIn(!!token);
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      } else {
        setUserInfo(null);
      }
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
            <Nav.Link as={Link} to="/">홈</Nav.Link>
            <Nav.Link as={Link} to="/caravans">카라반 목록</Nav.Link>
            {isLoggedIn && userInfo?.role === 'host' && (
              <>
                <Nav.Link as={Link} to="/caravans/new">카라반 등록</Nav.Link>
                <Nav.Link as={Link} to="/host-dashboard">호스트 대시보드</Nav.Link>
              </>
            )}
            {isLoggedIn && userInfo?.role === 'guest' && (
              <Nav.Link as={Link} to="/my-reservations">내 예약</Nav.Link>
            )}
            {isLoggedIn && (
              <>
                <Nav.Link as={Link} to="/profile">내 프로필</Nav.Link>
                <Nav.Link as={Link} to="/payment-history">결제 내역</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {isLoggedIn ? (
              <Button variant="outline-secondary" onClick={handleLogout}>로그아웃</Button>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">로그인</Nav.Link>
                <Nav.Link as={Link} to="/signup">회원가입</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
