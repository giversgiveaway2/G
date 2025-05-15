import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login/Login'; // Import the separated Login component
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';

// Create a protected route component
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  const [greeting, setGreeting] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [agent, setAgent] = useState(null);
  
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

    const principal = identity.getPrincipal();
    setPrincipal(principal.toString());

    const agent = new HttpAgent({ identity });

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
      authClient.login({
        identityProvider: process.env.DFX_NETWORK === 'local' 
          ? `http://uzt4z-lp777-77774-qaabq-cai.localhost:4943/`
          : 'https://identity.ic0.app',
        onSuccess: () => {
          handleAuthenticated(authClient);
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
    if (window.gfeed_backend) {
      const name = event.target.elements.name.value;
      window.gfeed_backend.greet(name).then((greeting) => {
        setGreeting(greeting);
      }).catch(error => {
        console.error("Error calling backend:", error);
      });
    } else {
      console.error("Backend reference not available");
    }
    return false;
  }

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
                  <img src="/favicon.ico" alt="icp Logo" className="button-logo" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <main>
          <Routes>
            <Route 
              path="/home" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/" 
              element={
                isAuthenticated ? <Navigate to="/home" /> : <Login login={login} />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
