let eventObject = {};
const generateKey = function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const FormErrorListener = {
  emit: (event) => {
    let valid = true
    const obj = eventObject[event];
    obj && Object.values(eventObject[event]).forEach(v => {
      if (!v()) { valid = false }
    });
    return valid;
  },
  bind: (event, fun) => {
    if (typeof fun !== "function") {
      console.warn("Not a function")
    }
    let key = generateKey();
    if (eventObject[event]) {
      while (eventObject[event][key]) {
        key = generateKey();
      }
    } else {
       eventObject[event] = {};
    }
    eventObject[event][key] = fun;
    return () => { delete eventObject[event][key]; };
  }
}

export default FormErrorListener;