export interface RoutingRulePayload {
  preset_name: string;
  category_slug: string;
  category_label: string;
  category_description: string;
  model: string;
  is_skill?: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface RoutingPresetPayload {
  _type: "preset_meta";
  name: string;
  label: string;
  description: string;
  is_active: boolean;
  is_builtin: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoutingRule {
  category_slug: string;
  category_label: string;
  category_description: string;
  model: string;
  is_skill?: boolean;
  priority: number;
}

export interface RoutingPreset {
  name: string;
  label: string;
  description: string;
  is_active: boolean;
  is_builtin: boolean;
  rules: RoutingRule[];
}

export interface RoutingResolveInput {
  task_description: string;
  preset?: string;
}

export interface RoutingResolveResult {
  model: string;
  category: string;
  category_label: string;
  confidence: number;
  preset_used: string;
  is_skill: boolean;
  alternatives: Array<{
    model: string;
    category: string;
    confidence: number;
  }>;
}
