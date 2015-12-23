Inquirer list input
===================

> A list prompt with arbitrary text input for [Inquirer](https://github.com/SBoudrias/Inquirer.js)

[![npm version](https://badge.fury.io/js/inquirer-list-input.png?style=flat)](http://badge.fury.io/js/inquirer-list-input)

This prompt style gives you a list but also allows arbitrary user input. This could allow for slight editing of list items such as when selecting file paths and you want further sub-directories.

## Install

```
npm save --install inquirer-list-input
```

## Usage

You can register this prompt with a name of your choosing. Here is how you would register it as `'list-input'`:

```js
inquirer.registerPrompt('list-input', require('inquirer-list-input'));
inquirer.prompt({
  type: 'list-input',
  // ...
})
```

### Options

> **Note:** _allowed options written inside square brackets (`[]`) are optional. Others are required._

`type`, `name`, `message`, `editableList`[, `filter`, `validate`, `when`]

See [inquirer](https://github.com/SBoudrias/Inquirer.js) readme for meaning of all except **source**.

**editableList** is a Boolean, defaulting to `false`. If `true`, the cursor will always appear, giving the user a greater visual cue to edit list items.

## Example

See [example.js](example.js) for a working example. Use the left and right arrows to edit a list item or <kbd>ctrl</kbd> <kbd>a</kbd> and <kbd>ctrl</kbd> <kbd>e</kbd> to jump to the beginning or end of a line.

```js
var inquirer = require('inquirer');

inquirer.registerPrompt('list-input', require('./index'));
inquirer.prompt([{
  type: 'list-input',
  name: 'from',
  message: 'Select a state to travel from',
  choices: ['AL', 'AR']
}], function(answers) {
  console.log(JSON.stringify(answers, null, 2));
});
```

_Inspired by [inquirer-autocomplete-prompt](https://github.com/mokkabonna/inquirer-autocomplete-prompt/blob/master/README.md)_