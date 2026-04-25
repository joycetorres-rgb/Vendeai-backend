const express = require("express")
const cors = require("cors")
const axios = require("axios")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req,res)=>{
  res.send("Backend VendeAI rodando 🚀")
})

app.post("/ia", async (req,res)=>{

  const mensagem = req.body.msg

  try{

    const resposta = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model:"gpt-4o-mini",
        messages:[
          {
            role:"system",
            content:"Você é um vendedor especialista"
          },
          {
            role:"user",
            content: mensagem
          }
        ]
      },
      {
        headers:{
          "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
          "Content-Type":"application/json"
        }
      }
    )

    res.json({
      reply: resposta.data.choices[0].message.content
    })

  }catch(err){
    console.log(err.response?.data || err.message)

    res.json({
      reply: "Erro na IA 😢"
    })
  }

})

app.listen(3000, ()=>{
  console.log("Servidor rodando")
})
