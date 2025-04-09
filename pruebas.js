const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const csv = require('csv-parser');
const natural = require('natural');
const MAX_LONGITUD = 20;
const UNITS = 128;
const EPOCHS = 50;
const BATCH_SIZE = 12;
const RUTA_MODELO = 'file://./modelo_entrenado/';
const RUTA_CSV = 'src/datasets/dataset.csv';
const RUTA_VOCAB = './modelo_entrenado/vocab.json';
async function cargarDatos(RUTA_CSV) {
  const preguntas = [];
  const respuestas = [];

  return new Promise((resolve) => {
    fs.createReadStream(RUTA_CSV)
      .pipe(csv())
      .on('data', (row) => {
        const pregunta = limpiar(row.pregunta);
        const respuesta = ["<start>", ...limpiar(row.respuesta), "<end>"];
        preguntas.push(pregunta);
        respuestas.push(respuesta);
      })
      .on('end', () => {
        resolve({ preguntas, respuestas });
      });
  });
}

function limpiar(texto) {
  return texto.toLowerCase().replace(/[^a-záéíóúñü0-9 ]/gi, '').split(/\s+/);
}

function construirVocabulario(preguntas, respuestas) {
  const vocab = new Set(["<start>", "<end>"]);
  preguntas.concat(respuestas).forEach(tokens => tokens.forEach(t => vocab.add(t)));
  const palabraAIndice = {};
  const indiceAPalabra = {};
  Array.from(vocab).forEach((palabra, i) => {
    palabraAIndice[palabra] = i + 1;
    indiceAPalabra[i + 1] = palabra;
  });
  const vocabSize=vocab.size + 1
  return { palabraAIndice, indiceAPalabra, vocabSize };
}

function codificar(tokens, palabraAIndice) {
  const indices = tokens.map(t => palabraAIndice[t] || 0);
  if (indices.length < MAX_LONGITUD)
    return indices.concat(Array(MAX_LONGITUD - indices.length).fill(0));
  else
    return indices.slice(0, MAX_LONGITUD);
}
//////////////////
function construirModelo(tamanoVocabulario) {
  const encoderInputs = tf.input({ shape: [MAX_LONGITUD], dtype: 'int32' });

  const encoderEmbedding = tf.layers.embedding({
    inputDim: tamanoVocabulario,
    outputDim:64,
    maskZero: true
  }).apply(encoderInputs);
  
  const encoderLSTM = tf.layers.lstm({
    units: UNITS,
    returnState: true,
    dropout: 0.3,             // 🔥 Dropout para regularización
    recurrentDropout: 0.3     // 🔥 Dropout en conexiones recurrentes
  });
  
  const [_, stateH, stateC] = encoderLSTM.apply(encoderEmbedding);
  
  const decoderInputs = tf.input({ shape: [MAX_LONGITUD], dtype: 'int32' });
  
  const decoderEmbedding = tf.layers.embedding({
    inputDim: tamanoVocabulario,
    outputDim: 64,
    maskZero: true
  }).apply(decoderInputs);
  
  const decoderLSTM = tf.layers.lstm({
    units: UNITS,
    returnSequences: true,
    returnState: true,
    dropout: 0.3,
    recurrentDropout: 0.3
  });
  
  const [decoderOutputs] = decoderLSTM.apply(decoderEmbedding, {
    initialState: [stateH, stateC]
  });
  
  // 🔥 Puedes agregar una capa Dropout adicional aquí si ves que sigue sobreajustando
  const dropoutFinal = tf.layers.dropout({ rate: 0.3 }).apply(decoderOutputs);
  
  const decoderDense = tf.layers.dense({
    units: tamanoVocabulario,
    activation: 'softmax'
  });
  
  const decoderOutputsFinal = decoderDense.apply(dropoutFinal);
  
  const model = tf.model({
    inputs: [encoderInputs, decoderInputs],
    outputs: decoderOutputsFinal
  });
  
  model.compile({
    optimizer: tf.train.adam(0.0005, 0.9, 0.98, 1e-8, true, 1.0),
    loss: 'sparseCategoricalCrossentropy',
    metrics: ['accuracy']
  });
  

  return model;
}


function prepararDatos(preguntas, respuestas, palabraAIndice) {
  const encoderInputData = preguntas.map(p => codificar(p, palabraAIndice));
  const decoderInputData = respuestas.map(r => codificar(r.slice(0, -1), palabraAIndice)); // sin <end>
  const decoderTargetData = respuestas.map(r => codificar(r.slice(1), palabraAIndice));   // sin <start>

  const target3D = decoderTargetData.map(seq => seq.map(i => [i]));

  return {
    
    encoderInputData: tf.tensor2d(encoderInputData),
    decoderInputData: tf.tensor2d(decoderInputData),
    decoderTargetData: tf.tensor3d(target3D)
  };
}



