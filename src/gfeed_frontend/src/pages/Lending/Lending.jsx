import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, ArrowRight, Check, Clock, RefreshCw, ArrowLeft } from 'lucide-react'; // Import ArrowLeft for the back button
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { motion } from 'framer-motion'; // Import motion for animations
import './Lending.scss';

const Lending = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const chartCanvasRef = useRef(null); // Ref for background chart
  const [isLoaded, setIsLoaded] = useState(false); // For staggered animation

  // Sample available assets
  const assets = [
    { id: 'icp', name: 'ICP', balance: 15.75, value: 187.25, apy: 3.5 },
    { id: 'ckbtc', name: 'ckBTC', balance: 0.12, value: 820.40, apy: 2.8 },
    { id: 'cketh', name: 'ckETH', balance: 0.5, value: 1250.00, apy: 3.2 },
  ];

  // State management
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [depositAmount, setDepositAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [loanPeriod, setLoanPeriod] = useState(30); // 30 days default
  const [activeTab, setActiveTab] = useState('deposit');
  const [userDeposits, setUserDeposits] = useState([]);
  const [userLoans, setUserLoans] = useState([]);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isRepaying, setIsRepaying] = useState(false);

  // Simulated market data for animation and staggered load
  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 500); // Trigger stagger animation

    // Chart animation in the background
    if (chartCanvasRef.current) {
      const ctx = chartCanvasRef.current.getContext('2d');
      const width = chartCanvasRef.current.width;
      const height = chartCanvasRef.current.height;

      let points = [];
      for (let i = 0; i < width; i += 5) {
        points.push({
          x: i,
          y: height / 2 + Math.sin(i * 0.02) * 30 + Math.random() * 20
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


  // Sample data for user deposits and loans
  useEffect(() => {
    // This would typically come from an API or blockchain call
    setUserDeposits([
      { id: 1, asset: 'ICP', amount: 5.0, value: 59.50, timestamp: Date.now() - 86400000 * 5 },
      { id: 2, asset: 'ckBTC', amount: 0.05, value: 342.00, timestamp: Date.now() - 86400000 * 2 },
    ]);

    setUserLoans([
      {
        id: 1,
        collateral: 'ICP',
        collateralAmount: 10.0,
        borrowed: 'ckUSDC',
        borrowedAmount: 90.0,
        startDate: Date.now() - 86400000 * 10,
        endDate: Date.now() + 86400000 * 20,
        interestRate: 5.2,
        status: 'active'
      },
    ]);
  }, []);

  // Calculate maximum borrowable amount based on deposit value (typically a % of collateral)
  const calculateMaxBorrow = () => {
    const collateralValue = parseFloat(depositAmount) * (selectedAsset.value / selectedAsset.balance);
    return collateralValue * 0.7; // 70% loan-to-value ratio
  };

  // Calculate interest based on amount, period, and a base rate
  const calculateInterest = () => {
    const amount = parseFloat(borrowAmount) || 0;
    const baseRate = 5; // 5% base interest rate
    const periodInYears = loanPeriod / 365;
    return amount * (baseRate / 100) * periodInYears;
  };

  // Handle deposit submission
  const handleDeposit = () => {
    if (!depositAmount || isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid deposit amount');
      return;
    }

    setIsDepositing(true);

    // Simulate blockchain transaction
    setTimeout(() => {
      const newDeposit = {
        id: userDeposits.length + 1,
        asset: selectedAsset.name,
        amount: parseFloat(depositAmount),
        value: parseFloat(depositAmount) * (selectedAsset.value / selectedAsset.balance),
        timestamp: Date.now()
      };

      setUserDeposits([...userDeposits, newDeposit]);
      setDepositAmount('');
      setIsDepositing(false);
    }, 2000);
  };

  // Handle borrow submission
  const handleBorrow = () => {
    if (!borrowAmount || isNaN(parseFloat(borrowAmount)) || parseFloat(borrowAmount) <= 0) {
      alert('Please enter a valid borrow amount');
      return;
    }

    if (parseFloat(borrowAmount) > calculateMaxBorrow()) {
      alert('Borrow amount exceeds the maximum allowed based on your deposit');
      return;
    }

    setIsBorrowing(true);

    // Simulate blockchain transaction
    setTimeout(() => {
      const newLoan = {
        id: userLoans.length + 1,
        collateral: selectedAsset.name,
        collateralAmount: parseFloat(depositAmount),
        borrowed: 'ckUSDC',
        borrowedAmount: parseFloat(borrowAmount),
        startDate: Date.now(),
        endDate: Date.now() + (loanPeriod * 86400000),
        interestRate: 5.2,
        status: 'active'
      };

      setUserLoans([...userLoans, newLoan]);
      setBorrowAmount('');
      setDepositAmount('');
      setIsBorrowing(false);
    }, 2000);
  };

  // Handle loan repayment
  const handleRepay = (loanId) => {
    setIsRepaying(true);

    // Simulate blockchain transaction
    setTimeout(() => {
      const updatedLoans = userLoans.map(loan => {
        if (loan.id === loanId) {
          return { ...loan, status: 'repaid' };
        }
        return loan;
      });

      setUserLoans(updatedLoans);
      setIsRepaying(false);
    }, 2000);
  };

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

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

  const navigateBack = () => {
    navigate('/'); // Navigate back to the login page (root path)
  };


  return (
    <div className="lending-page">
      <div className="stars"></div>
      <div className="twinkling"></div>
      <div className="grid-background">
        <div className="grid-overlay"></div>
      </div>
      <div className="floating-orbs">
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`orb orb-${i}`}></div>
        ))}
      </div>

      <canvas ref={chartCanvasRef} className="background-chart"></canvas>

      <motion.div
        className="lending-content"
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.button
          onClick={navigateBack}
          className="back-button"
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} /> Back to Home
        </motion.button>

        <motion.h1 variants={itemVariants} className="page-title">
          <span className="glitch-effect" data-text="Lending"></span> Platform
        </motion.h1>

        <motion.div className="tabs" variants={itemVariants}>
          <button
            className={`tab-btn ${activeTab === 'deposit' ? 'active' : ''}`}
            onClick={() => setActiveTab('deposit')}
          >
            Deposit & Borrow
          </button>
          <button
            className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            My Portfolio
          </button>
        </motion.div>

        {activeTab === 'deposit' && (
          <motion.div className="lending-form-grid" variants={containerVariants}>
            <motion.div className="form-section deposit-section" variants={itemVariants}>
              <h2>Deposit Assets</h2>
              <div className="asset-selector">
                <label>Select Asset</label>
                <div className="asset-options">
                  {assets.map(asset => (
                    <motion.button
                      key={asset.id}
                      className={`asset-option ${selectedAsset.id === asset.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAsset(asset)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="asset-icon">{asset.name.charAt(0)}</div>
                      <div className="asset-details">
                        <span className="asset-name">{asset.name}</span>
                        <span className="asset-balance">Balance: {asset.balance}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="amount-input">
                <label>Deposit Amount</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder={`Enter ${selectedAsset.name} amount`}
                  />
                  <button
                    className="max-btn"
                    onClick={() => setDepositAmount(selectedAsset.balance.toString())}
                  >
                    MAX
                  </button>
                </div>
                <div className="input-details">
                  <span>Available: {selectedAsset.balance} {selectedAsset.name}</span>
                  <span>APY: {selectedAsset.apy}%</span>
                </div>
              </div>

              <div className="deposit-summary">
                <div className="summary-item">
                  <span>You deposit</span>
                  <span>{depositAmount || '0'} {selectedAsset.name}</span>
                </div>
                <div className="summary-item">
                  <span>Value</span>
                  <span>
                    {depositAmount
                      ? formatCurrency(parseFloat(depositAmount) * (selectedAsset.value / selectedAsset.balance))
                      : '$0.00'}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div className="arrow-divider" variants={itemVariants}>
              <ArrowRight size={24} />
            </motion.div>

            <motion.div className="form-section borrow-section" variants={itemVariants}>
              <h2>Borrow ckUSDC</h2>

              <div className="amount-input">
                <label>Borrow Amount</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                    placeholder="Enter ckUSDC amount"
                  />
                  <button
                    className="max-btn"
                    onClick={() => setBorrowAmount(calculateMaxBorrow().toFixed(2))}
                    disabled={!depositAmount || isNaN(parseFloat(depositAmount))}
                  >
                    MAX
                  </button>
                </div>
                <div className="input-details">
                  <span>Max borrowable: {depositAmount && !isNaN(parseFloat(depositAmount))
                    ? formatCurrency(calculateMaxBorrow())
                    : '$0.00'}</span>
                </div>
              </div>

              <div className="loan-term">
                <label>Loan Period</label>
                <div className="loan-term-options">
                  <motion.button
                    className={loanPeriod === 30 ? 'active' : ''}
                    onClick={() => setLoanPeriod(30)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    30 days
                  </motion.button>
                  <motion.button
                    className={loanPeriod === 60 ? 'active' : ''}
                    onClick={() => setLoanPeriod(60)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    60 days
                  </motion.button>
                  <motion.button
                    className={loanPeriod === 90 ? 'active' : ''}
                    onClick={() => setLoanPeriod(90)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    90 days
                  </motion.button>
                </div>
              </div>

              <div className="borrow-summary">
                <div className="summary-item">
                  <span>Interest Rate</span>
                  <span>5.2% APR</span>
                </div>
                <div className="summary-item">
                  <span>Interest Amount</span>
                  <span>
                    {borrowAmount
                      ? formatCurrency(calculateInterest())
                      : '$0.00'}
                  </span>
                </div>
                <div className="summary-item">
                  <span>Total to Repay</span>
                  <span>
                    {borrowAmount
                      ? formatCurrency(parseFloat(borrowAmount) + calculateInterest())
                      : '$0.00'}
                  </span>
                </div>
                <div className="summary-item">
                  <span>Repayment Date</span>
                  <span>{formatDate(Date.now() + (loanPeriod * 86400000))}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'deposit' && (
          <motion.div className="action-buttons" variants={itemVariants}>
            <motion.button
              className="deposit-btn"
              onClick={handleDeposit}
              disabled={!depositAmount || isNaN(parseFloat(depositAmount)) || isDepositing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDepositing ? <RefreshCw className="spin" size={16} /> : 'Deposit Only'}
            </motion.button>
            <motion.button
              className="borrow-btn"
              onClick={handleBorrow}
              disabled={!depositAmount || !borrowAmount ||
                isNaN(parseFloat(depositAmount)) ||
                isNaN(parseFloat(borrowAmount)) ||
                isBorrowing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isBorrowing ? <RefreshCw className="spin" size={16} /> : 'Deposit & Borrow'}
            </motion.button>
          </motion.div>
        )}

        {activeTab === 'portfolio' && (
          <motion.div className="portfolio-container" variants={containerVariants}>
            <motion.div className="deposits-section" variants={itemVariants}>
              <h2>Your Deposits</h2>
              {userDeposits.length > 0 ? (
                <div className="deposits-list">
                  {userDeposits.map(deposit => (
                    <motion.div
                      className="deposit-item"
                      key={deposit.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="deposit-details">
                        <div className="deposit-asset">
                          <div className="asset-icon">{deposit.asset.charAt(0)}</div>
                          <span>{deposit.asset}</span>
                        </div>
                        <div className="deposit-amount">
                          <div className="amount-primary">{deposit.amount} {deposit.asset}</div>
                          <div className="amount-secondary">{formatCurrency(deposit.value)}</div>
                        </div>
                        <div className="deposit-date">
                          <Clock size={16} />
                          <span>Deposited on {formatDate(deposit.timestamp)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>You don't have any deposits yet.</p>
                </div>
              )}
            </motion.div>

            <motion.div className="loans-section" variants={itemVariants}>
              <h2>Your Loans</h2>
              {userLoans.length > 0 ? (
                <div className="loans-list">
                  {userLoans.map(loan => (
                    <motion.div
                      className={`loan-item ${loan.status}`}
                      key={loan.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="loan-header">
                        <div className="loan-status">
                          {loan.status === 'active' ? (
                            <AlertCircle size={16} className="alert-icon" />
                          ) : (
                            <Check size={16} className="check-icon" />
                          )}
                          <span>{loan.status === 'active' ? 'Active Loan' : 'Repaid'}</span>
                        </div>
                        <div className="loan-dates">
                          <div className="date-item">
                            <span>Start:</span>
                            <span>{formatDate(loan.startDate)}</span>
                          </div>
                          <div className="date-item">
                            <span>Due:</span>
                            <span>{formatDate(loan.endDate)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="loan-details">
                        <div className="detail-column">
                          <h4>Collateral</h4>
                          <div className="detail-asset">
                            <div className="asset-icon">{loan.collateral.charAt(0)}</div>
                            <span>{loan.collateralAmount} {loan.collateral}</span>
                          </div>
                        </div>
                        <div className="detail-column">
                          <h4>Borrowed</h4>
                          <div className="detail-asset">
                            <div className="asset-icon">U</div>
                            <span>{loan.borrowedAmount} {loan.borrowed}</span>
                          </div>
                        </div>
                        <div className="detail-column">
                          <h4>Interest</h4>
                          <div className="detail-value">
                            <span>{loan.interestRate}% APR</span>
                            <span className="secondary-value">
                              {formatCurrency(loan.borrowedAmount * (loan.interestRate / 100) *
                                ((loan.endDate - loan.startDate) / (365 * 86400000)))}
                            </span>
                          </div>
                        </div>
                      </div>

                      {loan.status === 'active' && (
                        <div className="loan-actions">
                          <motion.button
                            className="repay-btn"
                            onClick={() => handleRepay(loan.id)}
                            disabled={isRepaying}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isRepaying ? <RefreshCw className="spin" size={16} /> : 'Repay Loan'}
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>You don't have any active loans.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        <motion.div className="lending-disclaimer" variants={itemVariants}>
          <p>
            <strong>Note:</strong> All loan transactions are secured by your deposited assets.
            Failure to repay loans may result in liquidation of your collateral.
          </p>
        </motion.div>
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

export default Lending;