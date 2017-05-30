/** @babel */

import { Emitter } from 'atom';
import AddDialog from './add-dialog';

const emitter = new Emitter();

export default {
  addComponent(path) {
    (new AddDialog(path)).attach();
  },
  activate(state) {
    this.command = atom.commands.add('atom-workspace', {
      'ueno-atom-menu:new-component': () => {
        const selectedPath = document.querySelector('.tree-view .selected').getPath();
        this.addComponent(selectedPath)
      }
    });
  },
  deactivate() {
    this.command.dispose();
  }
}
