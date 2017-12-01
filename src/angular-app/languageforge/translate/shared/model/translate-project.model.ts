export class TranslateProject {
  config?: TranslateConfig;

  // extends LfProject
  appLink: string;
  appName: string;
  featured: boolean | string;
  id: string;
  interfaceLanguageCode: string;
  isArchived: boolean;
  ownerRef: {
    id: string,
    username: string;
  };
  projectCode: string;
  projectName: string;
  slug: string;
  userIsProjectOwner: boolean;
}

export class TranslateConfig {
  confidenceThreshold: number;
  documentSets: TranslateConfigDocumentSets;
  isTranslationDataShared?: boolean | string;
  isTranslationDataScripture?: boolean;
  metrics: TranslateConfigMetrics;
  source: TranslateConfigDocType;
  target: TranslateConfigDocType;
  userPreferences: TranslateUserPreferences;
}

export class TranslateConfigDocType {
  /** @var InputSystem */
  inputSystem: any;
}

export class TranslateConfigDocumentSets {
  idsOrdered: string[];
}

export class TranslateUserPreferences {
  confidenceThreshold: number;
  hasConfidenceOverride: boolean;
  isDocumentOrientationTargetRight: boolean;
  isFormattingOptionsShown: boolean;
  selectedDocumentSetId: string;
}

export class TranslateConfigMetrics {
  activeEditTimeout: number;
  editingTimeout: number;
}