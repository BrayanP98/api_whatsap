const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path= require('path');
const body_parser = require("body-parser");
const Image=require('./src/models/IMAGE.js');
const chat=require('./src/models/chats.js');
const cotizar=require('./src/models/cotizaciones.js');
const bodyParser = require('body-parser');
const cron=require('node-cron');
const chats = require('./src/models/chats.js');
require("./functions.js");
const app = express();
app.use(body_parser.json());
const server = http.createServer(app);
require("./database");

const save = require('./functions.js');



const token = process.env.WHATSAPP_TOKEN;
//const path= require('path');
// Imports dependencies and set up http server
const request = require("request"),
  //express = require("express"),
  
  axios = require("axios").default
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.set('views', path.join(__dirname, './src/views'));
app.use(express.static(path.join(__dirname,"public")));
app.get('/', (req, res) => {
  res.render("index.ejs")
});
app.use(bodyParser.urlencoded({ extended: true }));



server.listen(PORT, () => {
 // console.log(`Server listening on port ${PORT}`);
});
io.on('connection', function(socket)  {
  socket.on("send_rta", function (to, message) {
    var botId = '122100131648008841';
    axios({
      method: "POST", // Required, HTTP method, a string, e.g. POST, GET
      url:
        "https://graph.facebook.com/v12.0/" +
       botId+
        "/messages?access_token=" +
        token,
      data: {
        messaging_product: "whatsapp",
        status: "read",
        to: to,
        text: { body:  message},
        footer: {
          text: "scaliwoodSoft"}
      },
      headers: { "Content-Type": "application/json" },
    });
  });
  socket.on("pagina_cargada",async function (status) {
    var chat= new chats();
    const chatss= await chats.find().lean();
  
    for(var i=0;i<chatss.length;i++){
  var celular =chatss[i].numero;
      for(let a=0;a<chatss[i].chat.length;a++){
         
       io.emit('db_messages',celular ,chatss[i].chat[a].mensaje,"old",chatss.length);
        
      }
   
      //io.emit('whatsapp_notification', chatss[i].numero,"msg_body1");
  
    }
    
    getDatesToEnd()
   
   });
});

