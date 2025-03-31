
function crearMenu(){
    
    var header=document.createElement("header")
    var menu=document.createElement("div")
    menu.id="menu"


    var desplegar=document.createElement("div")
    desplegar.id="desplegable"
    var menu_logo=document.createElement("img")
    menu_logo.id="logo"
    menu_logo.setAttribute("src","/img/logo1.png")

    var menu_title=document.createElement("a")
    menu_title.id="titulo"
    menu_title.setAttribute("href","/")
    
    var tile_sas=document.createElement("a")
    tile_sas.id="sas"
  
    var buton_back=document.createElement("a")
    buton_back.id="btn_desplegar"
    buton_back.setAttribute("href","/")
    buton_back.innerHTML="<box-icon name='arrow-back' color='white'></box-icon>"
    var menu_phone=document.createElement("a")
    menu_phone.id="phone"
    var menu_help=document.createElement("a")
    menu_phone.innerHTML="3147459094"
    menu_phone.setAttribute("href","tel:+573147459094")
    menu_help.id="ayuda"
    menu_help.innerHTML="Ayuda"
    menu_help.setAttribute("href","/")

    desplegar.appendChild(menu_logo)
    desplegar.appendChild(menu_title)
   
    desplegar.appendChild(buton_back)
    desplegar.appendChild(menu_phone)
    desplegar.appendChild(menu_help)
    menu.appendChild(desplegar)
    header.appendChild(menu)
    


document.body.prepend(header)

}

crearMenu()

var pdf_buton=document.getElementById("pdf");
pdf_buton.onclick=function(){
    var logo_url = "img/infograma.jpeg";
    getImgFromUrl(logo_url, function (img) {
        generatePDF(img);
    });
}
 

      function getImgFromUrl(logo_url, callback) {
        var img = new Image();
        img.src = logo_url;
        img.onload = function () {
            callback(img);
        };
    }
    function generatePDF(img){
        
       
        var doc = new jsPDF('p', 'mm', 'a3');
        doc.addImage(img, 'JPEG', 30, 30, 220, 350);
    doc.save('Infograma_AHSolutions_.pdf')}




    /*var myState = {
        pdf: null,
        currentPage: 1,
        zoom: 1
    }
    pdfjsLib.getDocument('./img/AUTOMATIC HOME SOLUTIONS- PORTAFOLIO.pdf').then((pdf) => {
        myState.pdf = pdf;
        render();
    });
    

    function render() {
        myState.pdf.getPage(myState.currentPage).then((page) => {
            var canvas = document.getElementById("pdf_renderer");
            var ctx = canvas.getContext('2d');
            var viewport = page.getViewport(myState.zoom);
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            page.render({
                canvasContext: ctx,
                viewport: viewport
            });
        });
    }
    document.getElementById('go_previous')
        .addEventListener('click', (e) => {
            if(myState.pdf == null
               || myState.currentPage == 1) return;
            myState.currentPage -= 1;
            document.getElementById("current_page")
                    .value = myState.currentPage;
            render();
        });
        document.getElementById('go_next')
        .addEventListener('click', (e) => {
            if(myState.pdf == null 
               || myState.currentPage > myState.pdf
                                               ._pdfInfo.numPages) 
               return;
        
            myState.currentPage += 1;
            document.getElementById("current_page")
                    .value = myState.currentPage;
            render();
        });
        document.getElementById('zoom_in')
        .addEventListener('click', (e) => {
            if(myState.pdf == null) return;
            myState.zoom += 0.5;
            render();
        });
        document.getElementById('zoom_out')
        .addEventListener('click', (e) => {
            if(myState.pdf == null) return;
            myState.zoom -= 0.5;
            render();
        });

    */