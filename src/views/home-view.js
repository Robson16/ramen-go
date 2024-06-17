import ramenGoLogo from '/svg/ramen-go-logo.svg';
import arrowRight from '/svg/arrow-right.svg';
import heroIllustration from '/svg/hero-illustration.svg';

export function home() {
  const appElement = document.getElementById('app');

  appElement.innerHTML = `
    <hero-section></hero-section>
    <carte-section></carte-section>
  `;
}
