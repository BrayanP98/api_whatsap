const socket = io();
  
var mensajeview=document.querySelector("#viewMessages")
var arrayMessages=[ ]


  socket.on('whatsapp_notification', (from, message) => {

    Notification.requestPermission(function (permission) {
// Si el usuario nos lo concede, creamos la notificación
if (permission === "granted") {
var notification = new Notification("Nuevo mensaje de:"+" "+from+"\n"+message);
}
});
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


 
