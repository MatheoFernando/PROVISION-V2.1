"use client"

import React from 'react'
import { User } from '@/infrastructure/types/domain'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Mail, Bell } from 'lucide-react'
import { toast } from 'sonner'

interface SendNotificationDrawerProps {
    user: User | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SendNotificationDrawer({
    user,
    open,
    onOpenChange,
}: SendNotificationDrawerProps) {
    const [subject, setSubject] = React.useState('')
    const [message, setMessage] = React.useState('')
    const [sendEmail, setSendEmail] = React.useState(true)
    const [sendNotification, setSendNotification] = React.useState(true)
    const [isLoading, setIsLoading] = React.useState(false)

    React.useEffect(() => {
        if (!open) {
            setSubject('')
            setMessage('')
            setSendEmail(true)
            setSendNotification(true)
        }
    }, [open])

    const handleSend = async () => {
        if (!subject.trim() || !message.trim()) {
            toast.error('Por favor, preencha todos os campos')
            return
        }

        if (!sendEmail && !sendNotification) {
            toast.error('Selecione pelo menos um método de envio')
            return
        }

        setIsLoading(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            toast.success('Notificação enviada com sucesso')
            onOpenChange(false)
        } catch (error) {
            toast.error('Erro ao enviar notificação')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="right">
            <DrawerContent className="flex flex-col h-full">
                <DrawerHeader className="border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <DrawerTitle className="text-xl font-bold">
                                Enviar Mensagem
                            </DrawerTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                Para: {user?.employee?.fullName || user?.phone}
                            </p>
                        </div>
                        <DrawerClose className="hover:bg-gray-100 rounded-full p-2 transition-colors">
                            <X className="h-5 w-5" />
                        </DrawerClose>
                    </div>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  
                    <div>
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Assunto
                        </Label>
                        <Input
                            placeholder="Digite o assunto..."
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="h-10 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Mensagem
                        </Label>
                        <Textarea
                            placeholder="Digite sua mensagem..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={7}
                            className="resize-none border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            {message.length} caracteres
                        </p>
                    </div>

                   
                    <div>
                        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                            Enviar via
                        </Label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                                <Checkbox
                                    checked={sendEmail}
                                    onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                                />
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                    E-mail
                                </span>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                                <Checkbox
                                    checked={sendNotification}
                                    onCheckedChange={(checked) =>
                                        setSendNotification(checked as boolean)
                                    }
                                />
                                <Bell className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                    Notificação
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

               
                <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-2">
                    <Button
                        onClick={handleSend}
                        disabled={isLoading}
                        className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Enviando...' : 'Enviar'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="w-full h-10 border-gray-300 text-gray-700 hover:bg-gray-100 font-medium rounded-lg transition-colors"
                    >
                        Cancelar
                    </Button>
                </div>
            </DrawerContent>
        </Drawer>
    )
}