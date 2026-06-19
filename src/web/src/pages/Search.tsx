import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemDescription,
  ItemHeader,
} from "@/components/ui/item";
import UserAvatar from "@/components/UserAvatar";
import type { User } from "@/types/User";
import { usersApi } from "@/api/users";
import { useAuthGate } from "@/hooks/useAuthGate";
import { SearchIcon } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router";

const Search = () => {
  const navigate = useNavigate();
  const gate = useAuthGate();
  const [users, setUsers] = useState<User[]>([]);

  const handleSearch = async (
    event: ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    const searchValue = event.currentTarget.value;
    if (searchValue) {
      const results = await usersApi.search(searchValue).catch(() => []);
      setUsers(results);
    } else {
      setUsers([]);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <InputGroup>
        <InputGroupInput placeholder="Search" onChange={handleSearch} />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
      {users.length ? (
        <div className="flex flex-col gap-4">
          {users.map((user, index) => (
            <Item
              variant={"outline"}
              key={user.id + index}
              className="flex justify-between items-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate(`/${user.userName}`)}
            >
              <div className="flex gap-4 items-center">
                <UserAvatar url={user.userAvatarUrl} name={user.userName} />
                <div className="flex flex-col justify-between">
                  <ItemHeader>{user.userName}</ItemHeader>
                  <ItemDescription>@{user.userName}</ItemDescription>
                </div>
              </div>
              <ItemActions>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    gate(() => usersApi.follow(user.id));
                  }}
                >
                  Follow
                </Button>
              </ItemActions>
            </Item>
          ))}
        </div>
      ) : (
        <div className="h-full flex items-center justify-center">
          Search for users
        </div>
      )}
    </div>
  );
};

export default Search;
