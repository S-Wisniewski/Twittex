import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthGate } from "@/hooks/useAuthGate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Item,
  ItemActions,
  ItemDescription,
  ItemHeader,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import type { User } from "@/types/User";
import { usersApi } from "@/api/users";
import { SearchIcon } from "lucide-react";

type SearchModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SearchModal = ({ open, onOpenChange }: SearchModalProps) => {
  const navigate = useNavigate();
  const gate = useAuthGate();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      const results = await usersApi.search(val).catch(() => []);
      setUsers(results);
    } else {
      setUsers([]);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setQuery("");
    setUsers([]);
  };

  const handleNavigate = (userId: string) => {
    navigate(`/${userId}`);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent showCloseButton={false} className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={handleChange}
            placeholder="Search users…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setUsers([]); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {users.length > 0 ? (
            <ul className="divide-y">
              {users.map((user, i) => (
                <li key={user.id + i}>
                  <Item
                    variant="default"
                    className="rounded-none cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleNavigate(user.userName)}
                  >
                    <div className="flex gap-3 items-center flex-1 min-w-0">
                      <UserAvatar url={user.userAvatarUrl} name={user.userName} />
                      <div className="flex flex-col min-w-0">
                        <ItemHeader className="text-sm font-medium">{user.userName}</ItemHeader>
                        <ItemDescription>@{user.userName}</ItemDescription>
                      </div>
                    </div>
                    <ItemActions>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          gate(() => usersApi.follow(user.id));
                        }}
                      >
                        Follow
                      </Button>
                    </ItemActions>
                  </Item>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              {query ? "No users found" : "Start typing to search"}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
