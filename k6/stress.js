/**
 * Reference:
 * https://grafana.com/docs/k6/latest/testing-guides/test-types/stress-testing/
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
	stages: [
    { duration: '1m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

export default function() {
	const res = http.get('https://sinister-incorporated-git-develop-simonknittel.vercel.app/');

  check(res, { 'status was 200': (r) => r.status == 200 });

  sleep(1);
}
