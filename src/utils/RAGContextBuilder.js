/**
 * RAG Context Builder
 * Builds context text from search results for RAG operations
 */
export class RAGContextBuilder {
  /**
   * Build context text from search results
   * @param {Array} searchResults - Search results
   * @param {boolean} includeGraphContext - Whether to include graph context
   * @returns {string} Formatted context text
   */
  buildContextText(searchResults, includeGraphContext = false) {
    return searchResults
      .map((r, i) => {
        let text = `[${i + 1}] ${r.title}\n${r.content}`;
        
        // Add graph context if available and enabled
        if (includeGraphContext && r.graphContext) {
          const graphInfo = this.formatGraphContext(r.graphContext);
          if (graphInfo) {
            text += `\n\nRelated entities: ${graphInfo}`;
          }
        }
        
        return text;
      })
      .join('\n\n');
  }

  /**
   * Format graph context for inclusion in text
   * @param {object} graphData - Graph data from Neo4j
   * @returns {string|null} Formatted graph context or null
   */
  formatGraphContext(graphData) {
    if (!graphData || !graphData.entities || graphData.entities.length === 0) {
      return null;
    }

    const entities = graphData.entities
      .map(e => e.name || e.id)
      .filter(Boolean)
      .slice(0, 5) // Limit to top 5 related entities
      .join(', ');

    return entities || null;
  }

  /**
   * Format sources for response
   * @param {Array} searchResults - Search results
   * @returns {Array} Formatted sources
   */
  formatSources(searchResults) {
    return searchResults.map(r => ({
      docId: r.doc_id,
      title: r.title,
      source: r.source,
      similarity: r.similarity,
      ...(r.graphContext ? { relatedEntities: this.formatGraphContext(r.graphContext) } : {}),
    }));
  }
}

