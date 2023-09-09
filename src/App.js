import React, { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [funFacts, setFunFacts] = useState([]);

  const generateFunFacts = () => {
    fetch("https://useless-facts.sameerkumar.website/api", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        amount: 30,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const facts = data.map((item) => item.fact);
        setFunFacts(facts);
      })
      .catch((error) => {
        console.error("Error fetching fun facts:", error);
      });
  };

  useEffect(() => {
    generateFunFacts();
  }, []);

  return (
    <div className="App">
      <h1>Random Fun Facts</h1>
      {funFacts.map((fact, index) => (
        <p key={index}>{fact}</p>
      ))}
      <button onClick={generateFunFacts}>Generate Fun Facts</button>
    </div>
  );
};

export default App;
