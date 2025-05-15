import React from 'react';

const Login = ({ login }) => (
  <div className="login-page">
    <div className="stars"></div>
    <div className="twinkling"></div>

    <div className="login-content">
      <div className="logo-container">
        <img src="/g1.ico" alt="G Logo" className="main-logo" />
      </div>

      <h1 className="main-title">G-PLATFORM</h1>
      <h2 className="subtitle">Your Gateway to Financial Freedom</h2>

      <div className="services-container">
        <div className="service-card">
          <div className="service-icon money-icon"></div>
          <h3>G-Feed</h3>
          <p>Get early market moves and insights designed to help you make better investments</p>
        </div>

        <div className="service-card">
          <div className="service-icon lending-icon"></div>
          <h3>Lending & Borrowing</h3>
          <p>Deposit ICP or ckBTC and borrow stablecoins up to 85% of your locked value</p>
        </div>

        <div className="service-card">
          <div className="service-icon game-icon"></div>
          <h3>Blockchain Games</h3>
          <p>Play mini-games built on the blockchain with real rewards</p>
        </div>
      </div>
    </div>

    <div className="login-button-container">
      <button onClick={login} className="auth-button small">
        <img src="/favicon.ico" alt="icp Logo" className="button-logo" />
        <span>Login</span>
      </button>
    </div>
  </div>
);

export default Login;
