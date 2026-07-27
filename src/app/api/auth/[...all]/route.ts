import {toNextJsHandler} from 'better-auth/next-js';
import {getAuth} from '@/lib/auth';

function getHandlers() {
  return toNextJsHandler(getAuth());
}

export function GET(request: Request) {
  return getHandlers().GET(request);
}

export function POST(request: Request) {
  return getHandlers().POST(request);
}
