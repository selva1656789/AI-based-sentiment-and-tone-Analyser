import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { originalMessage, mode, currentReply } = await request.json();

    // Mock rewrite responses based on mode
    const rewrittenReplies = {
      formal: `I appreciate your message and would like to provide a formal response. After careful consideration of your points, I believe we can address this matter professionally and efficiently.`,
      friendly: `Thanks for reaching out! I really appreciate you taking the time to share your thoughts. I'd love to help you with this and find a great solution together.`,
      calm: `I understand your perspective and would like to discuss this calmly. Let's work together to find a peaceful resolution that works for everyone involved.`,
      assertive: `I want to be clear about my position on this matter. While I respect your viewpoint, I believe it's important to establish clear boundaries and expectations moving forward.`,
      apologetic: `I sincerely apologize for any inconvenience this may have caused. I take full responsibility and want to make things right. Please let me know how I can better address your concerns.`
    };

    const rewrittenReply = rewrittenReplies[mode as keyof typeof rewrittenReplies] || currentReply;

    return NextResponse.json({ rewrittenReply });
  } catch (error) {
    console.error('Rewrite API error:', error);
    return NextResponse.json(
      { error: 'Failed to rewrite reply' },
      { status: 500 }
    );
  }
}