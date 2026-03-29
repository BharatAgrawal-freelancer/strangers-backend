import fetch from "node-fetch";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export const askGemini = async (req, res) => {
  try {
    const { question, additionalPrompt } = req.body;

    if (!question) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    const finalPrompt = additionalPrompt
      ? `${additionalPrompt}\n\nUser Question: ${question}`
      : question;

    const response = await fetch(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: finalPrompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini";

    res.status(200).json({
      success: true,
      question,
      reply,
      raw: data,
    });
  } catch (error) {
    console.error("Gemini Error:", error);

    res.status(500).json({
      success: false,
      message: "Gemini API failed",
    });
  }
};
