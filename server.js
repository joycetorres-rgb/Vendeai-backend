

const express = require("express");
const mercadopago = require("mercadopago");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

// 🔐 FIREBASE ADMIN
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 💳 MERCADO PAGO
mercadopago.configure({
  access_token: "SEU_ACCESS_TOKEN_AQUI"
});

// 🚀 CRIAR PAGAMENTO
app.post("/pagar", async (req, res) => {
  try {
    const { nome, preco, userId } = req.body;

    const vendaRef = await db.collection("vendas").add({
      nome,
      preco,
      userId,
      status: "pendente",
      criadoEm: new Date()
    });

    const preference = await mercadopago.preferences.create({
      items: [
        {
          title: nome,
          unit_price: Number(preco),
          quantity: 1
        }
      ],
      metadata: {
        vendaId: vendaRef.id
      },
      notification_url: "https://SEU-BACKEND/webhook"
    });

    res.json({ link: preference.body.init_point });

  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao criar pagamento");
  }
});

// 🔔 WEBHOOK REAL
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

// 🌐 TESTE
app.get("/", (req, res) => {
  res.send("Backend rodando 🚀");
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));