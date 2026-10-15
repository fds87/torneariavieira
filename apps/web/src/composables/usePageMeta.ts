export function usePageMeta(title: string, description?: string) {
  useHead({
    title: `${title} | Tornearia Vieira`,
    meta: description ? [{ name: 'description', content: description }] : [],
  })
}
