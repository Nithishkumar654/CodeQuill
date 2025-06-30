const exp = require("express");
const dotenv = require("dotenv").config();
const app = exp();
const cors = require("cors");
const path = require("path");
app.use(exp.static(path.join(__dirname, "./build")));
app.use(cors());
const { MongoClient } = require("mongodb");

const PORT = process.env.PORT || 3500;
const http = require("http");
const server = http.createServer(app);

server.listen(PORT, () => console.log("server listening on port 3500..."));

const userApp = require("./APIs/usersAPI");
app.use("/user-api", userApp);

const snippetApp = require("./APIs/snippetsAPI");
app.use("/snippet-api", snippetApp);

const MONGODB_URI = process.env.MONGODB_URI;
const client = new MongoClient(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client
  .connect()
  .then(async (dbRef) => {
    const dbObj = dbRef.db("codequill");
    const usersCollectionObj = dbObj.collection("usersCollection");
    const snippetsCollectionObj = dbObj.collection("snippetsCollection");
    app.set("usersCollectionObj", usersCollectionObj);
    app.set("snippetsCollectionObj", snippetsCollectionObj);
    app.set("dbObj", dbObj);

    console.log("DB Connection Success..");
  })
  .catch((err) => console.log("DB error" + err));

const invalidPathMiddleware = (req, res, next) => {
  res.send({ message: "Invalid Path" });
};
app.use(invalidPathMiddleware);

const errhandlingMiddleware = (error, req, res, next) => {
  res.send({ message: error.message });
};
app.use(errhandlingMiddleware);
