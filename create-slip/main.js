document.currentScript.define(async () => {
  const { Element } = await require('./document.js');
  window.Element = Element;
});