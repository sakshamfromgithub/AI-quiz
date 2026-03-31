export async function handler(event) {
  try {
    const body = JSON.parse(event.body || "{}");

    const prompt = `
Generate 10 MCQ questions in JSON format.

IMPORTANT RULES:
- ONLY return valid JSON
- NO explanation outside JSON
- NO extra text
- JSON must start with [ and end with ]
- Each question must have:
  question, options (4), answer (0-3), explanation

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

    // 🧠 CHECK RESPONSE
    if (!data.candidates) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Invalid Gemini response",
          data
        })
      };
    }

    let text = data.candidates[0].content.parts[0].text;

    // 🧹 CLEAN TEXT
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 🧠 EXTRACT JSON SAFELY
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");

    if (start === -1 || end === -1) {
      throw new Error("No valid JSON found");
    }

    const jsonString = text.substring(start, end + 1);

    let questions;

    try {
      questions = JSON.parse(jsonString);
    } catch (e) {
      console.log("JSON ERROR:", text);

      // 💀 FALLBACK (so UI never breaks)
      questions = Array.from({ length: 10 }, (_, i) => ({
        question: `Fallback Question ${i + 1}`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        answer: 0,
        explanation: "AI failed to generate valid data"
      }));
    }

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
