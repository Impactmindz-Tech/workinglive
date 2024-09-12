// Country.js
import React, { useState } from 'react';

const Country = ({ countries = [], selectedCountry, onCountryChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <label>Country:</label>
      <input
        type="text"
        placeholder="Search Country"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select
        value={selectedCountry}
        onChange={(e) => onCountryChange(e.target.value)}
      >
        <option value="">Select Country</option>
        {filteredCountries.map(country => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Search Country"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default Country;
