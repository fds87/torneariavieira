import { useHead } from '#imports'

type Json = Record<string, unknown>

// Injeta um ou mais blocos JSON-LD (schema.org) no <head>.
// Lido por Google, Gemini, GPT e outros agentes para entender a página.
export function useJsonLd(data: Json | Json[]) {
  const blocks = Array.isArray(data) ? data : [data]
  useHead({
    script: blocks.map((block) => ({
      type: 'application/ld+json',
      innerHTML: JSON.stringify(block),
    })),
  })
}
