import React, { useState } from "react";
import { Grid, Flex, Box, Heading, Text, Button } from "@radix-ui/themes";

const App = () => {
  const [fact, setFact] = useState("");

  const generateFact = () => {
    // Replace this with your own list of useless facts
    const facts = [
      "Bananas are berries, but strawberries aren't.",
      "The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion.",
      "A group of flamingos is called a 'flamboyance.'",
      "Octopuses have three hearts.",
      "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
      "Cows have best friends and can become stressed when they are separated.",
      "The shortest war in history was between Britain and Zanzibar on August 27, 1896. It lasted only 38 minutes.",
      "Penguins have knees but they're inside their bodies, so you can't see them.",
      "A jiffy is an actual unit of time, equivalent to 1/100th of a second.",
      "In Switzerland, it's illegal to own just one guinea pig because they are prone to loneliness.",
      "There are more possible iterations of a game of chess than there are atoms in the known universe.",
      "The unicorn is Scotland's national animal.",
      "The first recorded game of baseball was played in 1846 in Hoboken, New Jersey.",
      "A single strand of spaghetti is called a 'spaghetto.'",
      "A day on Venus is longer than its year. Venus rotates on its axis extremely slowly, taking about 243 Earth days to complete one rotation, while it only takes 225 Earth days to orbit the Sun.",
      "The average person will spend six months of their life waiting for red lights to turn green.",
      "The name for the shape of Pringles is called a 'Hyperbolic Paraboloid.'",
      "The smell of freshly-cut grass is actually a plant distress call.",
      "A flock of crows is known as a 'murder.'",
      "There is a species of jellyfish known as 'Turritopsis dohrnii' or the 'immortal jellyfish' that can revert back to its juvenile form after reaching maturity.",
      "Hippopotomonstrosesquipedaliophobia is the fear of long words.",
      "A group of owls is called a 'parliament.'",
      "The plastic tips at the end of shoelaces are called 'aglets.'",
      "A 'baker's dozen' is actually 13, not 12.",
      "A snail can sleep for three years.",
      "The world's largest desert is not the Sahara, but Antarctica.",
      "The smell of freshly baked bread can reduce stress and make people kinder.",
      "Wombat feces are cube-shaped.",
      "The longest hiccuping spree lasted for 68 years.",
      "Cows have a magnetic sense and tend to align themselves with Earth's magnetic field when grazing or resting.",
    ];
    const randomFact = facts[Math.floor(Math.random() * facts.length)];
    setFact(randomFact);
  };

  return (
    <>
      <Grid columns="1" gap="3" width="auto">
        <Flex direction="column" gap="3" align="center" justify="center">
          <Box>
            <Heading size="7">Useless Facts</Heading>
          </Box>
          <Box>
            <Button onClick={generateFact}>Generate Fact</Button>
          </Box>
          <Box>
            <Text size="5">{fact}</Text>
          </Box>
        </Flex>
      </Grid>
    </>
  );
};

export default App;
