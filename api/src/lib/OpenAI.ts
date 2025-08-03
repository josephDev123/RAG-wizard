import OpenAI from "openai";

const clients = new Map<string, OpenAI>();

function getClientKey(token: string, baseUrl: string) {
  return `${token}_${baseUrl}`;
}

export function initGptClient(token: string, baseUrl: string): OpenAI {
  const key = getClientKey(token, baseUrl);
  if (clients.has(key)) return clients.get(key)!;

  const client = new OpenAI({ apiKey: token, baseURL: baseUrl });
  clients.set(key, client);
  return client;
}
