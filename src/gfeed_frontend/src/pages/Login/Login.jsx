import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.scss';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const Login = ({ login }) => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const chartCanvasRef = useRef(null);
  
  // Animation variants for staggered children animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const goToMiniGame = () => {
    navigate('/pages/MiniGame/Game');
  };
  
  // Simulated market data for animation
  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 500);
    
    // Chart animation in the background
    if (chartCanvasRef.current) {
      const ctx = chartCanvasRef.current.getContext('2d');
      const width = chartCanvasRef.current.width;
      const height = chartCanvasRef.current.height;
      
      let points = [];
      for (let i = 0; i < width; i += 5) {
        points.push({
          x: i,
          y: height/2 + Math.sin(i * 0.02) * 30 + Math.random() * 20
        });
      }
      
      const drawChart = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = 'rgba(0, 230, 118, 0.5)';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        
        ctx.stroke();
        
        // Update points for animation
        points = points.map(point => ({
          x: point.x,
          y: point.y + Math.sin(Date.now() * 0.001 + point.x * 0.01) * 0.5
        }));
        
        requestAnimationFrame(drawChart);
      };
      
      drawChart();
    }
  }, []);

  // Stats for animated counters
  const stats = [
    { value: 24.8, label: "Market Cap (B)", prefix: "$" },
    { value: 127, label: "Assets Tracked", suffix: "+" },
    { value: 96.5, label: "24h Volume (M)", prefix: "$" }
  ];

  return (
    <div className="login-page">
      <div className="stars"></div>
      <div className="twinkling"></div>
      <div className="floating-orbs">
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`orb orb-${i}`}></div>
        ))}
      </div>
      
      <canvas ref={chartCanvasRef} className="background-chart"></canvas>

      <div className="grid-overlay"></div>

      <motion.div 
        className="login-content"
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.div className="logo-container" variants={itemVariants}>
          <img src="/g1.ico" alt="G Logo" className="main-logo pulse" />
          <div className="logo-rings">
            <div className="ring ring1"></div>
            <div className="ring ring2"></div>
          </div>
        </motion.div>
        
        <motion.h1 className="main-title glitch-text" variants={itemVariants}>
          <span className="glitch-effect" data-text="G"></span>
        </motion.h1>
        
        <motion.h2 className="subtitle" variants={itemVariants}>
          Advanced DeFi Analytics & Intelligence Platform
        </motion.h2>
        
        <motion.div className="stats-bar" variants={itemVariants}>
          {stats.map((stat, index) => (
            <div className="stat-item" key={index}>
              <h4 className="stat-value">
                {stat.prefix || ''}
                <CountUp 
                  end={stat.value} 
                  duration={2.5} 
                  decimals={stat.value % 1 !== 0 ? 1 : 0} 
                  separator="," 
                />
                {stat.suffix || ''}
              </h4>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <motion.div className="services-container" variants={containerVariants}>
          <motion.div 
            className={`service-card ${activeCard === 0 ? 'active' : ''}`}
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            onMouseEnter={() => setActiveCard(0)}
            onMouseLeave={() => setActiveCard(null)}
          >
            <div className="service-icon analytics-icon">
              <div className="icon-pulse"></div>
            </div>
            <h3>Market Intelligence</h3>
            <p>Real-time analytics and AI-powered insights to identify market trends before they emerge</p>
            <div className="card-footer">
              <span className="highlight-text">Live Data</span>
            </div>
          </motion.div>
          
          <motion.div 
            className={`service-card ${activeCard === 1 ? 'active' : ''}`}
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            onMouseEnter={() => setActiveCard(1)}
            onMouseLeave={() => setActiveCard(null)}
          >
            <div className="service-icon lending-icon">
              <div className="icon-pulse"></div>
            </div>
            <h3>Lending & Borrowing</h3>
            <p>Deposit ICP or ckBTC and borrow stablecoins up to 85% of your locked value</p>
            <div className="card-footer">
              <span className="highlight-text">6.2% APY</span>
            </div>
          </motion.div>
          
          <motion.div 
            className={`service-card ${activeCard === 2 ? 'active' : ''}`}
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            onMouseEnter={() => setActiveCard(2)}
            onMouseLeave={() => setActiveCard(null)}
          >
            <div className="service-icon game-icon">
              <div className="icon-pulse"></div>
            </div>
            <h3>Blockchain Games</h3>
            <p>Play mini-games built on the blockchain with real crypto rewards</p>
            <motion.button 
              onClick={goToMiniGame} 
              className="game-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Play Mini Game
              <span className="button-glow"></span>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="login-button-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <motion.button 
          onClick={login} 
          className="auth-button"
          whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(0, 230, 118, 0.6)" }}
          whileTap={{ scale: 0.95 }}
        >
          <img src="/favicon.ico" alt="ICP Logo" className="button-logo" />
          <span>Connect Wallet</span>
          <span className="button-glow"></span>
        </motion.button>
      </motion.div>
      
      <div className="blockchain-animation">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`block block-${i}`}>
            <div className="block-content"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Login;