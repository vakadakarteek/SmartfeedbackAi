import dotenv from 'dotenv';
dotenv.config();
import { HfInference } from '@huggingface/inference';

const token = process.env.HF_API_TOKEN;
const hf = new HfInference(token);

const candidates = [
  'meta-llama/Llama-3.2-1B-Instruct',
  'meta-llama/Llama-3.2-3B-Instruct',
  'Qwen/Qwen2.5-Coder-7B-Instruct',
  'Qwen/Qwen2.5-7B-Instruct',
  'HuggingFaceH4/zephyr-7b-beta',
  'google/gemma-2-2b-it',
  'mistralai/Mistral-7B-Instruct-v0.2',
  'microsoft/Phi-3-mini-4k-instruct',
];

async function checkModel(model) {
  try {
    const res = await hf.chatCompletion({
      model,
      messages: [{ role: 'user', content: 'Say hello' }],
      max_tokens: 10,
    });
    console.log(`[SUCCESS] ${model}:`, res.choices[0]?.message?.content);
    return true;
  } catch (err) {
    console.log(`[FAILED] ${model}:`, err.message.substring(0, 100));
    return false;
  }
}

async function run() {
  console.log('Testing candidates with token:', token.substring(0, 8) + '...');
  for (const m of candidates) {
    const ok = await checkModel(m);
    if (ok) {
      console.log(`\n>>> FOUND WORKING MODEL: ${m} <<<\n`);
      break;
    }
  }
}

run();
