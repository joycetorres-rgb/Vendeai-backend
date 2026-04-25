
import express from "express";
import mercadopago from "mercadopago";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// 🔑 SUA CHAVE DO MERCADO PAGO
mercadopago.configure({
  access_token: "SUA_ACCESS_TOKEN_AQUI"
});

// 🛒 CRIAR PAGAMENTO
app.post("/criar-pagamento", async (req, res) => {

  const { nome, preco } = req.body;

  try {
    const pagamento = await mercadopago.preferences.create({
      items: [
        {
          title: nome,
          quantity: 1,
          unit_price: Number(preco)
        }
      ]
    });

    res.json({
      link: pagamento.body.init_point
    });

  } catch (err) {
    res.status(500).json({ erro: "Erro ao criar pagamento" });
  }

});

app.listen(3000, () => console.log("Servidor rodando 🚀"));
