import { useState, useEffect } from 'react';
import { gfeed_backend } from 'declarations/gfeed_backend';
import FeedItem from '../FeedItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import './Feed.scss';

const Feed = () => {
    const [newsItems, setNewsItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFeed = async () => {
        try {
            setLoading(true);
            const result = await gfeed_backend.fetch_feed();
            setNewsItems(result.feedItems);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch news. Please try again later.');
            setLoading(false);
            console.error(err);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    return (
        <div className="feed">
            <div className="feed__header">
                <h2>Feed</h2>
                <button className='feed__button' onClick={fetchFeed} disabled={loading}>
                    <FontAwesomeIcon icon={faRefresh} />
                    {loading && <span>Loading...</span>}
                </button>
            </div>
            {error && <div className="feed__error">{error}</div>}

            <div className="feed__items">
                {newsItems.length > 0 ? (
                    newsItems.map((item, index) => (
                        <FeedItem
                            key={index}
                            title={item.title}
                            source={item.source}
                            datetime={item.datetime}
                        />
                    ))
                ) : (
                    <p>No news items available. {loading ? 'Loading...' : ''}</p>
                )}
            </div>
        </div>
    );
};

export default Feed;