// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ServiceDetails from './components/ServiceDetails';
import Login from './components/Login';
import ClientProfile from './components/ClientProfile';
import ConsultantDetails from './components/ConsultantDetails';
import { AnalyticsDashboard } from './components/analytics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/services/:serviceName" element={<ServiceDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/client-profile/:clientId" element={<ClientProfile />} />
        <Route path="/consultant-details/:consultantId" element={<ConsultantDetails />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;