# React Bureaucrat

A component library for react applications that simplifies building forms.

## Installing

```
npm install react-bureaucrat
```

## Props

### Form
| Name                        | Required  | Type     |  Default |  Usage  |
| --------------------------- | :-------: | -------- |  ------- | ------- |  
| id                          | [x]       | String   |  
| onSubmit                    | [x]       | Function |          | Called on form submission, if no fields have errors. Receives the form's current state as its only argument. Form state will be an object {"field-name-1": "value of field 1", "field-name-2", "value of field 2" ...} |
| alwaysSubmit                |           | Boolean  |  false   | Forces onSubmit prop function to be called on form submission regardless of errors
| onFailedSubmit              |           | Function |          | Called on form submission, if any fields have errors.
| onPropogatedFailedSubmit    |           | Function |          | Called on form submission once for every field with errors.  Each call receives a field's name and current errors as its arguments.

#### Children
  The Form component can accept either react elements
  ```jsx
    <Form>
      <Field>
        {...}
      </Field>
      <div />
      <Field>
        {...}
      <Field>
    </Form>
  ```
  or a function as children.  The function will receive as an argument the count of submission attempts.  You can use this to call any error handlers in the inputs that might normally require the user to interact with that input.
  ```jsx
  <Form>
  {submissionAttempts => (
    <Field>
      {...}
    </Field>
    <div />
    <Field>
      {...}
    <Field>
  )}
  </Form>
  ```

### Field
| Name                        | Required  | Type     |  Default |  Usage  |
| --------------------------- | :-------: | -------- |  ------- | ------- |
| defaultValue                |           |          |          | Gives the field a starting value
| errors                      |           | Array    |  []      | Each element in the array must be an object with a _handle key and a message key.  The _handle key's value will be a function which takes as its argument the field's value.  If that function evaluates to true, the message key's value will be passed to the field's children.
| name                        | [x]       | String   |          | Is the fields unique identifier.  It is used as a key in the form state
| onFailedSubmit             |           | Function            | Called on form submission if the field has any current errors.  Receives those errors as it's argument.

#### Children
  The Field component accepts a function as its child.  It receives as its argument an object containing the current errors, an onChange function, and the Field's value.

  ```
    <Field>
    {({ currentErrors, onChange, value }) => (
        <div>
          <input
            onChange={onChange}
            value={value}
            {...other props}
          {currentErrors.length > 0 && <span>{currentErrors[0]}</span>}
          />
        </div>
      )
    }
    </Field>
  ```

## Examples

```jsx
<!-- file: my-form.js  -->
import React from 'react';
import { Form, Field } from 'react-bureaucrat';
import MyInput from './my-input.js'

const MyForm = ({ onSubmit }) => (
  <Form>
    id="unique-id"
    onSubmit={ onSubmit }
    onFailedSubmit={() => alert('At least one field has an error')}
    onPropogatedFailedSubmit={(fieldName, fieldErrors) => { console.log(`${name}: ${fieldErrors}`) }}
    {submissionAttempts =>
      <Field
        name="firstName"
        errors={
          [
            { _handle: v => !v, message: "Can't be blank" },
            { _handle: v => v.length < 5, message: "Must be at least 5 characters" }
          ]
        }
        onFailedSubmit={currentErrors => { console.log(`My first error: ${currentErrors[0]}`) }}
        >
        {({currentErrors, onChange, value})
          <MyInput
            currentErrors={currentErrors}
            onChange={onChange}
            value={value}
            submissionAttempts={submissionAttempts}
          />
        }
      <Field
        name="lastName"
        errors={
          [
            { _handle: v => !v, message: "Can't be blank" },
          ]
        }
        >
        {({currentErrors, onChange, value})
          <MyInput
          currentErrors={currentErrors}
          onChange={onChange}
          value={value}
          submissionAttempts={submissionAttempts}
          />
        }
      </Field>
    }
  </Form>
);

<!-- file: my-input.js  -->
import React from 'react';

export default class MyInput extends React.Component {
  constructor() {
    super();
    this.state = {
      showErrors: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.submissionAttempts > this.props.submissionAttempts) {
      this.setState({ showErrors: true });
    }
  }

  render() {
    return (
      <div>
        <input
          onFocus={() => { this.setState({ showErrors: false }) }}
          onBlur={() => { this.setState({ showErrors: true }) }}
          onChange={this.props.onChange}
          value={this.props.value}
          {...other props}
        {this.state.showErrors && currentErrors.length > 0 && <span>{currentErrors[0]}</span>}
        />
      </div>
    )
  }
}

```


## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC)

