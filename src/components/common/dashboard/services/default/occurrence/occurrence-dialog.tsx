"use client"

import * as React from "react"
import { 
  AlertTriangle,
  Building, 
  User,
  Wrench,
  MapPin,
  Clock,
  FileText,
  Shield,
  X
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Occurrence } from "@/infrastructure/schema/schema-occurrence"
import { useTypeOccurrences } from "@/infrastructure/hooks/useTypeOccurrences"

// Dados mock para seleções
const mockCompanies = [
  { id: '1', name: 'TechCorp Solutions' },
  { id: '2', name: 'InnovaTech' },
  { id: '3', name: 'DataFlow Systems' },
]

const mockEmployees = [
  { id: '1', name: 'João Silva' },
  { id: '2', name: 'Maria Santos' },
  { id: '3', name: 'Pedro Costa' },
]

const mockEquipments = [
  { id: '1', name: 'Equipamento A' },
  { id: '2', name: 'Equipamento B' },
  { id: '3', name: 'Equipamento C' },
]

const mockSites = [
  { id: '1', name: 'Site Central' },
  { id: '2', name: 'Site Norte' },
  { id: '3', name: 'Site Sul' },
]

interface OccurrenceDialogProps {
  occurrence: Occurrence
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function OccurrenceDialog({ occurrence, isOpen, onOpenChange }: OccurrenceDialogProps) {
  const { data: typeOccurrences } = useTypeOccurrences()
  
  const getCompanyName = (id: string) => mockCompanies.find(c => c.id === id)?.name || 'N/A'
  const getEmployeeName = (id: string) => mockEmployees.find(e => e.id === id)?.name || 'N/A'
  const getEquipmentName = (id: string) => mockEquipments.find(e => e.id === id)?.name || 'N/A'
  const getSiteName = (id: string) => mockSites.find(s => s.id === id)?.name || 'N/A'
  const getTypeOccurrenceName = (id: string) => typeOccurrences?.find(t => t.id === id)?.description || 'N/A'

  const getGravityColor = (gravity: string) => {
    switch (gravity) {
      case 'Alta':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Média':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Baixa':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Em Andamento':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Fechado':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 rounded-xl">
                <AlertTriangle className="size-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Ocorrência #{occurrence.cod}
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Detalhes completos da ocorrência
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
                  <FileText className="size-5 text-blue-600" />
                  Informações Básicas
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Código:</span>
                    <span className="font-semibold text-gray-900">{occurrence.cod}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Tipo:</span>
                    <span className="font-medium text-gray-900">{getTypeOccurrenceName(occurrence.typeOccurrenceId)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Horário:</span>
                    <Badge variant="outline" className="border-blue-200 text-blue-800">
                      {occurrence.time}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Status e Gravidade */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="size-5 text-blue-600" />
                  Status e Gravidade
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Status:</span>
                    <Badge className={getStatusColor(occurrence.status)}>
                      {occurrence.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Gravidade:</span>
                    <Badge className={getGravityColor(occurrence.gravity)}>
                      {occurrence.gravity}
                    </Badge>
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
                    <span className="text-gray-600 font-medium">Empresa:</span>
                    <span className="font-medium text-gray-900">{getCompanyName(occurrence.companyId)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Funcionário:</span>
                    <span className="font-medium text-gray-900">{getEmployeeName(occurrence.employeeId)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Equipamento:</span>
                    <span className="font-medium text-gray-900">{getEquipmentName(occurrence.equipmentId)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Site:</span>
                    <span className="font-medium text-gray-900">{getSiteName(occurrence.siteId)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações e Histórico */}
            <div className="space-y-6">
              {/* Ação Corretiva */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Wrench className="size-5 text-blue-600" />
                  Ação Corretiva
                </h3>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {occurrence.correctiveAction || 'Nenhuma ação corretiva definida'}
                  </p>
                </div>
              </div>

              {/* Histórico */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="size-5 text-blue-600" />
                  Histórico
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Criado em:</span>
                    <span className="text-sm text-gray-500">
                      {new Date(occurrence.createdAt || '').toLocaleDateString('pt-BR', {
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
                      {new Date(occurrence.updatedAt || '').toLocaleDateString('pt-BR', {
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

              {/* Indicadores Visuais */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="size-5 text-blue-600" />
                  Indicadores
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-gray-600 font-medium">Prioridade</span>
                    <div className={`w-3 h-3 rounded-full ${
                      occurrence.gravity === 'Alta' 
                        ? 'bg-red-500' 
                        : occurrence.gravity === 'Média'
                        ? 'bg-orange-500'
                        : 'bg-yellow-500'
                    }`} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-gray-600 font-medium">Status Ativo</span>
                    <div className={`w-3 h-3 rounded-full ${
                      occurrence.status === 'Aberto' 
                        ? 'bg-red-500' 
                        : occurrence.status === 'Em Andamento'
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-gray-600 font-medium">Ação Definida</span>
                    <div className={`w-3 h-3 rounded-full ${
                      occurrence.correctiveAction 
                        ? 'bg-green-500' 
                        : 'bg-gray-400'
                    }`} />
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



