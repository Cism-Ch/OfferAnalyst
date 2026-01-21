---
name: AI Agent Engine
description: Specialized skill for building, maintaining, and optimizing autonomous AI agents using multi-model integrations (Gemini, Hugging Face, OpenRouter).
---

# AI Agent Engine

This skill provides instructions for designing and implementing sophisticated AI agents capable of autonomous analysis, data retrieval, and decision-making.

## Core Pillars

### 1. Multi-Model Architecture
Design agents to be provider-agnostic or to leverage specific strengths of different LLMs.
- **Google Gemini**: Prioritize for large context windows, native tool use, and multimodal capabilities. Use `google-generative-ai` SDK.
- **Hugging Face**: Leverage specialized open-source models for specific tasks (NER, Sentiment, Code).
- **OpenRouter / OpenAI**: Use for broad compatibility and access to industry-standard models (GPT-4, Claude).

### 2. Prompt Engineering & System Instructions
- **Persona Definition**: Clearly define the agent's role, constraints, and output format.
- **Few-Shot Prompting**: Provide high-quality examples of intended behavior.
- **Chain of Thought**: Force the agent to reason through steps before providing a final answer.
- **Dynamic Context**: Manage the injection of real-time data or user history into the prompt.

### 3. Agent State & Memory
- **Stateless vs Stateful**: Decide if the agent needs to maintain history across sessions (stored in MongoDB via Prisma).
- **Buffer Management**: Implement strategies to handle context window limits (summarization, sliding windows).

### 4. Tool Use (Function Calling)
- **Schema Definition**: Provide precise JSON schemas for tools/functions the agent can call.
- **Error Handling**: Gracefully handle failed tool calls or hallucinated arguments.
- **Loop Prevention**: Detect and break infinite tool-calling loops.

## Best Practices
- **Cost Optimization**: Use smaller models for routing or pre-processing; reserve large models for final reasoning.
- **Safety & Alignment**: Implement strict output filtering and input sanitization.
- **Observability**: Log agent "thoughts", tool calls, and final outputs for debugging and refinement.
- **Streaming**: Prioritize streaming responses for improved user perceived performance.
