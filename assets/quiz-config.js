/* ICE WIND — guided enquiry widget: configuration.
 *
 * No API key here, deliberately. The widget talks to a Cloudflare Worker that
 * holds the OpenRouter key server-side; its source lives in ../proxy/ outside
 * this repository. Nothing in this file is secret.
 *
 * With proxyUrl empty the widget still runs end to end — it simply records
 * free text verbatim instead of having the guide respond to it.
 */
window.IW_QUIZ_CONFIG = {
  proxyUrl: 'https://icewind-quiz-proxy.icewinddale.workers.dev',

  /* Where the finished enquiry is posted. Same destination as the plain form. */
  formAction: 'https://formsubmit.co/manager@icewinddaleconsulting.com',
  formNext: 'https://icewind.uk/demo/order-quiz/?sent=true',

  requestTimeoutMs: 20000
};
