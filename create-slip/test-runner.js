const STATUS = Object.freeze({
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
});

class TestReport {
  #passed = 0;
  #failed = 0;
  #skipped = 0;
  #results = [];

  get passed() { return this.#passed; }
  get failed() { return this.#failed; }
  get skipped() { return this.#skipped; }
  get results() { return this.#results; }

  addTestResult(desc, passed, error) {
    const status = passed ? STATUS.PASSED : STATUS.FAILED;
    this.#results.push({desc, status, error});
    passed ? this.#passed++ : this.#failed++;
  }

  addGroupResult(desc, report) {
    const status = report.failed === 0 ? STATUS.PASSED : STATUS.FAILED;
    this.#results.push({desc, status, report});
    this.#passed += report.passed;
    this.#failed += report.failed;
    this.#skipped += report.skipped;
  }

  addSkipped(desc) {
    const status = STATUS.SKIPPED;
    this.#results.push({desc, status});
    this.#skipped++;
  }
}

class TestRunner {
  #root = [];
  #currentGroup = this.#root;

  constructor() {
    this.describe.skip = (...args) => this.#skip(...args);
    this.it.skip = (...args) => this.#skip(...args);
    this.it.each = (...args) => this.#each(...args);
  }

  describe = (desc, fn) => {
    if (!fn) {
      this.#currentGroup.push({ desc });
      return;
    }

    const group = [];
    const oldGroup = this.#currentGroup;
    this.#currentGroup = group;
    try {
      fn();
    } catch (e) {
      console.log('Error while describing ' + desc);
      console.error(e);
    }
    this.#currentGroup = oldGroup;

    this.#currentGroup.push({ desc, group });
  }

  it = (desc, fn) => {
    if (!fn) return void (this.#skip(desc));
    this.#currentGroup.push({ desc, test: fn });
  }

  #skip = (desc) => {
    this.#currentGroup.push({ desc });
  }

  #each = (runs, desc, fn) => {
    if (!fn) {
      this.#currentGroup.push({ desc });
      return;
    }

    runs.forEach(args => {
      const runDesc = `${desc} [${args}]`
      const runFn = () => fn(...args);
      this.it(runDesc, runFn);
    });
  }

  run = (options={}) => {
    const { Renderer=TestReportRenderer } = options;

    const report = this.#execute(this.#root);
    console.log(report);
    
    const renderer = new Renderer();
    renderer.renderResults(report);
    renderer.renderSummary(report);
  }

  #execute(group) {
    const report = new TestReport();

    group.forEach(unit => {
      const { desc, test, group } = unit;

      if (test) {
        try {
          test();
          report.addTestResult(desc, true);
        } catch(error) {
          report.addTestResult(desc, false, error);
        }
      } else if (group) {
        const subReport = this.#execute(group);
        report.addGroupResult(desc, subReport);
      } else {
        report.addSkipped(desc);
      }
    });

    return report;
  }
}

class TestReportRenderer {
  #indent = '  ';

  #FLAGS = Object.freeze({
    [STATUS.PASSED]:  '✔',
    [STATUS.FAILED]:  '✗',
    [STATUS.SKIPPED]: '-',
    ERROR:            '↳',
    EMPTY:            ' ',
  });

  #COLOR = Object.freeze({
    PASSED:  'lime',
    FAILED:  'tomato',
    SKIPPED: 'grey',
    ERROR:   'red',
    NORMAL:  'white',
  });

  #MAPCOLOR = Object.freeze({
    [STATUS.PASSED]:  this.#COLOR.PASSED,
    [STATUS.FAILED]:  this.#COLOR.FAILED,
    [STATUS.SKIPPED]: this.#COLOR.SKIPPED,
  });
  
  renderResults(report) {
    this.#renderResults(report);
  }

  #renderResults(report, indent='') {
    report.results.forEach(result => {
      const {desc, status, error, report: subReport} = result;
      const flag = this.#FLAGS[status];
      const color = this.#MAPCOLOR[status];

      const formattedLogLines = [
        `%c${indent}${flag} ${desc}`
        ,`color: ${color}`
      ];

      if (error) {
        formattedLogLines[0] += `\n%c${indent}${this.#FLAGS.EMPTY} ${this.#FLAGS.ERROR} ${error.message}`;
        formattedLogLines.push(`color: ${this.#COLOR.ERROR}`);
      } 
      
      console.log(...formattedLogLines);
      
      if (subReport) this.#renderResults(subReport, indent + this.#indent);
    });
  }

  renderSummary(report) {
    const { passed, failed, skipped } = report;
    const { PASSED, FAILED, SKIPPED, ERROR, NORMAL } = this.#COLOR;
    const color = (n, color) => n > 0 ? color: NORMAL;
    const size = '20px';

    console.log(
      '%cResults\n'
        + `%c${this.#indent}Passed:  %c${passed}\n`
        + `%c${this.#indent}Failed:  %c${failed}\n`
        + `%c${this.#indent}Skipped: %c${skipped}`,
      `font-size: ${size}`, 
      '', `font-size: ${size}; color: ${color(passed, PASSED)}`,
      '', `font-size: ${size}; color: ${color(failed, FAILED)}`,
      '', `font-size: ${size}; color: ${color(skipped, SKIPPED)}`,
    );
    
    const errors = [];
    function getErrors(report) {
      report.results.forEach(result => {
        if (result.status !== STATUS.FAILED) return;
        
        const { desc, error, report } = result;
        if (error) errors.push({ desc, error });
        if (report) getErrors(report);
      });
    }

    getErrors(report);

    errors.forEach(({ desc, error }) => {
      console.error(`%c${desc}\n`, `font-size: ${size}; color: ${FAILED}`, error);
    });
  }
}

function throwError(skip, message) { if (!skip) throw new Error(message); }

function expect(a) {
  return new Proxy({
    toEqual: (b) => throwError(a === b, `expect(${a}).toEqual(${b})`),
    toBePrecisely: (b, precision=6) => throwError(Math.abs(a - b) < 1/10**precision, `expect(${a}).toBePrecisely(${b}, ${precision})`),
  }, {
    get: function (target, prop, receiver) {
      if (!Object.prototype.hasOwnProperty.call(target, prop)) {
        throw new Error(`expect(...).${prop} is not a supported expectation.`);
      }
      return Reflect.get(...arguments);
    }
  });
}

export { TestRunner, expect }