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
              text: `You are an expert at reading traditional 4-part hymnal sheet music (SATB format).

HYMNAL LAYOUT:
- Each system has TWO staves connected by a bracket
- TOP STAFF (Treble Clef): Contains TWO voices
  • SOPRANO: Notes with stems pointing UP (or the higher note when stems are shared)
  • ALTO: Notes with stems pointing DOWN (or the lower note when stems are shared)
- BOTTOM STAFF (Bass Clef): Contains TWO voices  
  • TENOR: Notes with stems pointing UP (or the higher note when stems are shared)
  • BASS: Notes with stems pointing DOWN (or the lower note when stems are shared)

HOW TO READ:
1. Go measure by measure, left to right
2. Within each measure, go beat by beat
3. For each beat, identify all 4 notes vertically aligned
4. The soprano note is ALWAYS the highest pitch
5. The bass note is ALWAYS the lowest pitch
6. Alto is below soprano, tenor is above bass

DURATION:
- Whole note = 4 beats
- Half note = 2 beats  
- Quarter note = 1 beat
- If a note is held for multiple beats, repeat it that many times in the array

IMPORTANT RULES:
- Count carefully - all 4 parts MUST have the same number of notes
- Include repeated notes (if soprano holds a half note while alto has two quarters, soprano gets the same note twice)
- Use scientific pitch notation: C4 = middle C
- Sharps: F#4, C#4, G#4
- Flats: Bb3, Eb4, Ab4
- Natural signs cancel sharps/flats from the key signature for that note

Return ONLY valid JSON, no other text:

{
  "title": "Hymn Title",
  "author": "Composer if shown",
  "key": "G Major",
  "tempo": 80,
  "verse": ["First line of lyrics", "Second line"],
  "parts": {
    "soprano": ["D4", "G4", "B4"],
    "alto": ["B3", "D4", "G4"],
    "tenor": ["G3", "B3", "D4"],
    "bass": ["G2", "G3", "G3"]
  }
}

Begin with { and end with }. No markdown, no explanation.`
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
