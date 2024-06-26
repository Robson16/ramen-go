import ramenGoLogo from '/svg/ramen-go-logo.svg';
import arrowRight from '/svg/arrow-right.svg';
import heroIllustration from '/svg/hero-illustration.svg';

class HeroSection extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setupScrollToCarte();
  }

  render() {
    this.innerHTML = `
      <section class="hero">
        <div class="container">
          <img class="logo" src="${ramenGoLogo}" alt="Ramen Go!">
          <div class="texts">
            <span lang="ja">ラーメン</span>
            <strong>GO!</strong>
            <p>Enjoy a good ramen in the comfort of your house. Create your own ramen and choose your favorite flavour combination!</p>
            <a href="#" id="cta" class="cta">
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

  setupScrollToCarte() {
    const ctaButton = this.querySelector('#cta');
    ctaButton.addEventListener('click', () => {
      const carteSection = document.querySelector('#carte');
      carteSection.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

customElements.define('hero-section', HeroSection);
