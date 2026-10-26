# Nandan Bhatkal — Portfolio

A responsive, single-page personal portfolio using an Apple-inspired minimalist layout, a custom 3D avatar based on the supplied profile photograph, and subtle Pokémon/Pokédex-inspired details.

## Features

- Responsive layout for desktop, tablet, and mobile
- Light/dark theme toggle (remembers the selected theme)
- Smooth section navigation and reduced-motion support
- Project category filters and live search
- Five featured GitHub repositories with curated two-sentence descriptions
- Attempts to load additional public, non-fork repositories from the GitHub API; falls back gracefully when offline or rate-limited
- Experience, education, skills, certifications, languages, contact links, and profile PDF

## Run locally

No build tools or package installation are required.

1. Extract this folder.
2. Open `index.html` in a modern browser.
3. For reliable GitHub API loading, serve it over HTTP instead of opening it as a `file://` URL. From this folder, run:

   ```bash
   python -m http.server 8000
   ```

4. Open `http://localhost:8000`.

If the GitHub API is not reachable, the five featured projects will still work, and the GitHub profile link provides the full repository list.

## Publish with GitHub Pages

1. Create a GitHub repository for the portfolio.
2. Upload `index.html`, `style.css`, `script.js`, `README.md`, and the `assets/` folder.
3. In the repository settings, enable GitHub Pages for the branch and root folder containing `index.html`.

## Files

- `index.html` — semantic page structure and content
- `style.css` — visual system, responsive layouts, themes, and animation
- `script.js` — theme toggle, mobile navigation, project search/filter, and optional GitHub repo loading
- `assets/nandan-avatar.png` — generated 3D avatar based on the profile reference photo
- `assets/Nandan_Bhatkal_Profile.pdf` — user-supplied profile PDF linked from the site

## Notes on project content

The featured repository descriptions are based on the public GitHub profile README. Additional repository cards, when loaded, are generated from each repository's public name, description, topics, and language metadata; they use a clearly generic second sentence if repository metadata is sparse.
