import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CaravansPage from './pages/CaravansPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CaravanRegistrationPage from './pages/CaravanRegistrationPage';
import CaravanEditPage from './pages/CaravanEditPage'; // Import the new page
import MyReservationsPage from './pages/MyReservationsPage';
import HostDashboardPage from './pages/HostDashboardPage';
import PaymentPage from './pages/PaymentPage';
import ReviewPage from './pages/ReviewPage';
import CaravanDetailPage from './pages/CaravanDetailPage';
import ProfilePage from './pages/ProfilePage'; // Import ProfilePage
import PaymentHistoryPage from './pages/PaymentHistoryPage'; // Import PaymentHistoryPage
import './App.css';

function App() {
  return (
    <Router>
      <Header />
      <main className="py-3">
        <Container>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/caravans" element={<CaravansPage />} />
            <Route path="/caravans/:id" element={<CaravanDetailPage />} />
            <Route path="/caravans/new" element={<CaravanRegistrationPage />} />
            <Route path="/caravans/:id/edit" element={<CaravanEditPage />} /> {/* Add the edit route */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/my-reservations" element={<MyReservationsPage />} />
            <Route path="/host-dashboard" element={<HostDashboardPage />} />
            <Route path="/payment/:id" element={<PaymentPage />} />
            <Route path="/review/:id" element={<ReviewPage />} />
            <Route path="/profile" element={<ProfilePage />} /> {/* Add ProfilePage route */}
            <Route path="/payment-history" element={<PaymentHistoryPage />} /> {/* Add PaymentHistoryPage route */}
          </Routes>
        </Container>
      </main>
    </Router>
  );
}

export default App;
