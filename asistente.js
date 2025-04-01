const fs = require('fs');
const Papa = require('papaparse');
const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');

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

// Inicializar chatbot
async function iniciar() {
    const datos = await cargarDatosCSV('src/datasets/dataset.csv');

    const tokenizer = new natural.WordTokenizer();
    const vocabulario = new Set();
    const maxLen = 10;

    // Filtrar datos válidos
    const datosFiltrados = datos.filter(d => typeof d.pregunta === "string" && typeof d.respuesta === "string");

    datosFiltrados.forEach(({ pregunta, respuesta }) => {
        tokenizer.tokenize(pregunta).forEach(word => vocabulario.add(word));
        tokenizer.tokenize(respuesta).forEach(word => vocabulario.add(word));
    });

    const palabraAIndice = {};
    const indiceAPalabra = {};
    Array.from(vocabulario).forEach((word, index) => {
        palabraAIndice[word] = index + 1;
        indiceAPalabra[index + 1] = word;
    });

    function textoATensor(texto) {
        if (typeof texto !== "string") return new Array(maxLen).fill(0);
        let secuencia = tokenizer.tokenize(texto).map(word => palabraAIndice[word] || 0);
        while (secuencia.length < maxLen) secuencia.push(0);
        return secuencia.slice(0, maxLen);
    }

    function oneHotEncoding(indices, vocabSize) {
        return indices.map(idx => {
            let vector = new Array(vocabSize).fill(0);
            if (idx > 0) vector[idx] = 1;
            return vector;
        });
    }

    const preguntas = tf.tensor2d(datosFiltrados.map(d => textoATensor(d.pregunta)), [datosFiltrados.length, maxLen]);

    const respuestasIndices = datosFiltrados.map(d => textoATensor(d.respuesta));
    const respuestasOneHot = respuestasIndices.map(seq => oneHotEncoding(seq, vocabulario.size + 1));
    const respuestasTensor = tf.tensor3d(respuestasOneHot, [datosFiltrados.length, maxLen, vocabulario.size + 1]);

    const modelo = tf.sequential();
    modelo.add(tf.layers.embedding({ inputDim: vocabulario.size + 1, outputDim: 64, inputLength: maxLen }));
    modelo.add(tf.layers.lstm({ units: 512, returnSequences: true }));
    modelo.add(tf.layers.dropout({ rate: 0.5 })); // Mayor dropout para evitar overfitting
    modelo.add(tf.layers.lstm({ units: 512, returnSequences: true }));
    modelo.add(tf.layers.dropout({ rate: 0.5 })); // Mayor dropout para evitar overfitting
    modelo.add(tf.layers.dense({ units: vocabulario.size + 1, activation: 'softmax' }));

    modelo.compile({ optimizer: tf.train.adam(0.0005), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

    console.log("Entrenando...");
    await modelo.fit(preguntas, respuestasTensor, { epochs: 150, batchSize: 4 });
    console.log("Entrenamiento finalizado.");

    // Definir la función responder
    async function responder(pregunta) {
        const tensorPregunta = tf.tensor2d([textoATensor(pregunta)], [1, maxLen]);
        const prediccion = modelo.predict(tensorPregunta);
        const arrayPrediccion = await prediccion.array();

        let respuestaGenerada = [];
        for (let i = 0; i < maxLen; i++) {
            const indicePalabra = arrayPrediccion[0][i].indexOf(Math.max(...arrayPrediccion[0][i]));
            if (indicePalabra > 0) respuestaGenerada.push(indiceAPalabra[indicePalabra]);
        }

        return respuestaGenerada.join(" ") || "Lo siento, no entendí. ¿Puedes reformular la pregunta?";
    }

    // Exportar la función responder
    module.exports = { responder };
}

iniciar();
