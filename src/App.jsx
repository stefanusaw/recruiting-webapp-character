import { useState, useEffect } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST, calculateModifier, calculateSkillPoints, MAX_ATTRIBUTE_VALUE } from './consts.js';


function App() {
  // const [num, setNum] = useState<number>(0);
  const initialAttributes = ATTRIBUTE_LIST.reduce((acc, attr) => {
    acc[attr] = 10;
    return acc;
  }, {});

  const [attributes, setAttributes] = useState(initialAttributes); //task 1
  const [selectedClass, setSelectedClass] = useState(null); //task 2
  const [skills, setSkills] = useState(
    SKILL_LIST.reduce((acc, { name }) => ({ ...acc, [name]: 0 }), {})
  );
  const [remainingPoints, setRemainingPoints] = useState(0); //task 5

  // const API_URL = 'https://api/route';
  const API_URL = 'https://recruiting.verylongdomaintotestwith.ca/api/{stefanusaw}/character';
  // const API_URL = 'https://recruiting.verylongdomaintotestwith.ca/api/stefanusaw/character';


  useEffect(() => {
    handleGetRequest();
  }, []);

  const handleGetRequest = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch character');
      }
      const characterData = await response.json();
      console.log('Fetched character data: ', characterData);
      if (characterData.body && characterData.body.attributes){
        setAttributes(characterData.body.attributes);
        setSkills(characterData.body.skills);
        setSelectedClass(characterData.body.selectedClass);
        setRemainingPoints(characterData.body.remainingPoints);
      } else {
        console.error('Data missing or malformed in the API response');
      }
    } catch (error) {
      console.error('Error loading character', error);
    }
  };

  const handlePostRequest = async () => {
    const characterData = { attributes, skills, selectedClass, remainingPoints };
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(characterData),
      });

      if (!response.ok) {
        throw new Error('Failed to post character data');
      }

      const result = await response.json();
      console.log('Character saved successfully', result);
    } catch (error) {
      console.error('Error saving character:', error);
    }
  };

  const totalAttributePoints = Object.values(attributes).reduce((sum, points) => sum + points, 0);

  const updateAttribute = (attribute, value) => {
    setAttributes((prev) => {
      const newValue = Math.max(0, prev[attribute] + value);

      if (totalAttributePoints + (newValue - prev[attribute]) <= MAX_ATTRIBUTE_VALUE) {
        return { ...prev, [attribute]: newValue };
      } else {
        alert("The total attribute points cannot exceed 70. Please adjust other attributes.");
        return prev;
      }
    });
  };

  const checkRequirementsMet = (classCategory) => {
    const attributeRequirements = CLASS_LIST[classCategory];
    return Object.keys(attributeRequirements).every(
      (key) => attributes[key] >= attributeRequirements[key]
    );
  };

  const classCard = Object.keys(CLASS_LIST).map((classCategory) => {
    const meetsRequirements = checkRequirementsMet(classCategory);
    return (
      <div
        key={classCategory}
        onClick={() => setSelectedClass(classCategory)}
        className={`class-card ${meetsRequirements ? 'active-class' : ''}`}
        style={{
          cursor: 'pointer',
          color: meetsRequirements ? 'red' : 'black',
          backgroundColor: meetsRequirements ? 'lightgreen' : 'grey',
        }}
      >
        <h3>{classCategory}</h3>
      </div>
    );
  });

  const updateSkillPoints = () => {
    const intModifier = calculateModifier(attributes.Intelligence);
    const totalSkillPoints = calculateSkillPoints(intModifier);

    const totalUsedPoints = Object.values(skills).reduce((sum, points) => sum + points, 0);
    setRemainingPoints(Math.max(0, totalSkillPoints - totalUsedPoints));
  };

  const handleSkillChange = (skill, change) => {
    const newSkillPoints = skills[skill] + change;

    if (newSkillPoints < 0) return;

    setSkills((prevSkills) => {
      const newSkills = { ...prevSkills, [skill]: newSkillPoints };
      return newSkills;
    });
  };

  useEffect(() => {
    updateSkillPoints();
  }, [attributes, skills]);

  const skillRows = SKILL_LIST.map(({ name, attributeModifier }) => {
    const modifier = calculateModifier(attributes[attributeModifier]);
    return (
      <div key={name} className="skill-row">
        <span>{name}: {skills[name]}</span>
        <span> (Modifier: ({attributeModifier})): {modifier}</span>
        <button onClick={() => handleSkillChange(name, 1)} disabled={remainingPoints === 0}>+</button>
        <button onClick={() => handleSkillChange(name, -1)} disabled={skills[name] === 0}>-</button>
        <span> total: {skills[name] + modifier}</span>
      </div>
    );
  });

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
      </header>
      <section className="App-section">
        <button onClick={handlePostRequest}>Save Character</button>
        <div id="attributes">
          <h2>Attributes</h2>
          {ATTRIBUTE_LIST.map((attr) => (
            <div key={attr} className='attribute-row'>
              <span>{attr}: {attributes[attr]}</span>
              <span> (Modifier: {calculateModifier(attributes[attr])})</span>
              <button onClick={() => updateAttribute(attr, 1)} disabled={totalAttributePoints >= MAX_ATTRIBUTE_VALUE}>+</button>
              <button onClick={() => updateAttribute(attr, -1)} disabled={attributes[attr] <= 0}>-</button>
            </div>
          ))}
          <span><br /><b>Current Attribute Total: {totalAttributePoints}</b></span>
          {totalAttributePoints >= MAX_ATTRIBUTE_VALUE ? (
            <div>
              <p style={{ color: 'red' }}>Total Attribute Points has reached its maximum. Decrease one to modify another!</p>
            </div>
          ) : (<></>)
          }
        </div>

        <h2>Classes</h2>
        <div id="classes">{classCard}</div>
        {selectedClass && (
          <div style={{ border: '1px solid white' }}>
            <h3>Class Requirements for {selectedClass}</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {Object.keys(CLASS_LIST[selectedClass]).map((attribute) => (
                <li key={attribute}>
                  {attribute}: {CLASS_LIST[selectedClass][attribute]}
                </li>
              ))}
            </ul>
            <br />
            <button onClick={() => setSelectedClass(null)}>Close Requirements</button>
          </div>
        )}

        <h2>Skills</h2>
        <h3>Remaining Skill Points: {remainingPoints}</h3>
        {remainingPoints === 0 ? (
          <div>
            <p style={{ color: 'red' }}>You need more skill points! Upgrade intelligence to get more</p>
          </div>
        ) : (<></>)}
        <div id="skills">{skillRows}</div>

      </section>
    </div>
  );
}

export default App;
