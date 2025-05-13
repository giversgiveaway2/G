import PropTypes from 'prop-types';
import './FeedItem.scss';

const FeedItem = ({ title, source, datetime }) => {
    const formatDateTime = (date) => {
        if (!date) return 'No date'
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <button className="feed-item">
            <strong className="feed-item__title">{title}</strong>
            <div className="feed-item__source">
                <span className="feed-item__value">{source}</span>
                <span className="feed-item__label"> - </span>
                <span className="feed-item__value">{formatDateTime(datetime)}</span>
            </div>
        </button>
    );
};

FeedItem.propTypes = {
    title: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    datetime: PropTypes.string.isRequired
};

export default FeedItem;