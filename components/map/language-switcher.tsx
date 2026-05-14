"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import type { Language } from "@/lib/translations"

interface LanguageSwitcherProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
}

export default function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 rounded-full bg-white/90 p-0 text-slate-800 shadow-md hover:bg-white"
          aria-label="Change language"
        >
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem
          className={currentLanguage === "en" ? "bg-slate-100" : ""}
          onClick={() => onLanguageChange("en")}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          className={currentLanguage === "lv" ? "bg-slate-100" : ""}
          onClick={() => onLanguageChange("lv")}
        >
          Latviešu
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
