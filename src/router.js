// Imports the Navigo library for client-side routing.
import Navigo from 'navigo';
// Imports the view functions that will render the content for each route.
import { homeView } from './views/home-view';
import { successView } from './views/success-view';

// Configuration for the Navigo router.
const root = '/';
const useHash = false;
const hash = '#';

// Creates a new instance of the Navigo router with the specified configuration.
const router = new Navigo(root, useHash, hash);

// Defines the application's routes.
router
  // Defines the route for the homepage ('/').
  // When this URL is matched, it calls the homeView function.
  .on('/', homeView)
  // Defines a parameterized route for the success page.
  // It captures the 'description' part of the URL (e.g., /success/Your-Order-Details).
  .on('/success/:description', ({ data }) => {
    // The callback function extracts the 'description' from the 'data' object
    // provided by Navigo and passes it to the successView function.
    successView(data.description);
  })
  // Tells the router to process the current URL and start listening for changes.
  .resolve();

// Exports the router instance so it can be used elsewhere in the application
// (e.g., in carte-section.js to navigate after a successful order).
export default router;