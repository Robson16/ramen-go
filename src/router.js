import Navigo from 'navigo';
import { homeView } from './views/home-view';
import { successView } from './views/success-view';

const root = null;
const useHash = false;
const hash = '#';
const router = new Navigo(root, useHash, hash);

router
  .on('/', homeView)
  .on('/success/:description', ({ data }) => {
    successView(data.description);
  })
  .resolve();

export default router;