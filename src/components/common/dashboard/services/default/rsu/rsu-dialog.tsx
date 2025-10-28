"use client"

import * as React from "react"
import { 
  Building, 
  Clock, 
  MapPin, 
  User,
  Package,
  CreditCard,
  Hash,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Rsu } from "@/infrastructure/schema/schema-rsu"
import { mockContainers, mockSites, mockEmployees, mockCompanies } from "@/infrastructure/schema/schema-rsu"

interface RsuDialogProps {
  rsu: Rsu
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function RsuDialog({ 
  rsu, 
  isOpen, 
  onOpenChange 
}: RsuDialogProps) {
  
  const getContainerName = (id: string) => mockContainers.find(c => c.id === id)?.name || 'N/A'
  const getCompanyName = (id: string) => mockCompanies.find(c => c.id === id)?.name || 'N/A'
  const getEmployeeName = (id: string) => mockEmployees.find(e => e.id === id)?.name || 'N/A'
  const getSiteName = (id: string) => mockSites.find(s => s.id === id)?.name || 'N/A'

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Package className="size-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  RSU #{rsu.cod}
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Detalhes completos do RSU
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="size-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informações Básicas */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Hash className="size-5 text-blue-600" />
                  Informações Básicas
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Código:</span>
                    <span className="font-semibold text-gray-900">{rsu.cod}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Quantidade:</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {rsu.quantity}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Cartão:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {rsu.cardId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Relacionamentos */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building className="size-5 text-blue-600" />
                  Relacionamentos
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Container:</span>
                    <span className="font-medium text-gray-900">{getContainerName(rsu.containerId)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Empresa:</span>
                    <span className="font-medium text-gray-900">{getCompanyName(rsu.companyId)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Funcionário:</span>
                    <span className="font-medium text-gray-900">{getEmployeeName(rsu.employeeId)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Local:</span>
                    <span className="font-medium text-gray-900">{getSiteName(rsu.siteId)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tempos e Comentários */}
            <div className="space-y-6">
              {/* Tempos */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="size-5 text-blue-600" />
                  Tempos
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Tempo Cliente:</span>
                    <Badge variant="outline" className="border-blue-200 text-blue-800">
                      {rsu.clientTime}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Tempo Total:</span>
                    <Badge variant="outline" className="border-blue-200 text-blue-800">
                      {rsu.totalTime}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Comentários */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="size-5 text-blue-600" />
                  Observações
                </h3>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {rsu.comment || 'Nenhum comentário adicionado'}
                  </p>
                </div>
              </div>

              {/* Datas */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="size-5 text-blue-600" />
                  Histórico
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Criado em:</span>
                    <span className="text-sm text-gray-500">
                      {new Date(rsu.createdAt || '').toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Atualizado em:</span>
                    <span className="text-sm text-gray-500">
                      {new Date(rsu.updatedAt || '').toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

