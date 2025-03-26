const {Schema, model} = require('mongoose');

const userSchema= new Schema({
  from: String,      // Número del usuario
  state: String,     // Estado actual ("esperando_titulo", "esperando_parrafo", etc.)
  cont:[{

    fecha:{
        type:String,
        required:false,
        unique:false,
    },
    titulo:{
        type:String,
        required:false,
        unique:false,
    },
    parrafo:{
        type:String,
        required:false,
        unique:false,
    }, }],
});
module.exports=model('UserState', userSchema);
