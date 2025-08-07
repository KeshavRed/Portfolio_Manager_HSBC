import React from "react";
import "./About.css";
import MainpgChart from "./graphs/MainpgChart";
import Cards from "./Cards";
import bull from "../assets/bull.png";


const About = () => {
    return (
        <>
            <div className="about_section">
                <div className="about_content">
                    <p>
                        <strong>FinSight</strong> is your personalized financial portfolio tracker that empowers you to make smarter investment decisions.
                        Designed with simplicity and clarity in mind, it provides a comprehensive dashboard where you can track your stocks, mutual funds,
                        and other assets in real time all in one place.
                    </p>

                </div>

                <MainpgChart />
                {/* <div className="image_main">

                <img src={bull} alt="" srcset="" />
                </div> */}

            </div>
        </>
    );
};

export default About;
