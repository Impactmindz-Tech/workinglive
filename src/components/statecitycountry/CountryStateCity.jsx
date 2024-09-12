import React, { useState, useEffect } from 'react';
import Dropdown from './Dropdown';

const CountryStateCity = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    fetch('/countries.json')
      .then(response => response.json())
      .then(data => {
        const countryList = data.map(country => ({
          name: country.name,
          code: country.isoCode
        }));
        setCountries(countryList);
      })
      .catch(error => console.error('Error fetching countries:', error));
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetch('/states.json')
        .then(response => response.json())
        .then(data => {
          const filteredStates = data.filter(state => state.countryCode === selectedCountry.code);
          setStates(filteredStates.map(state => ({
            name: state.name,
            code: state.isoCode
          })));
          setSelectedState(null);
          setSelectedCity(null);
          setCities([]);
        })
        .catch(error => console.error('Error fetching states:', error));
    } else {
      setStates([]);
      setCities([]);
      setSelectedState(null);
      setSelectedCity(null);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      fetch('/cities.json')
        .then(response => response.json())
        .then(data => {
          const filteredCities = data.filter(city => city.stateCode === selectedState.code && city.countryCode === selectedCountry.code);
          setCities(filteredCities.map(city => ({
            name: city.name
          })));
          setSelectedCity(null);
        })
        .catch(error => console.error('Error fetching cities:', error));
    } else {
      setCities([]);
      setSelectedCity(null);
    }
  }, [selectedState, selectedCountry]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold mb-4 text-center">Select Country, State, and City</h2>

      {/* Country Dropdown */}
      <Dropdown
        data={countries.map(c => c.name)}
        selectedValue={selectedCountry?.name || ''}
        onChange={name => {
          const country = countries.find(c => c.name === name);
          setSelectedCountry(country || null);
        }}
        placeholder="Select Country"
      />

      {/* State Dropdown */}
      <Dropdown
        data={states.map(s => s.name)}
        selectedValue={selectedState?.name || ''}
        onChange={name => {
          const state = states.find(s => s.name === name);
          setSelectedState(state || null);
        }}
        placeholder="Select State"
        disabled={!selectedCountry}
      />

      {/* City Dropdown */}
      <Dropdown
        data={cities.map(c => c.name)}
        selectedValue={selectedCity || ''}
        onChange={setSelectedCity}
        placeholder="Select City"
        disabled={!selectedState}
      />
    </div>
  );
};

export default CountryStateCity;
