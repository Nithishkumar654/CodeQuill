import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import "./App.css";
import SplitPane from "react-split-pane";
import { AiOutlineSnippets } from "react-icons/ai";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { LuLogIn, LuLogOut } from "react-icons/lu";
import SnippetManager from "./components/SnippetManager.js";
import Login from "./components/Login.js";
import SignUp from "./components/SignUp.js";
import Toast from "./components/Toast.js";
import axios from "axios";
import { useApp } from "./context/AppContext.js";
import SnippetTable from "./components/SnippetTable.js";

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

  useEffect(() => {
    runCodeRef.current = () => runCode(setErr);

    const savedCode = localStorage.getItem(selected.language);
    if (savedCode) {
      codeRef.current = savedCode;
      setCode(savedCode);
    }

    getSnippets();
  }, [selected, input]);

  useEffect(() => {
    runCodeRef.current = () => runCode(setErr);
    getRuntimes();
    const savedCode = localStorage.getItem("savedCode");
    if (savedCode) codeRef.current = savedCode;

    const savedInput = localStorage.getItem("savedInput");
    if (savedInput) setInput(savedInput);

    getSnippets();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(selected.language, codeRef.current);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [codeRef.current]);

  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem("savedInput", input);
    }, 1000);

    return () => clearInterval(interval);
  }, [input]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .post("http://localhost:3500/user-api/pathjump", { token: token })
      .then((res) => {
        if (res.data.success !== true) {
          localStorage.clear();
        } else {
          const email = localStorage.getItem("email");
          setEmail(email);
          getSnippets();
        }
      })
      .catch((err) => {
        setMessage("Error: " + err.response.data.message);
        setType("error");
      });
  }, [localStorage.getItem("token")]);

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      handleEditorMount(editorRef.current, monacoRef.current);
    }
  }, [snippets]);

  function openSnippets() {
    if (!email) {
      setMessage("Please Login First");
      setType("error");
    } else {
      handleShow();
    }
  }

  function handleLogout() {
    localStorage.clear();
    setEmail(null);
    window.location.reload();
  }

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
        <div className="h-full flex flex-col bg-gray-200">
          <div className="flex items-center p-2 gap-2">
            {email ? (
              <OverlayTrigger
                key={"bottom"}
                placement={"bottom"}
                overlay={
                  <Tooltip id={`tooltip-${"bottom"}`}>
                    <p className="bg-white p-1 rounded text-xs">Logout</p>
                  </Tooltip>
                }
              >
                <button
                  className="p-2 rounded bg-red-500"
                  onClick={handleLogout}
                >
                  {" "}
                  <LuLogOut />{" "}
                </button>
              </OverlayTrigger>
            ) : (
              <OverlayTrigger
                key={"bottom"}
                placement={"bottom"}
                overlay={
                  <Tooltip id={`tooltip-${"bottom"}`}>
                    <p className="bg-white p-1 rounded text-xs">Login</p>
                  </Tooltip>
                }
              >
                <button
                  className="p-2 rounded bg-green-500"
                  onClick={handleLoginShow}
                >
                  {" "}
                  <LuLogIn />{" "}
                </button>
              </OverlayTrigger>
            )}

            <Login title="Login" />

            <SignUp title="Sign Up" />

            <p className="text-sm">Language:</p>
            <select
              className="border p-1 rounded"
              onChange={(e) => {
                const s = runtimes.find((p) => p.language == e.target.value);
                if (s) {
                  setSelected(s);
                }
              }}
            >
              {runtimes.map((p) => (
                <option value={p.language}>
                  {p.language.toUpperCase()} {p.version}
                </option>
              ))}
            </select>

            {email ? (
              <p className="m-auto">{email}</p>
            ) : (
              <p className="m-auto">Guest</p>
            )}

            <OverlayTrigger
              key={"bottom"}
              placement={"bottom"}
              overlay={
                <Tooltip id={`tooltip-${"bottom"}`}>
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
              key={"left"}
              placement={"left"}
              overlay={
                <Tooltip id={`tooltip-${"left"}`}>
                  {" "}
                  <p className="bg-white p-1 rounded text-xs zIndex-1">
                    Ctrl + Enter
                  </p>{" "}
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
              defaultValue={codeRef.current}
              onChange={(val) => {
                codeRef.current = val;
              }}
              value={code}
              theme="vs-dark"
              onMount={(editor, monaco) => {
                editorRef.current = editor;
                monacoRef.current = monaco;
              }}
              options={{
                fontFamily: "Monaco, Menlo, 'Courier New', monospace",
                fontSize: 13,
                tabSpace: 2,
              }}
            />
          </div>
        </div>

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
