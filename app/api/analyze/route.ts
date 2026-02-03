import { NextRequest, NextResponse } from 'next/server';

// Mock sentiment analysis using pattern matching
// In production, this would call Amazon Q API or other NLP service
function analyzeSentiment(message: string) {
  const lowerMessage = message.toLowerCase();

  // Sentiment detection
  let sentiment = 'Neutral';
  let tone = 'Professional';
  let confidenceScore = 75;

  // Sentiment indicators
  const positiveWords = [
    'great',
    'excellent',
    'wonderful',
    'amazing',
    'fantastic',
    'love',
    'happy',
    'pleased',
    'satisfied',
    'perfect',
  ];
  const negativeWords = [
    'terrible',
    'awful',
    'horrible',
    'angry',
    'frustrated',
    'disappointed',
    'hate',
    'worst',
    'bad',
    'useless',
  ];

  // Tone indicators
  const aggressivePatterns = ['!!!', '!!!', 'hate', 'angry', 'furious', 'disgusting'];
  const confusedPatterns = ['?', '??', '???', 'confused', 'unclear', 'what', 'why'];
  const rude = ['rude', 'disrespectful', 'ignorant', 'stupid', 'dumb'];
  const calmPatterns = ['please', 'thank', 'appreciate', 'kindly', 'would you'];

  // Analyze sentiment
  const positiveCount = positiveWords.filter((word) => lowerMessage.includes(word)).length;
  const negativeCount = negativeWords.filter((word) => lowerMessage.includes(word)).length;

  if (positiveCount > negativeCount) {
    sentiment = 'Positive';
    confidenceScore = 80;
  } else if (negativeCount > positiveCount) {
    sentiment = 'Negative';
    confidenceScore = 85;
  } else {
    sentiment = 'Neutral';
    confidenceScore = 70;
  }

  // Analyze tone
  if (aggressivePatterns.some((pattern) => lowerMessage.includes(pattern))) {
    tone = 'Angry';
  } else if (confusedPatterns.some((pattern) => lowerMessage.includes(pattern))) {
    tone = 'Confused';
  } else if (rude.some((pattern) => lowerMessage.includes(pattern))) {
    tone = 'Rude';
  } else if (calmPatterns.some((pattern) => lowerMessage.includes(pattern))) {
    tone = 'Calm';
  } else {
    tone = 'Professional';
  }

  return { sentiment, tone, confidenceScore };
}

function extractConflictTriggers(message: string): string[] {
  const lowerMessage = message.toLowerCase();

  const triggers = [];

  // Common conflict triggers
  if (lowerMessage.includes('never') || lowerMessage.includes('always')) {
    triggers.push('Use of absolute language (never/always)');
  }

  if (lowerMessage.includes('!') || lowerMessage.includes('?')) {
    triggers.push('Strong punctuation indicating emotional intensity');
  }

  if (
    lowerMessage.includes('wrong') ||
    lowerMessage.includes('mistake') ||
    lowerMessage.includes('error')
  ) {
    triggers.push('Focus on errors or problems');
  }

  if (
    lowerMessage.includes('understand') ||
    lowerMessage.includes('clarify') ||
    lowerMessage.includes('explain')
  ) {
    triggers.push('Request for clarification or explanation');
  }

  // Ensure exactly 2 triggers
  if (triggers.length === 0) {
    triggers.push('Professional tone detected');
    triggers.push('Clear communication observed');
  } else if (triggers.length === 1) {
    triggers.push('Neutral sentiment with measured response');
  } else {
    triggers.splice(2); // Keep only first 2
  }

  return triggers.slice(0, 2);
}

function generateProfessionalReply(sentiment: string, tone: string, message: string): string {
  const baseTemplate =
    'Thank you for your message. I understand your concern. I appreciate your feedback and would like to address this matter professionally.';

  const toneReplies = {
    Angry: "I understand this situation is frustrating. Let's work together to find a solution that addresses your concerns.",
    Confused:
      'I appreciate you reaching out. Let me clarify the situation and provide the information you need.',
    Rude: "I respect your perspective. I'm committed to having a productive conversation and finding common ground.",
    Calm: 'Thank you for your thoughtful message. I agree with your approach and appreciate your professionalism.',
    Professional: 'I appreciate your input. This is valuable feedback that will help improve our working relationship.',
  };

  let reply = toneReplies[tone] || baseTemplate;

  if (sentiment === 'Negative') {
    reply += ' Let me propose next steps to address this issue.';
  } else if (sentiment === 'Positive') {
    reply += ' Thank you again for your positive feedback.';
  }

  // Remove aggressive language if present
  reply = reply.replace(/aggressive|negative|hostile/gi, 'firm');

  return reply;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const { sentiment, tone, confidenceScore } = analyzeSentiment(message);
    const conflictTriggers = extractConflictTriggers(message);
    const professionalReply = generateProfessionalReply(sentiment, tone, message);

    return NextResponse.json({
      sentiment,
      sentimentScore: sentiment === 'Positive' ? 0.7 : sentiment === 'Negative' ? -0.7 : 0,
      tone,
      toneBreakdown: {
        [tone]: 75,
        'Professional': tone !== 'Professional' ? 15 : 85,
        'Neutral': 10
      },
      emotions: {
        'Calm': tone === 'Calm' ? 80 : 40,
        'Confident': tone === 'Professional' ? 70 : 30,
        'Happy': sentiment === 'Positive' ? 60 : 20,
        'Frustrated': tone === 'Angry' ? 70 : 10
      },
      language: 'English',
      confidenceScore,
      conflictTriggers,
      professionalReply,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze message' },
      { status: 500 }
    );
  }
}
