import express from "express";

const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', router);
// ********************** //
//   OVDJE POČINJU RUTE   //
// ********************** //




// ********************* //
// OVDJE ZAVRŠAVAJU RUTE //
// ********************* //
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});