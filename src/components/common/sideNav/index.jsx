import { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { StateContext } from "../../../context";
import cn from "classnames";
import styles from "./Nav.module.scss";
import NavItem from "./navItem";

const Header = () => {
  const {isSidenavOpen, toggleSidenav, numLiveFlights} = useContext(StateContext);
  const [userName, setUserName] = useState("User");
  const location = useLocation();
  const navigate = useNavigate();

  const periodOfDay = () => {
    const currentTime = new Date();
    const hour = currentTime.getHours();

    if (hour < 12) {
      return "Morning";
    } else if (hour < 18) {
      return "Afternoon";
    } else {
      return "Evening";
    }
  }

  const navigateToUrl = (url) => {
    toggleSidenav();
    setTimeout(() => {
      navigate(url);
    }, 100);
  }

  return (
    <div className={cn(styles.sidenav, `${isSidenavOpen ? "flex md:hidden" : "hidden"} px-8 py-6 flex-col gap-4 shrink-0`)}>
      <div className="mb-6 mt-2 flex flex-col gap-2">
        <h3 className="text-lg">Good {periodOfDay()}, {userName}</h3>

        <div className={`${cn(styles.sub_item)} flex md:hidden`}>
          <div className={cn(styles.status_icon)} />
          <p>Status</p>
        </div>

        <div className={`${cn(styles.nav_item)} flex md:hidden`}>
          <div className={cn(styles.sub_item)}>
            <p><i className="fa-regular fa-paper-plane"></i></p>
            <p>{numLiveFlights}&nbsp;Live Flights</p>
          </div>
        </div>
      </div>

      <NavItem navigateToUrl={navigateToUrl} link="/" icon="house" text='Dashboard' currentPath={location.pathname} />
      <NavItem navigateToUrl={navigateToUrl} link="/lookup" icon="binoculars" text='Aircraft Lookup' currentPath={location.pathname} />
      <NavItem navigateToUrl={navigateToUrl} link="/search" icon="search" text='Aircraft Search' currentPath={location.pathname} />
      {/* <NavItem icon="plane" text='Client Match' /> */}

      <div className={cn(styles.divider)}  />
      <NavItem navigateToUrl={navigateToUrl} link="http://compareprivateplanes.com/premium" icon="user-gear" text='Settings' />
      <NavItem navigateToUrl={navigateToUrl} link="https://compareprivateplanes.com/register/your-membership" icon="user" text='Account' />
      <NavItem navigateToUrl={navigateToUrl} link="https://compareprivateplanes.com/wp-login.php?action=logout&redirect_to=https%3A%2F%2Fcompareprivateplanes.com&_wpnonce=892bc803fb" icon="right-from-bracket" text='Logout' />
    </div>
  );
};

export default Header;
