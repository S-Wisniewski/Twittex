import { cva, type VariantProps } from "class-variance-authority";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  url: string;
  name: string;
};

const avatarVariants = cva("", {
  variants: {
    size: {
      small: "size-10",
      medium: "size-20",
      large: "size-36",
    },
  },
  defaultVariants: {
    size: "small",
  },
});

const UserAvatar = ({
  url,
  name,
  size = "small",
}: UserAvatarProps & VariantProps<typeof avatarVariants>) => {
  return (
    <Avatar className={cn(avatarVariants({ size }))}>
      <AvatarImage src={url} alt={name} className={'bg-white'}/>
      <AvatarFallback>
        <User />
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
