import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Income <span>Assessment</span>
      </Link>
      <div className="navbar-links">
        <Link to="/">All Cases</Link>
        <Link to="/cases/new">New Assessment</Link>
      </div>
    </nav>
  );
}

export default Navbar;
