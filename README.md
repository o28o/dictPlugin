# dpdPlugin

Iframe-based simple Pali Lookup Dictionary for any site.

This code uses Digital Pali Dictionary [DPD](https://github.com/digitalpalidictionary/dpd-db) Online. 

## Demos

### [English Demo](https://o28o.github.io/plugin/index.html?s=pi$)

### [Russian Demo](https://o28o.github.io/plugin/demo-ru-ml.html?s=dukkh)

## Instructions

To make Pali text clickable:


1.  Clone repo 
2.  The Pali text should be marked with class="pli-lang" e.g. `<span class="pli-lang">Pali text</span>` or <p> or <div>.
   
3. Styles should be applied in the `<head>` section:
   ```html
   <link rel="stylesheet" href="assets/css/paliLookup.css">

4. JavaScript should be applied after the Pali text, e.g., at the end of the <body> section:
   ```html
   <script src="assets/js/paliLookup.js"></script>

