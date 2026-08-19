import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the public home page', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /clothing with a story/i })).toBeInTheDocument();
});
