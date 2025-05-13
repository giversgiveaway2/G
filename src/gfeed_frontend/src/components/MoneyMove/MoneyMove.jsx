import PropTypes from 'prop-types';
import './MoneyMove.scss';
import { useState } from 'react';
import { gfeed_backend } from 'declarations/gfeed_backend';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

const MoneyMove = ({ title, startDate, endDate, source, risk }) => {
  const [review, setReview] = useState(null);

  async function setRating(event, isPositive) {
    event.preventDefault();
    
    const success = await gfeed_backend.rate_money_move("randomId", isPositive);
    if (!success) {
      setReview(" - Review error");
      return;
    }

    if (isPositive)
      setReview(" - Mostly liked");
    else
      setReview(" - Mostly disliked");
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="money-move">
      <button className='money-move__content'>
        <h3 className="money-move__title">{title}</h3>
        <div className="money-move__date-item">
          <span className="money-move__label">When: </span>
          <span className="money-move__value">{formatDate(startDate)}</span>
        </div>
        <div className="money-move__date-item">
          <span className="money-move__label">End date: </span>
          <span className="money-move__value">{formatDate(endDate)}</span>
        </div>
      </button>
      <div className='money-move__footer'>
        <button className="money-move__source">
          <span className="money-move__label">From </span>
          <span className="money-move__value">{source}</span>
          <span className="money-move__label"> - </span>
          <span className="money-move__value">{risk}</span>
          <span className="money-move__value">{review}</span>
        </button>
        <div className='money-move__rating'>
          <button onClick={(event) => setRating(event, false)}>
            <FontAwesomeIcon icon={faThumbsDown} />
          </button>
          <button onClick={(event) => setRating(event, true)}>
            <FontAwesomeIcon icon={faThumbsUp} />
          </button>
        </div>
      </div>
    </div>
  );
};

MoneyMove.propTypes = {
  title: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  source: PropTypes.string.isRequired,
  risk: PropTypes.string.isRequired
};

export default MoneyMove;