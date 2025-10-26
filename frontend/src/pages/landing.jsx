import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

export default function LandingPage() {
  const router = useNavigate(); // no reloading when router used, otherwise do manually
  return (
    <div className="landingPageContainer">
      <nav>
        <div className="navHeader">
          <h2>VidConnect</h2>
        </div>
        <div className="navList">
          <p
            onClick={() => {
              router("/q123guest");
            }}
          >
            Join as Guest
          </p>

          <p
            onClick={() => {
              router("/auth");
            }}
          >
            Register
          </p>
          <div
            onClick={() => {
              router("/auth");
            }}
            role="button"
          >
            {" "}
            <p>Login</p>
          </div>
        </div>
      </nav>

      <div className="landingMainContainer">
        <div>
          <h1>
            <span style={{ color: "#FF9839" }}>Connect</span> with your loved
            ones
          </h1>
          <p>Experience seamless video calls with our user-friendly platform</p>

          <div role="button">
            <Link to="/auth" className="getStartedLink">
              Get Started
            </Link>
          </div>
        </div>

        <div>
          <img src="/mobile.png" alt="mobile" />
        </div>
      </div>
    </div>
  );
}
