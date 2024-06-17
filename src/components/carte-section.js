
class CarteSection extends HTMLElement {
  constructor() {
    super();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const API_KEY = import.meta.env.VITE_API_KEY;

    this.apiKey = API_KEY;
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
              <p>First things first: select your favorite broth.</p>
              <p>It will give the whole flavor on your ramen soup.</p>
  
              ${this.broths.map(broth => `
                <input type="radio" id="${broth.id}" name="brothId" value="${broth.id}" required>
                <label for="${broth.id}">${broth.name}</label>
              `).join('')}
  
              <p>It’s time to choose (or not) your meat!</p>
              <p>Some people love, some don’t. We have options for all tastes.</p>
  
              ${this.proteins.map(protein => `
                <input type="radio" id="${protein.id}" name="proteinId" value="${protein.id}" required>
                <label for="${protein.id}">${protein.name}</label>
              `).join('')}
  
              <input class="button" type="submit" value="Submit">
            </form>
          </div>
        </section>
      `;

      this.rendered = true; // Mark as rendered
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

      // Handle successful submission
      console.log('Order submitted successfully');
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  }
}

customElements.define('carte-section', CarteSection);
