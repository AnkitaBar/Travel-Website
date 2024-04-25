// const mongoose = require ("mongoose");
// const Schema = mongoose.Schema;

// const listingSchema = new Schema({
//     title : {
//         type : String
//     },
//     description : String,
//     image : {
//         type : String,
//         default: "https://unsplash.com/photos/dona-paula-cape-is-a-viewpoint-in-panjim-city-in-goa-state-of-india-j7rrGlxjcYM",
//         set : (v) => v === "" ? "https://unsplash.com/photos/dona-paula-cape-is-a-viewpoint-in-panjim-city-in-goa-state-of-india-j7rrGlxjcYM" : v,
//     }, 
//     price : Number,
//     location : String,
//     country : String,
// });

// const Listing = mongoose.model("Listing",listingSchema);
// module.exports = Listing;


const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;


const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
    type: Schema.Types.ObjectId,
    ref: "Review",
    },
  ],
  owner:
  {
    type: Schema.Types.ObjectId,
    ref:"User",
  },

});

listingSchema.post("findOneAndDelete", async (listing) => {
  if(listing){
    await Review.deleteMany({ _id:{ $in: listing.reviews
    }});
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;