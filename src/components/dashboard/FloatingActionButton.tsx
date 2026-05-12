import React from "react";
import { Button, Tooltip } from "@heroui/react";
import { Plus } from "lucide-react";

export default function FloatingActionButton() {
  return (
    <Tooltip>
      <Tooltip.Trigger>
        <Button
          className="fixed bottom-8 right-8 z-30 border-2 border-[#FF8A65] bg-white text-[#FF8A65] font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform rounded-full px-6 py-3"
        >
          <Plus className="h-4 w-4 mr-1" />
          More
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>Quick Actions</Tooltip.Content>
    </Tooltip>
  );
}
