import FormErrorListener from '../src/formErrorListener';


describe("Emitting event", () => {
  test("No bound functions", () => {
    expect(FormErrorListener.emit("NOTHING")).toBe(true);
  });

  describe("Bound Functions", () => {
    test("All return true", () => {
      const EVENT = "RETURN_TRUE"
      const bound = jest.fn(() => true)
      const bound2 = jest.fn(() => true)

      FormErrorListener.bind(EVENT, bound);
      FormErrorListener.bind(EVENT, bound2);

      expect(bound).not.toHaveBeenCalled()
      expect(bound2).not.toHaveBeenCalled()

      expect(FormErrorListener.emit(EVENT)).toBe(true);
      expect(bound).toHaveBeenCalled()
      expect(bound2).toHaveBeenCalled()
    });

    test("Some return false", () => {
      const EVENT = "RETURN_TRUE"

      const bound = jest.fn(() => true)
      const bound2 = jest.fn(() => false)
      const bound3 = jest.fn(() => true)

      FormErrorListener.bind(EVENT, bound);
      FormErrorListener.bind(EVENT, bound2);
      FormErrorListener.bind(EVENT, bound3);

      expect(bound).not.toHaveBeenCalled()
      expect(bound2).not.toHaveBeenCalled()
      expect(bound3).not.toHaveBeenCalled()

      expect(FormErrorListener.emit(EVENT)).toBe(false);
      expect(bound).toHaveBeenCalled()
      expect(bound2).toHaveBeenCalled()
      expect(bound3).toHaveBeenCalled()
    });
  });
});


