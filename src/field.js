import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import FormErrorListener from './formErrorListener';
import Context from './context';

class Field extends Component {

  static defaultProps = {
    errors: [],
    onFailedSubmit: () => {},
    onPropogatedFailedSubmit: () => {}
  }

  static propTypes = {
    errors: PropTypes.array,
    formId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onFailedSubmit: PropTypes.func,
    onPropogatedFailedSubmit: PropTypes.func,
    values: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this._handleSubmissionAttempt = this._handleSubmissionAttempt.bind(this);
  }

  componentDidMount() {
    this.props.defaultValue && this.onChange({ currentTarget: { value: this.props.defaultValue } });
    this.formErrors = FormErrorListener.bind(`FORM_${this.props.formId}_SUBMISSION_ATTEMPT`, this._handleSubmissionAttempt);
  }

  componentWillUnMount() {
    this.formErrors();
  }

  _handleSubmissionAttempt() {
    const currentErrors = this._currentErrors();
    const anyErrors = currentErrors.length > 0
    if (anyErrors) {
      this.props.onPropogatedFailedSubmit(this.props.name, currentErrors);
      this.props.onFailedSubmit(currentErrors);
    }
    return !anyErrors;
  }

  _currentErrors() {
    return this.props.errors.reduce((acc, error) => {
      if (error._handle(this._value())) {
        acc.push(error.message);
      }
      return acc;
    }, []);
  }

  _value() {
    return this.props.values[this.props.name] || '';
  }

  onChange(e) {
    this.props.onChange(this.props.name, e);
  }

  render() {
    const currentErrors = this._currentErrors();
    return (
      <Fragment>
        {this.props.children({currentErrors, value: this._value(), onChange: this.onChange})}
      </Fragment>
    );
  }
}

const ContextualField = (props) => (
  <Context.Consumer>
    {values =>
      <Field
        {...props}
        {...values}
        />
    }
  </Context.Consumer>
);

export default ContextualField;
