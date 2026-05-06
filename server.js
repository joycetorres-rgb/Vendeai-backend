
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// =====================
// CONEXÃO MONGODB
// =====================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log(err));

// =====================
// MODELOS
// =====================
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" }
});

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);
const Product = mongoose.model("Product", ProductSchema);

// =====================
// MIDDLEWARE AUTH
// =====================
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: "Sem token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}

// =====================
// AUTH ROTAS
// =====================
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({
      name,
      email,
      password: hash
    });

    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "Erro ao registrar", err });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

  const check = await bcrypt.compare(password, user.password);
  if (!check) return res.status(400).json({ message: "Senha incorreta" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, user });
});

// =====================
// PRODUTOS (CRUD)
// =====================

// criar produto
app.post("/products", auth, async (req, res) => {
  const product = await Product.create(req.body);
  res.json(product);
});

// listar produtos
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// editar produto
app.put("/products/:id", auth, async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(product);
});

// deletar produto
app.delete("/products/:id", auth, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Produto deletado" });
});

// =====================
// INICIAR SERVIDOR
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});