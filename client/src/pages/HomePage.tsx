import React from 'react';
import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './HomePage.css'; // We will create this file for styling

const HomePage = () => {
  return (
    <>
      <div className="hero-section">
        <Container>
          <h1 className="hero-title">CaravanShare에 오신 것을 환영합니다</h1>
          <p className="hero-subtitle">다음 모험을 위한 완벽한 카라반을 찾아보세요!</p>
          <Link to="/caravans">
            <Button variant="primary" size="lg">
              카라반 둘러보기
            </Button>
          </Link>
        </Container>
      </div>

      <div className="featured-section">
        <Container>
          <h2 className="text-center mb-5">추천 카라반</h2>
          {/* Featured caravans will be added here later */}
          <p className="text-center">추천 카라반 기능은 곧 추가될 예정입니다.</p>
        </Container>
      </div>
    </>
  );
};

export default HomePage;
