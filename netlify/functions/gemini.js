export async function handler(event) {
  const { subject, topic, level, difficulty } = JSON.parse(event.body);

  const prompt = `
Generate 10 MCQ questions in JSON.

Format:
[
 {export async function handler(event) {
  const { subject, topic, level, difficulty } = JSON.parse(event.body);

  const prompt = `
Generate 10 MCQ questions in JSON format.

Strict format:
[
 {
  "question": "",
  "options": ["", "", "", ""],
  "answer": 0,
  "explanation": ""
 }
]

Subject: ${subject}
Topic: ${topic}
Level: ${level}
Difficulty: ${difficulty}
`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    if (!data.candidates) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Gemini response invalid",
          full: data
        })
      };
    }

    let text = data.candidates[0].content.parts[0].text;

    text = text.replace(/```json/g, "").replace(/```/g, "");

    const questions = JSON.parse(text);

    return {
      statusCode: 200,
      body: JSON.stringify({ questions })
    };

  } catch (err) {
    console.error("ERROR:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "AI failed", details: err.message })
    };
  }
}
  "question": "",
  "options": ["", "", "", ""],
  "answer": 0,
  "explanation": ""
 }
]

Subject: ${subject}
Topic: ${topic}
Level: ${level}
Difficulty: ${difficulty}
`;

  try {
  const response = await fetch(
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;

    text = text.replace(/```json/g, "").replace(/```/g, "");

    const questions = JSON.parse(text);

    return {
      statusCode: 200,
      body: JSON.stringify({ questions })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "AI failed" })
    };
  }
}
