import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Home = () => {
  const [generatedContent, setGeneratedContent] = useState("");
  const [inputTitle, setInputTitle] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("5 year old");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const audienceOptions = [
    "5 year old",
    "Teenager",
    "Gen Z person",
    "Gamer",
    "Movie lover",
    "Tech nerd",
  ];

  const handleGenerate = async () => {
    if (!inputTitle.trim()) {
      setError("Please enter some text first");
      return;
    }

    setIsLoading(true);
    setError("");
    const prompt = `Explain like I'm a ${selectedAudience}: ${inputTitle}`;

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
            "HTTP-Referer": window.location.href,
            "X-Title": "Content Generator",
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-exp:free",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      setGeneratedContent(data.choices[0].message.content);
    } catch (err) {
      setError("Failed to generate content. Please try again.");
      console.error("Generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Generate Section */}
        <div className="bg-white rounded-lg shadow-md min-w-[300px]">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Enter your text</h2>
            <div className="space-y-4">
              <textarea
                placeholder="Enter text that you want to explain"
                value={inputTitle}
                onChange={(e) => setInputTitle(e.target.value)}
                className="w-full min-h-[400px] p-3 border border-gray-300 rounded-md
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  whitespace-pre-wrap"
                style={{
                  resize: "vertical",
                  height: "auto",
                  overflowY: "auto",
                }}
              />

              {/* Audience Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-gray-700">Explain for a</span>
                <select
                  value={selectedAudience}
                  onChange={(e) => setSelectedAudience(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    bg-white text-gray-700"
                >
                  {audienceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                  transition-colors duration-200
                  ${
                    isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-700"
                  }`}
              >
                {isLoading ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-white rounded-lg shadow-md min-w-[300px]">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Output</h2>
            <div className="w-full min-h-[400px] p-3 bg-gray-50 border border-gray-300 rounded-md overflow-y-auto">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ ...props }) => (
                    <p className="whitespace-pre-wrap mb-4" {...props} />
                  ),
                }}
              >
                {generatedContent || "Generated content will appear here..."}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
