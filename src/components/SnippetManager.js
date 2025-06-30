import axios from "axios";
import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import image from "../assets/codequill.png";

const SnippetManager = ({ title }) => {
  const {
    show,
    handleClose,
    setMessage,
    setType,
    selected,
    handleSnippetsShow,
  } = useApp();
  const [prefix, setPrefix] = useState("");
  const [snippet, setSnippet] = useState("");

  if (!show) return null;

  async function getSnippets() {
    try {
      const response = await axios.get(
        "https://codequill-m8ak.onrender.com/snippet-api/get-snippets",
        {
          params: {
            language: selected.language,
            email: localStorage.getItem("email"),
          },
        }
      );

      if (response.data.success == true) {
        setMessage(response.data.message);
        setType("success");
        handleSnippetsShow();
      } else {
        setMessage(response.data.message || "Something went wrong..");
        setType("error");
      }
    } catch (err) {
      setMessage(err.response.data.message || "Something went wrong..");
      setType("error");
    } finally {
      handleClose();
    }
  }

  async function addSnippet(e) {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://codequill-m8ak.onrender.com/snippet-api/add-snippet",
        {
          email: localStorage.getItem("email"),
          prefix: prefix,
          snippet: snippet,
          language: selected.language,
        }
      );

      if (response.data.success == true) {
        setMessage(response.data.message);
        setType("success");
      } else {
        setMessage(response.data.message || "Something went wrong..");
        setType("error");
      }
    } catch (err) {
      setMessage(err.response.data.message || "Something went wrong..");
      setType("error");
    } finally {
      handleClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={handleClose}
      ></div>

      <div className="bg-black text-white w-full max-w-md rounded-lg shadow-lg z-50 p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <img src={image} alt="logo" width={"90"} className="rounded-xl" />
          <h2 className="text-xl m-auto font-semibold">{title}</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-3xl cursor-pointer"
            onClick={handleClose}
          >
            &times;
          </button>
        </div>

        <form className="flex flex-col gap-2" onSubmit={addSnippet}>
          <div className="">
            <label htmlFor="prefix">Enter Prefix: </label>
            <input
              type="text"
              value={prefix}
              name="prefix"
              id="prefix"
              onChange={(e) => setPrefix(e.target.value)}
              className="border rounded p-1"
              placeholder="Prefix to retrieve snippet"
              required
            />
          </div>
          <div className="">
            <label htmlFor="snippet">Code Snippet: </label>
            <textarea
              name="snippet"
              value={snippet}
              id="snippet"
              onChange={(e) => setSnippet(e.target.value)}
              className="border rounded p-1"
              rows={10}
              placeholder="Paste Code Snippet Here.."
              required
            ></textarea>
          </div>

          <p className="text-sm text-red-500">
            <b>NOTE:</b> The code snippet will be saved and accessible under the
            selected language only.
          </p>
          <div className="flex items-center">
            <button
              className="cursor-pointer text-blue-500 underline rounded p-1"
              onClick={getSnippets}
            >
              View All Snippets
            </button>

            <button
              type="submit"
              className="ml-auto bg-green-500 rounded p-1 cursor-pointer"
            >
              Add Snippet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SnippetManager;
