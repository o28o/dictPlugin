# dpdPlugin

Simple yet very convenient Pali Lookup Dictionary for any site.

It might be slightly outdated, please check the latest version on [read.dhamma.gift](https://dhamma.gift/sc/?q=sn56.11)

This plugin uses Digital Pali Dictionary as Pali Dictionary. More information about [DPD here](https://github.com/digitalpalidictionary/dpd-db). 

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

4. JavaScript should be applied after the Pali text, e.g., at the end of the <body> section. You can modify connection url or desired endpoint in this file:
   ```html
   <script src="assets/js/paliLookup.js"></script>

