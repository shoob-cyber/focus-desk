const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const breakdownTask = async (req, res) => {
  try {
    const { taskDescription } = req.body;

    if (!taskDescription || taskDescription.trim().length === 0) {
      return res.status(400).json({ message: 'Task description is required' });
    }

    const prompt = `Break down this task into smaller subtasks. For each subtask, estimate how many 25-minute Pomodoro sessions it will take (1-5).

Task: "${taskDescription}"

Respond ONLY in JSON format like this:
{
  "subtasks": [
    {"title": "Subtask 1", "estimatedPomodoros": 2},
    {"title": "Subtask 2", "estimatedPomodoros": 3}
  ]
}

Create 3-5 realistic subtasks.`;

    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        // Ask Gemini to return raw JSON directly instead of hoping it
        // doesn't wrap the answer in ```json fences or extra prose.
        responseMimeType: 'application/json',
      },
    });

    const responseText = result.text;

    if (!responseText) {
      console.error('AI Error: empty response from Gemini', result);
      return res.status(502).json({ message: 'AI service returned an empty response' });
    }

    let breakdown;
    try {
      breakdown = JSON.parse(responseText);
    } catch (parseErr) {
      // Fallback: in case responseMimeType is ignored and the model
      // still wraps the JSON in markdown fences or extra text.
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('AI Error: could not find JSON in response:', responseText);
        return res.status(502).json({ message: 'Failed to parse AI response' });
      }
      breakdown = JSON.parse(jsonMatch[0]);
    }

    if (!breakdown || !Array.isArray(breakdown.subtasks)) {
      console.error('AI Error: unexpected response shape:', breakdown);
      return res.status(502).json({ message: 'AI response was missing subtasks' });
    }

    res.status(200).json(breakdown);

  } catch (error) {
    // Always log the full error server-side for debugging, but never let
    // it crash the process — respond with a clean error instead.
    console.error('AI Error:', error);
    res.status(500).json({ message: 'Error: ' + error.message });
  }
};

module.exports = { breakdownTask };