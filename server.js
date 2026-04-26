
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/chat", async (req,res)=>{

const response = await fetch("https://api.openai.com/v1/chat/completions",{
method:"POST",
headers:{
"Authorization":"Bearer SUA_API_KEY",
"Content-Type":"application/json"
},
body:JSON.stringify({
model:"gpt-4o-mini",
messages:[{role:"user",content:req.body.mensagem}]
})
});

const data = await response.json();

res.json({resposta:data.choices[0].message.content});
});

app.listen(3000);