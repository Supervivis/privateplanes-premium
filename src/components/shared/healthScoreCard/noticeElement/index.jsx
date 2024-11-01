import React from 'react';

import styles from "./noticeElement.module.scss"
import cn from "classnames";

const NoticeElement = ({ type, content }) => {

  return(
  <div className={cn(styles.notice_row)}>
    <div className={cn(styles.change, {
      [styles.positive]: type === "positive",
      [styles.alert]: type === "alert",
      [styles.warning]: type === "warning"
    })}>
      <i className={`fa-solid fa-${type === "positive" 
          ? "check" 
          : type === "alert" 
            ? "exclamation"
            : "xmark"
        }`}>
      </i>
    </div>

    <p>{content}</p>
  </div>)
};

export default NoticeElement;

