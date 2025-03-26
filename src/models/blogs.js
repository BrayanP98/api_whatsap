const {Schema, model} = require('mongoose');

const blogSchema= new Schema({
    pos:{
        type:String,
        required:true,
        unique:false,
        trim:true
           },
           blogData: {        // Datos del blog temporalmente
            titulo: String,
             parrafo: String
          },
   

     done: Boolean,},{
        timestamps:true,
        versionKey:false
     
});

module.exports=model('blog', blogSchema);