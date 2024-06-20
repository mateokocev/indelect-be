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
import jwt from "jsonwebtoken";
import qrcode from "qrcode";

const app = express();
const router = express.Router();
const port = process.env.PORT || 3030;

app.use(express.json());
app.use(cors({ exposedHeaders: ["authenticated-user"] }));
app.use("/api", router);

// *************************** //
// SETUP ZA MONGODB / MONGOOSE //
// *************************** //
import mongoose from "mongoose";
import dotenv from "dotenv";
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
      res.status(200).json(result);
    } else {
      res.status(500).json({ error: "User exists" });
    }
  } catch (error) {
    res.status(500).json({ error: "Registration failed. Womp Womp" });
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


router.route('/ticket/getAllTickets').get(async (req, res) => {
  const tickets = await Ticket.find({});
  res.json(tickets);
});



router.route('/ticket/getQrCode').get(async (req, res) => {
  req = mail

  res.json(generateQRCodesForAllTickets(mail));
});

router.route('/ticket/Scan/:id').get(async (req, res) => {
  
variajbla = id
// ako postoji id return true

// ako ne postoji id return false

  res.json(generateQRCodesForAllTickets(mail));
});



const generateUniqueQRCode = async (ticket, email) => {
  try {
    const qrData = {
      MuseumName: ticket.MuseumName,
      MuseumDetails: ticket.MuseumDetails,
      Price: ticket.Price,
      Email: email
    };
    const qrCodeData = await qrcode.toDataURL(JSON.stringify("https://www.pornhub.com/"));
    console.log(`QR Code for ticket ${ticket.MuseumName} and email ${email}:`, qrCodeData);
  } catch (error) {
    console.error("Error generating QR code:", error);
  }
};

const generateQRCodesForAllTickets = async (email,musemName) => {
  try {
    const tickets = await Ticket.find({});
    for (const ticket of tickets) {
      await generateUniqueQRCode(ticket, email);
    }
  } catch (error) {
    console.error("Error fetching tickets:", error);
  }
};



// Replace with the user's email
const userEmail = "user@example.com";

// Call the function to fetch tickets and generate unique QR codes
generateQRCodesForAllTickets(userEmail);
router.route("/exhibit/add").post(async (req, res) => {
  try {
    const exhibitData = req.body;
    const findExhibit = await Exhibit.findOne({
      exhibitName: exhibitData.name,
    });

    if (!findExhibit) {
      const exhibit = await methodsEx.createExhibit(
        exhibitData.name,
        exhibitData.description,
        exhibitData.images,
        exhibitData.isDisplayed
      );
      res.status(200).json(exhibit);
    } else {
      res.status(500).json({ error: "Exhibit exists" });
    }
  } catch (error) {
    res.status(500).json({ error: "Couldn't add exhibit" });
  }
});

// ********************* //
// OVDJE ZAVRŠAVAJU RUTE //
// ********************* //
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


/*
router.route('/control/museum/add')
  .post(async (req, res) => {
    res.json({ message: 'Museum added successfully' });
});

router.route('/control/museum/edit')
  .post(async (req, res) => {
    res.json({ message: 'Museum edited successfully' });
});

router.route('/control/museum/delete')
  .post(async (req, res) => {
    res.json({ message: 'Museum deleted successfully' });
});

router.route('/control/museum/get')
  .get((req, res) => {
    res.json(museumData);
});

router.route('/control/museum/object/add')
  .post((req, res) => {
    res.json({ message: 'Museum object added successfully'});
});

router.route('/control/museum/object/edit')
  .post((req, res) => {
      res.json({ message: 'Museum object edited successfully'});
});

router.route('/control/museum/object/delete')
  .post((req, res) => {
    res.json({ message: 'Museum object deleted successfully'});
});

router.route('/control/museum/object/get')
  .get((req, res) => {
    res.json(museumObject);
});

router.route('/control/museum/map/set')
  .post((req, res) => {
    res.json({ message: 'Museum map set successfully' });
});

router.route('/control/museum/map/delete')
  .delete((req, res) => {
    res.json({ message: 'Museum map deleted successfully' });
});

router.route('/control/museum/map/get')
  .get((req, res) => {
    res.json(museumMaps);
});

router.route('/ticket/purchase')
  .post(async (req, res) => {
    res.json({ message: 'Ticket purchased successfully', ticket });
});

  router.route('ticket/use/:ticketId')
  .get(async (req, res) => {
    res.json({ message: 'Ticket QR code generated successfully', qrCode });
});
*/


