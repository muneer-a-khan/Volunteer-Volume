import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react'; // Import Users icon

export default function GroupList({ groups }) {
  if (!groups || groups.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No groups found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => (
        <Link key={group.id} href={`/groups/${group.id}`} passHref>
          <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-md cursor-pointer"> 
            <CardHeader className="p-4 flex-row items-center gap-4"> {/* Use flex-row */} 
              {group.logoUrl ? (
                <Image 
                  src={group.logoUrl} 
                  alt={`${group.name} logo`} 
                  width={48} 
                  height={48} 
                  className="rounded-md object-cover aspect-square" 
                />
              ) : (
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center text-primary font-semibold text-xl">
                   {group.name?.charAt(0).toUpperCase() || 'G'}
                </div>
              )}
              <div className="flex-1"> {/* Allow title to take space */} 
                <CardTitle className="text-lg leading-tight line-clamp-1">{group.name}</CardTitle>
                 {/* Display Member Count */}
                 <div className="text-xs text-muted-foreground mt-1 flex items-center"> 
                     <Users className="h-3 w-3 mr-1" />
                     {group.memberCount ?? '0'} members
                 </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow"> {/* Add flex-grow */} 
              <CardDescription className="text-sm line-clamp-3">
                {group.description || 'No description available.'}
              </CardDescription>
            </CardContent>
            {/* Optional Footer if needed
            <CardFooter className="p-4 pt-0">
               <Badge variant="outline">Category</Badge>
            </CardFooter> 
            */}
          </Card>
        </Link>
      ))}
    </div>
  );
} 