const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const breakdownTask = async (req, res) => {
  try {
    const { taskDescription } = req.body;

    if (!taskDescription || taskDescription.trim().length === 0) {
      return res.status(400).json({ message: 'Task description is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return res.status(500).json({ message: 'Failed to parse AI response' });
    }

    const breakdown = JSON.parse(jsonMatch[0]);
    res.status(200).json(breakdown);
    
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: 'Error: ' + error.message });
  }
};

module.exports = { breakdownTask };