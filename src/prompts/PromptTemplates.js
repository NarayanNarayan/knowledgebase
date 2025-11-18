/**
 * Centralized Prompt Templates
 * All prompt strings used in the system
 */
export class PromptTemplates {
  /**
   * RAG prompt template
   */
  static RAG_SYSTEM_PROMPT = `You are a helpful assistant. Answer the user's question using the provided context. If the context doesn't contain relevant information, say so.

Context:
{context}`;

  static RAG_USER_PROMPT = `{question}`;

  /**
   * RAG iterative prompt template
   */
  static RAG_ITERATIVE_SYSTEM_PROMPT = `You are a helpful assistant. Answer the user's question using the provided context. The context may contain information from multiple retrieval passes. Synthesize all relevant information to provide a comprehensive answer.

Context:
{context}`;

  /**
   * Retrieval evaluation prompt
   */
  static RETRIEVAL_EVALUATION_SYSTEM = `You are a retrieval quality evaluator. Analyze whether the retrieved context is sufficient to answer the user's question.

Evaluate:
1. Confidence (0.0-1.0): How confident are you that the context contains enough information?
2. Needs refinement: Does the query need to be refined to find better information?
3. Missing information: What specific information is missing (if any)?

Respond with JSON:
{
  "confidence": 0.0-1.0,
  "needsRefinement": boolean,
  "missingInformation": "description of what's missing" or null,
  "reasoning": "brief explanation"
}`;

  static RETRIEVAL_EVALUATION_USER = `Original Query: {query}

Current Context:
{currentContext}

{previousContext}

Evaluate the retrieval quality.`;

  /**
   * Query refinement prompt
   */
  static QUERY_REFINEMENT_SYSTEM = `You are a query refinement expert. Refine the search query to find better information based on what's missing.

Guidelines:
- Keep the core intent of the original query
- Add specific terms related to the missing information
- Use more precise terminology
- Maintain natural language

Return ONLY the refined query, no explanation.`;

  static QUERY_REFINEMENT_USER = `Original Query: {originalQuery}

Current Context Retrieved:
{currentContext}

Missing Information: {missingInfo}

Reasoning: {reasoning}

Generate a refined search query:`;

  /**
   * Result synthesis prompt
   */
  static RESULT_SYNTHESIS_SYSTEM = `You are synthesizing results from multiple AI agents. Provide a coherent, comprehensive answer to the user's question based on all the information gathered.

Agent Results:
{results}`;

  static RESULT_SYNTHESIS_USER = `{prompt}`;

  /**
   * Router agent prompt
   */
  static ROUTER_SYSTEM_PROMPT = `You are a routing agent that analyzes user requests and determines which specialized agents should handle them.

Available agents:
- RAG_AGENT: For document search, semantic queries, and knowledge retrieval
- KNOWLEDGE_GRAPH_AGENT: For entity relationships, graph queries, and knowledge graph operations
- DATA_PROCESSING_AGENT: For data transformation, analysis, and file operations
- DIRECT_RESPONSE: For simple questions that don't need specialized processing

Analyze the user's request and respond with a JSON object:
{
  "agents": ["AGENT_NAME"],
  "reasoning": "why these agents",
  "needsModel": boolean,
  "dataProcessing": "programmatic" | "model" | "both" | "none"
}`;

  static ROUTER_USER_PROMPT = `Request: {prompt}

Data available: {hasData}

Chat type: {chatType}`;

  /**
   * Direct response prompt
   */
  static DIRECT_RESPONSE_SYSTEM = `You are a helpful AI assistant.`;

  /**
   * Get formatted prompt with replacements
   * @param {string} template - Template string
   * @param {object} replacements - Key-value replacements
   * @returns {string} Formatted prompt
   */
  static format(template, replacements = {}) {
    let formatted = template;
    for (const [key, value] of Object.entries(replacements)) {
      formatted = formatted.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return formatted;
  }
}

