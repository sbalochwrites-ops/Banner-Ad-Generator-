import { BannerAdState, ProductInput } from '../types';

export interface CustomTemplate {
  id: string;
  name: string;
  badge: string;
  createdAt: number;
  input: ProductInput;
  initialState: BannerAdState;
  isCustom: boolean;
}

const STORAGE_KEY = 'banner_studio_custom_templates_v1';

export function getCustomTemplates(): CustomTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load custom templates from localStorage:', e);
    return [];
  }
}

export function saveCustomTemplate(
  name: string,
  badge: string,
  input: ProductInput,
  state: BannerAdState
): CustomTemplate {
  const templates = getCustomTemplates();
  const newTemplate: CustomTemplate = {
    id: `custom_${Date.now()}`,
    name: name.trim() || `${state.copy.brandName || 'Custom'} Template`,
    badge: badge.trim() || 'Custom',
    createdAt: Date.now(),
    input: JSON.parse(JSON.stringify(input)),
    initialState: JSON.parse(JSON.stringify(state)),
    isCustom: true,
  };

  const updated = [newTemplate, ...templates.filter((t) => t.id !== newTemplate.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newTemplate;
}

export function deleteCustomTemplate(id: string): CustomTemplate[] {
  const templates = getCustomTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
}
