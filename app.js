const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const Papa = require('papaparse');
const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');
const path= require('path');
const body_parser = require("body-parser");
const Image=require('./src/models/IMAGE.js');
const chat=require('./src/models/chats.js');
const UserState=require('./src/models/userstate.js');
const Blogs=require('./src/models/blogs.js');
const cotizar=require('./src/models/cotizaciones.js');
const bodyParser = require('body-parser');
const cron=require('node-cron');
const chats = require('./src/models/chats.js');
const { getEmbedding } = require('./src/models/asistente.js');
//const { responder } = require('./asistente');

const asistente=require("./asistente.js");
require("./functions.js");
const app = express();
app.use(body_parser.json());
const server = http.createServer(app);
require("./database");

const save = require('./functions.js');

var cont_blog={}

const apiKey = process.env.HF_API_KEY; 
const token = "EAAO79M2kv3MBO52bofwZAOZALeGgZBC8vtdmcpEkZCdsGIuGttKy6YM3fkUTneWMAspA8XZA9yaMkDhxZC7Uh09qC14Ixyb1KI0wPjIX4iZBoR9cjRZBZC32Lsap5ebDCBxykTDZCMrXdTYvKl14ZCHrS6chZBt1uYyeULVlQLDfPdhq1Kg9HfYUgM9DfMJHojkYlZB5dCIfOsI3AfGbiYnHA";

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
  console.log(`Server listening on port ${PORT}`);
});
io.on('connection', function(socket)  {
  socket.on("send_rta", function (to, message) {
    var botId = '426245237228457';
    axios({
      method: "POST", // Required, HTTP method, a string, e.g. POST, GET
      url:
        "https://graph.facebook.com/v21.0/" +
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











//////////////////////////////prueba modelo asistente ////////////////////////
const MAX_LEN = 10;
const RUTA_MODELO = "file://./modelo_entrenado";

let palabraAIndice = {};
let indiceAPalabra = {};
let modelo = null;



// 📌 Cargar el modelo
async function cargarModelo() {
    if (!fs.existsSync("./modelo_entrenado/model.json")) {
        console.log("⚠️ No se encontró un modelo guardado.");
        return null;
    }
    console.log("📥 Cargando modelo entrenado...");
    modelo = await tf.loadLayersModel(`${RUTA_MODELO}/model.json`);
    console.log("✅ Modelo cargado correctamente.");
}

// 📌 Cargar el vocabulario
async function cargarVocabulario() {
    const vocabFile = "./modelo_entrenado/vocab.json";
    if (fs.existsSync(vocabFile)) {
        const vocabData = JSON.parse(fs.readFileSync(vocabFile, "utf8"));
        palabraAIndice = vocabData.palabraAIndice;
        indiceAPalabra = vocabData.indiceAPalabra;
        console.log("✅ Vocabulario cargado correctamente.");
    } else {
        console.log("⚠️ No se encontró vocabulario guardado.");
    }
}

// 📌 Convertir texto a tensor
function textoATensor(texto) {
    const tokenizer = new natural.WordTokenizer();
    if (typeof texto !== "string") return new Array(MAX_LEN).fill(0);

    let secuencia = tokenizer.tokenize(texto).map(word => palabraAIndice[word] || 0);
    while (secuencia.length < MAX_LEN) secuencia.push(0);

    return secuencia.slice(0, MAX_LEN);
}

async function responder(pregunta) {
  await cargarVocabulario();
  await cargarModelo();
  
  if (!modelo) {
      console.log("❌ No hay un modelo cargado. No se puede responder.");
      return "Error: No se ha cargado un modelo.";
  }

  const tensorPregunta = tf.tensor2d([textoATensor(pregunta)], [1, MAX_LEN]);
  const prediccion = modelo.predict(tensorPregunta);
  const arrayPrediccion = await prediccion.array(); // Convertir tensor a array anidado

  let respuestaGenerada = [];
  for (let i = 0; i < MAX_LEN; i++) {
      if (!arrayPrediccion[0] || arrayPrediccion[0][i] === undefined) continue;

      // Encontrar el índice de la palabra con mayor probabilidad en la posición i
      const indicePalabra = arrayPrediccion[0][i].indexOf(Math.max(...arrayPrediccion[0][i]));
      if (indicePalabra > 0 && indiceAPalabra[indicePalabra]) {
          respuestaGenerada.push(indiceAPalabra[indicePalabra]);
      }
  }

  return respuestaGenerada.length > 0 ? respuestaGenerada.join(" ") : "Lo siento, no entendí.";
}








///////////////////////////////////////////////////////////////////////////





const saludos=["buen dia","hola","buenos","hello","ole","buenas","dias","buen","dia","info","tarde","informacion","buen día","menu","servicio"]

const despedida=["adios","gracias","hasta luego","bueno"]
const training=["entrenar","practicar"]

app.post("/webhook", async (req, res) => {

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Parsear el cuerpo de la petición
  let body = req.body;

  // Validar estructura del mensaje antes de responder
  const mensaje = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!mensaje) return;  // ✅ Evita responder dos veces

  // Obtener ID del número de teléfono
  var phone_number_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;
  

  const from = mensaje.from;
  const text = mensaje.text?.body.toLowerCase();

  // ✅ Responder a WhatsApp para evitar reintentos
  res.sendStatus(200);

  // Buscar si el usuario tiene un estado guardado
  let user = await UserState.findOne({ from });

  // Si el usuario no tiene estado, lo creamos
  if (!user) {
    user = new UserState({role:"user", from, state: "transito", chats: []});
    await user.save();
  }

 
  if (user.role === "admin") {
    // ✅ Flujo de publicación de blog
      if (text === "publicar_blog") {
        user.state = "esperando_titulo";
        await user.save();
        return sendOP("NexoBot🤖 dice: \nPor favor ingresa el título del blog:", from, phone_number_id);
      }

      if (user.state === "esperando_titulo") {
        cont_blog.fecha=new Date().toLocaleDateString();
        cont_blog.titulo=text
        user.state = "esperando_img";
        await user.save();
        return sendOP("NexoBot🤖 dice: \nAhora ingrese la URL de la imagen del blog:", from, phone_number_id);
      }
      if (user.state === "esperando_img") {
        
        cont_blog.imagen= text;
        user.state = "esperando_parrafo";
        await user.save();
        return sendOP("NexoBot🤖 dice: \n por favor ingresa el parrafo del blog:", from, phone_number_id);
      }
      if (user.state === "esperando_parrafo") {
        
        cont_blog.parrafo = text;
        user.state = "en espera";
        await user.save();
        return sendOP("NexoBot🤖 dice: \n¿Deseas publicar tu blog? (Responde 'si' o 'no')", from, phone_number_id);
      }

      if (user.state === "en espera") {
        console.log(cont_blog)
        if (text === "si") {
          
          await UserState.findOneAndUpdate(
            { from: from },  
            { $push: { blogData: cont_blog } }  // Agregar blog al array
          );

          user.state = "ninguno";
          await user.save();
          return sendOP("NexoBot🤖 dice: \n✅ Tu post ha sido publicado con éxito.", from, phone_number_id);
        } else {
          user.state = "ninguno";
          await user.save();
          return sendOP("NexoBot🤖 dice: \n❌ Publicación cancelada.", from, phone_number_id);
        }
      }//////////////////////////////////////// fin publicar blog*////////////////////////
    }else {
      if (mensaje.type === "text") {

        var name = req.body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name || "Usuario";
        const palabras = text.split(" ");
        const esSaludo = palabras.some((palabra) => saludos.includes(palabra));despedida
        const esDespedida = palabras.some((palabra) => despedida.includes(palabra));
      
        if (esSaludo) {
           return await sendMenuOptions(from, phone_number_id,name);
        }
        if (esDespedida) {
          return await sendOP( "NexoBot🤖 dice: fue un gusto poder ayudarte el dia de hoy ¡Que tengas un excelente día! 👋",from, phone_number_id);
       }
       if (training) {
        asistente()

        return await sendOP( "NexoBot🤖 dice: modelo entrenando",from, phone_number_id);
     }
     //  constmensaje = "que es cctv";
    //console.log(`📩 Pregunta: ${mensaje}`);
    const respuesta = await responder(text);
   // console.log(`🤖 Respuesta: ${respuesta}`);
       
       return await sendOP("🤖 :" +respuesta,from, phone_number_id);


       
       
    
  

   
      

    

  }
  if (mensaje.type === "interactive" && mensaje.interactive.type === "list_reply") {
    const selectedId = mensaje.interactive.list_reply.id;
    await handleUserSelection(from, phone_number_id, selectedId);
    return;
  }

  }
  
  
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
});


async function sendMenuOptions(to, phone_number_id,name) {
  try {
    await axios.post(`https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${token}`, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        header: { type: "text", text: "Nexo Security" },
        body: { text: "Hola"+" "+name+" "+" "+"soy *NexoBot* 🤖  de  Nexo Security ."+"\n\n💙Seguridad y Comodidad Inteligente!"+
              "\n\nSiguenos en Facebook como: \n*Nexo Security *."+"\n O visita nuestra WEB https://nexosecurity.netlify.app/"+ "\n\nPara mas informacion de nuestros productos y servicios elige una opcion👇👇👇 " },
        footer: { text: "scaliwoodSoft" },
        action: {
          button: "Nuestros Servicios",
          sections: [
            {
              title: "Opción 1",
              rows: [{ id: "1", title: "CCTV-CámarasSeguridad", description: "cctv" }]
            },
            {
              title: "Opción 2",
              rows: [{ id: "2", title: "Alarmas Residenciales", description: "alarmas" }]
            },
            {
              title: "Opción 3",
              rows: [{ id: "3", title: "Control de Acceso", description: "Control_Acceso" }]
            },
            {
              title: "Opción 4",
              rows: [{ id: "4", title: "PROMOCIONES", description: "promociones" }]
            },
            {
              title: "Opción 5",
              rows: [{ id: "5", title: "Nosotros", description: "nosotros" }]
            }
          ]
        }
      }
    }, { headers: { "Content-Type": "application/json" } });

    console.log("✅ Menú enviado con éxito");
  } catch (error) {
    console.error("❌ Error al enviar menú:", error.response?.data || error.message);
  }
}
async function handleUserSelection(to, phone_number_id, selectedId) {
  let responseMessage;

  switch (selectedId) {
    case "1":
      responseMessage = "📹 *CCTV (Cámaras de Seguridad)*\nProtege tu hogar o negocio con nuestros sistemas avanzados de videovigilancia.";
      break;
    case "2":
      responseMessage = "🚨 *Alarmas Residenciales*\nSistemas de seguridad que alertan ante cualquier intrusión en tu hogar.";
      break;
    case "3":
      responseMessage = "🔐 *Control de Acceso*\nGestiona quién puede ingresar a tu propiedad con nuestras soluciones de acceso inteligente.";
      break;
    case "4":
      responseMessage = "🎉 *PROMOCIONES*\nDescubre nuestras ofertas y descuentos especiales en seguridad.";
      break;
    case "5":
      responseMessage = "ℹ️ *Nosotros*\nConoce más sobre Nexo Security y nuestra misión de brindarte seguridad y comodidad.";
      break;
    default:
      responseMessage = "❌ Opción no válida. Por favor, elige una opción del menú.";
  }

  await sendOP(responseMessage,to, phone_number_id);
}


function sendOP(opction,para,phone_number_id){
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


app.get("/api/blogs", async (req, res) => {
  try {

    
    const users = await UserState.find();
const blogs = users.flatMap(user => user.blogData);

// Ordenar los blogs por fecha (de más reciente a más antiguo)
const blogsOrdenados = blogs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

// Obtener el último blog (el más reciente)
const ultimoBlog = blogsOrdenados.length > 0 ? blogsOrdenados[0] : null;
res.json({ success: true, blogsOrdenados, ultimoBlog });


  } catch (error) {
    res.status(500).json({ error: "Error al obtener los blogs" });
  }
});
app.get("/", async(req, res) => {
  res.render("index.ejs")
});
app.get("/blog", async(req, res) => {
  res.render("blogs.ejs")
});
app.get("/cotizar", async(req, res) => {
  res.render("cotizar.ejs")
});
app.get("/chat", async(req, res) => {
 
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

