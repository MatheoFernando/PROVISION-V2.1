"use client"
import { SearchIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import { Button } from "@/components/ui/button"
import * as React from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useIsMobile } from "@/hooks/use-mobile"

export function KeyboardSearch() {
  const [open, setOpen] = React.useState(false)
  const isMobile = useIsMobile()

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      {isMobile ? (
        <div className="flex w-full items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="inline-flex items-center cursor-pointer gap-1 sm:gap-2  border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 px-2 sm:px-3 transition-colors duration-200"
            aria-label="Abrir busca"
            onClick={() => setOpen(true)}
          >
            <SearchIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
  
          </Button>
        </div>
      ) : (
        <InputGroup className="py-2 md:py-3 border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200">
          <InputGroupInput placeholder="Pesquisar..." className="py-2 md:py-3  text-white border-none bg-transparent focus:bg-white/5 placeholder:text-gray-500 dark:placeholder:text-gray-400"/>
          <InputGroupAddon>
            <SearchIcon className="text-gray-500 dark:text-gray-400"/>
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Kbd className="bg-transparent border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 p-2 md:p-3 text-xs">CTRL k</Kbd>
          </InputGroupAddon>
        </InputGroup>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Digite um comando ou pesquise..." />
        <CommandList>
          <CommandEmpty>Sem resultados.</CommandEmpty>
          <CommandGroup heading="Sugestões">
          
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Rotas">
       
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
