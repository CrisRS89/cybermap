export type AssetKind = "host" | "ip" | "domain" | "url" | "service";

export type AssetEnvironment = "dev" | "staging" | "prod" | "unknown";

export type AssetCriticality = "low" | "medium" | "high" | "critical";

export type FindingSeverity = "info" | "low" | "medium" | "high" | "critical";

export type FindingStatus =
  | "open"
  | "triaged"
  | "accepted"
  | "fixed"
  | "false_positive";

export type FindingSource = "manual" | "import" | "scanner";

export type ExplorationAsset = {
  id: string;
  name: string;
  kind: AssetKind;
  value: string;
  environment: AssetEnvironment;
  criticality: AssetCriticality;
  createdAt: string;
  updatedAt: string;
};

export type ExplorationFinding = {
  id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  status: FindingStatus;
  assetId: string | null;
  source: FindingSource;
  evidence: string;
  recommendation: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateExplorationAssetRequest = {
  name: string;
  kind: AssetKind;
  value: string;
  environment?: AssetEnvironment;
  criticality?: AssetCriticality;
};

export type CreateExplorationFindingRequest = {
  title: string;
  description?: string;
  severity: FindingSeverity;
  status?: FindingStatus;
  assetId?: string | null;
  source?: FindingSource;
  evidence?: string;
  recommendation?: string;
};

export type ExplorationAssetListResponse = {
  items: ExplorationAsset[];
};

export type ExplorationFindingListResponse = {
  items: ExplorationFinding[];
};
