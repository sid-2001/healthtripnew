// db.ts
import mongoose from "mongoose";

mongoose
  .connect(
    "mongodb+srv://sid:sid@cluster0.f6fro.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

export default mongoose;
