



 const express = require("express");
const mercadopago = require("mercadopago");
const admin = require("firebase-admin");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// 🔥 FIREBASE
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 💰 MERCADO PAGO
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

// 🌐 TESTE
app.get("/", (req, res) => {
  res.send("Backend rodando 🚀");
});


// 🛒 CRIAR PAGAMENTO
app.post("/criar-pagamento", async (req, res) => {
  try {
    const { nome, email, produto, valor } = req.body;

    const vendaRef = db.collection("vendas").doc();

    const pagamento = await mercadopago.preferences.create({
      items: [
        {
          title: produto,
          quantity: 1,
          unit_price: Number(valor)
        }
      ],
      payer: {
        name: nome,
        email: email
      },
      metadata: {
        vendaId: vendaRef.id
      },
      notification_url: "https://SEU_BACKEND/webhook"
    });

    await vendaRef.set({
      nome,
      email,
      produto,
      valor,
      status: "pendente",
      criadoEm: new Date()
    });

    res.json({
      link: pagamento.body.init_point
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao criar pagamento");
  }
});


// 🔔 WEBHOOK (CONFIRMA PAGAMENTO)
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    if (data.type === "payment") {

      const payment = await mercadopago.payment.findById(data.data.id);

      const vendaId = payment.body.metadata.vendaId;
      const status = payment.body.status;

      if (vendaId) {
        await db.collection("vendas").doc(vendaId).update({
          status: status,
          atualizadoEm: new Date()
        });

        console.log("Venda atualizada:", vendaId, status);
      }
    }

    res.sendStatus(200);

  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});


// 🚀 START
app.listen(process.env.PORT, () => {
  console.log("Servidor rodando 🚀");
});