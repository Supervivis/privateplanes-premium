import React from 'react';

import styles from "./simpDonut.module.scss";
import cn from "classnames";

const SimpleDonut = ({ title, percentage }) => {

  const fillColour = (percentage) => {
    if (percentage < 50) {
      return '#FF2727';
    } else if (percentage < 70) {
      return '#D0BB00';
    } else {
      return '#00811C';
    }
  }

  return(
  <div >
    <h5 className={cn(styles.title)}>{title}</h5>
    <div className={cn(styles.circle_chart)} data-percentage={percentage}>
      <svg viewBox="0 0 36 36" className={cn(styles.circular_chart)}>
        <path className={cn(styles.circle_bg)}
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#eee"
          strokeWidth="2.5"
        />
    
        <path className={cn(styles.circle)}
          strokeDasharray={`${percentage}, 100`}
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={fillColour(percentage)}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <text x="18" y="20.35" fill={fillColour(percentage)} className={cn(styles.percentage)}>{percentage}%</text>
      </svg>
    </div>
  </div>

  )
};

export default SimpleDonut;

