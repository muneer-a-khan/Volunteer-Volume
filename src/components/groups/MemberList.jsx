import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, UserCheck, UserX, Crown, Mail } from 'lucide-react';

export default function MemberList({ 
  members = [], 
  isAdmin = false, 
  groupId, 
  onPromoteMember, 
  onDemoteMember, 
  onRemoveMember 
}) {
  if (!members || members.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground italic">
        No members in this group yet.
      </div>
    );
  }

  return (
    <div className="border-t">
      <ul className="divide-y divide-border">
        {members.map((member) => {
          if (!member || !member.users) {
            console.warn('Skipping rendering member due to missing data:', member);
            return null;
          }
          
          return (
            <li key={member.id} className="px-4 py-3 flex items-center justify-between hover:bg-muted/50">
              <div className="flex items-center">
                <Avatar className="mr-3 h-8 w-8">
                  <AvatarImage src={member.users.image || ''} alt={member.users.name || 'User'} />
                  <AvatarFallback className="text-xs">
                    {member.users.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium flex items-center">
                    {member.users.name || 'Unknown User'}
                    {member.role === 'ADMIN' && (
                      <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0.5">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{member.users.email || 'No email'}</div>
                </div>
              </div>
              
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Member Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => window.location.href = `mailto:${member.users.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      <span>Email {member.users.name}</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {member.role !== 'ADMIN' ? (
                      <DropdownMenuItem onClick={() => onPromoteMember(member.users.id)}>
                        <Crown className="mr-2 h-4 w-4" />
                        <span>Promote to Admin</span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onDemoteMember(member.users.id)}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        <span>Demote to Member</span>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive" 
                      onClick={() => onRemoveMember(member.users.id)}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      <span>Remove from Group</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
} 