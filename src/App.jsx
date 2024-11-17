import { useState } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts.js';



function App() {
  // const [num, setNum] = useState<number>(0);
  const initialAttributes = ATTRIBUTE_LIST.reduce((acc, attr) => {
    acc[attr] = 10;
    return acc;
  }, {})

  const [attributes, setAttributes] = useState(initialAttributes);

  const updateAttribute = (attribute, value) => {
    setAttributes((prev) => {
      const newValue = Math.max(0, prev[attribute] + value);
      return { ...prev, [attribute]: newValue };
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
      </header>
      <section className="App-section">
        {ATTRIBUTE_LIST.map((attr) => (
          <div key={attr} className='attribute-row'>
            <span>{attr}: {attributes[attr]}</span>
            <button onClick={() => updateAttribute(attr, 1)}>+</button>
            <button onClick={() => updateAttribute(attr, -1)}>-</button>
          </div>
        ))}

      </section>
    </div>
  );
}

export default App;
