import fs from 'fs';
import path from 'path';
import { fireEvent, screen } from '@testing-library/dom';

function loadAccordionPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), 'public/accordion.html'),
    'utf8',
  );

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  document.head.innerHTML = parsed.head.innerHTML;
  document.body.innerHTML = parsed.body.innerHTML;

  const script = parsed.querySelector('script');
  if (!script?.textContent) {
    throw new Error('accordion.html is missing its page script');
  }
  // eslint-disable-next-line no-new-func
  new Function(script.textContent)();
}

beforeEach(() => {
  loadAccordionPage();
});

test('renders a title and accordion header buttons', () => {
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Accordion');
  expect(screen.getByTestId('trigger')).toHaveTextContent('What is NVDA?');
  expect(screen.getByTestId('trigger').tagName).toBe('BUTTON');
  expect(screen.getByTestId('trigger')).toHaveAttribute(
    'id',
    'accordion-header-btn',
  );
  expect(screen.getByTestId('accordion-panel-1')).toHaveAttribute(
    'id',
    'accordion-panel',
  );
});

test('links back to the landing site', () => {
  expect(screen.getByTestId('back-to-index')).toHaveAttribute('href', './#/');
});

test('does not include an accessible variant switcher', () => {
  expect(screen.queryByTestId('variant-switcher')).not.toBeInTheDocument();
  expect(screen.queryByText(/accessible/i)).not.toBeInTheDocument();
});

test('clicking a header toggles its panel visually', () => {
  const panel = screen.getByTestId('accordion-panel-1');
  expect(panel).not.toHaveClass('is-open');

  fireEvent.click(screen.getByTestId('trigger'));
  expect(panel).toHaveClass('is-open');
  expect(panel).toHaveTextContent(
    'NVDA (NonVisual Desktop Access) is a free, open-source screen reader for Windows.',
  );

  fireEvent.click(screen.getByTestId('trigger'));
  expect(panel).not.toHaveClass('is-open');
});

test('headers and panels omit accordion ARIA attributes', () => {
  const header = screen.getByTestId('trigger');
  const panel = screen.getByTestId('accordion-panel-1');

  expect(header).not.toHaveAttribute('aria-expanded');
  expect(header).not.toHaveAttribute('aria-controls');
  expect(panel).not.toHaveAttribute('role');
  expect(panel).not.toHaveAttribute('aria-labelledby');
});
