// This function renders the main home view of the application.
export function homeView() {
  // Finds the main container element in the DOM where the application will be rendered.
  const appElement = document.getElementById('app');

  // Sets the inner HTML of the main container to include the custom web components
  // for the hero section and the menu (carte) section.
  appElement.innerHTML = `
    <hero-section></hero-section>
    <carte-section></carte-section>
  `;
}
