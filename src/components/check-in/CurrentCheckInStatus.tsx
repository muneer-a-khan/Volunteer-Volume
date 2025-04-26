'use client';

import React from 'react';
import { formatDistance } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface CurrentCheckInStatusProps {
  checkInData: any | null;
}

export default function CurrentCheckInStatus({ checkInData }: CurrentCheckInStatusProps) {
  if (!checkInData) {
    return (
      <div className="p-4 bg-gray-50 rounded-md">
        <p className="text-gray-500">You are not currently checked in to any shift.</p>
      </div>
    );
  }

  const checkedInAt = new Date(checkInData.checkedInAt || checkInData.checked_in_at);
  const shiftTitle = checkInData.shift?.title || checkInData.shift?.name || 'Unknown Shift';
  const timeElapsed = formatDistance(new Date(), checkedInAt, { addSuffix: true });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Checked In
            </Badge>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Shift</span>
            <span className="font-medium">{shiftTitle}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Checked In</span>
            <span className="font-medium">{checkedInAt.toLocaleString()}</span>
            <span className="text-xs text-gray-500">{timeElapsed}</span>
          </div>
          
          {checkInData.location && (
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Location</span>
              <span className="font-medium">{checkInData.location}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 