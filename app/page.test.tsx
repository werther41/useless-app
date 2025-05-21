import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IndexPage from './page'; // Path to the component

// Mock the JSON data
const mockFacts = [
  { id: 1, text: 'Test Fact 1', rating: 0 },
  { id: 2, text: 'Test Fact 2', rating: 5 },
  { id: 3, text: 'Test Fact 3', rating: -2 },
];
jest.mock('../data/fun-facts.json', () => mockFacts, { virtual: true });

describe('IndexPage', () => {
  let mathRandomSpy: jest.SpyInstance;

  beforeEach(() => {
    // Resetting mocks and spies before each test
    jest.clearAllMocks();
    // Mock Math.random to always return 0, so the first fact is chosen
    mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    // Restore original Math.random implementation
    if (mathRandomSpy) {
      mathRandomSpy.mockRestore();
    }
  });

  it('renders initial state correctly', () => {
    render(<IndexPage />);
    expect(screen.getByText('Useless Fact')).toBeInTheDocument();
    expect(screen.getByText('Click the button to see a fun fact!')).toBeInTheDocument();
    expect(screen.queryByText('Rating:')).not.toBeInTheDocument();
    expect(screen.queryByText('Upvote')).not.toBeInTheDocument();
    expect(screen.queryByText('Downvote')).not.toBeInTheDocument();
  });

  it('generates a fact, displays its text, rating, and voting buttons', async () => {
    render(<IndexPage />);
    const generateButton = screen.getByText('Generate Fact');
    fireEvent.click(generateButton);

    // The first fact from mockFacts should be chosen due to Math.random mock
    await waitFor(() => expect(screen.getByText(mockFacts[0].text)).toBeInTheDocument());
    expect(screen.getByText(`Rating: ${mockFacts[0].rating}`)).toBeInTheDocument();
    expect(screen.getByText('Upvote')).toBeInTheDocument();
    expect(screen.getByText('Downvote')).toBeInTheDocument();
  });

  it('upvotes a fact and updates the rating', async () => {
    render(<IndexPage />);
    fireEvent.click(screen.getByText('Generate Fact'));
    await waitFor(() => expect(screen.getByText(mockFacts[0].text)).toBeInTheDocument());

    const upvoteButton = screen.getByText('Upvote');
    fireEvent.click(upvoteButton);
    expect(screen.getByText(`Rating: ${mockFacts[0].rating + 1}`)).toBeInTheDocument();
  });

  it('downvotes a fact and updates the rating', async () => {
    // Use the second fact which has an initial rating of 5 for this test
    mathRandomSpy.mockReturnValue(1 / mockFacts.length); // To select the second fact (index 1)
    
    render(<IndexPage />);
    fireEvent.click(screen.getByText('Generate Fact'));
    await waitFor(() => expect(screen.getByText(mockFacts[1].text)).toBeInTheDocument());
    expect(screen.getByText(`Rating: ${mockFacts[1].rating}`)).toBeInTheDocument();

    const downvoteButton = screen.getByText('Downvote');
    fireEvent.click(downvoteButton);
    expect(screen.getByText(`Rating: ${mockFacts[1].rating - 1}`)).toBeInTheDocument();
  });

  it('correctly handles multiple upvotes and downvotes', async () => {
    render(<IndexPage />);
    fireEvent.click(screen.getByText('Generate Fact'));
    await waitFor(() => expect(screen.getByText(mockFacts[0].text)).toBeInTheDocument());
    
    const initialRating = mockFacts[0].rating; // Should be 0

    const upvoteButton = screen.getByText('Upvote');
    const downvoteButton = screen.getByText('Downvote');

    // Upvote twice
    fireEvent.click(upvoteButton); // Rating: 1
    fireEvent.click(upvoteButton); // Rating: 2
    expect(screen.getByText(`Rating: ${initialRating + 2}`)).toBeInTheDocument();

    // Downvote once
    fireEvent.click(downvoteButton); // Rating: 1
    expect(screen.getByText(`Rating: ${initialRating + 1}`)).toBeInTheDocument();

    // Downvote again
    fireEvent.click(downvoteButton); // Rating: 0
    expect(screen.getByText(`Rating: ${initialRating}`)).toBeInTheDocument();
  });

  it('displays the correct rating for a fact with a non-zero initial rating and allows voting', async () => {
    // Target the second fact (index 1) with initial rating 5
    mathRandomSpy.mockReturnValue(1 / mockFacts.length); 
    render(<IndexPage />);
    fireEvent.click(screen.getByText('Generate Fact'));
    
    await waitFor(() => expect(screen.getByText(mockFacts[1].text)).toBeInTheDocument());
    expect(screen.getByText(`Rating: ${mockFacts[1].rating}`)).toBeInTheDocument(); // Expected: Rating: 5

    const upvoteButton = screen.getByText('Upvote');
    fireEvent.click(upvoteButton);
    expect(screen.getByText(`Rating: ${mockFacts[1].rating + 1}`)).toBeInTheDocument(); // Expected: Rating: 6
    
    const downvoteButton = screen.getByText('Downvote');
    fireEvent.click(downvoteButton); // Back to 5
    fireEvent.click(downvoteButton); // Down to 4
    expect(screen.getByText(`Rating: ${mockFacts[1].rating -1}`)).toBeInTheDocument(); // Expected: Rating: 4
  });
});
