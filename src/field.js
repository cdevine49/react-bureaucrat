import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import FormErrorListener from './formErrorListener';
import Context from './context';

class Field extends PureComponent {

  static defaultProps = {
    value: '',
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
    onPropogatedFailedSubmit: PropTypes.func
  }

  constructor() {
    super();
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
    const { errors, value } = this.props;
    return errors.reduce((acc, error) => {
      if (error._handle(value)) {
        acc.push(error.message);
      }
      return acc;
    }, []);
  }

  onChange(e) {
    this.props.onChange(this.props.name, e);
  }

  render() {
    const currentErrors = this._currentErrors();
    return (
      <Fragment>
        {this.props.children({currentErrors, value: this.props.value, onChange: this.onChange})}
      </Fragment>
    );
  }
}

const ContextualField = (props) => (
  <Context.Consumer>
    {context =>
      <Field
        {...props}
        formId={context.formId}
        onPropogatedFailedSubmit={context.onPropogatedFailedSubmit}
        onChange={context.onChange}
        value={context.values[props.name]}
        />
    }
  </Context.Consumer>
);

export default ContextualField;
