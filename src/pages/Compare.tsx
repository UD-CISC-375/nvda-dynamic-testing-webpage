import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteHeader } from '../components/SiteHeader';
import { REGISTRY, Scenario } from '../scenarios/registry';
import { CATEGORY_TITLES, Category, Variant, VARIANTS } from '../scenarios/registry.data';

interface Selection {
  id: string;
  variant: Variant;
}

// Scenario IDs were authored for a page containing one widget. Namespace their
// DOM references at the panel boundary so labels and ARIA relationships remain
// local when the same scenario is selected twice, without changing scenarios.
const ID_REFERENCES = ['for', 'aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-activedescendant'];

function usePanelIds(panel: string) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const prefix = `compare-${panel}-`;
    const scoped = (id: string) => id.startsWith(prefix) ? id : `${prefix}${id}`;
    const update = () => {
      element.querySelectorAll<HTMLElement>('*').forEach((node) => {
        if (node.id && !node.id.startsWith(prefix)) node.id = scoped(node.id);
        ID_REFERENCES.forEach((attribute) => {
          const value = node.getAttribute(attribute);
          if (!value) return;
          const next = value.trim().split(/\s+/).map(scoped).join(' ');
          if (next !== value) node.setAttribute(attribute, next);
        });
        const href = node.getAttribute('href');
        if (href?.startsWith('#') && href.length > 1) {
          const next = `#${scoped(href.slice(1))}`;
          if (next !== href) node.setAttribute('href', next);
        }
      });
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(element, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['id', 'href', ...ID_REFERENCES],
    });
    return () => observer.disconnect();
  });
  return root;
}

function ComparePanel({
  panel,
  scenario,
  variant,
  onChange,
}: {
  panel: 'a' | 'b';
  scenario: Scenario;
  variant: Variant;
  onChange: (selection: Selection) => void;
}) {
  const [reset, setReset] = useState(0);
  const scenarioRoot = usePanelIds(panel);
  const { id, defaultDelay: delay } = scenario;
  const Component = variant === 'accessible' ? scenario.Accessible : scenario.Broken;

  return (
    <section
      className="compare-panel"
      aria-labelledby={`compare-heading-${panel}`}
      data-testid={`compare-panel-${panel}`}
      data-scenario={id}
      data-variant={variant}
      data-delay={delay}
    >
      <h2 id={`compare-heading-${panel}`}>Panel {panel.toUpperCase()}</h2>
      <div className="stack compare-controls">
        <label htmlFor={`compare-scenario-${panel}`}>Scenario</label>
        <select
          id={`compare-scenario-${panel}`}
          value={id}
          onChange={(event) => onChange({ id: event.target.value, variant })}
        >
          {(Object.keys(CATEGORY_TITLES) as Category[]).map((category) => (
            <optgroup key={category} label={CATEGORY_TITLES[category]}>
              {REGISTRY.filter((entry) => entry.category === category).map((entry) => (
                <option key={entry.id} value={entry.id}>{entry.title}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <fieldset className="compare-variants">
          <legend>Variant</legend>
          <div className="row">
            {VARIANTS.map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name={`compare-variant-${panel}`}
                  value={option}
                  checked={variant === option}
                  onChange={() => onChange({ id, variant: option })}
                />{' '}
                {option === 'accessible' ? 'Accessible' : 'Broken'}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <p className="eyebrow">{CATEGORY_TITLES[scenario.category]}</p>
      <h3>{scenario.title}</h3>
      <p>{scenario.description}</p>
      <div className={`variant-bar variant-${variant}`}>
        <p>Variant: <strong>{variant}</strong>{variant === 'broken' && <> — {scenario.flaw}</>}</p>
        <button type="button" className="btn btn-secondary" onClick={() => setReset((n) => n + 1)}>
          Reset panel {panel.toUpperCase()}
        </button>
      </div>
      <div
        className="scenario"
        ref={scenarioRoot}
        onClickCapture={(event) => {
          // Error-summary links otherwise use document.getElementById with
          // their original IDs. Resolve local fragment links within this panel.
          const link = (event.target as Element).closest('a[href^="#"]');
          const id = link?.getAttribute('href')?.slice(1);
          const target = id && Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[id]'))
            .find((node) => node.id === id);
          if (target) {
            event.preventDefault();
            event.stopPropagation();
            target.focus();
          }
        }}
      >
        <Component key={`${id}-${variant}-${delay}-${reset}`} delay={scenario.defaultDelay} />
      </div>
    </section>
  );
}

export function Compare() {
  const [a, setA] = useState<Selection>({ id: 'disclosure-tabs', variant: 'accessible' });
  const [b, setB] = useState<Selection>({ id: 'live-toast', variant: 'accessible' });
  const scenarioA = REGISTRY.find((scenario) => scenario.id === a.id)!;
  const scenarioB = REGISTRY.find((scenario) => scenario.id === b.id)!;

  useEffect(() => {
    document.title = `Compare: ${scenarioA.title} (${a.variant}) vs ${scenarioB.title} (${b.variant}) - NVDA test page`;
  }, [scenarioA.title, a.variant, scenarioB.title, b.variant]);

  return (
    <>
      <SiteHeader />
      <main id="main" className="page compare-page">
        <Link to="/" className="back-link" data-testid="back-to-index">
          <span aria-hidden="true">← </span>Back to all scenarios
        </Link>
        <h1>Compare two scenarios</h1>
        <p>Choose a scenario and variant in each panel to compare their behaviour and announcements.</p>
        <div className="compare-grid">
          <ComparePanel panel="a" scenario={scenarioA} variant={a.variant} onChange={setA} />
          <ComparePanel panel="b" scenario={scenarioB} variant={b.variant} onChange={setB} />
        </div>
      </main>
    </>
  );
}
