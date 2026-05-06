const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* ================= BANCO TEMPORÁRIO ================= */

let produtos = [];

let pedidos = [];

/* ================= TESTE ================= */

app.get("/", (req,res)=>{

res.send("🚀 Backend online funcionando");

});

/* ================= PRODUTOS ================= */

app.get("/produtos",(req,res)=>{

res.json(produtos);

});

app.post("/produtos",(req,res)=>{

produtos.push(req.body);

res.json({
ok:true,
produtos
});

});

/* ================= EDITAR LISTA ================= */

app.post("/editar-produtos",(req,res)=>{

produtos = req.body;

res.json({
ok:true,
produtos
});

});

/* ================= PEDIDOS ================= */

app.get("/pedidos",(req,res)=>{

res.json(pedidos);

});

app.post("/pedidos",(req,res)=>{

pedidos.push(req.body);

res.json({
ok:true
});

});

/* ================= SERVIDOR ================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{

console.log("Servidor rodando");

});