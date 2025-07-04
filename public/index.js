//const { init } = require("");


var nombre_to_send=document.getElementById("nombre_to_send")
 var placa_to_send= document.getElementById("placa_to_send")
const title ="Chat San Juan"
var button_sendPaV= document.querySelector("#send_messagePaV");
var button_sendPv= document.querySelector("#send_messagePv");
var button_sendPlV= document.querySelector("#send_messagePlV");
var input_number= document.querySelector("#number_to_send");
var date_to_end= document.querySelector("#date_to_end");

var text_sms= document.querySelector("#text_sms");
// var textarea=document.querySelector("#mensajegps");
var nequi="3006549863";
var cta_ahorro= "03157527681"

button_sendPaV.onclick=function(){
 // let mensaje= textarea.value;
      let number= input_number.value;
      var data= {
     
        "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "type": "template",
    "template": {
      "name": "envio_recibo",
      "language": {
        "code": "es_MX"
      },
      "components": [
        {
          "type": "header",
          "parameters": [
            {
              "type": "document",
              "document": {
                "link": "public/pdf/COTIZACION.pdf"
              }
            }
          ]
        },
        {
          "type": "body",
          "parameters": [
            {
              "type": "text",
              "text": "cotizacoin de equipos"
            },
           
            
          ]
        }
      ]
    }
  
       
    
        }
     /* var  data= {
        "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "type": "template",
    "template": {
      "name": "plataforma",
      "language": {
        "code": "es_MX"
      },
      "components": [
        {
          "type": "button",
          "sub_type" : "url",
          "index": "2",
          "parameters": [
              {                    
                  "type": "text",
            
              "text": "https://sanjuanelectronics.online/"
    }
]
}
]

}

}*/

send_whatsapp(data)

input_number.value="";

}
button_sendPv.onclick=function(){
    // let mensaje= textarea.value;
         let number= "57"+input_number.value;
       
         var  data= {
            "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": number,
        "type": "template",
        "template": {
          "name": "vencido",
          "language": {
            "code": "es_MX"
          },
          "components": [
      
            
              {
                "type": "body",
                "parameters": [
                  {
                    "type": "text",
                    "text": nombre_to_send.value
                  },
                  {
                    "type": "text",
                    "text": placa_to_send.value
                  },
                 
                
                ]},
            
          ]
        
            }
          
        }
   
   send_whatsapp(data)
   
   input_number.value="";
   nombre_to_send.value="";
   placa_to_send.value="";
   }
button_sendPlV.onclick=function(){
    // let mensaje= textarea.value;
         let number= input_number.value;
         let text= text_sms.value;
         let date= date_to_end.value;
         
         var  data= {
            "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": number,
        "type": "template",
        "template": {
          "name": "expiracion1",
          "language": {
            "code": "es_MX"
          },
          "components": [
      
            
              {
                "type": "body",
                "parameters": [
                  {
                    "type": "text",
                    "text": text
                  },
                  {
                    "type": "text",
                    "text": date
                  },
                  {
                    "type": "text",
                    "text": cta_ahorro
                  },
                  {
                    "type": "text",
                    "text": nequi
                  },
                
                ]},
             { "type": "button",
              "sub_type" : "url",
              "index": "2",
              "parameters": [
                
                  {                    
                      "type": "text",
                     
                      "text": "https://sanjuanelectronics.online/"
                  }
              ]
            }
          ]
        
            }
          
        }
   
   send_whatsapp(data)
   
   input_number.value="";
   
   }

  function send_whatsapp(data){ 

    
  var botId = '426245237228457';
  // var phoneNbr = '573026055289';
  var bearerToken = 'EAAO79M2kv3MBPLdM1mrRseZBlf1UfHyyE0DAtwi62tsidrg3iZCDe2LE5UeUprI197GTyTZC2PZCePPV5ZAHysBj2gupMg883k6fcAvMaDPkq7jeMrugANglK8EhWxpEfieYe3BSCnZAX2XcTw1Gj2bFCtqvqSp88t7czmuZCJ2730bV1qZBwsDKMmxGMZCZC1ggIiZCpeUrmFTS2iL';

  var url = ' https://graph.facebook.com/v22.0/' + botId + '/messages';



  var postReq = {
  method: 'POST',
  headers: {
  'Authorization': 'Bearer ' + bearerToken,
  'Content-Type': 'application/json'
  },
  body: JSON.stringify(data),
  json: true
  };

  fetch(url, postReq)
  .then(data => {
  return data.json()
  })
  .then(res => {
  console.log(res)
  })
  .catch(error => alert(error));
  }







