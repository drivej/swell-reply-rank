export class ItemsList {
  $el = document.createElement('table');
  $tbody;
  $thead;
  items = [];

  constructor(items) {
    this.items = items;
    this.$thead = document.createElement('thead');
    this.$thead.innerHTML = `<th>#</th><th>title</th><th>rating</th><th>duration</th><th>listens</th><th>avg pos.</th><th>visualize</th>`;
    this.$tbody = document.createElement('tbody');
    this.$el.appendChild(this.$thead);
    this.$el.appendChild(this.$tbody);

    // this.$el.className = 'items-grid';
    this.$el.style.width = '100%';
    this.$el.className = 'list-table';
    this.$el.setAttribute('border', 1);
    this.$el.setAttribute('cellSpacing', 0);
    this.$el.setAttribute('cellPadding', 5);
    this.sort();
    this.render();
  }

  update(items) {
    this.items = items;
    this.$tbody.innerHTML = '';
    this.sort();
    this.render();
  }

  sort() {
    this.items.forEach((item) => item.render());
    this.items.sort((a, b) => (a.rating > b.rating ? -1 : a.rating < b.rating ? 1 : a.index < b.index ? -1 : a.index > b.index ? 1 : 0));
    // this.items.sort((a, b) => (a.listens > b.listens ? -1 : a.listens < b.listens ? 1 : 0));
    this.render();
  }

  render() {
    const $frag = document.createDocumentFragment();
    this.items.slice(0,500).forEach((item, i) => {
      item.render();
      $frag.appendChild(item.$el);
    });
    this.$tbody.innerHTML = '';
    this.$tbody.appendChild($frag);
  }
}