app.get("/mesagge", (req, res) => {
  io.emit('whatsapp_notification', "573008565591","hola","new");
})
app.post("/webhook", (req, res) => {
  // Parse the request body from the POST
  let body = req.body;
 console.log(JSON.stringify(req.body, null, 2));

 if(body.entry[0].changes[0].value.statuses){
  let status=body.entry[0].changes[0].value.statuses[0]["status"]
  //console.log(status)
 io.emit("estado",status)
  


 }else{
  

  var optinos=["1","2","3","4"]
  var saludos=["buen dia","hola","buenos","hello","ole","buenas","dias","buen","dia","info","tarde","ayuda","informacion","buen día","menu"]
  var optinoSpecial=["nosotros","cotizar","catalogo"]
  var agradecimiento=["vale","gracias","muchas gracias","bueno","ok","listo","okey"]
  var rtaopt=
  {
     gps:{
      "cotizar":[
        {
          "mesagge":"SecuriBot🤖 dice :"+"\n\nEl Costo del dispositivo GPS mas su instalacion esta en *$380.000* ."+
          "\n Adicional San Juan te ofrece un plan de datos con claro especial para *GPS* con un costo anual de *$95.000* "+
          "adquiriendo este plan se libera el usuario de estar realizando cada mes una regarga de datos al GPS"+
          "\n Esto sumaria un total de *$475.000* si el usuario decide adquirir el plan.✅ "+
          "\n\nEl fin de las recargas mensuales o el plan anual de datos para GPS el el correcto funcionamiento de las alertas que emite el dispositivo ya que los SMS y los datos permiten la correcta conecion estre el dispositivo *GPS* y la aplicacion de monitoreo."+
          +"\n\n_#TuSeguridadEsNuestraPrioridad_",
          
        }
       ], 
       "servicio tecnico":[
        {
          "mesagge":"SecuriBot🤖 dice :"+"\n\nPara servicio tecnico escribe ASESOR o comunicate escribiendo a los numeros: \n *3026055289 - 3006549863*"+
          "\n O acercate a nuestra oficina ubicada en la *Transversal9 #57n-202 via al bosque*."+
          "\n\n#TuSeguridadEsNuestraPrioridad",
          
        }
       ],
       
       "renovacion":[
        {
          "mesagge":"SecuriBot🤖 dice :"+"\nHola! "+"\n\nLa renovacion de plataforma anual tiene un costo de *$80.000* ."+
          "\nEn un momento uno de nuestros asesores lo contactara para continuan con el proceso de renovacion."+
        "  \n Nuestros medios de pago son:"+
          " \n \n *Ahorro a la mano:*  03157527681 ✅"+"\n *NEQUI:* 3006549863✅"+
          "\n O puede acercarse a nuestra oficina y realizar el proceso de renovacion. \n🚩Estamos ubicados en la transversal 9 #57n-202 via al bosque."+"\n\n_#TuSeguridadEsNuestraPrioridad_"

        }
       ],
       "beneficios":[
        {
          "mesagge":"SecuriBot🤖 dice :"+"\n\n Los sistemas de *GPS vehiculares* ofrecen una amplia gama de beneficios, desde la mejora de la eficiencia operativa y la reducción de costos hasta la optimización de la navegación y la seguridad personal. Estos beneficios varían según el contexto y la finalidad de su uso, ya sea para conductores individuales, flotas comerciales o aplicaciones de seguridad.",
          
        }
       ],
    
     },
     cctv:{
      "cotizar":[
        {
          "mesagge":"SecuriBot🤖 dice :"+"\n\n El Costo de un *sistema de CCTV* varia segun las necesidades del usuario, los dispotitivos que se instalen y sus caractertisticas"+
          "\n Lo invitamos a programar una visita tecnica de uno de nuestros especialistas el cual lo guiara en el proceso de eleccion de que sistema se adecua mejor a sus necesidades"+
          "\n\n Puede agendar su cita llamando a los numeros *3006549863-3026055289* o escribenos a Whatsapp a estos mismos numeros.",
          
        }
       ], 
       "servicio tecnico":[
        {
          "mesagge":"SecuriBot🤖 dice :"+"\n\nPara servicio tecnico escribe *ASESOR* o comunicate a los numeros: \n *3026055289 - 3006549863*"+
          "\n O acercate a nuestra oficina uicada en la *Transversal9 #57n-202 via al bosque*."+
          +
          "\n\n_#TuSeguridadEsNuestraPrioridad_",
          
        }
       ],
      
       "beneficios":[
        {
          "mesagge":"SecuriBot🤖 dice :"+"\n\n Un *sistema de CCTV* es una herramienta valiosa para la seguridad, la vigilancia y el control en una variedad de contextos. Los beneficios pueden ser particularmente evidentes en la prevención de delitos, la resolución de disputas, la seguridad del personal y la supervisión remota, entre otros aspectos. Sin embargo, es importante implementar y utilizar los sistemas de CCTV de manera ética y cumpliendo con las regulaciones de privacidad y derechos civiles pertinentes."+
          +"\n\n_#TuSeguridadEsNuestraPrioridad_",
          
        }
       ], 
       "otros":[
        {
          "mesagge":"SecuriBot🤖 dice :  \n No disponible!"+
          " \n \n Escribe *info* para reiniciar el chat."
        }
       ]
     },
     alarmas:{
      "cotizar":[
        {
          "mesagge":"SecuriBot🤖 dice :"+"\n\n El Costo de una *Alarma de seguridad* varia segun las necesidades del usuario, los dispotitivos que se instalen y sus caractertisticas"+
          "\n Lo invitamos a programar una visita tecnica de uno de nuestros especialistas el cual lo guiara en el proceso de eleccion de que sistema se adecua mejor a sus necesidades"+
          "\n\n Puede agendar su cita llamando a los numeros *3006549863-3026055289* o escribenos a Whatsapp a estos mismos numeros."+
          "\n\n#TuSeguridadEsNuestraPrioridad",
          
        }
       ], 
       "servicio tecnico":[
        {
          "mesagge":"SecuriBot🤖 dice :"+"\n\nPara servicio tecnico escribe *ASESOR* o comunicate a los numeros: \n *3026055289 - 3006549863*"+
          "\n O acercate a nuestra oficina uicada en la *Transversal9 #57n-202 via al bosque*." +"\n\n#TuSeguridadEsNuestraPrioridad",
          
        }
       ],
      
       "beneficios":[
        {
          "mesagge":"SecuriBot🤖 dice :"+" \n\nUna *Alarma de seguridad* es una herramienta valiosa para la seguridad, la vigilancia y el control en una variedad de contextos. Los beneficios pueden ser particularmente evidentes en la prevención de delitos, la resolución de disputas, la seguridad del personal y la supervisión remota, entre otros aspectos. Sin embargo, es importante implementar y utilizar los sistemas de CCTV de manera ética y cumpliendo con las regulaciones de privacidad y derechos civiles pertinentes.",
          
        }
       ], 
       "otros":[
        {
          "mesagge":"SecuriBot🤖 dice :  \n No disponible!"+
          " \n \n Escribe *info* para reiniciar el chat."
        }
       ]

    },
    Control_Acceso:{
      "cotizar":[
        {
          "mesagge":"SecuriBot🤖 dice :"+"\n\n El Costo de un *sistema de control de acceso* varia segun las necesidades del usuario, los dispotitivos que se instalen y sus caractertisticas"+
          "\n Lo invitamos a programar una visita tecnica de uno de nuestros especialistas el cual lo guiara en el proceso de eleccion de que sistema se adecua mejor a sus necesidades"+
          "\n\n Puede agendar su cita llamando a los numeros *3006549863-3026055289* o escribenos a Whatsapp a estos mismos numeros."
          +"\n\n#TuSeguridadEsNuestraPrioridad",
          
        }
       ], 
       "servicio tecnico":[
        {
          "mesagge":"SecuriBot🤖 dice :"+"\n \n Para servicio tecnico escribe *ASESOR* o comunicate a los numeros: \n *3026055289 - 3006549863*"+
          "\n O acercate a nuestra oficina uicada en la *Transversal9 #57n-202 via al bosque.*" +"\n\n#TuSeguridadEsNuestraPrioridad",
          
        }
       ],
      
       "beneficios":[
        {
          "mesagge":"SecuriBot🤖 dice :"+" \n \nUn *sistema de control de acceso* es fundamental para garantizar la seguridad, la privacidad y la gestión eficiente de recursos en una amplia variedad de contextos. Desde la seguridad cibernética hasta la protección de instalaciones físicas, sus beneficios son esenciales para mantener la integridad de los sistemas y la información." +"\n\n_#TuSeguridadEsNuestraPrioridad_",
          
        }
       ], 
       "otros":[
        {
          "mesagge":"SecuriBot🤖 dice :  \n No disponible!"+
          " \n \n Escribe *info* para reiniciar el chat."+"\n\n_#TuSeguridadEsNuestraPrioridad_"
        }
       ]
    },
    
    
    renovar_plataforma:{

        "mesagge":"SecuriBot🤖 dice :"+"\nHola! "+"\n\nLa renovacion de plataforma anual tiene un costo de *$80.000* ."+"\nEn un momento uno de nuestros asesores lo contactara para continuar con el proceso de renovacion."+
        "  \nNuestros medios de pago son:"+
          " \n \n *Ahorro a la mano:*  03157527681 ✅"+"\n *NEQUI:* 3006549863✅"+
          "\n\nO puede acercarse a nuestra oficina y realizar el proceso de renovacion. \n\n🚩Estamos ubicados en la transversal 9 #57n-202 via al bosque."+"\n\n_#TuSeguridadEsNuestraPrioridad_"

          
    },
    renovar_plan:{

      "mesagge":"SecuriBot🤖 dice :"+"\nHola! "+"\n\nLa renovacion de plan anual tiene un costo de *$130.000* ."+
      "\n\n *El no pago de la renovacion del plan generará el bloqueo inmediato de la SIM y la inhabilidad del servicio GPS.* "+
      "\n\nEn un momento uno de nuestros asesores lo contactara para continuar con el proceso de renovacion."+
       
      "\n\nNuestros medios de pago son:"+
        " \n \n *Ahorro a la mano:*  03157527681 ✅ \n*NEQUI:* 3006549863✅"+
        "\n\nO puede acercarse a nuestra oficina y realizar el proceso de renovacion. \n\n🚩Estamos ubicados en la transversal 9 #57n-202 via al bosque."+"\n\n_#TuSeguridadEsNuestraPrioridad_"

        
  },
  acceder_promo:{

    "mesagge":"SecuriBot🤖 dice :"+"\n \n En breve se uno de nuestros asesores se pondra en contactocon usted,  para darle mas informacion sobre este articulo."
      
      
},
    
    nosotros:{
      "Mision":[
        {
          "mesagge":"*SecuriBot🤖 dice* :"+"\n   *MISION*"+"\n\nProveer servicios de seguridad electrónica de alta calidad, adaptados a las necesidades y expectativas de cada cliente. Ofrecemos sistemas de alarmas, cámaras, control de acceso, monitoreo y asistencia técnica, con el respaldo de un equipo profesional y comprometido. "+
          "Buscamos generar valor agregado y satisfacción a nuestros clientes, garantizando su seguridad y la de sus bienes. Aspiramos a ser un referente en el mercado, por nuestra innovación, responsabilidad y ética."
          +"\n\n_#TuSeguridadEsNuestraPrioridad_"
        }
       ], 
       "Vision":[
        {
          "mesagge":"*SecuriBot🤖 dice* :"+"\n        *VISION*"+"\n\nNuestra visión es ser la empresa líder en seguridad electrónica, ofreciendo soluciones innovadoras y personalizadas que protejan a nuestros clientes y sus activos. Queremos brindar un servicio de excelencia, basado en la confianza,"+
          " la calidad y la experiencia. Nuestro objetivo es contribuir al bienestar y la tranquilidad de las personas y las organizaciones, mediante el uso de la tecnología más avanzada y el talento humano más capacitado."
          +"\n\n_#TuSeguridadEsNuestraPrioridad_"
        
        }
       ],
      
       "Ubicacion":[
        {
          "mesagge":"*SecuriBot🤖 dice* :"+"\n\nSomos *San Juan Electronics* \n💛Su seguridad es nuestra prioridad!"+
          "\n\nEstamos ubicados en la transversal 9#57n-202 via al bosque a 2 minutos de cafe la palma."+
          "\n🗺"+"https://maps.app.goo.gl/YWS9ivspu9mMcTay8"+"\n\nPuedes contactarnos a los numeros:"+
          "\n3026052089 -- 3006549863"+"\n\n_#TuSeguridadEsNuestraPrioridad_"
        
        }

       ], 
       "PQRS":[
        {
          "mesagge":"*SecuriBot🤖 dice* :  \n No disponible!"+
          " \n \n Escribe *info* para reiniciar el chat."
        }
       ]
      

    }, 
    catalogo:{

      "mesagge":"SecuriBot🤖 dice :"+"\n\n A continuacion te dejamos un enlace a nuestra WEB donde podras observar nuestro catalogo de productos y servicios."+
      "  \n https://sanjuanelectronics.online/"+
        " \n \n "+
        "\n "
  },
  
  
    

   }
   var utilities=
  {
    promociones:{
      prom1:{
        "img":"https://scontent-bog1-1.xx.fbcdn.net/v/t39.30808-6/387042543_724012399741838_5498460068571543279_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=5f2048&_nc_ohc=Kxe5ErCfYJ4AX_47BXU&_nc_ht=scontent-bog1-1.xx&oh=00_AfCbskmDEkajNzrRidSwXiBzgkE3hWX2k1tJccmQ8CbDEA&oe=6537D8FB",
        "message":"Promo inperdible"


      },
      prom2:{
        "img":"https://scontent-bog1-1.xx.fbcdn.net/v/t39.30808-6/274943224_1537743729937140_1507675077666243572_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=5f2048&_nc_ohc=WhEq6nO29PUAX9cTX4A&_nc_oc=AQlDj-jf3ykxw1jc-LfUOYX48leTFOHu1P5MqLQC8NqP0Ekxi9ujBB__S8XjrtKC43k&_nc_ht=scontent-bog1-1.xx&oh=00_AfCFoYKFvZmYtQ4Otu1bgmjudkwhspSEoZahpUbM80ebdA&oe=6538A896",
        "message":"GRAN PROMOCION"
      }
      
      
      
},
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
     
     //console.log()
      var name=req.body.entry[0].changes[0].value.contacts[0].profile.name;
      
      function sendInteractive(opt, service){

        var kys= Object.keys(opt);
        var seccions=[  
        ]

       
        for(var i=0;i<kys.length;i++){
          let optn={
            title:"Opcion"+(i+1),
            rows: [
              {
                id:service,
                title:kys[i],
                description:kys[i]           
              }
            ]
          }
        
          seccions.push(optn)
        
        
        }
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
                 body: {text:"SecuriBot🤖 dice :"+ "\n\nMenu"+" "+service.toUpperCase()+"\n\n💛Tu seguridad es nuestra prioridad"
                 +"\n *Elije tus Opciones*"+"👇"},
                 footer: {
                   
                 text: "scaliwoodSoft"},
                 action: {
                   button: "Menu de Opciones",
                   sections:seccions
                 }
               }
                   }
          ,
           headers: { "Content-Type": "application/json" },
         });
       }
     function sendOP(opction,para){
      axios({
        method: "POST", // Required, HTTP method, a string, e.g. POST, GET
        url:
          "https://graph.facebook.com/v12.0/" +
          phone_number_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          status: "read",
          to: para,
          text: { body:  opction},
          footer: {
            text: "scaliwoodSoft"}
        },
        headers: { "Content-Type": "application/json" },
      });
    }
      // extract the message text from the webhook payload
     
     if( req.body.entry[0].changes[0].value.messages[0].interactive){
    

      if(req.body.entry[0].changes[0].value.messages[0].interactive.list_reply){
       
      
       
        let tileServ = req.body.entry[0].changes[0].value.messages[0].interactive.list_reply.description;
       
       if(rtaopt[tileServ]){
          
        sendInteractive(rtaopt[tileServ],tileServ)
    
      }else{
        let msg_interctive = req.body.entry[0].changes[0].value.messages[0].interactive.list_reply.description;
        let idServ = req.body.entry[0].changes[0].value.messages[0].interactive.list_reply.id;
       
       
         if(msg_interctive==="renovacion"){

          axios({
            method: "POST", // Required, HTTP method, a string, e.g. POST, GET
            url:
              "https://graph.facebook.com/v12.0/"+phone_number_id +"/messages?access_token="+token,
                data:{
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to : from,
                type: "interactive" ,
                interactive:{
                  type: "button",
                  header: {  
                  type: "text",
                  text: "San Juan"},
                  body: {text: "SecuriBot🤖 dice :"+"\n Elije el servicio que deseas renovar \n \n*Opciones*"+"👇"},
                  footer: {
                    
                  text: "scaliwoodSoft"},
                  action: {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": "renovar_plataforma",
                          "title": "Renovar Plataforma"
                        }
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "renovar_plan",
                          "title": "Renovar Plan"
                        }
                      }
                    ]
                  }
                }
                    }
           ,
            headers: { "Content-Type": "application/json" },
          });
         

         }else if(msg_interctive==="promociones"){



          var promodata=utilities["promociones"];
          var kys= Object.values(utilities.promociones);
          for(var i=0;i<kys.length;i++){
          axios({
            method: "POST", // Required, HTTP method, a string, e.g. POST, GET
            url:
              "https://graph.facebook.com/v12.0/"+phone_number_id +"/messages?access_token="+token,
                data:{
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to : from,
                type: "interactive" ,
                interactive:{
                  type: "button",
                  header: {  
                    type:"image",
                    "image": {
                      "link" : kys[i].img
                        }, 
                      },
                  body: {text:  kys[i].message},
                  footer: {
                    
                  text: "scaliwoodSoft"},
                  action: {
                    "buttons": [
                    
                      {
                        "type": "reply",
                        "reply": {
                          "id": "acceder_promo",
                          "title": "Acceder"
                        }
                      }
                    ]
                  }
                }
                    }
           ,
            headers: { "Content-Type": "application/json" },
          });
        }
            }


         else{
          let servicio= rtaopt[idServ]
       
          var sub=servicio[msg_interctive];
          sendOP(sub[0].mesagge,from)
         }
        
      }
      
       
      
      }else if(req.body.entry[0].changes[0].value.messages[0].interactive.button_reply){
        let butonRepli= req.body.entry[0].changes[0].value.messages[0].interactive.button_reply.id;
        let butonTitle= req.body.entry[0].changes[0].value.messages[0].interactive.button_reply.title;
        

        let contactClient= "Por favor ponerse en contacto con:"+" \n"+
        name+" "+"\n al numero:"+""+from+", para"+" "+butonRepli
        let asesrNumber="573026055289"
         sendOP(contactClient,asesrNumber)
         sendOP(rtaopt[butonRepli].mesagge,from);
         

      }



     }else if(req.body.entry[0].changes[0].value.messages[0].button){
      let butonrta = req.body.entry[0].changes[0].value.messages[0].button.text;
      if(butonrta==="Renovar Plataforma"){
        butonrta="renovar_plataforma"
        sendOP(rtaopt[butonrta].mesagge,from); 
        let contactClient= "Por favor ponerse en contacto con:"+" \n"+
        name+" "+"\n al numero:"+""+from+", para"+" "+butonrta
        let asesrNumber="573026055289"
        sendOP(contactClient,asesrNumber); 
      }else if(butonrta==="Renovar Plan"){
        butonrta="renovar_plan"
        sendOP(rtaopt[butonrta].mesagge,from); 
        let contactClient= "Por favor ponerse en contacto con:"+" \n"+
        name+" "+"\n al numero:"+""+from+", para"+" "+butonrta
        let asesrNumber="573026055289"
        sendOP(contactClient,asesrNumber); 
      }else if(butonrta==="Detener promociones"){
       let mesagge="Entendido"
        sendOP(mesagge,from); 
        let contactClient= "Por favor no enviar publicidad a:"+" \n"+
        name+" "+"\n al numero:"+""+from+", para"+" "+butonrta
        let asesrNumber="573026055289"
        sendOP(contactClient,asesrNumber); 
      }else if(butonrta==="NO MOLESTAR!"){
        let mesagge="SecuriBot🤖 dice :"+"\n\nEntendido."+"\nSan Juan Electronics le desea un feliz dia!.💛"+
          "\n\nNuestros numeros de contacto son: 3026055289 - 3006549863"+
          "\n_#TuSeguridadEsNuestraPrioridad_"
         sendOP(mesagge,from); 
         let contactClient= "Por favor no enviar publicidad a:"+" \n"+
         name+" "+"\n al numero:"+""+from+", para"+" "+butonrta
         let asesrNumber="573026055289"
         sendOP(contactClient,asesrNumber); 
       }else if(butonrta==="RECLAMAR REGALO"){
        let mesagge="SecuriBot🤖 dice :"+"\n\nPronto uno de nuestros asesores👨‍💻 se pondra en contacto con usted para acordar la entrega de su beneficio.🎉🎁"+
          "\n\nNuestros numeros de contacto son: 3026055289 - 3006549863"+
           "\n_#TuSeguridadEsNuestraPrioridad_"
         sendOP(mesagge,from); 
         let contactClient= "Por favor no enviar publicidad a:"+" \n"+
         name+" "+"\n al numero:"+""+from+", para"+" "+butonrta
         let asesrNumber="573026055289"
         sendOP(contactClient,asesrNumber); 
       }
      
     }else{
      
      var msg_body1 = req.body.entry[0].changes[0].value.messages[0].text.body;
      var date= req.body.entry[0].changes[0].value.messages[0].timestamp
      io.emit('whatsapp_notification', from,msg_body1,"new");
     save(msg_body1,from);
     
     var arrayMaessage=msg_body1.split(" ");

     for(var i=0;i<arrayMaessage.length;i++){
     if(agradecimiento.includes(arrayMaessage[i].toLocaleLowerCase())){
      let msg_body ="SecuriBot🤖 dice :"+"\n\n"+name+" "+", "+"\nes un gusto para *San Juan Electronics* poder servirle.😊"+
      "\n\nGracias por elegirnos para ayudarte a proteger lo que mas te ha costado💛"
      +
      "\n\nNo olvides seguirnos en las redes sociales como *San Juan Electronics* y visitarnos en nuestra pagina web http://sanjuanelectronics.online/"+
     "\n\nFeliz dia!"+
      "\n\n_#TuSeguridadEsNuestraPrioridad_";          
      
      sendOP(msg_body,from)
      break;
    }else if(saludos.includes(arrayMaessage[i].toLocaleLowerCase())){
      axios({
        method: "POST", // Required, HTTP method, a string, e.g. POST, GET
        url:
          "https://graph.facebook.com/v12.0/" +
          phone_number_id +
          "/messages?access_token=" +
          token,
          data: {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to : from,
            type: "interactive" ,
            interactive:{
              type: "list",
              header: {  
              type: "text",
              text: "San Juan"},
              body: {text: "Hola"+" "+name+" "+" "+"soy *Securi Bot* 🤖  de  San Juan Electronics."+"\n\n💛Tu seguridad es nuestra prioridad!"+
              "\n\nSiguenos en Facebook como: \n*San Juan Electronics*."+"\n O visita nuestra WEB https://sanjuanelectronics.online/"+ "\n\nPara mas informacion de nuestros productos y servicios elige una opcion👇👇👇 "},
              footer: {
              text: "scaliwoodSoft"},
              action: {
                button: "Nuestros Servicios",
                sections:[
                 
                  {
                    title:"opcion 1",
                    rows: [
                      {
                        id:"1",
                        title: "GPS",
                        description: "gps",           
                      }
                    ]
                  },
                  {
                    title:"Opcion 2",
                    rows: [
                      {
                        id:"2",
                        title: "CCTV(camaras seguridad)",
                        description: "cctv",           
                      }
                    ]
                  },
                  {
                    title:"Opcion 3",
                    rows: [
                      {
                        id:"3",
                        title: "Alarmas Recidenciales",
                        description: "alarmas",  
                             
                      }
                    ]
                  },{
                    title:"Opcion 4",
                    rows: [
                      {
                        id:"4",
                        title: "Control de Acceso",
                        description: "Control_Acceso",  
                             
                      }
                    ]
                  },
                  {
                    title:"Opcion 5",
                    rows: [
                      {
                        id:"5",
                        title: "PROMOCIONES",
                        description: "promociones",  
                             
                      }
                    ]
                  },{
                    title:"Opcion 6",
                    rows: [
                      {
                        id:"5",
                        title: "Nosotros",
                        description: "nosotros",  
                             
                      }
                    ]
                  }
                  
                ]
              }
            }
                },
        headers: { "Content-Type": "application/json" },
      });
      break;
    }else if(rtaopt[arrayMaessage[i].toLocaleLowerCase()]){
      sendInteractive(rtaopt[arrayMaessage[i].toLocaleLowerCase()], arrayMaessage[i].toLocaleLowerCase())
     
      
       break
    }
    else if(arrayMaessage[i].toLocaleLowerCase()=="asesor"){
      text=("SecuriBot🤖 dice :"+"\nEn minutos uno de nuestros asesores se pondra en contacto con usted."+"\n\n_#TuSeguridadEsNuestraPrioridad:")
      let contactClient= "Por favor ponerse en contacto con:"+" \n"+
      name+" "+"\n al numero:"+""+from+"" +"para asesoria";

      let to= "573026055289"
      sendOP(text,from)
      sendOP(contactClient, to)
    }
     
  }
     
      
      
     
     
    }
     
    }
    res.sendStatus(200);
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }

}
});

