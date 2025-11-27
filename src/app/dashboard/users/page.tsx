"use client";

import React from "react";
import ListUsers from "@/components/common/dashboard/users/users-table";

function User() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Utilizadores</h1>
      <ListUsers />
    </div>
  );
}

export default User;
