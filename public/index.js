


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
    
      var  data= {
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

}

send_whatsapp(data)

input_number.value="";

}
button_sendPv.onclick=function(){
    // let mensaje= textarea.value;
         let number= input_number.value;
       
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
                    "text": cta_ahorro
                  },
                  {
                    "type": "text",
                    "text": nequi
                  },
                 
                
                ]},
            
          ]
        
            }
          
        }
   
   send_whatsapp(data)
   
   input_number.value="";
   
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

    
  var botId = '122100131648008841';
  // var phoneNbr = '573026055289';
  var bearerToken = 'EABpkYoLqZBZCYBO830lX7JudRZBUZArnQvXgYFWBBYzEXruZAoDDFOJKjoba5hA8CeWjh4ngXOOfow8c2jqvFTmv1KV3Vfogj8tJWbpf1LuZCzh8EBSRqhXIGGRGBJdYLorQLRnjjtFhhuwpk4HJOHtRSyIbSldyraqsyh7fhXOloMrlo30wVSzZC75N28XEkCZA';

  var url = 'https://graph.facebook.com/v17.0/' + botId + '/messages';



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
  
var mensajeview=document.querySelector("#viewMessages")
var arrayMessages=[ ]


socket.on('data_user', (data) => {
  console.log(data)

})
function getMessages(from, message){
  
        var numerouser=from;
    
    let usermsn={
      id:from,
    
      mesagges:[
        message
      ]
    }
    
     if (arrayMessages.length === 0) {
      console.log("vacio")
      arrayMessages.push(usermsn)
     }else{
      let exist=""
      for(i=0;i<arrayMessages.length;i++){
      console.log(" no vacio")
      if(arrayMessages[i].id==from){
      arrayMessages[i].mesagges.push(message)
      console.log("ya existe")
      exist="si"
      break;
      
     }else{
      console.log(" no  existe")
      
      exist="no"
     }
     }
     
    if(exist=="no"){
      arrayMessages.push(usermsn)
    }
    
    }
    console.log(arrayMessages)
    
    
    
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
    
}
  socket.on('whatsapp_notification', (from, message) => {
    Notification.requestPermission(function (permission) {
      // Si el usuario nos lo concede, creamos la notificación
      if (permission === "granted") {
      var notification = new Notification("Nuevo mensaje de:"+" "+from+"\n"+message);
      }
      });
    getMessages(from, message);
     
  });
  socket.on('db_messages', (from, message) => {

    getMessages(from, message)
     
  });
  
  function refresh(){
    let numbernotif=arrayMessages.length
 console.log(arrayMessages.length)
 document.title='('+numbernotif+')'+title
for(i=0;i<arrayMessages.length;i++){

  let id=arrayMessages[i].id;
  let divUser=document.getElementById(id);

  divUser.onclick=function(){

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
  var botId = '122100131648008841';
  var phoneNbr = '573026055289';
  var bearerToken = 'EABpkYoLqZBZCYBOxobhn1EwbivIl4Uu1ecsawuwsDQgtJv8n7SVaqPsiBLJusnZBOM7SKdvAt4ZCJtxZCcrAS5n5dMbP3dhb0mzfM3nlSRV3KZBLBY07uq6HDuz6TJkyfTCwRwBJZCjvvOxuQ37M1LwuHZA2ge57k5cDTa2eVo1LPvROqctQPOIPJzdWlBjZCtykLqxdmTDzgTwRITK9T';
  
  var url = 'https://graph.facebook.com/v17.0/' + botId + '/messages';




var  data= {
"messaging_product": "whatsapp",
"recipient_type": "individual",
"to": number,
"type": "template",
"template": {
"name": "publicidad",
"language": {
"code": "es"
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
 
