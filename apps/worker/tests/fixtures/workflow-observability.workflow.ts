import { proxyActivities, continueAsNew, executeChild } from "@temporalio/workflow";

const { ping } = proxyActivities<{ ping(): Promise<string> }>({
  startToCloseTimeout: "10 seconds"
});

/** Minimal workflow used to prove span parenting across the workflow/activity boundary. */
export async function tracePing(input: { traceparent: string }): Promise<string> {
  void input.traceparent;
  return await ping();
}

/** Child workflow: its span must nest under the parent workflow span. */
export async function traceChild(input: { traceparent: string }): Promise<string> {
  return await executeChild(tracePing, { args: [input] });
}

/** Continue-as-new: the next run must link back to the run it replaced. */
export async function traceContinue(input: { traceparent: string; generation: number }): Promise<string> {
  if (input.generation < 1) return continueAsNew({ ...input, generation: input.generation + 1 });
  return await ping();
}

/** Background continuation: the turn carries a link to the trace it continues. */
export async function traceBackground(input: { traceLink: { traceId: string; spanId: string } }): Promise<string> {
  void input.traceLink;
  return await ping();
}
