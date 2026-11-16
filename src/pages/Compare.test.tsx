import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from '../App';
import { REGISTRY } from '../scenarios/registry';

beforeEach(() => {
  window.location.hash = '#/compare';
});

afterEach(() => {
  window.location.hash = '';
  jest.useRealTimers();
});

test('compare route renders two labelled panels with all scenarios and no scenario-root testids', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Compare two scenarios');
  expect(screen.getAllByTestId(/^compare-panel-/)).toHaveLength(2);
  expect(screen.queryByTestId('scenario-root')).not.toBeInTheDocument();
  for (const name of ['A', 'B']) {
    const panel = screen.getByRole('region', { name: `Panel ${name}` });
    const select = within(panel).getByLabelText('Scenario');
    expect(within(select).getAllByRole('option')).toHaveLength(REGISTRY.length);
    for (const scenario of REGISTRY) {
      expect(within(select).getByRole('option', { name: scenario.title })).toHaveValue(scenario.id);
    }
  }
  expect(document.title).toBe('Compare: Tabs (accessible) vs Auto-dismissing toast (accessible) - NVDA test page');
});

test('selections update metadata and title while preserving the other panel', () => {
  render(<App />);
  const a = within(screen.getByTestId('compare-panel-a'));
  const b = within(screen.getByTestId('compare-panel-b'));
  const message = b.getByRole('textbox', { name: 'Message' });
  fireEvent.change(message, { target: { value: 'Keep this draft' } });

  for (const scenario of REGISTRY) {
    fireEvent.change(a.getByLabelText('Scenario'), { target: { value: scenario.id } });
    for (const variant of ['accessible', 'broken']) {
      fireEvent.change(a.getByLabelText('Variant'), { target: { value: variant } });
      expect(screen.getByTestId('compare-panel-a')).toHaveAttribute('data-scenario', scenario.id);
      expect(screen.getByTestId('compare-panel-a')).toHaveAttribute('data-variant', variant);
      expect(document.title).toBe(`Compare: ${scenario.title} (${variant}) vs Auto-dismissing toast (accessible) - NVDA test page`);
      expect(b.getByRole('textbox', { name: 'Message' })).toBe(message);
      expect(message).toHaveValue('Keep this draft');
    }
  }
});

test('labels, ARIA references and error-summary focus stay inside their panel', async () => {
  render(<App />);
  const a = within(screen.getByTestId('compare-panel-a'));
  const b = within(screen.getByTestId('compare-panel-b'));
  for (const panel of [a, b]) {
    fireEvent.change(panel.getByLabelText('Scenario'), { target: { value: 'forms-summary' } });
    fireEvent.click(panel.getByRole('button', { name: 'Submit' }));
  }
  await waitFor(() => {
    expect(b.getByRole('group', { name: 'There are 2 problems with your submission' }))
      .toHaveAttribute('aria-labelledby', 'compare-b-summary-title');
    expect(b.getByRole('link', { name: 'Enter your name' })).toHaveAttribute('href', '#compare-b-summary-name');
  });
  fireEvent.click(b.getByRole('link', { name: 'Enter your name' }));
  expect(b.getByRole('textbox', { name: 'Name' })).toHaveFocus();
  expect(a.getByRole('textbox', { name: 'Name' })).not.toHaveFocus();
  const ids = Array.from(document.querySelectorAll('[id]')).map((node) => node.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test('the same widget has independent state and each reset remounts only its own panel', () => {
  render(<App />);
  const a = within(screen.getByTestId('compare-panel-a'));
  const b = within(screen.getByTestId('compare-panel-b'));
  fireEvent.change(b.getByLabelText('Scenario'), { target: { value: 'disclosure-tabs' } });
  fireEvent.click(a.getByRole('tab', { name: 'Security' }));
  expect(a.getByRole('tab', { name: 'Security' })).toHaveAttribute('aria-selected', 'true');
  expect(b.getByRole('tab', { name: 'Profile' })).toHaveAttribute('aria-selected', 'true');
  fireEvent.click(b.getByRole('tab', { name: 'Billing' }));
  const tabB = b.getByRole('tab', { name: 'Billing' });
  const tabA = a.getByRole('tab', { name: 'Profile' });
  fireEvent.click(a.getByRole('button', { name: 'Reset panel A' }));
  expect(a.getByRole('tab', { name: 'Profile' })).not.toBe(tabA);
  expect(a.getByRole('tab', { name: 'Profile' })).toHaveAttribute('aria-selected', 'true');
  expect(b.getByRole('tab', { name: 'Billing' })).toBe(tabB);
  expect(tabB).toHaveAttribute('aria-selected', 'true');
  const resetTabA = a.getByRole('tab', { name: 'Profile' });
  fireEvent.click(b.getByRole('button', { name: 'Reset panel B' }));
  expect(b.getByRole('tab', { name: 'Billing' })).not.toBe(tabB);
  expect(b.getByRole('tab', { name: 'Profile' })).toHaveAttribute('aria-selected', 'true');
  expect(a.getByRole('tab', { name: 'Profile' })).toBe(resetTabA);
});

test('changing a scenario or variant remounts its widget', () => {
  render(<App />);
  const a = within(screen.getByTestId('compare-panel-a'));
  fireEvent.click(a.getByRole('tab', { name: 'Security' }));
  fireEvent.change(a.getByLabelText('Variant'), { target: { value: 'broken' } });
  expect(a.getByTestId('tab-profile')).toHaveAttribute('data-active', 'true');
  fireEvent.click(a.getByTestId('tab-billing'));
  fireEvent.change(a.getByLabelText('Variant'), { target: { value: 'accessible' } });
  expect(a.getByRole('tab', { name: 'Profile' })).toHaveAttribute('aria-selected', 'true');
  fireEvent.change(a.getByLabelText('Scenario'), { target: { value: 'live-toast' } });
  fireEvent.change(a.getByRole('textbox'), { target: { value: 'Discard this draft' } });
  fireEvent.change(a.getByLabelText('Scenario'), { target: { value: 'disclosure-tabs' } });
  fireEvent.change(a.getByLabelText('Scenario'), { target: { value: 'live-toast' } });
  expect(a.getByRole('textbox')).toHaveValue('Hello!');
});

test('panels use default delays and resetting cancels only that panel’s pending update', () => {
  jest.useFakeTimers();
  window.location.hash = '#/compare?delay=0';
  render(<App />);
  const a = within(screen.getByTestId('compare-panel-a'));
  const b = within(screen.getByTestId('compare-panel-b'));
  for (const panel of [a, b]) {
    fireEvent.change(panel.getByLabelText('Scenario'), { target: { value: 'live-polite' } });
    fireEvent.click(panel.getByRole('button', { name: 'Add to cart' }));
  }
  act(() => { jest.advanceTimersByTime(999); });
  expect(a.queryByTestId('status-text')).not.toBeInTheDocument();
  expect(b.queryByTestId('status-text')).not.toBeInTheDocument();
  fireEvent.click(a.getByRole('button', { name: 'Reset panel A' }));
  act(() => { jest.advanceTimersByTime(1); });
  expect(a.queryByTestId('status-text')).not.toBeInTheDocument();
  expect(b.getByTestId('status-text')).toHaveTextContent('Item added to cart. 1 item in cart.');
});
