// App.js
import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import SplitPane from "react-split-pane";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { AiOutlineSnippets } from "react-icons/ai";
import { LuLogIn, LuLogOut } from "react-icons/lu";
import axios from "axios";
import image from "./assets/codequill.png";

import "./App.css";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Toast from "./components/Toast";
import SnippetManager from "./components/SnippetManager";
import SnippetTable from "./components/SnippetTable";
import { useApp } from "./context/AppContext";

function App() {
  const {
    getSnippets,
    snippets,
    setSelected,
    getRuntimes,
    runCode,
    handleEditorMount,
    selected,
    runCodeRef,
    email,
    handleShow,
    input,
    codeRef,
    setInput,
    setEmail,
    setMessage,
    setType,
    editorRef,
    monacoRef,
    message,
    type,
    runtimes,
    handleLoginShow,
    loading,
    output,
  } = useApp();

  const [err, setErr] = useState(false);
  const [code, setCode] = useState("");

  // Load code for the selected language
  useEffect(() => {
    if (!selected?.language) return;

    runCodeRef.current = () => runCode(setErr);

    const savedCode = localStorage.getItem(selected.language);
    if (savedCode) {
      codeRef.current = savedCode;
      setCode(savedCode);
    }

    getSnippets();
  }, [selected, input]);

  // Load runtimes and saved input
  useEffect(() => {
    runCodeRef.current = () => runCode(setErr);
    getRuntimes();

    const savedCode = localStorage.getItem(selected.language);
    if (savedCode) codeRef.current = savedCode;

    const savedInput = localStorage.getItem("savedInput");
    if (savedInput) setInput(savedInput);

    getSnippets();
  }, []);

  // Persist code to localStorage when updated
  useEffect(() => {
    if (!selected?.language) return;

    const timeout = setTimeout(() => {
      localStorage.setItem(selected.language, code);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [code]);

  // Persist input to localStorage on change
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem("savedInput", input);
    }, 1000);

    return () => clearInterval(interval);
  }, [input]);

  // Auth token verification
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .post("https://codequill-m8ak.onrender.com/user-api/pathjump", { token })
      .then((res) => {
        const email = localStorage.getItem("email");
        if (res.data.success !== true) {
          if (email) localStorage.clear();
        } else {
          setEmail(email);
          getSnippets();
        }
      })
      .catch((err) => {
        setMessage("Error: " + err.response.data.message);
        setType("error");
      });
  }, [localStorage.getItem("token")]);

  // Re-initialize editor when snippets update
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      handleEditorMount(editorRef.current, monacoRef.current);
    }
  }, [snippets]);

  const openSnippets = () => {
    if (!email) {
      setMessage("Please Login First");
      setType("error");
    } else {
      handleShow();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setEmail(null);
    window.location.reload();
  };

  return (
    <div className="h-full w-full">
      {message.length !== 0 && (
        <Toast message={message} type={type} onClose={() => setMessage("")} />
      )}

      <SplitPane
        split="vertical"
        minSize={300}
        maxSize={1200}
        defaultSize={700}
        paneStyle={{ overflow: "auto" }}
      >
        {/* Code Editor Panel */}
        <div className="h-full flex flex-col bg-gray-200">
          <div className="flex items-center p-2 gap-2">
            <div className="">
              <img src={image} alt="logo" width={"50"} className="rounded-xl" />
            </div>
            {email ? (
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip>
                    <p className="bg-white p-1 rounded text-xs">Logout</p>
                  </Tooltip>
                }
              >
                <button
                  className="p-2 rounded bg-red-500"
                  onClick={handleLogout}
                >
                  <LuLogOut />
                </button>
              </OverlayTrigger>
            ) : (
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip>
                    <p className="bg-white p-1 rounded text-xs">Login</p>
                  </Tooltip>
                }
              >
                <button
                  className="p-2 rounded bg-green-500"
                  onClick={handleLoginShow}
                >
                  <LuLogIn />
                </button>
              </OverlayTrigger>
            )}

            <Login title="Login" />
            <SignUp title="Sign Up" />

            <p className="text-sm">Language:</p>
            <select
              className="border p-1 rounded"
              value={selected.language}
              onChange={(e) => {
                const lang = runtimes.find(
                  (p) => p.language === e.target.value
                );
                if (lang) setSelected(lang);
              }}
            >
              {runtimes.map((p) => (
                <option key={p.language} value={p.language}>
                  {p.language.toUpperCase()} {p.version}
                </option>
              ))}
            </select>

            <p className="m-auto">{email || "Guest"}</p>

            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip>
                  <p className="bg-white p-1 rounded text-xs">Snippets</p>
                </Tooltip>
              }
            >
              <button
                className="ml-auto cursor-pointer border rounded"
                onClick={openSnippets}
              >
                <AiOutlineSnippets />
              </button>
            </OverlayTrigger>

            <SnippetManager title="Snippets" />
            <SnippetTable title="Snippets" />

            <OverlayTrigger
              placement="left"
              overlay={
                <Tooltip>
                  <p className="bg-white p-1 rounded text-xs">Ctrl + Enter</p>
                </Tooltip>
              }
            >
              <button
                className="cursor-pointer bg-green-700 text-white px-3 py-1 rounded"
                onClick={() => runCodeRef.current()}
                disabled={loading}
              >
                {loading ? "Running..." : "Run Code"}
              </button>
            </OverlayTrigger>
          </div>

          <div className="flex-1">
            <Editor
              language={selected.language === "c++" ? "cpp" : selected.language}
              value={code}
              theme="vs-dark"
              onChange={(val) => {
                if (val !== undefined) {
                  codeRef.current = val;
                  setCode(val);
                }
              }}
              onMount={(editor, monaco) => {
                editorRef.current = editor;
                monacoRef.current = monaco;
                handleEditorMount(editor, monaco);
              }}
              options={{
                fontFamily: "Monaco, Menlo, 'Courier New', monospace",
                fontSize: 13,
                tabSize: 2,
                insertSpaces: true,
              }}
            />
          </div>
        </div>

        {/* Input/Output Panel */}
        <div className="h-full flex flex-col">
          <p className="text-sm p-2">input.txt</p>
          <div className="flex-1">
            <Editor
              value={input}
              onChange={(val) => setInput(val)}
              theme="vs-dark"
              options={{
                fontFamily: "Monaco, Menlo, 'Courier New', monospace",
                fontSize: 13,
                tabSize: 2,
                insertSpaces: true,
              }}
            />
          </div>

          <p className="text-sm p-2">output.txt</p>
          <div className="flex-1 border-t">
            <Editor
              value={output}
              theme="vs-dark"
              options={{
                fontFamily: "Monaco, Menlo, 'Courier New', monospace",
                fontSize: 13,
                readOnly: true,
              }}
              className={err ? "border-2 border-red-500" : ""}
            />
          </div>
        </div>
      </SplitPane>
    </div>
  );
}

export default App;
