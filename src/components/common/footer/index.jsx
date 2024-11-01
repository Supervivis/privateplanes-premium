import cn from "classnames";
import styles from "./Footer.module.scss";
import cropped_logo_white from "../../../assets/cropped-logo-white.webp";

const Footer = () => {
  return (
    <div className={cn(styles.footer, "flex justify-center p-10 md:p-16")}>
      <div className="container grid gap-12 xl:grid-cols-2 xl:gap-8">
        <div className={cn(styles.left_col)}>
          <div>
            <img src={cropped_logo_white} alt="" />

            <p>71–75 Shelton Street, London, WC2H 9JQ, UK</p>
            <p><a href="tel:442080505015">+44 20 8050 5015</a></p>
            <p><a href="mailto:contact@compareprivateplanes.com">contact@compareprivateplanes.com</a></p>
          </div>
          
          <p className={cn(styles.copyright_text)}>© Magic Lagoon Limited, 2023 All rights reserved</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
          <div>
            <h3>Quick Links</h3>
            
            <ul>
              <li><a href="https://compareprivateplanes.com">Home</a></li>
              <li><a href="https://compareprivateplanes.com/find">Search Aircraft</a></li>
              <li><a href="https://compareprivateplanes.com/premium/suite">Premium</a></li>
              <li><a href="https://compareprivateplanes.com/premium/partner-program">Partners</a></li>
              <li><a href="https://compareprivateplanes.com/private-jet-free-tools">Tools</a></li>
              <li><a href="https://compareprivateplanes.com/articles/glossary-of-private-jet-lingo">Glossary of Terms</a></li>
            </ul>
          </div>

          <div>
            <h3>Free Tools</h3>
            
            <ul>
              <li><a href="https://compareprivateplanes.com/private-jet-free-tools/cost-calculator">Cost Calculator</a></li>
              <li><a href="https://compareprivateplanes.com/private-jet-free-tools/emissions-calculator">Emissions Calculator</a></li>
              <li><a href="https://compareprivateplanes.com/private-jet-free-tools/fuel-burn-calculator">Fuel Burn</a></li>
              <li><a href="https://compareprivateplanes.com/private-jet-free-tools/range-map">Range Map</a></li>
            </ul>
          </div>

          <div>
            <h3>Company</h3>
            
            <ul>
              <li><a href="https://compareprivateplanes.com/advertising">Advertising</a></li>
              <li><a href="https://compareprivateplanes.com/about">About</a></li>
              <li><a href="https://compareprivateplanes.com/contact">Contact</a></li>
              <li><a href="https://compareprivateplanes.com/write-for-us">Write for Us</a></li>
            </ul>
          </div>

          <div>
            <h3>Aircraft</h3>
            
            <div className="widget widget_block">
              <ul>
                <li><a href="https://compareprivateplanes.com/prop">Prop</a></li>
                <li><a href="https://compareprivateplanes.com/vlj">Very Light Jets</a></li>
                <li><a href="https://compareprivateplanes.com/light">Light Jets</a></li>
                <li><a href="https://compareprivateplanes.com/medium">Medium Jets</a></li>
                <li><a href="https://compareprivateplanes.com/large">Large Jets</a></li>
              </ul>
            </div>
          </div>

          
          <div>
            <h3>Articles</h3>
            
            <ul>
              <li><a href="https://compareprivateplanes.com/articles/category/aircraft-comparisons">Aircraft Comparisons</a></li>
              <li><a href="https://compareprivateplanes.com/basics">The Basics</a></li>
              <li><a href="https://compareprivateplanes.com/engines">Engines</a></li>
              <li><a href="https://compareprivateplanes.com/articles/category/private-jet-charter">Private Jet Charter</a></li>
              <li><a href="https://compareprivateplanes.com/articles/category/jet-cards">Jet Cards</a></li>
              <li><a href="https://compareprivateplanes.com/articles/category/fractional-ownership">Fractional Ownership</a></li>
              <li><a href="https://compareprivateplanes.com/articles/category/private-jet-ownership">Full Ownership</a></li>
            </ul>
          </div>


          <div>
            <h3>Legal</h3>
            
            <ul>
                <li><a href="https://compareprivateplanes.com/privacy">Privacy Policy</a></li>
                <li><a href="https://compareprivateplanes.com/cookies">Cookies Policy</a></li>
                <li><a href="https://compareprivateplanes.com/terms-of-service">Terms of Service</a></li>
                <li><a href="https://compareprivateplanes.com/returns">Returns Policy</a></li>
              </ul>
          </div>
        </div>




        

      </div>
    </div>
  );
};

export default Footer;
