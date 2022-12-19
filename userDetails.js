const mongoose = require("mongoose");

const userDetailsSchema = new mongoose.Schema(
    {
       fname:String,
       lname:String,
       email:{ type: String, unique: true},
       password:String,
    },
    {
        collection:"userInfo",
    }
);

mongoose.model("userInfo" , userDetailsSchema);