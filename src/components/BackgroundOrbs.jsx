import React from 'react';

/**
 * Dynamic ambient floating glowing orbs that fluidly transition
 * colors based on the active page theme (Violet for Signup, Cyan for Login).
 */
export default function BackgroundOrbs({ theme = 'violet' }) {
  return (
    <>
      <div className="ambient-noise" />
      <div className={`ambient-orbs-container theme-${theme}`}>
        <div className="ambient-orb orb-1" />
        <div className="ambient-orb orb-2" />
        <div className="ambient-orb orb-3" />
        <div className="ambient-orb orb-accent" />
      </div>
    </>
  );
}
