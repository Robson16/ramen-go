// Imports the router to navigate to other pages.
import router from '../router';
// Imports the arrow icon to be used in the submit button.
import arrowRight from '/svg/white-arrow-right.svg';

// Defines the class for our <carte-section> Web Component.
// It extends HTMLElement, the base class for all HTML elements.
class CarteSection extends HTMLElement {
  constructor() {
    // Always call super() first in the constructor.
    super();
    // Attaches a Shadow DOM to the element. This encapsulates the component's HTML and CSS,
    // preventing global styles from affecting it and vice-versa.
    this.attachShadow({ mode: 'open' });

    // Gets environment variables defined in the .env file.
    // Vite replaces 'import.meta.env' with the correct values during the build process.
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const IMAGES_BASE_URL = import.meta.env.VITE_IMAGES_BASE_URL;
    const API_KEY = import.meta.env.VITE_API_KEY;

    // Initializes class properties that will be used throughout the component.
    this.apiKey = API_KEY;
    this.imagesBaseUrl = `${IMAGES_BASE_URL}`;
    this.ordersApiEndPoint = `${API_BASE_URL}/orders`;
    this.brothsApiEndPoint = `${API_BASE_URL}/broths`;
    this.proteinsApiEndPoint = `${API_BASE_URL}/proteins`;

    // Arrays to store the data that will be fetched from the API.
    this.broths = [];
    this.proteins = [];

    // Flag to control if the component has already been rendered,
    // preventing unnecessary re-renders.
    this.rendered = false;
  }

  // Lifecycle method, called automatically when the element is added to the DOM.
  connectedCallback() {
    // Starts fetching ingredients from the API. When the fetch is complete (Promise resolved),
    // it renders the content and sets up the form event listeners.
    this.getIngredients().then(() => {
      this.render();
      this.setupFormListeners();
    });
  }

  render() {
    // Condition to ensure rendering happens only once,
    // and only after both broths and proteins data have been loaded.
    if (this.broths.length > 0 && this.proteins.length > 0 && !this.rendered) {
      // Sets the HTML content inside the component's Shadow DOM.
      this.shadowRoot.innerHTML = `
        <section id="carte" class="carte">
          <div class="container">
            <form id="orderForm">
              <p class="title">First things first: select your favorite broth.</p>
              <p class="subtitle">It will give the whole flavor on your ramen soup.</p>
            
              <div class="options-group">
                {/* Iterates over the broths list and creates an input/label for each one. */}
                ${this.broths.map(broth => `
                  <input type="radio" id="${broth.id}" name="brothId" value="${broth.id}" required>
                  <label class="option" for="${broth.id}">
                    <img class="img-active" src="${this.imagesBaseUrl}/${broth.imageActive}" alt="${broth.name}"> 
                    <img class="img-inactive" src="${this.imagesBaseUrl}/${broth.imageInactive}" alt="${broth.name}"> 
                    <span class="name">${broth.name}</span>
                    <span class="description">${broth.description}</span>
                    <span class="price">US$ ${broth.price}</span>
                  </label>
                `).join('')}
              </div>

              <p class="title">It’s time to choose (or not) your meat!</p>
              <p class="subtitle">Some people love, some don’t. We have options for all tastes.</p>
              
              <div class="options-group">
                {/* Iterates over the proteins list and creates an input/label for each one. */}
                ${this.proteins.map(protein => `
                  <input type="radio" id="${protein.id}" name="proteinId" value="${protein.id}" required>
                  <label class="option" for="${protein.id}"> 
                    <img class="img-active" src="${this.imagesBaseUrl}/${protein.imageActive}" alt="${protein.name}"> 
                    <img class="img-inactive" src="${this.imagesBaseUrl}/${protein.imageInactive}" alt="${protein.name}"> 
                    <span class="name">${protein.name}</span>
                    <span class="description">${protein.description}</span>
                    <span class="price">US$ ${protein.price}</span>                   
                  </label>
                `).join('')}
              </div>
              <button class="submit button" type="submit">
                ORDER NOW
                <img src="${arrowRight}" alt="arrow right icon">
              </button>
            </form>
          </div>
        </section>
      `;

      // Updates the flag to indicate that the initial render is complete.
      this.rendered = true;
    }
  }

  // Sets up the event listeners for the form.
  setupFormListeners() {
    // Queries for elements inside the Shadow DOM to ensure encapsulation.
    const form = this.shadowRoot.querySelector('#orderForm');
    const inputs = form.querySelectorAll('input[type="radio"]');
    const submitButton = this.shadowRoot.querySelector('.submit');

    // Adds a listener to each radio input.
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        // On every selection change, check if the form is valid to enable the button.
        this.checkFormValidity(form, submitButton);
      });
    });

    // Adds a listener for the form's 'submit' event.
    // .bind(this) ensures that 'this' inside handleSubmit refers to the CarteSection class instance.
    form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  // Checks if the form is valid and updates the submit button's state.
  checkFormValidity(form, submitButton) {
    // The native checkValidity() method returns true if all 'required' fields are filled.
    const isValid = form.checkValidity();
    // Enables or disables the button based on validity.
    if (isValid) {
      submitButton.classList.remove('button-inactive');
      submitButton.classList.add('button-active');
      submitButton.disabled = false;
    } else {
      submitButton.classList.remove('button-active');
      submitButton.classList.add('button-inactive');
      submitButton.disabled = true;
    }
  }

  // Generic and asynchronous helper function to make 'GET' requests to the API.
  async fetchData(url) {
    // Makes the fetch call with the 'x-api-key' header required for authentication.
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      }
    });

    // Throws an error if the network response is not successful (e.g., status 404, 500).
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // Returns the response data in JSON format.
    return await response.json();
  }

  // Asynchronous method to fetch broths and proteins data from the API.
  async getIngredients() {
    try {
      // Uses Promise.all to execute both API calls in parallel, optimizing load time.
      const [brothsResult, proteinsResult] = await Promise.all([
        this.fetchData(this.brothsApiEndPoint),
        this.fetchData(this.proteinsApiEndPoint),
      ]);

      this.broths = brothsResult.broths;
      this.proteins = proteinsResult.proteins;

      // After loading the data, call render() again to ensure the interface is updated.
      this.render();
    } catch (error) {
      // Catches and logs any error that occurs during the API calls.
      console.error('Houve um problema com a chamada fetch:', error);
    }
  }

  // Method that handles the form submission.
  async handleSubmit(event) {
    // Prevents the default form behavior, which would be to reload the page.
    event.preventDefault();

    // Creates a FormData object from the form element to capture its values.
    const form = new FormData(event.target);

    try {
      // Sends the order data (brothId and proteinId) to the API via POST method.
      const response = await fetch(this.ordersApiEndPoint, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(form.entries()))
      });

      // Throws an error if the submission fails.
      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      // Extracts the order description from the API response.
      const { description } = await response.json();

      // Uses the router (Navigo) to navigate to the success page,
      // passing the order description as a URL parameter.
      router.navigate(`/success/${description}`);
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  }
}

// Registers the new custom element with the browser.
// The first argument ('carte-section') is the HTML tag name you will use.
// The second argument (CarteSection) is the class that controls the tag's behavior.
customElements.define('carte-section', CarteSection);
