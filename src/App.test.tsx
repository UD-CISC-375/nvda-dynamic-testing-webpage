import { render, screen, within } from '@testing-library/react';
import App from './App';
import { SCENARIOS } from './scenarios/registry.data';
import { WCAG_CRITERIA, WCAG_URL } from './scenarios/wcag';

test('registry ids and paths are unique', () => {
  expect(new Set(SCENARIOS.map((s) => s.id)).size).toBe(SCENARIOS.length);
  expect(new Set(SCENARIOS.map((s) => s.path)).size).toBe(SCENARIOS.length);
});

test('index links to both variants of every scenario', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dynamic component test scenarios');
  for (const s of SCENARIOS) {
    expect(screen.getByTestId(`link-${s.id}-accessible`)).toHaveAttribute('href', `#${s.path}?variant=accessible`);
    expect(screen.getByTestId(`link-${s.id}-broken`)).toHaveAttribute('href', `#${s.path}?variant=broken`);
  }
});

test('scenario pages link back to the index', () => {
  window.location.hash = `#${SCENARIOS[0].path}`;
  render(<App />);
  expect(screen.getByTestId('back-to-index')).toHaveAttribute('href', '#/');
  window.location.hash = '';
});

test('index and scenario pages link to WCAG 2.2', () => {
  const { unmount } = render(<App />);
  expect(screen.getByTestId('wcag-link')).toHaveAttribute('href', WCAG_URL);
  for (const s of SCENARIOS) {
    const links = within(screen.getByTestId(`wcag-${s.id}`)).queryAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual(
      s.wcag.filter((sc) => WCAG_CRITERIA[sc]).map((sc) => `${WCAG_URL}#${WCAG_CRITERIA[sc].anchor}`),
    );
  }
  unmount();

  window.location.hash = `#${SCENARIOS[0].path}`;
  render(<App />);
  expect(screen.getByTestId('wcag-link')).toHaveAttribute('href', WCAG_URL);
  expect(screen.getByTestId('wcag-criteria')).toHaveTextContent('4.1.3 Status Messages');
  window.location.hash = '';
});
