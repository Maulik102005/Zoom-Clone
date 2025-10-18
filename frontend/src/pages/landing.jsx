import React from "react";

export default function LandingPage() {
  return (
    <div className="landingPageContainer">
      <nav>
        <div className="navHeader">
          <h2>Video Call</h2>
        </div>
        <div className="navList">
          <p>Join as Guest</p>
          <p>Register</p>
          <div role="button">
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
          <p>
            Experience seamless video calls with our user-friendly platform.
          </p>

          <div role="button" className="getStartedButton">
            Get Started
          </div>
        </div>

        <div>
          <img src="/public/mobile.png" alt="mobile" />
        </div>
      </div>
    </div>
  );
}
