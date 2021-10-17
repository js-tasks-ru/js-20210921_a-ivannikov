import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  limit = 30;
  subElements = {};
  headerCells = {};
  data = [];
  locales = ['ru', 'en'];
  compareOptions = { caseFirst: "upper" };

  constructor(headerConfig, {
    url = '',
    isSortLocally = false,
    sorted = {id: '', order: 'asc'},
  } = {}) {
    this.headerConfig = headerConfig;
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;
    this.url = new URL(url, BACKEND_URL);
    this.wrapper = document.createElement('div');
    this.render();
  }

  onHeaderClick = event => {
    const cell = event.target.closest('[class="sortable-table__cell"]');
    if (!cell) return;

    const { id, order: oldOrder, sortable } = cell.dataset;

    if (sortable === "true") {
      this.sorted.id = id;
      this.sorted.order = oldOrder === 'desc' ? 'asc' : 'desc';
      this.sort(this.sorted.id, this.sorted.order);
    }
  };

  enableLoadingStatus() {
    this.loading = true;
    this.subElements.loading.style.display = 'block';
  }

  disableLoadingStatus() {
    this.subElements.loading.style.display = 'none';
    this.loading = false;
  }

  onScroll = async event => {
    const rect = document.body.getBoundingClientRect();

    if (rect.height - window.scrollY > 1000) return;

    if (this.isSortLocally || this.loading) return;

    const { id, order } = this.sorted;
    const start = this.data.length;
    const end = start + this.limit;

    const data = await this.loadData(id, order, start, end);

    if (data.length > 0) {
      this.data.push(...data);
      data.forEach(item => this.appendRow(item));
    }
  };

  createElementFromHtml(html) {
    this.wrapper.innerHTML = html;
    return this.wrapper.firstElementChild;
  }

  get template() {
    return `
      <div class="sortable-table">

        <div data-element="header" class="sortable-table__header sortable-table__row">
          <div class="sortable-table__cell" data-id="title" data-sortable="true" data-order="asc">
            <span>Name</span>
            <span data-element="arrow" class="sortable-table__sort-arrow">
              <span class="sort-arrow"></span>
            </span>
          </div>
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

  renderHeader() {
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

  appendRow(data) {
    const rowElement = this.createElementFromHtml(this.renderRow(data));
    this.subElements.body.append(rowElement);
  }

  async loadData(id, order, start, end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);
    this.enableLoadingStatus();
    const data = await fetchJson(this.url);
    this.disableLoadingStatus();
    return data;
  }

  displayNoData() {
    this.subElements.emptyPlaceholder.style.display = 'block';
  }

  async render() {
    this.element = this.createElementFromHtml(this.template);

    this.subElements = this.getSubElements(this.element, 'element');
    this.subElements.header.innerHTML = this.renderHeader();
    this.subElements.headerCells = this.getSubElements(this.subElements.header, 'id');

    if (this.isSortLocally) {
      this.data = await this.loadData('', '', 0, this.limit);
    }
    await this.sort(this.sorted.id, this.sorted.order);

    if (this.data.length === 0) {
      this.displayNoData();
    }

    this.addEventListeners();
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

  sortOnClient(id, order) {
    const header = this.headerConfig.find(item => item.id === id);
    if (header === undefined) return;

    const compare = this.getCompareFunction(id, header.sortType, order);

    this.data.sort(compare);
  }

  async sortOnServer(id, order) {
//    this.data = await this.loadData(id, order, 0, this.limit);
    this.data = await this.loadData(id, order, 500, 530);
  }

  async sort(id, order) {
    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      await this.sortOnServer(id, order);
    }

    this.subElements.body.innerHTML = this.renderBody();

    this.resetOrders();

    this.appendArrow(id, order);
  }

  addEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
    document.addEventListener('scroll', this.onScroll);
  }

  removeEventListeners() {
    this.subElements?.header?.addEventListener('pointerdown', this.onHeaderClick);
    document.removeEventListener('scroll', this.onScroll);
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
