import ramenGoLogo from '/svg/ramen-go-logo.svg';
import ramenImage from '/images/ramen.png'
import arrowRight from '/svg/arrow-right.svg';
import bowing from '/svg/bowing.svg';

export function successView(description) {
  const appElement = document.getElementById('app');

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
