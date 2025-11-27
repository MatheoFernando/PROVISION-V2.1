"use client"

import React from 'react'
import ListCompany from '@/components/common/dashboard/companies/list-company'

function Page() {
  return (
    <div className='space-y-6'>
      <h1 className="text-2xl font-semibold text-foreground">Empresas</h1>
      <ListCompany />
    </div>
   
  )
}

export default Page




