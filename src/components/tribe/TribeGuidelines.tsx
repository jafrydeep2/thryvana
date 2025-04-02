import React from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from 'lucide-react';

const TribeGuidelines = () => (
    <Alert className="glass">
      <Info className="h-4 w-4" />
      <AlertTitle>Tribe Guidelines</AlertTitle>
      <AlertDescription>
        This is an anonymous accountability group. You can see others' progress and react to their check-ins, but direct messaging is not available. Focus on your consistency!
      </AlertDescription>
    </Alert>
  );
  

export default TribeGuidelines