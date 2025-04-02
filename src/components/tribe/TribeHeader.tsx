import React from 'react'
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from 'lucide-react';

const TribeHeader = ({ handleManualRefresh, isRefreshing }) => (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Your Tribe</h1>
        <p className="text-muted-foreground mt-1">Support your tribe members and share your journey</p>
      </div>
      <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={isRefreshing}>
        {isRefreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
        {isRefreshing ? "Loading..." : "Refresh"}
      </Button>
    </div>
  );
  
export default TribeHeader