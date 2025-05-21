import React from 'react'
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const TribeMemberCard = ({ member }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={member?.avatar} />
                        <AvatarFallback>{member?.name?.substring(0, 2)?.toUpperCase() || 'NA'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{member.name || 'Unknown User'}</div>
                        <div className="text-sm text-muted-foreground">Working on a goal</div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <Badge variant="outline" className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1 text-amber-500" />
                        {member.checkInCount} check-ins
                    </Badge>
                    <span className="text-xs text-muted-foreground mt-1">Active {member.lastActive}</span>
                </div>
            </CardContent>
        </Card>
    </motion.div>
);

export default TribeMemberCard