import React, { useEffect, useState, useRef} from 'react';
import NewsItem from "./newsItem/index.jsx";
import apiService from '../../../services/api.js';

import { FORMAT_DATE } from '../../../utils/constants/app-constants.js';

const RecentNews = ({additionalClasses, maxHeight}) => {
  const scrollContainerRef = useRef(null);
  const [data, setData] = useState([]);
  const itemsPerPage = 10;
  const [displayedItems, setDisplayedItems] = useState(itemsPerPage);
  console.log(maxHeight)

  useEffect(() => {
    async function fetchData() {
      const response = await apiService.getLatestNews();
      console.log(response);
      setData(response.data);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer && data.length > 0) {
      const loadMoreItems = () => {
        if (displayedItems < data.length) {
          setDisplayedItems(prevDisplayedItems => Math.min(prevDisplayedItems + itemsPerPage, data.length));
        }
      };
  
      const handleScroll = () => {
        if (scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight) {
          loadMoreItems();
        }
      };
  
      scrollContainer.addEventListener('scroll', handleScroll);
  
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [displayedItems, data.length]);

  return (
    <div className="card news-card order-4 overflow-y-scroll" ref={scrollContainerRef} style={{maxHeight: maxHeight}}>
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <h3>Latest News and Events</h3>
        {/*<input type="text" placeholder="Filter by..." className="md:ml-auto filter_input" />*/}
      </div>

      {data.length === 0
        ? <div className="py-12 flex flex-col justify-center items-center">
            <i className="fa fa-spinner fa-spin text-6xl"></i>
            <h3 className="text-3xl mt-6">Loading Aircraft Data...</h3>
          </div>
        : <>
            {data.slice(0, displayedItems).map((item, index) => (
              <NewsItem key={index} title={item.title} content={item.content} date={FORMAT_DATE(item.date)} link={item.url} />
            ))}

            {displayedItems < data.length && (
              <div className="loading-more-items">Loading more...</div>
            )}
          </>
      }
    </div>
  );
};

export default RecentNews;

