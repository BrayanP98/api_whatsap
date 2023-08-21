const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path= require('path');
const body_parser = require("body-parser");
const app = express();
app.use(body_parser.json());
const server = http.createServer(app);

const token = process.env.WHATSAPP_TOKEN;
//const path= require('path');
// Imports dependencies and set up http server
const request = require("request"),
  //express = require("express"),
  
  axios = require("axios").default
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.set('views', path.join(__dirname, './src/views'));
app.get('/', (req, res) => {
  res.render("index.ejs")
});



server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
io.on('connection', function(socket)  {
  socket.emit("getprods","bienvenidos todos")
});

app.post("/webhook", (req, res) => {
  // Parse the request body from the POST
  let body = req.body;
  console.log(JSON.stringify(req.body, null, 2));

  var optinos=["1","2","3","4"]
  var saludos=["buen dia","hola","buenos dias","ole","buenas"]

  // Check the Incoming webhook message
  //console.log(JSON.stringify(req.body, null, 2));

  // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
     var name=req.body.entry[0].changes[0].value.contacts[0].profile.name;
      let msg_body1 = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload
      if(optinos.includes(msg_body1)){
        if(msg_body1==="1"){
          let msg_bodyrta="1. Solicitar servicio tecnico"+"\n2.Cotizar" 
          sendOP(msg_bodyrta)
        }if(msg_body1==="2"){
          let msg_bodyrta1="1. Solicitar servicio tecnico"+"\n2. Cotizar"+"\n3. Renovar Plataforma" ;
          sendOP(msg_bodyrta1)
        }if(msg_body1==="3"){
          let msg_bodyrta1="1. Solicitar servicio tecnico"+"\n2. Cotizar" ;
          sendOP(msg_bodyrta1)
        }

        function sendOP(opction){
          axios({
            method: "POST", // Required, HTTP method, a string, e.g. POST, GET
            url:
              "https://graph.facebook.com/v12.0/" +
              phone_number_id +
              "/messages?access_token=" +
              token,
            data: {
              messaging_product: "whatsapp",
              to: from,
              text: { body:  opction},
            },
            headers: { "Content-Type": "application/json" },
          });
        }

      }else if(saludos.includes(msg_body1)){
        let mesagge='de'+':'+ from +' '+msg_body1;
        io.emit('whatsapp_notification', mesagge);
        let msg_body ="Bienvenido "+name+""+"a San Juan Electronics "+"\n¿como podemos ayudarte?"+"\n1.Informacion CCTV"+
        "\n2. Informacion GPS"+"\n3. Informacion Alarmas residenciales";
         axios({
           method: "POST", // Required, HTTP method, a string, e.g. POST, GET
           url:
             "https://graph.facebook.com/v12.0/" +
             phone_number_id +
             "/messages?access_token=" +
             token,
           data: {
             messaging_product: "whatsapp",
             to: from,
             text: { body:  msg_body },
           },
           headers: { "Content-Type": "application/json" },
         });
      }else{
        let mesagge='de'+':'+ from +' '+msg_body1;
        io.emit('whatsapp_notification', mesagge);
        let msg_body ="No entiendo lo que quieres decirme";
         axios({
           method: "POST", // Required, HTTP method, a string, e.g. POST, GET
           url:
             "https://graph.facebook.com/v12.0/" +
             phone_number_id +
             "/messages?access_token=" +
             token,
           data: {
             messaging_product: "whatsapp",
             to: from,
             text: { body:  msg_body },
           },
           headers: { "Content-Type": "application/json" },
         });
      }
     

     
    }
    res.sendStatus(200);
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
});


app.get("/", (req, res) => {
  res.render("index.ejs")

 
})

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests 
app.get("/webhook", (req, res) => {
  
  const verify_token = process.env.VERIFY_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});


