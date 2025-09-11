import React, { useState, useEffect } from 'react';
import { X, Search } from "lucide-react";

export default function LegalReferenceJournal({ query, onClose, apiKey }) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLegalData = async () => {
      if (!query) return;

      setIsLoading(true);
      setError(null);
      
      const prompt = `You are a legal research assistant. Your task is to perform a Google search for the user's query, which will be a legal case name. 
You must return the top 4 search results. For each result, you must provide the title, the full URL, and a concise snippet. 
Your entire response must be ONLY a raw JSON object (no markdown, no commentary) that strictly follows this schema: 
{ "results": [{ "title": "string", "url": "string", "snippet": "string" }] }

User Query: "${query}"`;

      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
        
        const payload = {
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ "google_search_retrieval": {} }],
        };

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorBody = await response.json();
          console.error("API Error Body:", errorBody);
          throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        
        if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
            let rawText = result.candidates[0].content.parts[0].text;
            
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("No valid JSON object found in the API response.");
            }
            
            const jsonText = jsonMatch[0];
            const parsedData = JSON.parse(jsonText);
            setResults(parsedData.results || []);
        } else {
            console.warn("API returned no valid candidates or content parts.");
            setResults([]);
        }


      } catch (err) {
        console.error("Error fetching legal data:", err);
        setError("Failed to retrieve search results. The AI model may be temporarily unavailable or the query returned no results.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLegalData();
  }, [query, apiKey]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-gray-700 p-6 rounded-2xl shadow-2xl max-w-2xl w-full text-white border-2 border-yellow-400">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-500">
          <h2 className="text-xl font-bold text-yellow-300 flex items-center gap-2">
            <Search size={22} />
            Legal Reference Journal
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto pr-4">
          <p className="mb-4 text-gray-300">
            Displaying top search results for: <em className="font-semibold text-white">{query}</em>
          </p>
          {isLoading && <div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></div>}
          {error && <p className="text-red-400 text-center p-4">{error}</p>}
          {!isLoading && !error && results.length > 0 && (
            <div className="space-y-5">
              {results.map((item, index) => (
                <div key={index} className="border-b border-gray-600 pb-4 last:border-b-0">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-blue-300 hover:underline"
                  >
                    {item.title}
                  </a>
                  <p className="text-sm text-green-400 truncate mt-1">{item.url}</p>
                  <p className="text-gray-200 mt-2">{item.snippet}</p>
                </div>
              ))}
            </div>
          )}
           {!isLoading && !error && results.length === 0 && (
            <p className="text-center text-gray-400 p-4">No results found for this query.</p>
           )}
        </div>
      </div>
    </div>
  );
}
