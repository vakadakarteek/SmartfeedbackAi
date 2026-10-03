/**
 * AI Feedback Generation Service — Hugging Face Inference API
 *
 * Uses ONLY Hugging Face Inference API (@huggingface/inference)
 * Primary model: Qwen/Qwen2.5-7B-Instruct (provider: featherless-ai)
 */

import { HfInference } from '@huggingface/inference';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

// ─── Tone-aware mock bank (safety fallback) ────────────────────────────────

const MOCK_BANK = {
  Professional: [
    'The experience demonstrated a commendable level of organisation and subject expertise throughout.',
    'This engagement met professional expectations and delivered consistent, measurable value to participants.',
    'The overall quality of delivery reflected strong domain knowledge and clear preparation by the team.',
    'The initiative was executed with clarity, purpose, and professionalism at every stage of the process.',
    'Standards were upheld throughout, with careful attention to both content quality and participant communication.',
    'The session was conducted with a high degree of structure and fully delivered on its stated objectives.',
    'Professional handling of the subject matter ensured all participants could follow and apply the content.',
    'The team demonstrated well-prepared delivery and a thorough understanding of the material presented.',
    'Every aspect of the experience reflected deliberate planning and a professional approach to execution.',
    'The standard of delivery was appropriate for the audience and consistent with professional expectations.',
  ],
  Positive: [
    'This was an outstanding experience that exceeded expectations in every meaningful regard.',
    'The energy and enthusiasm throughout made this a genuinely enjoyable and productive engagement.',
    'Everything was handled with warmth, clarity, and a clear focus on delivering value to participants.',
    'The quality of content and delivery made this one of the most rewarding experiences in recent memory.',
    'From start to finish, the experience was engaging, informative, and thoroughly worthwhile.',
    'The session left participants feeling genuinely inspired and well-equipped to apply what was covered.',
    'An exceptionally well-run experience — the level of care and preparation was evident throughout.',
    'The positive atmosphere and high-quality content combined to create a truly memorable experience.',
    'This was exactly what was needed — relevant, engaging, and delivered with evident passion.',
    'The experience far exceeded initial expectations, both in content quality and overall delivery.',
  ],
  Neutral: [
    'The experience was adequate and met the stated objectives without any significant issues.',
    'The session covered the planned topics within the expected timeframe as outlined.',
    'Delivery was consistent and participants were provided with sufficient information throughout.',
    'The event proceeded as outlined, with standard coverage of the relevant subject areas.',
    'The programme was completed as scheduled with no notable deviations from the agenda.',
    'The content addressed the core topics and was delivered in a clear, straightforward manner.',
    'Participants received the required information and the session concluded within the planned time.',
    'The material was presented clearly and the objectives were met in a competent and organised manner.',
    'The experience accomplished what it set out to do without major issues or deviations.',
    'The session was conducted as planned with consistent and reliable delivery throughout.',
  ],
  Constructive: [
    'While the core content was valuable, dedicating additional time to practical exercises would improve retention.',
    'The material presented was relevant, though a more balanced pace would help participants absorb complex topics.',
    'A commendable effort overall; streamlining the opening segment would allow deeper coverage of advanced areas.',
    'The delivery was informative, though incorporating more interactive Q&A checkpoints would enhance engagement.',
    'Good structural foundation; providing prerequisite reading beforehand would help participants follow faster.',
    'The objectives were largely achieved, though clearer session transitions would make the progression smoother.',
    'The subject matter was strong, but more real-world case studies would help contextualise the theory.',
    'Valuable insights were shared; clearer visual aids and structured summary notes would add further value.',
    'The overall experience was useful, though hands-on components could be given higher priority over slides.',
    'A solid delivery that would benefit from more follow-up support resources and structured reference guides.',
  ],
  Casual: [
    'Really enjoyed this one — super well put together and easy to follow from start to finish.',
    'Great experience overall! The team kept things interesting and engaging throughout the whole session.',
    'Had a really good time with this. Everything ran smoothly and the practical bits were especially cool.',
    'Super practical, engaging, and definitely worth attending. Loved the conversational and open format.',
    'Really solid experience. Clear explanations, friendly delivery, and plenty of takeaways to use right away.',
    'Such a well-paced session — didn’t drag for a second and covered all the right stuff.',
    'Came away really happy with how it went. Good vibes, good content, and very well delivered.',
    'Loved the interactive parts of this. Easy to get involved and genuinely helpful throughout.',
    'Big thumbs up! Clear, relaxed, and packed with useful information without feeling overloaded.',
    'Really glad I participated. The team did a fantastic job making everything simple and straightforward.',
  ],
};

