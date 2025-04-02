const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');
const fs = require('fs');

const MAX_LEN = 10;
const RUTA_MODELO = 'file://./modelo_entrenado';

let palabraAIndice = {};
let indiceAPalabra = {};
let modelo = null; // Almacenamos el modelo cargado

// Cargar el modelo entrenado
async function cargarModelo() {
    if (!fs.existsSync('./modelo_entrenado/model.json')) {
        console.log("⚠️ No se encontró un modelo guardado.");
        return null;
    }
    console.log("📥 Cargando modelo entrenado...");
    modelo = await tf.loadLayersModel(`${RUTA_MODELO}/model.json`);
    console.log("✅ Modelo cargado correctamente.");
    return modelo;
}

// Cargar el vocabulario
async function cargarVocabulario() {
    const vocabFile = './modelo_entrenado/vocab.json';

    if (fs.existsSync(vocabFile)) {
        const vocabData = JSON.parse(fs.readFileSync(vocabFile, 'utf8'));
        palabraAIndice = vocabData.palabraAIndice;
        indiceAPalabra = vocabData.indiceAPalabra;
        console.log("✅ Vocabulario cargado correctamente.");
    } else {
        console.log("⚠️ No se encontró vocabulario guardado. Asegúrate de entrenar y guardar vocab.json.");
    }
}

// Convertir texto a tensor
function textoATensor(texto) {
    const tokenizer = new natural.WordTokenizer();
    if (typeof texto !== "string") return new Array(MAX_LEN).fill(0);

    let secuencia = tokenizer.tokenize(texto).map(word => palabraAIndice[word] || 0);
    while (secuencia.length < MAX_LEN) secuencia.push(0);

    return secuencia.slice(0, MAX_LEN);
}

// Responder preguntas con el modelo cargado
async function responder(pregunta) {
    await cargarVocabulario();
    await cargarModelo();
    if (!modelo) {
        console.log("❌ No hay un modelo cargado. No se puede responder.");
        return "Error: No se ha cargado un modelo.";
    }

    const tensorPregunta = tf.tensor2d([textoATensor(pregunta)], [1, MAX_LEN]);
    const prediccion = modelo.predict(tensorPregunta);
    const arrayPrediccion = await prediccion.array();

    let respuestaGenerada = [];
    for (let i = 0; i < MAX_LEN; i++) {
        const indicePalabra = arrayPrediccion[0][i].indexOf(Math.max(...arrayPrediccion[0][i]));
        if (indicePalabra > 0) respuestaGenerada.push(indiceAPalabra[indicePalabra]);
    }

    return respuestaGenerada.length > 0 ? respuestaGenerada.join(" ") : "Lo siento, no entendí.";
}

// Inicializar y probar el chatbot
async function iniciar() {
    
    // Prueba con una pregunta
    const mensaje = "que es cctv";
    console.log(`📩 Pregunta: ${mensaje}`);
    const respuesta = await responder(mensaje);
    console.log(`🤖 Respuesta: ${respuesta}`);
}

iniciar();
