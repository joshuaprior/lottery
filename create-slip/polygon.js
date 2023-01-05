const LINES = {
  TOP: 0,
  RIGHT: 1,
  BOTTOM: 2,
  LEFT: 3,
}

const POINTS = {
  LEFT_TOP: 0,
  RIGHT_TOP: 1,
  RIGHT_BOTTOM: 2,
  LEFT_BOTTOM: 3,
}

const parsePoint = (str) => str.split(',').map(n => Number(n));
const parsePoints = (str) => str.split(' ').map(parsePoint);



class Polygon {
  #mode = 'none';
  #lastRenderedMode = 'none';

  constructor(g) {
    this.#g = g;

    Object.defineProperties(g, {
      lines: {
        get: () => this.lines,
        set: (lines) => this.lines = lines,
      },

      mode: { 
        get: () => this.mode,
        set: (mode) => this.mode = mode,
      },

      edit: {
        value: () => this.edit(),
      },

      render: {
        value: () => this.render(),
      }
    });
  }

  get lines() {
    const lines = new Array(4);
    const points = parsePoints(this.#g);
    const { TOP, BOTTOM, LEFT, RIGHT } = LINES;
    const { LEFT_TOP, RIGHT_TOP, LEFT_BOTTOM, RIGHT_BOTTOM } = POINTS;

    lines[ TOP    ] = [points[ LEFT_TOP    ], points[ RIGHT_TOP    ]];
    lines[ BOTTOM ] = [points[ LEFT_BOTTOM ], points[ RIGHT_BOTTOM ]];
    lines[ LEFT   ] = [points[ LEFT_TOP    ], points[ LEFT_BOTTOM  ]];
    lines[ RIGHT  ] = [points[ RIGHT_TOP   ], points[ RIGHT_BOTTOM ]];
    
    return lines;
  }

  set lines(lines) {

  }

  get mode() {
    return this.#mode;
  }

  set mode(mode) {
    if (mode === this.#mode) return;
    this.#mode = mode;
    this.render();
  }

  edit() {

  }

  render() {
    if (this.#mode === this.#lastRenderedMode) return;
    
      mode === 'box' ? this.#renderAsBox()
    : mode === 'points' ? this.#renderAsPoints()
    : mode === 'none' ? this.#empty()
    : undefined;
  }

  #empty() {
    [...this.#g.childNodes].forEach(c => g.removeChild(c));
  }

  #renderAsBox() {
    this.#empty();

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', g.dataset.points);
    polygon.setAttribute('preserveAspectRatio', "xMaxMinY");
    polygon.setAttribute('stroke', g.dataset.color);
    polygon.setAttribute('strokeWidth', ".5");
    polygon.setAttribute('fill', "none");
    g.appendChild(polygon);

    .points('0,0 1,1 1,-1')
    .preserveAspectRatio('xMaxMinY')
    .stroke('black')
    .strokeWidth(.5)
    .fill('none')
  }
}

function polygon(g) {
  Object.defineProperties(el, {

  });
}