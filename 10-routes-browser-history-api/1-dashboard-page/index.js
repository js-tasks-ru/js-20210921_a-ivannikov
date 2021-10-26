import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  childComponents;
  subElements;

  constructor() {
    this.createChildComponents();
  }

  get template() {
    return `
      <div class="dashboard full-height flex-column">
        <div data-element="topPanel" class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div class="dashboard__charts">
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
         <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>
        <h3 class="block-title">Лидеры продаж</h3>
        <div data-element="sortableTable"></div>
      </div>`;
  }

  getMonthAgoDate() {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  }

  createChildComponents() {
    const range = {
      from: this.getMonthAgoDate(),
      to: new Date(),
    };

    this.childComponents = {
      rangePicker: new RangePicker(range),

      ordersChart: new ColumnChart({
        url: 'api/dashboard/orders',
        range: range,
        label: 'orders',
      }),

      salesChart: new ColumnChart({
        url: 'api/dashboard/sales',
        range: range,
        label: 'sales',
        formatHeading: data => `$${data}`,
      }),

      customersChart: new ColumnChart({
        url: 'api/dashboard/customers',
        range: range,
        label: 'customers',
      }),

      sortableTable: new SortableTable(header, {
        url: 'api/dashboard/bestsellers',
        isSortLocally: true,
      }),
    }
  }

  destroyChildComponents() {
    for (const component of Object.values(this.childComponents)) {
      component.destroy();
    }
  }

  appendChildComponents() {
    for (const [name, component] of Object.entries(this.childComponents)) {
      this.subElements[name].append(component.element);
    }
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

    this.appendChildComponents();

    this.addEventListeners();

    return this.element;
  }

  onDateSelect = (event) => {
    const { from, to } = event.detail;

    this.childComponents.ordersChart.update(from, to);
    this.childComponents.salesChart.update(from, to);
    this.childComponents.customersChart.update(from, to);
  }

  addEventListeners() {
    this.element.addEventListener('date-select', this.onDateSelect)
  }

  removeEventListeners() {
    this.element?.removeEventListener('date-select', this.onDateSelect)
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.destroyChildComponents();
    this.removeEventListeners();
    this.element = null;
    this.subElements = null;
    this.childComponents = null;
  }
}
