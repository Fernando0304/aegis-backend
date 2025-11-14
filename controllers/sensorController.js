import Sensor from "../models/sensorModel.js";

// Listar todos os sensores
export const listarSensores = async (req, res) => {
  try {
    const sensores = await Sensor.find().sort({ timestamp: -1 });
    res.json(sensores);
  } catch (err) {
    res.status(500).json({ message: "Erro ao listar sensores" });
  }
};

// Buscar sensor pelo nome
export const obterSensor = async (req, res) => {
  try {
    const sensor = await Sensor.find({ nome: req.params.nome })
      .sort({ timestamp: -1 });

    if (sensor.length === 0)
      return res.status(404).json({ message: "Sensor não encontrado" });

    res.json(sensor);
  } catch (err) {
    res.status(500).json({ message: "Erro ao obter sensor" });
  }
};

// Criar sensor manualmente
export const criarSensor = async (req, res) => {
  try {
    const { nome, valor, unidade } = req.body;

    if (!nome)
      return res.status(400).json({ message: "Nome é obrigatório" });

    const novoSensor = await Sensor.create({
      nome,
      valor: valor || 0,
      unidade: unidade || "°C",
      timestamp: new Date()
    });

    res.status(201).json(novoSensor);
  } catch (err) {
    res.status(500).json({ message: "Erro ao criar sensor" });
  }
};

// Atualizar sensor
export const atualizarSensor = async (req, res) => {
  try {
    const id = req.params.id;

    console.log("🔧 Atualizando sensor ID:", id);
    console.log("📦 Body recebido:", req.body);

    const sensor = await Sensor.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!sensor) {
      return res.status(404).json({ message: "Sensor não encontrado" });
    }

    res.json(sensor);

  } catch (err) {
    console.error("❌ Erro ao atualizar sensor:", err);
    res.status(500).json({ message: "Erro ao atualizar sensor", erro: err.message });
  }
};


// Excluir sensor
export const deletarSensor = async (req, res) => {
  try {
    await Sensor.findByIdAndDelete(req.params.id);
    res.json({ message: "Sensor removido" });
  } catch (err) {
    res.status(500).json({ message: "Erro ao excluir sensor" });
  }
};
