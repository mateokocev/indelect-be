// **************** //
// SETUP ZA EXPRESS //
// **************** //

import express from "express";
import cors from "cors";
import methods from "./handlers/userHandlers.js";
import User from "./models/Users.js";
import jwt from "jsonwebtoken";

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
            const findUser = User.findOne({username: userData.username} || {email: userData.email});

            if(findUser){
                const result = await methods.createUser(userData.username, userData.email, userData.password);

                res.setHeader('authenticated-user', result.email);
                res.status(200).json(result);
            }
            else{
                res.status(500).json({ error: 'User exists' });
            }} 
        catch (error) {
            res.status(500).json({ error: 'Registration failed' });
            }
    });

router.route("/login")
    .post(async (req, res) => {
        try {
            const userData = req.body;
            const user = await methods.checkCredentials(userData.email, userData.password);
            if (user) {
                const token = jwt.sign({email: User.email}, JWT_SECRET_KEY);  //ovaj jwt_secret_key treba namjestiti
                res.status(200).json({token});
            }
            else{
                return res.status(401).json({ error: 'Authentication failed' });
            }}
        catch(error) {
            res.status(500).json({ error: 'Authentication failed' });
        }
    });


// ********************* //
// OVDJE ZAVRŠAVAJU RUTE //
// ********************* //
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});