import createContext from 'create-react-context';
const Context = createContext({
  formId: '',
  onChange: () => {},
  onPropogatedFailedSubmit: () => {},
  values: {}
});

export default Context;