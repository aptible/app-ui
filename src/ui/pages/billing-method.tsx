import { HeroBgLayout } from "../layouts";
import {
  Box,
  Button,
  FormGroup,
  Input,
  Select,
  SelectOption,
  tokens,
} from "../shared";

import { countries, states } from "@app/geography";
import { logoutUrl } from "@app/routes";
import { useState } from "react";
import { Link } from "react-router-dom";

export const BillingMethodPage = () => {
  const [creditCardNumber, setCreditCardNumber] = useState<string>("");
  const [expiration, setExpiration] = useState<string>("");
  const [securityCode, setSecurityCode] = useState<string>("");
  const [nameOnCard, setNameOnCard] = useState<string>("");
  const [streetAddress, setStreetAddress] = useState<string>("");
  const [aptSuiteEtc, setAptSuiteEtc] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [zipcode, setZipcode] = useState<string>("");
  const [country, setCountry] = useState<string>("");

  const stateOptions = states.map(({ shortCode, label }) => ({
    value: shortCode,
    label,
  }));
  const countryOptions = countries.map(({ shortCode, label }) => ({
    value: shortCode,
    label,
  }));

  const selectCountry = (option: SelectOption) => {
    setCountry(option.value);
  };
  const selectState = (option: SelectOption) => {
    setState(option.value);
  };

  const selectedState = stateOptions.find(
    (stateOption) => stateOption.value === state,
  );
  const selectedCountry = countryOptions.find(
    (countryOption) => countryOption.value === country,
  );

  const onSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <HeroBgLayout>
      <div className="text-center mt-16">
        <h1 className={tokens.type.h1}>Add Credit Card</h1>
        <p className="my-6 text-gray-600">
          Aptible will attempt a $1 pre-authorization charge. <br />
          We will not process this charge. There are no upfront charges.
        </p>
      </div>
      <Box>
        <form className="space-y-6" onSubmit={onSubmitForm}>
          <FormGroup label="Credit Card Number" htmlFor="credit-card-number">
            <Input
              name="credit-card-number"
              value={creditCardNumber}
              onChange={(e) => setCreditCardNumber(e.target.value)}
              required
            />
          </FormGroup>
          <div className="flex justify-between gap-4 mt-4">
            <FormGroup
              label="Expiration Date"
              htmlFor="credit-card-number"
              className="w-1/2"
            >
              <Input
                name="credit-card-number"
                value={expiration}
                placeholder="MM / YY"
                onChange={(e) => setExpiration(e.target.value)}
                required
              />
            </FormGroup>
            <FormGroup
              label="Security Code"
              htmlFor="credit-card-number"
              className="w-1/2"
            >
              <Input
                name="credit-card-number"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
                required
              />
            </FormGroup>
          </div>

          <FormGroup label="Name on Card" htmlFor="name-on-card">
            <Input
              id="name-on-card"
              name="name-on-card"
              type="text"
              autoComplete="name-on-card"
              required
              className="w-full"
              value={nameOnCard}
              onChange={(e) => setNameOnCard(e.target.value)}
            />
          </FormGroup>

          <FormGroup label="Street Address" htmlFor="street-address">
            <Input
              id="street-address"
              name="street-address"
              type="text"
              autoComplete="street-address"
              required
              className="w-full"
              placeholder="Street and number, P.O. box, c/o."
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
            />
          </FormGroup>

          <FormGroup label="Apt, Suite, Etc. " htmlFor="apt-suite-etc">
            <Input
              id="apt-suite-etc"
              name="apt-suite-etc"
              type="text"
              autoComplete="apt-suite-etc"
              placeholder="Optional"
              required={false}
              className="w-full"
              value={aptSuiteEtc}
              onChange={(e) => setAptSuiteEtc(e.target.value)}
            />
          </FormGroup>

          <FormGroup label="City " htmlFor="city">
            <Input
              id="city"
              name="city"
              type="text"
              autoComplete="city"
              required
              className="w-full"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </FormGroup>
          <div className="flex justify-between gap-4 mt-4">
            <div>
              <h4 className={"text-md font-semibold mb-2"}>State</h4>
              <div className="flex">
                <Select
                  className="w-full"
                  onSelect={selectState}
                  value={selectedState}
                  options={stateOptions}
                />
              </div>
            </div>
            <FormGroup label="Zipcode" htmlFor="zipcode" className="flex-1">
              <Input
                name="zipcode"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                required
              />
            </FormGroup>
          </div>
          <div className="mb-4">
            <h4 className={"text-md font-semibold mb-2"}>Country</h4>
            <div className="flex mb-2">
              <Select
                className="w-full"
                onSelect={selectCountry}
                value={selectedCountry}
                options={countryOptions}
              />
            </div>
          </div>
          <Button type="submit" className="mt-4 font-semibold w-full">
            Save & Finish
          </Button>
        </form>
        <div className="text-center text-sm mt-4">
          <p>
            Prefer to speak to someone first?{" "}
            <a href="https://www.aptible.com/contact">Schedule a demo</a> or go
            to <Link to={logoutUrl()}>Logout</Link>
          </p>
        </div>
      </Box>
    </HeroBgLayout>
  );
};
