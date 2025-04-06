const fs = require('fs');
const Papa = require('papaparse');
const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');

const RUTA_MODELO = 'file://./modelo_entrenado/';
const RUTA_CSV = 'src/datasets/dataset.csv';
const RUTA_VOCAB = './modelo_entrenado/vocab.json';
const MAX_LEN = 20;

let palabraAIndice = {};
let indiceAPalabra = {};
const stopwords = new Set(["de", "la", "el", "en", "y", "a", "un", "una", "con", "por", "para", "que", "su", "se", "lo", "como", "al", "es"]); // Puedes ampliarlo
// 🔹 Cargar vocabulario si existe
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

// 🔹 Cargar CSV
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

// 🔹 Preprocesamiento de datos
async function preprocesarDatos() {
    const datos = await cargarDatosCSV(RUTA_CSV);
    const tokenizer = new natural.WordTokenizer();
    const vocabulario = new Set();

    const datosFiltrados = datos
        .filter(d => typeof d.pregunta === "string" && typeof d.respuesta === "string")
        .map(d => ({
            pregunta: limpiarTexto(d.pregunta),
            respuesta: limpiarTexto(d.respuesta)
        }))
        .filter(d => d.pregunta.length > 2 && d.respuesta.length > 2);

    // Construcción del vocabulario
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
    fs.writeFileSync(RUTA_VOCAB, JSON.stringify({ palabraAIndice, indiceAPalabra }, null, 2));
    console.log("✅ Vocabulario actualizado y guardado.");

    const vocabSize = Object.keys(palabraAIndice).length + 1;
    console.log("📌 Tamaño del vocabulario:", vocabSize);

    function textoATensor(texto) {
        if (typeof texto !== "string") return new Array(MAX_LEN).fill(0);
        let secuencia = tokenizer.tokenize(texto).map(word => palabraAIndice[word] || 0);
        while (secuencia.length < MAX_LEN) secuencia.push(0);
        return secuencia.slice(0, MAX_LEN);
    }

    function oneHotEncoding(indices) {
        return indices.map(idx => {
            let vector = new Array(vocabSize).fill(0);
            if (idx > 0 && idx < vocabSize) vector[idx] = 1;
            return vector;
        }).concat(new Array(MAX_LEN - indices.length).fill(new Array(vocabSize).fill(0))).slice(0, MAX_LEN);
    }

    const preguntas = tf.tensor2d(
        datosFiltrados.map(d => textoATensor(d.pregunta)), 
        [datosFiltrados.length, MAX_LEN]
    );

    const respuestasOneHot = datosFiltrados.map(d => oneHotEncoding(textoATensor(d.respuesta)));
    function limpiarTexto(texto) {
        return texto
            .toLowerCase() // Convertir a minúsculas
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
            .replace(/[^\w\s]/g, "") // Eliminar puntuación
            .replace(/\s+/g, ' ')   
            .split(" ") // Separar palabras
            .filter(word => !stopwords.has(word)) // Eliminar stopwords
            .join(" "); // Volver a unir
    }
    // ✅ Verificar dimensiones antes de crear el tensor
    console.log("📊 Dimensiones preguntas:", preguntas.shape);
    console.log("📊 Dimensiones respuestas antes de tensor:", respuestasOneHot.length, respuestasOneHot[0]?.length);

    const respuestasTensor = tf.tensor3d(
        respuestasOneHot, 
        [datosFiltrados.length, MAX_LEN, vocabSize]
    );
   /* const respuestasIdx = datosFiltrados.map(d => textoATensor(d.respuesta));

const respuestasTensor = tf.tensor2d(
    respuestasIdx,
    [datosFiltrados.length, MAX_LEN]
);
*/
    console.log("📊 Dimensiones respuestas después de tensor:", respuestasTensor.shape);

    return { preguntas, respuestasTensor, vocabSize };
}

