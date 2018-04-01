import React from 'react';
import Field from '../src/field';
import Form from '../src/form';
import FormErrorListener from '../src/formErrorListener';
import renderer from 'react-test-renderer';

describe('Props', () => {
  test('Missing required', () => {
    const required = prop =>
    `Warning: Failed prop type: The prop \`${prop}\` is marked as required in \`Field\`, but its value is \`undefined\`.
    in Field
    in ContextualField`
    console.error = jest.fn();
    const tree = renderer.create(
      <Field>
        {() => <div />}
      </Field>
    );

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(required('name'));
  });

  test('Wrong type', () => {
    const typeWarning = (prop, expected, given='array') =>
    `Warning: Failed prop type: Invalid prop \`${prop}\` of type \`${given}\` supplied to \`Field\`, expected \`${expected}\`.
    in Field
    in ContextualField`
    console.error = jest.fn();
    const tree = renderer.create(
      <Field
        errors={{reduce: () => {}}}
        name={[]}
        onFailedSubmit={[]}
        >
        {() => <div />}
      </Field>
    );

    expect(console.error).toHaveBeenCalledTimes(3);
    expect(console.error).toHaveBeenCalledWith(typeWarning('errors', 'array', 'object'));
    expect(console.error).toHaveBeenCalledWith(typeWarning('name', 'string'));
    expect(console.error).toHaveBeenCalledWith(typeWarning('onFailedSubmit', 'function'));
  });

});

test('defaultValue', () => {
  const child = jest.fn(() => <div />);
  const defaultValue = "Hello Default";
  const tree = renderer.create(
    <Form>
      <Field defaultValue={defaultValue} name="my-name">
        {child}
      </Field>
    </Form>
  );

  expect(child).toHaveBeenCalledWith({ value: defaultValue, currentErrors: expect.any(Array), onChange: expect.any(Function)})
});

const message1 = "Hello World";
const message2 = "Still Here World";
const message3 = "Goodbye World";
const error1= {_handle: () => true, message: message1};
const error2 = {_handle: () => false, message: message2};
const error3 = {_handle: () => true, message: message3};

test('Current Errors', () => {
  const child = jest.fn(() => <div />);
  const tree = renderer.create(
    <Field
      errors={[error1, error2, error3]}
      >
      {child}
    </Field>
  );

  expect(child).toHaveBeenCalledWith({ currentErrors: [message1, message3], onChange: expect.any(Function), value: expect.any(String) })
});

test('Value set by onChange', () => {
  const newValue = "Hello World";
  const child = jest.fn(({ onChange, value }) => {
    if (value === '') { onChange({ currentTarget: { value: newValue } }) }
    return <div />;
  })
  const tree = renderer.create(
    <Form>
      <Field name="my-name">
        {child}
      </Field>
    </Form>
  );

  expect(child).toHaveBeenCalledWith({ value: newValue, currentErrors: expect.any(Array), onChange: expect.any(Function)})
});

describe('Submission', () => {
  const id = "form-id";
  describe('With errors', () => {
    test('onFailedSubmit', () => {
      const errors = [error1, error3];
      const onFailedSubmit = jest.fn();
      const onFailedSubmit2 = jest.fn();
      const tree = renderer.create(
        <Form id={id}>
          <Field errors={errors} onFailedSubmit={onFailedSubmit} name="my-name">
            {() => <div />}
          </Field>
          <Field onFailedSubmit={onFailedSubmit2} name="my-name2">
            {() => <div />}
          </Field>
        </Form>
      );
      expect(onFailedSubmit).not.toHaveBeenCalled();
      expect(onFailedSubmit2).not.toHaveBeenCalled();
      FormErrorListener.emit(`FORM_${id}_SUBMISSION_ATTEMPT`);
      expect(onFailedSubmit).toHaveBeenCalledWith([message1, message3]);
      expect(onFailedSubmit2).not.toHaveBeenCalled();
    });

    test('onPropogatedFailedSubmit', () => {
      const errors = [error1, error3];
      const name1 = "my-name-1"
      const name2 = "my-name-2"
      const name3 = "my-name-3"
      const onPropogatedFailedSubmit = jest.fn();
      const tree = renderer.create(
        <Form onPropogatedFailedSubmit={onPropogatedFailedSubmit} id={id}>
          <Field errors={errors} name={name1}>
            {() => <div />}
          </Field>
          <Field name={name2}>
            {() => <div />}
          </Field>
          <Field errors={errors} name={name3}>
            {() => <div />}
          </Field>
        </Form>
      );

      expect(onPropogatedFailedSubmit).not.toHaveBeenCalled();
      FormErrorListener.emit(`FORM_${id}_SUBMISSION_ATTEMPT`);
      expect(onPropogatedFailedSubmit).toHaveBeenCalledTimes(2);
      expect(onPropogatedFailedSubmit).toHaveBeenCalledWith(name1, [message1, message3]);
      expect(onPropogatedFailedSubmit).not.toHaveBeenCalledWith(name2, expect.any(Array));
      expect(onPropogatedFailedSubmit).toHaveBeenCalledWith(name3, [message1, message3]);
    });
  })
});



