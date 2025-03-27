const {Schema, model} = require('mongoose');

const userSchema= new Schema({
  from: String,      // Número del usuario
  state: String,     // Estado actual ("esperando_titulo", "esperando_parrafo", etc.)
  blogData: [
    {
      fecha: String,
      titulo: String,
      parrafo: String
    }
  ],
});
module.exports=model('UserState', userSchema);
