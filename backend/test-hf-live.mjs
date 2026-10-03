import dotenv from 'dotenv';
dotenv.config();

const token = process.env.HF_API_TOKEN;

async function testRouterEndpoint(model) {
  console.log(`\nTesting https://router.huggingface.co/hf-inference/models/${model} ...`);
  try {
    const res = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: 'Say hello in one word:',
        parameters: { max_new_tokens: 10 },
      }),
    });
    const data = await res.json();
    console.log('HTTP Status:', res.status);
    console.log('Response   :', JSON.stringify(data));
  } catch (err) {
    console.log('Error:', err.message);
  }
}

async function run() {
  await testRouterEndpoint('gpt2');
  await testRouterEndpoint('HuggingFaceH4/zephyr-7b-beta');
  await testRouterEndpoint('mistralai/Mistral-7B-Instruct-v0.3');
  await testRouterEndpoint('Qwen/Qwen2.5-7B-Instruct');
}

run();

