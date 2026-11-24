import React from 'react';
import Navbar from '../components/Navbar';
import CategoryList from '../components/CategoryList';

export default function Categories() {
  return (
    <div style={{ minHeight: '100vh', background: '#070b14', color: '#ffffff' }}>
      <Navbar />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
        <CategoryList
          title="Explore All Categories"
          subtitle="Discover curated collections loaded live from the MySQL database"
        />
      </div>
    </div>
  );
}
