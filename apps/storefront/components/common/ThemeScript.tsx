export function ThemeScript() {
  // This script runs before React hydration to prevent flash of wrong theme
  const script = `
    (function() {
      var STORAGE_KEY = 'btx-theme';
      var stored = localStorage.getItem(STORAGE_KEY);
      var theme = 'light';

      if (stored === 'dark') {
        theme = 'dark';
      } else if (stored === 'light') {
        theme = 'light';
      } else {
        // System preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          theme = 'dark';
        }
      }

      document.documentElement.classList.add(theme);
    })();
  `

  return <script dangerouslySetInnerHTML={{__html: script}} />
}
