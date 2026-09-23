import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function RouteFocus() {
  const { pathname } = useLocation();

  useEffect(() => {
    const h1 = document.querySelector('main h1');
    if (h1 instanceof HTMLElement) {
      if (!h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: true });
      return;
    }
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}
