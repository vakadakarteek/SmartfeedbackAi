const FEEDBACK_BANKS = {
  'College Technical Workshop': [
    'The technical workshop was well-structured and covered relevant topics in an accessible way. The hands-on sessions helped reinforce theoretical concepts, and the speakers demonstrated strong expertise in their respective fields.',
    'Attending this workshop gave me a practical perspective on technologies I had only read about. The interactive demonstrations were particularly useful, and the instructors were approachable and responsive to questions.',
    'The workshop content was current and industry-relevant. The balance between theory and practice was appropriate, and the session on emerging technologies was especially insightful for students at our level.',
    'I appreciated the organized format of the workshop. Each session built on the previous one, creating a cohesive learning experience. The resource materials provided will be useful for continued self-study.',
    'The faculty coordinators did an excellent job managing the schedule and ensuring all participants could follow along. The workshop covered substantial ground without feeling rushed.',
    'This workshop was a valuable addition to the academic calendar. The practical demonstrations gave students exposure to tools and techniques not typically covered in standard coursework.',
    'The invited speakers brought real-world experience that enriched the workshop content. Their case studies were directly relevant to current industry practices and gave useful career context.',
    'The hands-on lab sessions were the highlight of the workshop. Working directly with the tools gave a much clearer understanding compared to lectures alone.',
    'From registration to the closing session, the workshop was professionally organized. The topics selected were timely and the delivery was engaging throughout.',
    'The workshop succeeded in bridging the gap between academic knowledge and practical application. I left with a clearer understanding of how these technologies are used in real projects.',
  ],
  'Product Feedback': [
    'The product performs reliably and the interface is intuitive. Setup was straightforward and the documentation covered all the key use cases clearly.',
    'I have been using this product for several weeks and it consistently meets expectations. The design is clean, and the core features work as described.',
    'The product quality is good and represents fair value. Minor improvements to onboarding guidance would make the initial experience smoother for new users.',
    'This product does exactly what it promises. The build quality is solid, and I have had no issues with performance during regular use.',
    'The product offers a good feature set for the price point. Customer support responded promptly when I had a configuration question, which was appreciated.',
  ],
  'Customer Service Experience': [
    'The support team was responsive and resolved my issue efficiently. Communication throughout was clear and professional.',
    'I contacted support with a complex query and was impressed by how thoroughly the team investigated the issue before responding with a clear solution.',
    'The customer service experience was positive. The representative was patient, knowledgeable, and ensured the issue was fully resolved before closing the ticket.',
    'Response time was faster than expected and the solution provided was accurate. The follow-up confirmation was a helpful touch.',
    'The service team demonstrated a good understanding of the product and provided step-by-step guidance that resolved my issue on the first attempt.',
  ],
  'Faculty Development Program': [
    'The FDP was well-curated and addressed current needs in pedagogy and technology integration. The resource persons brought both depth and practical perspective.',
    'Participating in this program enhanced my understanding of modern teaching methodologies. The collaborative sessions were particularly valuable for sharing practices across departments.',
    'The program structure was logical and progressive. Each module built meaningfully on the previous one, and the workshop activities were directly applicable to classroom practice.',
    'The FDP covered important areas in academic development. The sessions on curriculum design and assessment strategies were especially relevant to current requirements.',
    'This was a well-organized professional development program. The facilitators were experienced and created a comfortable environment for open discussion.',
  ],
  'Student Orientation': [
    'The orientation program effectively introduced the academic environment and available resources. New students were given a clear picture of what to expect.',
    'The orientation sessions were informative and well-paced. The campus tour and introductions to key departments helped ease the transition into college life.',
    'The orientation provided useful practical information about academic processes, support services, and student activities. The format was accessible and not overwhelming.',
    'The program struck a good balance between formal information and informal interaction. It helped build initial connections among students from different backgrounds.',
    'The orientation team was organized and approachable. Questions were addressed clearly, and the schedule allowed time to process information without feeling rushed.',
  ],
}

const DEFAULT_FEEDBACK = [
  'The experience was well-organized and delivered on its stated objectives. The team involved demonstrated clear preparation and commitment to quality.',
  'This was a positive and professionally managed experience. Participants were treated with respect and all logistical aspects were handled smoothly.',
  'The overall quality met expectations and the process was transparent throughout. Communication was consistent and issues were addressed promptly.',
  'The level of professionalism demonstrated throughout was commendable. Attention to detail was evident and contributed to a smooth overall experience.',
  'This was a structured and purposeful experience that achieved its intended goals. The people involved were knowledgeable and easy to engage with.',
]

export function generateMockFeedback({ topic, count = 5, tone, language }) {
  const bank = FEEDBACK_BANKS[topic] || DEFAULT_FEEDBACK
  const items = []

  for (let i = 0; i < count; i++) {
    const base = bank[i % bank.length]
    items.push({
      id: 'fb' + Date.now() + i,
      text: base,
      topic,
      tone: tone || 'Professional',
      language: language || 'English',
      createdAt: new Date().toISOString(),
      edited: false,
    })
  }

  return {
    sessionId: 'sess' + Date.now(),
    topic,
    count,
    tone,
    language,
    items,
    generatedAt: new Date().toISOString(),
  }
}

export function generateSingleFeedback({ topic, tone, language }) {
  const bank = FEEDBACK_BANKS[topic] || DEFAULT_FEEDBACK
  const idx = Math.floor(Math.random() * bank.length)
  return {
    id: 'fb' + Date.now(),
    text: bank[idx],
    topic,
    tone: tone || 'Professional',
    language: language || 'English',
    createdAt: new Date().toISOString(),
    edited: false,
  }
}

export const mockFeedbackSessions = [
  {
    sessionId: 'sess001',
    topic: 'College Technical Workshop',
    count: 10,
    tone: 'Professional',
    language: 'English',
    generatedAt: '2024-09-28T10:00:00.000Z',
    items: FEEDBACK_BANKS['College Technical Workshop'].map((text, i) => ({
      id: 'fb001_' + i,
      text,
      topic: 'College Technical Workshop',
      tone: 'Professional',
      language: 'English',
      createdAt: '2024-09-28T10:00:00.000Z',
      edited: false,
    })),
  },
  {
    sessionId: 'sess002',
    topic: 'Faculty Development Program',
    count: 5,
    tone: 'Positive',
    language: 'English',
    generatedAt: '2024-09-27T14:00:00.000Z',
    items: FEEDBACK_BANKS['Faculty Development Program'].map((text, i) => ({
      id: 'fb002_' + i,
      text,
      topic: 'Faculty Development Program',
      tone: 'Positive',
      language: 'English',
      createdAt: '2024-09-27T14:00:00.000Z',
      edited: false,
    })),
  },
]
