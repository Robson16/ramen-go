export function successView(description) {
  const appElement = document.getElementById('app');

  appElement.innerHTML = `
    <h2>Order Successfully Created!</h2>
    <p>Your order is a ${description}</p>
    <a href="/">Back to Home</a>
  `;
}
