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

  onConfirm({ name, type, styleType }) {
    if (!name) {
      this.showError('Please provide a name.');
      return;
    }
    const componentName = name.replace(/\s+$/, ''); // Remove trailing whitespace;
    const componentNameCamel = _.camelCase(componentName);
    const componentNameCap = _.upperFirst(componentName);
    const componentNameKebab = _.kebabCase(componentName);
    const componentStyleName = `${componentNameCap}.${styleType}`;
    const componentDirPath = path.join(this.directoryPath, componentNameKebab);
    const componentFilePath = path.join(componentDirPath, `${componentNameCap}.js`);
    const componentStylePath = path.join(componentDirPath, componentStyleName);
    const componentIndexPath = path.join(componentDirPath, 'index.js');

    const componentTemplateFileName = `Component${type === 'class' ? '' : 'Func'}`;
    let componentTemplateStyleFileName = 'ComponentStyle';

    if (styleType === 'scss') {
      componentTemplateStyleFileName = 'ComponentStyleSCSS';
    } else if (styleType === 'less') {
      componentTemplateStyleFileName = 'ComponentStyleLESS';
    }

    [componentFileContents, componentStyleContents, componentIndexContents] =
    [ `component-template/${componentTemplateFileName}.txt`,
      `component-template/${componentTemplateStyleFileName}.txt`,
      'component-template/index.txt' ]
      .map(f =>
        fs.readFileSync(path.join(__dirname, f), 'utf8')
        .replace(/##COMPONENT_NAME##/g, componentNameCap)
        .replace(/##COMPONENT_NAME_CAMEL##/g, componentNameCamel)
        .replace(/##COMPONENT_STYLE##/g, componentStyleName)
    )
    if (!componentDirPath) {
      return;
    }

    try {
      if (fs.existsSync(componentDirPath)) {
        this.showError(`A component named '${componentNameCap}' ('${componentNameKebab}') already exists at this location.`);
      } else {
        fs.makeTreeSync(componentDirPath);
        fs.writeFileSync(componentFilePath, componentFileContents);
        fs.writeFileSync(componentStylePath, componentStyleContents);
        fs.writeFileSync(componentIndexPath, componentIndexContents);
        this.cancel();
      }
    } catch (error) {
      this.showError(`${error.message}.`);
    }
  }
}
