import React from 'react';
import { Link } from "react-router-dom";

import cn from "classnames";
import styles from "./Nav.module.scss";

const NavItem = ({icon, text, link, currentPath, navigateToUrl }) => {
  const isActive = link === currentPath;

  return (
    <div 
      className={`${cn(styles.sidenav_item,  { [styles.active]: isActive } )} flex gap-4 items-center cursor-pointer`}
      onClick={() => navigateToUrl(link)}
    >
      <div className={cn(styles.sidenav_item_icon)}>
        <i className={`fa-solid fa-${icon}`}></i>
      </div>

      <h3>{text}</h3>
    </div>
  );
};

export default NavItem;
