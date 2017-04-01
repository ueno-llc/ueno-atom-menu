/** @babel */

import {
  TextEditor,
  CompositeDisposable,
  Disposable,
  Emitter,
  Range,
  Point
} from 'atom';
import path from 'path';

export default class Dialog {
  constructor({ initialPath, iconClass, prompt } = {}) {
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable();

    this.element = document.createElement('div');
    this.element.classList.add('tree-view-dialog');

    this.promptText = document.createElement('label');
    this.promptText.classList.add('icon');
    if (iconClass) {
      this.promptText.classList.add(iconClass);
    }
    this.promptText.textContent = prompt;
    this.element.appendChild(this.promptText);

    this.miniEditor = new TextEditor({ mini: true });
    const blurHandler = () => {
      this.miniEditor.element.focus();
      // # console.log document.hasFocus()
      // # console.log document.querySelector('.workspace')
      // # this.close() if document.hasFocus()
    }

    // # clickHandler = (e) =>
    // #   console.log e
    // #   this.close()
    // # document.addEventListener('click', clickHandler)

    this.miniEditor.element.addEventListener('blur', blurHandler);
    this.disposables.add(new Disposable(()=> this.miniEditor.element.removeEventListener('blur', blurHandler)));
    this.disposables.add(this.miniEditor.onDidChange(() => this.showError()));
    this.element.appendChild(this.miniEditor.element);

    this.errorMessage = document.createElement('div');
    this.errorMessage.classList.add('error-message');
    this.element.appendChild(this.errorMessage);

  //   # this.checkboxCss = document.createElement('input')
  //   # this.checkboxCss.type = 'checkbox';
  //   # this.checkboxCss.classList.add('input-checkbox')
  //   #
  //   # this.checkboxLess = document.createElement('input')
  //   # this.checkboxLess.type = 'checkbox';
  //   # this.checkboxLess.classList.add('input-checkbox')
  //   #
  //   # this.checkboxSass = document.createElement('input')
  //   # this.checkboxSass.type = 'checkbox';
  //   # this.checkboxSass.classList.add('input-checkbox')
  //   #
  //   # this.checkboxClass = document.createElement('input')
  //   # this.checkboxClass.type = 'checkbox';
  //   # this.checkboxClass.classList.add('input-checkbox')
  //   #
  //   # this.checkboxFunc = document.createElement('input')
  //   # this.checkboxFunc.type = 'checkbox';
  //   # this.checkboxFunc.classList.add('input-checkbox')
  //
  // #   const controlGroup = document.createElement('div')
  // # controlGroup.classList.add('control-group')
  // #
  // # const controls = document.createElement('div')
  // # controls.classList.add('controls')
  // # controlGroup.appendChild(controls)
  // # controls.appendChild(elementForCheckbox(namespace, name, value))



    // # this.element.appendChild(this.checkboxCss)

    atom.commands.add(this.element, {
      'core:confirm': () => this.onConfirm(this.miniEditor.getText()),
      'core:cancel': () => this.cancel(),
    });
  }

  attach() {
    this.panel = atom.workspace.addModalPanel({ item: this });
    this.miniEditor.element.focus();
    this.miniEditor.scrollToCursorPosition();
  }

  close() {
    panelToDestroy = this.panel;
    this.panel = null;
    if (panelToDestroy) {
      panelToDestroy.destroy();
    }
    this.emitter.dispose();
    this.disposables.dispose();
    this.miniEditor.destroy();
    atom.workspace.getActivePane().activate();
  }

  cancel() {
    this.close();
    const treeView = document.querySelector('.tree-view');
    if (treeView) {
      treeView.focus();
    }
  }

  showError(message='') {
    this.errorMessage.textContent = message;
    if (message) {
      this.element.classList.add('error');
      window.setTimeout(() => this.element.classList.remove('error'), 300);
    }
  }
}
