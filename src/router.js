import Navigo from 'navigo';
import { home } from './views/home-view';

const root = null;
const useHash = false;
const hash = '#';
const router = new Navigo(root, useHash, hash);

router.on({
  '/': () => home(),
  '/about': () => {},
  '/contact': () => {}
}).resolve();
