# ExcelOps shared navigation

All page headers now use one shared navigation source:

`/js/nav-data.js`

To add a future module across the site, edit only `window.EXCELOPS_NAV_ITEMS` in that file:

```js
{ label: 'New Module', href: '/pages/new-module' }
```

The HTML files also include the same links as a static fallback, so the navigation is visible before JavaScript runs and remains crawler-friendly. The runtime script in `/js/main.js` re-renders the desktop and mobile menus from `EXCELOPS_NAV_ITEMS`, which prevents old landing pages such as `/shortcuts/*.html` from missing new modules.
