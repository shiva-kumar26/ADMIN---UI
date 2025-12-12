import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { LucideIcon, ChevronDown, Activity, Layers, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface DetailItem {
    label: string;
    value: string | number;
    subItems?: { label: string; value: string | number; color?: string }[];
}

interface InteractiveMetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    trend?: string;
    description?: string;
    details: DetailItem[];
    children?: React.ReactNode;
}

const InteractiveMetricCard: React.FC<InteractiveMetricCardProps> = ({
    title,
    value,
    icon: Icon,
    color,
    trend,
    description,
    details,
    children
}) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || (
                    <Card className="relative overflow-hidden border-0 shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 group ring-offset-background hover:ring-2 hover:ring-ring hover:ring-offset-2">
                        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-90`} />
                        <CardContent className="relative p-6 text-white h-full flex flex-col justify-between">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-white/80 text-sm font-medium">{title}</p>
                                    <p className="text-4xl font-bold tracking-tight">{value}</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md shadow-sm">
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>

                            <div className="mt-4 flex items-end justify-between">
                                <div className="space-y-1">
                                    {trend && (
                                        <div className="flex items-center text-xs font-medium text-white/90 bg-white/10 px-2 py-1 rounded-full w-fit">
                                            {trend}
                                        </div>
                                    )}
                                    <p className="text-white/70 text-xs truncate max-w-[150px]">{description}</p>
                                </div>
                                <div className="flex items-center gap-1 text-white/60 text-xs bg-black/10 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all">
                                    <span>View Details</span>
                                    <ChevronDown className="w-3 h-3" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] border-none shadow-2xl bg-white/95 backdrop-blur-xl dark:bg-zinc-950/95">
                <DialogHeader className="pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${color} text-white shadow-md`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">{title} Breakdown</DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">Detailed metrics and distribution</p>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="h-[60vh] pr-4 -mr-4">
                    {details.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="p-4 rounded-full bg-muted mb-3">
                                <Activity className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-lg font-medium text-foreground">No Data Available</p>
                            <p className="text-sm text-muted-foreground">There are no detailed metrics to display for this category.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 py-4">
                            {details.map((item, index) => (
                                <div key={index} className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                                <h4 className="font-semibold text-lg">{item.label}</h4>
                                            </div>
                                            <Badge className="text-base px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">{item.value}</Badge>
                                        </div>

                                        {item.subItems && item.subItems.length > 0 && (
                                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                {item.subItems.map((sub, subIndex) => (
                                                    <div key={subIndex} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-colors">
                                                        <span className={`text-xs font-medium truncate mr-2 ${sub.color || 'text-muted-foreground'}`}>{sub.label}</span>
                                                        <span className="text-sm font-bold tabular-nums text-foreground/80">{sub.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {/* Decorative gradient bar */}
                                    <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${color} opacity-20 group-hover:opacity-40 transition-opacity`} />
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default InteractiveMetricCard;
