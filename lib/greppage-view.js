'use babel';

import GrepPage from './greppage';

export default class GrepPageView {

  constructor() {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('greppage', 'native-key-bindings');

    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'search-input';
    input.placeholder = "Search GrepPage";
    this.element.appendChild(input);

    // On enter search
    const _this = this;
    this.element.querySelectorAll('#search-input')[0].onkeypress = function(e) {
      if (!e) e = window.event;
      var keyCode = e.keyCode || e.which;
      if (keyCode == '13'){
        // Enter pressed
        GrepPage.searchGrepPage(e.target.value)
          .then(res => {
            _this.setQuery(e.target.value);
            _this.setItems(res.data.docs);
          })
          .catch(err => _this.setError(err))
        return false;
      }
    }

    // Create message element
    const message = document.createElement('div');
    message.textContent = 'Code faster by searching snippets from GrepPage';
    message.classList.add('message');
    this.element.appendChild(message);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  createItemElement(doc) {
    const item = document.createElement('div');
    item.classList.add('item');

    // create description element
    const description = document.createElement('div');
    description.classList.add('description');
    description.textContent = doc.description;

    // create command element
    const command = document.createElement('textarea');
    command.setAttribute('readonly', 'readonly');
    command.classList.add('command');
    command.textContent = doc.command;

    // append everyting into item element
    item.appendChild(description);
    item.appendChild(command);
    return item;
  }

  replaceMessageChild(node) {
    const message = this.element.querySelectorAll('.message')[0];
    message.replaceChild(node, message.childNodes[0]);
  }

  setItems(items) {
    const itemsContainer = document.createElement('div');
    itemsContainer.classList.add('items-container');
    items.forEach(item => itemsContainer.appendChild(this.createItemElement(item)))
    this.replaceMessageChild(itemsContainer);
  }

  setQuery(query) {
    const input = this.element.querySelectorAll('#search-input')[0];
    input.value = query;
  }

  setError(err) {
    const span = document.createElement('span');
    span.textContent = err;
    this.replaceMessageChild(span);
  }

}
