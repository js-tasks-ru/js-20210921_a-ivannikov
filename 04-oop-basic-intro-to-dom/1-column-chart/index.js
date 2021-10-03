export default class ColumnChart {
  chartHeight = 50;

  constructor(params) {
    this.setParams(params);
    this.render();
  }

  setParams(params) {
    this.params = {
      data: [],
      label: 'Total orders',
      link: null,
      value: 0,
      ...params
    };
  }

  getTemplate() {
    const {label, value, formatHeading} = this.params;

    return `
      <div class="column-chart column-chart_loading" style="--chart-height: 50">
        <div class="column-chart__title">
          ${label}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${formatHeading ? formatHeading(value) : value}
          </div>
          <div data-element="body" class="column-chart__chart">
          </div>
        </div>
      </div>
    `
  }

  renderLink() {
    const aTag = document.createElement('a');
    aTag.href = this.params.link;
    aTag.className = 'column-chart__link';
    aTag.innerText = 'View all'
    this.element.querySelector('.column-chart__title').append(aTag);
  }

  renderData() {
    const maxValue = Math.max(...this.params.data);
    const scale = this.chartHeight / maxValue;

    const chart = this.element.querySelector('.column-chart__chart');

    chart.innerHTML = '';

    for (const item of this.params.data) {
      const value = Math.floor(item * scale);
      const percent = (100 * item / maxValue).toFixed(0) + '%';
      chart.insertAdjacentHTML(
        'beforeend',
        `<div style="--value: ${value}" data-tooltip="${percent}"></div>`
      );
    }
  }

  showSkeleton() {
    this.element.classList.add('column-chart_loading');
  }

  hideSkeleton() {
    this.element.classList.remove('column-chart_loading');
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    if (this.params.link) {
      this.renderLink();
    }

    if (this.params.data.length) {
      this.renderData();
      this.hideSkeleton();
    }
  }

  update(data) {
    this.params.data = data;

    if (this.params.data.length) {
      this.renderData();
      this.hideSkeleton();
    } else {
      this.showSkeleton();
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }
}
