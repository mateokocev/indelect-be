// **************** //
// SETUP ZA EXPRESS //
// **************** //
import express from "express";
import cors from "cors";
const jwt = require('jsonwebtoken');

const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ exposedHeaders: ['authenticated-user'] }))
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

// ---------------------------------------------------------------------------------------------- //

// ************************* //
//   REGISTER I LOGIN RUTE   //
// ************************* //

router.route("/register")
    .post(async (req, res) => {
        try {
            const userData = req.body;
            const result = await methods.createUser(userData.name, userData.email, userData.password);
            res.setHeader('authenticated-user', result.email);
            res.status(200).json(result);
            } 

        catch (error) {
            res.status(500).json({ error: 'Registration failed' });
            }
    });




// ********************* //
// OVDJE ZAVRŠAVAJU RUTE //
// ********************* //
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});