import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Navbar.css'; 

const NavigationBar = () => {
  return (
    <Navbar fixed="top" expand="lg" className="custom-navbar">
      <Container>
        <Navbar.Brand as={Link} to="/" className="text-white">FinSight</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" className="bg-light" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="text-white mx-3">Home</Nav.Link>
            <Nav.Link as={Link} to="/dashboard" className="text-white mx-3">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/portfolio" className="text-white mx-3">Portfolio</Nav.Link>
            <Nav.Link as={Link} to="/transactions" className="text-white mx-3">Transactions</Nav.Link>
            <Nav.Link as={Link} to="/crud" className="text-white mx-3">Manage</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
