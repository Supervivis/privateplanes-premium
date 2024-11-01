import { useContext } from "react";
import { StateContext } from "../../../context";
import cn from "classnames";
import styles from "./Nav.module.scss";
import cropped_logo_blue from "../../../assets/cropped-logo-blue.png";

const Header = () => {
  const {numLiveFlights, isSidenavOpen, toggleSidenav} = useContext(StateContext);

  const isCurrentPath = (path) => {
    return window.location.pathname === path;
  }

  const navItem = (path, text, icon) => {
    return (
      <a href={path} className={`${isCurrentPath(path) ? `nav-item-active` : `nav-item`} hidden md:flex items-center gap-2`}>
        <i className={`fa-solid fa-${icon}`}></i>
        <h3>{text}</h3>
      </a>
    );
  }

  return (
    <header className={cn(styles.header)}>
      <div className="flex items-center justify-center md:justify-start gap-4 md:gap-6 px-4 md:px-8 py-4 bg-white w-full">
        <button onClick={toggleSidenav} className={cn(styles.menu_button, "block md:hidden")} style={{width: 32}}>
          {isSidenavOpen 
            ? <i className="fa-solid fa-xmark"></i>
            : <i className="fa-sharp fa-solid fa-bars"></i>
          }
        </button>

        <a href="/" className="shrink-0 ml-auto mr-auto md:ml-0 md:mr-4">
          <img
            src={cropped_logo_blue}
            alt="logo"
            className={cn(styles.nav_logo)}
          />
        </a>

        {navItem("/", "Dashboard", "house")}
        {navItem("/lookup", "Lookup", "binoculars")}
        {navItem("/search", "Search", "search")}

       <div className={`${cn(styles.nav_item)} ml-auto hidden md:flex`}>
          {/*<div className={`${cn(styles.sub_item)} `}>
            <div className={cn(styles.status_icon)} />
            <p>Status</p>
          </div>*/}
        </div>
        
        <div className={`${cn(styles.nav_item)} hidden md:flex `}>
          <div className={cn(styles.sub_item)}>
            <p><i className="fa-regular fa-paper-plane"></i></p>
            <p>{numLiveFlights}&nbsp;Live Flights</p>
          </div>
        </div>

        <div className="w-10 h-10 bg-gray-100 rounded-full hidden md:flex items-center justify-center nav-item cursor-pointer">
          <a href="https://compareprivateplanes.com/my-account"><i className="fa-solid fa-user"></i></a>
        </div>
      </div>
    </header>
  );
};

export default Header;
