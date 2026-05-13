const KEY = 'midinero_subscriptions';

export function loadSubscriptions() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}

export function saveSubscriptions(subs) {
  localStorage.setItem(KEY, JSON.stringify(subs));
}
