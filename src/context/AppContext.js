import axios from "axios";
import { createContext, useContext, useRef, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [email, setEmail] = useState(localStorage.getItem("email") || null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [snippets, setSnippets] = useState([]);
  const [toast, setToast] = useState({ message: "", type: "" });

  const [selected, setSelected] = useState({});
  const [runtimes, setRuntimes] = useState([]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const [message, setMessage] = useState("");
  const [type, setType] = useState("");

  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSnippetsModal, setShowSnippetsModal] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleLoginClose = () => setShowLogin(false);
  const handleLoginShow = () => setShowLogin(true);

  const handleSignUpClose = () => setShowSignUp(false);
  const handleSignUpShow = () => setShowSignUp(true);

  const handleSnippetsClose = () => setShowSnippetsModal(false);
  const handleSnippetsShow = () => setShowSnippetsModal(true);

  const codeRef = useRef("");
  const runCodeRef = useRef(() => {});

  async function getRuntimes() {
    const response = await axios.get("https://emkc.org/api/v2/piston/runtimes");
    const sorted = response.data.sort((a, b) =>
      a.language.localeCompare(b.language)
    );
    setRuntimes(sorted);

    const cpp = sorted.find((e) => e.language === "c++");
    setSelected(cpp);
  }

  async function getSnippets() {
    if (!localStorage.getItem("email")) return;

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
        setSnippets(response.data.snippets);
      } else {
        setMessage(response.data.message || "Something went wrong..");
        setType("error");
      }
    } catch (err) {
      setMessage(err.response.data.message || "Something went wrong..");
      setType("error");
    }
  }

  async function runCode(setErr) {
    if (loading) return;

    const latestCode = codeRef.current;
    setLoading(true);
    setErr(false);

    try {
      const response = await axios.post(
        "https://emkc.org/api/v2/piston/execute",
        {
          language: selected.language || "c++",
          version: selected.version || "10.2.0",
          files: [{ content: latestCode }],
          stdin: input,
          run_timeout: 1000,
        }
      );

      const { stdout, stderr, signal } = response.data.run || {};
      const compileErr = response.data.compile?.stderr;

      if (signal) setOutput("Time Limit Exceeded or other error occurred.!");
      else if (stderr) setOutput(stderr);
      else if (compileErr) setOutput(compileErr);
      else setOutput(stdout);

      if (stderr || compileErr || signal) setErr(true);
    } catch (err) {
      setErr(true);
      setOutput(
        "Something went wrong!! " + (err.message || "Could not run the code.")
      );
    } finally {
      setLoading(false);
    }
  }

  function handleEditorMount(editor, monaco) {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runCodeRef.current();
    });

    const model = editor.getModel();
    const langId = model.getLanguageId();

    monaco.editor.setModelLanguage(model, langId);

    monaco.languages.registerCompletionItemProvider(langId, {
      triggerCharacters: ["."],
      provideCompletionItems: () => {
        const filteredSnippets = snippets.filter((s) => {
          if (s.language === "c++") s.language = "cpp";
          return s.language === langId;
        });

        const suggestions = filteredSnippets.map((snip) => ({
          label: snip.prefix,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: snip.snippet,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: snip.snippet,
        }));

        return { suggestions };
      },
    });
  }

  return (
    <AppContext.Provider
      value={{
        getSnippets,
        runCode,
        handleEditorMount,
        getRuntimes,
        handleClose,
        handleLoginClose,
        handleLoginShow,
        handleShow,
        handleSignUpClose,
        handleSignUpShow,
        codeRef,
        runCodeRef,
        selected,
        setSelected,
        runtimes,
        setRuntimes,
        input,
        setInput,
        output,
        setOutput,
        loading,
        setLoading,
        show,
        showSnippets,
        setShowSnippets,
        editorRef,
        monacoRef,
        message,
        setMessage,
        type,
        setType,
        email,
        setEmail,
        token,
        setToken,
        snippets,
        setSnippets,
        toast,
        showLogin,
        setShowLogin,
        showSignUp,
        setShowSignUp,
        showSnippetsModal,
        setShowSnippetsModal,
        handleSnippetsClose,
        handleSnippetsShow,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
