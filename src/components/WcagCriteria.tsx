import { WCAG_CRITERIA, WCAG_URL } from '../scenarios/wcag';

/** Lists a scenario's WCAG 2.2 success criteria, each linked to its section of the standard. */
export function WcagCriteria({ criteria, testid }: { criteria: string[]; testid: string }) {
  return (
    <p className="wcag-criteria" data-testid={testid}>
      WCAG 2.2:{' '}
      {criteria.map((sc, i) => {
        const known = WCAG_CRITERIA[sc];
        return (
          <span key={sc}>
            {i > 0 && ', '}
            {known ? (
              <a href={`${WCAG_URL}#${known.anchor}`}>
                {sc} {known.name}
              </a>
            ) : (
              sc
            )}
          </span>
        );
      })}
    </p>
  );
}
