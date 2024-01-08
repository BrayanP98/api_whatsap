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
    var dateToend= new Date(prods[i].fecha);
   // console.log(dateToday+""+dateToend.getTime())
    if(dateToday.getTime()===dateToend.getTime()){
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
}else{
  console.log("no vence")
    }
  }
  }
}


cron.schedule(" 50 16 * * *", () => {
	Main.getDate()
	
}, {
		timezone: "America/Bogota"
	})



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

  async function saveChat(mensaje, numero, fecha){
    var num_fecha=parseInt(fecha)
    

    var date=new Date(num_fecha * 1000)
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
      

      /*for(var i=0;i<cht.length;i++){
      if(cht[i].numero==numero){
       await chat[i].updateOne({numero:numero})
      
    }else{
      chat.numero=numero;
      chat.chat.push(conv); 

     chat.save()
    }
  }*/
    } catch (error) {
      console.log(error)
    }
      
  
  }

  module.exports = saveChat;

