'use babel';

import GrepPageView from './greppage-view';
import { CompositeDisposable } from 'atom';
import axios from 'axios';

const GUEST_ACCESS_TOKEN = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImFsZyI6IkhTMjU2IiwidHlwIjoiSldUIn0.eyJpZCI6MjAwMDAwMDAwMCwiZW1haWwiOiJndWVzdEBndWVzdC5jb20iLCJuYW1lIjoiZ3Vlc3QiLCJleHAiOjE1MTExMzY4MzB9.gWohR7LLtROgjSl5SxbEaGRBveZQEv7Uj2rzmgYrbys';

export default {
  grepPageView: null,
  subscriptions: null,
  sidePanel: null,

  activate(state) {
    this.grepPageView = new GrepPageView(state.GrepPageViewState);
    this.sidePanel = atom.workspace.addRightPanel({
      item: this.grepPageView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'greppage:open-search': () => this.openSearch(),
      'greppage:search-selection': () => this.searchSelection(),
      'greppage:search-line': () => this.searchLine()
    }))
  },

  deactivate() {
    this.sidePanel.destroy();
    this.grepPageView.destroy();
    this.subscriptions.dispose();
  },

  searchSelection() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText()
      this.searchGrepPage(selection)
        .then(res => {
          this.showSidePanelWithSearchResponse(selection, res.data.docs);
          editor.insertText(''); // remove selection
        })
        .catch(err => {
          this.grepPageView.setError(err);
        })
    }
  },

  searchLine() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      editor.moveToBeginningOfLine();
      editor.selectToEndOfLine();
      let line = editor.getSelectedText().trim();
      this.searchGrepPage(line)
        .then(res => {
          this.showSidePanelWithSearchResponse(line, res.data.docs);
        })
        .catch(err => {
          this.grepPageView.setError(err);
        })
    }
  },

  searchGrepPage(query) {
    return axios.get('https://www.greppage.com/api/search/items', {
      headers: {'Authorization': GUEST_ACCESS_TOKEN},
      params: {
        'q.op': 'AND',
        wt: 'json',
        start: 0,
        rows: 10,
        q: query
      }
    });
  },

  showSidePanelWithSearchResponse(selection, docs) {
    this.grepPageView.setQuery(selection);
    this.grepPageView.setItems(docs);
    this.sidePanel.show();
    this.grepPageView.focusOnSearchInput();
  },

  openSearch() {
    this.sidePanel.isVisible() ?
    this.sidePanel.hide() :
    this.sidePanel.show()

    this.grepPageView.focusOnSearchInput();
  }

};
