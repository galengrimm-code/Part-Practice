export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
              text: `You are analyzing a HYMNAL page with 4-part choral music in SATB format.

STEP 1: IDENTIFY THE STRUCTURE
- Look for systems (groups of staves connected by a bracket/brace on the left)
- Each system has TWO staves: treble clef (top) and bass clef (bottom)
- Count total measures and beats per measure

STEP 2: READ THE TREBLE CLEF STAFF (TOP) - LEFT TO RIGHT
This staff contains TWO voice parts sharing the same staff:
- SOPRANO: The UPPER notes (stems usually pointing UP, or the higher pitch when notes are stacked)
- ALTO: The LOWER notes (stems usually pointing DOWN, or the lower pitch when notes are stacked)

Go measure by measure, beat by beat. For each beat, identify:
- The soprano note (higher one)
- The alto note (lower one)

STEP 3: READ THE BASS CLEF STAFF (BOTTOM) - LEFT TO RIGHT  
This staff contains TWO voice parts:
- TENOR: The UPPER notes (stems usually pointing UP, or the higher pitch when notes are stacked)
- BASS: The LOWER notes (stems usually pointing DOWN, or the lower pitch when notes are stacked)

Go measure by measure, beat by beat. For each beat, identify:
- The tenor note (higher one)
- The bass note (lower one)

CRITICAL RULES:
1. All four parts MUST have the SAME number of notes
2. If a note is held (half note, dotted note), repeat it for each beat it covers
3. Use scientific pitch notation: Middle C = C4
4. Sharps: F#4, C#4, G#4 (use #)
5. Flats: Bb3, Eb4, Ab4 (use lowercase b)
6. Check the key signature for sharps/flats that apply to all notes
7. Natural signs (♮) cancel the key signature for that note

PITCH REFERENCE:
- Treble clef: Lines are E4, G4, B4, D5, F5 (bottom to top)
- Treble clef: Spaces are F4, A4, C5, E5 (bottom to top)
- Bass clef: Lines are G2, B2, D3, F3, A3 (bottom to top)
- Bass clef: Spaces are A2, C3, E3, G3 (bottom to top)

Return ONLY this JSON format, no other text:
{
  "title": "Hymn Title",
  "author": "Composer if visible",
  "key": "G Major",
  "tempo": 80,
  "verse": ["First line of lyrics", "Second line"],
  "parts": {
    "soprano": ["G4", "A4", "B4"],
    "alto": ["D4", "F#4", "G4"],
    "tenor": ["B3", "D4", "D4"],
    "bass": ["G3", "D3", "G3"]
  }
}

Begin with { and end with }. No markdown.`
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
