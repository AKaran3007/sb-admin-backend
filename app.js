const express = require("express");
const app = express();
const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
app.use(express.json());
const cors = require("cors");
const corsOptions ={
    origin:'https://voluble-sopapillas-11c6dd.netlify.app', 
    mode: 'no-cors',
 }
app.use(cors(corsOptions));
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
app.set("view engine" , "ejs");
app.use(express.urlencoded({ extended: false }));
var nodemailer = require('nodemailer');
const dotEnv = require("dotenv").config();
var port = process.env.PORT || 5000;

const JWT_SECRET = process.env.JWTURL

const mongoUrl = process.env.MURL
mongoose.connect(mongoUrl, {
    useNewUrlParser: true
}).then(() => {
    console.log("connected to database");
})

    .catch(e => console.log(e));

require("./userDetails")

const User = mongoose.model("userInfo");

app.post("/register", async (req, res) => {
    const { fname, lname, email, password } = req.body;
    const encryptedPassword = await bcrypt.hash(password, 10);

    try {
        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.json({ error: "User Already Exists" })
        }
        await User.create({
            fname,
            lname,
            email,
            password: encryptedPassword,
        });
        res.send({ status: "ok..." })
    } catch (error) {
        res.send({ status: "error..." })
    }
});






app.post("/login-user", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email })

    if (!user) {
        return res.json({ error: "User Not Found" })
    }

    if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ email: user.email }, JWT_SECRET);

        if (res.status(201)) {
            return res.json({ status: "ok", data: token });
        } else {
            return res.json({ error: "error" });
        }
    }
    res.json({ status: "error", error: "Invalid Password" });
});






app.post("/userData", async (req, res) => {
    const { token } = req.body;
    try {
        const user = jwt.verify(token, JWT_SECRET);
        const useremail = user.email;
        User.findOne({ email: useremail })
            .then((data) => {
                res.send({ status: "ok", data: data });
            })
            .catch((error) => {
                res.send({ status: "ok", data: error });
            });
    } catch (error) {

    }
})

// app.listen(5000, () => {
//     console.log("Server Started");
// });




app.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
        const oldUser = await User.findOne({ email });
        if (!oldUser) {
            return res.json({status:"User Not Exists!!......"})
        }
        const secret = JWT_SECRET + oldUser.password;
        const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, { expiresIn: '5m' });
        const link = `https://voluble-sopapillas-11c6dd.netlify.app/reset-password/${oldUser._id}/${token}`;

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'speaktokarananand123@gmail.com',
              pass: 'ssdmdamgfmphzqig'
            },
          });
          
          var mailOptions = {
            from: 'youremail@gmail.com',
            to: `{mail.email}`,
            subject: 'Sending Email using Node.js',
            text: link,
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        console.log(link);
    }
    catch (error) { }

});



app.get("/reset-password/:id/:token" , async (req , res) => {
    const { id , token} = req.params;
    console.log(req.params);
    const oldUser = await User.findOne({ _id: id });
    if (!oldUser) {
        return res.json({status:"User Not Exists!!......"})
    }
    const secret = JWT_SECRET + oldUser.password;
    try {
        const verify = jwt.verify(token , secret);
        res.render("index" , {email:verify.email , status:"Not Verified"})
    } catch (error) {
        res.send("Not Verified")
        console.log(error)
    }

})





app.post("/reset-password/:id/:token" , async (req , res) => {
    const { id , token} = req.params;
    const { password } = req.body;
    const oldUser = await User.findOne({ _id: id });
    if (!oldUser) {
        return res.json({status:"User Not Exists!!......"})
    }
    const secret = JWT_SECRET + oldUser.password;
    try {
        const verify = jwt.verify(token , secret);
        const encryptedpassword = await bcrypt.hash(password,10)
        await User.updateOne(
            {
                _id:id,
            },
            {
                $set: {
                    password: encryptedpassword,
                },
            }
        );
        res.json({status:"Password Updated & Please Close This Tab And GOTO Signin page"})
        res.render("index" , {email:verify.email , status:"verified"})
    } catch (error) {
        res.json({status:"Something Went Wrong"})
        console.log(error)
    }

})

app.listen(port, function() {
    console.log("App is running on port " + port);
});



