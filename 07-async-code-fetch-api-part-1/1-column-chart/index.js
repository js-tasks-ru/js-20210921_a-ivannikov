import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element;
  chartHeight = 50;

  constructor({
    url = 'api/dashboard/orders',
    label = '',
    link = '',
    range = {},
    formatHeading = value => value,
  } = {}) {
    const now = new Date();

    this.url = new URL(url, BACKEND_URL);
    this.label = label;
    this.link = link;
    this.range = {
      from: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      to: now,
      ...range
    };
    this.formatHeading = formatHeading;
    this.render();
    this.update(range.from, range.to);
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          ${this.label}
          ${this.renderLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
          </div>
          <div data-element="body" class="column-chart__chart">
          </div>
        </div>
      </div>
    `
  }

  renderLink() {
    return this.link ?
      `<a href="${this.link}" class="column-chart__link">View all</a>` :
      '';
  }

  renderData(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;
    let sum = 0;

    this.subElements.body.innerHTML = data.map(item => {
      sum += item;
      const value = Math.floor(item * scale);
      const percent = (100 * item / maxValue).toFixed(0) + '%';
      return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
    }).join('');
    this.subElements.header.innerHTML = this.formatHeading(sum);
  }

  showSkeleton() {
    this.element.classList.add('column-chart_loading');
  }

  hideSkeleton() {
    this.element.classList.remove('column-chart_loading');
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll(`[data-element]`);

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
  }

  async update(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    this.showSkeleton();

    const data = await fetchJson(this.url);

    this.renderData(Object.values(data));

    this.hideSkeleton();
    return data;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
