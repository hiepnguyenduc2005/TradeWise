import React, { useState } from "react";
import "../css/NewsData.css";

export default function NewsData({ news }) {
  const [visibleCount, setVisibleCount] = useState(13);

  const showMore = () => {
    setVisibleCount((prevCount) => prevCount + 12);
  };

  const hasMoreNews = visibleCount < news.length;

  if (!news || news.length === 0) {
    return <p className="no-more-text">No news related.</p>;
  }

  return (
    <div>
      {news.slice(0, 1).map((item, index) => (
        <div key={index} className="news-first">
          <img src={item.urlToImage} alt={item.title} className="img-first" />
          <div>
            <h4 className="title-first">
              <a href={item.url} target="_blank" rel="noreferrer" className="link-first">{item.title}</a>
            </h4>
            <p className="description-first">
              {item.description.slice(0, 500)}
              <a href={item.url} target="_blank" rel="noreferrer" className="link-first"> Read more</a>
            </p>
          </div>
        </div>
      ))}

      <div className="news-grid">
        {news.slice(1, visibleCount).map((item, index) => (
          <div key={index} className="news-remain" style={{ backgroundImage: `url(${item.urlToImage})` }}>
            <a href={item.url} target="_blank" rel="noreferrer" className="title-remain">{item.title}</a>
          </div>
        ))}
      </div>

      {hasMoreNews ? (
        <div className="profile-middle">  
          <button onClick={showMore} className="news-button">Load More .. </button>
        </div>
      ) : (
        <p className="no-more-text">No more news to show.</p>
      )}
    </div>
  );
}
