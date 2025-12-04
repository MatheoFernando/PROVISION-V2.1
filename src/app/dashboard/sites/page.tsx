import { SitesTable } from '@/components/common/dashboard/sites/sites-table'
import React from 'react'

function page() {
  return (
    <div className='space-y-6'>
      <h1 className="text-2xl font-semibold text-foreground">Sites</h1>
      <SitesTable />
    </div>
  )
}

export default page
