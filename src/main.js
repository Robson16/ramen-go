// Imports the main SASS file. Vite's build process will compile this into CSS
// and apply it to the entire application.
import './sass/styles.scss';

// Imports and executes the router setup file. This initializes the Navigo router
// and defines the application's routes ('/' and '/success/:description').
import './router';

// Imports the Web Component definitions. Simply importing these files executes the
// code within them, including the `customElements.define()` call, which registers
// the custom tags `<hero-section>` and `<carte-section>` with the browser.
import './components/hero-section';
import './components/carte-section';