const {Schema, model} = require('mongoose');

const imagSchema= new Schema({
    nombre:{
        type:String,
        required:true,
        unique:false,
        trim:true
           },
    celular:{
        type:String,
        required:true,
        unique:false,
    },
    fechaPlat:{
        type:String,
        required:true,
        unique:false,
    },
    fechaPlan:{
        type:String,
        required:true,
        unique:false,
    },
    placa:{
        type:String,
        required:true,
        unique:false,
    },

     done: Boolean,},{
        timestamps:true,
        versionKey:false
     
});

module.exports=model('product', imagSchema);