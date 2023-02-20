export function convertStringToLabel(sentence: string) {
  let words = sentence.split("_");
  words = words.map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  return words.join(" ");
}
