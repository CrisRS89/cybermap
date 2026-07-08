export type AgentRunStatus = "completed" | "failed";

export type AgentRunScope = {
  assetIds: string[];
  includeAssets: boolean;
  includeServices: boolean;
  includeFindings: boolean;
};

export type AgentRunRequest = {
  agentId: string;
  providerId: string;
  model: string;
  task: string;
  scope?: AgentRunScope;
};

export type AgentRecommendation = {
  title: string;
  severity: string;
  rationale: string;
  suggestedFinding: boolean;
};

export type AgentRunEvidenceUsed = {
  assets: number;
  services: number;
  findings: number;
};

export type AgentRunResponse = {
  runId: string;
  agentId: string;
  providerId: string;
  model: string;
  status: AgentRunStatus;
  summary: string;
  recommendations: AgentRecommendation[];
  evidenceUsed: AgentRunEvidenceUsed;
};

export type AiRunHistoryItem = {
  id: string;
  agentId: string;
  providerId: string;
  model: string;
  task: string;
  status: AgentRunStatus;
  summary: string;
  recommendations: AgentRecommendation[];
  evidenceUsed: AgentRunEvidenceUsed;
  createdAt: string;
  updatedAt: string;
};

export type AiRunListResponse = {
  items: AiRunHistoryItem[];
};
