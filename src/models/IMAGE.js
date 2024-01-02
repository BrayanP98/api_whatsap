const {Schema, model} = require('mongoose');

const imagSchema= new Schema({
    cantidad:{
        type:String,
        required:true,
        unique:false,
        trim:true
           },
    categoria:{
        type:String,
        required:true,
        unique:false,
    },

     done: Boolean,},{
        timestamps:true,
        versionKey:false
     
});

module.exports=model('product', imagSchema);