const socket = io();

window.addEventListener("load", function(){
  
  socket.emit("pagina_cargada","ok" )
}
)
var mensajeview=document.querySelector("#viewMessages")
var arrayMessages=[ ]


socket.on('data_user', (data) => {
  console.log(data)

})
socket.on('prontos_vencer', (data) => {
  var body_prods=document.querySelector("#body_dates");
 
  var arreglo=[]
  arreglo.push(data)
  
  
  
  for(let int=0; int< arreglo.length; int++){
    var date=new Date()

    let diaHoy=(date.getDate());
    let diaEnd=new Date(arreglo[int].fechaPlat);
    let diaEndpln=new Date(arreglo[int].fechaPlan);
    var dias=diaHoy-(diaEnd.getDate()+1)
    var diasPln=diaHoy-(diaEndpln.getDate()+1)


    console.log(arreglo[int].nombre)
    var tr= document.createElement("tr");
    var td_name=document.createElement("td");
    var td_celular=document.createElement("td");
    var td_placa=document.createElement("td");
    var td_fechaPlat=document.createElement("td");
    var td_fechaPlan=document.createElement("td");
    var td_dias=document.createElement("td")
    var td_diasPln=document.createElement("td")
    td_diasPln.style.color="red"
    td_dias.style.color="red"
   td_name.innerHTML=arreglo[int].nombre;
   td_celular.innerHTML=arreglo[int].celular,
    td_placa.innerHTML=arreglo[int].placa;
    td_fechaPlat.innerHTML=arreglo[int].fechaPlat;
    td_fechaPlan.innerHTML=arreglo[int].fechaPlan;
    td_dias.innerHTML=dias;
    td_diasPln.innerHTML=diasPln;
    tr.appendChild(td_name)
    tr.appendChild(td_celular)
    tr.appendChild(td_placa)
    tr.appendChild(td_fechaPlat)
    tr.appendChild(td_dias)
    tr.appendChild(td_fechaPlan)
    tr.appendChild(td_diasPln)
    body_prods.appendChild(tr)

   
   
}

})
function getMessages(from, message,stat){

  pintar(from,stat)
  
 

let usermsn={
  status:stat,
id:from,

mesagges:[
  message
]
}


if (arrayMessages.length === 0) {
//console.log("vacio")
arrayMessages.push(usermsn)
}else{

  console.log()
let exist=""
for(i=0;i<arrayMessages.length;i++){
//console.log(" no vacio")
if(arrayMessages[i].id==from){

arrayMessages[i].mesagges.push(message)

//console.log("ya existe")
//exist="si"
break;

}else{
  //console.log(" no  existe")

exist="no"
}
}

if(exist=="no"){
  
arrayMessages.push(usermsn)
refresh()
}

}


//console.log(from)


   
}
function pintar(from,stat){
  var mensajeview=document.querySelector("#lateral_view")

   let mesagesUser=document.createElement('div');
    let mesagesview=document.createElement('p');
    mesagesUser.className="mesaggeUser"
    
    mesagesUser.id=from;
   
    mesagesview.id=from
    mesagesview.innerHTML="Mensaje de:"+" "+from;
    let divUser=document.getElementById(from)
    
    if(divUser){
      
      mesagesview.innerHTML="";
     
      divUser.appendChild(mesagesview)
      
      
    }else{
      
      mesagesUser.appendChild(mesagesview)
      mensajeview.appendChild(mesagesUser)
      
    }
    
    refresh()


    if(stat=="new"){
      let divUser=document.getElementById(from)
      divUser.style.backgroundColor="red"

    }else{

    }
}
var tamaño=1
  socket.on('whatsapp_notification', (from, message,stat) => {

    
      
  getMessages(from, message,stat);
    Notification.requestPermission(function (permission) {
      // Si el usuario nos lo concede, creamos la notificación
      if (permission === "granted") {
      var notification = new Notification("Nuevo mensaje ded:"+" "+from+"\n"+message +stat);
      }
      });
      document.title='('+(tamaño+1)+')'+title
      
      //console.log(arrayMessages.length)
      
     
  });
  socket.on('db_messages', (from, message,stat,tamano) => {
    tamaño=tamano

    getMessages(from, message,stat)
    document.title='('+tamaño+')'+title
    
  });
  
  function refresh(){
   
for(i=0;i<arrayMessages.length;i++){

  let id=arrayMessages[i].id;
  let divUser=document.getElementById(id);

  

  divUser.onclick=function(){
    divUser.style="background:green;"
    let viewchat=document.getElementById("chatUser");
    var btn_send=document.getElementById("send_rta");
    var input_rta=document.getElementById("input_rta");
    btn_send.onclick=function(){
      var rta=input_rta.value;
      let from=divUser.id;
      socket.emit("send_rta", from,rta)

      input_rta.value=""
     

    }
    viewchat.innerHTML=""
    for(i=0;i<arrayMessages.length;i++){
      var mensajes=arrayMessages[i].mesagges
      if(divUser.id==arrayMessages[i].id){
      
     
       for(o=0;o<mensajes.length;o++){
      

        var chat=document.createElement("p");
        chat.className="chat"

        chat.innerHTML=mensajes[o];
        viewchat.appendChild(chat)

       }
      }else{
        
      }
     

    }
    
  }
}
}