// 🔹 Construcción del modelo
function construirModelo(vocabSize) {
    const modelo = tf.sequential();

// Capa de embedding
modelo.add(tf.layers.embedding({ inputDim: vocabSize, outputDim: 128, inputLength: MAX_LEN }));

// Capa LSTM bidireccional
modelo.add(tf.layers.bidirectional({ 
    layer: tf.layers.lstm({ units: 256, returnSequences: true }), // <- true para usar atención
    mergeMode: 'concat'
}));
modelo.add(tf.layers.batchNormalization());
modelo.add(tf.layers.dropout({ rate: 0.4 }));

// --- Simulación de capa de atención ---
modelo.add(tf.layers.dense({ units: 1, activation: 'tanh' }));
modelo.add(tf.layers.flatten());
modelo.add(tf.layers.activation({ activation: 'softmax' }));
modelo.add(tf.layers.repeatVector({ n: 512 })); // 256 * 2 (por bidireccional)
modelo.add(tf.layers.permute({ dims: [2, 1] })); // ajustar dimensiones
// --------------------------------------

// Segunda capa LSTM
modelo.add(tf.layers.lstm({ units: 128, returnSequences: true }));
modelo.add(tf.layers.batchNormalization());
modelo.add(tf.layers.dropout({ rate: 0.5 }));

// Capa densa con activación ReLU
modelo.add(tf.layers.dense({ units: 128, activation: 'relu' }));
modelo.add(tf.layers.batchNormalization());
modelo.add(tf.layers.dropout({ rate: 0.5 }));

// Capa de salida
modelo.add(tf.layers.dense({ units: vocabSize, activation: 'softmax' }));

// Compilar el modelo
modelo.compile({ 
    optimizer: tf.train.adam({ learningRate: 0.0005, beta1: 0.9, beta2: 0.98, epsilon: 1e-8 }), 
    loss: 'categoricalCrossentropy', 
    metrics: ['accuracy'] })
    /*

   const modelo = tf.sequential();
   
    modelo.add(tf.layers.embedding({ inputDim: vocabSize, outputDim: 64, inputLength: MAX_LEN }));
    modelo.add(tf.layers.bidirectional({ 
        layer: tf.layers.lstm({ units: 128, returnSequences: true }),
        mergeMode: 'concat'
    }));
    modelo.add(tf.layers.dropout({ rate: 0.4 }));
    modelo.add(tf.layers.lstm({ units: 128, returnSequences: true }));
    modelo.add(tf.layers.dropout({ rate: 0.4 }));
    modelo.add(tf.layers.dense({ units: 1287, activation: 'relu' }));
    modelo.add(tf.layers.batchNormalization());
    modelo.add(tf.layers.dropout({ rate: 0.4 }));
    modelo.add(tf.layers.timeDistributed(tf.layers.dense({ units: vocabSize, activation: 'softmax' })));


    modelo.build([null, MAX_LEN]);

    modelo.compile({
        optimizer: tf.train.adam(0.0005),
        loss: 'sparseCategoricalCrossentropy',
        metrics: ['accuracy']
    });
    
*/
/*
const modelo = tf.sequential();

// Capa de embedding
modelo.add(tf.layers.embedding({ inputDim: vocabSize, outputDim: 64, inputLength: MAX_LEN }));

// Capa LSTM bidireccional
modelo.add(tf.layers.bidirectional({ 
    layer: tf.layers.lstm({ units: 128, returnSequences: true, kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })  }), // <- true para usar atención
    mergeMode: 'concat'
}));
modelo.add(tf.layers.batchNormalization());
modelo.add(tf.layers.dropout({ rate: 0.2 }));

// --- Simulación de capa de atención ---
modelo.add(tf.layers.dense({ units: 1, activation: 'tanh' }));
modelo.add(tf.layers.flatten());
modelo.add(tf.layers.activation({ activation: 'softmax' }));
modelo.add(tf.layers.repeatVector({ n: 512 })); // 256 * 2 (por bidireccional)
modelo.add(tf.layers.permute({ dims: [2, 1] })); // ajustar dimensiones
// --------------------------------------

// Segunda capa LSTM
modelo.add(tf.layers.lstm({ units: 128, returnSequences: true, kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })  }));
modelo.add(tf.layers.batchNormalization());
modelo.add(tf.layers.dropout({ rate: 0.2 }));

// Capa densa con activación ReLU
modelo.add(tf.layers.dense({ units: 128, activation: 'relu' }));
modelo.add(tf.layers.batchNormalization());
modelo.add(tf.layers.dropout({ rate: 0.2}));

// Capa de salida
modelo.add(tf.layers.dense({ units: vocabSize, activation: 'softmax' }));

// Compilar el modelo
modelo.compile({ optimizer: tf.train.adam(0.0005), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

*/
    return modelo;
}

