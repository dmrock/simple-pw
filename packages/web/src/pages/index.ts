import { lazy } from 'react';

// Lazy load page components for code splitting
export const Dashboard = lazy(() =>
  import('./Dashboard').then((module) => ({ default: module.Dashboard }))
);

export const TestRuns = lazy(() =>
  import('./TestRuns').then((module) => ({ default: module.TestRuns }))
);

export const TestRunDetails = lazy(() =>
  import('./TestRunDetails').then((module) => ({
    default: module.TestRunDetails,
  }))
);

export const Analytics = lazy(() =>
  import('./Analytics').then((module) => ({ default: module.Analytics }))
);
