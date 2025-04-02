const fs = require('fs');
const Papa = require('papaparse');
const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');

const RUTA_MODELO = 'file://./modelo_entrenado';
const RUTA_CSV = 'src/datasets/dataset.csv';
const RUTA_VOCAB = './modelo_entrenado/vocab.json';
const MAX_LEN = 10;

let palabraAIndice = {};
let indiceAPalabra = {};

// Función para cargar `vocab.json`
function cargarVocabulario() {
    if (fs.existsSync(RUTA_VOCAB)) {
        const vocabData = JSON.parse(fs.readFileSync(RUTA_VOCAB, 'utf8'));
        palabraAIndice = vocabData.palabraAIndice;
        indiceAPalabra = vocabData.indiceAPalabra;
        console.log("✅ Vocabulario cargado.");
    } else {
        console.warn("⚠️ No se encontró vocab.json. Se generará uno nuevo después del entrenamiento.");
    }
}

// Función para cargar el CSV
function cargarDatosCSV(rutaArchivo) {
    const contenido = fs.readFileSync(rutaArchivo, 'utf8');
    return new Promise((resolve) => {
        Papa.parse(contenido, {
            header: true,
            dynamicTyping: true,
            complete: (resultado) => resolve(resultado.data),
        });
    });
}

// Función para preprocesar datos
async function preprocesarDatos() {
    const datos = await cargarDatosCSV(RUTA_CSV);
    const tokenizer = new natural.WordTokenizer();
    const vocabulario = new Set();

    const datosFiltrados = datos.filter(d => typeof d.pregunta === "string" && typeof d.respuesta === "string");

    datosFiltrados.forEach(({ pregunta, respuesta }) => {
        tokenizer.tokenize(pregunta).forEach(word => vocabulario.add(word));
        tokenizer.tokenize(respuesta).forEach(word => vocabulario.add(word));
    });

    palabraAIndice = {};
    indiceAPalabra = {};
    Array.from(vocabulario).forEach((word, index) => {
        palabraAIndice[word] = index + 1;
        indiceAPalabra[index + 1] = word;
    });

    function textoATensor(texto) {
        if (typeof texto !== "string") return new Array(MAX_LEN).fill(0);
        let secuencia = tokenizer.tokenize(texto).map(word => palabraAIndice[word] || 0);
        while (secuencia.length < MAX_LEN) secuencia.push(0);
        return secuencia.slice(0, MAX_LEN);
    }

    function oneHotEncoding(indices, vocabSize) {
        return indices.map(idx => {
            let vector = new Array(vocabSize).fill(0);
            if (idx > 0) vector[idx] = 1;
            return vector;
        });
    }

    const preguntas = tf.tensor2d(datosFiltrados.map(d => textoATensor(d.pregunta)), [datosFiltrados.length, MAX_LEN]);
    const respuestasIndices = datosFiltrados.map(d => textoATensor(d.respuesta));
    const respuestasOneHot = respuestasIndices.map(seq => oneHotEncoding(seq, vocabulario.size + 1));
    const respuestasTensor = tf.tensor3d(respuestasOneHot, [datosFiltrados.length, MAX_LEN, vocabulario.size + 1]);

    return { preguntas, respuestasTensor, vocabulario };
}

// Función para construir el modelo
function construirModelo(vocabSize) {
    const modelo = tf.sequential();
    modelo.add(tf.layers.embedding({ inputDim: vocabSize, outputDim: 128, inputLength: MAX_LEN }));
    modelo.add(tf.layers.lstm({ units: 1024, returnSequences: true }));
    modelo.add(tf.layers.dropout({ rate: 0.5 }));
    modelo.add(tf.layers.lstm({ units: 1024, returnSequences: true }));
    modelo.add(tf.layers.dropout({ rate: 0.5 }));
    modelo.add(tf.layers.dense({ units: vocabSize, activation: 'softmax' }));

    modelo.compile({ optimizer: tf.train.adam(0.0005), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

    return modelo;
}

// Función para entrenar y guardar el modelo
async function entrenarModelo() {
    console.log("Cargando datos...");
    const { preguntas, respuestasTensor, vocabulario } = await preprocesarDatos();

    console.log("Construyendo modelo...");
    const modelo = construirModelo(vocabulario.size + 1);

    console.log("Entrenando modelo...");
    await modelo.fit(preguntas, respuestasTensor, { epochs: 150, batchSize: 6});

    console.log("Guardando modelo...");
    await modelo.save(RUTA_MODELO);

    console.log("✅ Modelo guardado en ./modelo_entrenado");

    // Guardar el vocabulario después del entrenamiento
    fs.writeFileSync(RUTA_VOCAB, JSON.stringify({ palabraAIndice, indiceAPalabra }, null, 2));
    console.log(`✅ Vocabulario guardado en ${RUTA_VOCAB}`);

    return modelo;
}

// Función para obtener el modelo (cargar o entrenar)
async function obtenerModelo() {
    console.log("🔄 Entrenando modelo...");
    return await entrenarModelo(); // Siempre entrena, sin importar si existe el modelo
}

// Función para responder preguntas
async function responder(pregunta, modelo) {
    function textoATensor(texto) {
        const tokenizer = new natural.WordTokenizer();
        if (typeof texto !== "string") return new Array(MAX_LEN).fill(0);
        let secuencia = tokenizer.tokenize(texto).map(word => palabraAIndice[word] || 0);
        while (secuencia.length < MAX_LEN) secuencia.push(0);
        return secuencia.slice(0, MAX_LEN);
    }

    const tensorPregunta = tf.tensor2d([textoATensor(pregunta)], [1, MAX_LEN]);
    const prediccion = modelo.predict(tensorPregunta);
    const arrayPrediccion = await prediccion.array();

    let respuestaGenerada = [];
    for (let i = 0; i < MAX_LEN; i++) {
        const indicePalabra = arrayPrediccion[0][i].indexOf(Math.max(...arrayPrediccion[0][i]));
        if (indicePalabra > 0) respuestaGenerada.push(indiceAPalabra[indicePalabra]);
    }

    return respuestaGenerada.length > 0 ? respuestaGenerada.join(" ") : "Lo siento, no entendí. ¿Puedes reformular la pregunta?";
}

// Función principal
async function iniciar() {
    const modelo = await obtenerModelo();
    
    const respuesta = await responder("que es cctv", modelo);
    console.log("Respuesta:", respuesta);
}


async function iniciarEntrenamientoDiario() {
   
   // await entrenarModelo(); // Entrenar al inicio
    setInterval(async () => {
        console.log("🔄 Entrenamiento automático cada 24 horas...");
        await entrenarModelo();
    }, 8 * 60 * 60 * 1000);
}
//iniciar()
iniciarEntrenamientoDiario();