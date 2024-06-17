export function homeView() {
  const appElement = document.getElementById('app');

  appElement.innerHTML = `
    <hero-section></hero-section>
    <carte-section></carte-section>
  `;
}
