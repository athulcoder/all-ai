"use client";
import { useState } from "react";

export default function Page() {
  // --- CONFIGURATION (replace with real keys or env variables) ---
  const apiKeys = {
    gemini: "", // process.env.NEXT_PUBLIC_GEMINI_KEY
    openai: "", // process.env.NEXT_PUBLIC_OPENAI_KEY
    grok: "",
    blackbox: "",
  };

  // --- STATE ---
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState({});
  const aiModels = [
    { name: "Gemini", key: "gemini", color: "blue" },
    { name: "ChatGPT", key: "openai", color: "green" },
    { name: "Grok", key: "grok", color: "indigo" },
    { name: "Blackbox", key: "blackbox", color: "gray" },
  ];

  // --- HANDLERS ---
  const handleSendPrompt = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt.");
      return;
    }
    setLoading(true);
    setResponses({});

    const results = await Promise.allSettled(
      aiModels.map((model) => fetchAIResponse(prompt, model.key))
    );

    const newResponses = {};
    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        newResponses[aiModels[i].key] = result.value;
      } else {
        newResponses[aiModels[i].key] = `❌ Error: ${result.reason.message}`;
      }
    });
    setResponses(newResponses);
    setLoading(false);
  };

  // --- API CALLER ---
  async function fetchAIResponse(prompt, modelKey) {
    const apiKey = apiKeys[modelKey];
    if (!apiKey) throw new Error("API key is missing.");

    switch (modelKey) {
      case "gemini": {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        });
        if (!response.ok)
          throw new Error(`Gemini API error: ${response.statusText}`);
        const data = await response.json();
        return (
          data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
          "No response"
        );
      }
      case "openai": {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [{ role: "user", content: prompt }],
            }),
          }
        );
        if (!response.ok)
          throw new Error(`OpenAI API error: ${response.statusText}`);
        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || "No response";
      }
      case "grok": {
        // Placeholder — Grok API not public
        throw new Error("Grok API not available yet.");
      }
      case "blackbox": {
        const response = await fetch(
          "https://api.blackbox.ai/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "blackboxai/openai/gpt-4",
              messages: [{ role: "user", content: prompt }],
            }),
          }
        );
        if (!response.ok)
          throw new Error(`Blackbox API error: ${response.statusText}`);
        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || "No response";
      }
      default:
        throw new Error("Unknown model");
    }
  }

  // --- UI ---
  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans">
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Multi-AI Prompt Comparator
          </h1>
          <p className="text-gray-400 mt-2">
            Send one prompt to four different AI models and see their responses
            side-by-side.
          </p>
        </header>

        <main>
          {/* Prompt Input */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8 sticky top-4 z-10">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-grow bg-gray-700 text-white border border-gray-600 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your prompt here..."
              />
              <button
                onClick={handleSendPrompt}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                disabled={loading}
              >
                {loading ? "Loading..." : "Send Prompt"}
              </button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiModels.map((model) => (
              <div
                key={model.key}
                className={`ai-output-column bg-gray-800 p-5 rounded-xl shadow-lg border border-${model.color}-500/30`}
              >
                <h2
                  className={`text-xl font-semibold mb-4 text-${model.color}-400`}
                >
                  {model.name}
                </h2>
                <div className="text-gray-300 whitespace-pre-wrap break-words">
                  {loading && !responses[model.key] && (
                    <div className="loader mx-auto border-4 border-gray-500 border-t-blue-500 rounded-full w-8 h-8 animate-spin"></div>
                  )}
                  {responses[model.key] || "Waiting for prompt..."}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
