export function usePageMeta(title: string, description?: string) {
  useHead({
    title: `${title} | Brasa Premium`,
    meta: description ? [{ name: 'description', content: description }] : [],
  })
}
