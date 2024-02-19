const {Schema, model} = require('mongoose');

const imagSchema= new Schema({
    numero:{
        type:String,
        required:true,
        unique:false,
        trim:true
           },
    fecha:{
        type:String,
        required:true,
        unique:false,
        trim:true
           },
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
    products:[{

   
    }],
   

     done: Boolean,},{
        timestamps:true,
        versionKey:false
     
});

module.exports=model('cotizacion', imagSchema);