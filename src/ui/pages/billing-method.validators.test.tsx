import { validators } from "./billing-method";

describe("Billing Method Validators", () => {
  describe("state validator", () => {
    const baseFormProps = {
      zipcode: "12345",
      nameOnCard: "John Doe",
      address1: "123 Main St",
      address2: "",
      city: "New York",
      state: "NA",
      country: "US",
    };

    it("requires state selection for US addresses", () => {
      const result = validators.state(baseFormProps);
      expect(result).toBe("state / province / district is required");
    });

    it("allows N/A state for Canadian addresses", () => {
      const canadaProps = { ...baseFormProps, country: "CA" };
      const result = validators.state(canadaProps);
      expect(result).toBeUndefined();
    });

    it("allows N/A state for non-US/Canada addresses", () => {
      const otherCountryProps = { ...baseFormProps, country: "GB" };
      const result = validators.state(otherCountryProps);
      expect(result).toBeUndefined();
    });

    it("allows valid state selection for US addresses", () => {
      const validStateProps = { ...baseFormProps, state: "NY" };
      const result = validators.state(validStateProps);
      expect(result).toBeUndefined();
    });
  });
});
