// Imports assets to be used in the view's HTML template.
import ramenGoLogo from '/svg/ramen-go-logo.svg';
import ramenImage from '/images/ramen.png'
import arrowRight from '/svg/arrow-right.svg';
import bowing from '/svg/bowing.svg';

// This function renders the order success view.
// It takes the order description as a parameter to display it to the user.
export function successView(description) {
  // Finds the main container element in the DOM where the application will be rendered.
  const appElement = document.getElementById('app');

  // Sets the inner HTML of the main container to the success page layout.
  // It uses a template literal to build the HTML and interpolates the imported assets
  // and the 'description' parameter. The 'description' comes from the API response
  // and is passed via the router.
  appElement.innerHTML = `
    <section class="success">
      <img class="logo" src="${ramenGoLogo}" alt="Ramen Go!">
      <div class="col">
        <img class="illustration" src="${ramenImage}" alt="Ramen">
        <span>Your Order:</span>
        <strong>${description}</strong>
      </div>
      <div class="col">
        <img class="bowing" src="${bowing}" alt="bowing">
        <span lang="ja">どもありがとうございます。</span>
        <strong>Your order is being prepared</strong>
        <p>Hold on, when you least expect you will be eating your rámen.</p>
        <a href="/" class="cta">
          PLACE NEW ORDER
          <img src="${arrowRight}" alt="arrow right icon">
        </a>
      </div>
    </section>
  `;
} 
