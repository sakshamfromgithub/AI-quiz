export async function handler(event) {
  try {
    const body = JSON.parse(event.body);

    const prompt = `
Generate 10 MCQ questions in JSON format.

Format:
[
 {
  "question": "",
  "options": ["", "", "", ""],
  "answer": 0,
  "explanation": ""
 }
]

Subject: ${body.subject}
Topic: ${body.topic}
Level: ${body.level}
Difficulty: ${body.difficulty}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!data.candidates) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Invalid Gemini response", data })
      };
    }

    let text = data.candidates[0].content.parts[0].text;

    text = text.replace(/```json/g, "").replace(/```/g, "");

    const questions = JSON.parse(text);

    return {
      statusCode: 200,
      body: JSON.stringify({ questions })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Function crash",
        message: error.message
      })
    };
  }
}
