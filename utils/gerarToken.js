import jwt from "jsonwebtoken";

export default function gerarToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // token válido por 30 dias
  });
}
