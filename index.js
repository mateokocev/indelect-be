// **************** //
// SETUP ZA EXPRESS //
// **************** //

import express from "express";
import cors from "cors";
import methods from "./handlers/userHandlers.js";
import methodsEx from "./handlers/exhibitHandlers.js";
import User from "./models/users.js";
import Ticket from "./models/ticket.js";
import Exhibit from "./models/exhibits.js";
import qrcode from 'qrcode';

import jwt from "jsonwebtoken";

import bodyParser from "body-parser";

const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(cors({ exposedHeaders: ["authenticated-user"] }));
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
app.use("/api", router);


// *************************** //
// SETUP ZA MONGODB / MONGOOSE //
// *************************** //
import mongoose from "mongoose";
import dotenv from "dotenv";
import QrCode from "./models/qrCodes.js";
dotenv.config({ path: `./.env` });

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected"))
  .catch((error) => console.log(error));

console.log("Loaded .env file with MONGO_URI:", process.env.MONGO_URI);

// ********************** //
//   OVDJE POČINJU RUTE   //
// ********************** //

// ---------------------------------------------------------------------------------------------- //

// ************************* //
//   REGISTER I LOGIN RUTE   //
// ************************* //



router.route("/register").post(async (req, res) => {
  try {
    const userData = req.body;
    const findUser = await User.findOne({
      $or: [{ username: userData.username }, { email: userData.email }],
    });

    if (!findUser) {
      const result = await methods.createUser(
        userData.username,
        userData.email,
        userData.password
      );
      res.status(201).json(result);
    } else {
      res.status(500).json({ error: "User exists" });
    }
  } catch (error) {
    res.status(500).json({ error: "Registration failed." });
  }
});

router.route("/login").post(async (req, res) => {
  try {
    const userData = req.body;
    const user = await methods.checkCredentials(
      userData.email,
      userData.password
    );
    console.log(user);
    console.log("received request for login");
    if (user) {
      console.log(user.email, user.isAdmin);
      const token = jwt.sign(
        { email: user.email, isAdmin: user.isAdmin },
        process.env.JWT_SECRET_KEY
      );
      res.status(200).json({ token, isAdmin: user.isAdmin });
    } else {
      return res.status(401).json({ error: "Authentication failed" });
    }
  } catch (error) {
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.route("/exhibit/getall").get(async (req, res) => {
  try {
    const exhibits = await methodsEx.getAllExhibits();
    res.status(200).json(exhibits);
  } catch (error) {
    console.log("The error causing the failed fetch: ", error)
    res.status(500).json({ error: "Failed to fetch exhibits" });
  }
});

router.route('/ticket/getAllTickets').get(async (req, res) => {
  const tickets = await Ticket.find({});
  res.json(tickets);
});

router.route('/GetUserName').get(async (req, res) => {
  const userEmail = req.query.email;

  try {
    const username = await User.findOne({ email: userEmail });
    res.json(username);
  } catch (error) {
    console.error('Error fetching username:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




router.route('/usporedi/').get(async (req, res) => {
  try {
    const qrCode = req.url.split('/usporedi/?')[1]; 
    const model = await QrCode.findOne({ url: qrCode });

    if (model) {
      // Found
      res.json(true);
    } else {
      // Not found
      res.json(false);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});






const generateUniqueQRCode = async (musemName, email) => {
  try {
  
    const qrCodeData = await qrcode.toDataURL(JSON.stringify("http://localhost:5173/map/"+ musemName+"/"+email));


    const newQrCode = new QrCode({
      url: qrCodeData
    });
    await newQrCode.save();

    return qrCodeData;
    // console.log(`QR Code for ticket ${ticket.MuseumName} and email ${email}:`, qrCodeData);
  } catch (error) {
    console.error("unique qrcode");
    return false;
  }
};

const generateQRCodesForAllTickets = async (email,musemName) => {
  try {
    const tickets = await Ticket.find({});
    for (const ticket of tickets) {
      if(ticket.MuseumName == musemName)
      return await generateUniqueQRCode(ticket.MuseumName, email);
    }
  } catch (error) {
    console.error("Error fetching tickets:", error);
  }
};

// Replace with the user's email
const userEmail = "user@example.com";

// Call the function to fetch tickets and generate unique QR codes



router.route('/ticket/getQrCode').get(async (req, res) => {
  try {
    const { mail, museumName } = req.query;
    if (!mail || !museumName) {
      return res.status(400).json({ error: 'Missing mail or museumName parameter' });
    }

    // Dummy QR code data
    const qrCode = await generateQRCodesForAllTickets(mail, museumName)

    if(qrCode)
    res.json(qrCode);
  else
  res.json(false)
  } catch (error) {
    console.error('Failed to fetch QR Code data:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.route('/ticket/Scan/:id').get(async (req, res) => {
  
variajbla = id
// ako postoji id return true

// ako ne postoji id return false

  res.json(generateQRCodesForAllTickets(mail));
});

router.route("/exhibit/add").post(async (req, res) => {
  console.log("ide to lijepo");
  try {
    const exhibitData = req.body;
    const findExhibit = await Exhibit.findOne({
      exhibitName: exhibitData.exhibitName
    });

    if (!findExhibit) {
      const exhibit = await methodsEx.createExhibit(
        exhibitData.exhibitName,
        exhibitData.description,
        exhibitData.images,
        exhibitData.isDisplayed,
        exhibitData.toMuseum
      );
      res.status(200).json(exhibit);
    } else {
      res.status(500).json({ error: "Exhibit exists" });
    }
  } catch (error) {
    res.status(500).json({ error: "Couldn't add exhibit" });
  }
});

router.route("/exhibit/getall").get(async (req, res) => {
  try {
    const exhibits = await methodsEx.getAllExhibits();
    res.status(200).json(exhibits);
  } catch (error) {
    console.log("The error causing the failed fetch: ", error)
    res.status(500).json({ error: "Failed to fetch exhibits" });
  }
});

router.route("/exhibit/update").post(async (req, res) => {
  try {
    const { id, updateData } = req.body;
    console.log('Updating exhibit with ID:', id);
    console.log('Update data:', updateData);
    const updatedExhibit = await methodsEx.updateExhibit(id, updateData);
    res.status(200).json(updatedExhibit);
  } catch (error) {
    console.error('Error updating exhibit:', error);
    res.status(500).json({ error: error.message });
  }
});

router.route("/exhibit/delete").delete(async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    console.log("Deleting exhibit with ID: ", id)
    const deletedExhibit = await methodsEx.deleteExhibitById(id);
    res.status(200).json(deletedExhibit);
  } catch (error) {
    console.error('Error deleting exhibit:', error);
    res.status(500).json({ error: error.message });
  }
});

// ********************* //
// OVDJE ZAVRŠAVAJU RUTE //
// ********************* //
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});