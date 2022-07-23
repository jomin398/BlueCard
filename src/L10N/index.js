L10N_STRING = '';
const L10N = new class L10N {
  constructor() {
    this.data = {};
    this._l = "en";
  }
  /**
   * @param {String} str L10N_STRING
   */
  append(str) {
    let lines = str.trim().split('\n');
    let currKey = "",
      data = {};
    lines.forEach((line) => {
      if (line[0] === '#') return;
      if (line[0] === ' ' || line[0] === '\t') {
        line = line.trim();
        if (line === "") return;
        if (!(currKey in data)) data[currKey] = {};
        const match = line.match(/^([a-z\-]+):\s*(\S.*)$/i);
        if (match) data[currKey][match[1].toLowerCase()] = match[2];
      } else {
        if (line === "") return;
        currKey = line.trim();
      }
    });
    if (this.data) {
      Object.assign(this.data, data)
    } else {
      this.data = data;
    }
  }
  _d() { return this.data };
  t(id, ...args) {
    this.append(window.L10N_STRING)
    if (!(id in this.data)) return id;
    const values = this.data[id];

    if (!(this._l in values)) return id;
    let str = values[this._l].replace(/%([\d%])/g, (txt, ind) => ind === '%' ? '%' : ind > 0 && ind <= args.length ? args[ind - 1] : txt);
    return str;
  };
  l(l) {
    this._l = l.toLowerCase();
    [].forEach.call(document.querySelectorAll("button,span,h1,h2,h3,h4,h5,h6,label"), (elem) => {
      [].forEach.call(elem.classList, (className) => {
        let id = "";
        switch (elem.tagName.toUpperCase()) {
          case 'BUTTON':
            id = className;
            break;
          default:
            if (!className.startsWith("txt-")) return;
            id = className.slice(4);
        }
        if (!(id in this.data)) return;
        elem.innerText = this.t(id);
      });
    });
  }
}
