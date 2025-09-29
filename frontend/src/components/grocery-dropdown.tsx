import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GroceryDropdownProps {
  title: string
  content: string
}

export function GroceryDropdown({ title, content }: GroceryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="w-full max-w-md mx-auto mb-4">
      <Button
        variant="outline"
        className="w-full justify-between h-12 text-left bg-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {isOpen && (
        <div className="mt-2 border border-border rounded-md bg-card shadow-sm">
          <div className="px-4 py-3 text-sm whitespace-pre-line">{content}</div>
        </div>
      )}
    </div>
  )
}