const tokenizer = new natural.WordTokenizer();

// Función para limpiar y tokenizar el texto
function limpiar(texto) {
  return tokenizer.tokenize(
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Elimina acentos
      .replace(/[^a-z0-9\s]/g, "") // Elimina símbolos
  );
}


function textoATensor(texto,palabraAIndice) {
    if (typeof texto !== "string") return new Array(MAX_LONGITUD).fill(0);
    let secuencia = tokenizer.tokenize(texto).map(word => palabraAIndice[word] || 0);
    while (secuencia.length < MAX_LONGITUD) secuencia.push(0);
    return secuencia.slice(0, MAX_LONGITUD);
}

// Función para muestrear una palabra con temperatura
function sampleWithTemperature(logits, temperature = 1.0) {
  // Convertir a tensor
  const logitsTensor = tf.tensor1d(logits, 'float32');

  // Aplicar temperatura
  const scaledLogits = tf.div(logitsTensor, temperature);
  const softmax = tf.softmax(scaledLogits);
  const probs = softmax.dataSync();

  // Muestreo según distribución
  const sum = probs.reduce((a, b) => a + b);
  const rnd = Math.random() * sum;
  let acum = 0;

  for (let i = 0; i < probs.length; i++) {
    acum += probs[i];
    if (rnd < acum) {
      logitsTensor.dispose();
      softmax.dispose();
      return i;
    }
  }

  logitsTensor.dispose();
  softmax.dispose();
  return probs.length - 1; // fallback por si acaso
}


// Función para generar la respuesta
async function responder(pregunta, modelo, temperature = 0.5, palabraAIndice, indiceAPalabra) {
  const tensorPregunta = tf.tensor2d(
    [textoATensor(pregunta, palabraAIndice)], [1, MAX_LONGITUD], 'int32'
  );

  // Crear secuencia inicial para el decoder (con <start> y relleno)
  let decoderInput = tf.tensor2d([
    [...Array(MAX_LONGITUD).fill(0)]
  ], [1, MAX_LONGITUD], 'int32');

  decoderInput.bufferSync().set(palabraAIndice["<start>"], 0, 0);

  const prediccion = modelo.predict([tensorPregunta, decoderInput]);
  const arrayPrediccion = await prediccion.array();

  tensorPregunta.dispose();
  decoderInput.dispose();
  prediccion.dispose();

  let respuestaGenerada = [];
  let palabraAnterior = "";

  for (let i = 0; i < MAX_LONGITUD; i++) {
    const logits = arrayPrediccion[0][i];
    const indicePalabra = sampleWithTemperature(logits, temperature);
    
    const palabra = indiceAPalabra[indicePalabra];

    if (!palabra || palabra === "<end>") break;
    if (palabra === palabraAnterior) continue;

    respuestaGenerada.push(palabra);
    palabraAnterior = palabra;
  }

  return respuestaGenerada.join(" ") || "No entendí, intenta de nuevo.";
}


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

async function evaluarBLEU() {
  const { preguntas, respuestas } = await cargarDatos(RUTA_CSV);
  const modelo = await tf.loadLayersModel("file://modelo_entrenado/model.json");

  // Cargar vocabulario
  const vocab = JSON.parse(fs.readFileSync(RUTA_VOCAB));
  const palabraAIndice = vocab.palabraAIndice;
  const indiceAPalabra = vocab.indiceAPalabra;

  let totalScore = 0;
  let muestras = 0;

  for (let i = 0; i < preguntas.length; i++) {
    const pregunta = preguntas[i].join(" ");
    const referencia = respuestas[i].filter(p => p !== "<start>" && p !== "<end>"); // elimina tokens

    const respuesta = await responder(pregunta, modelo, 0.7, palabraAIndice, indiceAPalabra);
    const generada = respuesta.toLowerCase().split(" ");

    const score = bleuScore(referencia, generada);
    totalScore += score;
    muestras++;

    console.log(`\n🔹 Pregunta: ${pregunta}`);
    console.log(`🟢 Real:     ${referencia.join(" ")}`);
    console.log(`🟣 Generada: ${respuesta}`);
    console.log(`🧮 BLEU: ${score.toFixed(3)}`);
  }

  const promedio = totalScore / muestras;
  console.log(`\n✨ BLEU Promedio: ${promedio.toFixed(4)}\n`);
}




