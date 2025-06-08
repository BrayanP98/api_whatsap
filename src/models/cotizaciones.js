const {Schema, model} = require('mongoose');

const imagSchema= new Schema({
   nombre:{
        type:String,
        required:true,
        unique:false,
        trim:true
           },
        cedula:{
            type:String,
            required:false,
            unique:false,
            trim:true
               },   
       telefono:{
         type:String,
         required:false,
         unique:false,
         trim:true
                   },
     direccion:{
       type:String,
       required:false,
       unique:false,
        trim:true
          },
    documents:[{

      
           

   
    }],
   

     done: Boolean,},{
        timestamps:true,
        versionKey:false
     
});

module.exports=model('cotizacion', imagSchema);