// src/index.ts
import express from "express";
import bodyParser from "body-parser";

import mongoclient from "./database/db";
import Adminrouter from "./router/admin.roter";
import routes from "./router/";

const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", PORT);
} as any);

// mongoclient
//   .connect()
//   .then(() => {
//     console.log("Database Connected");
//   })
//   .catch(() => {
//     "Error connecting to Database";
//   });

app.use(bodyParser.json());
routes(app);
