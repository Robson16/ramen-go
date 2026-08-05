// Imports assets to be used in the component's HTML template.
// Vite (the build tool) processes these imports into correct file paths.
import ramenGoLogo from '/svg/ramen-go-logo.svg';
import arrowRight from '/svg/arrow-right.svg';
import heroIllustration from '/svg/hero-illustration.svg';
// Imports the global styles as a string to be injected into the Shadow DOM.
import globalStyles from '../sass/styles.scss?inline';

// Defines the class for our Web Component.
// It extends HTMLElement, the base class for all HTML elements in the DOM.
class HeroSection extends HTMLElement {
  constructor() {
    super();
    // Attach a shadow DOM tree to the component for encapsulation.
    this.attachShadow({ mode: 'open' });
  }

  // connectedCallback is a lifecycle method for Web Components.
  // It's automatically called by the browser when the <hero-section> element
  // is inserted into the DOM.
  connectedCallback() {
    // First, render the component's HTML content.
    this.render();
    // Then, set up click events and other interactions.
    this.setupScrollToCarte();
  }

  // This method is responsible for creating and injecting the HTML into our component.
  render() {
    // this.shadowRoot.innerHTML defines the HTML content within the component's shadow DOM.
    // We use template literals (backticks ``) to build the HTML string more readably
    // and to interpolate variables for the imported asset paths.
    this.shadowRoot.innerHTML = `
      <style>
        ${globalStyles}
      </style>
      <section class="hero">
        <div class="container">
          <img class="logo" src="${ramenGoLogo}" alt="Ramen Go!">
          <div class="texts">
            <span lang="ja">ラーメン</span>
            <strong>GO!</strong>
            <p>Enjoy a good ramen in the comfort of your house. Create your own ramen and choose your favorite flavour combination!</p>
            <a href="#carte" id="cta" class="cta">
              ORDER NOW
              <img src="${arrowRight}" alt="arrow right icon">
            </a>
          </div>
          <img class="illustration" src="${heroIllustration}" alt="Delivery girl">
        </div>
        <!-- /.container -->
      </section>
    `;
  }

  // This method sets up the interactivity for the "ORDER NOW" button.
  setupScrollToCarte() {
    // this.shadowRoot.querySelector searches for an element *inside* the component's shadow DOM.
    // This is safer than document.querySelector as it avoids conflicts with the main page.
    const ctaButton = this.shadowRoot.querySelector('#cta');

    // Adds a click event listener to the button.
    ctaButton.addEventListener('click', (event) => {
      // Prevents the default link behavior (jumping to the anchor).
      event.preventDefault();

      // Find the carte-section component in the main document.
      // This is the correct way to target the component, as its internal #carte id is in its own shadow DOM.
      const carteSection = document.querySelector('carte-section');

      // If the section is found, scroll to it smoothly.
      if (carteSection) {
        carteSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

// Registers the new custom element with the browser.
// The first argument ('hero-section') is the HTML tag name you will use.
// The second argument (HeroSection) is the class that controls the tag's behavior.
customElements.define('hero-section', HeroSection);
