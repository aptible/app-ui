import { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { isResourcePinned, toggleResourcePin, type PinnedResource } from "./pinned-resources";

interface PinStarProps {
  resource: Omit<PinnedResource, 'pinnedAt'>;
  className?: string;
}

export const PinStar = ({ resource, className = "" }: PinStarProps) => {
  const [isPinned, setIsPinned] = useState(false);

  // Check initial pin status
  useEffect(() => {
    setIsPinned(isResourcePinned(resource.id, resource.type));
  }, [resource.id, resource.type]);

  // Listen for pin changes from other components
  useEffect(() => {
    const handlePinnedResourcesChanged = (event: any) => {
      const { action, resource: changedResource, id, type } = event.detail;
      
      if (action === 'pin' && changedResource?.id === resource.id && changedResource?.type === resource.type) {
        setIsPinned(true);
      } else if (action === 'unpin' && id === resource.id && type === resource.type) {
        setIsPinned(false);
      }
    };

    window.addEventListener('pinnedResourcesChanged', handlePinnedResourcesChanged);
    return () => {
      window.removeEventListener('pinnedResourcesChanged', handlePinnedResourcesChanged);
    };
  }, [resource.id, resource.type]);

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const newPinStatus = toggleResourcePin(resource);
    setIsPinned(newPinStatus);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-1 rounded hover:bg-gray-100 transition-colors ${className}`}
      title={isPinned ? "Unpin resource" : "Pin resource"}
    >
      {isPinned ? (
        <StarIconSolid className="w-4 h-4 text-yellow-500" />
      ) : (
        <StarIcon className="w-4 h-4 text-gray-300 hover:text-yellow-500" />
      )}
    </button>
  );
}; 