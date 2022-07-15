// Show Drop shadow on scroll
const scrollContainer = document.querySelector('#resources-container main');
scrollContainer.addEventListener('scroll', (e) => {
  const nav = scrollContainer.querySelector('nav');
  if (scrollContainer.scrollTop > 0) {
    nav.style.boxShadow = "0 8px 10px -11px #212121";
  } else {
    nav.style.boxShadow = "none";
  }
});