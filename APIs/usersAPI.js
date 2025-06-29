const exp = require("express");
const userApp = exp.Router();
const bcryptjs = require("bcryptjs");
const verifyToken = require("../verifyToken");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

const expressAsyncHandler = require("express-async-handler");

userApp.get(
  "/get-users",
  expressAsyncHandler(async (req, res) => {
    const usersCollectionObj = req.app.get("usersCollectionObj");

    let usersList = await usersCollectionObj.find().toArray();

    res.status(200).send({ message: "Users List", users: usersList });
  })
);

userApp.use(exp.json());

userApp.post(
  "/signup",
  expressAsyncHandler(async (req, res) => {
    const usersCollectionObj = req.app.get("usersCollectionObj");

    const newUser = req.body;

    let userObj = await usersCollectionObj.findOne({ email: newUser.email });

    if (userObj === null) {
      if (newUser.password !== newUser.repeatPassword) {
        res
          .status(200)
          .send({ message: "Password and Repeat Password must be Same..!!" });
      } else {
        const hashedPassword = await bcryptjs.hash(newUser.password, 9);

        newUser.password = hashedPassword;
        delete newUser.repeatPassword;

        await usersCollectionObj.insertOne(newUser);
        res.status(201).send({ message: "User Added", success: true });
      }
    } else {
      res.status(200).send({ message: "Email already exists" });
    }
  })
);

userApp.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    const usersCollectionObj = req.app.get("usersCollectionObj");

    const user = req.body;

    let userObj = await usersCollectionObj.findOne({ email: user.email });

    if (userObj === null) {
      res.status(200).send({ message: "Invalid Email \nRegister to Continue" });
    } else {
      let isEqual = await bcryptjs.compare(user.password, userObj.password);

      if (isEqual === false) {
        res.status(200).send({ message: "Incorrect Password" });
      } else {
        let jwtToken = jwt.sign(
          { userid: user.userid },
          process.env.SECRET_KEY,
          { expiresIn: "1d" }
        );

        res.status(201).send({
          message: "Login Success",
          success: true,
          token: jwtToken,
          email: userObj.email,
        });
      }
    }
  })
);

userApp.post("/pathjump", verifyToken, async (req, res) => {
  res.send({ success: true });
});

userApp.post("/sendemail", async (req, res) => {
  const usersCollectionObj = req.app.get("usersCollectionObj");

  const email = req.body.email;

  let dbUser = await usersCollectionObj.findOne({ email: email });

  if (!dbUser) {
    res.send({
      message:
        "*No Account Available with the given UserID.. \nRegister to Continue",
    });
    return;
  }

  if (email !== dbUser.email) {
    res.send({
      message:
        "*Email Doesnot Match \nPlease Enter the corresponding Email of UserID",
    });
    return;
  }

  const otp = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);

  const message_ = `
    Your OTP is ${otp} for your Account Verification.
    Do not Share this with Anybody.
    This will be active for 5 minutes from now.
    Thank You.
    `;

  try {
    const send_to = email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = email;
    const subject = "OTP from CVM for Account Verification";
    const message = message_;

    let token = jwt.sign({ otp: otp }, process.env.SECRET_KEY, {
      expiresIn: "5m",
    });

    let hashedOtp = await bcryptjs.hash(otp.toString(), 10);

    await sendEmail(subject, message, send_to, sent_from, reply_to);

    res.status(200).json({
      success: true,
      message: "Email Sent",
      otpToken: token,
      otp: hashedOtp,
    });
  } catch (err) {
    res.status(500).json(new Error("*Incorrect Email"));
  }
});

userApp.post("/verifyotp", verifyToken, async (req, res) => {
  const otp = req.body.otp;
  const hashedOtp = req.body.hashedOtp;

  let isEqual = await bcryptjs.compare(otp.toString(), hashedOtp);
  if (isEqual === false) {
    res.send({ message: "* OTP is Incorrect" });
  } else {
    res.send({ success: true, message: "Verification Success.." });
  }
});

userApp.post(
  "/update-password",
  expressAsyncHandler(async (req, res) => {
    const usersCollectionObj = req.app.get("usersCollectionObj");
    const email = req.body.email;
    if (req.body.newPass !== req.body.repeatPass) {
      res.send({
        message: "*New Password and Repeat Password must be Same..!!",
      });
      return;
    }

    const pass = req.body.newPass;

    const hashedPassword = await bcryptjs.hash(pass, 9);

    await usersCollectionObj.updateOne(
      { email: email },
      { $set: { password: hashedPassword } }
    );

    res.status(201).send({ message: "New Password Updated", success: true });
  })
);

userApp.post(
  "/profile-update",
  expressAsyncHandler(async (req, res) => {
    const usersCollectionObj = req.app.get("usersCollectionObj");

    try {
      const user = req.body;
      await usersCollectionObj.updateOne(
        { userid: user.userid },
        {
          $set: {
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            picture: user.picture,
          },
        }
      );
      res
        .status(201)
        .send({ success: true, message: "Profile Updated Successfully" });
    } catch (err) {
      res.status(400).send({ message: "Error while Updating Profile" });
    }
  })
);

module.exports = userApp;
