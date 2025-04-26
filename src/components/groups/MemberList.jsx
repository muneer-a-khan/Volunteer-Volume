import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, UserCheck, UserX, Crown, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MemberList({ members = [], isAdmin = false, groupId }) {
  const { user } = useAuth();
  
  const handlePromoteMember = (memberId) => {
    // This would call an API in a real implementation
    toast.success('Member promoted to admin');
  };
  
  const handleRemoveMember = (memberId) => {
    // This would call an API in a real implementation
    toast.success('Member removed from group');
  };
  
  const handleDemoteMember = (memberId) => {
    // This would call an API in a real implementation
    toast.success('Admin demoted to member');
  };
  
  if (!members || members.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No members in this group yet.
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-md overflow-hidden">
      <div className="p-4 border-b bg-muted/50">
        <h3 className="text-lg font-medium">Members ({members.length})</h3>
      </div>
      <ul className="divide-y divide-border">
        {members.map((member) => (
          <li key={member.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="mr-3">
                <AvatarImage src={member.user.image || ''} alt={member.user.name} />
                <AvatarFallback>
                  {member.user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium flex items-center">
                  {member.user.name || 'Unknown User'}
                  {member.role === 'ADMIN' && (
                    <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                      Admin
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{member.user.email}</div>
              </div>
            </div>
            
            {isAdmin && user?.id !== member.user.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => window.location.href = `mailto:${member.user.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </DropdownMenuItem>
                  
                  {member.role !== 'ADMIN' ? (
                    <DropdownMenuItem onClick={() => handlePromoteMember(member.id)}>
                      <Crown className="mr-2 h-4 w-4" />
                      Promote to Admin
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => handleDemoteMember(member.id)}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Demote to Member
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive" 
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Remove from Group
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
} 