async function getDatesToEnd(){
 
  const VehicleTo7= await Image.find().lean();
  var date=new Date();
var hoy= date.getFullYear()+"-"+date.getMonth()+1+"-"+"0"+date.getDate()
var dateToday= new Date(hoy);
for(var i=0;i<VehicleTo7.length;i++){

  var dateToCutPlat= new Date(VehicleTo7[i].fechaPlat);
  var dateToCutPlan= new Date(VehicleTo7[i].fechaPlan);


  var mes=(dateToday.getMonth()+1)-(dateToCutPlat.getMonth()+1)
  var dias=(dateToday.getDate()+1)-(dateToCutPlat.getDate()+1)
  var agno=(dateToday.getFullYear()+1)-(dateToCutPlat.getFullYear()+1);

  var mesPlan=(dateToday.getMonth()+1)-(dateToCutPlan.getMonth()+1)
  var diasPlan=(dateToday.getDate()+1)-(dateToCutPlan.getDate()+1)
  var agnoPlan=(dateToday.getFullYear()+1)-(dateToCutPlan.getFullYear()+1)
  if((mes>=0&dias>=-7&agno>=0)||(mesPlan>=0&diasPlan>=-7&agnoPlan>=0)){
     
    io.emit('prontos_vencer',VehicleTo7[i])

  }
}
  


  

}
const { jsPDF } = require("jspdf");
const fs = require('fs');
const { error } = require('console');
app.post("/cotizar", async(req, res) => {
  var date= new Date()
  try{
    var array=JSON.parse(req.body.jsonData);
    const cotizacion= new cotizar();
    cotizacion.numero=date.getTime();
    cotizacion.fecha=date.getTime();
    cotizacion.nombre=req.body.name_cot;
    cotizacion.cedula=req.body.doc_user_cot;
    cotizacion.telefono=req.body.cel_user_cot;
    cotizacion.direccion=req.body.aderess_user_cot;
   for(var i=0;i<array.length;i++){
    cotizacion.products.push(array[i]);
    //console.log(array[i])
   }

      await cotizacion.save();   
       res.render("cotizar.ejs")
}catch(err){
  console.log(err.errors)
}

 




});
app.get("/cotizar", async(req, res) => {
  res.render("cotizar.ejs")
});
app.get("/", async(req, res) => {
 
  res.render("index.ejs")

 
});




app.get("/add_user", (req, res) => {
  res.render("addUser.ejs")
 
})

app.post('/add_user/:id',async(req, res)=>{
 
  try{
    const img= new Image();
    img.nombre=req.body.name_user;
    img.celular=req.body.number_user;
    img.fechaPlat=req.body.dateToendPlat;
    img.fechaPlan=req.body.dateToendPlan;
    img.placa=req.body.placa;
    
       await img.save();   
       res.render("addUser.ejs")
}catch(err){
   console.log(err)
}
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


app.post("/v1/account/verify", (req, res) => {

console.log(req,res)
})
