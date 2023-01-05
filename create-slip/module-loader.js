(() => {
  (() => {
    const modules = {};

    function require(file) {
      if (!modules[file]) {
        modules[file] = loadModule(file);
      }

      return modules[file];
    }

    function loadModule(file) {
      return new Promise((resolve, reject) => {
        let defineCalls = 0;

        function define(fn) {
          if (++defineCalls > 1) throw new Error('Multiple defines in the same module. ' + file);
          const error = evalModule(fn, require, module);
          if (error) reject(error);
        }

        function module(module) {
          resolve(module);
        }

        function onload() {
          if (defineCalls < 1) throw new Error('No defines for module. Use `document.currentScript.define(fn)` to define a module. ' + file);
        }

        const script = document.createElement('script');
        script.src = file;
        script.define = define;
        script.onload = () => {
          if (defineCalls < 1) throw new Error('No defines for module. Use `document.currentScript.define(fn)` to define a module. ' + file);
        };

        document.head.appendChild(script);
      });
    }

    const main = document.currentScript.dataset.main;
    setTimeout(() => loadModule(main), 0);
  })();
  

  function evalModule(fn, require, module) {
    try {
      eval(fn.toString())();
    } catch (e) {
      return e;
    }
  }
})();