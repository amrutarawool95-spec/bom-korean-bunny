import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

async function callAI(body: unknown) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error("Rate limit hit. Please wait a moment and try again.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in your Lovable workspace.");
    const text = await res.text();
    throw new Error(`AI gateway error (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

export const translateToKorean = createServerFn({ method: "POST" })
  .inputValidator(z.object({ text: z.string().min(1).max(2000) }))
  .handler(async ({ data }) => {
    const json = await callAI({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a precise Korean translator. Given English text, return ONLY a JSON object: {\"korean\": \"...\", \"romanization\": \"...\"}. No markdown, no commentary. Use natural, polite (해요체) Korean unless the source clearly calls for casual speech.",
        },
        { role: "user", content: data.text },
      ],
      response_format: { type: "json_object" },
    });
    const content: string = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: { korean?: string; romanization?: string } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { korean: content };
    }
    return {
      korean: parsed.korean ?? "",
      romanization: parsed.romanization ?? "",
    };
  });

export const explainKorean = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      english: z.string().min(1).max(2000),
      korean: z.string().min(1).max(2000),
    }),
  )
  .handler(async ({ data }) => {
    const json = await callAI({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are a friendly Korean teacher named Bom-Bunny 🐰.
Given an English sentence and its Korean translation, produce a JSON object:
{
  "tokens": [{ "korean": "저는", "romanization": "jeo-neun", "meaning": "I (topic)", "role": "subject + topic particle" }],
  "structure": "Short one-sentence description of word order (e.g. Subject + Object + Verb).",
  "grammar": [{ "point": "은/는 topic particle", "explanation": "Used to mark the topic of the sentence..." }],
  "tip": "One short cultural or learner tip."
}
Keep it warm, concise, and beginner-friendly. Return ONLY JSON, no markdown.`,
        },
        {
          role: "user",
          content: `English: ${data.english}\nKorean: ${data.korean}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const content: string = json.choices?.[0]?.message?.content ?? "{}";
    try {
      return JSON.parse(content);
    } catch {
      return { tokens: [], structure: "", grammar: [], tip: content };
    }
  });

export const speechStyles = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      english: z.string().min(1).max(2000),
      korean: z.string().min(1).max(2000),
    }),
  )
  .handler(async ({ data }) => {
    const json = await callAI({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You rewrite a Korean sentence into three natural speech levels for the SAME meaning.
Return ONLY JSON:
{
  "formal":   { "korean": "...", "romanization": "...", "note": "When/with whom to use it (1 short line)" },
  "polite":   { "korean": "...", "romanization": "...", "note": "..." },
  "casual":   { "korean": "...", "romanization": "...", "note": "..." }
}
Rules:
- formal = 하십시오체 (very polite, presentations, strangers, elders, business)
- polite = 해요체 (everyday polite, coworkers, new friends, shops)
- casual = 반말 (close friends, younger siblings, same-age close)
Keep meaning identical. No markdown.`,
        },
        {
          role: "user",
          content: `English: ${data.english}\nKorean (reference): ${data.korean}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const content: string = json.choices?.[0]?.message?.content ?? "{}";
    try {
      return JSON.parse(content);
    } catch {
      return { formal: null, polite: null, casual: null };
    }
  });
