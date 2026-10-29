export interface PromptArtifact {
  version: '1';
  id?: string;
  title: string;
  bodyMarkdown: string;
  sections: { heading: string; content: string }[];
  decompositionIncluded: boolean;
  warnings?: string[];
}
