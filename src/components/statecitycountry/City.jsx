// State.js
import React, { useState } from 'react';

const State = ({ states = [], selectedState, onStateChange, disabled }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStates = states.filter(state =>
    state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <label>State:</label>
      <input
        type="text"
        placeholder="Search State"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        disabled={disabled}
      />
      <select
        value={selectedState}
        onChange={(e) => onStateChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">Select State</option>
        {filteredStates.map(state => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Search State"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
};

export default State;
