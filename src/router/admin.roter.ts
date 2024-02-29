import bodyParser from "body-parser";
import express, { NextFunction, Request, Response } from "express";
import User from "../models/user";
import apiKeyModel from "../models/api";
import { sendWeatherUpdate } from "../service/bot";
import user from "../models/user";
const Adminrouter = express.Router();

Adminrouter.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

Adminrouter.patch("/user/block/:id", async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.blocked = true;
    await user.save();
    res.json({ message: "User blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});
Adminrouter.patch("/user/activate/:id", async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.blocked = false;
    await user.save();
    res.json({ message: "User blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

Adminrouter.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

Adminrouter.get("/apiKey", async (req: Request, res: Response) => {
  try {
    const apiKey = await apiKeyModel.findOne({ channel: "Weather" });
    res.json({ apiKey });
  } catch (error) {
    console.error("Error fetching API key:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Update API key
Adminrouter.put("/apiKey", async (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;
    let data = await apiKeyModel.findOne({ channel: "Weather" });
    data.key = apiKey;
    data.save();
    console.log(data);
    res.json({ message: "API key updated successfully" });
  } catch (error) {
    console.error("Error updating API key:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

Adminrouter.get("/weather/:userID", async (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;

    let data = await apiKeyModel.findOne({ channel: "Weather" });
    console.log(data);
    let user_id = req.params.userID;
    let user = await User.findById(user_id);
    sendWeatherUpdate(user.sender_id, user.city, user.country, data.key);
    console.log(data);
    res.json({ message: "Weather Data Updated Succesfully" });
  } catch (error) {
    console.error("Error updating API key:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default Adminrouter;
