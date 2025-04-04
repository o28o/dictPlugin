# dictPlugin

There are many ways to get dictionary lookup. Applicable for end users and webmasters.

For those who want to click the word and get the translation of the prefered Online dictionary.

Some methods that are described below were made for Pali Language using Digital Pali Dictionary (DPD), but can be customized to any Language or any Online Dictionary that supports word lookup in the URL parameters like this: https://somedict.online/?word=dukkha (GET parameters)

## for End Users (site list):
**May be you don't need to do anything and can just read on these sites, they have Pali lookup already**

List of sites and apps that have built-in Pali Dictionary:

- [Dhamma Gift](https://dhamma.gift/read.php) 
- [Digital Pali Reader](https://digiralpalireader.online/)
- [SuttaCentral](https://suttacentral.net/) 
- [The Buddha’s Words](https://thebuddhaswords.net/)  
- [Tipitaka.app](https://tipitaka.app)
- [Tipitaka Online](https://tipitakapali.org/)  
- Tipitaka Pali Reader (Android, iOS)

## for End Users (requires installing browser extention or/and setup):
There are another ways to add Pali Lookup for literally any site:

<a href="https://chromewebstore.google.com/detail/dhammagift-search-and-wor/dnnogjdcmhbiobpnkhdbfnfjnjlikabd">
    <img src="https://github.com/o28o/dictPlugin/blob/05cd3024e0642520e46d07e287a6b686e8032068/assets/chrome-store.jpg?raw=true" alt="Google Chrome extension" width="50">
</a> 

[Google Chrome extention](https://chromewebstore.google.com/detail/dhammagift-search-and-wor/dnnogjdcmhbiobpnkhdbfnfjnjlikabd) Not customizable


<a href="https://microsoftedge.microsoft.com/addons/detail/dhammagift-search-and-wo/aokegkhdaijkikbdocanadeghllhfmhj">
    <img src="https://github.com/user-attachments/assets/7a378ce4-cedf-4d98-adcf-a0a8e4a729fe" alt="Microsoft Edge extension" width="50">
</a> 

[Microsoft Edge extention](https://microsoftedge.microsoft.com/addons/detail/dhammagift-search-and-wo/aokegkhdaijkikbdocanadeghllhfmhj) Not customizable

<a href="https://github.com/o28o/dictPlugin/blob/main/ExtentionMethod.md">
    <img src="https://github.com/user-attachments/assets/e20515b1-0061-4af7-8689-95a818ff1932" alt="TamperMonkey Script" width="50">
</a> 

[TamperMonkey User Script](https://github.com/o28o/dictPlugin/blob/main/ExtentionMethod.md) Customizable

## for Webmasters (requires adding js and css to the site code): 
Simple yet very convenient Pali Lookup Dictionary for any site.

This example uses Digital Pali Dictionary as Pali Dictionary but you can modify the link and use any Dictionary of your choice. 
More information about DPD [here](https://github.com/digitalpalidictionary/dpd-db). 

## Demos
These demos might be slightly outdated. 
Please check the latest live version on [Dhamma.gift Read](https://dhamma.gift/sc/?q=sn56.11). Use "comment bubble icon" to turn word lookup on/off and "gear icon" to choose the dictionary layout.

For Demos just click on the "Bubble Icon" to turn word lookup On/Off.

### [English Demo](https://o28o.github.io/plugin/index.html?s=pi$)

### [Russian Demo](https://o28o.github.io/plugin/demo-ru-ml.html?s=dukkh)

## Instructions

To make Pali text clickable:


1.  Clone repo 
2.  The Pali text should be marked with class="pli-lang" e.g. `<span class="pli-lang">Pali text</span>` or \<p\> or \<div\>.
   
3. Styles should be applied in the `<head>` section:
   ```html
   <link rel="stylesheet" href="assets/css/paliLookup.css">
   ```   
4. Button should be added to html inside `<body>` section
```html
    <button class="toggle-dict-btn">
      <img src="assets/svg/comment-slash.svg" class="dictIcon" alt="Toggle Dictionary">
      Toggle Dictionary
    </button>
```
6. JavaScript should be applied after the Pali text, e.g., at the end of the </body> section. You can modify connection url or desired endpoint in this file:
   ```
   <script src="assets/js/paliLookup.js"></script>
   </body>
   </html>
   ```
   

