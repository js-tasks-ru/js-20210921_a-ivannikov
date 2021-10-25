import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};
  defaultValues = {
    title: '',
    description: '',
    brand: '',
    quantity: 0,
    subcategory: '',
    status: 1,
    characteristics: [],
    images: [],
    price: 0,
    discount: 0
  };

  constructor (productId) {
    this.productId = productId;
    this.url = new URL('', BACKEND_URL);
  }

  get template() {
    const {
      title = '',
      description = '',
      price = 0,
      discrount = 0,
      quantity = 0
    } = this.productData;

    return `
      <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required="" type="text" id="title" data-element="title" name="title" class="form-control" placeholder="Название товара" value="${escapeHtml(title)}">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required="" class="form-control" id="description" data-element="description" name="description" data-element="productDescription" placeholder="Описание товара">${escapeHtml(description)}</textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer">
          </div>
          <button type="button" data-element="uploadImage" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          <select class="form-control" name="subcategory" id="subcategory" data-element="subcategory">
          </select>
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" id="price" name="price" data-element="price" class="form-control" placeholder="100" value="${this.productData.price}">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" id="discount" name="discount" data-element="discount" class="form-control" placeholder="0" value="${this.productData.discount}">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" type="number" class="form-control" id="quantity" name="quantity" data-element="quantity" placeholder="1" value="${this.productData.quantity}">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" id="status" name="status" data-element="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            Сохранить товар
          </button>
        </div>
      </form>
    </div>
    `;
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

  async getProductProperties() {
    return this.productId ?
      this.loadProductProperties() :
      this.defaultValues;
  }

  async loadProductProperties() {
    const url = new URL('/api/rest/products', BACKEND_URL);
    url.searchParams.set('id', this.productId);
    return fetchJson(url);
  }

  async loadCategories() {
    const url = new URL('/api/rest/categories', BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
    return fetchJson(url);
  }

  async prepareFormData() {
    const [ categories, data ] = await Promise.all([
      this.loadCategories(),
      this.getProductProperties(),
    ]);
    this.categories = categories;
    this.productData = Array.isArray(data) ? data[0] : data;
  }

  renderImages() {
    const { images = [] } = this.productData;

    this.subElements.imageListContainer.innerHTML = [
      '<ul class="sortable-list">',
      images.map(image => {
        return `
          <li class="products-edit__imagelist-item sortable-list__item" style="">
            <input type="hidden" name="url" value="${image.url}">
            <input type="hidden" name="source" value="${image.source}">
            <span>
              <img src="icon-grab.svg" data-grab-handle="" alt="grab">
              <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
              <span>${image.source}</span>
            </span>
            <button type="button">
              <img src="icon-trash.svg" data-delete-handle="" alt="delete">
            </button>
          </li>`;
      }).join(''),
      '</ul>'
    ].join('');
  }

  renderCategories() {
    this.subElements.subcategory.innerHTML = this.categories.map(category => {
      if (category.subcategories?.length) {
        return category.subcategories.map(subcategory => {
          return `<option value="${subcategory.id}">${escapeHtml(category.title)} &gt; ${escapeHtml(subcategory.title)}</option>`;
        }).join('');
      } else {
        return `<option value="${escapeHtml(category.id)}">${escapeHtml(category.title)}</option>`;
      }
    }).join('');

    this.subElements.subcategory.value = this.productData.subcategory;
  }

  setProductStatus() {
    this.subElements.status.value = this.productData.status;
  }

  getFormImages() {
    const images = [];
    const list = this.subElements.imageListContainer.querySelectorAll('li');
    for (const item of list) {
      images.push({
        url: item.querySelector('input[name="url"]').value,
        source: item.querySelector('input[name="source"]').value,
      });
    }
    return images;
  }

  getFormDataAsJson() {
    const data = {
      title: this.subElements.title.value,
      description: this.subElements.description.value,
      subcategory: this.subElements.subcategory.value,
      price: parseFloat(this.subElements.price.value),
      discount: parseFloat(this.subElements.discount.value),
      quantity: parseFloat(this.subElements.quantity.value),
      images: this.getFormImages(),
    };

    if (this.productId) {
      data.id = this.productId;
    }

    return JSON.stringify(data);
  }

  async save() {
    const url = new URL('/api/rest/products', BACKEND_URL);

    const data = await fetchJson(url, {
      method: this.productId ? 'PATCH' : 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: this.getFormDataAsJson(),
    });

    if (this.productId) {
      this.element.dispatchEvent(new CustomEvent('product-updated'));
    } else {
      this.element.dispatchEvent(new CustomEvent('product-save'));
    }
  }

  createFileInput() {
    const input = document.createElement('input');
    input.type = 'file';
    return input;
  }

  renderForm() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
    this.subElements.fileInput = this.createFileInput(),

    this.renderImages();

    this.renderCategories();

    this.setProductStatus();
  }

  async render () {
    await this.prepareFormData();

    this.renderForm();

    this.addEventListeners();

    return this.element;
  }

  async uploadImage(file) {
    const data = new FormData();
    data.append('image', file);
    data.append('type', 'file');
    data.append('name', file.name);
    try {
      const response = await fetch('https://api.imgur.com/3/upload', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: data
      });
      const result = await response.json();
    } catch(e) {
      alert(e.message);
    }
  }

  onSubmit = async event => {
    event.preventDefault();
    await this.save();
  }

  onUploadImage = async event => {
    this.subElements.fileInput.dispatchEvent(new MouseEvent('click'));
  }

  onDeleteImage = event => {
    const trashImg = event.target.closest('[data-delete-handle]');
    if (!trashImg) return;
    trashImg.parentElement.parentElement.remove();
  }

  onSelectFile = () => {
    this.uploadImage(this.subElements.fileInput.files[0]);
  }

  addEventListeners() {
    this.subElements.productForm.addEventListener('submit', this.onSubmit);
    this.subElements.uploadImage.addEventListener('click', this.onUploadImage);
    this.subElements.imageListContainer.addEventListener('click', this.onDeleteImage);
    this.subElements.fileInput.addEventListener('change', this.onSelectFile);
  }

  removeEventListeners() {
    this.subElements?.productForm.removeEventListener('submit', this.onSubmit);
    this.subElements?.uploadImage.removeEventListener('click', this.onUploadImage);
    this.subElements?.imageListContainer.removeEventListener('click', this.onDeleteImage);
    this.subElements?.fileInput.removeEventListener('change', this.onSelectFile);
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
