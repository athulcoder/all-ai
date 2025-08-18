"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function Page() {
  // --- CONFIGURATION ---
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
    { name: "Blackbox", key: "blackbox", color: "yellow" },
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
      aiModels.map((model) => fetchAIResponse(model.key, prompt))
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

  // --- API CALLER (mock for now) ---
  async function fetchAIResponse(model, prompt) {
    await new Promise((r) => setTimeout(r, 1500)); // simulate delay
    return `🔮 Response from ${model}: "${prompt}"`;
  }

  // --- UI ---
  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-950 to-black min-h-screen text-white font-sans">
      <div className="container mx-auto p-6 md:p-10">
        {/* HEADER */}
        <motion.header
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-green-400 to-purple-500">
            Multi-AI Prompt Comparator
          </h1>
          <p className="text-gray-400 mt-3 text-lg">
            Compare responses from different AI models side-by-side in real time.
          </p>
        </motion.header>

        {/* PROMPT INPUT */}
        <motion.div
          className="bg-gray-900/70 backdrop-blur-md border border-gray-700 p-6 rounded-2xl shadow-lg mb-10 sticky top-6 z-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-grow bg-gray-800 text-white border border-gray-600 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="💡 Enter your prompt here..."
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendPrompt}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors duration-300"
              disabled={loading}
            >
              {loading ? "Thinking..." : "Send Prompt"}
            </motion.button>
          </div>
        </motion.div>

        {/* RESULTS */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {aiModels.map((model) => (
            <motion.div
              key={model.key}
              className={`bg-gray-900/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border h-[600px] overflow-y-auto relative group`}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 150 }}
            >
              {/* MODEL NAME */}
              <h2
                className={`text-xl font-semibold mb-4 text-${model.color}-400`}
              >
                {model.name}
              </h2>

              {/* LOADER */}
              {loading && !responses[model.key] && (
                <div className="flex justify-center items-center h-full">
                  <motion.div
                    className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                </div>
              )}

              {/* RESPONSE */}
              {!loading && (
                <motion.div
                  className="text-gray-300 whitespace-pre-wrap break-words leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {responses[model.key] || (
                    <span className="text-gray-500">⌛ Waiting for input...</span>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
