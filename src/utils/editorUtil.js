import axios from "axios";

export async function getRuntimes(setRuntimes, setSelected) {
  const response = await axios.get("https://emkc.org/api/v2/piston/runtimes");
  const sorted = response.data.sort((a, b) =>
    a.language.localeCompare(b.language)
  );
  setRuntimes(sorted);

  const cpp = sorted.find((e) => e.language === "c++");
  setSelected(cpp);
}

export async function runCode(
  selected,
  input,
  codeRef,
  setLoading,
  setErr,
  setOutput,
  loading
) {
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

export function handleEditorMount(
  editor,
  monaco,
  runCodeRef,
  userSnippets = []
) {
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
    runCodeRef.current();
  });

  const model = editor.getModel();
  const langId = model.getLanguageId();

  monaco.editor.setModelLanguage(model, langId);

  monaco.languages.registerCompletionItemProvider(langId, {
    triggerCharacters: ["."],
    provideCompletionItems: () => {
      const filteredSnippets = userSnippets.filter((s) => {
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
