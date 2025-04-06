import mongoose from "mongoose";
import User from "../models/users.js";
import Ticket from "../models/ticket.js";
import qrcode from 'qrcode';

async function getAllTickets() {
  const tickets = await Ticket.find({});
  return tickets;
}

async function generateTicketQRCode(email, museumName) {
  const ticket = await Ticket.findOne({ MuseumName: museumName });
  if (!ticket) {
    throw new Error("Ticket not found for this museum");
  }
  
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  
  const existingTicket = user.tickets.find(t => 
    t.ticket && t.ticket.toString() === ticket._id.toString()
  );
  
  if (existingTicket) {
    return existingTicket.qrCodeUrl;
  }
  
  const qrCodeUrl = `http://localhost:3030/map/${museumName}/${email}`;
  const qrCodeData = await qrcode.toDataURL(qrCodeUrl);
  
  user.tickets.push({
    ticket: ticket._id,
    qrCodeUrl: qrCodeData,
    purchaseDate: new Date(),
    isUsed: false
  });
  
  await user.save();
  
  return qrCodeData;
}

async function verifyAndUseTicket(code, museumName) {
  const user = await User.findOne({
    'tickets.qrCodeUrl': code,
    'tickets.ticket': { $exists: true }
  }).populate('tickets.ticket');
  
  if (!user) {
    return { valid: false };
  }
  
  const ticketIndex = user.tickets.findIndex(t => 
    t.qrCodeUrl === code && 
    t.ticket && 
    t.ticket.MuseumName === museumName
  );
  
  if (ticketIndex === -1) {
    return { valid: false };
  }
  
  const ticketEntry = user.tickets[ticketIndex];
  
  if (ticketEntry.isUsed) {
    return { valid: false, message: 'Ticket has already been used' };
  }
  
  const ticketInfo = {
    museumName: ticketEntry.ticket.MuseumName,
    purchaseDate: ticketEntry.purchaseDate
  };
  
  user.tickets.splice(ticketIndex, 1);
  await user.save();
  
  return { 
    valid: true,
    ticket: ticketInfo,
    user: {
      email: user.email,
      username: user.username
    }
  };
}

async function deleteTicket(email, museumName) {
  if (!museumName.endsWith(" Museum")) {
    museumName = museumName.charAt(0).toUpperCase() + museumName.slice(1) + " Museum";
  }
  
  const user = await User.findOne({ email }).populate('tickets.ticket');
  if (!user) {
    throw new Error("User not found");
  }
  
  const ticketIndex = user.tickets.findIndex(t => 
    t.ticket && t.ticket.MuseumName === museumName
  );
  
  if (ticketIndex === -1) {
    throw new Error("Ticket not found for this user and museum");
  }
  
  const removedTicket = user.tickets.splice(ticketIndex, 1)[0];
  
  await user.save();
  
  return {
    museumName,
    purchaseDate: removedTicket.purchaseDate,
    wasUsed: removedTicket.isUsed
  };
}

const ticketMethods = {
  getAllTickets,
  generateTicketQRCode,
  verifyAndUseTicket,
  deleteTicket
};

export default ticketMethods;