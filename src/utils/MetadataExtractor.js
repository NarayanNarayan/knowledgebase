/**
 * Metadata Extractor
 * Extracts metadata from agent results
 */
export class MetadataExtractor {
  /**
   * Extract RAG metadata from result
   * @param {object} result - Agent result
   * @returns {object|null} Extracted metadata or null
   */
  extractRAGMetadata(result) {
    if (!result || !result.retrievalMethod) {
      return null;
    }

    const metadata = {
      retrievalMethod: result.retrievalMethod,
    };

    if (result.iterations) {
      metadata.iterations = result.iterations;
    }

    if (result.totalResultsRetrieved) {
      metadata.totalResultsRetrieved = result.totalResultsRetrieved;
    }

    return metadata;
  }

  /**
   * Extract sources from RAG result
   * @param {object} result - RAG agent result
   * @returns {Array|null} Sources array or null
   */
  extractSources(result) {
    if (!result || !result.sources) {
      return null;
    }

    return result.sources;
  }

  /**
   * Extract all metadata from agent results
   * @param {Array<{agent: string, result: object}>} agentResults - Agent results
   * @returns {object} Aggregated metadata
   */
  extractAllMetadata(agentResults) {
    const metadata = {};

    // Find RAG agent result
    const ragResult = agentResults.find(ar => ar.agent === 'RAG_AGENT');
    if (ragResult) {
      const ragMetadata = this.extractRAGMetadata(ragResult.result);
      if (ragMetadata) {
        metadata.ragMetadata = ragMetadata;
      }

      const sources = this.extractSources(ragResult.result);
      if (sources) {
        metadata.sources = sources;
      }
    }

    return metadata;
  }
}

