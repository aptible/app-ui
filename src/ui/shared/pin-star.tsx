import { selectIsPinned, togglePinnedResource } from "@app/pinned-resource";
import { useSelector } from "@app/react";
import type { PinnedResource } from "@app/types";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useDispatch } from "starfx/react";

interface PinStarProps {
  resource: PinnedResource;
  className?: string;
}

export const PinStar = ({ resource, className = "" }: PinStarProps) => {
  const dispatch = useDispatch();
  const isPinned = useSelector((s) => selectIsPinned(s, resource));
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dispatch(togglePinnedResource(resource));
  };

  return (
    <button
      type="button"
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
