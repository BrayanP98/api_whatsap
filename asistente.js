const { pipeline } = require('@huggingface/transformers');

// Crear el pipeline de generación de texto con GPT-2
const modeloGPT2 = pipeline('text-generation', 'gpt2');

// Función para generar respuesta
async function generarRespuesta(pregunta) {
  const respuesta = await modeloGPT2(pregunta);
  console.log("Respuesta generada:", respuesta[0].generated_text);
}

// Llamar a la función con una pregunta
generarRespuesta("¿Cómo estás?");
