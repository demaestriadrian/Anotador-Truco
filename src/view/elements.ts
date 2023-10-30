export const sections = () => {
  const [sectionA, sectionB] = document.querySelectorAll('section')
  return {
    a: sectionA,
    b: sectionB
  }
}