
const express = require("express");
const app = express();

app.use(express.json());

let produtos = [];
let pedidos = [];

/* ================= PRODUTOS ================= */

app.get("/produtos", (req,res)=>{
  res.json(produtos);
});

app.post("/produtos", (req,res)=>{
  produtos.push(req.body);
  res.json({ok:true});
});

/* ================= PEDIDOS ================= */

app.get("/pedidos", (req,res)=>{
  res.json(pedidos);
});

app.post("/pedidos", (req,res)=>{
  pedidos.push(req.body);
  res.json({ok:true});
});

/* ================= TESTE ================= */

app.get("/", (req,res)=>{
  res.send("🚀 Backend online funcionando");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>console.log("rodando"));

