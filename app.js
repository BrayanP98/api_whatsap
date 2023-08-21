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
  var rtaopt=
  {
     gps:{
       "op1":"Cotizar",
       "op2":"Servicio tecnico GPS",
       "op3":"Renovar Plataforma",
       "op4":"Beneficios"
     },
     cctv:{
       "op1":"Cotizar",
       "op2":"Servicio tecnico CCtv",
       "op3":"Beneficios",
       "op4":"otros"
     },
     acceso:{
      "op1":"Cotizar",
      "op2":"Servicio tecnico",
      "op3":"Beneficios",
      "op4":"otros"
    }
    ,
     alarma:{
      "op1":"Cotizar",
      "op2":"Servicio tecnico alarmas recidenciales",
      "op3":"Beneficios",
      "op4":"otros"

    },
    asesor:{


    }
    

   }

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
      // extract the message text from the webhook payload
     
     if( req.body.entry[0].changes[0].value.messages[0].interactive){
      let msg_interctive = req.body.entry[0].changes[0].value.messages[0].interactive.list_reply.description;
       
      if(msg_interctive=="Servicio Tecnico Gps"){

        sendOP("Dejanos tu numero ")


      }



     }else{

      let msg_body1 = req.body.entry[0].changes[0].value.messages[0].text.body;
    
     
      console.log(msg_body1)
    
      function sendInteractive(opt, service){
        axios({
          method: "POST", // Required, HTTP method, a string, e.g. POST, GET
          url:
            "https://graph.facebook.com/v12.0/" +
            phone_number_id +
            "/messages?access_token=" +
            token,
              data:{
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to : from,
              type: "interactive" ,
              interactive:{
                type: "list",
                header: {  
                type: "text",
                text: "San Juan"},
                body: {text: service.toUpperCase()+" \n Elije tus Opciones"+"👇"},
                footer: {},
                action: {
                  button: "Responde",
                  sections:[
                    {
                      title:"Opcion 1",
                      rows: [
                        {
                          id:"1",
                          title: opt.op1,
                          description: opt.op1,           
                        }
                      ]
                    },
                    {
                      title:"Opcion2",
                      rows: [
                        {
                          id:"2",
                          title: opt.op2,
                          description:  opt.op2,           
                        }
                      ]
                    },
                    {
                      title:"Opcion3",
                      rows: [
                        {
                          id:"3",
                          title: opt.op3,
                          description: opt.op3,  
                               
                        }
                      ]
                    },{
                      title:"Opcion4",
                      rows: [
                        {
                          id:"4",
                          title: opt.op4,
                          description:opt.op4 ,  
                               
                        }
                      ]
                    }
                    
                  ]
                }
              }
                  }
         ,
          headers: { "Content-Type": "application/json" },
        });
      }
      var lower=msg_body1.toLowerCase();
      var hasKey = (rtaopt[msg_body1] !== undefined);
      if(rtaopt[lower]){
        var text=""
        if(lower=="asesor"){
           text=("En minutos uno de nuestros asesores se pondra en contacto con usted.")
           let contactClient= "Por favor ponerse en contacto con:"+" \n"+
           name+" "+"\n al numero:"+""+from;
           axios({
            method: "POST", // Required, HTTP method, a string, e.g. POST, GET
            url:
              "https://graph.facebook.com/v12.0/" +
              phone_number_id +
              "/messages?access_token=" +
              token,
            data: {
              messaging_product: "whatsapp",
              to: "573026055289",
              text: { body:  contactClient},
            },
            headers: { "Content-Type": "application/json" },
          });
        }else{
          text=lower.toUpperCase()+"\n"+"*1.*"+" "+ rtaopt[lower].op1+ "\n"+"*2.*"+" "+rtaopt[lower].op2+
          "\n"+"*3.*"+" "+rtaopt[lower].op3+ "\n"+"*4.*"+" "+rtaopt[lower].op4;
        }
       

        sendOP(text)
      }else{
        if(optinos.includes(msg_body1)){
          if(msg_body1==="1"){
            
           sendInteractive(rtaopt["cctv"],"*cctv*")
          }if(msg_body1==="2"){
            sendInteractive(rtaopt["gps"],"*gps*")
          }if(msg_body1==="3"){
            sendInteractive(rtaopt["alarma"],"*Alarma*")
          }
  
         
  
        }else if(saludos.includes(msg_body1.toLowerCase())){
          let mesagge='de'+':'+ from +' '+msg_body1;
          io.emit('whatsapp_notification', mesagge);
          let msg_body ="Bienvenido  a San Juan Electronics "+" "+name+"."+"\n Soy SecuriBot🤖  ¿Como puedo ayudarte?"+"\n\n1.Informacion CCTV"+
          "\n2. Informacion GPS"+"\n3. Informacion Alarmas residenciales"+"\n\n Escribe *ASESOR* si quieres comunicarte con uno de nuestros asesores"+"\n\nTu seguridad es nuestra prioridad!. \n\nEstamos ubicados en la transversal 9#57n-202 via al bosque."+
          "\n\n Siguenos en Facebook como San Juan Electronics."+"\n O visita nuestra WEb https://sanjuanelectronics.online/";          
          
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
          let msg_body ="No entiendo lo que quieres decirme"+"\nIntenta una de las siguientes palabras:"+
          "\n *Informacion, buen dia, hola, GPS, CCTV, Cotizacion*"  ;
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


