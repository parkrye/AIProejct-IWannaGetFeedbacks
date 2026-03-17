import { getLlama, type LlamaModel, type LlamaContext } from "node-llama-cpp";
import type { ModelConfig } from "../../shared/types.ts";

let model: LlamaModel | null = null;
let context: LlamaContext | null = null;

export async function initializeModel(config: ModelConfig): Promise<void> {
  const llama = await getLlama();
  model = await llama.loadModel({ modelPath: config.modelPath });
  context = await model.createContext({ contextSize: config.contextSize });
}

export async function* generateStream(
  systemPrompt: string,
  userPrompt: string,
  config: ModelConfig,
): AsyncGenerator<string, void, undefined> {
  if (!context) {
    throw new Error("모델이 초기화되지 않았습니다. initializeModel()을 먼저 호출하세요.");
  }

  const { LlamaChatSession } = await import("node-llama-cpp");
  const session = new LlamaChatSession({ contextSequence: context.getSequence() });

  session.setChatHistory([
    { type: "system", text: systemPrompt },
  ]);

  const responseIterator = session.prompt(userPrompt, {
    temperature: config.temperature,
    topP: config.topP,
    maxTokens: config.maxTokens,
    onTextChunk: undefined,
  });

  // node-llama-cpp v3 returns the full response; we yield it as a single chunk
  // For true token streaming, we use onTextChunk callback in the route layer
  const fullResponse = await responseIterator;
  yield fullResponse;
}

export async function generateWithCallback(
  systemPrompt: string,
  userPrompt: string,
  config: ModelConfig,
  onToken: (token: string) => void,
): Promise<string> {
  if (!context) {
    throw new Error("모델이 초기화되지 않았습니다. initializeModel()을 먼저 호출하세요.");
  }

  const { LlamaChatSession } = await import("node-llama-cpp");
  const session = new LlamaChatSession({ contextSequence: context.getSequence() });

  session.setChatHistory([
    { type: "system", text: systemPrompt },
  ]);

  const response = await session.prompt(userPrompt, {
    temperature: config.temperature,
    topP: config.topP,
    maxTokens: config.maxTokens,
    onTextChunk: onToken,
  });

  return response;
}

export async function disposeModel(): Promise<void> {
  if (context) {
    await context.dispose();
    context = null;
  }
  model = null;
}
