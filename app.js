if (process.env.Node_ENV !="production"){
  require('dotenv').config();
}
// console.log(process.env.SECRET);

const express = require ("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); // create more template
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const { isLoggedIn,isOwner, isReviewAuthor } = require("./middleware.js")

const userRouter = require("./routes/user.js");
const listingController = require("./controllers/listings.js");
const reviewController  = require("./controllers/reviews.js");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);

const multer = require("multer");
const { storage } = require("./cloudConfig.js");
// const upload = multer({ dest: 'uploads/'});
const upload = multer({ storage });



const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });
    
async function main() {
    await mongoose.connect(MONGO_URL);
}

///// for session 

const sessionOptions = {
  secret: "mysupersecretstring", 
  resave: false, 
  saveUninitialized: true,
  Cookie:{
    expires: Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly: true,
  }
  };




app.get("/",(req,res)=>{
    res.send("Hi, I am root");
});

const validateListing = (req,res,next) =>{
  let { error } = listingSchema.validate(req.body);
  
  if(error){
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400,errMsg);
  }else{
      next();
  }
  };


///////////////////////// Flashhhh megg show//////////

app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());  //------to serialize(store) users into the session--------//
passport.deserializeUser(User.deserializeUser());  //------to deserialize(remove) users into the session--------//


app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/",userRouter);

// app.get("/demouser", async(req,res) => {
//   let fakeUser = new User({
//     email:"student@gmail.com",
//     username: "delta-student",
//   });

//   let registeredUser = await User.register(fakeUser,"helloworld"); //// fakeuser----> user , helloworld-----> password
//   res.send(registeredUser);
// });






//Index Route
app.get("/listings",wrapAsync(listingController.index));

//New Route
app.get("/listings/new", isLoggedIn,listingController.newform);


//Show Route
app.get("/listings/:id",listingController.showListing);

/////// Create route 
app.post(
  "/listings",
  isLoggedIn,
  // validateListing,
  upload.single("listing[image]"),
wrapAsync(listingController.createListing)
);

///Edit route
app.get("/listings/:id/edit",
isLoggedIn,
isOwner
,listingController.editListing);

//Update Route
app.put("/listings/:id",
isLoggedIn,
isOwner,
validateListing,
wrapAsync(listingController.updateListing));
  
  //Delete Route
  app.delete("/listings/:id",
  isLoggedIn,
  isOwner
  ,listingController.deleteListing);

  /////Review Route
  //////Post Route

  app.post("/listings/:id/reviews",isLoggedIn, reviewController.createReview);

  ////////////////Delete review Route

app.delete("/listings/:id/reviews/:reviewId",isLoggedIn, isReviewAuthor, reviewController.destroyreview);


// app.get("/testListning",async(req,res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

app.all("*",(req,res,next) => {
  next(new ExpressError(404,"Page not found!"));
});

app.use((err,req,res,next) =>{
  let{statusCode = 500,message ="something went wrong"}= err;
  res.status(statusCode).render("error.ejs",{message});
  //res.status(statusCode).send(message);
  //res.send("something went wrong");
});

app.listen(8080, () =>{
    console.log("server is listening to port 8080");
});