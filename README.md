# excelops

## Deployment notes

This project is ready for GitHub + Vercel deployment. Upload the repository contents to GitHub, then import the repository in Vercel. `vercel.json` enables clean URLs and long-lived caching for templates and static assets.

SEO improvements included in this version:

- Clean internal links without `.html`
- Open Graph and Twitter Card metadata
- Shared social image at `/assets/og-image.png`
- JSON-LD structured data for the home page, template library, articles, and utility pages
- Accessible mobile menu button with `aria-expanded` and `aria-controls`
- Static navigation/footer kept in HTML instead of JavaScript replacement
