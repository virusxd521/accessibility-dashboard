import { useState, useCallback } from 'react';

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const useWcagExplanation = () => {
  const [explanations, setExplanations] = useState<Record<string, { text: string; loading: boolean; error: string | null }>>({});

  const fetchExplanation = useCallback(async (code: string) => {
    const OPENROUTER_API_KEY = import.meta.env.VITE_REACT_APP_OPENROUTER_API_KEY;
    const OPENROUTER_MODEL = import.meta.env.VITE_REACT_APP_OPENROUTER_MODEL;

    if (!OPENROUTER_API_KEY || !OPENROUTER_MODEL) {
      setExplanations(prev => ({
        ...prev,
        [code]: { text: '', loading: false, error: "Missing API configuration." }
      }));
      return;
    }

    setExplanations(prev => ({ ...prev, [code]: { text: '', loading: true, error: null } }));

    const prompt = `
      You are an accessibility expert. Explain the following WCAG code in 2-3 sentences: ${code}.
      Include: principle, guideline meaning, and brief fix explanation. Respond in plain text.
    `;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Accessibility Dashboard"
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [{ role: "user", content: prompt }]
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const explanation = data.choices[0]?.message?.content || "No explanation available.";

      setExplanations(prev => ({ ...prev, [code]: { text: explanation, loading: false, error: null } }));
    } catch (error: any) {
      setExplanations(prev => ({ ...prev, [code]: { text: '', loading: false, error: error.message } }));
    }
  }, []);

  return { explanations, fetchExplanation };
};
