import Dashboard from "../models/Dashboard.js";

// Criar novo dashboard
export const createDashboard = async (req, res) => {
  try {
    const dashboard = new Dashboard(req.body);
    await dashboard.save();
    res.status(201).json(dashboard);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Listar dashboards
export const getDashboards = async (req, res) => {
  try {
    const dashboards = await Dashboard.find();
    res.json(dashboards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deletar dashboard
export const deleteDashboard = async (req, res) => {
  try {
    await Dashboard.findByIdAndDelete(req.params.id);
    res.json({ message: "Dashboard removido com sucesso!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
