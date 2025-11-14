// models/sensorModel.js
import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  valor: { type: Number, default: 0 },
  unidade: { type: String, default: "°C" },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Sensor", sensorSchema);
