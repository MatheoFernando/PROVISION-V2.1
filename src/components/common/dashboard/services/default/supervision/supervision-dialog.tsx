"use client"

import * as React from "react"
import { 
  Building, 
  Users, 
  Clock, 
  MapPin, 
  Settings,
  User,
  Wrench,
  Building2,
  Calendar,
  FileText,
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
import type { Supervision } from "@/infrastructure/schema/schema-supervision"

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

const mockDepartments = [
  { id: '1', name: 'Produção' },
  { id: '2', name: 'Qualidade' },
  { id: '3', name: 'Manutenção' },
]

interface SupervisionDialogProps {
  supervision: Supervision
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function SupervisionDialog({ 
  supervision, 
  isOpen, 
  onOpenChange 
}: SupervisionDialogProps) {
  if (!supervision) return null

  const getCompanyName = (id: string) => mockCompanies.find(c => c.id === id)?.name || 'N/A'
  const getEmployeeName = (id: string) => mockEmployees.find(e => e.id === id)?.name || 'N/A'
  const getEquipmentName = (id: string) => mockEquipments.find(e => e.id === id)?.name || 'N/A'
  const getSiteName = (id: string) => mockSites.find(s => s.id === id)?.name || 'N/A'
  const getDepartmentName = (id: string) => mockDepartments.find(d => d.id === id)?.name || 'N/A'

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Settings className="size-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Supervisão #{supervision.cod}
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Detalhes completos da supervisão
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
                    <span className="font-semibold text-gray-900">{supervision.cod}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Status:</span>
                    <Badge 
                      variant={supervision.status === 'Ativo' ? 'default' : 'destructive'}
                      className={supervision.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                    >
                      {supervision.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Horário:</span>
                    <Badge variant="outline" className="border-blue-200 text-blue-800">
                      {supervision.time}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="size-5 text-blue-600" />
                  Observações
                </h3>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {supervision.observation || 'Nenhuma observação adicionada'}
                  </p>
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
                    <span className="font-medium text-gray-900">{getCompanyName(supervision.companyId)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Funcionário:</span>
                    <span className="font-medium text-gray-900">{getEmployeeName(supervision.employeeId)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Equipamento:</span>
                    <span className="font-medium text-gray-900">{getEquipmentName(supervision.equipmentId)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Site:</span>
                    <span className="font-medium text-gray-900">{getSiteName(supervision.siteId)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Departamento:</span>
                    <span className="font-medium text-gray-900">{getDepartmentName(supervision.departmentId)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pessoal e Datas */}
            <div className="space-y-6">
              {/* Pessoal */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="size-5 text-blue-600" />
                  Pessoal
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Desejado:</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {supervision.desiredNumberWorkers} pessoas
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Presente:</span>
                    <Badge 
                      variant="secondary" 
                      className={
                        supervision.numberWorkerPresent >= supervision.desiredNumberWorkers 
                          ? "bg-green-100 text-green-800" 
                          : "bg-orange-100 text-orange-800"
                      }
                    >
                      {supervision.numberWorkerPresent} pessoas
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Diferença:</span>
                    <Badge 
                      variant="outline"
                      className={
                        supervision.numberWorkerPresent >= supervision.desiredNumberWorkers 
                          ? "border-green-200 text-green-800" 
                          : "border-orange-200 text-orange-800"
                      }
                    >
                      {supervision.numberWorkerPresent - supervision.desiredNumberWorkers >= 0 ? '+' : ''}
                      {supervision.numberWorkerPresent - supervision.desiredNumberWorkers}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Histórico */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="size-5 text-blue-600" />
                  Histórico
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Criado em:</span>
                    <span className="text-sm text-gray-500">
                      {new Date(supervision.createdAt || '').toLocaleDateString('pt-BR', {
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
                      {new Date(supervision.updatedAt || '').toLocaleDateString('pt-BR', {
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

              {/* Status Visual */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Wrench className="size-5 text-blue-600" />
                  Status da Supervisão
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-gray-600 font-medium">Pessoal Adequado</span>
                    <div className={`w-3 h-3 rounded-full ${
                      supervision.numberWorkerPresent >= supervision.desiredNumberWorkers 
                        ? 'bg-green-500' 
                        : 'bg-orange-500'
                    }`} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-gray-600 font-medium">Status Ativo</span>
                    <div className={`w-3 h-3 rounded-full ${
                      supervision.status === 'Ativo' 
                        ? 'bg-green-500' 
                        : 'bg-red-500'
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



