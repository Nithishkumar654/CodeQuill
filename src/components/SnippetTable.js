import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import axios from "axios";

const SnippetTable = ({ title }) => {
  const {
    showSnippetsModal,
    handleSnippetsClose,
    snippets,
    getSnippets,
    setMessage,
    setType,
  } = useApp();
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedSnippet, setEditedSnippet] = useState({});

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditedSnippet(snippets[index]);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditedSnippet({});
  };

  const onUpdate = async (index, edit) => {
    try {
      const response = await axios.put(
        "https://codequill-m8ak.onrender.com/snippet-api/update-snippet",
        {
          email: localStorage.getItem("email"),
          ...edit,
        }
      );

      if (response.data.success == true) {
        getSnippets();
        setMessage(response.data.message);
        setType("success");
      } else {
        setMessage(response.data.message);
        setType("error");
      }
    } catch (err) {
      setMessage(err?.response?.data?.message);
      setType("error");
    }
  };

  const handleSave = () => {
    onUpdate(editingIndex, editedSnippet);
    setEditingIndex(null);
  };

  const handleDelete = async (index) => {
    try {
      const response = await axios.delete(
        "https://codequill-m8ak.onrender.com/snippet-api/delete-snippet",
        {
          data: {
            email: localStorage.getItem("email"),
            prefix: snippets[index].prefix,
            language: snippets[index].language,
          },
        }
      );

      if (response.data.success == true) {
        getSnippets();
        setMessage(response.data.message);
        setType("success");
      } else {
        setMessage(response.data.message);
        setType("error");
      }
    } catch (err) {
      setMessage(err?.response?.data?.message);
      setType("error");
    }
  };

  if (!showSnippetsModal) return;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto">
      <div
        className="fixed inset-0 bg-black opacity-50 overflow-auto"
        onClick={handleSnippetsClose}
      ></div>

      <div className="bg-black text-white w-full max-w-3xl rounded-lg shadow-lg z-50 p-6 relative overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold m-auto">{title}</h2>
          <button
            className="text-3xl text-white hover:text-gray-700 cursor-pointer"
            onClick={handleSnippetsClose}
          >
            &times;
          </button>
        </div>
        <div className="p-4 rounded-xl shadow-md w-full mx-auto overflow-auto">
          <h2 className="font-semibold mb-4">Saved Snippets</h2>
          <table className="min-w-full border">
            <thead className="">
              <tr>
                <th className="px-4 py-2 border">Prefix</th>
                <th className="px-4 py-2 border">Language</th>
                <th className="px-4 py-2 border">Snippet</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {snippets.map((snip, index) => (
                <tr className={`${index % 2 === 0 ? "bg-black" : "bg-black"}`}>
                  <td className="px-4 py-2 border">
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={editedSnippet.prefix}
                        onChange={(e) =>
                          setEditedSnippet({
                            ...editedSnippet,
                            prefix: e.target.value,
                          })
                        }
                        className="border p-1 rounded w-full"
                      />
                    ) : (
                      snip.prefix
                    )}
                  </td>

                  <td className="px-4 py-2 border">
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={editedSnippet.language}
                        onChange={(e) =>
                          setEditedSnippet({
                            ...editedSnippet,
                            language: e.target.value,
                          })
                        }
                        className="border p-1 rounded w-full"
                      />
                    ) : (
                      snip.language
                    )}
                  </td>

                  <td className="px-4 py-2 border">
                    {editingIndex === index ? (
                      <textarea
                        rows="5"
                        value={editedSnippet.snippet}
                        onChange={(e) =>
                          setEditedSnippet({
                            ...editedSnippet,
                            snippet: e.target.value,
                          })
                        }
                        className="border p-1 rounded w-full font-mono text-sm"
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {snip.snippet.length > 120
                          ? snip.snippet.slice(0, 120) + "..."
                          : snip.snippet}
                      </pre>
                    )}
                  </td>

                  <td className="px-4 py-2 border text-center">
                    {editingIndex === index ? (
                      <>
                        <button
                          className="text-white px-2 py-1 rounded mr-2 bg-green-500 text-sm cursor-pointer"
                          onClick={handleSave}
                        >
                          Save
                        </button>
                        <button
                          className="text-white px-2 py-1 rounded bg-red-500 m-1 text-sm cursor-pointer"
                          onClick={handleCancel}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="text-white px-2 py-1 rounded text-sm bg-blue-500 cursor-pointer"
                          onClick={() => handleEdit(index)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-white px-2 py-1 rounded text-sm bg-red-500 m-1 cursor-pointer"
                          onClick={() => handleDelete(index)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SnippetTable;
