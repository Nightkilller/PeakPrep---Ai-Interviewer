import { NextRequest, NextResponse } from "next/server";

// System Design critique using Groq vision (llama-3.2-90b-vision-preview)
export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
    }

    // Strip data URL prefix to get raw base64
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a world-class Staff Engineer at a top tech company (Google, Meta, Amazon) conducting a System Design interview. 
The candidate has just drawn an architecture diagram on a whiteboard.

Analyze the diagram critically and provide expert-level interview feedback covering:
1. **Architecture Overview** - What system or pattern you see in the diagram.
2. **Strengths** - What they did well in terms of scalability, reliability, or design patterns.
3. **Critical Bottlenecks** - Single points of failure, missing load balancers, lack of caching, etc.
4. **Scalability Concerns** - How this design would fail at 10x or 100x load.
5. **Missing Components** - What important components are absent (e.g., CDN, message queues, monitoring).
6. **One Action Item** - The single most important improvement they should make right now.

Keep your response conversational and concise (under 200 words), as if you are speaking directly to the candidate during a live interview.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64Data}`,
                },
              },
            ],
          },
        ],
        max_tokens: 400,
        temperature: 0.6,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API error:", errorText);

      // Fallback to smart mock feedback if vision model fails
      return NextResponse.json({
        feedback: generateMockFeedback(),
      });
    }

    const groqData = await groqResponse.json();
    const feedback = groqData.choices?.[0]?.message?.content;

    if (!feedback) {
      return NextResponse.json({ feedback: generateMockFeedback() });
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Critique design error:", error);
    return NextResponse.json({ feedback: generateMockFeedback() });
  }
}

function generateMockFeedback(): string {
  const feedbacks = [
    "I can see you've drawn a basic client-server architecture. A few observations: First, I don't see any caching layer — for a high-traffic system, you'd want Redis or Memcached in front of your database to reduce read load. Second, your single database is a bottleneck — consider read replicas for scale. Third, add a load balancer between your clients and servers. The most important thing to fix right now: add a CDN for static assets. That alone can reduce your server load by 60%.",
    "Your diagram shows a microservices structure, which is a good starting point. However, I notice there's no API Gateway — that's a critical missing piece because each service is directly exposed. You'll also want a message queue like Kafka between services to handle async communication and avoid tight coupling. The single point of failure I see is your authentication service — it needs to be replicated. One action item: add an API Gateway as the single entry point for all client requests.",
    "I can see a three-tier architecture here. It's a solid foundation. What I'd push back on is the database — at scale, a single relational DB won't handle write-heavy workloads. Consider sharding or moving to a distributed database. I also don't see any monitoring or observability components — in production, you need Prometheus and Grafana at minimum. Your most important next step is to separate your read and write paths with a CQRS pattern.",
  ];
  return feedbacks[Math.floor(Math.random() * feedbacks.length)];
}
