import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SiteHeader } from '../components/SiteHeader';
import { WcagCriteria } from '../components/WcagCriteria';
import { REGISTRY } from '../scenarios/registry';
import { CATEGORY_TITLES, Category, VARIANTS } from '../scenarios/registry.data';
import { WCAG_URL } from '../scenarios/wcag';

const CATEGORIES = Object.keys(CATEGORY_TITLES) as Category[];
const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
export const ACCORDION_PAGE = `${publicUrl}/accordion.html`;

export function Index() {
  useEffect(() => {
    document.title = 'NVDA dynamic test page';
  }, []);

  return (
    <>
      <SiteHeader />
      <main id="main" className="page">
        <h1>Dynamic component test scenarios</h1>
        <p>
          Each scenario has an <strong>accessible</strong> variant and a deliberately <strong>broken</strong> one.
          Add <code>?delay=0</code> to make async updates immediate. A machine-readable list is at{' '}
          <a href="scenarios.json">scenarios.json</a>.
        </p>
        <p>
          Each scenario lists the success criteria it tests from the{' '}
          <a href={WCAG_URL} data-testid="wcag-link">
            WCAG 2.2 standard
          </a>
          .
        </p>
        {CATEGORIES.map((category) => (
          <section key={category} aria-labelledby={`cat-${category}`}>
            <h2 id={`cat-${category}`}>{CATEGORY_TITLES[category]}</h2>
            <ul className="scenario-list">
              {REGISTRY.filter((s) => s.category === category).map((s) => (
                <li key={s.id} data-testid={`scenario-${s.id}`}>
                  <h3>{s.title}</h3>
                  <WcagCriteria criteria={s.wcag} testid={`wcag-${s.id}`} />
                  <p>{s.description}</p>
                  <p className="row">
                    {VARIANTS.map((variant) => (
                      <Link
                        key={variant}
                        to={{ pathname: s.path, search: `?variant=${variant}` }}
                        data-testid={`link-${s.id}-${variant}`}
                      >
                        {variant === 'accessible' ? 'Accessible' : 'Broken'}
                        <span className="visually-hidden"> variant of {s.title}</span>
                      </Link>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <section aria-labelledby="isolated-pages">
          <h2 id="isolated-pages">Isolated test pages</h2>
          <ul className="scenario-list">
            <li data-testid="isolated-accordion">
              <h3>Accordion</h3>
              <p>
                Standalone HTML page with a broken accordion. Headers toggle
                panels visually but omit ARIA expanded state and controls.
              </p>
              <p className="row">
                <a href={ACCORDION_PAGE} data-testid="link-accordion-isolated">
                  Open isolated page
                </a>
              </p>
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}

export function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="page">
        <h1>Scenario not found</h1>
        <p>
          <Link to="/">Back to all scenarios</Link>
        </p>
      </main>
    </>
  );
}
