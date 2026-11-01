/** Decode character references without interpreting article text as HTML. */
export function decodeHtmlEntities(value: string): string {
  const decoder = document.createElement('textarea')
  return value.replace(/&(?:#\d+|#x[\da-f]+|[a-z][\da-z]+);/gi, (entity) => {
    decoder.innerHTML = entity
    return decoder.value
  })
}
