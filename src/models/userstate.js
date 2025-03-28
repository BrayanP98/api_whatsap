const {Schema, model} = require('mongoose');

const userSchema= new Schema({
  role: String,     
  from: String,      // Número del usuario
  state: String,     // Estado actual ("esperando_titulo", "esperando_parrafo", etc.)
  blogData: [
    {
      fecha: String,
      titulo: String,
      imagen: String,
      parrafo: String,
    }
  ],
  chats: [
    {
      fecha: String,
      mansaje: String,
     
    }
  ],
});
module.exports=model('UserState', userSchema);
