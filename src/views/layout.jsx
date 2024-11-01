import React from "react";
import Nav from "../components/common/nav/";
import Sidenav from "../components/common/sideNav/";
import Footer from "../components/common/footer";

const Layout = ({ children }) => {
  return (
    <div className="h-screen flex flex-col">
      <Nav />
      <div className="flex w-full flex-grow">
        <Sidenav />
        <div id="content-container" className="main-content overflow-y-scroll flex-grow">
          <div className="py-8 px-4 md:px-8 flex flex-col md:gap-6 gap-8 w-100">
            {children}
          </div>       
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;