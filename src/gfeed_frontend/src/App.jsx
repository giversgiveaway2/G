import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';

// Create a protected route component
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  const [greeting, setGreeting] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [agent, setAgent] = useState(null);
  
  // Initialize auth on component mount
  useEffect(() => {
    initAuth();
  }, []);
  
  async function initAuth() {
    try {
      const authClient = await AuthClient.create();
      if (await authClient.isAuthenticated()) {
        handleAuthenticated(authClient);
      }
    } catch (error) {
      console.error("Authentication initialization failed:", error);
    }
  }
  
  const handleAuthenticated = useCallback(async (authClient) => {
    const identity = authClient.getIdentity();
    setIdentity(identity);
    setIsAuthenticated(true);
    
    // Get the user's Principal ID
    const principal = identity.getPrincipal();
    setPrincipal(principal.toString());
    
    // Create an agent with the identity
    const agent = new HttpAgent({ identity });
    
    // For local development only
    if (process.env.DFX_NETWORK === 'local') {
      await agent.fetchRootKey().catch(e => {
        console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
        console.error(e);
      });
    }
    
    setAgent(agent);
  }, []);
  
  async function login() {
    try {
      const authClient = await AuthClient.create();
      
      // Start the login process and redirect to II
      authClient.login({
        identityProvider: process.env.DFX_NETWORK === 'local' 
          ? `http://uzt4z-lp777-77774-qaabq-cai.localhost:4943/`
          : 'https://identity.ic0.app',
        onSuccess: () => {
          handleAuthenticated(authClient);
          // This won't directly cause navigation since Internet Identity uses redirects
          // The routing will handle navigation once authentication state changes
        },
        onError: (error) => {
          console.error('Login failed:', error);
        }
      });
    } catch (error) {
      console.error("Login process failed:", error);
    }
  }
  
  async function logout() {
    try {
      const authClient = await AuthClient.create();
      await authClient.logout();
      setIsAuthenticated(false);
      setIdentity(null);
      setPrincipal(null);
      setAgent(null);
    } catch (error) {
      console.error("Logout process failed:", error);
    }
  }
  
  function handleSubmit(event) {
    event.preventDefault();
    // Make sure we have a backend reference before trying to call it
    if (window.G_backend) {
      const name = event.target.elements.name.value;
      window.G_backend.greet(name).then((greeting) => {
        setGreeting(greeting);
      }).catch(error => {
        console.error("Error calling backend:", error);
      });
    } else {
      console.error("Backend reference not available");
    }
    return false;
  }

  // Updated Login component with futuristic design and service features
  const Login = () => (
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
          <img src="/g1.ico" alt="G Logo" className="button-logo" />
          <span>Login</span>
        </button>
      </div>
    </div>
  );

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="spacer"></div>
          <div className="auth-section">
            {isAuthenticated && (
              <div className="user-info">
                <span className="principal-info">Principal ID: {principal}</span>
                <button onClick={logout} className="auth-button">
                  <img src="/g1.ico" alt="G Logo" className="button-logo" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>
        
        <main>
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/" /> : <Login />
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;