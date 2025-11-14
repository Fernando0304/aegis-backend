import Alerta from "../models/alertaModel.js";

// ==========================
// LISTAR ALERTAS COM FILTROS
// ==========================
export const listarAlertas = async (req, res) => {
  try {
    const {
      maquina,
      sensor,
      status,
      periodo,
      busca,
      page = 1,
      limit = 10,
    } = req.query;

    const filtros = {};

    if (maquina) filtros.maquina = maquina;
    if (sensor) filtros.sensor = sensor;

    // status pode ser: alerta / critico / ok
    if (status) filtros.tipo = status;

    // FILTRO POR PERÍODO
    if (periodo) {
      const agora = new Date();
      const inicio = new Date();

      switch (periodo) {
        case "hoje":
          inicio.setHours(0, 0, 0, 0);
          filtros.timestamp = { $gte: inicio };
          break;

        case "ontem":
          inicio.setDate(inicio.getDate() - 1);
          inicio.setHours(0, 0, 0, 0);
          const fimOntem = new Date(inicio);
          fimOntem.setHours(23, 59, 59);
          filtros.timestamp = { $gte: inicio, $lte: fimOntem };
          break;

        case "7dias":
          inicio.setDate(inicio.getDate() - 7);
          filtros.timestamp = { $gte: inicio };
          break;

        case "30dias":
          inicio.setDate(inicio.getDate() - 30);
          filtros.timestamp = { $gte: inicio };
          break;
      }
    }

    // BUSCA GERAL
    if (busca) {
      filtros.$or = [
        { mensagem: { $regex: busca, $options: "i" } },
        { sensor: { $regex: busca, $options: "i" } },
        { maquina: { $regex: busca, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [alertas, total] = await Promise.all([
      Alerta.find(filtros)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Alerta.countDocuments(filtros),
    ]);

    const ativos = await Alerta.countDocuments({
      tipo: { $in: ["alerta", "critico"] },
    });

    return res.json({
      alertas,
      total,
      ativos,
      paginas: Math.ceil(total / limit),
    });
  } catch (erro) {
    console.error("Erro listar alertas:", erro);
    res.status(500).json({ erro: "Erro ao listar alertas." });
  }
};
