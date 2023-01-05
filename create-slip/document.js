document.currentScript.define(() => {
  function Element(...args) {
    const el = args.length === 1 ?
      document.createElement(...args)
      : document.createElementNS(...args);
    
    return new Proxy({
      build: () => el
    }, {
      get: (...args) => {
        const [, prop, proxy] = args;
        if (prop === 'build') return Reflect.get(...args);
  
        return (value) => {
          const attribute = prop.replace(/_/g, '-');
          el.setAttribute(attribute, value);
          return proxy;
        }
      }
    });
  }
  
  module({ Element });
});