const TOPIC_FRAGMENTS = {
  workshop:  'The practical lab exercises helped reinforce concepts covered during the lecture.',
  product:   'The core features function smoothly and the user experience feels deliberate and clean.',
  support:   'The customer representative was knowledgeable, courteous, and resolved the inquiry promptly.',
  training:  'The syllabus covered timely concepts that participants can apply directly to ongoing work.',
  academic:  'The curriculum was well-organised and the instructors engaged with student questions effectively.',
  event:     'Logistical arrangements were handled smoothly, allowing participants to focus on the sessions.',
};

function getTopicFragment(topic = '') {
  const lower = topic.toLowerCase();
  for (const [key, fragment] of Object.entries(TOPIC_FRAGMENTS)) {
    if (lower.includes(key)) return fragment;
  }
  return 'The objectives were clearly defined and executed with consistent attention to quality.';
}

function getMockDrafts(topic = '', count = 5, tone = 'Professional', language = 'English') {
  const toneBank = MOCK_BANK[tone] || MOCK_BANK.Professional;
  const fragment = getTopicFragment(topic);

  return Array.from({ length: count }, (_, i) => {
    const opener = toneBank[i % toneBank.length];
    const content = language === 'English'
      ? `${opener} ${fragment}`
      : `[${language}] ${opener} ${fragment}`;

    return { content: content.trim() };
  });
}

function buildSystemPrompt() {
  return [
    'You are SmartFeedback AI, an expert feedback drafting assistant.',
    'Generate realistic, constructive, human-sounding feedback drafts strictly as suggestions for human review.',
    'CRITICAL RULES:',
    '- Return ONLY a valid JSON object matching: {"feedback": [{"content": "..."}, {"content": "..."}]}',
    '- No introductory text, no markdown fences, no explanatory comments.',
    '- Each feedback draft must be a unique, coherent paragraph.',
    '- Do not invent fake names, specific dates, or unsupported claims.',
  ].join(' ');
}

function buildUserPrompt({ topic, description, count, tone, length, language, style, keywords, avoidTopics, audience }) {
  const lengthGuide = {
    short:     '1-2 concise sentences (approx 25-45 words)',
    medium:    '2-4 balanced sentences (approx 50-85 words)',
    long:      '4-6 detailed sentences with rich observations (approx 90-140 words)',
    detailed:  'Comprehensive multi-paragraph feedback (approx 120-180 words)',
  }[length] || '2-4 balanced sentences';

  return [
    `Generate exactly ${count} unique feedback drafts for:`,
    `- Topic: ${topic}`,
    description ? `- Context/Description: ${description}` : null,
    `- Tone: ${tone}`,
    `- Length per draft: ${lengthGuide}`,
    `- Language: ${language}`,
    style ? `- Perspective/Style: ${style}` : null,
    audience ? `- Target Audience: ${audience}` : null,
    keywords?.length ? `- Emphasise: ${keywords.join(', ')}` : null,
    avoidTopics?.length ? `- AVOID: ${avoidTopics.join(', ')}` : null,
    '',
    `Output MUST be valid JSON: {"feedback":[{"content":"Draft 1 text"},{"content":"Draft 2 text"}]}`,
  ].filter(Boolean).join('\n');
}

function extractJSON(rawText) {
  let text = rawText.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }

  // 1. Direct JSON parse
  try {
    return JSON.parse(text);
  } catch (_) {}

  // 2. Extract largest curly brace object
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (_) {}
  }

  // 3. Robust regex extraction for {"content": "..."} items
  const contentRegex = /"content"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  const extracted = [];
  let itemMatch;
  while ((itemMatch = contentRegex.exec(text)) !== null) {
    const unescaped = itemMatch[1]
      .replace(/\\n/g, ' ')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .trim();
    if (unescaped.length > 10) {
      extracted.push({ content: unescaped });
    }
  }

  if (extracted.length > 0) {
    return { feedback: extracted };
  }

  throw new Error('Unable to extract valid JSON from Hugging Face response');
}

// ─── Main export ──────────────────────────────────────────────────────────

