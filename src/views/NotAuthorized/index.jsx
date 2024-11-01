import React from "react";
import cn from "classnames";
import styles from "./not-authroized.module.scss";
import cropped_logo_blue from "../../assets/cropped-logo-blue.png";

const NotAuthroized = () => {
  return (
    <section className={cn(styles.not_authorized_section)}>
      <div className={cn(styles.contain_image)}>
        <img src={cropped_logo_blue} alt="" />
      </div>
      <h1 className="mt-4">Unauthorized Access</h1>
      <h3>Please <a href="https://compareprivateplanes.com/sign-in">Log In</a> or <a href="https://compareprivateplanes.com/premium/suite">Join Premium</a> to Access Premium Features</h3>
    </section>
  );
};

export default NotAuthroized;
