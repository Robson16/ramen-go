import router from '../router';
import arrowRight from '/svg/white-arrow-right.svg';

class CarteSection extends HTMLElement {
  constructor() {
    super();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const IMAGES_BASE_URL = import.meta.env.VITE_IMAGES_BASE_URL;
    const API_KEY = import.meta.env.VITE_API_KEY;

    this.apiKey = API_KEY;
    this.imagesBaseUrl = `${IMAGES_BASE_URL}`;
    this.ordersApiEndPoint = `${API_BASE_URL}/orders`;
    this.brothsApiEndPoint = `${API_BASE_URL}/broths`;
    this.proteinsApiEndPoint = `${API_BASE_URL}/proteins`;
    this.broths = [];
    this.proteins = [];
    this.rendered = false; // Flag to control if it has already rendered
  }

  connectedCallback() {
    this.getIngredients().then(() => {
      this.render();
      this.setupFormListeners();
    });

    this.addEventListener('submit', this.handleSubmit.bind(this));
  }

  render() {
    if (this.broths.length > 0 && this.proteins.length > 0 && !this.rendered) {
      // Checks if the data is loaded and has not yet been rendered
      this.innerHTML = `
        <section class="carte">
          <div class="container">
            <form id="orderForm">
              <p class="title">First things first: select your favorite broth.</p>
              <p class="subtitle">It will give the whole flavor on your ramen soup.</p>
            
              <div class="options-group">
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

      this.rendered = true; // Mark as rendered
    }
  }

  setupFormListeners() {
    const form = this.querySelector('#orderForm');
    const inputs = form.querySelectorAll('input[type="radio"]');
    const submitButton = form.querySelector('.submit');

    inputs.forEach(input => {
      input.addEventListener('change', () => {
        this.checkFormValidity(form, submitButton);
      });
    });
  }

  checkFormValidity(form, submitButton) {
    const isValid = form.checkValidity();
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

  async fetchData(url) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  }

  async getIngredients() {
    try {
      const [brothsResult, proteinsResult] = await Promise.all([
        this.fetchData(this.brothsApiEndPoint),
        this.fetchData(this.proteinsApiEndPoint),
      ]);

      this.broths = brothsResult.broths;
      this.proteins = proteinsResult.proteins;

      // After loading the data, call render() again to update the interface
      this.render();
    } catch (error) {
      console.error('Houve um problema com a chamada fetch:', error);
    }
  }

  async handleSubmit(event) {
    event.preventDefault();

    const form = new FormData(event.target);

    try {
      const response = await fetch(this.ordersApiEndPoint, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(form.entries()))
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      const { description } = await response.json();

      // Redirecionar para a view de sucesso
      router.navigate(`/success/${description}`);
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  }
}

customElements.define('carte-section', CarteSection);
