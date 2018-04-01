import React from 'react';
import Form from '../src/form';
import FormErrorListener from '../src/formErrorListener';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

describe('Props', () => {
  test('Missing required', () => {
    const required = prop =>
    `Warning: Failed prop type: The prop \`${prop}\` is marked as required in \`Form\`, but its value is \`undefined\`.
    in Form`
    console.error = jest.fn();
    const tree = renderer.create(
      <Form
        />
    );

    expect(console.error).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledWith(required('id'));
    expect(console.error).toHaveBeenCalledWith(required('onSubmit'));
  });

  test('Wrong type', () => {
    const typeWarning = (prop, expected) =>
    `Warning: Failed prop type: Invalid prop \`${prop}\` of type \`array\` supplied to \`Form\`, expected \`${expected}\`.
    in Form`
    console.error = jest.fn();
    const tree = renderer.create(
      <Form
        alwaysSubmit={[]}
        id={[]}
        onFailedSubmit={[]}
        onPropogatedFailedSubmit={[]}
        onSubmit={[]}
        />
    );

    expect(console.error).toHaveBeenCalledTimes(5);
    expect(console.error).toHaveBeenCalledWith(typeWarning('alwaysSubmit', 'boolean'));
    expect(console.error).toHaveBeenCalledWith(typeWarning('id', 'string'));
    expect(console.error).toHaveBeenCalledWith(typeWarning('onFailedSubmit', 'function'));
    expect(console.error).toHaveBeenCalledWith(typeWarning('onPropogatedFailedSubmit', 'function'));
    expect(console.error).toHaveBeenCalledWith(typeWarning('onSubmit', 'function'));
  });

  test('id and unspecified added to form element', () => {
    const tree = renderer.create(
      <Form
        id="my-form"
        className="tall and fat"
        noValidate
        data-index={1}
        />
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});

test('React element children', () => {
  const tree = renderer.create(
    <Form>
      <div id="div-1"></div>
      <div id="div-2"></div>
      <div id="div-3"></div>
    </Form>
  ).toJSON();

  expect(tree).toMatchSnapshot();
});

test('Function children', () => {
  const tree = renderer.create(
    <Form>
      {submissionAttempts =>
        <div>
          <div id="div-1" data-attempts={submissionAttempts}></div>
          <div id="div-2" data-attempts={submissionAttempts}></div>
          <div id="div-3" data-attempts={submissionAttempts}></div>
        </div>
      }
    </Form>
  ).toJSON();

  expect(tree).toMatchSnapshot();
});

describe('Submission', () => {
  const values = {'test': 'value', 'name': 'input'};
  test('No form submission attempt events', () => {
    const onSubmit = jest.fn();
    const onFailedSubmit = jest.fn();
    const form = shallow(
      <Form onFailedSubmit={ onFailedSubmit } onSubmit={ onSubmit } />
    );
    form.setState(values);
    const e = { preventDefault: jest.fn() };

    expect(onSubmit).not.toHaveBeenCalled();
    expect(onFailedSubmit).not.toHaveBeenCalled();
    expect(e.preventDefault).not.toHaveBeenCalled();

    form.find('form').simulate('submit', e);
    expect(onSubmit).toHaveBeenCalledWith(values);
    expect(onFailedSubmit).not.toHaveBeenCalledWith(values);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  test('valid form submission attempt events', () => {
    FormErrorListener.emit = () => true;

    const onSubmit = jest.fn();
    const onFailedSubmit = jest.fn();
    const form = shallow(
      <Form onFailedSubmit={ onFailedSubmit } onSubmit={ onSubmit } />
    );
    form.setState(values);
    const e = { preventDefault: jest.fn() };

    expect(e.preventDefault).not.toHaveBeenCalled();
    expect(onFailedSubmit).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();

    form.find('form').simulate('submit', e);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(onFailedSubmit).not.toHaveBeenCalledWith(values);
    expect(onSubmit).toHaveBeenCalledWith(values);
  });

  test('invalid form submission attempt events', () => {
    FormErrorListener.emit = () => false;

    const onSubmit = jest.fn();
    const onFailedSubmit= jest.fn();
    const form = shallow(
      <Form onFailedSubmit={ onFailedSubmit } onSubmit={ onSubmit } />
    );
    form.setState(values);
    const e = { preventDefault: jest.fn() };

    expect(e.preventDefault).not.toHaveBeenCalled();
    expect(onFailedSubmit).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();

    form.find('form').simulate('submit', e);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(onFailedSubmit).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalledWith(values);
  });

  test('alwaysSubmit', () => {
    FormErrorListener.emit = () => false;

    const onSubmit = jest.fn();
    const onFailedSubmit= jest.fn();
    const form = shallow(
      <Form alwaysSubmit onFailedSubmit={ onFailedSubmit } onSubmit={ onSubmit } />
    );
    form.setState(values);
    const e = { preventDefault: jest.fn() };

    expect(e.preventDefault).not.toHaveBeenCalled();
    expect(onFailedSubmit).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();

    form.find('form').simulate('submit', e);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(onFailedSubmit).not.toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith(values);
  });

  test('passes submission attempts count to children (if function)', () => {
    FormErrorListener.emit = () => false;
    const child = jest.fn(submissionAttempts => <div></div>)
    const form = shallow(
      <Form>
        {child}
      </Form>
    );
    const e = { preventDefault: jest.fn() };
    expect(child).toHaveBeenCalledWith(0);
    form.find('form').simulate('submit', e);
    expect(child).toHaveBeenCalledWith(1);
    form.find('form').simulate('submit', e);
    expect(child).toHaveBeenCalledWith(2);
  });
});