export async function generateAIFeedback({
  topic,
  description   = '',
  feedbackCount = 5,
  tone          = 'Professional',
  length        = 'medium',
  language      = 'English',
  style         = 'General',
  keywords      = [],
  avoidTopics   = [],
  audience      = 'general',
}) {
  const startTime = Date.now();
  const count     = Math.min(parseInt(feedbackCount, 10) || 5, 50);

  // 1. Check if Hugging Face token is provided
  if (!env.HF_API_TOKEN) {
    logger.warn('HF_API_TOKEN not set in .env — returning structured mock drafts. Add your Hugging Face token to .env to enable live AI.');
    return {
      success: true,
      mode:    'mock',
      model:   'mock-feedback-bank',
      generationDuration: Date.now() - startTime,
      feedback: getMockDrafts(topic, count, tone, language),
    };
  }

  // 2. Call Hugging Face Inference API
  const modelId       = env.HF_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
  const fallbackModel = 'meta-llama/Llama-3.2-3B-Instruct';
  const hf            = new HfInference(env.HF_API_TOKEN);

  logger.info(`Hugging Face: generating ${count} drafts — model: ${modelId}, tone: ${tone}, length: ${length}`);

  try {
    const systemPrompt = buildSystemPrompt();
    const userPrompt   = buildUserPrompt({ topic, description, count, tone, length, language, style, keywords, avoidTopics, audience });

    let rawOutput = '';
    let activeModel = modelId;
    const tokenLimit = Math.min(Math.max(count * 350, 1200), 4096);

    try {
      const response = await hf.chatCompletion({
        model: modelId,
        provider: 'featherless-ai',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: tokenLimit,
        temperature: 0.7,
      });

      rawOutput = response.choices[0]?.message?.content || '';
    } catch (chatErr) {
      logger.warn(`HF chatCompletion error on ${modelId} (featherless-ai): ${chatErr.message}. Trying fallback model ${fallbackModel}...`);
      activeModel = fallbackModel;

      try {
        const fallbackResponse = await hf.chatCompletion({
          model: fallbackModel,
          provider: 'featherless-ai',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: tokenLimit,
          temperature: 0.7,
        });

        rawOutput = fallbackResponse.choices[0]?.message?.content || '';
      } catch (fallbackErr) {
        logger.warn(`HF chatCompletion error on fallback model ${fallbackModel}: ${fallbackErr.message}.`);
        throw fallbackErr;
      }
    }

    const duration = Date.now() - startTime;
    logger.info(`Hugging Face response received in ${duration}ms (${rawOutput.length} chars)`);

    const parsed = extractJSON(rawOutput);

    let drafts = [];
    if (Array.isArray(parsed.feedback))   drafts = parsed.feedback;
    else if (Array.isArray(parsed.drafts)) drafts = parsed.drafts;
    else if (Array.isArray(parsed))         drafts = parsed;

    drafts = drafts
      .map(item => ({ content: (item.content || item.text || String(item)).trim() }))
      .filter(item => item.content.length > 10)
      .slice(0, count);

    if (drafts.length < count) {
      logger.warn(`Hugging Face returned ${drafts.length}/${count} drafts — padding remainder with structured mock.`);
      drafts.push(...getMockDrafts(topic, count - drafts.length, tone, language));
    }

    logger.info(`Hugging Face completed: ${drafts.length} drafts in ${duration}ms`);

    return {
      success:  true,
      mode:     'live',
      model:    activeModel,
      generationDuration: duration,
      feedback: drafts,
    };

  } catch (error) {
    logger.error('Hugging Face API error:', error.message);

    if (error.message && error.message.includes('sufficient permissions')) {
      logger.error('👉 ACTION NEEDED: Your Hugging Face token lacks "Make calls to Inference Providers" permission.');
      logger.error('👉 Visit https://huggingface.co/settings/tokens, create a token with "Inference Providers" permission or a classic "Read" token, and update HF_API_TOKEN in .env.');
    }

    logger.warn('Falling back to structured mock bank so server does not crash.');

    return {
      success:  true,
      mode:     'fallback',
      model:    'fallback-mock-bank',
      generationDuration: Date.now() - startTime,
      feedback: getMockDrafts(topic, count, tone, language),
      warning:  `Hugging Face notice: ${error.message}. Fallback drafts returned for review.`,
    };
  }
}

