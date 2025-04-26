import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, parseISO } from 'date-fns';

export default function AvailableShiftsDialog({ isOpen, onClose, shifts = [] }) {
  if (!isOpen || shifts.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Other Available Shifts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {shifts.map(shift => (
            <Card key={shift.id} className="p-3">
              <CardHeader className="p-0 mb-1">
                <CardTitle className="text-base">{shift.title}</CardTitle>
                <CardDescription className="text-xs">
                  {shift.startTime && shift.endTime ? 
                    `${format(parseISO(shift.startTime), 'EEE, MMM d, p')} - ${format(parseISO(shift.endTime), 'p')}`
                    : "Invalid date"}
                </CardDescription>
              </CardHeader>
              <p className="text-xs text-muted-foreground">{shift.location || 'Location not specified'}</p>
            </Card>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 