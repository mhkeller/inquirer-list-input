Inquirer list input
===================

> List prompt with arbitrary text input for [Inquirer](https://github.com/SBoudrias/Inquirer.js)

## Usage

You can register this prompt with a name of your choosing. Here is how you would register it as `'list-input'`:

```js
inquirer.registerPrompt('list-input', require('inquirer-list-input'));
inquirer.prompt({
  type: 'list-input',
  // ...
})
``

## Example

See [example.js](example.js) for a working example.

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