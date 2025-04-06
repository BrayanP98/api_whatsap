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
        const datosValidacion = datosFiltrados.slice(0, 20);
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

    return { preguntas, respuestasTensor, vocabSize,datosValidacion };
}
async function preproceszarDatos() {
    const datos = await cargarDatosCSV(RUTA_CSV);
    const tokenizer = new natural.WordTokenizer();
    const vocabulario = new Set();

    // Filtramos y limpiamos los datos
    const datosFiltrados = datos
        .filter(d => typeof d.pregunta === "string" && typeof d.respuesta === "string")
        .map(d => ({
            pregunta: limpiarTexto(d.pregunta),
            respuesta: limpiarTexto(d.respuesta)
        }))
        .filter(d => d.pregunta.length > 2 && d.respuesta.length > 2);

    // Datos de validación
    const datosValidacion = datosFiltrados.slice(0, 20);

    // Añadimos tokens <start> y <end> al vocabulario
    datosFiltrados.forEach(({ pregunta, respuesta }) => {
        tokenizer.tokenize(pregunta).forEach(word => vocabulario.add(word));
        tokenizer.tokenize(respuesta).forEach(word => vocabulario.add(word));
    });

    // Agregar tokens especiales
    vocabulario.add("<start>");
    vocabulario.add("<end>");

    // Crear diccionarios de palabras a índices y viceversa
    const palabraAIndice = {};
    const indiceAPalabra = {};
    let idx = 1;
    vocabulario.forEach(palabra => {
        palabraAIndice[palabra] = idx;
        indiceAPalabra[idx] = palabra;
        idx++;
    });

    const vocabSize = vocabulario.size;
    console.log("📌 Tamaño del vocabulario:", vocabSize);

    // Función para convertir texto a índices
    function textoATensor(texto) {
        const tokens = texto.split(" ");
        const indices = tokens.map(p => palabraAIndice[p] || 0);  // Usa 0 para palabras desconocidas
        while (indices.length < MAX_LEN) indices.push(0);  // Rellenar con ceros hasta MAX_LEN
        return indices.slice(0, MAX_LEN);  // Limitar a MAX_LEN
    }

    // Convertir preguntas a tensor
    const preguntas = tf.tensor2d(
        datosFiltrados.map(d => textoATensor(d.pregunta)),
        [datosFiltrados.length, MAX_LEN]
    );

    // Convertir respuestas a índices en lugar de one-hot encoding
    const respuestasIdx = datosFiltrados.map(d => textoATensor(d.respuesta));

    // Convertir respuestas a tensor
    const respuestasTensor = tf.tensor2d(
        respuestasIdx, 
        [datosFiltrados.length, MAX_LEN]
    );

    console.log("📊 Dimensiones preguntas:", preguntas.shape);
    console.log("📊 Dimensiones respuestas:", respuestasTensor.shape);

    return { preguntas, respuestasTensor, vocabSize, datosValidacion };
}

function capaAtencionBahdanau(units) {
    const queryDense = tf.layers.dense({ units });
    const valuesDense = tf.layers.dense({ units });
    const scoreDense = tf.layers.dense({ units: 1 });

    return function (query, values) {
        // Expandimos dims para que las formas coincidan
        const queryWithTimeAxis = tf.expandDims(query, 1);

        const score = scoreDense.apply(tf.tanh(
            tf.add(queryDense.apply(queryWithTimeAxis), valuesDense.apply(values))
        ));

        const attentionWeights = tf.softmax(score, 1);
        const contextVector = tf.sum(tf.mul(attentionWeights, values), 1);

        return contextVector;
    };
}

// 🔹 Construcción del modelo
function construirModello(vocabSize) {
    const modelo = tf.sequential();

// Capa de embedding
modelo.add(tf.layers.embedding({ inputDim: vocabSize, outputDim: 64, inputLength: MAX_LEN }));

// Capa LSTM bidireccional
modelo.add(tf.layers.bidirectional({ 
    layer: tf.layers.lstm({ units: 256, returnSequences: true,recurrentDropout: 0.2 }), // <- true para usar atención
    mergeMode: 'concat'
}));
modelo.add(tf.layers.batchNormalization());
modelo.add(tf.layers.dropout({ rate: 0.3 }));


// --------------------------------------

// Segunda capa LSTM
modelo.add(tf.layers.lstm({ units: 128, returnSequences: true ,recurrentDropout: 0.2}));
modelo.add(tf.layers.batchNormalization());
modelo.add(tf.layers.dropout({ rate: 0.3 }));

// Capa densa con activación ReLU
modelo.add(tf.layers.dense({ units: 128, activation: 'relu' }));
modelo.add(tf.layers.batchNormalization());
modelo.add(tf.layers.dropout({ rate: 0.3 }));

// Capa de salida
const outputLayer = tf.layers.dense({
    units: vocabSize, // Tamaño del vocabulario
    activation: 'softmax'
  });

// Compilar el modelo
modelo.compile({
    optimizer: tf.train.adam( 0.0005, 0.9, 0.98, 1e-8),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
});
   
    return modelo;
}
function construirModelo(vocabSize) {
    const modelo = tf.sequential();

    modelo.add(tf.layers.embedding({
        inputDim: vocabSize,
        outputDim: 128,
        inputLength: MAX_LEN
    }));

    modelo.add(tf.layers.bidirectional({
        layer: tf.layers.lstm({
            units: 256,
            returnSequences: true,
            recurrentDropout: 0.2
        }),
        mergeMode: 'concat'
    }));

    modelo.add(tf.layers.batchNormalization());
    modelo.add(tf.layers.dropout({ rate: 0.5 }));

    modelo.add(tf.layers.lstm({
        units: 128,
        returnSequences: true,
        recurrentDropout: 0.2
    }));

    modelo.add(tf.layers.batchNormalization());
    modelo.add(tf.layers.dropout({ rate: 0.5 }));

    modelo.add(tf.layers.timeDistributed({
        layer: tf.layers.dense({ units: vocabSize, activation: 'softmax' })
      }));
      

    modelo.compile({
        optimizer: tf.train.adam( 0.0005, 0.9, 0.98, 1e-8),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });

    return modelo;
}


