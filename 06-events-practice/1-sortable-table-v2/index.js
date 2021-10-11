export default class SortableTable {
  element;
  subElements = {};
  headerCells = {};
  locales = ['ru', 'en'];
  compareOptions = { caseFirst: "upper" };

  onHeaderClick = event => {
    const { id, order: oldOrder } = event.currentTarget.dataset;
    this.sort(id, oldOrder === 'desc' ? 'asc' : 'desc');
  };

  constructor(headerConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.headerConfig = headerConfig;
    this.data = [...data];
    this.sorted = sorted;
    this.render();
    this.addEventListeners();
  }

  get arrowTemplate() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
  }

  renderArrow() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.arrowTemplate;
    return wrapper.firstElementChild;
  }

  get template() {
    return `
      <div class="sortable-table">

        <div data-element="header" class="sortable-table__header sortable-table__row">
        </div>

        <div data-element="body" class="sortable-table__body">
        </div>

        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>

      </div>
    `;
  }

  getSubElements(element, attribute) {
    const result = {};
    const elements = element.querySelectorAll(`[data-${attribute}]`);

    for (const subElement of elements) {
      const name = subElement.dataset[attribute];

      result[name] = subElement;
    }

    return result;
  }

  renderHeaderCell(config) {
    const { id, title, sortable } = config;
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
      </div>
    `;
  }

  renderHeaderRow() {
    return this.headerConfig
      .map(config => this.renderHeaderCell(config))
      .join('');
  }

  renderCell(data, template) {
    return template ?
      template(data) :
      `<div class="sortable-table__cell">${data}</div>`;
  }

  renderRow(data) {
    return `
      <a href="/products/${data.id}" class="sortable-table__row">
        ${this.headerConfig
          .map(config => this.renderCell(data[config.id], config.template))
          .join('')}
      </a>
    `;
  }

  renderBody() {
    return this.data
      .map(data => this.renderRow(data))
      .join('');
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element, 'element');
    this.subElements.arrow = this.renderArrow();
    this.subElements.header.innerHTML = this.renderHeaderRow();
    this.subElements.headerCells = this.getSubElements(this.subElements.header, 'id');

    if (this.sorted.id && this.sorted.order) {
      this.sort(this.sorted.id, this.sorted.order);
    } else {
      this.subElements.body.innerHTML = this.renderBody();
    }
  }

  getCompareFunction(field, sortType, direction) {
    const baseCompare = {
      number: (a, b) => a[field] - b[field],
      string: (a, b) => a[field].localeCompare(
        b[field],
        this.locales,
        this.compareOptions
      )
    }[sortType];

    return {
        asc: (a, b) => baseCompare(a, b),
        desc: (a, b) => -baseCompare(a, b),
    }[direction];
  }

  removeArrow() {
    this.subElements.arrow.remove();
  }

  appendArrow(field, direction) {
    const cell = this.subElements.headerCells[field];
    if (cell) {
      cell.append(this.subElements.arrow);
      cell.dataset.order = direction;
    }
  }

  resetOrders() {
    Object.values(this.subElements.headerCells).forEach(cell => cell.dataset.order = '');
  }

  sort(field, direction) {
    const header = this.headerConfig.find(item => item.id === field);

    if (header === undefined || !header.sortable) return;

    const compare = this.getCompareFunction(field, header.sortType, direction);
    this.data.sort(compare);

    this.subElements.body.innerHTML = this.renderBody();

    this.resetOrders();
    this.removeArrow();
    this.appendArrow(field, direction);
  }

  addEventListeners() {
    Object.values(this.subElements.headerCells).forEach(cell => {
      if (cell.dataset.sortable === "true") {
        cell.addEventListener('pointerdown', this.onHeaderClick);
      }
    });
  }

  removeEventListeners() {
    if (!this.subElements) return;
    Object.values(this.subElements.headerCells).forEach(cell => {
      if (cell.dataset.sortable === "true") {
        cell.removeEventListener('pointerdown', this.onHeaderClick);
      }
    });
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
    this.element = null;
    this.subElements = null;
  }
}
