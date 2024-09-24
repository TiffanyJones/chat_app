import React, { useState } from "react";
import "./Login.css";
import assets from "../../assets/assets";
import { signup, login } from "../../config/firebase";
import { toast } from "react-toastify";

const Login = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    console.log("Submitting form:", { currState, userName, email, password });

    try {
      if (currState === "Sign up") {
        await signup(userName, email, password);
        toast.success("Signup successful!");
      } else {
        // Log the attempt to log in
        console.log("Attempting to login with:", email, password);
        const userCredential = await login(email, password);
        console.log("Login successful:", userCredential);
      }
    } catch (error) {
      console.error("Error during login/signup:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const toggleState = () => {
    setCurrState(currState === "Sign up" ? "Login" : "Sign up");
    setUserName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="login">
      <img src={assets.logo_big} alt="Logo" className="logo" />
      <form className="login-form" onSubmit={onSubmitHandler}>
        <h2>{currState}</h2>
        {currState === "Sign up" && (
          <input
            onChange={(e) => setUserName(e.target.value)}
            value={userName}
            type="text"
            placeholder="Username"
            className="form-input"
            required
          />
        )}
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          placeholder="Email address"
          className="form-input"
          required
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          placeholder="Password"
          className="form-input"
          required
        />
        {currState === "Sign up" && (
          <div className="login-term">
            <input type="checkbox" required />
            <p>Agree to the terms of use & privacy policy.</p>
          </div>
        )}
        <button type="submit">{currState}</button>
        <div className="login-forgot">
          <p className="login-toggle">
            {currState === "Sign up"
              ? "Already have an account?"
              : "Don't have an account?"}
            <span onClick={toggleState}> Click here</span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