// 🔹 Entrenar el modelo
async function entrenarModelo() {
    console.log("Cargando datos...");
    const { preguntas, respuestasTensor, vocabSize } = await preprocesarDatos();

    console.log("Construyendo modelo...");
    const modelo = construirModelo(vocabSize);

    console.log("Entrenando modelo...");
    const batchSize = Math.min(256, Math.floor(preguntas.shape[0] / 10));
    await modelo.fit(preguntas, respuestasTensor, { epochs: 100, batchSize , callbacks: {
        onEpochEnd: async (epoch, logs) => {
            console.log(`📈 Epoch ${epoch + 1} - loss: ${logs.loss.toFixed(3)} - acc: ${logs.acc?.toFixed(3)}`);
        }
    }});

    console.log("Guardando modelo...");
    await modelo.save(RUTA_MODELO);

    fs.writeFileSync(RUTA_VOCAB, JSON.stringify({ palabraAIndice, indiceAPalabra }, null, 2));
    console.log('✅ Vocabulario guardado en ${RUTA_VOCAB}');

    return modelo;
}

// 🔹 Continuar entrenamiento



async function continuarEntrenamiento() {
    await cargarVocabulario();

    
    if (!fs.existsSync("./modelo_entrenado/model.json")) {
        console.log("⚠️ No se encontró un modelo previo. Se entrenará uno nuevo.");
        return await entrenarModelo();
    }

    console.log("🔄 Cargando modelo entrenado...");
    const modelo = await tf.loadLayersModel("file://./modelo_entrenado/model.json");


    // 💡 Recompilar antes de continuar el entrenamiento
    modelo.compile({ optimizer: tf.train.adam(0.0005, 0.9, 0.98, 1e-8, true, 1.0), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

    console.log("📥 Cargando nuevos datos...");
    const { preguntas, respuestasTensor, datosValidacion  } = await preprocesarDatos();

    console.log("🚀 Continuando entrenamiento...");
    const batchSize = Math.min(256, Math.floor(preguntas.shape[0] / 10));
    await modelo.fit(preguntas, respuestasTensor, {
        epochs: 100,
        batchSize,
        callbacks: {
            onEpochEnd: async (epoch, logs) => {
                console.log(`📈 Epoch ${epoch + 1} - loss: ${logs.loss.toFixed(3)} - acc: ${logs.acc?.toFixed(3)}`);
            }
        }
     
    });

    console.log("💾 Guardando modelo actualizado...");
    await modelo.save("file://modelo_entrenado");
    console.log("✅ Guardando vocabulario actualizado...");
    fs.writeFileSync(RUTA_VOCAB, JSON.stringify({ palabraAIndice, indiceAPalabra }, null, 2));
    console.log("✅ Vocabulario guardado en", RUTA_VOCAB);

    


    await evaluarBLEU(datosValidacion, modelo);


    return modelo;
}
function sampleWithTemperature(logits, temperature = 1.0) {
    if (temperature <= 0) {
        // Selección determinista (argmax) si temperatura es 0 o menor
        return logits.indexOf(Math.max(...logits));
    }

    // Convertimos los logits a una distribución de probabilidad
    const logitsScaled = logits.map(logit => logit / temperature);
    const maxLogit = Math.max(...logitsScaled);
    const exps = logitsScaled.map(logit => Math.exp(logit - maxLogit)); // estabilidad numérica
    const sumExps = exps.reduce((a, b) => a + b);
    const probs = exps.map(exp => exp / sumExps);

    // Muestreo por probabilidad acumulada
    const r = Math.random();
    let acum = 0;
    for (let i = 0; i < probs.length; i++) {
        acum += probs[i];
        if (r < acum) return i;
    }

    // Fallback
    return probs.length - 1;
}



///////////////////////////////////////////////////


function bleuScore(reference, candidate) {
    const refCounts = {};
    for (const word of reference) {
        refCounts[word] = (refCounts[word] || 0) + 1;
    }

    let overlap = 0;
    for (const word of candidate) {
        if (refCounts[word]) {
            overlap++;
            refCounts[word]--;
        }
    }

    const precision = overlap / candidate.length;
    const brevity = Math.min(1.0, candidate.length / reference.length);
    return precision * brevity;
}
 // O cualquier subconjunto que quieras evaluar

async function evaluarBLEU(dataset, modelo) {
    let totalScore = 0;
    let muestras = 0;

    for (const d of dataset) {
        const pregunta = d.pregunta;
        const referencia = d.respuesta.toLowerCase().split(" ");

        const respuesta = await responder(pregunta, modelo);
        const generada = respuesta.toLowerCase().split(" ");

        const score = bleuScore(referencia, generada);
        totalScore += score;
        muestras++;

        console.log(`\n🔹 Pregunta: ${pregunta}`);
        console.log(`🟢 Real:     ${d.respuesta}`);
        console.log(`🟣 Generada: ${respuesta}`);
        console.log(`🧮 BLEU: ${score.toFixed(3)}`);
    }

    const promedio = totalScore / muestras;
    console.log(`\n✨ BLEU Promedio: ${promedio.toFixed(4)}\n`);
}


async function responderl(pregunta, modelo, temperatura = 0.7) {
    const tokenizer = new natural.WordTokenizer();

function textoATensor(texto) {
    if (typeof texto !== "string") return new Array(MAX_LEN).fill(0);

    let secuencia = tokenizer.tokenize(texto.toLowerCase()).map(word => palabraAIndice[word] || 0);

    while (secuencia.length < MAX_LEN) secuencia.push(0);
    return secuencia.slice(0, MAX_LEN);
}


    let input = textoATensor(pregunta);
    let respuestaGenerada = [];

    for (let i = 0; i < MAX_LEN; i++) {
        const inputTensor = tf.tensor2d([input], [1, MAX_LEN]);
        const prediccion = modelo.predict(inputTensor);
        const arrayPrediccion = await prediccion.array();

        inputTensor.dispose();
        prediccion.dispose();

        // Usamos la posición i si es válida, o la última disponible
        const logits = arrayPrediccion[0][i] || arrayPrediccion[0][arrayPrediccion[0].length - 1];

        const indicePalabra = sampleWithTemperature(logits, temperatura);
        if (indicePalabra === 0) break;

        const palabra = indiceAPalabra[indicePalabra];
        if (!palabra || palabra === "<end>") break;

        respuestaGenerada.push(palabra);

        // Desplazamos la entrada como una cola: eliminamos el primero y añadimos el nuevo token generado
        input.shift();
        input.push(indicePalabra);
    }

    return respuestaGenerada.join(" ") || "No entendí, intenta de nuevo.";
}



// 🔹 Función para responder preguntas
// Función para convertir texto a tensor
const tokenizer = new natural.WordTokenizer();

function textoATensor(texto) {
    if (typeof texto !== "string") return new Array(MAX_LEN).fill(0);
    let secuencia = tokenizer.tokenize(texto).map(word => palabraAIndice[word] || 0);
    while (secuencia.length < MAX_LEN) secuencia.push(0);
    return secuencia.slice(0, MAX_LEN);
}

// Función para muestrear una palabra con temperatura
function sampleWithTemperature(probabilidades, temperature) {
    const logits = tf.div(probabilidades, temperature);
    const probabilidadesTemperatura = tf.softmax(logits);
    const distribucion = probabilidadesTemperatura.dataSync();
    const maxIndex = tf.argMax(probabilidadesTemperatura, -1).dataSync()[0];
    return maxIndex;
}

// Función para generar la respuesta
async function responder(pregunta, modelo, temperature = 0.7) {
    const tensorPregunta = tf.tensor2d([textoATensor(pregunta)], [1, MAX_LEN]);
    const prediccion = modelo.predict(tensorPregunta);
    const arrayPrediccion = await prediccion.array();

    tensorPregunta.dispose();
    prediccion.dispose();

    let respuestaGenerada = [];
    let palabraAnterior = "";

    for (let i = 0; i < MAX_LEN; i++) {
        const logits = arrayPrediccion[0][i];
        const indicePalabra = sampleWithTemperature(logits, temperature);
        
        if (indicePalabra === 0) break;

        const palabra = indiceAPalabra[indicePalabra];

        // Romper si es <end> o undefined
        if (!palabra || palabra === "<end>") break;

        // Evitar repeticiones consecutivas
        if (palabra === palabraAnterior) continue;

        respuestaGenerada.push(palabra);
        palabraAnterior = palabra;
    }

    return respuestaGenerada.join(" ") || "No entendí, intenta de nuevo.";
}



// 🔹 Función principal
async function iniciar() {
    
    const modelo = await continuarEntrenamiento();
    const respuesta = await responder("cuales son tus funciones", modelo);
    console.log("Respuesta:", respuesta);
}
iniciar()

module.exports = iniciar;