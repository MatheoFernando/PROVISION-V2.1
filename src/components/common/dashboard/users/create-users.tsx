"use client"

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Loader2, Plus, Eye, EyeOff } from 'lucide-react'
import { z } from 'zod'
import { useUsers } from '@/infrastructure/hooks/useUsers'
import type { User } from '@/types/domain'

interface CreateUserDialogProps {
  children?: React.ReactNode
  user?: User | null
  isEdit?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const createFormSchema = z.object({
  phone: z.string().min(9, 'Telefone é obrigatório').regex(/^\d+$/, 'Telefone deve conter apenas números'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  isGlobalAdmin: z.boolean(),
  status: z.boolean(),
})

const editFormSchema = z.object({
  phone: z.string().min(9, 'Telefone é obrigatório').regex(/^\d+$/, 'Telefone deve conter apenas números'),
  password: z.string().optional(),
  isGlobalAdmin: z.boolean(),
  status: z.boolean(),
})

type CreateFormData = z.infer<typeof createFormSchema>
type EditFormData = z.infer<typeof editFormSchema>
type FormData = CreateFormData | EditFormData

function CreateUserDialog({ children, user, isEdit = false, open: controlledOpen, onOpenChange }: CreateUserDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  
  const { createUser, updateUser, isCreating, isUpdating } = useUsers()

  const form = useForm<FormData>({
    resolver: zodResolver(isEdit ? editFormSchema : createFormSchema),
    defaultValues: {
      phone: user?.phone || '',
      password: '',
      isGlobalAdmin: user?.isGlobalAdmin || false,
      status: user?.status ?? true,
    },
  })

  React.useEffect(() => {
    if (user && isEdit) {
      form.reset({
        phone: user.phone,
        password: '',
        isGlobalAdmin: user.isGlobalAdmin,
        status: user.status,
      })
    }
  }, [user, isEdit, form])

  const onSubmit = async (data: FormData) => {
    try {
      if (isEdit && user) {
        // Se a senha estiver vazia na edição, remove do payload
        const updateData: any = { ...data }
        if (!updateData.password || updateData.password.trim() === '') {
          delete updateData.password
        }
        await updateUser({ ...updateData, id: user.id })
      } else {
        await createUser(data as CreateFormData)
      }
      form.reset()
      setOpen(false)
    } catch (error) {
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {(!isEdit) && (
        <DialogTrigger asChild>
          {children || (
            <Button className="h-9 cursor-pointer bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Novo Utilizador
            </Button>
            )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {isEdit ? 'Editar Utilizador' : 'Novo Utilizador'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Telefone <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Telefone" 
                        className="h-9" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Senha {!isEdit && <span className="text-red-500">*</span>}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder={isEdit ? "Deixe vazio para manter a senha atual" : "Senha"} 
                          disabled={isEdit}
                          className="h-9 pr-10" 
                          {...field} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Estado
                      </FormLabel>
                      <div className="text-xs text-muted-foreground">
                        {field.value ? 'Activo' : 'Inactivo'}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        className="cursor-pointer"
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
            <FormField
              control={form.control}
              name="isGlobalAdmin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium text-foreground">
                      Administrador Global
                    </FormLabel>
                    <div className="text-xs text-muted-foreground">
                      Pode gerir todas as empresas
                    </div>
                  </div>
                  <FormControl>
                      <Switch
                        checked={field.value}
                        className="text-foreground bg-foreground cursor-pointer"
                        onCheckedChange={field.onChange}
                      />
                  </FormControl>
                </FormItem>
              )}
            />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="h-9 px-6 text-foreground cursor-pointer"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="px-6 bg-blue-600 hover:bg-blue-700 cursor-pointer text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A guardar...
                  </>
                ) : (
                  isEdit ? 'Atualizar Utilizador' : 'Criar Utilizador'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateUserDialog