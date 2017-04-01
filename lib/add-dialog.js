/** @babel */

import _ from 'lodash';
import path from 'path';
import fs from 'fs-plus';
import Dialog from './dialog';

export default class AddDialog extends Dialog {
  constructor(initialPath) {
    let dirPath = initialPath;

    if (fs.isFileSync(initialPath)) {
      dirPath = path.dirname(initialPath);
    }

    super({
      prompt: 'Enter the name for the new component',
      initialPath: dirPath,
      iconClass: 'icon-file-directory-create',
    });

    this.directoryPath = dirPath;
  }

  onDidCreateDirectory(callback) {
    this.emitter.on('did-create-directory', callback);
  }

  onConfirm = string => {
    const componentName = string.replace(/\s+$/, ''); // Remove trailing whitespace;
    const componentNameCamel = _.camelCase(componentName);
    const componentNameCap = _.upperFirst(componentName);
    const componentNameKebab = _.kebabCase(componentName);
    const componentDirPath = path.join(this.directoryPath, componentNameKebab);
    const componentFilePath = path.join(componentDirPath, `${componentNameCap}.js`);
    const componentStylePath = path.join(componentDirPath, `${componentNameCap}.scss`);
    const componentIndexPath = path.join(componentDirPath, 'index.js');

    [componentFileContents, componentStyleContents, componentIndexContents] =
    [ 'component-template/Component.txt',
      'component-template/ComponentStyle.txt',
      'component-template/index.txt' ]
      .map(f =>
        fs.readFileSync(path.join(__dirname, f), 'utf8')
        .replace(/##COMPONENT_NAME##/g, componentNameCap)
        .replace(/##COMPONENT_NAME_CAMEL##/g, componentNameCamel)
    )
    if (!componentDirPath) {
      return;
    }

    try {
      if (fs.existsSync(componentDirPath)) {
        this.showError(`'${componentDirPath}' already exists.`);
      } else {
        fs.makeTreeSync(componentDirPath);
        fs.writeFileSync(componentFilePath, componentFileContents);
        fs.writeFileSync(componentStylePath, componentStyleContents);
        fs.writeFileSync(componentIndexPath, componentIndexContents);
        this.emitter.emit('did-create-directory', componentDirPath);
        this.cancel();
      }
    } catch (error) {
      this.showError(`${error.message}.`);
    }
  }
}
