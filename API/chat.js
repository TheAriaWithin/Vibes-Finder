export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // Use dynamic import for node-fetch to avoid issues with Vercel's module handling
  const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

  const userMessage = req.body.message;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are Runestomper Vibes Finder, an emotionally intuitive assistant that helps users find the perfect Runestomper track based on their mood. Be empathetic, insightful, and creative in your responses. Never suggest songs outside of Runestomper's discography.`
          },
          { role: 'user', content: userMessage }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('OpenAI API Error:', data.error);
      return res.status(500).json({ reply: 'Error from OpenAI: ' + data.error.message });
    }

    const reply = data.choices?.[0]?.message?.content ?? 'Hmm, something went wrong.';
    res.status(200).json({ reply });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ reply: 'Server error — please try again later.' });
  }
}
