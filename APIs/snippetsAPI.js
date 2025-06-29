const exp = require("express");
const snippetApp = exp.Router();
const expressAsyncHandler = require("express-async-handler");

snippetApp.use(exp.json());

snippetApp.get(
  "/get-snippets",
  expressAsyncHandler(async (req, res) => {
    const usersCollectionObj = req.app.get("usersCollectionObj");
    const { email, language } = req.query;

    if (!email) {
      return res.status(400).send({ message: "Please Login." });
    }

    const user = await usersCollectionObj.findOne({ email });

    if (!user || !user.snippets) {
      return res.status(404).send({ message: "No snippets found" });
    }

    let snippets = user.snippets;
    if (language) {
      snippets = snippets.filter((e) => e.language === language);
    }

    res
      .status(200)
      .send({ success: true, message: "Snippets fetched", snippets });
  })
);

snippetApp.post(
  "/add-snippet",
  expressAsyncHandler(async (req, res) => {
    const usersCollectionObj = req.app.get("usersCollectionObj");

    const { email, ...newSnippet } = req.body;

    const exists = await usersCollectionObj.findOne({
      email,
      "snippets.prefix": newSnippet.prefix,
      "snippets.language": newSnippet.language,
    });

    if (exists) {
      return res.status(400).send({
        message: "Snippet with same prefix and language already exists..",
      });
    }

    const result = await usersCollectionObj.updateOne(
      { email: email },
      { $push: { snippets: newSnippet } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send({ message: "User not found." });
    }

    res
      .status(200)
      .send({ success: true, message: "Snippet added successfully." });
  })
);

snippetApp.put(
  "/update-snippet",
  expressAsyncHandler(async (req, res) => {
    const usersCollectionObj = req.app.get("usersCollectionObj");

    const { email, prefix, language, snippet } = req.body;

    if (!email || !prefix || !language || !snippet) {
      return res.status(400).send({ message: "Can't update the snippet." });
    }

    const result = await usersCollectionObj.updateOne(
      {
        email,
        "snippets.prefix": prefix,
        "snippets.language": language,
      },
      {
        $set: {
          "snippets.$.snippet": snippet,
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .send({ message: "Snippet not found or already updated." });
    }

    res
      .status(200)
      .send({ success: true, message: "Snippet updated successfully." });
  })
);

snippetApp.delete(
  "/delete-snippet",
  expressAsyncHandler(async (req, res) => {
    const usersCollectionObj = req.app.get("usersCollectionObj");

    const { email, prefix, language } = req.body;

    if (!email || !prefix || !language) {
      return res.status(400).send({ message: "Something went wrong.." });
    }

    const result = await usersCollectionObj.updateOne(
      { email },
      {
        $pull: {
          snippets: { prefix: prefix, language: language },
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Snippet not found or already deleted.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Snippet deleted successfully.",
    });
  })
);

module.exports = snippetApp;
