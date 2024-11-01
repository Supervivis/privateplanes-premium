import React from 'react';

import styles from "./newsItem.module.scss"
import cn from "classnames";

const NewsItem = ({ title, content, date, year, link }) => {

  return(
  <div className={`flex flex-col md:flex-row ${cn(styles.news_item_row)} `}>
    <div className={cn(styles.main_content)}>
      <h4 className="font-semibold text-lg">{title}</h4>
      <p>{content.slice(0, 150)}</p>
    </div>

    <div className={cn(styles.date_content)}>
      <p>{date}<br />{year}</p>
      <a href={link} target="_blank">Read more</a>
    </div>
  </div>)
};

export default NewsItem;

