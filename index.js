// **************** //
// SETUP ZA EXPRESS //
// **************** //
import express from "express";

const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', router);

// *************************** //
// SETUP ZA MONGODB / MONGOOSE //
// *************************** //
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({path: __dirname + "/.env"})

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected"))
  .catch((error) => console.log(error));

  console.log('Loaded .env file with MONGO_URI:', process.env.MONGO_URI);

  import User from "./models/users"
// ********************** //
//   OVDJE POČINJU RUTE   //
// ********************** //


router.post("/user/create", async (req, res) => {

    const {username, email, password} = req.body;

    try {

        const newUser = new User({username, email, password});
        await newUser.save();
        console.log("User succesfully created with: ", newUser);

        if(newUser){ res.status(200).json({msg: "User Added!"}); }
    } 
    catch (error) {

        console.log("User error: ", error);
        res.status(400).json({msg: "Invalid"});
    }

});


// ********************* //
// OVDJE ZAVRŠAVAJU RUTE //
// ********************* //
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});