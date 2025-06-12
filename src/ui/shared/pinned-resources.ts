export interface PinnedResource {
  id: string;
  type: 'app' | 'database';
  name: string;
  status?: string;
  pinnedAt: string;
}

const STORAGE_KEY = 'aptible_pinned_resources';

// Get all pinned resources from localStorage
export const getPinnedResources = (): PinnedResource[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading pinned resources from localStorage:', error);
    return [];
  }
};

// Save pinned resources to localStorage
const savePinnedResources = (resources: PinnedResource[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
  } catch (error) {
    console.error('Error saving pinned resources to localStorage:', error);
  }
};

// Check if a resource is pinned
export const isResourcePinned = (id: string, type: 'app' | 'database'): boolean => {
  const pinned = getPinnedResources();
  return pinned.some(resource => resource.id === id && resource.type === type);
};

// Pin a resource
export const pinResource = (resource: Omit<PinnedResource, 'pinnedAt'>): void => {
  const pinned = getPinnedResources();
  
  // Check if already pinned
  const exists = pinned.some(p => p.id === resource.id && p.type === resource.type);
  if (exists) return;
  
  const newResource: PinnedResource = {
    ...resource,
    pinnedAt: new Date().toISOString(),
  };
  
  const updated = [...pinned, newResource];
  savePinnedResources(updated);
  
  // Dispatch custom event to notify components
  window.dispatchEvent(new CustomEvent('pinnedResourcesChanged', { 
    detail: { action: 'pin', resource: newResource } 
  }));
};

// Unpin a resource
export const unpinResource = (id: string, type: 'app' | 'database'): void => {
  const pinned = getPinnedResources();
  const updated = pinned.filter(resource => !(resource.id === id && resource.type === type));
  savePinnedResources(updated);
  
  // Dispatch custom event to notify components
  window.dispatchEvent(new CustomEvent('pinnedResourcesChanged', { 
    detail: { action: 'unpin', id, type } 
  }));
};

// Toggle pin status
export const toggleResourcePin = (resource: Omit<PinnedResource, 'pinnedAt'>): boolean => {
  const isPinned = isResourcePinned(resource.id, resource.type);
  
  if (isPinned) {
    unpinResource(resource.id, resource.type);
    return false;
  } else {
    pinResource(resource);
    return true;
  }
};

// Get pinned resources sorted by most recently pinned
export const getPinnedResourcesSorted = (): PinnedResource[] => {
  const pinned = getPinnedResources();
  return pinned.sort((a, b) => new Date(b.pinnedAt).getTime() - new Date(a.pinnedAt).getTime());
}; 