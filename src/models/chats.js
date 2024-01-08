const {Schema, model} = require('mongoose');

const imagSchema= new Schema({
    numero:{
        type:String,
        required:true,
        unique:false,
        trim:true
           },
    chat:[{

    fecha:{
        type:String,
        required:true,
        unique:false,
    },
    mensaje:{
        type:String,
        required:true,
        unique:false,
    },
    }],
   

     done: Boolean,},{
        timestamps:true,
        versionKey:false
     
});

module.exports=model('chat', imagSchema);