async function main() {
  const { preguntas, respuestas } = await cargarDatos(RUTA_CSV);
  const { palabraAIndice, indiceAPalabra, vocabSize } = construirVocabulario(preguntas, respuestas);
  const { encoderInputData, decoderInputData, decoderTargetData } = prepararDatos(preguntas, respuestas, palabraAIndice);
  const modelo = construirModelo(vocabSize);
  await modelo.fit([encoderInputData, decoderInputData], decoderTargetData, {
    epochs: 50,
    batchSize: BATCH_SIZE,
    validationSplit: 0.2,  // Usa el 20% de datos como validación

    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        console.log(
          `📈 Epoch ${epoch + 1} - loss: ${logs.loss?.toFixed(3) ?? '---'} - acc: ${logs.acc?.toFixed(3) ?? '---'} - val_acc: ${logs.val_acc?.toFixed(3) ?? '---'}- val_loss: ${logs.val_loss?.toFixed(3) ?? '---'}`
        );
        
      }
    }

  });
 

// Guardar vocabulario
fs.writeFileSync(RUTA_VOCAB, JSON.stringify({ palabraAIndice, indiceAPalabra }, null, 2));
console.log(`✅ Vocabulario guardado en ${RUTA_VOCAB}`);

// Guardar modelo
await modelo.save(RUTA_MODELO);
console.log(`✅ Modelo guardado en ${RUTA_MODELO}`);


  // Probar el modelo
  const preguntaTest = "cómo configuro la alarma";
  const respuesta = await responder("cómo configuro la alarma",modelo,0.7, palabraAIndice,indiceAPalabra);

  console.log(`Pregunta: ${preguntaTest}`);
  console.log(`Respuesta: ${respuesta}`);

  console.log(`Pregunta: ${preguntaTest}`);
  console.log(`Respuesta: ${respuesta}`);
}


async function continuarEntrenamiento() {
  
  const { preguntas, respuestas } = await cargarDatos(RUTA_CSV);
  const { palabraAIndice, indiceAPalabra, vocabSize } = construirVocabulario(preguntas, respuestas);
  const { encoderInputData, decoderInputData, decoderTargetData } = prepararDatos(preguntas, respuestas, palabraAIndice);

  if (!fs.existsSync("./modelo_entrenado/model.json")) {
    console.log("⚠️ No se encontró un modelo previo. Se entrenará uno nuevo.");
    return await main();
  }

  console.log("🔄 Cargando modelo entrenado...");
  const modelo = await tf.loadLayersModel("file://./modelo_entrenado/model.json");

  console.log("📥 Reconstruyendo vocabulario...");
  

  console.log("🧠 Preparando datos de entrenamiento...");
  //const { xs, ys } = prepararDatos(preguntas, respuestas, palabraAIndice);
  const batchSize = Math.min(256, Math.floor(preguntas.length / 10));

  // 🔧 Recompilamos el modelo con los parámetros correctos
  modelo.compile({optimizer: tf.train.adam(0.0005, 0.9, 0.98, 1e-8, true, 1.0), loss: 'sparseCategoricalCrossentropy', metrics: ['accuracy']
  });

  console.log("🚀 Continuando entrenamiento...");
  await modelo.fit([encoderInputData, decoderInputData], decoderTargetData, {
    epochs: 50,
    batchSize:BATCH_SIZE,
    validationSplit: 0.2,  // Usa el 20% de datos como validación
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
       `📈 Epoch ${epoch + 1} - loss: ${logs.loss?.toFixed(3) ?? '---'} - acc: ${logs.acc?.toFixed(3) ?? '---'} - val_acc: ${logs.val_acc?.toFixed(3) ?? '---'}- val_loss: ${logs.val_loss?.toFixed(3) ?? '---'}`
      }
    }
  });

  console.log("💾 Guardando modelo actualizado...");
  await modelo.save("file://modelo_entrenado");

  console.log("✅ Guardando vocabulario actualizado...");
  fs.writeFileSync(RUTA_VOCAB, JSON.stringify({ palabraAIndice, indiceAPalabra }, null, 2));
  console.log("✅ Vocabulario guardado en", RUTA_VOCAB);
  await evaluarBLEU()
  // Prueba rápida
  // Probar el modelo
  const preguntaTest = "cómo configuro la alarma";
  const respuesta = await responder("cómo configuro la alarma",modelo,0.7, palabraAIndice,indiceAPalabra);

  console.log(`Pregunta: ${preguntaTest}`);
  console.log(`Respuesta: ${respuesta}`);

}


async function iniciar() {
 //const rutaModelo = path.join(__dirname, 'modelo', 'modelo.json');
  //const rutaCSV = 'datos.csv';

  if (fs.existsSync('./modelo_entrenado/model.json')) {
    await continuarEntrenamiento();
  } else {
    await main();
  }
}
iniciar()