// 🔹 Entrenar el modelo
async function entrenarModelo() {
    console.log("Cargando datos...");
    const { preguntas, respuestasTensor, vocabSize } = await preprocesarDatos();

    console.log("Construyendo modelo...");
    const modelo = construirModelo(vocabSize);

    console.log("Entrenando modelo...");
    const batchSize = Math.min(32, Math.floor(preguntas.shape[0] / 10));
    await modelo.fit(preguntas, respuestasTensor, { epochs: 100, batchSize });

    console.log("Guardando modelo...");
    await modelo.save(RUTA_MODELO);

    fs.writeFileSync(RUTA_VOCAB, JSON.stringify({ palabraAIndice, indiceAPalabra }, null, 2));
    console.log(`✅ Vocabulario guardado en ${RUTA_VOCAB}`);

    return modelo;
}

// 🔹 Continuar entrenamiento
async function continuarEntrenamiento() {
    cargarVocabulario();
    
    if (!fs.existsSync("./modelo_entrenado/model.json")) {
        console.log("⚠️ No se encontró un modelo previo. Se entrenará uno nuevo.");
        return await entrenarModelo();
    }

    console.log("🔄 Cargando modelo entrenado...");
    const modelo = await tf.loadLayersModel("file://./modelo_entrenado/model.json");


    // 💡 Recompilar antes de continuar el entrenamiento
    modelo.compile({ optimizer: tf.train.adam(0.0003), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

    console.log("📥 Cargando nuevos datos...");
    const { preguntas, respuestasTensor } = await preprocesarDatos();

    console.log("🚀 Continuando entrenamiento...");
    const batchSize = Math.min(256, Math.floor(preguntas.shape[0] / 10));
    await modelo.fit(preguntas, respuestasTensor, {
        epochs: 50,
        batchSize
     
    });

    console.log("💾 Guardando modelo actualizado...");
    await modelo.save("file://modelo_entrenado");
    console.log("✅ Guardando vocabulario actualizado...");
    fs.writeFileSync(RUTA_VOCAB, JSON.stringify({ palabraAIndice, indiceAPalabra }, null, 2));
    console.log("✅ Vocabulario guardado en", RUTA_VOCAB);

    return modelo;
}
function sampleWithTemperature(predictions, temperature = 1.0) {
    predictions = predictions.map(p => Math.pow(p, 1 / temperature));
    const sum = predictions.reduce((a, b) => a + b, 0);
    const probabilities = predictions.map(p => p / sum);

    let rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < probabilities.length; i++) {
        cumulative += probabilities[i];
        if (rand < cumulative) return i;
    }
    return probabilities.length - 1;
}

// 🔹 Función para responder preguntas
async function responder(pregunta, modelo, temperature = 0.7) {
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
    prediccion.dispose(); // Liberar memoria

    let respuestaGenerada = [];
    for (let i = 0; i < MAX_LEN; i++) {
        const indicePalabra = sampleWithTemperature(arrayPrediccion[0][i], temperature);
        if (indicePalabra > 0) respuestaGenerada.push(indiceAPalabra[indicePalabra]);
    }

    return respuestaGenerada.join(" ") || "No entendí, intenta de nuevo.";
}

// 🔹 Función principal
async function iniciar() {
    const modelo = await continuarEntrenamiento();
    const respuesta = await responder("que es cctv", modelo);
    console.log("Respuesta:", respuesta);
}
iniciar()

module.exports = iniciar;
