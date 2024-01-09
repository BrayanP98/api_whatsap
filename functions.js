const cron=require('node-cron')
const Image=require('./src/models/IMAGE');
const axios = require("axios")
const chats=require('./src/models/chats.js');
 axios.default
class Main{
  static  async getDate(){
    const prods= await Image.find().lean();
  var date=new Date();
  var hoy= date.getFullYear()+"-"+date.getMonth()+1+"-"+"0"+date.getDate()
  var dateToday= new Date(hoy);
 

  for(var i=0;i<prods.length;i++){
    var dateToCutPlat= new Date(prods[i].fechaPlat);
    var dateToCutPlan= new Date(prods[i].fechaPlan);

    ////DIAS vencimiento plaATAFORMA
    var mes=(dateToday.getMonth()+1)-(dateToCutPlat.getMonth()+1)
    var dias=(dateToday.getDate()+1)-(dateToCutPlat.getDate()+1)
    var agno=(dateToday.getFullYear()+1)-(dateToCutPlat.getFullYear()+1)
////DIAS vencimiento plan
    var mesPlan=(dateToday.getMonth()+1)-(dateToCutPlan.getMonth()+1)
    var diasPlan=(dateToday.getDate()+1)-(dateToCutPlan.getDate()+1)
    var agnoPlan=(dateToday.getFullYear()+1)-(dateToCutPlan.getFullYear()+1)
    
   
   // console.log(dateToday+""+dateToend.getTime())
    if(mes>=0&dias==-7&agno>=0){
      var number=prods[i].celular;
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
    }if(mesPlan>=0&diasPlan==-7&agnoPlan>=0){
  var number1=prods[i].celular;
   let mensaje= "su plan *Claro* para *GPS* se encuentra pronto a vencer";
           
  var  data= {
              "messaging_product": "whatsapp",
          "recipient_type": "individual",
          "to": number1,
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
                      "text": mensaje
                    },
                    {
                      "type": "text",
                      "text": prods[i].fechaPlat
                    },
                    {
                      "type": "text",
                      "text": "03157527681"
                    },
                    {
                      "type": "text",
                      "text": "3006549863"
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
     
  
     
     }else{
      console.log("vence en 7 dias")
     }

}

}
  
  }
///////MENSAJE PROGRAMADO//////////////////////////////////////////////////////////////
cron.schedule(" 20 8 * * *", () => {
	Main.getDate()
	
}, {
		timezone: "America/Bogota"
	})

//////////////////////////////////////////////////////////////////////////////////////////
////FUNCION PARA ENVIAR EL MENAJE DE WHATSAPP
   function send_whatsapp(data){ 

  
    var botId = '122100131648008841';
    // var phoneNbr = '573026055289';
    var token = 'EABpkYoLqZBZCYBO830lX7JudRZBUZArnQvXgYFWBBYzEXruZAoDDFOJKjoba5hA8CeWjh4ngXOOfow8c2jqvFTmv1KV3Vfogj8tJWbpf1LuZCzh8EBSRqhXIGGRGBJdYLorQLRnjjtFhhuwpk4HJOHtRSyIbSldyraqsyh7fhXOloMrlo30wVSzZC75N28XEkCZA';
      

    axios({
      method: "POST", // Required, HTTP method, a string, e.g. POST, GET
      url:
        "https://graph.facebook.com/v12.0/" +
        botId +
        "/messages?access_token=" +
        token,
          data
     ,
      headers: { "Content-Type": "application/json" },
    });
  }

  ///FUNCION PRA GUARDAR UN MENSAJE CON LA FECHA EN LA BASE DE DATOS
  async function saveChat(mensaje, numero){
    var date=new Date()
    let fecha1= date.getDate() + '/' + (date.getMonth() + 1) + '/' +
    date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' +
    date.getSeconds();
    var conv={
      fecha:fecha1,
      mensaje:mensaje
     }
    try {
      var chat= new chats();
      await chats.updateOne(
        { numero: numero },
        { $push: { chat: conv } }
      );
    } catch (error) {
      console.log(error)
    }
      
  
  }
  

  module.exports = {saveChat};

