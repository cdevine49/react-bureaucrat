import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormErrorListener from './formErrorListener';
import Context from './context';

export default class Form extends Component {
  static defaultProps = {
    alwaysSubmit: false,
    onFailedSubmit: () => {}
  }

  static propTypes = {
    alwaysSubmit: PropTypes.bool,
    id: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onFailedSubmit: PropTypes.func,
    onPropogatedFailedSubmit: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = { submissionAttempts: 0 }

    this._onChange = this._onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.providerValue = {
      formId: props.id,
      onChange: this._onChange,
      onPropogatedFailedSubmit: props.onPropogatedFailedSubmit,
      values: {}
    }
  }

  _onChange(field, e) {
    this.setState({ [field]: e.currentTarget.value })
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.props.alwaysSubmit) {
      const { submissionAttempts, ...state } = this.state;
      this.props.onSubmit(state);
    } else {
      const valid = FormErrorListener.emit(`FORM_${this.props.id}_SUBMISSION_ATTEMPT`);
      if (valid) {
        const { submissionAttempts, ...state } = this.state;
        this.props.onSubmit(state);
      } else {
        this.setState(state => ({ submissionAttempts: state.submissionAttempts + 1 }));
        this.props.onFailedSubmit();
      }
    }
  }

  render() {
    const { alwaysSubmit, children, onFailedSubmit, onPropogatedFailedSubmit, onSubmit, ...props } = this.props;
    const { submissionAttempts, ...values } = this.state;
    if (Object.keys(values).some(key => this.providerValue.values[key] !== values[key])) {
      this.providerValue = Object.assign({}, this.providerValue, { values });
    };
    return (
      <Context.Provider value={this.providerValue}>
        <form onSubmit={ this.handleSubmit } { ...props}>
          {typeof children === "function" ?
            children(this.state.submissionAttempts)
            :
            children
          }
        </form>
      </Context.Provider>
    );
  }
}