const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { connectToMongoDB } = require("./connect");
const {restrictToLoggedinUserOnly,checkAuth}=require("./middlewares/auth")

const URL = require("./models/url");
const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const {request}=require("http");
const userRoute=require("./routes/user");

const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://127.0.0.1:27017/short-url").then(() =>
  console.log("Mongodb connected")
);
app.set("view engine","ejs");
app.set("views",path.resolve("./views"))
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

app.use("/",checkAuth,staticRoute);
app.use("/user", userRoute);
app.use("/url",restrictToLoggedinUserOnly,urlRoute);

app.get("/url/:shortId", async (req, res) => {
  try {
    const shortId = req.params.shortId;

    // Find the document with the given shortId
    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      },
      { new: true } // Return the modified document
    );

    if (!entry) {
      return res.status(404).send("Short URL not found");
    }

    // Log the updated document for debugging
    console.log("Updated entry:", entry);

    // Redirect to the specified URL
    res.redirect(entry.redirectURL);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
