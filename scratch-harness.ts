import { mapFigureForCard } from './src/utils/figureMapper';

const fixtures = [
  {
    _desc: 'Thumbnail missing, image_url missing, images missing (Tier 3)',
    id: 'f1',
    slug_tr: 'test-figure',
    figure_name: 'Test Figure',
    series: { id: 's1', slug_tr: 'test-series' }
  },
  {
    _desc: 'Slug missing (Tier 1)',
    id: 'f2',
    figure_name: 'No Slug Figure',
    images: ['image.jpg'],
    series: { id: 's2', slug_tr: 'test-series-2' }
  },
  {
    _desc: 'Series relation null (Tier 2)',
    id: 'f3',
    slug_tr: 'no-series-figure',
    figure_name: 'No Series Figure',
    images: ['image.jpg'],
    series: null
  },
  {
    _desc: 'Array instead of Object (Tier 1)',
    data: ['this', 'is', 'an', 'array']
  },
  {
    _desc: 'Missing ID completely (Tier 1)',
    slug_tr: 'no-id-figure',
    figure_name: 'No ID',
    series: { id: 's3', slug_tr: 'test-series-3' }
  }
];

// Mocking Sentry captureMessage / captureException
(global as any).SentryLogs = [];
jestMockSentry();

function jestMockSentry() {
  const SentryMock = {
    captureMessage: (msg: string, level: string) => {
       (global as any).SentryLogs.push(`[${level.toUpperCase()}] ${msg}`);
    },
    captureException: (err: Error) => {
       (global as any).SentryLogs.push(`[EXCEPTION] ${err.message}`);
    }
  };
  require('module').prototype.require = new Proxy(require('module').prototype.require, {
    apply(target, thisArg, argumentsList) {
      if (argumentsList[0] === '@sentry/nextjs') return SentryMock;
      return Reflect.apply(target, thisArg, argumentsList);
    }
  });
}

console.log('--- CONTRACT STRESS TEST RESULTS ---\n');
fixtures.forEach(f => {
  const isArrayTest = Array.isArray(f.data);
  const data = isArrayTest ? f.data : f;
  const desc = f._desc;
  
  (global as any).SentryLogs = [];
  const result = mapFigureForCard(data);
  
  console.log(`Test: ${desc}`);
  console.log(`Result: ${result === null ? 'BLOCKED/DROPPED' : 'PASSED/FALLBACK'}`);
  console.log('Sentry Logs:', (global as any).SentryLogs);
  if (result) console.log('Mapped Shape:', JSON.stringify(result, null, 2));
  console.log('------------------------------------\n');
});

