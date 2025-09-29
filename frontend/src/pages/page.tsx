import { Header } from "@/components/header"
import { GroceryDropdown } from "@/components/grocery-dropdown"
import { Mic } from "lucide-react"
import { Button } from "@/components/ui/button"

const groceryContent = `Weekly Essentials:
Milk, Bread, Eggs, Butter, Cheese, Yogurt, Bananas, Apples

Dinner Party:
Salmon, Asparagus, Wine, Olive Oil, Garlic, Lemons, Fresh Herbs, Dessert

Breakfast Items:
Oatmeal, Berries, Honey, Orange Juice, Coffee, Granola, Almond Milk

Snacks & Treats:
Chips, Nuts, Dark Chocolate, Crackers, Hummus, Fresh Fruit, Popcorn`

export default function Page() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans antialiased">
      <Header />

      <div className="px-4 pt-6 pb-2 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Hello, Alex</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-4">
          <GroceryDropdown title="Grocery Lists" content={groceryContent} />
        </div>
      </div>

      <div className="flex justify-center pb-8 pt-4">
        <Button
          size="lg"
          className="w-16 h-16 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
        >
          <Mic className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}