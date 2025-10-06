export const QUERY_TEXTS = [
  "interesting and unusual recent event",
  "surprising and quirky news story",
  "bizarre and unexpected development",
  "weird and fascinating update",
  "curious and remarkable happening",
  "strange and intriguing news",
  "unusual and captivating story",
  "odd and interesting development",
  "peculiar and noteworthy event",
  "eccentric and engaging news",
  "a mind-bending scientific discovery",
  "a major breakthrough in space exploration",
  "an ingenious technological innovation",
  "an amazing story of animal intelligence",
  "a rare and beautiful natural phenomenon",
  "a surprising archaeological find",
  "an unusual world record or human achievement",
]

export function getRandomQueryText(): string {
  const randomIndex = Math.floor(Math.random() * QUERY_TEXTS.length)
  return QUERY_TEXTS[randomIndex]
}
