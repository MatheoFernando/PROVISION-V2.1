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
            className="inline-flex items-center cursor-pointer gap-1 sm:gap-2  border-white/20 bg-white/10 hover:bg-white/20 px-2 sm:px-3 transition-colors duration-200"
            aria-label="Abrir busca"
            onClick={() => setOpen(true)}
          >
            <SearchIcon className="h-4 w-4" />
  
          </Button>
        </div>
      ) : (
        <InputGroup className="py-2 md:py-3 border-white/20 rounded-md bg-white/10 hover:bg-white/20 transition-colors duration-200">
          <InputGroupInput placeholder="Pesquisar..." className="py-2 md:py-3 placeholder:text-white/70 text-white border-none bg-transparent focus:bg-white/5"/>
          <InputGroupAddon>
            <SearchIcon className="text-white/80"/>
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Kbd className="bg-transparent border border-white/30 text-white/80 p-2 md:p-3 text-xs">CTRL k</Kbd>
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
