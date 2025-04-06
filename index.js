// **************** //
// SETUP ZA EXPRESS //
// **************** //

import express from "express";
import cors from "cors";
import methods from "./handlers/userHandlers.js";
import methodsEx from "./handlers/exhibitHandlers.js";
import ticketMethods from "./handlers/ticketHandlers.js";
import User from "./models/users.js";
import Ticket from "./models/ticket.js";
import Exhibit from "./models/exhibits.js";

import jwt from "jsonwebtoken";

import bodyParser from "body-parser";

const app = express();
const router = express.Router();
const port = process.env.PORT || 3030;

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




// ************************* //
//   TICKET & QR CODE ROUTES //
// ************************* //

router.route('/tickets').get(async (req, res) => {
  try {
    const tickets = await ticketMethods.getAllTickets();
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

router.route('/tickets/:museumName/qrcode').get(async (req, res) => {
  try {
    const { museumName } = req.params;
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Missing email parameter' });
    }
    
    console.log(`Generating QR code for museum: ${museumName}, email: ${email}`);
    
    const qrCodeData = await ticketMethods.generateTicketQRCode(email, museumName);
    res.json(qrCodeData);
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: error.message || 'Failed to generate QR code' });
  }
});

router.route('/tickets/:museumName/qrcode/verify').get(async (req, res) => {
  try {
    const { museumName } = req.params;
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Missing code parameter' });
    }
    
    const result = await ticketMethods.verifyAndUseTicket(code, museumName);
    res.json(result);
  } catch (error) {
    console.error('Error verifying QR code:', error);
    res.status(500).json({ error: 'Failed to verify QR code' });
  }
});

router.route('/tickets/:museumName/user/:email').delete(async (req, res) => {
  try {
    const { museumName, email } = req.params;
    
    const removedTicket = await ticketMethods.deleteTicket(email, museumName);
    
    return res.status(200).json({ 
      message: 'Ticket successfully deleted',
      ticket: removedTicket
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: error.message || 'Failed to delete ticket' });
  }
});

router.route('/users/:email').get(async (req, res) => {
  const userEmail = req.params.email;

  try {
    const user = await User.findOne({ email: userEmail }).populate('tickets.ticket');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ************************* //
//      EXHIBIT ROUTES       //
// ************************* //

router.route("/exhibit").post(async (req, res) => {
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
      res.status(409).json({ error: "Exhibit already exists" });
    }
  } catch (error) {
    res.status(500).json({ error: "Couldn't add exhibit" });
  }
});

router.route("/exhibit").get(async (req, res) => {
  try {
    const exhibits = await methodsEx.getAllExhibits();
    res.status(200).json(exhibits);
  } catch (error) {
    console.log("The error causing the failed fetch: ", error)
    res.status(500).json({ error: "Failed to fetch exhibits" });
  }
});

router.route("/exhibit/:id").put(async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;

    console.log('Updating exhibit with ID:', id);
    console.log('Update data:', updateData);

    const updatedExhibit = await methodsEx.updateExhibit(id, updateData);

    if (!updatedExhibit) {
      return res.status(404).json({ error: "Exhibit not found" });
    }

    res.status(200).json(updatedExhibit);
  } catch (error) {
    console.error('Error updating exhibit:', error);
    res.status(500).json({ error: error.message });
  }
});

router.route("/exhibit/:id").delete(async (req, res) => {
  try {
    const id = req.params.id;
    console.log("Deleting exhibit with ID:", id);

    const deletedExhibit = await methodsEx.deleteExhibitById(id);

    if (!deletedExhibit) {
      return res.status(404).json({ error: "Exhibit not found" });
    }

    res.status(200).json(deletedExhibit);
  } catch (error) {
    console.error("Error deleting exhibit:", error);
    res.status(500).json({ error: error.message });
  }
});

// ********************* //
//     MUSEUM ROUTES     //
// ********************* //

router.route("/museum/:museumName/exhibits").get(async (req, res) => {
  try {
    const { museumName } = req.params;
    console.log('Lebdim')
    const exhibits = await Exhibit.find({ toMuseum: new RegExp(`^${museumName}$`, 'i') });
    res.status(200).json(exhibits);
  } catch (error) {
    console.error('Error fetching museum exhibits:', error);
    res.status(500).json({ error: error.message });
  }
});

// ********************* //
// OVDJE ZAVRŠAVAJU RUTE //
// ********************* //
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});