socket.on('estado', (status) => {


let div_notific=document.querySelector("#div_notific");
let txt_div_notific=document.querySelector("#txt_div_notific")
var cont_pet=0
if(status=="delivered"){
console.log("status")
txt_div_notific.innerHTML="Mensaje entregado"
div_notific.classList.toggle("active")
}else if(status=="read"){
txt_div_notific.innerHTML="Mensaje leido"
div_notific.classList.toggle("active")
}else if(status=="failed"){
txt_div_notific.innerHTML="Numero incorrecto"
div_notific.classList.toggle("active")
}

})


var numberPromo=document.querySelector("#number_promo");
var urlImgPromo=document.querySelector("#url_img_promo");
var textoPromo=document.querySelector("#texto_promo");
var sendPromo=document.querySelector("#send_promo");



sendPromo.onclick=function(){

var valueNumberPromo=numberPromo.value
var arrayMaessage=valueNumberPromo.split(" ");
var img=urlImgPromo.value;
var descript= textoPromo.value

for(var i=0;i<arrayMaessage.length;i++){

  send_whatsapp(arrayMaessage[i], img, descript);
function send_whatsapp(number, img,  text){
  var botId = '426245237228457';
  var phoneNbr = '573126460957';
  var bearerToken = 'EAAO79M2kv3MBO8TZCRyxVRhau82TZC3UAOqkSz15Ps2ZA1DmOfmnqGP7tgqa2LVhfxZCvCkr851iiZCfLeaecCsWOZCkLRkjFl8FNt0avp0b8I7tLuQKZCYnwZBEtyLfebr6funPe5AWZAl2YxkUEeaZA9F0ZACgrmZCn8Y4CFyZA4w6fw1wNcXL6uyebPHRCOLknS81YCv7NiQK3x6sVMEe4jKP9SKaoNjYZD';
  
  var url = 'https://graph.facebook.com/v21.0/' + botId + '/messages';
 




var  data= {
"messaging_product": "whatsapp",
"recipient_type": "individual",
"to": number,
"type": "template",
"template": {
"name": "promos",
"language": {
"code": "es_MX"
},
"components": [
{
  "type": "header",
  "parameters": [
    
    {
      "type":"image",
    "image": {
      "link" : img
        }, 
    
    }
  
  ]},

  {
    "type": "body",
    "parameters": [
      {
        "type": "text",
        "text": text
      },
      
    
    ]},

]

}

}

      
  var postReq = {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + bearerToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    json: true
  };
  
  fetch(url, postReq)
    .then(data => {
      return data.json()
    })
    .then(res => {
      console.log(res)
    })
    .catch(error => console.log(error));

  }




}
}
 
