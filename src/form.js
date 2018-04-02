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

  constructor() {
    super();
    this.state = { submissionAttempts: 0 }
    this._onChange = this._onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
    const { submissionAttempts, ...state } = this.state;
    const providerValue = {
      formId: this.props.id,
      onChange: this._onChange,
      onPropogatedFailedSubmit,
      values: state
    };
    return (
      <Context.Provider value={providerValue}>
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