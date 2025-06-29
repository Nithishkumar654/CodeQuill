import axios from "axios";
import React, { useState } from "react";
import Toast from "./Toast";
import { useApp } from "../context/AppContext";

function SignUp({ title }) {
  
  const { showSignUp, handleSignUpClose, setMessage, setType } = useApp();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [repeatPass, setRepeatPass] = useState("");
  const [err, setErr] = useState("");

  if (!showSignUp) return;

  function submitSignUp(e) {
    e.preventDefault();
    axios
      .post("http://localhost:3500/user-api/signup", {
        email: email,
        password: pass,
        repeatPassword: repeatPass,
      })
      .then((res) => {
        if (res.data.success === true) {
          handleSignUpClose();
          setMessage("User Registered Successfully.");
          setType("success");
          setErr("");
        } else {
          setErr(res.data.message);
        }
      })
      .catch((err) => setErr(err.message))
      .finally(() => {
        setEmail("");
        setPass("");
        setRepeatPass("");
      });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={handleSignUpClose}
      ></div>

      <div className="bg-black text-white w-full max-w-md rounded-lg shadow-lg z-50 p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold m-auto">{title}</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-3xl cursor-pointer"
            onClick={handleSignUpClose}
          >
            &times;
          </button>
        </div>

        {/* {err.length !== 0 && <p className="text-sm text-red-500">*{err}</p>} */}
        {err.length !== 0 && (
          <Toast message={err} type={"error"} onClose={() => setErr("")} />
        )}

        <form className="flex flex-col gap-2" onSubmit={submitSignUp}>
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
          <div className="">
            <label htmlFor="repeatpass">Repeat Password: </label>
            <input
              type="password"
              name="repeatpass"
              id="repeatpass"
              value={repeatPass}
              onChange={(e) => setRepeatPass(e.target.value)}
              placeholder="Re-enter password"
              className="border p-1 rounded"
              required
            />
          </div>
          <div className="flex">
            <button
              type="submit"
              className="m-auto bg-green-500 p-1 px-2 rounded cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
