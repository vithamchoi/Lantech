/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
              "error": "#ba1a1a",
              "error-container": "#ffdad6",
              "surface-container-lowest": "#ffffff",
              "surface-container-low": "#fff1e9",
              "on-secondary-fixed": "#002204",
              "on-secondary-container": "#007520",
              "on-secondary": "#ffffff",
              "on-secondary-fixed-variant": "#005314",
              "on-surface-variant": "#514345",
              "on-tertiary": "#ffffff",
              "primary": "#864e5a",
              "inverse-surface": "#3f2d1e",
              "primary-container": "#ffb7c5",
              "on-primary-container": "#7b4551",
              "on-primary": "#ffffff",
              "secondary-fixed-dim": "#77dd77",
              "primary-fixed-dim": "#fbb3c1",
              "on-error": "#ffffff",
              "on-error-container": "#93000a",
              "on-primary-fixed-variant": "#6b3743",
              "surface-variant": "#fbddc7",
              "surface-container-highest": "#fbddc7",
              "surface-tint": "#864e5a",
              "tertiary-fixed-dim": "#b2cad3",
              "outline-variant": "#d6c2c4",
              "tertiary-fixed": "#cee7f0",
              "tertiary": "#4b626a",
              "on-primary-fixed": "#360c19",
              "surface-container-high": "#ffe3cf",
              "on-tertiary-fixed": "#061e25",
              "surface-bright": "#fff8f5",
              "inverse-on-surface": "#ffede2",
              "inverse-primary": "#fbb3c1",
              "background": "#fff8f5",
              "surface": "#fff8f5",
              "secondary-container": "#92fa90",
              "on-tertiary-container": "#425860",
              "on-tertiary-fixed-variant": "#344a52",
              "tertiary-container": "#b6ced7",
              "surface-container": "#ffeadc",
              "on-background": "#28180b",
              "outline": "#837375",
              "surface-dim": "#f2d4bf",
              "primary-fixed": "#ffd9df",
              "secondary-fixed": "#92fa90",
              "secondary": "#006e1d",
              "on-surface": "#28180b"
      },
      "borderRadius": {
              "DEFAULT": "0.125rem",
              "lg": "0.25rem",
              "xl": "0.5rem",
              "full": "0.75rem"
      },
      "maxWidth": {
              "container-max": "1200px"
      },
      "spacing": {
              "md": "24px",
              "unit": "4px",
              "xs": "8px",
              "lg": "40px",
              "container-max": "1200px",
              "xl": "64px",
              "sm": "16px",
              "gutter": "24px"
      },
      "fontFamily": {
              "body-lg": [
                      "Work Sans"
              ],
              "body-md": [
                      "Work Sans"
              ],
              "headline-lg": [
                      "Space Mono"
              ],
              "headline-md": [
                      "Space Mono"
              ],
              "display-lg": [
                      "Space Mono"
              ],
              "label-sm": [
                      "Space Mono"
              ],
              "label-lg": [
                      "Space Mono"
              ]
      },
      "fontSize": {
              "body-lg": [
                      "18px",
                      {
                              "lineHeight": "1.6",
                              "fontWeight": "400"
                      }
              ],
              "body-md": [
                      "16px",
                      {
                              "lineHeight": "1.6",
                              "fontWeight": "400"
                      }
              ],
              "headline-lg": [
                      "32px",
                      {
                              "lineHeight": "1.2",
                              "fontWeight": "700"
                      }
              ],
              "headline-md": [
                      "24px",
                      {
                              "lineHeight": "1.3",
                              "fontWeight": "700"
                      }
              ],
              "display-lg": [
                      "48px",
                      {
                              "lineHeight": "1.2",
                              "letterSpacing": "-2px",
                              "fontWeight": "700"
                      }
              ],
              "label-sm": [
                      "12px",
                      {
                              "lineHeight": "1.2",
                              "fontWeight": "700"
                      }
              ],
              "label-lg": [
                      "14px",
                      {
                              "lineHeight": "1.2",
                              "fontWeight": "700"
                      }
              ]
      }
    }
  },
  plugins: [
    require('@tailwindcss/container-queries')
  ],
}
