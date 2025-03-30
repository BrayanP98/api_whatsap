const use = require('@tensorflow-models/universal-sentence-encoder');
const tf = require('@tensorflow/tfjs-node');

let model;

// Cargar el modelo una vez
async function loadModel() {
    if (!model) {
        console.log("🔄 Cargando modelo USE...");
        model = await use.load();
        console.log("✅ Modelo USE cargado.");
    }
    return model;
}

// Obtener embedding del mensaje
async function getEmbedding(text) {
    const model = await loadModel();
    const embeddings = await model.embed([text]);
    return embeddings.arraySync()[0]; // Retorna solo el vector del mensaje
}

module.exports = { getEmbedding };
