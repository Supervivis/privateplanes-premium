import { useState, useContext } from "react";
import { StateContext } from "../../../context";
import cn from "classnames";
import styles from "./Nav.module.scss";
import cropped_logo_blue from "../../../assets/cropped-logo-blue.png";

const Header = () => {
  const {numLiveFlights, isSidenavOpen, toggleSidenav} = useContext(StateContext);

  return (
    <header className={cn(styles.header)}>
      <div className={cn(styles.nav)}>
        <div className={cn(styles.nav_item)}>
          <button onClick={toggleSidenav} className={cn(styles.menu_button, "block xl:hidden")}>
            {isSidenavOpen 
              ? <i className="fa-solid fa-xmark"></i>
              : <i className="fa-sharp fa-solid fa-bars"></i>
            }
          </button>
          <div className={`${cn(styles.sub_item)} hidden md:flex`}>
            <div className={cn(styles.status_icon)} />
            <p>Status</p>
          </div>
          
        </div>
        <img
          src={cropped_logo_blue}
          alt="logo"
          className={cn(styles.nav_logo)}
        />
        <div className={`${cn(styles.nav_item)} hidden md:flex`}>
          <div className={cn(styles.sub_item)}>
            <p><i className="fa-regular fa-paper-plane"></i></p>
            <p>{numLiveFlights}&nbsp;Live Flights</p>
          </div>
        </div>

        <div className="w-1 block md:hidden"></div>
      </div>
    </header>
  );
};

export default Header;
