import axios from "axios";
import React, { useState } from "react";
import Toast from "./Toast";
import { useApp } from "../context/AppContext";

function Login({ title }) {
  const { showLogin, handleLoginClose, handleSignUpShow, setMessage, setType } =
    useApp();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  if (!showLogin) return;

  function submitLogin(e) {
    e.preventDefault();
    if (!email || !pass) return;

    axios
      .post("https://codequill-m8ak.onrender.com/user-api/login", {
        email: email,
        password: pass,
      })
      .then((res) => {
        if (res.data.success === true) {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("email", res.data.email);
          setMessage("Login Successful.");
          setType("success");
          setErr("");
          handleLoginClose();
        } else {
          setErr(res.data.message);
        }
      })
      .catch((error) => {
        setErr(error.message);
      })
      .finally(() => {
        setEmail("");
        setPass("");
      });
  }

  function signup() {
    handleLoginClose();
    handleSignUpShow();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={handleLoginClose}
      ></div>

      <div className="bg-black text-white w-full max-w-md rounded-lg shadow-lg z-50 p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold m-auto">{title}</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-3xl cursor-pointer"
            onClick={handleLoginClose}
          >
            &times;
          </button>
        </div>

        {/* {err.length !== 0 && <p className="text-sm text-red-500">*{err}</p>} */}
        {err.length !== 0 && (
          <Toast message={err} type={"error"} onClose={() => setErr("")} />
        )}

        <form className="flex flex-col gap-2" onSubmit={submitLogin}>
          <div className="">
            <label htmlFor="email">Email: </label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-1 rounded"
              placeholder="Enter email address"
              required
            />
          </div>
          <div className="">
            <label htmlFor="pass">Password: </label>
            <input
              type="password"
              name="pass"
              id="pass"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Enter password"
              className="border p-1 rounded"
              required
            />
          </div>
          <div className="flex">
            <button
              type="submit"
              className="bg-green-500 p-1 px-2 rounded cursor-pointer"
            >
              Login
            </button>
            <button
              className="ml-auto text-xs text-blue-500 underline cursor-pointer"
              onClick={signup}
            >
              Didn't have an account? Sign Up Here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
