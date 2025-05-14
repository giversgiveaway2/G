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

  // Create a Login component for the login page
  const Login = () => (
    <div className="login-page">
      <h2>Let's go G... login to continue</h2>
      <div className="login-button-container">
        <button onClick={login} className="auth-button">
          <img src="/favicon.ico" alt="Logo" className="button-logo" />
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
                  <img src="/favicon.ico" alt="Logo" className="button-logo" />
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