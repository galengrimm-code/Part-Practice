export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { image, mediaType } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType || 'image/png',
                data: image
              }
            },
            {
              type: 'text',
              text: `You are analyzing a hymnal page with 4-part choral music (SATB - Soprano, Alto, Tenor, Bass).

This is standard hymnal notation where:
- The TOP staff (treble clef) contains Soprano (stems up) and Alto (stems down)
- The BOTTOM staff (bass clef) contains Tenor (stems up) and Bass (stems down)
- Each vertical alignment of notes is sung together

Please extract ALL notes for each voice part, reading left to right through the entire hymn.

IMPORTANT: Return ONLY a valid JSON object with no additional text, markdown, or explanation.

{
  "title": "Title of the hymn",
  "author": "Composer or source if visible",
  "key": "Key signature (e.g., G Major, D Major, Eb Major)",
  "tempo": 80,
  "verse": ["First line of lyrics", "Second line of lyrics"],
  "parts": {
    "soprano": ["D4", "G4", "B4", "A4"],
    "alto": ["B3", "D4", "G4", "F#4"],
    "tenor": ["G3", "B3", "D4", "D4"],
    "bass": ["G2", "G3", "G3", "D3"]
  }
}

Note format rules:
- Use scientific pitch notation: C4 is middle C
- Sharps: use # (e.g., F#4, C#4)
- Flats: use b (e.g., Bb3, Eb4)
- Include every note in sequence, including repeated notes
- All four parts should have the same number of notes

Read carefully through each measure and extract every note. Begin your response with { and end with }`
            }
          ]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(response.status).json({
        error: data.error?.message || 'API request failed'
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Scan error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
