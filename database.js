const { connect }=require('mongoose');


(async() => {
    

     try{


    //  const db =await connect( "mongodb://mongo:fweEbYTfnZTEU5gjnM0Q@containers-us-west-141.railway.app:7794");

<<<<<<< HEAD
        const db =await connect("mongodb+srv://root:RDfsOJl2BswZENNU@test.az9xpdx.mongodb.net/?retryWrites=true&w=majority");
  
   //const db =await connect("mongodb://localhost/usuarios");
=======
         const db =await connect("mongodb+srv://root:RDfsOJl2BswZENNU@test.az9xpdx.mongodb.net/?retryWrites=true&w=majority");
  
  // const db =await connect("mongodb://localhost/usuarios");
>>>>>>> 7147102123de9d39a0e0898777625f1a3218665f

       console.log("db conected");
      
       

     }catch(error){
       console.error(error);

        
     }
})()