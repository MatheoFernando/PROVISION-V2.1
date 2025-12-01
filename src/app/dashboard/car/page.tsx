import { CarsTable } from '@/components/common/dashboard/cars/cars-table'
import React from 'react'

function page() {
  return (
    <div className='space-y-6'>
      <h1 className="text-2xl font-semibold text-foreground">Veículos</h1>
      <CarsTable />
    </div>
  )
}

export default page
