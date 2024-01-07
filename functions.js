const cron=require('node-cron')
const Image=require('./src/models/IMAGE');
class Main{
  static  async getDate(){
    const prods= await Image.find().lean();
  var date=new Date();
  var hoy= date.getFullYear()+"-"+date.getMonth()+1+"-"+"10"
  var dateToday= new Date(hoy);

  for(var i=0;i<prods.length;i++){
    var dateToend= new Date(prods[i].categoria);
   // console.log(dateToday+""+dateToend.getTime())
    if(dateToday.getTime()===dateToend.getTime()){
      console.log("vence")
    }else{
      console.log("no vence")
    }
  }
  }
}

cron.schedule(' 05 12 * * *', ()=>{
Main.getDate()
})

