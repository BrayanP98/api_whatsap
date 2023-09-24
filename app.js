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
app.use(express.static(path.join(__dirname,"public")));
app.get('/', (req, res) => {
  res.render("index.ejs")
});



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
  })
});

app.post("/webhook", (req, res) => {
  // Parse the request body from the POST
  let body = req.body;
 //console.log(JSON.stringify(req.body, null, 2));

 if(body.entry[0].changes[0].value.statuses){
  let status=body.entry[0].changes[0].value.statuses[0]["status"]
  //console.log(status)
 io.emit("estado",status)
  


 }else{
  

  var optinos=["1","2","3","4"]
  var saludos=["buen dia","hola","buenos dias","ole","buenas","buen","dia","info","ayuda","informacion","buen día"]
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
          "\n\nEl fin de las recargas mensuales o el plan anual de datos para GPS el el correcto funcionamiento de las alertas que emite el dispositivo ya que los SMS y los datos permiten la correcta conecion estre el dispositivo *GPS* y la aplicacion de monitoreo.",
          
        }
       ], 
       "servicio tecnico":[
        {
          "mesagge":"SecuriBot🤖 dice :"+"\n\nPara servicio tecnico escribe ASESOR o comunicate escribiendo a los numeros: \n *3026055289 - 3006549863*"+
          "\n O acercate a nuestra oficina ubicada en la *Transversal9 #57n-202 via al bosque*.",
          
        }
       ],
       
       "renovacion":[
        {
          "mesagge":"SecuriBot🤖 dice :"+"\nHola! "+"\n\nLa renovacion de plataforma anual tiene un costo de *$80.000* ."+
          "\nEn un momento uno de nuestros asesores lo contactara para continuan con el proceso de renovacion."+
        "  \n Nuestros medios de pago son:"+
          " \n \n *Ahorro a la mano:*  03157527681 ✅"+"\n *NEQUI:* 3006549863✅"+
          "\n O puede acercarse a nuestra oficina y realizar el proceso de renovacion. \n🚩Estamos ubicados en la transversal 9 #57n-202 via al bosque."

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
          "\n O acercate a nuestra oficina uicada en la *Transversal9 #57n-202 via al bosque*.",
          
        }
       ],
      
       "beneficios":[
        {
          "mesagge":"SecuriBot🤖 dice :"+"\n\n Un *sistema de CCTV* es una herramienta valiosa para la seguridad, la vigilancia y el control en una variedad de contextos. Los beneficios pueden ser particularmente evidentes en la prevención de delitos, la resolución de disputas, la seguridad del personal y la supervisión remota, entre otros aspectos. Sin embargo, es importante implementar y utilizar los sistemas de CCTV de manera ética y cumpliendo con las regulaciones de privacidad y derechos civiles pertinentes.",
          
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
          "\n\n Puede agendar su cita llamando a los numeros *3006549863-3026055289* o escribenos a Whatsapp a estos mismos numeros.",
          
        }
       ], 
       "servicio tecnico":[
        {
          "mesagge":"SecuriBot🤖 dice :"+"\n\nPara servicio tecnico escribe *ASESOR* o comunicate a los numeros: \n *3026055289 - 3006549863*"+
          "\n O acercate a nuestra oficina uicada en la *Transversal9 #57n-202 via al bosque*.",
          
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
          "\n\n Puede agendar su cita llamando a los numeros *3006549863-3026055289* o escribenos a Whatsapp a estos mismos numeros.",
          
        }
       ], 
       "servicio tecnico":[
        {
          "mesagge":"SecuriBot🤖 dice :"+"\n \n Para servicio tecnico escribe *ASESOR* o comunicate a los numeros: \n *3026055289 - 3006549863*"+
          "\n O acercate a nuestra oficina uicada en la *Transversal9 #57n-202 via al bosque.*",
          
        }
       ],
      
       "beneficios":[
        {
          "mesagge":"SecuriBot🤖 dice :"+" \n \nUn *sistema de control de acceso* es fundamental para garantizar la seguridad, la privacidad y la gestión eficiente de recursos en una amplia variedad de contextos. Desde la seguridad cibernética hasta la protección de instalaciones físicas, sus beneficios son esenciales para mantener la integridad de los sistemas y la información.",
          
        }
       ], 
       "otros":[
        {
          "mesagge":"SecuriBot🤖 dice :  \n No disponible!"+
          " \n \n Escribe *info* para reiniciar el chat."
        }
       ]
    },
    
    
    renovar_plataforma:{

        "mesagge":"SecuriBot🤖 dice :"+"\nHola! "+"\n\nLa renovacion de plataforma anual tiene un costo de *$80.000* ."+"\nEn un momento uno de nuestros asesores lo contactara para continuan con el proceso de renovacion."+
        "  \nNuestros medios de pago son:"+
          " \n \n *Ahorro a la mano:*  03157527681 ✅"+"\n *NEQUI:* 3006549863✅"+
          "\n\nO puede acercarse a nuestra oficina y realizar el proceso de renovacion. \n\n🚩Estamos ubicados en la transversal 9 #57n-202 via al bosque."

          
    },
    renovar_plan:{

      "mesagge":"SecuriBot🤖 dice :"+"\nHola! "+"\n\nLa renovacion de plan anual tiene un costo de *$130.000* ."+
      "\n\n *El no pago de la renovacion del plan generará el bloqueo inmediato de la SIM y la inhabilidad del servicio GPS.* "+
      "\n\n nEn un momento uno de nuestros asesores lo contactara para continuan con el proceso de renovacion."+
       
      "\n\nNuestros medios de pago son:"+
        " \n \n *Ahorro a la mano:*  03157527681 ✅"+"Proveer servicios de seguridad electrónica de alta calidad, adaptados a las necesidades y expectativas de cada cliente. Ofrecemos sistemas de alarmas, cámaras, control de acceso, monitoreo y asistencia técnica, con el respaldo de un equipo profesional y comprometido. Buscamos generar valor agregado y satisfacción a nuestros clientes, garantizando su seguridad y la de sus bienes. Aspiramos a ser un referente en el mercado, por nuestra innovación, responsabilidad y ética. *NEQUI:* 3006549863✅"+
        "\n\nO puede acercarse a nuestra oficina y realizar el proceso de renovacion. \n\n🚩Estamos ubicados en la transversal 9 #57n-202 via al bosque."

        
  },
    asesor:{

    },  
    nosotros:{
      "Mision":[
        {
          "mesagge":"*SecuriBot🤖 dice* :"+"\n\0\0\0\0 *MISION*"+"\n\nProveer servicios de seguridad electrónica de alta calidad, adaptados a las necesidades y expectativas de cada cliente. Ofrecemos sistemas de alarmas, cámaras, control de acceso, monitoreo y asistencia técnica, con el respaldo de un equipo profesional y comprometido. "+
          "Buscamos generar valor agregado y satisfacción a nuestros clientes, garantizando su seguridad y la de sus bienes. Aspiramos a ser un referente en el mercado, por nuestra innovación, responsabilidad y ética."
          +"\n\n_#TuSeguridadEsNuestraPrioridad_"
        }
       ], 
       "Vision":[
        {
          "mesagge":"*SecuriBot🤖 dice* :"+"\n \0\0\0\0   *VISION*"+"\n\nNuestra visión es ser la empresa líder en seguridad electrónica, ofreciendo soluciones innovadoras y personalizadas que protejan a nuestros clientes y sus activos. Queremos brindar un servicio de excelencia, basado en la confianza,"+
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
  cotizar:{

    "mesagge":"SecuriBot🤖 dice :"+"\n\nA continuacion te dejamos un enlace a nuestra WEB donde podras observar nuestro catalogo de productos y servicios."+
    "  \n https://sanjuanelectronics.online/"+
      " \n \n "+
      "\n "

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
                title: kys[i],
                description: kys[i]           
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
                 body: {text: service.toUpperCase()+" \n Elije tus Opciones"+"👇"},
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
    
      }
        let msg_interctive = req.body.entry[0].changes[0].value.messages[0].interactive.list_reply.description;
        let idServ = req.body.entry[0].changes[0].value.messages[0].interactive.list_reply.id;
        let servicio= rtaopt[idServ]
       
        var sub=servicio[msg_interctive];
       
         if(msg_interctive==="renovacion"){
         
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
                  type: "button",
                  header: {  
                  type: "text",
                  text: "San Juan"},
                  body: {text: service.toUpperCase()+" \n Elije tus Opciones"+"👇"},
                  footer: {
                    
                  text: "scaliwoodSoft"},
                  action: {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": "Renovar Plataforma",
                          "title": "Renovar Plataforma"
                        }
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "Renovar Plan",
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
        }

          var option=["Renovar Plataforma","Renovar Plan CLARO"]
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
                  type: "button",
                  header: {  
                  type: "text",
                  text: "San Juan"},
                  body: {text: service.toUpperCase()+" \n Elije tus Opciones"+"👇"},
                  footer: {
                    
                  text: "scaliwoodSoft"},
                  action: {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": "Renovar_Plataforma",
                          "title": "Renovar Plataforma"
                        }
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "Renovar Plan",
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
        }


         }else{
          sendOP(sub[0].mesagge,from)
         }
         
  
      
       
      
      }else if(req.body.entry[0].changes[0].value.messages[0].interactive.button_reply){
        let butonRepli= req.body.entry[0].changes[0].value.messages[0].interactive.button_reply.id;
        
        let contactClient= "Por favor ponerse en contacto con:"+" \n"+
        name+" "+"\n al numero:"+""+from+", para"+" "+butonRepli
        let asesrNumber="573026055289"
      //  sendOP(contactClient,asesrNumber)
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
      }
      
     }else{
      
      let msg_body1 = req.body.entry[0].changes[0].value.messages[0].text.body;
    
     
      
   
      var lower=msg_body1.toLowerCase();
      var hasKey = (rtaopt[msg_body1] !== undefined);
      if(rtaopt[lower]){
        let text= "Por favor ponerse en contacto con:"+" \n"+
        name+" "+"\n al numero:"+""+from+""+"para asesoria en"+" "+lower;
        if(lower=="asesor"){
           text=("SecuriBot🤖 dice :"+"\nEn minutos uno de nuestros asesores se pondra en contacto con usted.")
           let contactClient= "Por favor ponerse en contacto con:"+" \n"+
           name+" "+"\n al numero:"+""+from+"" +"para asesoria";
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
          sendOP(text,from)
        }else if(lower=="cotizar"){
          sendOP(rtaopt[lower].mesagge,from)
        }
         
       sendInteractive(rtaopt[lower], lower)

        
      }else{
        if(optinos.includes(msg_body1)){
          if(msg_body1==="1"){
            
           sendInteractive(rtaopt["cctv"],"cctv")
          }if(msg_body1==="2"){
            sendInteractive(rtaopt["gps"],"gps")
          }if(msg_body1==="3"){

           sendInteractive(rtaopt["alarmas"],"alarmas")
          }
          if(msg_body1==="4"){
          sendInteractive(rtaopt["Control_Acceso"],"Control_Acceso")
            }
          if(msg_body1==="5"){
              sendOP(rtaopt["catalogo"].mesagge,from)
            }if(msg_body1===""){
              sendOP(rtaopt["nosotros"].mesagge,from)
                }
  
         
  
        }else if(saludos.includes(msg_body1.toLowerCase())){
          //let mesagge='de'+':'+ from +' '+msg_body1;
          io.emit('whatsapp_notification', from,msg_body1);
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
                  body: {text: "Hola *brayan*"+" "+"soy *Securi Bot* 🤖  de  San Juan Electronics."+"\n\n💛Tu seguridad es nuestra prioridad!"+
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
                      },{
                        title:"Opcion 5",
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
         
        }else if(agradecimiento.includes(msg_body1.toLowerCase())){

          io.emit('whatsapp_notification', from,msg_body1);
          let msg_body ="Es un gusto para *San Juan Electronics* poder servirle.😊"+
          "\n Feliz dia!";          
          
          sendOP(msg_body,from)
          
        }else if(optinoSpecial.includes(msg_body1.toLowerCase())){
          let dato=msg_body1.toLowerCase();
          console.log(dato)
          
        }else{
          
          io.emit('whatsapp_notification', from,msg_body1);
          let msg_body ="*SecuriBot*🤖 dice :"+"\n\nNo entiendo lo que quieres decirme"+"\nIntenta una de las siguientes palabras clave:"+
          "\n *Informacion, buen dia, hola, GPS, CCTV, alarmas, asesor, catalogo *"  ;
           sendOP(msg_body, from)
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


app.post("/v1/account/verify", (req, res) => {

console.log(req,res)
})