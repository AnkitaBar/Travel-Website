const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

//-----------------FOR SIGN UP PAGE------------//

router.get("/signup", userController.renderSignupForm);

router.post("/signup", wrapAsync(userController.signup));



//-----------FOR LOGIN PAGE-------------//
router.get("/login", userController.renderLoginForm);

router.post(
    "/login",
    saveRedirectUrl, 
    passport.authenticate("local", {
        failureRedirect: "/login", 
        failureFlash: true,
    }),
userController.login);

/////////////// Logout route
////automatically logout [req.logout] funtion

router.get("/logout", userController.logout);


module.exports = router;