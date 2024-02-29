import { Application } from "express";
import Adminrouter from "./admin.roter";

export default function routes(app: Application) {
  app.use("/api/", Adminrouter);
}
