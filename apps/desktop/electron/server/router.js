function compilePattern(pattern) {
  const names = [];
  const source = pattern
    .split('/')
    .map((segment) => {
      if (!segment.startsWith(':')) return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      names.push(segment.slice(1));
      return '([^/]+)';
    })
    .join('/');
  return { names, regex: new RegExp(`^${source}$`) };
}

export function createApp() {
  const routes = [];
  const register = (method, pattern, ...handlers) => {
    routes.push({ method, ...compilePattern(pattern), handlers });
  };

  return {
    get: (pattern, ...handlers) => register('GET', pattern, ...handlers),
    post: (pattern, ...handlers) => register('POST', pattern, ...handlers),
    put: (pattern, ...handlers) => register('PUT', pattern, ...handlers),
    async handle(input = {}) {
      const method = String(input.method || 'GET').toUpperCase();
      const url = new URL(String(input.path || '/'), 'app://cleanlympics');
      const route = routes.find((candidate) => candidate.method === method && candidate.regex.test(url.pathname));
      if (!route) return { status: 404, body: { error: 'Not found' } };

      const match = url.pathname.match(route.regex);
      const params = Object.fromEntries(route.names.map((name, index) => [name, decodeURIComponent(match[index + 1])]));
      const headers = Object.fromEntries(Object.entries(input.headers || {}).map(([key, value]) => [key.toLowerCase(), String(value)]));
      const req = {
        method,
        path: url.pathname,
        headers,
        body: input.body && typeof input.body === 'object' ? input.body : {},
        params,
        query: Object.fromEntries(url.searchParams.entries()),
        user: null,
      };

      let status = 200;
      let body;
      let completed = false;
      const res = {
        status(code) {
          status = Number(code);
          return res;
        },
        json(value) {
          body = value;
          completed = true;
          return res;
        },
      };

      const dispatch = async (index) => {
        if (completed || index >= route.handlers.length) return;
        const handler = route.handlers[index];
        await handler(req, res, () => dispatch(index + 1));
      };

      try {
        await dispatch(0);
        return { status: completed ? status : 204, body: completed ? body : null };
      } catch (error) {
        return { status: 500, body: { error: error?.message || 'Internal application error' } };
      }
    },
  };
}
