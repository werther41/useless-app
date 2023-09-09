import React, { useState } from "react";
import "./App.css";

const App = () => {
  const [fact, setFact] = useState("");

  const generateFact = () => {
    // Replace this with your own list of useless facts
    const facts = [
      "A cat has 32 muscles in each ear.",
      "The average person spends 6 months of their lifetime waiting for a red light to turn green.",
      "A sneeze travels out of your mouth at over 100 miles per hour.",
      "The average person walks the equivalent of three times around the world in a lifetime.",
      "A single cloud can weigh more than 1 million pounds.",
    ];

    const randomFact = facts[Math.floor(Math.random() * facts.length)];
    setFact(randomFact);
  };

  return (
    <div className="App">
      <h1>Useless Facts</h1>
      <p>{fact}</p>
      <button onClick={generateFact}>Generate Fact</button>
    </div>
  );
};

export default App;
