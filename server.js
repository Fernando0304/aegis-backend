import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import mqtt from "mqtt";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Models
import Sensor from "./models/sensorModel.js";
import Alerta from "./models/alertaModel.js";

// Rotas
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import sensorRoutes from "./routes/sensorRoutes.js";
import alertaRoutes from "./routes/alertaRoutes.js";

// Conexão MongoDB
import connectDB from "./config/db.js";

dotenv.config();
const app = express();

// ===============================
// CORRIGIR __dirname NO ES MODULES
// ===============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===============================
// 🔥 CORS CONFIGURADO PARA PRODUÇÃO
// ===============================
app.use(
  cors({
    origin: [
      "http://localhost:5173",                        // ambiente local
      "https://aegis-frontend-dun.vercel.app",        // SUA url do Vercel
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.options("*", cors()); // Liberar preflight requests

// ===============================
// CRIAR PASTA UPLOADS SE NÃO EXISTIR
// ===============================
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
  console.log("📁 Pasta /uploads criada automaticamente.");
}

// ===============================
// SERVIR ARQUIVOS ESTÁTICOS
// ===============================
app.use("/uploads", express.static(uploadsPath));

// ===============================
// MIDDLEWARES
// ===============================
app.use(express.json());

// ===============================
// ROTAS
// ===============================
app.use("/api/sensores", sensorRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboards", dashboardRoutes);
app.use("/api/alertas", alertaRoutes);

// ===============================
// CONEXÃO MONGODB
// ===============================
connectDB();

// ===============================
// MQTT
// ===============================
const mqttClient = mqtt.connect(process.env.MQTT_BROKER);

mqttClient.on("connect", () => {
  console.log("✅ Conectado ao MQTT Broker:", process.env.MQTT_BROKER);

  mqttClient.subscribe("sensors/data", (err) => {
    if (err) console.error("❌ Erro ao se inscrever no tópico:", err.message);
    else console.log("📡 Inscrito no tópico: sensors/data");
  });
});

// ===============================
// PROCESSAMENTO DE MENSAGENS MQTT
// ===============================
mqttClient.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log("📩 Dados recebidos:", data);

    const valor = data.temperatura || data.valor || 0;

    const novoSensor = await Sensor.create({
      nome: data.sensor || "Sensor Ambiente AEGIS",
      valor,
      unidade: data.unidade || "°C",
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
    });

    console.log("📦 Sensor salvo:", novoSensor);

    let alerta = null;

    if (valor >= 50) {
      alerta = {
        tipo: "critico",
        mensagem: "Temperatura EXTREMAMENTE alta!",
        valor,
        sensor: novoSensor.nome,
        maquina: "Máquina AEGIS",
      };
    } else if (valor >= 40) {
      alerta = {
        tipo: "atencao",
        mensagem: "Temperatura acima do normal.",
        valor,
        sensor: novoSensor.nome,
        maquina: "Máquina AEGIS",
      };
    } else if (valor < 8) {
      alerta = {
        tipo: "alerta",
        mensagem: "Temperatura muito baixa.",
        valor,
        sensor: novoSensor.nome,
        maquina: "Máquina AEGIS",
      };
    }

    if (alerta) {
      await Alerta.create(alerta);
      console.log("🚨 ALERTA GERADO:", alerta);
    }

  } catch (err) {
    console.error("❌ Erro ao processar MQTT:", err.message);
  }
});

// ===============================
// START SERVIDOR
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🌍 Servidor rodando na porta ${PORT}`)
);
